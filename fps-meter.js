export default {
  initialize(whereSelector) {
    this.count = 0;
    this.time = 0;
    if (this.element) {
      this.element.innerHTML = '';
      return;
    }
    const div = document.createElement('div');
    div.classList.add('fps-counter');
    document.querySelector(whereSelector).append(div);
    this.element = div;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'fps-meter.css';
    document.head.append(link);
  },
  tick(elapsedTime) {
    this.count++;
    this.time += elapsedTime;
    if (this.time > 1) {
      this.element.innerHTML = Math.round(
        this.count / this.time,
      );
      this.count = 0;
      this.time = 0;
    }
  },
};
