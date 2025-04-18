import { ael } from './utility.js';
import geometry from './geometry.js';
import ui from './ui.js';
import size from './size.js';
import Chipmunk from './chipmunk.js';
import money from './money.js';

export default {
  radiusChipmunk: 0.375,
  radiusMoney: 0.2,
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
    if (money.taken) {
      this.position = null;
      return;
    }
    const pi = Math.PI;
    const { position: sPos } = this;
    const porchRatio = size.porch / 2 / size.boundary;
    const onPorch = sPos.every(
      (u) => Math.abs(u) < porchRatio,
    );
    for (const chipmunk of Chipmunk.pool) {
      const active = chipmunk.active();
      const { hiding, emerging } = chipmunk;
      if (!active || hiding || emerging) continue;
      const { position: cPos } = chipmunk;
      const vectorCS = geometry.vDiff(cPos, sPos);
      const dCS = Math.hypot(...vectorCS);
      const tooFar = dCS > this.radiusChipmunk;
      const wrongSide = !onPorch &&
        geometry.anglePair(cPos, sPos).diff > pi / 2;
      if (tooFar || wrongSide) continue;
      // Chase chipmunk away from both origin and shoo
      const { max, diff } = geometry.anglePair(
        cPos,
        vectorCS,
      );
      chipmunk.chase(
        max - pi / 2 + Math.random() * (pi - diff),
      );
    }
    const { position: mPos } = money;
    const vectorMS = geometry.vDiff(mPos, sPos);
    const dMS = Math.hypot(...vectorMS);
    const strength = 1 - dMS / this.radiusMoney;
    if (strength > 0) money.knock(strength);
    this.position = null;
  },
  addListener() {
    ael('.field', ui.eventType, (event) => {
      this.setPosition(event);
    });
  },
};
