import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';
import ui from './ui.js';
import time from './time.js';
import score from './score.js';
import Chipmunk from './chipmunk.js';
import money from './money.js';
import shoo from './shoo.js';

const game = {
  paused: false,
  count: 0,
  start() {
    Chipmunk.start();
    money.start();
    time.start();
    shoo.start();
    ui.changeToSection('gameplay');
    aelo('.gameplay', 'transitionend', () => {
      requestAnimationFrame(this.loop);
    });
  },
  loop(timeStamp) {
    time.stopScore = money.taken;
    const elapsed = time.advance(timeStamp);
    if (shoo.position) shoo.execute();
    score.update();
    if (score.checkWin()) game.win();
    // if (score.checkAlmost()) null;
    if (!game.won) {
      Chipmunk.possiblyActivate(elapsed, game.count);
      Chipmunk.possiblyEmerge(elapsed);
    }
    for (const chipmunk of Chipmunk.pool) {
      chipmunk.update(elapsed);
    }
    money.update(elapsed);
    const allGone = !Chipmunk.nMoving();
    if (game.won && allGone) {
      ui.win(game.count * money.amount);
    } else if (money.taken && allGone) {
      game.count++;
      ui.changeToSection('game-over');
      ui.embellishGameOver(game.count);
    } else if (!game.paused) {
      requestAnimationFrame(game.loop);
    }
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
    shoo.initialize();
    const type = ui.eventType;
    for (const button of qsa('button.start-game')) {
      ael(button, type, () => game.start());
    }
    ael('.pause', type, () => game.togglePause());
  },
  win() {
    this.won = true;
    for (const chipmunk of Chipmunk.pool) {
      chipmunk.chase();
    }
  },
};

game.initialize();
