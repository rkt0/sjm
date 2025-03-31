import { aelo, qs } from './utility.js';
import geometry from './geometry.js';
import size from './size.js';

export default {
  makeElement() {
    const element = document.createElement('div');
    element.classList.add('money', 'centered');
    element.innerHTML = '$35';
    return element;
  },
  initialize() {
    this.element = this.makeElement();
    qs('.illustration .chipmunk').append(
      this.makeElement(),
    );
  },
  start() {
    qs('.porch').append(this.element);
    this.center();
    this.taken = false;
    this.offPorch = false;
  },
  center() {
    this.position = [0, 0];
    this.velocity = [0, 0];
    this.angle = 0;
    this.spin = 0;
    this.element.style.transform = null;
  },
  place() {
    const { position, element } = this;
    const p = position.map((u) => u * size.boundary);
    const xl = `translate(${p[0]}px, ${p[1]}px)`;
    const rot = `rotate(${this.angle}turn)`;
    element.style.transform = `${xl} ${rot}`;
  },
  imposeDrag() {
    const dragSpeed = 0.001;
    const speed = Math.hypot(...this.velocity);
    if (dragSpeed > speed) this.velocity = [0, 0];
    else {
      this.velocity = geometry.vMult(
        this.velocity,
        (speed - dragSpeed) / speed,
      );
    }
    const dragSpin = 0.001;
    if (dragSpin > Math.abs(this.spin)) this.spin = 0;
    else this.spin -= dragSpin * Math.sign(this.spin);
  },
  update(timeInterval) {
    if (this.taken) return;
    const porchRatio = size.porch / 2 / size.boundary;
    const { position: p, velocity: v } = this;
    const delta = geometry.vMult(v, timeInterval);
    this.position = geometry.vSum(p, delta);
    this.position = this.position.map((u) =>
      Math.max(Math.min(u, porchRatio), -porchRatio)
    );
    this.angle += this.spin * timeInterval;
    this.place();
    this.imposeDrag();
  },
  knock() {
    if (this.taken) return;
    const vector = geometry.randomUnitVector();
    this.velocity = geometry.vMult(vector, 0.1);
    this.spin = Math.random() < 0.5 ? -0.1 : 0.1;
  },
};
