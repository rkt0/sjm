import {qs, qsa, ael, aelo} from './utility.js';

const config = {
  nChipmunks: 6,
  chipmunkRate: 1,
  chipmunkSpeed: 0.3,
  chipmunkFleeSpeed: 0.6,
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

function changeSection(from, to) {
  qs(`section.${from}`).style.display = 'none';
  qs(`section.${to}`).style.display = '';
  
}

const chipmunks = [];
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
    chipmunks.push(chipmunk);
  }
}
function activateChipmunk() {
  if (gameOver) return;
  const i = chipmunks.findIndex(c => ! c.active);
  if (i === -1) return;
  const c = chipmunks[i];
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

let shooPosition;
function shoo() {
  for (const c of chipmunks) {
    if (c.fleeing || ! c.active) continue;
    const shooVector = [0, 1].map(
      d => c.position[d] - shooPosition[d]
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
  shooPosition = null;
}

const fpsMeter = {count: 0, time: 0};
fpsMeter.element = qs('.fps-counter');

let oldTimeStamp, stopped, gameOver;
const time = {
  total: 0,
  element: qs('.gameplay .time-display'),
};
function update(timeStamp) {
  if (! oldTimeStamp) oldTimeStamp = timeStamp;
  const elapsed = (timeStamp - oldTimeStamp) / 1000;
  if (! gameOver) {
    time.total += elapsed;
    time.element.innerHTML = Math.trunc(time.total);
  }
  if (Math.random() < elapsed * config.chipmunkRate) {
    activateChipmunk();
  }
  let anyActive;
  for (const chipmunk of chipmunks) {
    if (! chipmunk.active) continue;
    anyActive = true;
    const {position, velocity} = chipmunk;
    const oldPosition = [...position];
    let cross = false;
    for (let d = 0; d < 2; d++) {
      position[d] += velocity[d] * elapsed;
      cross ||= position[d] * oldPosition[d] < 0;
    }
    if (cross && ! chipmunk.fleeing && ! gameOver) {
      const v = randomUnitVector();
      for (let d = 0; d < 2; d++) {
        position[d] = 0;
        velocity[d] = v[d] * config.chipmunkFleeSpeed;
      }
      chipmunk.element.classList.add('has-money');
      chipmunk.fleeing = true;
      gameOver = true;
    }
    if (gameOver && ! chipmunk.fleeing) {
      chaseChipmunk(chipmunk, angle(position));
    }
    placeChipmunk(chipmunk);
    chipmunk.active = Math.hypot(...position) < 1;
  }
  if (shooPosition) shoo();
  fpsMeter.count++;
  fpsMeter.time += elapsed;
  if (fpsMeter.time > 1) {
    fpsMeter.element.innerHTML = Math.round(
      fpsMeter.count / fpsMeter.time
    );
    fpsMeter.count = 0;
    fpsMeter.time = 0;
  }
  oldTimeStamp = timeStamp;
  if (gameOver && ! anyActive) {
    const gotd = qs('.game-over .time-display');
    gotd.innerHTML = time.element.innerHTML;
    changeSection('gameplay', 'game-over');
    return;
  }
  if (! stopped) requestAnimationFrame(update);
}

ael('button.pause', 'click', function() {
  this.innerHTML = stopped ? 'Pause' : 'Play';
  this.classList.toggle('play', ! stopped);
  stopped = ! stopped;
  oldTimeStamp = null;
  if (! stopped) requestAnimationFrame(update);
});
ael('div.gameplay', 'mousedown', e => {
  if (stopped || gameOver) return;
  const pxOffset = [e.offsetX, e.offsetY];
  shooPosition = pxOffset.map(
    u => (u - config.fieldSize / 2) / config.boundary
  );
});

initializeChipmunks();
requestAnimationFrame(update);
