export const fpsMeter = {
  count: 0,
  time: 0,
  initialize(whereSelector) {
    const div = document.createElement('div');
    div.classList.add('fps-counter');
    document.querySelector(whereSelector).append(div);
    this.element = div;
  },
  tick(elapsedTime) {
    this.count++;
    this.time += elapsedTime;
    if (this.time > 1) {
      this.element.innerHTML = Math.round(
        this.count / this.time
      );
      this.count = 0;
      this.time = 0;
    }
  },
};
