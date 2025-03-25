import { aelo, qs, qsa } from './utility.js';
import music from './music.js';
import config from './config.js';
import state from './state.js';
import Chipmunk from './chipmunk.js';
import mountainLion from './mountain-lion.js';
export { ui as default };

import { update } from './gameplay.js';

const ui = {
  eventType: 'mousedown',
  pauseButton: qs('.pause'),
  changeToSection(section) {
    const oldElement = qs('section.current');
    const element = qs(`section.${section}`);
    oldElement.classList.remove('current');
    aelo(oldElement, 'transitionend', () => {
      element.classList.add('current');
    });
  },
  makeTitleScreen() {
    const chipmunk = Chipmunk.makeElement();
    const money = state.money.element.cloneNode(true);
    chipmunk.append(money);
    qs('.illustration').append(chipmunk);
  },
  setDisplayToFlex() {
    for (const section of qsa('section')) {
      section.style.display = 'flex';
    }
  },
  setEventTypes() {
    if (!matchMedia('(hover: none)').matches) return;
    this.eventType = 'touchstart';
    for (const s of qsa('span.click-or-touch')) {
      s.innerHTML = 'touch';
    }
    const rect = this.getBoundingClientRect();
    this.fieldLocation = [rect.x, rect.y];
  },
  togglePaused() {
    state.paused = !state.paused;
    const { paused, porch } = state;
    const pauseVerb = ['pause', 'play'];
    if (paused) pauseVerb.reverse();
    qs('.pause').innerHTML = pauseVerb[0];
    state.time.lastStamp = null;
    if (music.on) music.element[pauseVerb[1]]();
    porch.element.classList.toggle('paused', paused);
    if (!paused) requestAnimationFrame(update);
  },
  startGame() {
    Chipmunk.initialize();
    mountainLion.initialize();
    state.time.total = 0;
    state.time.element.innerHTML = 0;
    state.time.lastStamp = null;
    state.money.taken = false;
    state.shooPosition = null;
    state.porch.shakeTimer = 0;
    state.porch.disturbance = 0;
    state.porch.element.classList.remove('shaking');
    state.porch.element.append(state.money.element);
    this.changeToSection('gameplay');
    aelo('.gameplay', 'transitionend', () => {
      requestAnimationFrame(update);
    });
    if (!config.fpsMeterOn) return;
    fpsMeter.initialize('.gameplay');
  },
  gameOver() {
    const gotd = qs('.game-over .time-display');
    gotd.innerHTML = state.time.element.innerHTML;
    this.changeToSection('game-over');
  },
};
