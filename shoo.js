import { ael } from './utility.js';
import geometry from './geometry.js';
import ui from './ui.js';
import size from './size.js';
import Chipmunk from './chipmunk.js';
import mountainLion from './mountain-lion.js';

export default {
  radius: 0.375,
  setPosition(event) {
    if (!event) {
      this.position = null;
      return;
    }
    let pxOffset = [event.offsetX, event.offsetY];
    if (ui.eventType === 'touchstart') {
      const t = event.changedTouches[0];
      const tLoc = [t.clientX, t.clientY];
      const fLoc = this.fieldLocation;
      pxOffset = [0, 1].map((u) => tLoc[u] - fLoc[u]);
    }
    this.position = pxOffset.map(
      (u) => (u - size.field / 2) / size.boundary,
    );
  },
  execute() {
    const pi = Math.PI;
    const { position: sPos } = this;
    if (mountainLion.active) return;
    const porchRatio = size.porch / 2 / size.boundary;
    const onPorch = sPos.every(
      (u) => Math.abs(u) < porchRatio
    );
    for (const chipmunk of Chipmunk.pool) {
      if (!chipmunk.active) continue;
      const { position: cPos } = chipmunk;
      const d = [0, 1].map((i) => cPos[i] - sPos[i]);
      const tooFar = Math.hypot(...d) > this.radius;
      const wrongSide = !onPorch &&
        geometry.anglePair(cPos, sPos).diff > pi / 2;
      if (tooFar || wrongSide) continue;
      // Chase chipmunk away from both origin and shoo
      const chaseAngles = geometry.anglePair(cPos, d);
      const { max, diff } = chaseAngles;
      chipmunk.chase(
        max - pi / 2 + Math.random() * (pi - diff),
      );
    }
    this.position = null;
  },
  addListener() {
    ael('.field', ui.eventType, (event) => {
      this.setPosition(event);
    });
  },
};
