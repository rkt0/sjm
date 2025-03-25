import { ael, aelo, qsa } from './utility.js';
import music from './music.js';
import config from './config.js';
import state from './state.js';
import ui from './ui.js';

export default {
  setShooPosition(event) {
    if (state.paused) return;
    const { boundary, fieldSize } = config;
    let pxOffset = [event.offsetX, event.offsetY];
    if (ui.eventType === 'touchstart') {
      const t = event.changedTouches[0];
      const tLoc = [t.clientX, t.clientY];
      const fLoc = this.fieldLocation;
      pxOffset = [0, 1].map((u) => tLoc[u] - fLoc[u]);
    }
    state.shooPosition = pxOffset.map(
      (u) => (u - fieldSize / 2) / boundary,
    );
  },
  add() {
    const { eventType, changeToSection } = ui;
    aelo('.front', eventType, () => {
      changeToSection('title');
      if (music.on) music.start();
    });
    ael('.show-instructions', eventType, () => {
      changeToSection('instructions');
    });
    for (const button of qsa('button.start-game')) {
      ael(button, eventType, () => ui.startGame());
    }
    ael('.pause', eventType, () => ui.togglePaused());
    ael(
      '.field',
      eventType,
      (event) => this.setShooPosition(event),
    );
  },
};
