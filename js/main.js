import { Jumon } from 'jumon';
import { rails } from './rails.js';
import { draw } from './draw.js';
import { railPrefForm } from './rail-pref-form.js';

const SVG_ELEM_ID = "blueprint-body";

const svgRoot = document.getElementById(SVG_ELEM_ID);
let parameter;

function initialize() {
  console.log("initialize start...");

  addRailOptions(document.getElementById("railTypeTop"));
  addRailOptions(document.getElementById("railTypeBottom"));

  parameter = new Jumon();
  parameter.railPrefForm = function (param, index) {
    return railPrefForm(param, index);
  };
  parameter.middleRails = [];
  parameter.on('update', updateDesign);
  parameter.ratioToViewBox = function (val) {
    if (isNaN(val)) {
      return "-20 -10 200 200";
    }

    // get required size to show all sideBox
    const ratio = 100 / parameter.zoomRatio;
    const w = (parameter.boxWidth + 30) * ratio;
    const h = (parameter.boxHeight + 20) * ratio;
    return `-20 -10 ${w} ${h}`;
  };
  parameter.zoomIn = function () {
    parameter.zoomRatio += 10;
  };
  parameter.zoomOut = function () {
    parameter.zoomRatio -= 10;
  };
  parameter.zoomReset = function () {
    parameter.zoomRatio = 100;
  };

  updateDesign();
  parameter.zoomRatio = 50;
  console.log("initialize done.");
}

function addRailOptions(elem) {
  let first = true;
  for (const rail of rails.getSingleRails()) {
    const opt = document.createElement('option');
    opt.setAttribute('value', rail.outputName);
    opt.textContent = rail.name;
    if (first) {
      opt.setAttribute('selected', true);
      first = false;
    }
    elem.appendChild(opt);
  }
}

function updateDesign() {
  // calculate number of middle rails
  const n = parameter.rows - 1;
  const r = parameter.middleRails;
  while (r.length < n) {
    r.push({});
  }
  while (r.length > n) {
    r.pop();
  }
  calcRailPositions();
  console.log("update design!");
  console.log(`current parameter: ${JSON.stringify(parameter)}`);
  draw(svgRoot, parameter);
}

function calcRailPositions() {
  // panel height: 128.5 mm
  // doubled rail center distance: 10 mm
  // rail nut-to-nut distance: 122.5 mm
  const MODULE_NUT_DISTANCE = 122.5;
  const DOUBLED_RAIL_NUT_DISTANCE = 10;

  // list up rail intervals
  let interval = 0;
  let positions = [];
  for (let n = 0; n < parameter.rows; n++) {
    positions.push(interval);
    positions.push(MODULE_NUT_DISTANCE);

    if (n < parameter.middleRails.length) {
      interval = rails.getNutInterval(parameter.middleRails[n].type,
                                      parameter.middleRails[n].flip);
    }
  }
  
  // calc total height
  let panelsSum = positions.reduce((x,y) => x + y);

  // add clearance
  let topClearance;
  if (parameter.positioningMode === "auto") {
    topClearance = (parameter.boxHeight - panelsSum) / 2;
  }
  for (let n = 0; n < positions.length; n++) {
    if (n == 0) {
      positions[n] = topClearance;
    } else {
      positions[n] = positions[n-1] + positions[n];
    }
  }
  parameter.railPositions = positions;
}

initialize();
