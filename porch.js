import state from './state.js';

export default {
  update(elapsed) {
    const { porch } = state;
    porch.shakeTimer -= elapsed;
    if (porch.shakeTimer < 0) {
      porch.shakeTimer = 0;
      porch.element.classList.remove('shaking');
    }
    porch.disturbance -= elapsed;
    if (porch.disturbance < 0) porch.disturbance = 0;
  },
};
