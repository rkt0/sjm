import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';
import config from './config.js';
import state from './state.js';
import Chipmunk from './chipmunk.js';

export default {
  eventType: 'mousedown',
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
  gameOver() {
    const gotd = qs('.game-over .time-display');
    gotd.innerHTML = state.time.element.innerHTML;
    this.changeToSection('game-over');
  },
  setShooPosition(event) {
    if (!event) {
      state.shooPosition = null;
      return;
    }
    if (state.paused) return;
    const { boundary, fieldSize } = config;
    let pxOffset = [event.offsetX, event.offsetY];
    if (this.eventType === 'touchstart') {
      const t = event.changedTouches[0];
      const tLoc = [t.clientX, t.clientY];
      const fLoc = this.fieldLocation;
      pxOffset = [0, 1].map((u) => tLoc[u] - fLoc[u]);
    }
    state.shooPosition = pxOffset.map(
      (u) => (u - fieldSize / 2) / boundary,
    );
  },
  attachListeners() {
    const { eventType: type, changeToSection } = this;
    aelo('.front', type, () => {
      changeToSection('title');
      if (music.on) music.start();
    });
    ael('.show-instructions', type, () => {
      changeToSection('instructions');
    });
    ael('.field', type, (event) => {
      this.setShooPosition(event);
    });
  },
  initialize() {
    this.setEventTypes();
    this.attachListeners();
    this.makeTitleScreen();
    this.setDisplayToFlex();
  },
};
