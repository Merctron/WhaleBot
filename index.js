import * as  eris from "eris";
import { program } from "commander";
import * as REPL from "repl";
import { initDb } from "./src/db-utils.js";
import { processMessage } from "./src/command-processor.js";

async function replEval(msg, context, file, callback) {
    const wrappedMsg = {
        content: msg.trim(),
        author: {
            username: "Liz"
        }
    };
    callback(null, await processMessage(wrappedMsg));
}

// Parse CL arguments
program.option('--repl');
program.parse();
const { repl } = program.opts();

// Init SQLite
initDb();

(async () => {

// Run in REPL mode if the bot option is passed.
if (repl) {
    REPL.start({
        prompt: "WhaleBot => ",
        eval: replEval,
        writer: (output) => `\n${output}\n`,
    });
// Otherwise, attempt to connect to Discord
} else {
    // Create a Client instance with our bot token.
    const bot = new eris.Client(process.env.WHALE_BOT_TOKEN);

    // When the bot is connected and ready, log to console.
    bot.on('ready', () => console.log('Connected and ready.'));

    // Every time a message is sent anywhere the bot is present,
    // this event will fire and we will check if the bot was mentioned.
    // If it was, the bot will attempt to process a command if one was specified.
    bot.on('messageCreate', async (msg) => {
        const botWasMentioned = msg.mentions.find(
            mentionedUser => mentionedUser.id === bot.user.id,
        );

        if (botWasMentioned) {
            try {
                const resp = await processMessage(msg);
                if (resp.constructor == Object) {
                    await msg.channel.createMessage(resp["content"], resp["file"]);
                }
                else await msg.channel.createMessage(resp);
            } catch (err) {
                console.warn(`Failed to respond to mention: ${err}`);
            }
        }
    });

    bot.on('error', err => console.warn(err));
    bot.connect();
}

})();
