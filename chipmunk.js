import { qs, qsa } from './utility.js';
import geometry from './geometry.js';
import size from './size.js';
import time from './time.js';
import mountainLion from './mountain-lion.js';
import money from './money.js';

export default class Chipmunk {
  static totalNumber = 36;
  speed = 0.375;
  fleeSpeed = 1;
  moneySpeed = 0.625;

  static possiblyActivate(timeInterval) {
    if (money.taken) return;
    if (mountainLion.active) return;
    const t = time.total;
    if (this.nActive() > t / 10) return;
    const rate = 0.1 + t * 0.03;
    let probability = rate * timeInterval;
    if (t > 2 && !this.nActive()) probability = 1;
    if (Math.random() > probability) return;
    const c = this.pool.find((c) => !c.active);
    c?.activate();
  }
  static pool = [];
  static nActive() {
    return this.pool.filter(c => c.active).length;
  }
  static field = qs('.field');
  static makeElement() {
    const element = document.createElement('div');
    element.classList.add('chipmunk');
    const img = document.createElement('img');
    img.src = 'img/chipmunk.png';
    element.append(img);
    return element;
  }
  static initialize() {
    this.pool.length = 0;
    const oldElements = qsa('.chipmunk', this.field);
    for (const e of oldElements) e.remove();
    for (let i = 0; i < this.totalNumber; i++) {
      const chipmunk = new Chipmunk();
      this.pool.push(chipmunk);
    }
  }

  place() {
    const { position, element, velocity } = this;
    const p = position.map((u) => u * size.boundary);
    const xf = `translate(${p[0]}px, ${p[1]}px)`;
    element.style.transform = xf;
    const isMovingLeft = velocity[0] < 0;
    element.classList.toggle('flipped', isMovingLeft);
  }
  activate() {
    this.active = true;
    this.fleeing = false;
    const vector = geometry.randomUnitSupNormVector();
    this.position = vector;
    this.velocity = vector.map(
      (u) => -u * this.speed / Math.hypot(...vector),
    );
    this.place();
  }
  update(timeInterval) {
    if (!this.active) return;
    const { position: p, velocity: v } = this;
    const pOld = [...p];
    const delta = v.map((x) => x * timeInterval);
    for (let d = 0; d < 2; d++) p[d] += delta[d];
    const atGoal = p.some((e, i) => e * pOld[i] < 0);
    if (!this.fleeing) {
      if (money.taken) {
        this.chase(geometry.angle(p));
      } else if (atGoal) this.takeMoney();
    }
    this.place();
    this.active = p.every((u) => Math.abs(u) < 1);
  }
  chase(angle = 0) {
    const { hasMoney, fleeSpeed, moneySpeed } = this;
    const speed = hasMoney ? moneySpeed : fleeSpeed;
    this.velocity[0] = Math.cos(angle) * speed;
    this.velocity[1] = Math.sin(angle) * speed;
    this.fleeing = true;
  }
  takeMoney() {
    const { moneySpeed, element } = this;
    const v = geometry.randomUnitVector();
    for (let d = 0; d < 2; d++) {
      this.position[d] = 0;
      this.velocity[d] = v[d] * moneySpeed;
    }
    element.append(money.element);
    this.fleeing = true;
    this.hasMoney = true;
    money.taken = true;
  }

  constructor() {
    this.element = Chipmunk.makeElement();
    Chipmunk.field.append(this.element);
    this.position = [1, 0];
    this.velocity = [0, 0];
    this.active = false;
    this.fleeing = false;
    this.place();
  }
}
