import { qs } from './utility.js';
import geometry from './geometry.js';
import size from './size.js';
import time from './time.js';
import money from './money.js';

export default class Chipmunk {
  static totalNumber = 36;
  speed = 0.375;
  fleeSpeed = 1;
  moneySpeed = 0.625;

  static possiblyActivate(timeInterval) {
    if (money.taken) return;
    const t = time.total;
    if (this.nActive() > t / 10) return;
    const rate = 0.1 + t * 0.03;
    let probability = rate * timeInterval;
    if (t > 2 && !this.nActive()) probability = 1;
    if (Math.random() > probability) return;
    const c = this.pool.find((c) => !c.active());
    c?.activate();
  }
  static pool = [];
  static nActive() {
    return this.pool.filter((c) => c.active()).length;
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
    for (let i = 0; i < this.totalNumber; i++) {
      const chipmunk = new Chipmunk();
      this.pool.push(chipmunk);
    }
    const element = Chipmunk.makeElement();
    qs('.illustration').append(element);
  }
  static start() {
    for (const chipmunk of this.pool) {
      chipmunk.reset();
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
  setTarget(targetPosition) {
    if (!targetPosition) {
      this.target = null;
      return;
    }
    this.target = [...targetPosition];
    this.velocity = geometry.vMult(
      geometry.direction(this.position, this.target),
      this.speed,
    );
  }
  activate() {
    this.fleeing = false;
    const vector = geometry.randomUnitSupNormVector();
    this.position = vector;
    this.setTarget(money.position);
    this.place();
  }
  active() {
    return geometry.supNorm(this.position) <= 1;
  }
  update(timeInterval) {
    if (!this.active()) return;
    if (this.fleeing) this.setTarget(null);
    else this.setTarget(money.position);
    const { position: p, velocity: v, target } = this;
    const delta = geometry.vMult(v, timeInterval);
    this.position = geometry.vSum(p, delta);
    if (target) {
      const distance = geometry.distance(p, target);
      if (Math.hypot(...delta) > distance) {
        this.position = target;
      }
    }
    const atMoney = geometry.vEqual(
      this.position,
      money.position,
    );
    if (!this.fleeing) {
      if (money.taken) {
        this.chase(geometry.angle(this.position));
      } else if (atMoney) this.takeMoney();
    }
    this.place();
  }
  chase(angle = 0) {
    const { hasMoney, fleeSpeed, moneySpeed } = this;
    const speed = hasMoney ? moneySpeed : fleeSpeed;
    this.velocity[0] = Math.cos(angle) * speed;
    this.velocity[1] = Math.sin(angle) * speed;
    this.fleeing = true;
  }
  takeMoney() {
    this.velocity = geometry.vMult(
      geometry.randomUnitVector(),
      this.moneySpeed,
    );
    this.element.append(money.element);
    this.fleeing = true;
    this.hasMoney = true;
    money.taken = true;
    money.center();
  }
  reset() {
    this.position = [2, 0];
    this.velocity = [0, 0];
    this.fleeing = false;
    this.place();
  }

  constructor() {
    this.element = Chipmunk.makeElement();
    Chipmunk.field.append(this.element);
    this.reset();
  }
}
