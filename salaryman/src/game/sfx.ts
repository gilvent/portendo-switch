import { buzz, noise, tone } from '../core/audio.ts';

// The game's sound palette. Each answer has its own; `power` (0..1) scales the heavy ones by how hard the thing was hit.
let stepFoot = 0;
export const sfx = {
  step: () => { stepFoot ^= 1; noise({ d: .05, f: stepFoot ? 900 : 760, q: 1.5, v: .18 }); },
  jump: () => { tone({ f: 330, to: 620, d: .12, type: 'sine', v: .22 }); noise({ d: .06, f: 1800, q: .8, v: .12 }); },
  land: (power = .5) => { noise({ d: .08 + power * .06, f: 420 - power * 200, q: .9, v: .25 + power * .3 }); if (power > .6) buzz(18); },
  use: () => { tone({ f: 660, d: .07, type: 'square', v: .12 }); tone({ f: 990, d: .1, type: 'square', v: .12, at: .06 }); },
  paper: () => { noise({ d: .14, f: 3200, to: 1400, q: .7, v: .3 }); },
  fold: () => { noise({ d: .09, f: 2200, q: 1.2, v: .3 }); noise({ d: .12, f: 900, q: 1, v: .25, at: .07 }); },
  pop: () => { tone({ f: 520, to: 880, d: .09, type: 'sine', v: .3 }); },
  bonk: (power = .5) => { tone({ f: 240 - power * 60, to: 120, d: .12, type: 'triangle', v: .3 + power * .2 }); noise({ d: .05, f: 1200, q: 1, v: .2 }); if (power > .5) buzz(14); },
  deny: () => { tone({ f: 200, d: .14, type: 'sawtooth', v: .18 }); tone({ f: 150, d: .18, type: 'sawtooth', v: .18, at: .12 }); buzz([20, 40, 20]); },
  beep: () => { tone({ f: 1320, d: .08, type: 'square', v: .12 }); tone({ f: 1760, d: .12, type: 'square', v: .12, at: .09 }); },
  // Brace: three falling notes that end as the pull begins, a pulse with each.
  chime: () => { [784, 659, 523].forEach((f, i) => tone({ f, d: .4, type: 'sine', v: .22, at: i * .2 })); buzz([12, 188, 12, 188, 12]); },
  jingle: (notes: number[]) => { notes.forEach((f, i) => tone({ f, d: .4, type: 'sine', v: .2, at: i * .2 })); buzz([12, 188, 12, 188, 12]); },
  // Doors: the platform's closing ticks, used in the car too.
  tick: (late = false) => { tone({ f: late ? 1480 : 1180, d: .06, type: 'square', v: late ? .12 : .08 }); },
  // The train: a lurch with a rising whine as it pulls; a falling squeal as it brakes.
  lurch: () => { noise({ d: .1, f: 420, q: 1, v: .4 }); tone({ f: 98, to: 196, d: 1.2, type: 'triangle', v: .1 }); tone({ f: 392, to: 784, d: 1.2, type: 'sine', v: .03 }); buzz(40); },
  squeal: (v = 1) => { tone({ f: 2100, to: 1500, d: 1, type: 'sine', v: .045 * v }); noise({ d: 1, f: 3000, to: 900, q: 1, v: .1 * v }); buzz(25); },
  // The console meets the dock.
  clack: (v = 1) => { noise({ d: .03, f: 2600, q: 4, v: .5 * v }); tone({ f: 180, to: 90, d: .08, type: 'square', v: .3 * v }); noise({ d: .06, f: 700, q: 1, v: .3 * v, at: .01 }); buzz(35); },
  // He is paper: a crumple is paper.
  crumple: () => { for (let i = 0; i < 6; i++) noise({ d: .05, f: 2000 + Math.random() * 3000, q: 2, v: .3, at: i * .03 }); tone({ f: 200, to: 110, d: .12, type: 'triangle', v: .3 }); buzz([30, 40, 15]); },
  grip: () => { noise({ d: .06, f: 500, q: 3, v: .3 }); tone({ f: 300, to: 260, d: .08, type: 'triangle', v: .2 }); buzz(12); },
  creak: () => { noise({ d: .12, f: 700, to: 500, q: 6, v: .1 }); },
  clap: () => { [0, .12, .24].forEach(at => noise({ d: .03, f: 1800, q: 2, v: .2, at })); },
  fwip: () => { noise({ d: .09, f: 4000, to: 1500, q: 1, v: .25 }); buzz(8); },
  scuff: () => { noise({ d: .09, f: 2600, to: 1800, q: 2, v: .12 }); },
  // A prompt comes up: quieter than any toy's answer.
  near: () => { noise({ d: .025, f: 2600, q: 2, v: .1 }); },
  card: () => { noise({ d: .14, f: 3200, to: 1400, q: .7, v: .3 }); tone({ f: 880, d: .08, type: 'sine', v: .15 }); },
  relay: () => { noise({ d: .02, f: 1800, q: 5, v: .25 }); tone({ f: 220, to: 180, d: .15, type: 'sine', v: .07 }); },
  // Home: G-B-D rising, then a held C. The line's last jingle is G; this resolves it.
  home: () => { [392, 494, 587].forEach((f, i) => tone({ f, d: .6, type: 'sine', v: .16, at: i * .18 })); [131, 262, 523, 659, 784].forEach((f, i) => tone({ f, d: 1.6 + i * .05, type: 'sine', v: i < 2 ? .1 : .12, at: .72 })); },
  ding: () => { tone({ f: 1046, d: .5, type: 'sine', v: .2 }); tone({ f: 1568, d: .4, type: 'sine', v: .1, at: .02 }); },
  // The signature: a hole in the ticket, and nothing else. A click (ka), a gap, a thud (chunk), the chad fluttering.
  punch: (star = false) => {
    noise({ d: .025, f: 3800, q: 3, v: .45 }); tone({ f: 1900, to: 900, d: .03, type: 'square', v: .1 });
    noise({ d: .09, f: 520, q: .9, v: .55, at: .07 }); tone({ f: 150, to: 75, d: .14, type: 'sine', v: .45, at: .07 });
    noise({ d: .12, f: 5200, to: 2600, q: 1, v: .08, at: .2 });
    if (star) [523, 659, 784, 1046].forEach((f, i) => tone({ f, d: .22, type: 'triangle', v: .16, at: .2 + i * .07 }));
    buzz(star ? [8, 60, 26, 70, 12, 30, 12] : [8, 60, 26]);
  },
  whoosh: (d = .35, from = 400, to = 2400) => { noise({ d, f: from, to, q: .6, v: .25 }); },
  whirr: () => { noise({ d: .55, f: 1200, to: 300, q: .8, v: .12 }); },
  doors: () => { noise({ d: .45, f: 700, to: 300, q: .7, v: .25 }); tone({ f: 90, d: .15, type: 'sine', v: .3, at: .4 }); noise({ d: .05, f: 600, q: 1, v: .3, at: .4 }); }
};
export type Sfx = keyof typeof sfx;
