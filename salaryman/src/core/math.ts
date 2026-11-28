export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Frame-rate independent approach: covers `rate` of the remaining distance per second (as 1 - e^-rate*dt).
export const damp = (a: number, b: number, rate: number, dt: number) => lerp(a, b, 1 - Math.exp(-rate * dt));
export const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  outElastic: (t: number) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1)
};
// A damped spring: the motion of anything paper that is knocked and settles.
export class Spring {
  v = 0;
  constructor(public x = 0, public k = 180, public d = 12) {}
  step(target: number, dt: number) { this.v += ((target - this.x) * this.k - this.v * this.d) * dt; this.x += this.v * dt; return this.x; }
  kick(dv: number) { this.v += dv; }
}
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
