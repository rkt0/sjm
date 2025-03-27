import { qs } from './utility.js';
import size from './size.js';
import Chipmunk from './chipmunk.js';
import money from './money.js';

export default {
  speed: 0.75,
  active: false,
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
  },
  place() {
    const { element, position, path } = this;
    const x = position * path;
    element.style.transform = `translateX(${x}px)`;
  },
  activate() {
    if (this.active || money.taken) return;
    this.active = true;
    this.position = 0;
    for (const c of Chipmunk.pool) c.chase();
  },
  takeMoney() {
    if (money.taken) return;
    this.element.append(money.element);
    money.taken = true;
  },
  update(timeInterval) {
    if (!this.active) return;
    this.position += this.velocity * timeInterval;
    this.place();
    if (this.position > 0.3) this.takeMoney();
    this.active = this.position < 1;
  },
};
