// DB Constants
export const DB_LOCATION = `${process.env.HOME}/.WhaleBot.db`;
export const CREATE_USER_WEIGHTS_TABLE =
    "CREATE TABLE IF NOT EXISTS userweights" + 
    " (dateanduser TEXT PRIMARY KEY, date TEXT, username TEXT, weight REAL)";
export const INSERT_USER_WEIGHTS_TABLE =
    "INSERT OR REPLACE INTO userweights(dateanduser, date, username, weight)" +
    " VALUES(?, ?, ?, ?)";
export const SELECT_CURRENT_WEEK =
    "SELECT * FROM userweights WHERE username LIKE ? AND userweights.date " +
    "BETWEEN strftime('%Y%m%d', date('now','-7 days')) AND " +
    "strftime('%Y%m%d', date('now')) ORDER BY date DESC LIMIT 7";
export const SELECT_LAST_WEEK =
    "SELECT * FROM userweights WHERE username LIKE ? AND userweights.date " +
    "BETWEEN strftime('%Y%m%d',date('now', '-14 days')) AND " +
    "strftime('%Y%m%d',date('now', '-7 days')) ORDER BY date DESC LIMIT 7";

// Command Labels
export const HELP_CMD    = "help";
export const INSPIRE_CMD = "inspire";
export const DEPRESS_CMD = "depress";
export const RECORD_WEIGHT_CMD = "recordWeight";
export const STATS_CMD = "stats";

// Command Data
export const INSPIRE_QUOTES = [
    "Do you ever get the feeling that people are incapable of not caring? People are amazing!",
    "This is the best thing I've ever read.",
    "Think about the truth of your argument.",
    "You don’t have to be angry at the whole world. You can just be mad at me.",
    "I need to know that I have done one thing right with my life!",
    "These assignments don’t matter, this course doesn’t matter, college doesn’t matter. " +
    "These amazing, honest, things that you wrote, they matter!",
    "You’re the best thing I’ve ever done.",
];

export const DEPRESS_QUOTES = [
    "I am grotesque. Say it!",
    "Who would ever want me to be part of their life?",
    "I'm sorry Liz.",
];

// Messages
export const HELP_MSG = "Hi I'm Charlie. I'm a work in progress. " +
                        "You can talk to me like this:\n\n"  +
                        "@Whalebot recordWeight <WEIGHT>'\n" +
                        "@Whalebot stats'\n" +
                        "@Whalebot inspire'\n" +
                        "@WhaleBot help'";
export const ERR_MSG = "I could not understand you, but keep trying. " +
                       "Maybe type '@WhaleBot help'. You are amazing!";