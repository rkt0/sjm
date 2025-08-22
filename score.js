import { qs, aelo } from './utility.js';

export default {
  perSecond: 1,
  perChipmunk: { normal: 5, rich: 10 },
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
  addForChipmunk(rich) {
    let points = this.perChipmunk.normal;
    if (rich) points = this.perChipmunk.rich;
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
