import fpsMeter from './fps-meter.js';
import state from './state.js';

export default {
  initialize() {
    state.time.total = 0;
    state.time.element.innerHTML = 0;
    state.time.lastStamp = null;
  },
  advance(timeStamp) {
    state.time.lastStamp ??= timeStamp;
    const elapsed = 0.001 * (
      timeStamp - state.time.lastStamp
    );
    state.time.total += elapsed;
    state.time.element.innerHTML = Math.trunc(
      state.time.total,
    );
    state.time.lastStamp = timeStamp;
    if (fpsMeter.on) fpsMeter.tick(elapsed);
    return elapsed;
  },
};
