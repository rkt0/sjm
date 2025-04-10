import { qs } from './utility.js';
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
  maxVelocity: 0.2,
  maxSpin: 1,
  stopTime: 1,
  imposeDrag(timeInterval) {
    if (!timeInterval) return;
    const { maxVelocity, maxSpin, stopTime } = this;
    const dragSpeed = maxVelocity / stopTime *
      timeInterval;
    const speed = Math.hypot(...this.velocity);
    if (dragSpeed > speed) this.velocity = [0, 0];
    else {
      this.velocity = geometry.vMult(
        this.velocity,
        (speed - dragSpeed) / speed,
      );
    }
    const dragSpin = maxSpin / stopTime *
      timeInterval;
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
    this.imposeDrag(timeInterval);
  },
  knock() {
    if (this.taken) return;
    this.velocity = geometry.vMult(
      geometry.randomUnitVector(),
      this.maxVelocity,
    );
    this.spin = this.maxSpin;
    this.spin *= Math.random() < 0.5 ? -1 : 1;
  },
};
