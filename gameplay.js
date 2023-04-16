import {qs, qsa, ael, aelo} from './utility.js';
import {fpsMeter} from './fps-meter.js';

const config = {
  nChipmunks: 6,
  chipmunkRate: 1,
  chipmunkSpeed: 0.5,
  chipmunkFleeSpeed: 1,
};

// Get field and chipmunk sizes from CSS
{
  const [f, c] = ['field', 'chipmunk'].map(
    x => parseInt(
      getComputedStyle(qs(':root')).getPropertyValue(
        `--${x}-size`
      )
    )
  );
  config.fieldSize = f;
  config.chipmunkSize = c;
}

// Distance at which chipmunks are considered "gone"
config.boundary = Math.SQRT1_2 * (
  config.fieldSize + config.chipmunkSize
);

// Generate random unit vector
function randomUnitVector() {
  const theta = Math.random() * 2 * Math.PI;
  return [Math.cos(theta), Math.sin(theta)];
}

// Get angle of vector from 0 to 2π
function angle(vector) {
  const s = Math.atan2(vector[1], vector[0]);
  return s < 0 ? s + 2 * Math.PI : s;
}

// Global object for gameplay state
const state = {
  chipmunks: [],
  shooPosition: null,
  time: {
    total: 0,
    element: qs('.gameplay .time-display'),
    lastStamp: null,
  },
  paused: false,
  gameOver: false,
};

function changeSection(to) {
  qs('section.current').classList.remove('current');
  qs(`section.${to}`).classList.add('current');
}

function placeChipmunk(chipmunk) {
  const loc = chipmunk.position.map(
    u => u * config.boundary
  );
  const xf = `translate(${loc[0]}px, ${loc[1]}px)`;
  chipmunk.element.style.transform = xf;
}
function initializeChipmunks() {
  for (let i = 0; i < config.nChipmunks; i++) {
    const element = document.createElement('div');
    element.classList.add('chipmunk');
    qs('div.gameplay').append(element);
    const chipmunk = {element};
    chipmunk.position = [1, 0];
    chipmunk.velocity = [0, 0];
    chipmunk.active = false;
    chipmunk.fleeing = false;
    placeChipmunk(chipmunk);
    state.chipmunks.push(chipmunk);
  }
}
function activateChipmunk() {
  if (state.gameOver) return;
  const c = state.chipmunks.find(c => ! c.active);
  if (! c) return;
  c.active = true;
  c.fleeing = false;
  c.position = randomUnitVector();
  c.velocity = c.position.map(
    u => -u * config.chipmunkSpeed
  );
  placeChipmunk(c);
}
function chaseChipmunk(chipmunk, angle) {
  const speed = config.chipmunkFleeSpeed;
  chipmunk.velocity[0] = Math.cos(angle) * speed;
  chipmunk.velocity[1] = Math.sin(angle) * speed;
  chipmunk.fleeing = true;
}

function shoo() {
  for (const c of state.chipmunks) {
    if (c.fleeing || ! c.active) continue;
    const shooVector = [0, 1].map(
      d => c.position[d] - state.shooPosition[d]
    );
    let sAngle = angle(shooVector);
    let pAngle = angle(c.position);
    const pi = Math.PI
    if (sAngle - pAngle > pi) sAngle -= 2 * pi;
    if (pAngle - sAngle > pi) pAngle -= 2 * pi;
    chaseChipmunk(
      c, sAngle + Math.random() * (pAngle - sAngle)
    );
  }
  state.shooPosition = null;
}

function startGame() {
  fpsMeter.initialize('section.gameplay');
  state.chipmunks.length = 0;
  for (const c of qsa('.chipmunk')) c.remove();
  initializeChipmunks();
  state.time.total = 0;
  state.time.element.innerHTML = 0;
  state.time.lastStamp = null;
  state.gameOver = false;
  changeSection('gameplay');
  requestAnimationFrame(update);
}

function update(timeStamp) {
  state.time.lastStamp ??= timeStamp;
  const elapsed = 0.001 * (
    timeStamp - state.time.lastStamp
  );
  if (! state.gameOver) {
    state.time.total += elapsed;
    const nSeconds = Math.trunc(state.time.total)
    state.time.element.innerHTML = nSeconds;
  }
  if (Math.random() < elapsed * config.chipmunkRate) {
    activateChipmunk();
  }
  let anyActive;
  for (const c of state.chipmunks) {
    if (! c.active) continue;
    anyActive = true;
    const {position, velocity} = c;
    const oldPosition = [...position];
    let cross = false;
    for (let d = 0; d < 2; d++) {
      position[d] += velocity[d] * elapsed;
      cross ||= position[d] * oldPosition[d] < 0;
    }
    if (cross && ! c.fleeing && ! state.gameOver) {
      const v = randomUnitVector();
      for (let d = 0; d < 2; d++) {
        position[d] = 0;
        velocity[d] = v[d] * config.chipmunkFleeSpeed;
      }
      c.element.classList.add('has-money');
      c.fleeing = true;
      state.gameOver = true;
    }
    if (state.gameOver && ! c.fleeing) {
      chaseChipmunk(c, angle(position));
    }
    placeChipmunk(c);
    c.active = Math.hypot(...position) < 1;
  }
  if (state.shooPosition) shoo();
  fpsMeter.tick(elapsed);
  state.time.lastStamp = timeStamp;
  if (state.gameOver && ! anyActive) {
    const gotd = qs('.game-over .time-display');
    gotd.innerHTML = state.time.element.innerHTML;
    changeSection('game-over');
    return;
  }
  if (! state.paused) requestAnimationFrame(update);
}

ael('button.pause', 'click', function() {
  this.innerHTML = state.paused ? 'Pause' : 'Play';
  this.classList.toggle('play', ! state.paused);
  state.paused = ! state.paused;
  state.time.lastStamp = null;
  if (! state.paused) requestAnimationFrame(update);
});
ael('div.gameplay', 'mousedown', e => {
  if (state.paused || state.gameOver) return;
  const pxOffset = [e.offsetX, e.offsetY];
  state.shooPosition = pxOffset.map(
    u => (u - config.fieldSize / 2) / config.boundary
  );
});
for (const button of qsa('button.start-game')) {
  ael(button, 'click', startGame);
}
ael('button.show-instructions', 'click', () => {
  changeSection('instructions');
});
aelo('section.front', 'click', () => {
  changeSection('title');
});
