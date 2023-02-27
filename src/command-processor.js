import { recordWeight, weightStats, dumpDB } from "./db-utils.js";
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
    ISSUED_CMD
} from "./constants.js";

function averageWeight(weights) {
    return (weights.reduce((a, b) => a + b, 0) / weights.length).toPrecision(5);
}

function statsToString(statsObj) {
    let statString = '';
    for (const [key, val] of Object.entries(statsObj)) {
        statString += `${val}\n`;
    }
    return statString;
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
                const stats = new Object();
                const { currWeights, pastWeights } = await weightStats(msg.author.username);
                const numWeights = currWeights.length;
                const currentAvg = numWeights === 0 ? 0 : averageWeight(currWeights);

                if (pastWeights.length === 0){
                    stats['weights'] = `Past ${numWeights} Weights: ${currWeights.slice(0,7)} lbs.`;
                    stats['average'] = `${numWeights} Day Average: ${currentAvg} lbs.`;
                }
                else {
                    const lastAvg = averageWeight(pastWeights);
                    const avgDiff = (lastAvg - currentAvg);
                    const isGain = avgDiff <= 0;

                    stats['weights'] = `Past 7 Weights: ${currWeights} lbs.`;
                    stats['average'] = `7 Day Average: ${currentAvg} lbs.`;
                    stats['bi_average'] = `Average Difference: ${isGain ? "Gained" : "Lost"} ${Math.abs(avgDiff).toPrecision(5)} lbs.`;
                }

                return statsToString(stats);
            case ISSUED_CMD:
                const dump = await dumpDB();
                return dump;
        }

        return ERR_MSG;
    } catch (err) {
        console.log(err);
        return ERR_MSG;
    }
}