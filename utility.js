function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}
function ael(x, type, fn) {
  const element = typeof x === 'object' ? x : qs(x);
  const f = (e) => {
    e.preventDefault();
    fn.bind(element, e)();
  };
  element.addEventListener(type, f);
}
function aelo(x, type, fn) {
  const element = typeof x === 'object' ? x : qs(x);
  const f = (e) => {
    e.preventDefault();
    fn.bind(element, e)();
  };
  element.addEventListener(type, f, { once: true });
}
function setAllDisplay(selector, value) {
  for (const element of qsa(selector)) {
    element.style.display = value ?? '';
  }
}
const warnBeforeReload = {
  element: window,
  type: 'beforeunload',
  handler(event) {
    event.preventDefault();
    event.returnValue = true;
  },
  activate() {
    this.element.addEventListener(
      this.type, this.handler,
    );
  },
  deactivate() {
    this.element.removeEventListener(
      this.type, this.handler,
    );
  },
};
function forcePlay(element, delay = 50) {
  element.play().catch(() => {
    setTimeout(() => {
      forcePlay(element, delay)
    }, delay);
  });
}

export {
  ael, aelo, qs, qsa,
  setAllDisplay, warnBeforeReload, forcePlay,
};
