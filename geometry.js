export default {

  // Get angle of vector from 0 to 2π
  angle(vector) {
    const s = Math.atan2(vector[1], vector[0]);
    return s < 0 ? s + 2 * Math.PI : s;
  },
  
  // Get angle between two vectors (from 0 to π)
  angleBetween(u, v) {
    const dotProduct = u[0] * v[0] + u[1] * v[1];
    const norms = Math.hypot(...u) * Math.hypot(...v);
    return Math.acos(dotProduct / norms);
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
