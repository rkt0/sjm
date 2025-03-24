import { qs, qsa } from './utility.js';
import geometry from './geometry.js';
import config from './config.js';
import state from './state.js';

export default class Chipmunk {
  static gameplayDiv = qs('div.gameplay');
  static makeElement() {
    const element = document.createElement('div');
    element.classList.add('chipmunk');
    const img = document.createElement('img');
    img.src = 'img/chipmunk.png';
    element.append(img);
    return element;
  }
  static initialize() {
    state.chipmunks.length = 0;
    const oldElements = qsa('.gameplay .chipmunk');
    for (const e of oldElements) e.remove();
    for (let i = 0; i < config.nChipmunks; i++) {
      const chipmunk = new Chipmunk();
      state.chipmunks.push(chipmunk);
    }
  }
  static possiblyActivate(timeInterval) {
    if (state.money.taken) return;
    if (state.mountainLion.active) return;
    const t = state.time.total;
    if (state.nActive > t / 10) return;
    const rate = 0.1 + t * 0.03;
    let probability = rate * timeInterval;
    if (t > 2 && !state.nActive) probability = 1;
    if (Math.random() > probability) return;
    const c = state.chipmunks.find((c) => !c.active);
    c?.activate();
  }
  speed = config.chipmunkSpeed;
  fleeSpeed = config.chipmunkFleeSpeed;
  moneySpeed = config.chipmunkMoneySpeed;
  place() {
    const { boundary } = config;
    const { position, element, velocity } = this;
    const loc = position.map((u) => u * boundary);
    const xf = `translate(${loc[0]}px, ${loc[1]}px)`;
    element.style.transform = xf;
    const isMovingLeft = velocity[0] < 0;
    element.classList.toggle('flipped', isMovingLeft);
  }
  activate() {
    state.nActive++;
    this.active = true;
    this.fleeing = false;
    const vector = geometry.randomUnitSupNormVector();
    this.position = vector;
    this.velocity = vector.map(
      (u) => -u * this.speed / Math.hypot(...vector),
    );
    this.place();
  }
  chase(angle = 0) {
    const { hasMoney, fleeSpeed, moneySpeed } = this;
    const speed = hasMoney ? moneySpeed : fleeSpeed;
    this.velocity[0] = Math.cos(angle) * speed;
    this.velocity[1] = Math.sin(angle) * speed;
    this.fleeing = true;
  }
  // giveMoney() {
  //   const { moneySpeed, element } = this;
  //   const v = geometry.randomUnitVector();
  //   for (let d = 0; d < 2; d++) {
  //     this.position[d] = 0;
  //     this.velocity[d] = v[d] * moneySpeed;
  //   }
  //   element.append(state.money.element);
  //   this.fleeing = true;
  //   this.hasMoney = true;
  //   state.money.taken = true;
  // }
  constructor() {
    this.element = Chipmunk.makeElement();
    Chipmunk.gameplayDiv.append(this.element);
    this.position = [1, 0];
    this.velocity = [0, 0];
    this.active = false;
    this.fleeing = false;
    this.place();
  }
}
