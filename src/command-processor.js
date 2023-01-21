import { recordWeight, weightStats } from "./db-utils.js";
import {
    HELP_CMD,
    INSPIRE_CMD,
    DEPRESS_CMD,
    RECORD_WEIGHT_CMD,
    STATS_CMD,
    INSPIRE_QUOTES,
    DEPRESS_QUOTES,
    HELP_MSG,
    ERR_MSG,
} from "./constants.js";


function averageWeight(weights) {
    return (weights.reduce((a, b) => a + b, 0) / weights.length).toPrecision(5);
}

export async function processMessage(msg) {
    try {
        const commandComponents = msg.content.split(" ");
        const [ _, command, ...args] = commandComponents;

        console.log(`Processing msg(${msg.content}) from author ${msg.author.username}`);
        console.log(`Processing command: ${command}`);

        switch (command) {
            case HELP_CMD:
                return HELP_MSG;
            case INSPIRE_CMD:
                return INSPIRE_QUOTES[Math.floor(Math.random() * INSPIRE_QUOTES.length)];
            case DEPRESS_CMD:
                return DEPRESS_QUOTES[Math.floor(Math.random() * DEPRESS_QUOTES.length)];
            case RECORD_WEIGHT_CMD:
                recordWeight(msg.author.username, args[0]);
                return "I have recorded your progress friend.";
            case STATS_CMD:
                const pastWeights = await weightStats(msg.author.username);
                const average = await averageWeight(pastWeights);
                return `Past 7 Weights: ${pastWeights}\n7 Day Average: ${average}`;
        }

        return ERR_MSG;
    } catch (err) {
        console.log(err);
        return ERR_MSG;
    }
}