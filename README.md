# WhaleBot

WhaleBot is a Discord bot that provides inspirational quotes and helps you track weight. It was inspired by the character Charlie from the movie 'The Whale'.

## Usage

WhaleBot supports the following commands:

```
@Whalebot inspire
@Whalebot help
```

## Planned Features

WhaleBot will support the following features in the future:
* Weight tracking and statistics
* Conversational ability using a combination of techniques like sentiment-analysis and large language models.


## Bot Architecture

The bot runs on a single micro EC2 instance and makes use of GitHub actions and AWS CodeDeploy to deploy any changes into the `mainline` branch.

Since the bot is light-weight and serves one personal server, [`pm2`](https://pm2.keymetrics.io/) is used for process management with no load-balancing set up.

## Contributing

Send a PR! If you are someone who wants to expand WhaleBot to serve your server, you can fork this repo and deploy your own bot, or reach out to discuss adding multi-server support to the canonical WhaleBot. 
