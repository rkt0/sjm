import { aelo, qs } from './utility.js';

export default {
  perSecond: 1,
  perChipmunk: 5,
  multipliers: { rich: 2 },
  winTarget: 300,
  almostTarget: 200,
  scoreElementGP: qs('.gameplay .score-display'),
  scoreElementGO: qs('.game-over .score-display'),
  totalElementGP: qs('.gameplay .total-display'),
  totalElementGO: qs('.game-over .total-display'),
  start() {
    this.prior ??= 0;
    this.prior += Math.trunc(this.raw ?? 0);
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
    const { raw, prior, winTarget } = this;
    const [result, total] = [raw, prior + raw].map(
      (x) => Math.min(Math.trunc(x), winTarget),
    );
    this.scoreElementGP.innerHTML = result;
    this.totalElementGP.innerHTML = total;
    if (gameplayOnly) return;
    this.scoreElementGO.innerHTML = result;
  },
  checkWin() {
    return this.raw >= this.winTarget;
  },
  checkAlmost() {
    return this.raw >= this.almostTarget;
  },
};
