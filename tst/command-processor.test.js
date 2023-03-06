import { processMessage } from "../src/command-processor.js";
import fs from "fs";
import { HELP_CMD, HELP_MSG, DUMP_DB_CMD, DB_LOCATION, FILE_SIZE_ERR_MSG} from "../src/constants.js";

test("Processes 'help' command", async () => {
  expect(await processMessage({
  	content: `@WhaleBot ${HELP_CMD}`,
    author: { username: "Liz" },
  })).toBe(HELP_MSG);
});

test("Process 'dumpDB' command", async () => {

  const data = fs.readFileSync(DB_LOCATION, {encoding:'utf8', flag:'r'});
  const fileObject = await processMessage({
    content: `@WhaleBot ${DUMP_DB_CMD}`,
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

test("Process dumpDB command on file grater than 8MB", async () => {

  const data = fs.readFileSync(DB_LOCATION, {encoding:'utf8', flag:'r'});
  var newData = "";

  for (var i = 0; i < 8*(1024*1024); i++) {

    newData += "0"
  }
  newData += "0";

  fs.writeFileSync(DB_LOCATION, newData, {encoding:'utf8', flag: 'w'});
  
  const ERR_MSG = await processMessage({
    content: `@WhaleBot ${DUMP_DB_CMD}`,
    author: { username: "Liz" },
  })

  expect(ERR_MSG).toBe(FILE_SIZE_ERR_MSG);
  fs.writeFileSync(DB_LOCATION, data, {encoding:'utf8', flag: 'w'});

});