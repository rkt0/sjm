import {ael, aelo, forcePlay, qs} from './utility.js';
export {music as default};

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
  storageKey: 'recentMusic',
  save() {
    const str = JSON.stringify(this.recent);
    localStorage.setItem(this.storageKey, str);
  },
  load() {
    const str = localStorage.getItem(this.storageKey);
    const arr = JSON.parse(str) ?? [];
    const msPerDay = 1000 * 60 * 60 * 24;
    const t = Date.now() - msPerDay * this.daysFresh;
    this.recent = arr.filter((x) => x.time > t);
  },
  initialize() {
    this.load();
    ael(this.element, 'ended', () => this.next());
    for (const x of ['mower', 'win', 'ussr']) {
      this[`${x}Element`] = qs(`audio.${x}`);
      this[`${x}Element`].src = `audio/${x}.mp3`;
    }
  },
  start() {
    const last = this.recent.shift();
    if (!last) this.playTrack(this.firstId);
    else {
      const {id, restarts} = last;
      if (restarts >= this.restartsMax) {
        this.recent.unshift(last);
        this.next();
      } else this.playTrack(id, restarts + 1);
    }
  },
  playTrack(id, restarts = 0) {
    const {element, recent} = this;
    element.src = this.playlist[id].src;
    forcePlay(element);
    recent.unshift({id, time: Date.now(), restarts});
    if (recent.length > this.recentMax) recent.pop();
    this.save();
  },
  next() {
    const recentIds = this.recent.map((x) => x.id);
    const weights = this.playlist.map(
      (e, i) => recentIds.includes(i) ? 0 : e.weight,
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
    this.playTrack(nextId);
  },
  fade(element = this.element, opts) {
    const {duration = 3000, steps = 180} = opts ?? {};
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
  },
  startRevolution() {
    this.fade();
    const {element, ussrElement} = this;
    aelo(element, 'pause', () => ussrElement.play());
    // In case revolution audio finishes on its own
    aelo(ussrElement, 'ended', () => this.fade());
  },
  endRevolution() {
    if (this.ussrElement.ended) return;
    this.fade(this.ussrElement);
    this.fade();
  },
  startMower() {
    this.mowerElement.currentTime = 0;
    this.mowerElement.play();
    this.outro = this.mowerElement.duration - 1;
  },
  mowing() {
    const current = this.mowerElement.currentTime;
    const end = this.mowerElement.duration;
    return 0 < current && current < end;
  },
  win() {
    this.winElement.play();
  },
  okWin() {
    return this.mowerElement.currentTime > this.outro;
  },
};

// ael(music.element, 'ended', () => music.next());
