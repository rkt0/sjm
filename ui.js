import { ael, aelo, qs, qsa } from './utility.js';

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
    ael('input', 'input', function() {
      const button = qs('.enter-name');
      button.disabled = !this.value;
      button.style.opacity = +(!!this.value);
    })
    aelo('.enter-name', type, () => {
      const lastName = qs('input').value;
      const nameDivs = qsa('.last-name');
      for (const div of nameDivs) {
        div.innerHTML = lastName;
      }
      changeToSection('title');
    });
    ael('.show-instructions', type, () => {
      changeToSection('instructions');
    });
  },
  initialize() {
    this.setEventTypes();
    this.addListeners();
    this.setDisplayToFlex();
  },
  embellishGameOver(n) {
    const nMax = 8;
    for (let i = 1; i <= nMax; i++) {
      for (const element of qsa(`.e-${i}`)) {
        element.hidden = i > n;
      }
    }
    if (n < nMax) return;
    const message = qs('.ending-message');
    aelo('section.game-over', 'transitionend', () => {
      message.classList.add('active');
    });
    aelo(message, 'transitionend', () => {
      message.classList.remove('active');
    });
  },
};
