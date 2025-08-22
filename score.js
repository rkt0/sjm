import { aelo, qs } from './utility.js';

export default {
  perSecond: 1,
  perChipmunk: 5,
  multipliers: { rich: 2 },
  winTarget: 100,
  almostTarget: 50,
  gameplayElement: qs('.gameplay .score-display'),
  gameOverElement: qs('.game-over .score-display'),
  start() {
    this.raw = 0;
    this.update(true);
    aelo('.gameplay', 'ready', () => {
      this.update();
    });
  },
  addForTime(seconds) {
    this.raw += seconds * this.perSecond;
  },
  addForChipmunk(chipmunk) {
    let points = this.perChipmunk;
    for (const x of Object.keys(this.multipliers)) {
      if (chipmunk[x]) points *= this.multipliers[x];
    }
    this.raw += points;
  },
  update(gameplayOnly) {
    const displayed = Math.min(
      Math.trunc(this.raw),
      this.winTarget,
    );
    this.gameplayElement.innerHTML = displayed;
    if (gameplayOnly) return;
    this.gameOverElement.innerHTML = displayed;
  },
};
