# WhaleBot CDK Infrastructure

Provisions all AWS infrastructure for WhaleBot using CDK (TypeScript).

## What this creates

- VPC with a single public subnet (no NAT gateway)
- EC2 `t3.micro` running Amazon Linux 2023, bootstrapped with Node 20 and the CodeDeploy agent
- IAM instance role with SSM and CodeDeploy S3 access
- SSH key pair (private key stored in SSM Parameter Store)
- S3 bucket for SQLite DB backups with 7-day expiry
- CodeDeploy application and deployment group

## First-time setup

### 1. Bootstrap CDK

```bash
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

### 2. Deploy the stack

From the project root:

```bash
npm run cdk:deploy
```

Note the outputs — you'll need `InstancePublicIp` and `SshKeyParameterName`.

### 3. Fetch the SSH key and connect

```bash
aws ssm get-parameter \
  --name <SshKeyParameterName> \
  --with-decryption \
  --query Parameter.Value \
  --output text > whalebot.pem

chmod 400 whalebot.pem
ssh -i whalebot.pem ec2-user@<InstancePublicIp>
```

### 4. Set the Discord bot token (one-time, on the instance)

```bash
echo 'export WHALE_BOT_TOKEN="your_token_here"' > ~/credentials/WhaleBot.sh
```

### 5. Set up GitHub Actions secrets

In the repo: **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user key (needs CodeDeploy, CloudFormation, EC2, S3, IAM, SSM access) |
| `AWS_SECRET_ACCESS_KEY` | Corresponding secret |

### 6. Authorize CodeDeploy to access GitHub (one-time)

In the AWS Console: **CodeDeploy → Applications → WhaleBot → WhaleBotDeploymentGroup → Create deployment**, select "My application is stored in GitHub", and complete the OAuth flow. You can cancel the deployment itself after authorizing.

## Ongoing deployments

Pushing to `main` triggers the GitHub Actions pipeline which runs `cdk deploy` (infrastructure) then creates a CodeDeploy deployment (application code).

## Useful commands

Run these from the project root:

| Command | Description |
|---|---|
| `npm run cdk:deploy` | Deploy / update the stack |
| `npm run cdk:diff` | Compare local stack with deployed state |
| `npm run cdk:synth` | Emit the CloudFormation template |
| `npm run cdk:ls` | List stacks |
