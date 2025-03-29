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
    this.element.style.transform = null;
  },
  place() {
    const { position, element } = this;
    const p = position.map((u) => u * size.boundary);
    const xf = `translate(${p[0]}px, ${p[1]}px)`;
    element.style.transform = xf;
  },
  knock() {
    if (this.taken) return;
    const porchRatio = size.porch / 2 / size.boundary;
    const vector = geometry.randomUnitSupNormVector();
    this.position = vector.map((u) => u * porchRatio);
    this.place();
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
