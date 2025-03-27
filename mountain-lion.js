import { qs } from './utility.js';
import state from './state.js';
import size from './size.js';

export default {
  speed: 0.75,
  initialize() {
    if (this.element) this.element.remove();
    const element = document.createElement('div');
    element.classList.add('mountain-lion');
    const img = document.createElement('img');
    img.src = 'img/mountain-lion.png';
    element.append(img);
    qs('.field').append(element);
    this.element = element;
    this.active = false;
    const path = size.field + size.mountainLion;
    this.path = path;
    this.velocity = size.boundary * this.speed / path;
    state.mountainLion = this;
  },
  place() {
    const { element, position, path } = this;
    const x = position * path;
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
  update(timeInterval) {
    if (!this.active) return;
    this.position += this.velocity * timeInterval;
    this.place();
    if (this.position > 0.3) this.takeMoney();
    this.active = this.position < 1;
    if (!this.active) state.nActive--;
  },
};
