import { ael, aelo, qs, qsa } from './utility.js';
import geometry from './geometry.js';
import fpsMeter from './fps-meter.js';
import music from './music.js';
import config from './config.js';
import state from './state.js';
import Chipmunk from './chipmunk.js';

// Game flow functions
function changeSection(to) {
  const currentSection = qs('section.current');
  aelo(currentSection, 'transitionend', () => {
    qs(`section.${to}`).classList.add('current');
  });
  currentSection.classList.remove('current');
}
function startGame() {
  Chipmunk.initialize();
  initializeMountainLion();
  state.time.total = 0;
  state.time.element.innerHTML = 0;
  state.time.lastStamp = null;
  state.money.taken = false;
  state.shooPosition = null;
  state.porch.shakeTimer = 0;
  state.porch.disturbance = 0;
  state.porch.element.classList.remove('shaking');
  state.porch.element.append(state.money.element);
  changeSection('gameplay');
  aelo('section.gameplay', 'transitionend', () => {
    requestAnimationFrame(update);
  });
  if (!config.fpsMeterOn) return;
  fpsMeter.initialize('section.gameplay');
}

// Mountain lion functions
function initializeMountainLion() {
  const element = document.createElement('div');
  element.classList.add('mountain-lion');
  const img = document.createElement('img');
  img.src = 'img/mountain-lion.png';
  element.append(img);
  qs('div.gameplay').append(element);
  const ml = state.mountainLion;
  ml.element = element;
  const ratio = config.boundary / config.mlTrack;
  ml.velocity = config.mountainLionSpeed * ratio;
}
function activateMountainLion() {
  if (state.mountainLion.active) return;
  if (state.money.taken) return;
  for (const c of state.chipmunks) c.chase();
  state.nActive++;
  state.mountainLion.active = true;
  state.mountainLion.position = 0;
}
function placeMountainLion() {
  const loc = state.mountainLion.position *
    config.mlTrack;
  const xf = `translateX(${loc}px)`;
  state.mountainLion.element.style.transform = xf;
}
function giveMountainLionMoney() {
  if (state.money.taken) return;
  const ml = state.mountainLion;
  ml.element.append(state.money.element);
  state.money.taken = true;
}

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
      activateMountainLion();
    }
  }
}

// Game loop function
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
  if (state.mountainLion.active) {
    const ml = state.mountainLion;
    ml.position += ml.velocity * elapsed;
    placeMountainLion(ml.position);
    if (ml.position > 0.3) giveMountainLionMoney();
    ml.active = ml.position < 1;
    if (!ml.active) state.nActive--;
  }

  // Timekeeping
  if (config.fpsMeterOn) fpsMeter.tick(elapsed);
  state.time.lastStamp = timeStamp;

  // Check if game is over
  if (state.money.taken && !state.nActive) {
    const gotd = qs('.game-over .time-display');
    gotd.innerHTML = state.time.element.innerHTML;
    changeSection('game-over');
    return;
  }

  // Loop
  if (!state.paused) requestAnimationFrame(update);
}

// Determine appropriate event types
const eType = {};
{
  const touch = matchMedia('(hover: none)').matches;
  eType.front = touch ? 'touchend' : 'click';
  eType.button = touch ? 'touchstart' : 'click';
  eType.shoo = touch ? 'touchstart' : 'mousedown';
  if (touch) {
    for (const s of qsa('span.click-or-touch')) {
      const cap = s.innerHTML.trim().startsWith('C');
      s.innerHTML = cap ? 'Touch' : 'touch';
    }
  }
}

// Attach event listeners
aelo('section.front', eType.front, () => {
  changeSection('title');
  if (config.musicOn) music.start();
});
ael('.show-instructions', eType.button, () => {
  changeSection('instructions');
});
for (const button of qsa('button.start-game')) {
  ael(button, eType.button, startGame);
}
ael('.pause', eType.button, function () {
  this.innerHTML = state.paused ? 'Pause' : 'Play';
  state.paused = !state.paused;
  state.time.lastStamp = null;
  if (config.musicOn) {
    music.element[state.paused ? 'pause' : 'play']();
  }
  state.porch.element.classList.toggle(
    'paused',
    state.paused,
  );
  if (!state.paused) requestAnimationFrame(update);
});
ael('div.gameplay', eType.shoo, function (e) {
  if (state.paused) return;
  let pxOffset;
  if (eType.shoo === 'touchstart') {
    if (!config.fieldLocation) {
      const rect = this.getBoundingClientRect();
      config.fieldLocation = [rect.x, rect.y];
    }
    const t = e.changedTouches[0];
    const tLoc = [t.clientX, t.clientY];
    const fLoc = config.fieldLocation;
    pxOffset = [0, 1].map((u) => tLoc[u] - fLoc[u]);
  } else pxOffset = [e.offsetX, e.offsetY];
  state.shooPosition = pxOffset.map(
    (u) =>
      (u - config.fieldSize / 2) / config.boundary,
  );
});

// Make title screen chipmunk
{
  const chipmunk = Chipmunk.makeElement();
  const money = state.money.element.cloneNode(true);
  chipmunk.append(money);
  qs('.illustration').append(chipmunk);
}

// Override display property of section style
for (const section of qsa('section')) {
  section.style.display = 'flex';
}
