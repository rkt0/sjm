import geometry from './geometry.js';
import fpsMeter from './fps-meter.js';
import config from './config.js';
import state from './state.js';
import ui from './ui.js';
import Chipmunk from './chipmunk.js';
import mountainLion from './mountain-lion.js';

// Shoo function
function shoo() {
  // Skip if mountain lion is active
  if (state.mountainLion.active) return;

  // Compute values that do not depend on chipmunk
  const sPos = state.shooPosition;
  const pi = Math.PI;
  const onPorch = sPos.every(
    (u) => Math.abs(u) < config.porch,
  );

  // Handle each chipmunk
  for (const c of state.chipmunks) {
    // Skip if inactive
    if (!c.active) continue;

    // Compute values specific to chipmunk
    const cPos = c.position;
    const dPos = [0, 1].map((i) => cPos[i] - sPos[i]);
    const dNorm = Math.hypot(...dPos);

    // Skip if shoo is too far away
    if (dNorm > config.shooRadius) continue;

    // Skip if shoo is on wrong side of porch
    const csAngle = geometry.angleBetween(cPos, sPos);
    if (!onPorch && csAngle > pi / 2) continue;

    // Angles must be within π of each other
    let cAngle = geometry.angle(cPos);
    let dAngle = geometry.angle(dPos);
    if (dAngle - cAngle > pi) dAngle -= 2 * pi;
    if (cAngle - dAngle > pi) cAngle -= 2 * pi;

    // Chase chipmunk away from both origin and shoo
    const a0 = Math.max(cAngle, dAngle) - pi / 2;
    const a1 = Math.min(cAngle, dAngle) + pi / 2;
    c.chase(a0 + Math.random() * (a1 - a0));
  }

  // Reset shoo position
  state.shooPosition = null;

  // Porch and mountain lion
  if (onPorch && !state.money.taken) {
    const p = state.porch;
    p.element.classList.add('shaking');
    p.shakeTimer = config.porchShakeTime;
    p.disturbance += config.porchDisturbancePerShoo;
    if (p.disturbance > config.porchDisturbanceMax) {
      mountainLion.activate();
    }
  }
}

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
