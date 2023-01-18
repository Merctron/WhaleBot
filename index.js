const eris = require('eris');

// Create a Client instance with our bot token.
const bot = new eris.Client(process.env.WHALE_BOT_TOKEN);

const HELP_CMD    = "help";
const INSPIRE_CMD = "inspire";

const INSPIRE_QUOTES = [
    "Do you ever get the feeling that people are incapable of not caring? People are amazing!",
    "This is the best thing I've ever read.",
    "Think about the truth of your argument.",
    "You don’t have to be angry at the whole world. You can just be mad at me.",
    "I need to know that I have done one thing right with my life!",
    "These assignments don’t matter, this course doesn’t matter, college doesn’t matter. These amazing, honest, things that you wrote, they matter!",
    "You’re the best thing I’ve ever done",
];

const ERR_MSG = `I could not understand you, but keep trying. Maybe type '@WhaleBot help'. You are amazing!`;


function processMessage(msg) {
    try {
        console.log(`Processing msg(${msg.content}) from author ${msg.author.username}`)
        const commandComponents = msg.content.split(" ");

        const [ _, command, ...args] = commandComponents;

        console.log(`Processing command: ${command}`);

        if (command === HELP_CMD) {
            return "Hi I'm Charlie. I'm a work in progress. You can talk to me like this:\n\n'@Whalebot inspire'\n'@WhaleBot help'";
        }

        if (command === INSPIRE_CMD) {
            return INSPIRE_QUOTES[Math.floor(Math.random() * INSPIRE_QUOTES.length)];
        }

        return ERR_MSG;
    } catch (err) {
        console.log(err);
        return ERR_MSG;
    }
}

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
            const resp = processMessage(msg);
            await msg.channel.createMessage(resp);
        } catch (err) {
            console.warn('Failed to respond to mention.');
            console.warn(err);
        }
    }
});

bot.on('error', err => {
    console.warn(err);
});

bot.connect();