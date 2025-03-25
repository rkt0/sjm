import state from './state.js';

function setShooPosition(event) {
  if (state.paused) return;
  const { boundary, fieldSize } = config;
  let pxOffset = [event.offsetX, event.offsetY];
  if (ui.eventType === 'touchstart') {
    const t = event.changedTouches[0];
    const tLoc = [t.clientX, t.clientY];
    const fLoc = this.fieldLocation;
    pxOffset = [0, 1].map((u) => tLoc[u] - fLoc[u]);
  }
  state.shooPosition = pxOffset.map(
    (u) => (u - fieldSize / 2) / boundary,
  );
}

export default function () {
  null;
}
