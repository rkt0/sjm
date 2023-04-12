import {qs, qsa, ael, aelo} from './utility.js';

const [fSize, iSize] = ['field', 'item'].map(
  x => parseInt(
    getComputedStyle(qs(':root')).getPropertyValue(
      `--${x}-size`
    )
  )
);
const ratio = 1 - iSize / fSize;

// const gravity = 0.05;
// const bounce = 0.9;
const gravity = 0;
const bounce = 1;

const fpsMeter = {count: 0, time: 0};
fpsMeter.element = qs('.fps-counter');

const items = [];
for (let i = 0; i < 36; i++) {
  const element = document.createElement('div');
  element.id = `item-${i}`;
  element.classList.add('item');
  qs('div.gameplay').append(element);
  const position = [];
  for (let j = 0; j < 2; j++) {
    position.push((Math.random() * 2 - 1) * ratio);
  }
  const vAngle = Math.random() * Math.PI * 2;
  const vSpeed = Math.random() + 1;
  const velocity = [
    vSpeed * Math.cos(vAngle), 
    vSpeed * Math.sin(vAngle),
  ];
  items.push({element, position, velocity});
}

let oldTimeStamp, stopped;
function update(timeStamp) {
  if (! oldTimeStamp) oldTimeStamp = timeStamp;
  const elapsed = (timeStamp - oldTimeStamp) / 1000;
  for (const item of items) {
    const {position, velocity} = item;
    const loc = [];
    for (let d = 0; d < 2; d++) {
      position[d] += velocity[d] * elapsed
      const overage = Math.abs(position[d]) - ratio;
      if (overage > 0) {
        velocity[d] *= - bounce;
        position[d] -= overage * (1 + bounce) * 
            Math.sign(position[d]);
      }
      loc[d] = (position[d] + 1) / 2 * fSize;
    }
    velocity[1] += gravity;
    const e = item.element;
    e.style = `--x: ${loc[0]}px; --y: ${loc[1]}px;`
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

requestAnimationFrame(update);

ael('body', 'click', () => {
  stopped = ! stopped;
  oldTimeStamp = null;
  if (! stopped) requestAnimationFrame(update);
});
