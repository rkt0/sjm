import { qs, aelo } from './utility.js';

export default {
  perSecond: 1,
  perChipmunk: 5,
  multipliers: { rich: 2 },
  gameplayElement: qs('.gameplay .score-display'),
  gameOverElement: qs('.game-over .score-display'),
  start() {
    this.raw = 0;
    this.updateElements(true);
    aelo('.gameplay', 'ready', () => {
      this.updateElements();
    });
  },
  addForTime(seconds) {
    this.raw += seconds * this.perSecond;
    this.updateElements();
  },
  addForChipmunk(chipmunk) {
    let points = this.perChipmunk;
    for (const x of Object.keys(this.multipliers)) {
      if (chipmunk[x]) points *= this.multipliers[x];
    }
    this.raw += points;
    this.updateElements();
  },
  updateElements(gameplayOnly) {
    const truncated = Math.trunc(this.raw);
    this.gameplayElement.innerHTML = truncated;
    if (gameplayOnly) return;
    this.gameOverElement.innerHTML = truncated;
  },
}
