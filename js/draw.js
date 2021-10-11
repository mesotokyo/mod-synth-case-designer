import { rails } from './rails.js';

function _newSvgElem(name, attribute, content) {
  attribute = attribute || [];
  const el = document.createElementNS('http://www.w3.org/2000/svg',
                                      name);
  for (const k in attribute) {
    el.setAttribute(k, attribute[k]);
  }
  if (content) {
    el.textContent = content;
  }
  return el;
}

function _removeElem(root, elemId) {
  const el = root.getElementById(elemId);
  if (el) {
    el.remove();
  }
}

export function draw(root, param) {
  drawSidePanelOutline(root, param);
  drawModulePanel(root, param);
  drawRails(root, param);
}

function drawRails(root, param) {
  _removeElem(root, 'rails');
  _removeElem(root, 'mount-holes');
  _removeElem(root, 'rail-rects');

  const railsEl = _newSvgElem('g', { id: 'rails',
                                       class: 'rail',
                                     });
  const holesEl = _newSvgElem('g', { id: 'mount-holes',
                                   class: 'mount-hole',
                                 });
  const rectsEl = _newSvgElem('g', { id: 'rail-rects',
                                   class: 'rail-rect',
                                 });
  
  let n = 0;
  let type = param.railTypeTop;
  let flip = param.flipRailTop;
  drawRailOutline(railsEl, param, n, type, flip);
  drawMountHole(holesEl, param, n, type, flip);
  drawDimensionLine(holesEl, param, n, type, flip);
  drawRailOutlineBox(rectsEl, param, n, type, flip);
  n++;
  for (const rail of param.middleRails) {
    type = rail.type;
    flip = rail.flip;
    if (rails[type].type != "double") {
      drawRailOutline(railsEl, param, n, type, !flip);
      drawMountHole(holesEl, param, n, type, !flip);
      drawDimensionLine(holesEl, param, n, type, !flip);
      drawRailOutlineBox(rectsEl, param, n, type, !flip);
      n++;
      drawRailOutline(railsEl, param, n, type, flip);
      drawMountHole(holesEl, param, n, type, flip);
      drawDimensionLine(holesEl, param, n, type, flip);
      drawRailOutlineBox(rectsEl, param, n, type, flip);
      n++;
    } else {
      drawRailOutline(railsEl, param, n, type, false);
      drawMountHole(holesEl, param, n, type, false);
      drawDimensionLine(holesEl, param, n, type, false);
      drawRailOutlineBox(rectsEl, param, n, type, false);
      n+=2;
    }
  }
  type = param.railTypeBottom;
  flip = param.flipRailBottom;
  drawRailOutline(railsEl, param, n, type, flip);
  drawMountHole(holesEl, param, n, type, flip);
  drawDimensionLine(holesEl, param, n, type, flip);
  drawRailOutlineBox(rectsEl, param, n, type, flip);

  root.appendChild(railsEl);
  root.appendChild(holesEl);
  root.appendChild(rectsEl);
}


function drawRailOutline(root, param, index, railType, flip) {
  if (!param.showRails) {
    return;
  }
  const rail = rails[railType];
  const left = param.topOffset - rail.offset.x;

  // calc translate matrix
  let matrix;
  if (flip) {
    const y = param.railPositions[index] - (rail.size.height-rail.offset.y);
    matrix = `matrix(1, 0, 0, -1, ${left}, ${y + rail.size.height})`;
  } else {
    const y = param.railPositions[index] - rail.offset.y;
    matrix = `matrix(1, 0, 0, 1, ${left}, ${y})`;
  }

  const g = _newSvgElem('g', { transform: `${matrix}`,
                             });
  g.innerHTML = rail.svg;
  root.appendChild(g);
}

function drawRailOutlineBox(root, param, index, railType, flip) { 
  if (!param.showRails) {
    return;
  }
  const rail = rails[railType];
  const left = param.topOffset - rail.offset.x;
  const top = param.railPositions[index]
        - (flip ? (rail.size.height - rail.offset.y): rail.offset.y);

  const g = _newSvgElem('g', { transform: `translate(${left}, ${top})` });
  g.appendChild(_newSvgElem('rect', { x: 0, y: 0,
                                      width: rail.size.width,
                                      height: rail.size.height,
                                    }));
  root.appendChild(g);
}

function drawMountHole(root, param, index, railType, flip) {
  if (!param.showMountHoles) {
    return;
  }
  const rail = rails[railType];
  const left = param.topOffset - rail.offset.x;
  const top = param.railPositions[index]
        - (flip ? (rail.size.height - rail.offset.y): rail.offset.y);

  const g = _newSvgElem('g', { transform: `translate(${left}, ${top})` });
  for (const hole of rail.mountHoles) {
    const x = hole.x;
    let y;
    if (flip) {
      y = rail.size.height - hole.y;
    } else {
      y = hole.y;
    }
    const c = _newSvgElem('circle', { cx: x,
                                      cy: y,
                                      r: hole.d / 2,
                                      class: 'hole' });
    const width = 10;
    const height = 10;
    const l1 = _newSvgElem('line', { x1: x - width,
                                     y1: y,
                                     x2: x + width,
                                     y2: y,
                                     class: 'center-line' });
    const l2 = _newSvgElem('line', { x1: x,
                                     y1: y - height,
                                     x2: x,
                                     y2: y + height,
                                     class: 'center-line' });
    g.appendChild(c);
    g.appendChild(l1);
    g.appendChild(l2);
  }
  root.appendChild(g);
}

function drawDimensionLine(root, param, index, railType, flip) {
  if (!param.showDimensions) {
    return;
  }
  const rail = rails[railType];
  const left = param.topOffset - rail.offset.x;
  const top = param.railPositions[index]
        - (flip ? (rail.size.height - rail.offset.y): rail.offset.y);

  const g = _newSvgElem('g', { transform: `translate(${left}, ${top})` });
  let nHole = 0;
  for (const hole of rail.mountHoles) {
    const el = _newSvgElem('g', {
      class: "dimension-lines",
    });
    const x = hole.x;
    let y;
    if (flip) {
      y = rail.size.height - hole.y;
    } else {
      y = hole.y;
    }
    drawVerticalDimensionLine(el, x, y, top, index*4);
    drawHorizontalDimensionLine(el, x, y, left, nHole*4);
    g.appendChild(el);
    nHole++;
    el.addEventListener('click', ev => { selectDimensionLine(root, el); });
  }
  root.appendChild(g);
}

function selectDimensionLine(root, el) {
  root
    .querySelectorAll('.selected')
    .forEach(elem => {
      elem.classList.remove('selected');
    });
  el.classList.add('selected');
}


function drawVerticalDimensionLine(root, x, y, top, offset) {
  const x1 = x + offset;
  const y1 = -top;
  const x2 = x + offset;
  const y2 = y;
  const l1 = _newSvgElem('line', { x1: x1,
                                   y1: y1,
                                   x2: x2,
                                   y2: y2,
                                   class: 'dimension-line' });
  const arrowSizeX = 1;
  const arrowSizeY = 2;
  const pl1 = _newSvgElem('polyline', {
    points: `${x1-arrowSizeX},${y1+arrowSizeY} ${x1},${y1} ${x1+arrowSizeX},${y1+arrowSizeY}`,
    class: 'dimension-line',
  });
  const pl2 = _newSvgElem('polyline', {
    points: `${x2-arrowSizeX},${y2-arrowSizeY} ${x2},${y2} ${x2+arrowSizeX},${y2-arrowSizeY}`,
    class: 'dimension-line',
  });

  const yOffset = -3;
  const xOffset = 1;
  const len = _newSvgElem('text', {
    x: x2 + xOffset,
    y: y2 + yOffset,
    class: 'dimension-text',
  }, (y + top).toFixed(2));

  root.appendChild(l1);
  root.appendChild(pl1);
  root.appendChild(pl2);
  root.appendChild(len);
}

function drawHorizontalDimensionLine(root, x, y, left, offset) {
  const x1 = -left;
  const y1 = y + offset;
  const x2 = x;
  const y2 = y + offset;
  const l1 = _newSvgElem('line', { x1: x1, y1: y1,
                                   x2: x2, y2: y2,
                                   class: 'dimension-line' });
  root.appendChild(l1);

  const arrowSizeX = 2;
  const arrowSizeY = 1;
  const pl1 = _newSvgElem('polyline', {
    points: `${x1+arrowSizeX},${y1-arrowSizeY} ${x1},${y1} ${x1+arrowSizeX},${y1+arrowSizeY}`,
    class: 'dimension-line',
  });
  const pl2 = _newSvgElem('polyline', {
    points: `${x2-arrowSizeX},${y2-arrowSizeY} ${x2},${y2} ${x2-arrowSizeX},${y2+arrowSizeY}`,
    class: 'dimension-line',
  });

  const yOffset = 6;
  const xOffset = -18;
  const len = _newSvgElem('text', {
    x: x2 + xOffset,
    y: y2 + yOffset,
    class: 'dimension-text',
  }, (x + left).toFixed(2));

  root.appendChild(pl1);
  root.appendChild(pl2);
  root.appendChild(len);
}

function drawSidePanelOutline(root, param) {
  const theId = 'box-rect';
  _removeElem(root, theId);
  const g = _newSvgElem('g', { id: theId,
                               class: 'side-panel'});
  const rect = _newSvgElem('rect',
                           { x: 0,
                             y: 0,
                             width: param.boxWidth,
                             height: param.boxHeight });
  g.appendChild(rect);
  root.appendChild(g);
}

function drawModulePanel(root, param) {
  const theId = 'module-rect';
  _removeElem(root, theId);
  if (!param.showFrontPanels) {
    return;
  }
  const g = _newSvgElem('g', { id: theId,
                               class: 'module-panel' });

  const x = param.topOffset - 2;
  const height = 128.5;
  const width = 2;
  for (let n = 0; n < param.rows; n++) {
    const y = param.railPositions[2*n] - 3;
    const rect = _newSvgElem('rect',
                             { x: x,
                               y: y,
                               width: width,
                               height: height });
    g.appendChild(rect);
  }
  root.appendChild(g);
}
