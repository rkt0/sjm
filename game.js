import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';
import ui from './ui.js';
import time from './time.js';
import Chipmunk from './chipmunk.js';
import money from './money.js';
import shoo from './shoo.js';

const game = {
  paused: false,
  timesPlayed: 0,
  start() {
    Chipmunk.start();
    money.start();
    time.start();
    shoo.setPosition();
    ui.changeToSection('gameplay');
    aelo('.gameplay', 'transitionend', () => {
      requestAnimationFrame(this.loop);
    });
  },
  loop(timeStamp) {
    time.stopScore = money.taken;
    const elapsed = time.advance(timeStamp);
    Chipmunk.possiblyActivate(elapsed);
    Chipmunk.possiblyEmerge(elapsed);
    for (const chipmunk of Chipmunk.pool) {
      chipmunk.update(elapsed);
    }
    money.update(elapsed);
    if (shoo.position) shoo.execute();
    if (money.taken && !Chipmunk.nMoving()) {
      game.timesPlayed++;
      ui.embellishGameOver(game.timesPlayed);
      ui.changeToSection('game-over');
      return;
    }
    if (game.paused) return;
    requestAnimationFrame(game.loop);
  },
  togglePause() {
    this.paused = !this.paused;
    const { paused } = this;
    const pauseVerb = ['pause', 'play'];
    if (paused) pauseVerb.reverse();
    qs('.pause').innerHTML = pauseVerb[0];
    time.lastStamp = null;
    if (music.on) music.element[pauseVerb[1]]();
    if (!paused) {
      shoo.setPosition();
      requestAnimationFrame(game.loop);
    }
  },
  initialize() {
    ui.initialize();
    Chipmunk.initialize();
    money.initialize();
    shoo.addListener();
    const type = ui.eventType;
    for (const button of qsa('button.start-game')) {
      ael(button, type, () => game.start());
    }
    ael('.pause', type, () => game.togglePause());
  },
};

game.initialize();
