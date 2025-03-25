import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';
import state from './state.js';
import Chipmunk from './chipmunk.js';
export { ui as default };

import { update, startGame } from './gameplay.js';

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
  gameOver() {
    const gotd = qs('.game-over .time-display');
    gotd.innerHTML = state.time.element.innerHTML;
    this.changeToSection('game-over');
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
  attachListeners() {
    aelo('section.front', ui.eventType, () => {
      ui.changeToSection('title');
      if (music.on) music.start();
    });
    ael('.show-instructions', ui.eventType, () => {
      ui.changeToSection('instructions');
    });
    for (const button of qsa('button.start-game')) {
      ael(button, ui.eventType, startGame);
    }
    ael('.pause', ui.eventType, ui.togglePaused);
  },
};
