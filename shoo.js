import { ael } from './utility.js';
import geometry from './geometry.js';
import config from './config.js';
import state from './state.js';
import ui from './ui.js';
import mountainLion from './mountain-lion.js';

export default {
  radius: 0.375,
  setPosition(event) {
    if (!event) {
      this.position = null;
      return;
    }
    if (state.paused) return;
    const { boundary, fieldSize } = config;
    let pxOffset = [event.offsetX, event.offsetY];
    if (ui.eventType === 'touchstart') {
      const t = event.changedTouches[0];
      const tLoc = [t.clientX, t.clientY];
      const fLoc = this.fieldLocation;
      pxOffset = [0, 1].map((u) => tLoc[u] - fLoc[u]);
    }
    this.position = pxOffset.map(
      (u) => (u - fieldSize / 2) / boundary,
    );
  },
  execute() {
    const pi = Math.PI;
    // const { anglePair } = geometry;
    const { position: sPos } = this;
    if (state.mountainLion.active) return;
    const onPorch = sPos.every(
      (u) => Math.abs(u) < config.porch,
    );
    for (const chipmunk of state.chipmunks) {
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
    if (!onPorch || state.money.taken) return;
    const p = state.porch;
    p.element.classList.add('shaking');
    p.shakeTimer = p.shakeTime;
    p.disturbance += p.disturbancePerShoo;
    if (p.disturbance > p.disturbanceMax) {
      mountainLion.activate();
    }
  },
  addListener() {
    ael('.field', ui.eventType, (event) => {
      this.setPosition(event);
    });
  },
};
