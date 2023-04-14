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
function randUnitVector() {
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
    placeChipmunk(chipmunk);
    chipmunks.push(chipmunk);
  }
}
function activateChipmunk() {
  const i = chipmunks.findIndex(c => ! c.active);
  if (i === -1) {
    console.log('out of chipmunks'); return;
  }
  const chipmunk = chipmunks[i];
  chipmunk.active = true;
  chipmunk.position = randUnitVector();
  chipmunk.velocity = chipmunk.position.map(u => -u);
  placeChipmunk(chipmunk);
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
    for (let d = 0; d < 2; d++) {
      position[d] += velocity[d] * elapsed;
    }
    placeChipmunk(chipmunk);
    chipmunk.active = Math.hypot(...position) < 1;
  }
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

ael('body', 'click', () => {
  stopped = ! stopped;
  oldTimeStamp = null;
  if (! stopped) requestAnimationFrame(update);
});

initializeChipmunks();
requestAnimationFrame(update);
