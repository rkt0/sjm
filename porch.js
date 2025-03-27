import { qs } from './utility.js';
import state from './state.js';

export default {
  shakeTime: 0.6,
  disturbancePerShoo: 1,
  disturbanceMax: 4,
  element: qs('.porch'),
  initialize() {
    this.shakeTimer = 0;
    this.disturbance = 0;
    this.element.classList.remove('shaking');
    this.element.append(state.money.element);
    state.porch = this;
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
