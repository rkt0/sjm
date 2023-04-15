import {qs, qsa, ael, aelo} from './utility.js';

const config = {
  nChipmunks: 6,
  chipmunkRate: 1,
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
  const angle = Math.random() * 2 * Math.PI;
  return [Math.cos(angle), Math.sin(angle)];
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
  const i = chipmunks.findIndex(c => ! c.active);
  if (i === -1) return;
  const c = chipmunks[i];
  c.active = true;
  c.fleeing = false;
  c.position = randomUnitVector();
  c.velocity = c.position.map(u => u / -3);
  placeChipmunk(c);
}

let shooPosition;
function shoo() {
  for (const c of chipmunks) {
    if (c.fleeing || ! c.active) continue;
    for (let d = 0; d < 2; d++) c.velocity[d] *= -1;
    c.fleeing = true;
  }
  shooPosition = null;
}

const fpsMeter = {count: 0, time: 0};
fpsMeter.element = qs('.fps-counter');

let oldTimeStamp, stopped;
function update(timeStamp) {
  if (! oldTimeStamp) oldTimeStamp = timeStamp;
  const elapsed = (timeStamp - oldTimeStamp) / 1000;
  if (Math.random() < elapsed * config.chipmunkRate) {
    activateChipmunk();
  }
  for (const chipmunk of chipmunks) {
    if (! chipmunk.active) continue;
    const {position, velocity} = chipmunk;
    const oldPosition = [...position];
    let cross = false;
    for (let d = 0; d < 2; d++) {
      position[d] += velocity[d] * elapsed;
      cross ||= position[d] * oldPosition[d] < 0;
    }
    if (cross) {
      const v = randomUnitVector();
      for (let d = 0; d < 2; d++) {
        position[d] = 0;
        velocity[d] = v[d];
      }
      chipmunk.element.classList.add('has-money');
      chipmunk.fleeing = true;
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
  if (! stopped) requestAnimationFrame(update);
}

ael('.fps-counter', 'click', () => {
  stopped = ! stopped;
  oldTimeStamp = null;
  if (! stopped) requestAnimationFrame(update);
});
ael('div.gameplay', 'mousedown', e => {
  const pxOffset = [e.offsetX, e.offsetY];
  shooPosition = pxOffset.map(
    u => (u - config.fieldSize / 2) / config.boundary
  );
});

initializeChipmunks();
requestAnimationFrame(update);
