export const geometry = {

  // Get angle of vector from 0 to 2π
  angle(vector) {
    const s = Math.atan2(vector[1], vector[0]);
    return s < 0 ? s + 2 * Math.PI : s;
  },
  
  // Generate random unit vector
  randomUnitVector() {
    const theta = Math.random() * 2 * Math.PI;
    return [Math.cos(theta), Math.sin(theta)];
  },

};
