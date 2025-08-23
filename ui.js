import { ael, aelo, qs, qsa } from './utility.js';
import music from './music.js';

export default {
  eventType: 'mousedown',
  addSectionListeners() {
    for (const section of qsa('section')) {
      ael(section, 'transitionend', function (e) {
        if (e.target !== this) return;
        const up = this.classList.contains('current');
        const status = up ? 'ready' : 'gone';
        this.dispatchEvent(new Event(status));
      });
    }
  },
  changeToSection(section) {
    const oldElement = qs('section.current');
    const element = qs(`section.${section}`);
    oldElement.classList.remove('current');
    aelo(oldElement, 'gone', () => {
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
    this.addSectionListeners();
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
    for (const button of qsa('.hide-overlay')) {
      ael(button, type, function () {
        const overlay = this.closest('.overlay');
        overlay.classList.remove('active');
        waitForTransition(overlay);
        aelo(overlay, 'transitionend', function () {
          this.style.visibility = 'hidden';
        });
      });
    }
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
    qs('.message')?.remove();
    this.hidePlayAgainButton();
    if (n === 1) {
      this.showPlayAgainButton();
      return;
    }
    const content = qs(`.message-content.e-${n}`);
    if (content) {
      const message = document.createElement('div');
      message.classList.add('message');
      message.innerHTML = content.innerHTML;
      qs('.game-over .illustration').append(message);
      aelo('.game-over', 'ready', () => {
        message.classList.add('active');
        waitForTransition(message);
        this.showPlayAgainButton(message);
      });
      return;
    }
    const addition = qs(`.addition.e-${n}`);
    if (addition) {
      aelo('.game-over', 'ready', () => {
        addition.classList.add('active');
        waitForTransition(addition);
        this.showPlayAgainButton(addition);
      });
      return;
    }
    if (n === 3) {
      aelo('.game-over', 'ready', () => {
        const chipmunk = qs('.game-over .chipmunk');
        chipmunk.classList.add('rich');
        waitForTransition(chipmunk);
        aelo(chipmunk, 'ready', () => {
          const overlay = qs('.overlay.rich');
          overlay.style.visibility = 'visible';
          overlay.classList.add('active');
        });
        this.showPlayAgainButton('.overlay.rich');
      });
      return;
    }
    this.showPlayAgainButton();
  },
  hidePlayAgainButton() {
    const button = qs('.game-over button');
    button.style.display = 'none';
    button.disabled = true;
    button.style.display = '';
  },
  showPlayAgainButton(triggerElement) {
    const trigger = triggerElement ?? '.game-over';
    aelo(trigger, 'ready', () => {
      qs('.game-over button').disabled = false;
    });
  },
  win(amount) {
    const span = qs('.overlay.win span');
    span.innerHTML = `$${amount}`;
    const overlay = qs('.overlay.win');
    overlay.style.visibility = 'visible';
    overlay.classList.add('active');
  },
  almost(target) {
    const span = qs('.overlay.almost span');
    span.innerHTML = target;
    const overlay = qs('.overlay.almost');
    overlay.style.visibility = 'visible';
    overlay.classList.add('active');
  },
};

function waitForTransition(x) {
  const element = typeof x === 'object' ? x : qs(x);
  aelo(element, 'transitionend', function () {
    element.dispatchEvent(new Event('ready'));
  });
}
