const pi = Math.PI;

export default {
  // Get angle of vector from 0 to 2π
  angle(vector) {
    const s = Math.atan2(vector[1], vector[0]);
    return s < 0 ? s + 2 * pi : s;
  },

  // Get information about angles of two vectors,
  // adjusted to be within π of each other
  anglePair(vector0, vector1) {
    let a0 = this.angle(vector0);
    let a1 = this.angle(vector1);
    if (a0 - a1 > pi) a0 -= 2 * pi;
    if (a1 - a0 > pi) a1 -= 2 * pi;
    return {
      angles: [a0, a1],
      min: Math.min(a0, a1),
      max: Math.max(a0, a1),
      diff: Math.max(a0, a1) - Math.min(a0, a1),
    };
  },

  // Get angle between two vectors (from 0 to π)
  angleBetween(u, v) {
    const dotProduct = u[0] * v[0] + u[1] * v[1];
    const norms = Math.hypot(...u) * Math.hypot(...v);
    return Math.acos(dotProduct / norms);
  },

  // Check if vectors are equal
  vEqual(vector0, vector1) {
    return vector0.every((e, i) => e === vector1[i]);
  },

  // Get elementwise sum of vectors
  vSum(vector0, vector1) {
    return vector0.map((e, i) => e + vector1[i]);
  },

  // Get elementwise difference of vectors
  vDiff(vector0, vector1) {
    return vector0.map((e, i) => e - vector1[i]);
  },

  // Get product of vector and scalar
  vMult(vector, scalar) {
    return vector.map((e) => e * scalar);
  },

  // Get distance between two points
  distance(from, to) {
    return Math.hypot(...this.vDiff(to, from));
  },

  // Get unit vector of direction from point to point
  direction(from, to) {
    const vector = this.vDiff(to, from);
    const norm = Math.hypot(...vector);
    return this.vMult(vector, 1 / norm);
  },

  // Get sup norm of vector
  supNorm(vector) {
    const vAbs = vector.map((u) => Math.abs(u));
    return Math.max(...vAbs);
  },

  // Generate random unit vector
  randomUnitVector() {
    const theta = Math.random() * 2 * Math.PI;
    return [Math.cos(theta), Math.sin(theta)];
  },

  // Generate random vector with unit sup norm
  randomUnitSupNormVector() {
    const a = Math.random() * 2 - 1;
    const u = Math.trunc(Math.random() * 4);
    const b = u & 1 ? -1 : 1;
    return u & 2 ? [a, b] : [b, a];
  },
};
