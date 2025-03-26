import fpsMeter from './fps-meter.js';
import config from './config.js';
import state from './state.js';

export default {
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
    if (config.fpsMeterOn) fpsMeter.tick(elapsed);
    return elapsed;
  },
};
