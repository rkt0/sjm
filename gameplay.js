import fpsMeter from './fps-meter.js';
import config from './config.js';
import state from './state.js';
import ui from './ui.js';
import Chipmunk from './chipmunk.js';
import porch from './porch.js';
import shoo from './shoo.js';

// Game loop function
export { update };
function update(timeStamp) {
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
  Chipmunk.possiblyActivate(elapsed);
  for (const c of state.chipmunks) c.update(elapsed);
  porch.update(elapsed);
  state.mountainLion.update(elapsed);
  if (state.shooPosition) shoo();
  if (state.money.taken && !state.nActive) {
    ui.gameOver();
    return;
  }
  if (!state.paused) requestAnimationFrame(update);
}

ui.initialize();
