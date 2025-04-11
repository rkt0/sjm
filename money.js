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
  imposeDrag(timeInterval) {
    if (!timeInterval) return;
    const speed = Math.hypot(...this.velocity);
    const absSpin = Math.abs(this.spin);
    if (!speed && !absSpin) return;
    const deltaSpeed = this.dragSpeed * timeInterval;
    if (deltaSpeed > speed) this.velocity = [0, 0];
    else {
      this.velocity = geometry.vMult(
        this.velocity,
        (speed - deltaSpeed) / speed,
      );
    }
    const deltaSpin = this.dragSpin * timeInterval;
    if (deltaSpin > absSpin) this.spin = 0;
    else this.spin *= (absSpin - deltaSpin) / absSpin;
  },
  update(timeInterval) {
    if (this.taken) return;
    const porchRatio = size.porch / 2 / size.boundary;
    const { position: p, velocity: v } = this;
    const delta = geometry.vMult(v, timeInterval);
    this.position = geometry.vSum(p, delta);
    const porchPadding = 0.05;
    const limit = porchRatio - porchPadding;
    this.position = this.position.map((u) =>
      Math.max(Math.min(u, limit), -limit)
    );
    this.angle += this.spin * timeInterval;
    this.place();
    this.imposeDrag(timeInterval);
  },
  knock(strength) {
    if (this.taken) return;
    const maxSpeed = 0.6;
    const speed = maxSpeed * strength;
    const deltaVelocity = geometry.vMult(
      geometry.randomUnitVector(),
      speed,
    );
    this.velocity = geometry.vSum(
      this.velocity,
      deltaVelocity,
    );
    const maxSpin = 3;
    const spinSign = Math.random() < 0.5 ? -1 : 1;
    this.spin += maxSpin * strength * spinSign;
    const stopTime = 1;
    this.dragSpeed = Math.hypot(...this.velocity) /
      stopTime;
    this.dragSpin = Math.abs(this.spin) / stopTime;
  },
};
