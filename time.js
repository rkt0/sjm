import { qs } from './utility.js';
import fpsMeter from './fps-meter.js';

export default {
  gameplayElement: qs('.gameplay .score-display'),
  gameOverElement: qs('.game-over .score-display'),
  start() {
    this.total = 0;
    this.gameplayElement.innerHTML = 0;
    this.lastStamp = null;
    if (!fpsMeter.on) return;
    fpsMeter.start('.gameplay');
  },
  advance(timeStamp) {
    this.lastStamp ??= timeStamp;
    const elapsed = 0.001 * (
      timeStamp - this.lastStamp
    );
    this.total += elapsed;
    if (!this.stopScore) this.updateScore();
    this.lastStamp = timeStamp;
    if (fpsMeter.on) fpsMeter.tick(elapsed);
    return elapsed;
  },
  updateScore() {
    const scoreRate = 10;
    const score = Math.trunc(this.total * scoreRate);
    this.gameplayElement.innerHTML = score;
    this.gameOverElement.innerHTML = score;
  },
};
