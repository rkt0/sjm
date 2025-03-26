import state from './state.js';
import ui from './ui.js';
import time from './time.js';
import Chipmunk from './chipmunk.js';
import porch from './porch.js';
import shoo from './shoo.js';

// Game loop function
export { update };
function update(timeStamp) {
  const elapsed = time.advance(timeStamp);
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
