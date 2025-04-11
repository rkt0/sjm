import { qs } from './utility.js';

function cssInt(property, selector = ':root') {
  const s = getComputedStyle(qs(selector));
  return parseInt(s.getPropertyValue(property));
}

const fieldSize = cssInt('--field-size');
const chipmunkSize = cssInt('--chipmunk-size');
const porchSize = cssInt('--porch-size');

export default {
  field: fieldSize,
  chipmunk: chipmunkSize,
  boundary: (fieldSize + chipmunkSize) / 2,
  porch: porchSize,
};
