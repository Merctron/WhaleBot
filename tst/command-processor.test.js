import { processMessage } from "../src/command-processor.js";
import fs from "fs";
import { HELP_CMD, HELP_MSG, ISSUED_CMD, DB_LOCATION, } from "../src/constants.js";

test("Processes 'help' command", async () => {
  expect(await processMessage({
  	content: `@WhaleBot ${HELP_CMD}`,
    author: { username: "Liz" },
  })).toBe(HELP_MSG);
});

test("Process 'issued' command", async () => {

  const data = fs.readFileSync(DB_LOCATION, {encoding:'utf8', flag:'r'});
  const fileObject = await processMessage({
    content: `@WhaleBot ${ISSUED_CMD}`,
    author: { username: "Liz" },
  })

  expect(fileObject).toEqual(expect.objectContaining({
      content: "DB File", 
      file:{
        file: data, 
        name: `WhaleBot.db`
      }
    }
  ));

});