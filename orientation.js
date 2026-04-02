export default {
  mode: 'portrait',
  dimensionsAny: ['height >= 540px'],
  isOk() {
    const criteriaAny = [
      `(orientation: ${this.mode})`,
    ];
    for (const dimension of this.dimensionsAny) {
      criteriaAny.push(`(${dimension})`);
    }
    for (const criterion of criteriaAny) {
      if (globalThis.matchMedia(criterion).matches) {
        return true;
      }
    }
    return false
  },
  check() {
    if (!this.isOk()) {
      alert(`Please hold your device in ${
        this.mode
      } mode to play this game.`);
    }
  },
};
