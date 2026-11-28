// The MRT's physics: no drawing, no DOM. One train, whose acceleration `a` is the only force in the car; pendulums
// (anything that hangs); and a roller (the drinks can). docs/MRT_DESIGN.md says what each is for.
// Units: the scene's own (about a pixel), seconds, radians. x runs along the car, toward the front of the train.

export const TUNE = {
  // Seconds from a stand to line speed, and from line speed to a stand. The brake ends abruptly on purpose: the
  // force lets go all at once, and everything that was hanging forward swings back. That is the lurch.
  depart: 2.2, brake: 1.15,
  // Cruising: a notch of power or brake of `notchA` for `notchFor` seconds, every `notchEvery` seconds.
  notchEvery: [4.5, 8] as const, notchA: .2, notchFor: .5,
  // How hard one unit of `a` pushes a loose thing, in units/s².
  push: 1250,
  // Gravity for things that hang: a 62-unit strap swings about once every .9s.
  g: 3000,
  can: { r: 9, share: .34, roll: 120, drag: .5, slide: 1400, bounce: .45, kick: 1.1, still: 70, flat: 2.2 },
  // The salaryman: how far a unit of `a` slides his feet (units/s), tips him (degrees), and carries him in the air.
  hero: { slide: 46, lean: 9, air: 420 }
};

export type Train = { v: number; a: number; want: number; mode: 'depart' | 'cruise' | 'brake' | 'stand'; wait: number; notch: number };
export const newTrain = (moving = false): Train => ({ v: moving ? 1 : 0, a: 0, want: 0, mode: moving ? 'cruise' : 'stand', wait: 3, notch: 0 });
export function depart(t: Train) { if (t.mode === 'stand') { t.mode = 'depart'; t.want = 1 / TUNE.depart; } }
export function brake(t: Train) { if (t.mode !== 'stand') { t.mode = 'brake'; t.want = -Math.max(.35, t.v) / TUNE.brake; } }
// `rand` is 0..1: the sim never rolls its own dice, so a test can hold it still.
export function stepTrain(t: Train, dt: number, rand: () => number) {
  if (t.mode === 'stand') { t.a = 0; t.v = 0; return; }
  if (t.mode === 'cruise') {
    if (t.notch > 0) { t.notch -= dt; if (t.notch <= 0) t.want = 0; }
    else if ((t.wait -= dt) <= 0) {
      const [lo, hi] = TUNE.notchEvery;
      t.wait = lo + rand() * (hi - lo); t.notch = TUNE.notchFor;
      // Below line speed it takes power; at line speed it brakes a little. So it wanders, and never drifts off.
      t.want = (t.v < .94 ? 1 : -1) * TUNE.notchA;
    }
  }
  // The driver's hand is quick but not instant.
  t.a += (t.want - t.a) * Math.min(1, dt * 9);
  t.v += t.a * dt;
  if (t.mode === 'depart' && t.v >= 1) { t.v = 1; t.mode = 'cruise'; t.want = 0; t.wait = 2.5; }
  if (t.mode === 'cruise') t.v = Math.min(1, Math.max(.84, t.v));
  if (t.mode === 'brake' && t.v <= 0) { t.v = 0; t.a = 0; t.want = 0; t.mode = 'stand'; }
}

// Anything that hangs. `th` is its angle from straight down, positive when its foot is toward +x.
export type Pend = { th: number; om: number; len: number; damp: number; max: number };
export const pend = (len: number, damp = 1.5, max = 1.25): Pend => ({ th: 0, om: 0, len, damp, max });
// ax: the acceleration of whatever it hangs from, along x, in units/s².
export function stepPend(p: Pend, ax: number, dt: number) {
  // Two half steps: a short strap is stiff, and a slow frame must not blow it up.
  for (let i = 0; i < 2; i++) {
    const h = dt / 2;
    p.om += (-(TUNE.g / p.len) * Math.sin(p.th) - (ax / p.len) * Math.cos(p.th) - p.damp * p.om) * h;
    p.th += p.om * h;
    if (Math.abs(p.th) > p.max) { p.th = Math.sign(p.th) * p.max; p.om *= -.35; }
  }
}
export const resting = (p: Pend) => Math.abs(p.th) < .004 && Math.abs(p.om) < .02;

// The drinks can: it rolls along the car and only scrapes across it.
export type Can = { x: number; z: number; vx: number; vz: number; turn: number; flat: number };
export type Box = { x0: number; x1: number; z0: number; z1: number };
// Returns how hard it hit an end wall this step (units/s), or 0.
export function stepCan(c: Can, ax: number, dt: number, b: Box): number {
  const k = TUNE.can;
  if (c.flat > 0) { c.flat -= dt; c.vx = 0; c.vz = 0; return 0; }
  const f = ax * k.share;
  // Standing still, it needs a real shove to start: the small notches only rock it.
  if (Math.abs(c.vx) > 3 || Math.abs(f) > k.still) c.vx += f * dt;
  const slow = (v: number, d: number) => (Math.abs(v) <= d ? 0 : v - Math.sign(v) * d);
  c.vx = slow(c.vx * (1 - Math.min(1, k.drag * dt)), k.roll * dt); c.vz = slow(c.vz, k.slide * dt);
  c.x += c.vx * dt; c.z += c.vz * dt; c.turn += c.vx * dt / k.r;
  let hit = 0;
  if (c.x < b.x0) { c.x = b.x0; hit = -c.vx; c.vx *= -k.bounce; } else if (c.x > b.x1) { c.x = b.x1; hit = c.vx; c.vx *= -k.bounce; }
  if (c.z < b.z0) { c.z = b.z0; c.vz = 0; } else if (c.z > b.z1) { c.z = b.z1; c.vz = 0; }
  return hit > 60 ? hit : 0;
}
