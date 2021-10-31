import ffr43n from '../data/ffr43n.json';
import fsr43e from '../data/fsr43e.json';
import frr43e from '../data/frr43e.json';
import fsr43b from '../data/fsr43b.json';
import frr43b from '../data/frr43b.json';
import vector from '../data/vector.json';

class Rails {
  constructor(rails) {
    Object.assign(this, rails);
  }

  getSingleRails() {
    const result = [];
    for (const rail of Object.values(this)) {
      if (rail.type == 'single') {
        result.push(rail);
      }
    }
    return result;
  }

  getRails() {
    const result = [];
    for (const rail of Object.values(this)) {
      result.push(rail);
    }
    return result;
  }

  getRailGeometry(name, flip) {
    const g = this[name];
    if (!flip) {
      return {
        size: { width: g.size.width, height: g.size.height },
        offset: { x: g.offset.x, y: g.offset.y },
      };
    }
    return {
        size: { width: g.size.width, height: g.size.height },
      offset: { x: g.offset.x, y: g.size.height - g.offset.y },
    };
  }

  getRail(name, flip) {
    return this[name];
  }

  getNutInterval(name, flip) {
    const rail = this.getRail(name);
    if (!rail) {
      return 0;
    }
    if (typeof rail.nutInterval !== 'undefined') {
      return rail.nutInterval;
    }
    // calculate nutInterval
    if (!flip) {
      return rail.offset.y * 2;
    } else {
      return (rail.size.height - rail.offset.y) * 2;
    }
  }
}

export const rails = new Rails({
  ffr43n: ffr43n,
  fsr43e: fsr43e,
  frr43e: frr43e,
  fsr43b: fsr43b,
  frr43b: frr43b,
  vector: vector,
});
