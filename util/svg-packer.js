// SVG data to json converter for mod-synth-case-designer
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

const CMD_NAME = "svg-packer.js";
const USAGE = `${CMD_NAME} <definition-json-file> <output-file>`;

function main() {
  // check arguments
  if (process.argv.length < 3) {
    console.error(USAGE);
    process.exit(-1);
  }

  const inputFile = process.argv[2];

  generate(inputFile, "./data");
}

function generate(inputFile, outputDir) {
  const input = readJson(inputFile);
  const svgFilePathname = path.join(path.dirname(inputFile), input.svgFile);
  const outputFile = path.join(outputDir, `${input.outputName}.json`);
  
  let svgText = readSvg(svgFilePathname, input.group);

  // remove xmlns="http://www.w3.org/2000/svg"
  svgText = svgText.replace(/ *xmlns="http:\/\/www.w3.org\/2000\/svg" */, " ");

  // remove \n
  svgText = svgText.replace(/\n +/g, "");

  // replace double-quote to \"
  //svgText = svgText.replace(/"/g, '\\"');

  // remove blank <g/>
  svgText = svgText.replace(/<g\/>/g, "");

  // remove svg tag
  svgText = svgText.replace(/<svg +\/?>/, "");

  //console.log(svgText);
  input.svg = svgText;
  delete input.group;
  delete input.svgFile;

  writeJson(input, outputFile);
  
}

function writeJson(data, outputFilepath) {
  const json = JSON.stringify(data, null, 2);
  //console.log(json);
  fs.writeFileSync(outputFilepath, json);
}

function readSvg(filePathname, targetId) {
  let svg;
  try {
    svg = fs.readFileSync(filePathname, {encoding: 'utf8'});
  } catch(e) {
    console.error(`ERROR: fail to svg file; message: "${e.message}"`);
    process.exit(-2);
  }

  let dom;
  try {
    dom = new DOMParser().parseFromString(svg, 'image/svg+xml');
  } catch (e) {
    console.error(`ERROR: fail to parse SVG (${filePathname}); message: "${e.message}"`);
    process.exit(-2);
  }

  const e = dom.getElementById(targetId);
  const target = e ? e : dom;
  stripGroupElement(target);
  return target.toString();
}

// remove redundant attributes
function stripGroupElement(elem) {
  const rootTarget = [
    "id",
    "style",
    "stroke",
    "stroke-width",
    "fill",
    "width",
    "height",
    "viewBox",
  ];
  _stripAttr(elem, rootTarget);
  
  const target = ["id", "style", "stroke", "stroke-width", "fill"];
  const children = elem.childNodes;
  for (let n = 0; n < children.length; n++) {
    _stripAttr(children.item(n), target);
  }
}

function _stripAttr(elem, target) {
  if (!elem.attributes) {
    return;
  }
  target = target || [];
  const targetHash = {};
  for (const k of target) {
    targetHash[k] = true;
  }
  //console.log(elem);
  const attrs = [];
  for (let n = 0; n < elem.attributes.length; n++) {
    attrs.push(elem.attributes.item(n));
  }
  for (const attr of attrs) {
    if (attr.name.search(':') != -1) {
      elem.removeAttribute(attr.name);
      continue;
    }
      
    if (targetHash[attr.name]) {
      elem.removeAttribute(attr.name);
      continue;
    }
  }

}

function readJson(filePathname) {
  let json;
  try {
    json = fs.readFileSync(filePathname, {encoding: 'utf8'});
  } catch(e) {
    console.error(`ERROR: fail to open input file; message: "${e.message}"`);
    process.exit(-2);
  }

  let result;
  try {
    result = JSON.parse(json);
  } catch(e) {
    console.error(`ERROR: fail to parse JSON; message: "${e.message}"`);
    process.exit(-2);
  }
  return result;
}


if (require.main === module) {
  console.log("generate...");
  main();
}

exports.generate = generate;
