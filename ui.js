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
    const rect = this.getBoundingClientRect();
    this.fieldLocation = [rect.x, rect.y];
  },
  addListeners() {
    const { eventType: type, changeToSection } = this;
    aelo('.front', type, () => {
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
};
