import { processMessage } from "../src/command-processor.js";
import { HELP_CMD, HELP_MSG } from "../src/constants.js";

test("Processes 'help' command", async () => {
  expect(await processMessage({
  	content: `@WhaleBot ${HELP_CMD}`,
    author: { username: "Liz" },
  })).toBe(HELP_MSG);
});