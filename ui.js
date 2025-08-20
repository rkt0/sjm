import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';

export default {
  eventType: 'mousedown',
  changeToSection(section) {
    const oldElement = qs('section.current');
    const element = qs(`section.${section}`);
    oldElement.classList.remove('current');
    aelo(oldElement, 'transitionend', () => {
      element.classList.add('current');
    });
  },
  setDisplayToFlex() {
    for (const section of qsa('section')) {
      section.style.display = 'flex';
    }
  },
  setEventTypes() {
    if (!matchMedia('(hover: none)').matches) return;
    this.eventType = 'touchstart';
    for (const s of qsa('span.click-or-touch')) {
      s.innerHTML = 'touch';
    }
    const rect = qs('.field').getBoundingClientRect();
    this.fieldLocation = [rect.x, rect.y];
  },
  addListeners() {
    const { eventType: type, changeToSection } = this;
    ael('input', 'input', function () {
      qs('.enter-name').disabled = !this.value;
    });
    aelo('.enter-name', type, () => {
      document.title = "Save Jeff's Money";
      if (music.on) music.start();
      const lastName = qs('input').value;
      const nameDivs = qsa('.last-name');
      for (const div of nameDivs) {
        div.innerHTML = lastName;
      }
      localStorage.setItem('lastName', lastName);
      changeToSection('title');
    });
    ael('.show-instructions', type, () => {
      changeToSection('instructions');
    });
  },
  fillName() {
    const lastName = localStorage.getItem('lastName');
    if (lastName) qs('input').value = lastName;
    qs('input').dispatchEvent(new Event('input'));
  },
  initialize() {
    this.setEventTypes();
    this.addListeners();
    this.fillName();
    this.setDisplayToFlex();
  },
  embellishGameOver(n) {
    const message = qs('.message');
    message.style.display = 'none';
    message.classList.remove('active');
    message.style.display = '';
    if (n === 1) return;
    const content = qs(`span.e-${n}`)?.innerHTML;
    if (content) {
      message.innerHTML = content;
      aelo('.game-over', 'transitionend', () => {
        message.classList.add('active');
      });
    }
    const items = qsa(`img.e-${n}`);
    // const nMax = 8;
    // for (let i = 1; i <= nMax; i++) {
    //   for (const element of qsa(`.e-${i}`)) {
    //     element.hidden = i > n;
    //   }
    // }
    // if (n < nMax) return;
  },
};
