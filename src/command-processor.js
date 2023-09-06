import {recordWeight, 
        weightStats, 
        dumpDB,
        getGoal,
        setGoal,
        updateGoal,
        deleteGoal,
        getAllGoals,
} from "./db-utils.js";
import {
    HELP_CMD,
    INSPIRE_CMD,
    DEPRESS_CMD,
    RECORD_WEIGHT_CMD,
    STATS_CMD,
    SET_GOAL_CMD,
    UPDATE_GOAL_CMD,
    DELETE_GOAL_CMD,
    GET_ALL_GOALS_CMD,
    GET_GOAL_CMD,
    INSPIRE_QUOTES,
    DEPRESS_QUOTES,
    HELP_MSG,
    ERR_MSG,
    DUMP_DB_CMD,
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
            case SET_GOAL_CMD:
                setGoal(msg.author.username, args[0]);
                return "I have set your goal friend.";
            case UPDATE_GOAL_CMD:
                updateGoal(msg.author.username, args[0]);
                return "I have updated your goal friend.";
            case DELETE_GOAL_CMD:
                deleteGoal(msg.author.username);
                return "I have deleted your goal friend.";
            case GET_ALL_GOALS_CMD:
                // show scoreboard of goal progress
                const allGoals = await getAllGoals();
                const goalStats = new Object();
                for (const goal of allGoals) {
                    const {currWeights} = await weightStats(goal.username);
                    const numWeights = currWeights.length;
                    const currentAvg = numWeights === 0 ? 0 : averageWeight(currWeights);
                    const goalDiff = currentAvg - goal.goal;
                    const isGoalMet = goalDiff <= 0;
                    goalStats[goal.username] = `User: ${goal.username}, Goal Progress: ${isGoalMet ? "Met" : "Remaining"} ${Math.abs(goalDiff).toPrecision(5)} lbs.`;
                }
                return statsToString(goalStats);
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
                // only add goal if it exists
                const goalExists = await getGoal(msg.author.username) !== undefined;
                
                if (goalExists) {
                // add goal to stats
                const goal = await getGoal(msg.author.username);
                
                stats['goal'] = `Goal: ${goal['goal']} lbs.`;
                // add goal progress to stats
                const goalDiff = currentAvg - goal['goal'];
                const isGoalMet = goalDiff <= 0;
                stats['goal_progress'] = `Goal Progress: ${isGoalMet ? "Met" : "Remaining"} ${Math.abs(goalDiff).toPrecision(5)} lbs.`;
                }

                return statsToString(stats);
            case DUMP_DB_CMD:
                const dump = dumpDB();
                return dump;
        }

        return ERR_MSG;
    } catch (err) {
        console.log(err);
        return ERR_MSG;
    }
}