import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';
import fpsMeter from './fps-meter.js';
import config from './config.js';
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
    state.time.total = 0;
    state.time.element.innerHTML = 0;
    state.time.lastStamp = null;
    state.money.taken = false;
    state.shooPosition = null;
    state.porch.shakeTimer = 0;
    state.porch.disturbance = 0;
    state.porch.element.classList.remove('shaking');
    state.porch.element.append(state.money.element);
    ui.changeToSection('gameplay');
    aelo('.gameplay', 'transitionend', () => {
      requestAnimationFrame(this.loop);
    });
    if (!config.fpsMeterOn) return;
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
