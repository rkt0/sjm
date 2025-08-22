import { qs } from './utility.js';

export default {
  perSecond: 1,
  perNormalChipmunk: 5,
  perRichChipmunk: 10,
  gameplayElement: qs('.gameplay .score-display'),
  gameOverElement: qs('.game-over .score-display'),
  start() {
    this.raw = 0;
    this.updateElements();
  },
  add(points) {
    this.raw += points;
    this.updateElements();
  },
  updateElements() {
    const truncated = Math.trunc(this.raw);
    this.gameplayElement.innerHTML = truncated;
    this.gameOverElement.innerHTML = truncated;
  },
}
