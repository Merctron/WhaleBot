import mock from 'mock-fs';
import fs from "fs";
import { processMessage } from "../src/command-processor.js";
import { HELP_CMD, HELP_MSG, DUMP_DB_CMD, FILE_SIZE_ERR_MSG, DB_LOCATION} from "../src/constants.js";


test("Processes 'help' command", async () => {
  expect(await processMessage({
  	content: `@WhaleBot ${HELP_CMD}`,
    author: { username: "Liz" },
  })).toBe(HELP_MSG);
});

describe("Process 'dumpDB' command", () => {

  beforeEach( () => {
    mock.restore();
    mock(
      process.env.HOME
    );
  });

  it("should return on correct file size", async () => {

    fs.writeFileSync(DB_LOCATION, "hello test", {encoding: "utf8", flag: "w"});
    const fileObject = await processMessage({
      content: `@WhaleBot ${DUMP_DB_CMD}`,
      author: { username: "Liz" },
    })

    expect(fileObject).toEqual(expect.objectContaining({
      content: "DB File", 
      file:{
        file: "hello test", 
        name: `WhaleBot.db`
      }
    }));
  });

  it(" should throw error on file > 8MB", async () => {

    let newData = "";
  
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
  
  })

  afterAll(() => {
     mock.restore(); 
  });

});