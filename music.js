import {qs, ael} from './utility.js';

export {music as default};
const music = {
  element: qs('audio'),
  recent: [],
  recentMax: 4,   // number of recent tracks to store
  daysFresh: 7,   // number of days to store
  firstId: 0,     // id to play if no recent tracks
  playlist: [
    new Track(1, 'The Entertainer'),
    new Track(1, 'Maple Leaf Rag'),
    new Track(1, 'Onion Capers'),
    new Track(0, 'Frogs Legs Rag'),
    new Track(0, 'Gold Rush'),
    new Track(0, 'Wagon Wheel'),
    new Track(0, 'Lively Lumpsucker'),
    new Track(0, 'Merry Go'),
    new Track(0, 'Hyperfun'),
  ],
};
music.start = function() {
  const rString = localStorage.getItem('recentMusic');
  const rFull = JSON.parse(rString) ?? [];
  const msPerDay = 1000 * 60 * 60 * 24;
  const old = Date.now() - msPerDay * this.daysFresh;
  this.recent = rFull.filter(x => x.timestamp > old);
  this.play(this.recent.shift()?.id ?? this.firstId);
};
music.play = function(id) {
  const {element, recent} = this;
  element.src = this.playlist[id].src;
  element.play();
  recent.unshift({id, timestamp: Date.now()});
  if (recent.length > this.recentMax) recent.pop();
  const rString = JSON.stringify(recent);
  localStorage.setItem('recentMusic', rString);
};
music.next = function() {
  const recentIds = this.recent.map(x => x.id);
  const weights = this.playlist.map(
    (e, i) => recentIds.includes(i) ? 0 : 1 + e.good
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

function Track(good, title) {
  this.src = `audio/${
    title.toLowerCase().replaceAll(' ', '-')
  }.mp3`;
  this.good = good;
}

ael(music.element, 'ended', () => music.next());
