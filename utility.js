function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}
function ael(x, type, fn) {
  const element = typeof x === 'object' ? x : qs(x);
  const f = e => {
    e.preventDefault();
    fn.bind(element, e)();
  }
  element.addEventListener(type, f);
}
function aelo(x, type, fn) {
  const element = typeof x === 'object' ? x : qs(x);
  const f = e => {
    e.preventDefault();
    fn.bind(element, e)();
  }
  element.addEventListener(type, f, {once: true});
}

export {qs, qsa, ael, aelo};
