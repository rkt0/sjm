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
    if (this.nMoving() > t / 10) return;
    const rate = 0.1 + t * 0.03;
    let probability = rate * timeInterval;
    if (t > 2 && !this.nMoving()) probability = 1;
    if (Math.random() > probability) return;
    const c = this.pool.find((c) => !c.active());
    c?.activate();
  }
  static pool = [];
  static nMoving() {
    return this.pool.filter((chipmunk) =>
      chipmunk.active() &&
      geometry.supNorm(chipmunk.velocity)
    ).length;
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
    if (geometry.vEqual(this.position, this.target)) {
      this.velocity = [0, 0];
      return;
    }
    this.velocity = geometry.vMult(
      geometry.direction(this.position, this.target),
      this.speed,
    );
  }
  activate() {
    this.reset();
    const vector = geometry.randomUnitSupNormVector();
    this.position = vector;
    this.setTarget(money.position);
    this.place();
  }
  active() {
    return geometry.supNorm(this.position) <= 1;
  }
  adjustTarget() {
    if (this.fleeing) this.setTarget(null);
    else if (this.hiding) this.setTarget([0, 0]);
    else this.setTarget(money.position);
  }
  move(timeInterval) {
    const delta = geometry.vMult(
      this.velocity,
      timeInterval,
    );
    this.position = geometry.vSum(
      this.position,
      delta,
    );
    if (this.target) {
      const distance = geometry.distance(
        this.position,
        this.target,
      );
      if (Math.hypot(...delta) > distance) {
        this.position = [...this.target];
        this.target = null;
      }
    }
  }
  checkPorch() {
    const porchBoundary =
      (size.porch + size.chipmunk) / 2;
    this.atPorch = geometry.supNorm(this.position) <
      porchBoundary / size.boundary;
    this.reachedPorch ||= this.atPorch;
    const { reachedPorch, atPorch } = this;
    if (reachedPorch && !atPorch && !money.taken) {
      if (this.fleeing) {
        this.hiding = true;
        this.element.classList.add('under');
      } else if (this.emerging) this.emerging = false;
      this.fleeing = false;
    }
  }
  checkMoney() {
    if (this.fleeing) return;
    const atMoney = geometry.vEqual(
      this.position,
      money.position,
    );
    const canTake = !this.hiding && !this.emerging;
    if (money.taken) {
      const origin = !geometry.supNorm(this.position);
      let angle = geometry.angle(this.position);
      if (origin) angle = Math.random() * 2 * Math.PI;
      this.chase(angle);
    } else if (atMoney && canTake) this.takeMoney();
  }
  update(timeInterval) {
    if (!this.active()) return;
    this.adjustTarget();
    this.move(timeInterval);
    this.checkPorch();
    this.checkMoney();
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
    this.hiding = false;
    this.emerging = false;
    this.atPorch = false;
    this.place();
    this.element.classList.remove('under');
  }

  constructor() {
    this.element = Chipmunk.makeElement();
    Chipmunk.field.append(this.element);
    this.reset();
  }
}
