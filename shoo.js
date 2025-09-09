import { ael, qs } from './utility.js';
import geometry from './geometry.js';
import ui from './ui.js';
import size from './size.js';
import Chipmunk from './chipmunk.js';
import money from './money.js';
import score from './score.js';

export default {
  radiusChipmunk: 0.375,
  radiusMoney: 0.2,
  pHide: 0.5,
  setPosition(event) {
    if (!event) {
      this.position = null;
      return;
    }
    let pxOffset = [event.offsetX, event.offsetY];
    if (ui.eventType === 'touchstart') {
      const t = event.changedTouches[0];
      const tLoc = [t.clientX, t.clientY];
      const fLoc = this.fieldLocation;
      pxOffset = [0, 1].map((u) => tLoc[u] - fLoc[u]);
    }
    this.position = pxOffset.map(
      (u) => (u - size.field / 2) / size.boundary,
    );
  },
  handleMoney() {
    const s = this.position;
    const m = money.position;
    const d = Math.hypot(...geometry.vDiff(m, s));
    const strength = 1 - d / this.radiusMoney;
    if (strength > 0) money.knock(strength);
  },
  handleChipmunk(chipmunk) {
    if (!chipmunk.active()) return;
    const { hiding, emerging, fleeing } = chipmunk;
    if (hiding || emerging || fleeing) return;
    const c = chipmunk.position;
    const s = this.position;
    const dCS = geometry.distance(c, s);
    if (dCS > this.radiusChipmunk) return;
    if (geometry.supNorm(s) > size.porchRatio) {
      const vCM = geometry.vDiff(c, money.position);
      const vSM = geometry.vDiff(s, money.position);
      if (geometry.dotProd(vCM, vSM) < 0) return;
    }
    const away = {
      m: chipmunk.anglesAwayFrom(money.position),
      s: chipmunk.anglesAwayFrom(this.position),
      flip: geometry.halfCircle(
        chipmunk.velocity[0] < 0 ? 0 : Math.PI,
      ),
    };
    const ixnM = geometry.arcIxn(away.flip, away.m);
    const ixnAll = geometry.arcIxn(ixnM, away.s);
    const [x0, x1] = ixnAll ?? ixnM;
    if (geometry.supNorm(c) >= size.porchRatio) {
      chipmunk.willHide = false;
    } else if (chipmunk.rich) {
      chipmunk.willHide = false;
    } else {
      chipmunk.willHide = Math.random() < this.pHide;
    }
    if (!chipmunk.willHide) {
      score.addForChipmunk(chipmunk);
    }
    chipmunk.chase(x0 + Math.random() * (x1 - x0));
  },
  execute() {
    this.handleMoney();
    for (const chipmunk of Chipmunk.pool) {
      this.handleChipmunk(chipmunk);
    }
    this.placeIndicator(this.position);
    this.setPosition();
  },
  addListener() {
    ael('.field', ui.eventType, (event) => {
      this.setPosition(event);
    });
  },
  nIndicators: 24,
  indicatorPool: [],
  makeIndicators() {
    const field = qs('.field');
    for (let i = 0; i < this.nIndicators; i++) {
      const indicator = document.createElement('div');
      indicator.classList.add('shoo-indicator');
      indicator.id = `shoo-indicator-${i}`;
      const circle = document.createElement('div');
      circle.classList.add('shoo-circle');
      ael(circle, 'transitionend', function (e) {
        if (e.propertyName !== 'opacity') return;
        const { classList } = this.parentElement;
        if (classList.contains('active')) {
          classList.remove('active');
        } else classList.add('ready');
      });
      indicator.append(circle);
      field.append(indicator);
      this.indicatorPool.push(indicator);
    }
  },
  placeIndicator(position) {
    const element = this.indicatorPool.find(
      (c) => c.classList.contains('ready'),
    );
    if (!element) return;
    const p = position.map((u) => u * size.boundary);
    const xf = `translate(${p[0]}px, ${p[1]}px)`;
    element.style.transform = xf;
    element.classList.remove('ready');
    element.classList.add('active');
  },
  initialize() {
    this.addListener();
    this.makeIndicators();
  },
  start() {
    this.setPosition();
    for (const element of this.indicatorPool) {
      element.classList.remove('active');
      element.classList.add('ready');
    }
  },
};
