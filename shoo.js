import geometry from './geometry.js';
import config from './config.js';
import state from './state.js';
import mountainLion from './mountain-lion.js';

const pi = Math.PI;

export default function () {
  const { shooPosition } = state;
  if (state.mountainLion.active) return;
  const onPorch = shooPosition.every(
    (u) => Math.abs(u) < config.porch,
  );
  for (const chipmunk of state.chipmunks) {
    if (!chipmunk.active) continue;
    const { position } = chipmunk;
    const vector = [0, 1].map(
      (i) => position[i] - shooPosition[i],
    );
    const distance = Math.hypot(...vector);
    const tooFar = distance > config.shooRadius;
    const onOtherSide = geometry.anglePair([
      position, shooPosition,
    ]).diff > pi / 2;
    if (tooFar || (onOtherSide && !onPorch)) continue;
    // Chase chipmunk away from both origin and shoo
    const { max, diff } = geometry.anglePair([
      position, vector,
    ]);
    const rand = Math.random();
    chipmunk.chase(max - pi / 2 + rand * (pi - diff));
  }
  state.shooPosition = null;
  if (onPorch && !state.money.taken) {
    const p = state.porch;
    p.element.classList.add('shaking');
    p.shakeTimer = config.porchShakeTime;
    p.disturbance += config.porchDisturbancePerShoo;
    if (p.disturbance > config.porchDisturbanceMax) {
      mountainLion.activate();
    }
  }
}
