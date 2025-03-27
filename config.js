import { qs } from './utility.js';
export { config as default };

const config = {
  shooRadius: 0.375,
  porchShakeTime: 0.6,
  porchDisturbancePerShoo: 1,
  porchDisturbanceMax: 4,
};

// Get sizes from CSS
function cssInt(property, selector = ':root') {
  const s = getComputedStyle(qs(selector));
  return parseInt(s.getPropertyValue(property));
}
const fieldSize = cssInt('--field-size');
const chipmunkSize = cssInt('--chipmunk-size');
const porchSize = cssInt('--porch-size');
const mlSize = cssInt('--mountain-lion-size');
config.fieldSize = fieldSize;
config.boundary = (fieldSize + chipmunkSize) / 2;
config.porch = porchSize / 2 / config.boundary;
config.mlTrack = fieldSize + mlSize;
