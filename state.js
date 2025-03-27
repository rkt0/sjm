import { qs } from './utility.js';
export default {
  paused: false,
  money: {
    taken: false,
    element: qs('.money'),
  },
  nActive: 0,
};
