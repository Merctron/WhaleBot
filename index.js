import * as  eris from "eris";
import { program } from "commander";
import * as REPL from "repl";
import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();

const HELP_CMD    = "help";
const INSPIRE_CMD = "inspire";
const DEPRESS_CMD = "depress";
const RECORD_WEIGHT_CMD = "recordWeight";
const STATS_CMD = "stats";

const INSPIRE_QUOTES = [
    "Do you ever get the feeling that people are incapable of not caring? People are amazing!",
    "This is the best thing I've ever read.",
    "Think about the truth of your argument.",
    "You don’t have to be angry at the whole world. You can just be mad at me.",
    "I need to know that I have done one thing right with my life!",
    "These assignments don’t matter, this course doesn’t matter, college doesn’t matter. These amazing, honest, things that you wrote, they matter!",
    "You’re the best thing I’ve ever done.",
];

const DEPRESS_QUOTES = [
    "I am grotesque. Say it!",
    "Who would ever want me to be part of their life?",
    "I'm sorry Liz.",
];

const ERR_MSG = `I could not understand you, but keep trying. Maybe type '@WhaleBot help'. You are amazing!`;

function initDb() {
    const db = new sqlite.Database(`${process.env.HOME}/.WhaleBot.db`);
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS userweights (dateanduser TEXT PRIMARY KEY, date TEXT, username TEXT, weight REAL)");
        db.close();
    });
}

function recordWeight(username, weight) {
    const db = new sqlite.Database(`${process.env.HOME}/.WhaleBot.db`);
    db.serialize(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
        const d = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
        const dateStr = `${y}${m}${d}`;
        const primaryKey = `${dateStr}-${username}`;

        const query = `INSERT OR REPLACE INTO userweights(dateanduser, date, username, weight) VALUES(?, ?, ?, ?)`;
        const stmt = db.prepare(query);

        stmt.run(primaryKey, dateStr, username, Number.parseFloat(weight));
        stmt.finalize();
        db.close()
    });
}

async function weightStats(username) {
    return new Promise((res) => {
        const db = new sqlite.Database(`${process.env.HOME}/.WhaleBot.db`);
        db.serialize(() => {
            const query = `SELECT * FROM userweights WHERE username LIKE '${username}' ORDER BY date DESC LIMIT 7`;

            let result = "You last 7 weights are: ";
            db.all(query, (err, rows) => {
                res(`Last 7 weights: ${rows.map((row) => row.weight)}`);
                db.close();
            });
        });
    });
}

async function processMessage(msg) {
    try {
        console.log(`Processing msg(${msg.content}) from author ${msg.author.username}`)
        const commandComponents = msg.content.split(" ");

        const [ _, command, ...args] = commandComponents;

        console.log(`Processing command: ${command}`);

        if (command === HELP_CMD) {
            return "Hi I'm Charlie. I'm a work in progress. You can talk to me like this:\n\n'@Whalebot recordWeight <WEIGHT>'\n'@Whalebot stats'\n'@Whalebot inspire'\n'@WhaleBot help'";
        }

        if (command === INSPIRE_CMD) {
            return INSPIRE_QUOTES[Math.floor(Math.random() * INSPIRE_QUOTES.length)];
        }

        if (command === DEPRESS_CMD) {
            return DEPRESS_QUOTES[Math.floor(Math.random() * DEPRESS_QUOTES.length)];
        }

        if (command === RECORD_WEIGHT_CMD) {
            recordWeight(msg.author.username, args[0]);
            return "I have recorded your progress friend.";
        }

        if (command === STATS_CMD) {
            const result = await weightStats(msg.author.username);
            return `Here are your stats friend. ${result}`;
        }

        return ERR_MSG;
    } catch (err) {
        console.log(err);
        return ERR_MSG;
    }
}

initDb();

// Run in REPL mode is the bot if the option is passed or attempt to connect to Discord
program.option('--repl');

program.parse();
const { repl } = program.opts();

(async () => {

if (repl) {
    REPL.start({ prompt: "WhaleBot => ", eval: async (msg, context, filename, callback) => {
        const wrappedMsg = {
            content: msg.trim(),
            author: {
                username: "Liz"
            }
        }
        callback(null, await processMessage(wrappedMsg));
    }});
} else {
    // Create a Client instance with our bot token.
    const bot = new eris.Client(process.env.WHALE_BOT_TOKEN);

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
                const resp = await processMessage(msg);
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
}

})();
