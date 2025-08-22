import { qs, qsa } from './utility.js';
import geometry from './geometry.js';
import size from './size.js';
import time from './time.js';
import money from './money.js';

export default class Chipmunk {
  static totalNumber = 36;
  // speed = 10;
  // fleeSpeed = 10;
  // moneySpeed = 10;
  speed = 0.375;
  fleeSpeed = 1;
  moneySpeed = 0.625;

  static possiblyActivate(timeInterval, count) {
    if (money.taken) return;
    const t = time.total;
    if (this.nMoving() > t / 10) return;
    const rate = 0.1 + t * 0.03;
    let probability = rate * timeInterval;
    // if (t > 2 && !this.nMoving()) probability = 1;
    if (t > 0 && !this.nMoving()) probability = 1;
    if (Math.random() > probability) return;
    const pRich = this.richProbability(count);
    const c = this.pool.find((c) => !c.active());
    c?.activate(Math.random() < pRich);
  }
  static possiblyEmerge(timeInterval) {
    if (money.taken) return;
    const emergeRate = 0.5;
    const probability = emergeRate * timeInterval;
    for (const chipmunk of this.pool) {
      const available = chipmunk.hiding &&
        !geometry.supNorm(chipmunk.position);
      if (!available) continue;
      if (Math.random() > probability) continue;
      chipmunk.emerge();
    }
  }
  static richProbability(count) {
    return count >= 4 ? 0.5 : 0;
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
    const items = ['chipmunk', 'top-hat', 'monocle'];
    for (const item of items) {
      const img = document.createElement('img');
      img.src = `img/${item}.png`;
      if (item !== 'chipmunk') {
        img.classList.add('accessory');
      }
      element.append(img);
    }
    return element;
  }
  static initialize() {
    for (let i = 0; i < this.totalNumber; i++) {
      const chipmunk = new Chipmunk();
      this.pool.push(chipmunk);
    }
    for (const illustration of qsa('.illustration')) {
      const chipmunkElement = Chipmunk.makeElement();
      illustration.append(chipmunkElement);
    }
  }
  static start() {
    for (const chipmunk of this.pool) {
      chipmunk.reset();
    }
  }
  static porchBoundary =
    (size.porch + size.chipmunk) / 2;

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
  setRich(isRich) {
    this.rich = isRich;
    this.element.classList.toggle('rich', isRich);
  }
  activate(isRich) {
    this.reset();
    this.setRich(isRich);
    const vector = geometry.randomUnitSupNormVector();
    this.position = vector;
    this.setTarget(money.position);
    this.place();
  }
  active() {
    return geometry.supNorm(this.position) <= 1;
  }
  emerge() {
    this.hiding = false;
    this.emerging = true;
    const smartProbability = 0.5;
    let point = geometry.randomUnitSupNormVector();
    const m = geometry.supNorm(money.position);
    if (Math.random() < smartProbability && m) {
      point = geometry.vMult(money.position, 1 / m);
    }
    const p = Chipmunk.porchBoundary;
    this.setTarget(geometry.vMult(point, p));
  }
  adjustTarget() {
    if (this.emerging) return;
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
    this.atPorch = geometry.supNorm(this.position) <
      Chipmunk.porchBoundary / size.boundary;
    this.stayPorch ||= this.atPorch;
    const { stayPorch, atPorch } = this;
    if (stayPorch && !atPorch && !money.taken) {
      if (this.fleeing) {
        if (this.rich) return;
        const hideProbability = 0.5;
        if (Math.random() > hideProbability) {
          this.stayPorch = false;
          return;
        }
        this.fleeing = false;
        this.hiding = true;
        this.element.classList.add('under');
      } else if (this.emerging) {
        this.fleeing = false;
        this.emerging = false;
        this.element.classList.remove('under');
      }
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
  anglesAwayFrom(point = [0, 0]) {
    const v = geometry.vDiff(this.position, point);
    return geometry.halfCircle(geometry.angle(v));
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
    this.stayPorch = false;
    this.place();
    this.element.classList.remove('under');
  }

  constructor() {
    this.element = Chipmunk.makeElement();
    Chipmunk.field.append(this.element);
    this.reset();
  }
}
