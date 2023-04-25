import {qs, ael} from './utility.js';

export const music = {
  element: qs('audio'),
  recentIds: [],
  recentMax: 6,
  playlist: [
    new Track(1, 'The Entertainer'),
    new Track(1, 'Maple Leaf Rag'),
    new Track(1, 'Frogs Legs Rag'),
    new Track(1, 'Onion Capers'),
    new Track(1, 'Hyperfun'),
    new Track(1, 'Gold Rush'),
    new Track(0, 'Fig Leaf Rag'),
    new Track(0, 'Lively Lumpsucker'),
    new Track(0, 'Wagon Wheel'),
    new Track(0, 'Merry Go'),
    new Track(0, 'Hand Trolley'),         // ?
    new Track(0, 'Hammock Fight'),        // ?
  ],
};
music.next = function() {
  const {recentIds: rIds, recentMax: rMax} = this;
  const rFrac = rIds.length / rMax;
  const weights = this.playlist.map(
    (e, i) => rIds.includes(i) ? 0 : rFrac + e.good
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
  this.element.src = this.playlist[nextId].src;
  this.element.play();
  if (rIds.unshift(nextId) > rMax) rIds.pop();
};

ael(music.element, 'ended', () => music.next());

function Track(good, title) {
  this.src = `audio/${
    title.toLowerCase().replaceAll(' ', '-')
  }.mp3`;
  this.good = good;
}
