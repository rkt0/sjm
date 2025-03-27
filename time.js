import { qs } from './utility.js';
import fpsMeter from './fps-meter.js';

export default {
  gameplayElement: qs('.gameplay .time-display'),
  gameOverElement: qs('.game-over .time-display'),
  initialize() {
    this.total = 0;
    this.gameplayElement.innerHTML = 0;
    this.lastStamp = null;
    if (!fpsMeter.on) return;
    fpsMeter.initialize('.gameplay');
  },
  advance(timeStamp) {
    this.lastStamp ??= timeStamp;
    const elapsed = 0.001 * (
      timeStamp - this.lastStamp
    );
    this.total += elapsed;
    const timeInteger = Math.trunc(this.total);
    this.gameplayElement.innerHTML = timeInteger;
    this.gameOverElement.innerHTML = timeInteger;
    this.lastStamp = timeStamp;
    if (fpsMeter.on) fpsMeter.tick(elapsed);
    return elapsed;
  },
};
