const eris = require('eris');

// Create a Client instance with our bot token.
const bot = new eris.Client('MTA2NDcyNDcxMzA4OTI2OTgxMA.G9_RoK.sJ4uwzPMOTqx2zk6--rrsvP4L-Rmkd8f2550V8');

// When the bot is connected and ready, log to console.
bot.on('ready', () => {
   console.log('Connected and ready.');
});

// Every time a message is sent anywhere the bot is present,
// this event will fire and we will check if the bot was mentioned.
// If it was, the bot will attempt to respond with "Present".
bot.on('messageCreate', async (msg) => {
   const botWasMentioned = msg.mentions.find(
       mentionedUser => mentionedUser.id === bot.user.id,
   );

   if (botWasMentioned) {
       try {
           await msg.channel.createMessage('People are amazing!');
       } catch (err) {
           // There are various reasons why sending a message may fail.
           // The API might time out or choke and return a 5xx status,
           // or the bot may not have permission to send the
           // message (403 status).
           console.warn('Failed to respond to mention.');
           console.warn(err);
       }
   }
});

bot.on('error', err => {
   console.warn(err);
});

bot.connect();