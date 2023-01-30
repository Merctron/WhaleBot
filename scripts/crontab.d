# This file is a sample crontab replica that sets up a daily SQLite backup to an s3 bucket
# named 'whale-bot'. If setting up whale-bot, use this crontab entry to backup your data and
# configure your s3 bucket for 7 day object expiry.
0 12 * * * aws s3 cp ~/.WhaleBot.db s3://whale-bot/$(uuidgen)