import { qs } from './utility.js';
import config from './config.js';
import state from './state.js';

export default {
  active: false,
  track: config.mlTrack,
  speed: config.mountainLionSpeed,
  initialize() {
    const element = document.createElement('div');
    element.classList.add('mountain-lion');
    const img = document.createElement('img');
    img.src = 'img/mountain-lion.png';
    element.append(img);
    qs('div.gameplay').append(element);
    this.element = element;
    const { speed, track } = this;
    this.velocity = config.boundary * speed / track;
    state.mountainLion = this;
  },
  place() {
    const { element, position, track } = this;
    const x = position * track;
    element.style.transform = `translateX(${x}px)`;
  },
  activate() {
    if (this.active || state.money.taken) return;
    this.active = true;
    this.position = 0;
    state.nActive++;
    for (const c of state.chipmunks) c.chase();
  },
  takeMoney() {
    if (state.money.taken) return;
    this.element.append(state.money.element);
    state.money.taken = true;
  },
};
