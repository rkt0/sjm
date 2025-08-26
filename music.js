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
  sfxElement: qs('audio.sfx'),
  revolutionElement: qs('audio.revolution'),
};
music.start = function () {
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
music.startRevolution = function () {
  this.revolutionElement.src = 'audio/ussr.mp3';
  fadeAudio(this.element);
  aelo(this.element, 'pause', () => {
    this.revolutionElement.play();
  });
  // In case revolution audio finishes on its own
  aelo(this.revolutionElement, 'ended', () => {
    fadeAudio(this.element);
  });
};
music.endRevolution = function () {
  if (this.revolutionElement.ended) return;
  fadeAudio(this.revolutionElement);
  fadeAudio(this.element);
};

function fadeAudio(x, duration = 3000, steps = 180) {
  const element = typeof x === 'object' ? x : qs(x);
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
}

ael(music.element, 'ended', () => music.next());
