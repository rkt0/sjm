import fpsMeter from './fps-meter.js';
import config from './config.js';
import state from './state.js';
import ui from './ui.js';
import Chipmunk from './chipmunk.js';
import shoo from './shoo.js';

// Game loop function
export { update };
function update(timeStamp) {
  // Timekeeping
  state.time.lastStamp ??= timeStamp;
  const elapsed = 0.001 * (
    timeStamp - state.time.lastStamp
  );
  state.time.total += elapsed;
  state.time.element.innerHTML = Math.trunc(
    state.time.total,
  );

  // Deal with chipmunks
  Chipmunk.possiblyActivate(elapsed);
  for (const c of state.chipmunks) c.update(elapsed);

  // Decrease porch timers
  {
    const p = state.porch;
    p.shakeTimer -= elapsed;
    if (p.shakeTimer < 0) {
      p.shakeTimer = 0;
      p.element.classList.remove('shaking');
    }
    p.disturbance -= elapsed;
    if (p.disturbance < 0) p.disturbance = 0;
  }

  // Shoo chipmunks
  if (state.shooPosition) shoo();

  // Mountain lion
  state.mountainLion.update(elapsed);

  // Timekeeping
  if (config.fpsMeterOn) fpsMeter.tick(elapsed);
  state.time.lastStamp = timeStamp;

  // Check if game is over
  if (state.money.taken && !state.nActive) {
    ui.gameOver();
    return;
  }

  // Loop
  if (!state.paused) requestAnimationFrame(update);
}

// Final actions
ui.setEventTypes();
ui.attachListeners();
ui.makeTitleScreen();
ui.setDisplayToFlex();
