import {qs, qsa, ael, aelo} from './utility.js';

const [fSize, cSize] = ['field', 'chipmunk'].map(
  x => parseInt(
    getComputedStyle(qs(':root')).getPropertyValue(
      `--${x}-size`
    )
  )
);
const ratio = 1 - cSize / fSize;

const fpsMeter = {count: 0, time: 0};
fpsMeter.element = qs('.fps-counter');

const chipmunks = [];
for (let i = 0; i < 36; i++) {
  const element = document.createElement('div');
  element.id = `chipmunk-${i}`;
  element.classList.add('chipmunk');
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
  chipmunks.push({element, position, velocity});
}

let oldTimeStamp, stopped;
function update(timeStamp) {
  if (! oldTimeStamp) oldTimeStamp = timeStamp;
  const elapsed = (timeStamp - oldTimeStamp) / 1000;
  for (const chipmunk of chipmunks) {
    const {position, velocity} = chipmunk;
    const loc = [];
    for (let d = 0; d < 2; d++) {
      position[d] += velocity[d] * elapsed
      const overage = Math.abs(position[d]) - ratio;
      if (overage > 0) {
        velocity[d] *= -1;
        position[d] -=
            overage * 2 * Math.sign(position[d]);
      }
      loc[d] = position[d] / 2 * fSize;
    }
    const xf = `translate(${loc[0]}px, ${loc[1]}px)`;
    chipmunk.element.style.transform = xf;
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
