import { qs } from './utility.js';

function cssInt(property, selector = ':root') {
  const s = getComputedStyle(qs(selector));
  return parseInt(s.getPropertyValue(property));
}

const fieldSize = cssInt('--field-size');
const chipmunkSize = cssInt('--chipmunk-size');
const porchSize = cssInt('--porch-size');
const boundarySize = (fieldSize + chipmunkSize) / 2;

export default {
  field: fieldSize,
  chipmunk: chipmunkSize,
  boundary: boundarySize,
  porch: porchSize,
  porchRatio: porchSize / 2 / boundarySize,
};
