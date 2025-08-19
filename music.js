import { ael, qs } from './utility.js';
export { music as default };

class Track {
  constructor(good, title) {
    this.src = `audio/${
      title.toLowerCase().replaceAll(' ', '-')
    }.mp3`;
    this.good = good;
  }
}

const music = {
  on: true,
  element: qs('audio'),
  recent: [],
  recentMax: 4,
  daysFresh: 7,
  firstId: 0,
  restartsMax: 1,
  playlist: [
    new Track(1, 'The Entertainer'),
    new Track(1, 'Maple Leaf Rag'),
    new Track(1, 'Onion Capers'),
    new Track(0, 'Frogs Legs Rag'),
    new Track(0, 'Gold Rush'),
    new Track(0, 'Wagon Wheel'),
    new Track(0, 'Lively Lumpsucker'),
    new Track(0, 'Merry Go'),
  ],
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
  console.log(`now playing: ${element.src}`);
  recent.unshift({ id, time: Date.now(), restarts });
  if (recent.length > this.recentMax) recent.pop();
  const rString = JSON.stringify(recent);
  localStorage.setItem('recentMusic', rString);
};
music.next = function () {
  const recentIds = this.recent.map((x) => x.id);
  const weights = this.playlist.map((e, i) =>
    recentIds.includes(i) ? 0 : 1 + e.good
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

ael(music.element, 'ended', () => music.next());
ael(document, 'keydown', (e) => {
  switch (e.key) {
    case 'n':
      music.next();
      break;
    case 'm':
      console.table(music.recent);
      break;
  }
});
