import { Jumon } from 'jumon';
import { rails } from './rails.js';
import { draw } from './draw.js';
import { railPrefForm } from './rail-pref-form.js';
import { serialize, deserialize } from './serializer.js';

const SVG_ELEM_ID = "blueprint-body";

const svgRoot = document.getElementById(SVG_ELEM_ID);
let parameter;

function initialize() {
  console.log("initialize start...");

  addRailOptions(document.getElementById("railTypeTop"));
  addRailOptions(document.getElementById("railTypeBottom"));

  // decode query params
  const q = location.search;
  let initial = {};
  if (q) {
    initial = deserialize(q.substring(1));
    //const u = new URL(location.href);
    //u.search = '';
    //history.replaceState(null, '', u);
  }
  initial.middleRails = initial.middleRails || [];
  console.log(`initial parameter: ${JSON.stringify(initial, null, 2)}`);

  parameter = new Jumon(initial);
  parameter.railPrefForm = function (param, index) {
    return railPrefForm(param, index);
  };
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
  parameter.zoomRatio = 50;

  updateDesign();
  setQuery();
  console.log("initialize done.");
}


function setQuery() {
  const q = serialize(parameter);
  const url = new URL(location.href);
  url.search = `?${q}`;
  if (parameter.shareUrl != url.href) {
    parameter.shareUrl = url.href;
  }
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
  console.log(`current parameter: ${JSON.stringify(parameter, null, 2)}`);
  draw(svgRoot, parameter);
  parameter.on('update', setQuery);
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
  if (parameter.positioningMode === "center") {
    topClearance = parameter.verticalOffset + (parameter.boxHeight - panelsSum) / 2;
  } else if (parameter.positioningMode === "top") {
    const offset = rails.getRailGeometry(parameter.railTypeTop,
                                         parameter.flipRailTop).offset;
    topClearance = offset.y + parameter.verticalOffset;
  } else if (parameter.positioningMode === "bottom") {
    const geom = rails.getRailGeometry(parameter.railTypeBottom,
                                       parameter.flipRailBottom);
    const offset = geom.size.height - geom.offset.y;
    topClearance = parameter.verticalOffset + parameter.boxHeight - panelsSum - offset;
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
