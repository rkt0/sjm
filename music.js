import { ael, aelo, qs } from './utility.js';
export { music as default };

class Track {
  constructor(weight, title) {
    this.src = `audio/${
      title.toLowerCase().replaceAll(' ', '-')
    }.mp3`;
    this.weight = weight;
  }
}

const music = {
  on: true,
  element: qs('audio.music'),
  recent: [],
  recentMax: 4,
  daysFresh: 7,
  firstId: 0,
  restartsMax: 1,
  playlist: [
    new Track(4, 'The Entertainer'),
    new Track(4, 'Maple Leaf Rag'),
    new Track(4, 'Onion Capers'),
    new Track(1, 'Frogs Legs Rag'),
    new Track(1, 'Gold Rush'),
    new Track(1, 'Wagon Wheel'),
    new Track(1, 'Lively Lumpsucker'),
    new Track(1, 'Merry Go'),
  ],
};
music.start = function () {
  for (const x of ['mower', 'win', 'ussr']) {
    this[`${x}Element`] = qs(`audio.${x}`);
    this[`${x}Element`].src = `audio/${x}.mp3`;
  }
  const rString = localStorage.getItem('recentMusic');
  const rFull = JSON.parse(rString) ?? [];
  const msPerDay = 1000 * 60 * 60 * 24;
  const old = Date.now() - msPerDay * this.daysFresh;
  this.recent = rFull.filter((x) => x.time > old);
  const last = this.recent.shift();
  if (!last) this.play(this.firstId);
  else {
    const { id, restarts } = last;
    if (restarts >= this.restartsMax) {
      this.recent.unshift(last);
      this.next();
    } else this.play(id, restarts + 1);
  }
};
music.play = function (id, restarts = 0) {
  const { element, recent } = this;
  element.src = this.playlist[id].src;
  element.play();
  recent.unshift({ id, time: Date.now(), restarts });
  if (recent.length > this.recentMax) recent.pop();
  const rString = JSON.stringify(recent);
  localStorage.setItem('recentMusic', rString);
};
music.next = function () {
  const recentIds = this.recent.map((x) => x.id);
  const weights = this.playlist.map((e, i) =>
    recentIds.includes(i) ? 0 : e.weight
  );
  const n = weights.length;
  const cdf = [];
  for (let i = 0; i < n; i++) {
    cdf.push((cdf[i - 1] ?? 0) + weights[i]);
  }
  const total = cdf[n - 1];
  for (let i = 0; i < n; i++) cdf[i] /= total;
  const rand = Math.random();
  let nextId = 0;
  while (cdf[nextId] < rand) nextId++;
  this.play(nextId);
};
music.fade = function (element = this.element, opts) {
  const { duration = 3000, steps = 180 } = opts ?? {};
  const target = +!element.volume;
  const change = (target - element.volume) / steps;
  const levels = [];
  for (let i = 0; i < steps; i++) {
    // Sounds better if nonlinear
    levels.push((target - i * change) ** 2);
  }
  const timer = setInterval(() => {
    if (!element.volume) element.play();
    element.volume = levels.pop();
    if (!element.volume) element.pause();
    if (!levels.length) clearInterval(timer);
  }, duration / steps);
};
music.startRevolution = function () {
  this.ussrElement.src = 'audio/ussr.mp3';
  this.fade();
  aelo(this.element, 'pause', () => {
    this.ussrElement.play();
  });
  // In case revolution audio finishes on its own
  aelo(this.ussrElement, 'ended', () => {
    this.fade();
  });
};
music.endRevolution = function () {
  if (this.ussrElement.ended) return;
  this.fade(this.ussrElement);
  this.fade();
};
music.startMower = function () {
  this.mowerElement.src ||= 'audio/mower.mp3';
  this.mowerElement.currentTime = 0;
  this.mowerElement.play();
  this.outro = this.mowerElement.duration - 1;
};
music.mowing = function () {
  const current = this.mowerElement.currentTime;
  const end = this.mowerElement.duration;
  return 0 < current && current < end;
};
music.win = function () {
  this.winElement.play();
};
music.okWin = function () {
  return this.mowerElement.currentTime > this.outro;
}

ael(music.element, 'ended', () => music.next());
