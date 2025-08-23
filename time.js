import score from './score.js';
import fpsMeter from './fps-meter.js';

export default {
  start() {
    this.total = 0;
    this.lastStamp = null;
    this.stopScore = false;
    score.start();
    if (!fpsMeter.on) return;
    fpsMeter.start('.gameplay');
  },
  advance(timeStamp) {
    this.lastStamp ??= timeStamp;
    const elapsed = 0.001 * (
      timeStamp - this.lastStamp
    );
    this.total += elapsed;
    if (!this.stopScore) score.addForTime(elapsed);
    this.lastStamp = timeStamp;
    if (fpsMeter.on) fpsMeter.tick(elapsed);
    return elapsed;
  },
};
