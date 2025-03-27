import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';
import fpsMeter from './fps-meter.js';
import state from './state.js';
import ui from './ui.js';
import time from './time.js';
import Chipmunk from './chipmunk.js';
import mountainLion from './mountain-lion.js';
import porch from './porch.js';
import shoo from './shoo.js';

const game = {
  start() {
    Chipmunk.initialize();
    mountainLion.initialize();
    porch.initialize();
    time.initialize();
    ui.setShooPosition();
    state.money.taken = false;
    ui.changeToSection('gameplay');
    aelo('.gameplay', 'transitionend', () => {
      requestAnimationFrame(this.loop);
    });
    if (!fpsMeter.on) return;
    fpsMeter.initialize('.gameplay');
  },
  loop(timeStamp) {
    const elapsed = time.advance(timeStamp);
    Chipmunk.possiblyActivate(elapsed);
    for (const chipmunk of state.chipmunks) {
      chipmunk.update(elapsed);
    }
    porch.update(elapsed);
    state.mountainLion.update(elapsed);
    if (state.shooPosition) shoo();
    if (state.money.taken && !state.nActive) {
      ui.gameOver();
      return;
    }
    if (state.paused) return;
    requestAnimationFrame(game.loop);
  },
  togglePause() {
    state.paused = !state.paused;
    const { paused, porch } = state;
    const pauseVerb = ['pause', 'play'];
    if (paused) pauseVerb.reverse();
    qs('.pause').innerHTML = pauseVerb[0];
    state.time.lastStamp = null;
    if (music.on) music.element[pauseVerb[1]]();
    porch.element.classList.toggle('paused', paused);
    if (!paused) requestAnimationFrame(game.loop);
  },
  initialize() {
    ui.initialize();
    const type = ui.eventType;
    for (const button of qsa('button.start-game')) {
      ael(button, type, () => game.start());
    }
    ael('.pause', type, () => game.togglePause());
  },
};

game.initialize();
