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
    this.element.style.transform = null;
  },
  place() {
    const { position, element } = this;
    const p = position.map((u) => u * size.boundary);
    const xf = `translate(${p[0]}px, ${p[1]}px)`;
    element.style.transform = xf;
  },
  update(timeInterval) {
    if (this.taken) return;
    const dragEffect = 0.001;
    const porchRatio = size.porch / 2 / size.boundary;
    const { position: p, velocity: v } = this;
    const delta = geometry.vMult(v, timeInterval);
    this.position = geometry.vSum(p, delta);
    this.position = this.position.map((u) =>
      Math.max(Math.min(u, porchRatio), -porchRatio)
    );
    this.place();
    const speed = Math.hypot(...v);
    if (dragEffect > speed) this.velocity = [0, 0];
    else {
      const speedRatio = (speed - dragEffect) / speed;
      this.velocity = geometry.vMult(v, speedRatio);
    }
  },
  knock() {
    if (this.taken) return;
    const vector = geometry.randomUnitVector();
    this.velocity = geometry.vMult(vector, 0.1);
  },
  spin() {
    const { classList } = this.element;
    if (classList.contains('spinning')) return;
    classList.add('spinning');
    aelo(this.element, 'animationend', () => {
      classList.remove('spinning');
    });
  },
};
