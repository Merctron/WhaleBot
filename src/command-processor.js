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
                const stats = new Object()
                const pastWeights = await weightStats(msg.author.username);
                const numberWeights = pastWeights.length;
                const lastAvg = averageWeight(pastWeights.slice(-7));
                const currentAvg = averageWeight(pastWeights.slice(0,7));
                const averageDifference = (lastAvg - currentAvg).toPrecision(5);
                if (numberWeights <= 7){
                    stats['weights'] = `Past ${numberWeights} Weights: ${pastWeights.slice(0,7)} lbs.`;
                    stats['average'] = `${numberWeights} Day Average: ${currentAvg} lbs.`;
                }
                else if (7 < numberWeights & numberWeights < 14){
                    stats['weights'] = `Past 7 Weights: ${pastWeights.slice(0,7)} lbs.`;
                    stats['average'] = `7 Day Average: ${currentAvg} lbs.`;
                }else{
                    stats['weights'] = `Past 7 Weights: ${pastWeights.slice(0,7)} lbs.`;
                    stats['average'] = `7 Day Average: ${currentAvg} lbs.`;
                    let direction;
                    if (averageDifference <= 0) {
                        direction = "Gained";
                    } else {
                        direction = "Lost";
                    }
                    stats['bi_average'] = `Average Difference: ${direction} ${averageDifference} lbs.`;
                }
                
                return statsToString(stats);
        }

        return ERR_MSG;
    } catch (err) {
        console.log(err);
        return ERR_MSG;
    }
}