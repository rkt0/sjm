import { qs } from './utility.js';
export default {
  chipmunks: [],
  shooPosition: null,
  time: {
    total: 0,
    element: qs('.gameplay .time-display'),
    lastStamp: null,
  },
  paused: false,
  money: {
    taken: false,
    element: qs('.money'),
  },
  porch: {
    element: qs('.porch'),
    shakeTimer: 0,
    disturbance: 0,
  },
  mountainLion: { active: false },
  nActive: 0,
};
