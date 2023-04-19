import {qs, qsa, ael, aelo} from './utility.js';
import {geometry} from './geometry.js';
import {fpsMeter} from './fps-meter.js';

const config = {
  nChipmunks: 6,
  chipmunkRate: 1,
  chipmunkSpeed: 0.3,
  chipmunkFleeSpeed: 0.6,
  shooRadius: 0.3,
};

// Get field and chipmunk sizes from CSS
{
  function cssInt(property, selector = ':root') {
    const s = getComputedStyle(qs(selector));
    return parseInt(s.getPropertyValue(property));
  }
  const fieldSize = cssInt('--field-size');
  const chipmunkSize = cssInt('--chipmunk-size');
  const porchSize = cssInt('width', '.porch');
  config.fieldSize = fieldSize;
  config.boundary = (fieldSize + chipmunkSize) / 2;
  config.porch = porchSize / 2 / config.boundary;
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
  money: {
    taken: false,
    element: qs('.money')
  },
  porchShoos: 0,
};

// Game flow functions
function changeSection(to) {
  qs('section.current').classList.remove('current');
  qs(`section.${to}`).classList.add('current');
}
function startGame() {
  fpsMeter.initialize('section.gameplay');
  state.chipmunks.length = 0;
  for (const c of qsa('.chipmunk')) c.remove();
  initializeChipmunks();
  state.time.total = 0;
  state.time.element.innerHTML = 0;
  state.time.lastStamp = null;
  state.money.taken = false;
  qs('.porch').append(state.money.element);
  changeSection('gameplay');
  requestAnimationFrame(update);
}

// Chipmunk functions
function placeChipmunk(chipmunk) {
  const loc = chipmunk.position.map(
    u => u * config.boundary
  );
  const xf = `translate(${loc[0]}px, ${loc[1]}px)`;
  chipmunk.element.style.transform = xf;
  chipmunk.element.classList.toggle(
    'flipped', chipmunk.velocity[0] < 0
  );
}
function initializeChipmunks() {
  for (let i = 0; i < config.nChipmunks; i++) {
    const element = document.createElement('div');
    element.classList.add('chipmunk');
    const img = document.createElement('img');
    img.src = 'img/chipmunk.png';
    element.append(img);
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
  if (state.chipmunks.some(c => c.active)) return;
  if (state.money.taken) return;
  const c = state.chipmunks.find(c => ! c.active);
  if (! c) return;
  c.active = true;
  c.fleeing = false;
  c.position = geometry.randomUnitSupNormVector();
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
function giveChipmunkMoney(chipmunk) {
  const v = geometry.randomUnitVector();
  for (let d = 0; d < 2; d++) {
    chipmunk.position[d] = 0;
    chipmunk.velocity[d] =
        v[d] * config.chipmunkFleeSpeed;
  }
  chipmunk.element.append(state.money.element);
  chipmunk.fleeing = true;
  state.money.taken = true;
}
function shoo() {

  // Compute values that do not depend on chipmunk
  const sPos = state.shooPosition;
  const sAngle = geometry.angle(sPos);
  const pi = Math.PI;
  const onPorch = sPos.every(
    u => Math.abs(u) < config.porch
  );
  if (onPorch) state.porchShoos++;

  // Handle each chipmunk
  for (const c of state.chipmunks) {

    // Skip if inactive
    if (! c.active) continue;

    // Compute values specific to chipmunk
    const cPos = c.position;
    const dPos = [0, 1].map(i => cPos[i] - sPos[i]);
    const dNorm = Math.hypot(...dPos);

    // Skip if shoo is too far away
    if (dNorm > config.shooRadius) continue;

    // Skip if shoo is on wrong side of porch
    const csAngle = geometry.angleBetween(cPos, sPos);
    if (! onPorch && csAngle > pi / 2) continue;

    // Angles must be within π of each other
    let cAngle = geometry.angle(cPos);
    let dAngle = geometry.angle(dPos);
    if (dAngle - cAngle > pi) dAngle -= 2 * pi;
    if (cAngle - dAngle > pi) cAngle -= 2 * pi;
    
    // Chase chipmunk away from both origin and shoo
    const a0 = Math.max(cAngle, dAngle) - pi / 2;
    const a1 = Math.min(cAngle, dAngle) + pi / 2;
    chaseChipmunk(c, a0 + Math.random() * (a1 - a0));

  }
  
  // Reset shoo position
  state.shooPosition = null;
  
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
    state.time.total
  );
  
  // Possibly activate a chipmunk
  if (Math.random() < elapsed * config.chipmunkRate) {
    activateChipmunk();
  }
  
  // Deal with each chipmunk
  let anyActive;
  for (const c of state.chipmunks) {
    
    // Skip if inactive
    if (! c.active) continue;
    anyActive = true;
    
    // Position and velocity
    const {position, velocity} = c;
    const oldPosition = [...position];
    
    // Adjust chipmunk position 
    // while checking if it crosses origin (money)
    let cross = false;
    for (let d = 0; d < 2; d++) {
      position[d] += velocity[d] * elapsed;
      cross ||= position[d] * oldPosition[d] < 0;
    }
    if (cross && ! c.fleeing && ! state.money.taken) {
      giveChipmunkMoney(c);
    }
    
    // All chipmunks flee once money is taken
    if (! c.fleeing && state.money.taken) {
      chaseChipmunk(c, geometry.angle(position));
    }
    
    // Place chipmunk; deactivate if out of bounds
    placeChipmunk(c);
    c.active = position.every(u => Math.abs(u) < 1);

  }

  // Shoo chipmunks
  if (state.shooPosition) shoo();
  
  // Timekeeping
  fpsMeter.tick(elapsed);
  state.time.lastStamp = timeStamp;

  // Check if game is over
  if (state.money.taken && ! anyActive) {
    const gotd = qs('.game-over .time-display');
    gotd.innerHTML = state.time.element.innerHTML;
    changeSection('game-over');
    return;
  }
  
  // Loop
  if (! state.paused) requestAnimationFrame(update);

}

// Attach event listeners
aelo('section.front', 'click', () => {
  changeSection('title');
});
ael('button.show-instructions', 'click', () => {
  changeSection('instructions');
});
for (const button of qsa('button.start-game')) {
  ael(button, 'click', startGame);
}
ael('button.pause', 'click', function() {
  this.innerHTML = state.paused ? 'Pause' : 'Play';
  this.classList.toggle('play', ! state.paused);
  state.paused = ! state.paused;
  state.time.lastStamp = null;
  if (! state.paused) requestAnimationFrame(update);
});
ael('div.gameplay', 'mousedown', e => {
  if (state.paused) return;
  const pxOffset = [e.offsetX, e.offsetY];
  state.shooPosition = pxOffset.map(
    u => (u - config.fieldSize / 2) / config.boundary
  );
});
