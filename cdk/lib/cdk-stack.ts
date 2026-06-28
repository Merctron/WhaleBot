import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import { Construct } from 'constructs';

export class WhaleBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for SQLite DB backups with 7-day auto-expiry
    const backupBucket = new s3.Bucket(this, 'WhaleBotBackupBucket', {
      bucketName: `whalebot-db-backups-${this.account}`,
      lifecycleRules: [{ expiration: cdk.Duration.days(7) }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // IAM role for the EC2 instance
    const instanceRole = new iam.Role(this, 'WhaleBotInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
      inlinePolicies: {
        CodeDeployS3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['s3:GetObject', 's3:GetObjectVersion', 's3:ListBucket'],
              // CodeDeploy agent needs access to the regional CodeDeploy S3 bucket
              resources: [
                'arn:aws:s3:::aws-codedeploy-us-east-1/*',
                'arn:aws:s3:::aws-codedeploy-us-east-1',
              ],
            }),
          ],
        }),
      },
    });

    backupBucket.grantReadWrite(instanceRole);

    // Minimal VPC: one public subnet, no NAT gateway (bot only needs outbound)
    const vpc = new ec2.Vpc(this, 'WhaleBotVpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [{
        cidrMask: 24,
        name: 'Public',
        subnetType: ec2.SubnetType.PUBLIC,
      }],
    });

    const sg = new ec2.SecurityGroup(this, 'WhaleBotSG', {
      vpc,
      description: 'WhaleBot EC2 security group',
      allowAllOutbound: true,
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH access');

    // UserData: one-time bootstrap (NVM, Node 20, CodeDeploy agent)
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      // Install dependencies
      'yum install -y ruby wget git cronie',
      'systemctl start crond',
      'systemctl enable crond',

      // Install CodeDeploy agent
      'cd /tmp',
      'wget https://aws-codedeploy-us-east-1.s3.amazonaws.com/latest/install',
      'chmod +x ./install',
      './install auto',
      'systemctl start codedeploy-agent',
      'systemctl enable codedeploy-agent',

      // Install NVM + Node 20 for ec2-user
      'su - ec2-user -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"',
      'su - ec2-user -c "source ~/.nvm/nvm.sh && nvm install 20 && nvm use 20 && nvm alias default 20"',

      // Create credentials directory (token must be filled in manually after first deploy)
      'mkdir -p /home/ec2-user/credentials',
      'chown ec2-user:ec2-user /home/ec2-user/credentials',
      'echo "# Add: export WHALE_BOT_TOKEN=your_token_here" > /home/ec2-user/credentials/WhaleBot.sh',
      'chown ec2-user:ec2-user /home/ec2-user/credentials/WhaleBot.sh',

      // Set up daily DB backup cron for ec2-user — single quotes around the cron line prevent
      // $(uuidgen) from being evaluated at UserData time; it evaluates at cron runtime instead
      `(crontab -u ec2-user -l 2>/dev/null; echo '0 12 * * * aws s3 cp ~/.WhaleBot.db s3://${backupBucket.bucketName}/$(uuidgen).db') | crontab -u ec2-user -`,
    );

    // Key pair — private key stored automatically in Secrets Manager by CDK
    const keyPair = new ec2.KeyPair(this, 'WhaleBotKeyPair', {
      keyPairName: 'whalebot-keypair',
    });

    // EC2 instance
    const instance = new ec2.Instance(this, 'WhaleBotInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      role: instanceRole,
      securityGroup: sg,
      userData,
      keyPair,
    });

    // Pin the logical ID so CDK never replaces the instance due to stack changes
    (instance.node.defaultChild as cdk.CfnResource).overrideLogicalId('WhaleBotInstance');

    cdk.Tags.of(instance).add('Name', 'WhaleBot');

    // CodeDeploy application + deployment group targeting the instance by tag
    const application = new codedeploy.ServerApplication(this, 'WhaleBotApp', {
      applicationName: 'WhaleBot',
    });

    new codedeploy.ServerDeploymentGroup(this, 'WhaleBotDeploymentGroup', {
      application,
      deploymentGroupName: 'WhaleBotDeploymentGroup',
      installAgent: false, // already installed via UserData
      ec2InstanceTags: new codedeploy.InstanceTagSet({ Name: ['WhaleBot'] }),
      deploymentConfig: codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME,
    });

    // Outputs
    new cdk.CfnOutput(this, 'InstancePublicIp', {
      value: instance.instancePublicIp,
      description: 'SSH target: ec2-user@<this-ip>',
    });
    new cdk.CfnOutput(this, 'SshKeyParameterName', {
      value: keyPair.privateKey.parameterName,
      description: 'Fetch private key: aws ssm get-parameter --name <this-value> --with-decryption --query Parameter.Value --output text > whalebot.pem',
    });
    new cdk.CfnOutput(this, 'BackupBucketName', {
      value: backupBucket.bucketName,
    });
  }
}
