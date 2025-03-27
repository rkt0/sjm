import { qs } from './utility.js';
import money from './money.js';

export default {
  shakeTime: 0.6,
  disturbancePerShoo: 1,
  disturbanceMax: 4,
  element: qs('.porch'),
  shakeTimer: 0,
  disturbance: 0,
  initialize() {
    this.shakeTimer = 0;
    this.disturbance = 0;
    this.element.classList.remove('shaking');
    this.element.append(money.element);
  },
  update(elapsed) {
    this.shakeTimer -= elapsed;
    if (this.shakeTimer < 0) {
      this.shakeTimer = 0;
      this.element.classList.remove('shaking');
    }
    this.disturbance -= elapsed;
    if (this.disturbance < 0) this.disturbance = 0;
  },
};
