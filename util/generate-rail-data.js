const fs = require('fs');
const path = require('path');
const { generate } = require('./svg-packer');

const CMD_NAME = "generate-rail-data.js";
const USAGE = `${CMD_NAME} <source-dir> <output-dir>`;

function main() {
  // check arguments
  if (process.argv.length < 4) {
    console.error(USAGE);
    process.exit(-1);
  }

  const sourceDir = process.argv[2];
  const outputDir = process.argv[3];

  fs.readdir(sourceDir, (err, files) => {
    if (err) {
      console.error(`ERROR: fail open directory; message: "${err}"`);
      process.exit(-2);
    }

    for (const fn of files) {
      if (fn.toLowerCase().search(/.json$/) != -1) {
        const fp = path.join(sourceDir, fn);
        console.log(`generate from ${fp}`);
        generate(fp, outputDir);
      }
    }
  });
  

}


main();
