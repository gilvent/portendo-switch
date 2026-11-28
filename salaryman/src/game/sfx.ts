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
  chime: () => { [784, 659, 523].forEach((f, i) => tone({ f, d: .7, type: 'sine', v: .22, at: i * .28 })); },
  ding: () => { tone({ f: 1046, d: .5, type: 'sine', v: .2 }); tone({ f: 1568, d: .4, type: 'sine', v: .1, at: .02 }); },
  find: () => { [523, 659, 784, 1046].forEach((f, i) => tone({ f, d: .22, type: 'triangle', v: .2, at: i * .07 })); buzz([12, 30, 12]); },
  stamp: () => { noise({ d: .07, f: 300, q: .8, v: .5 }); tone({ f: 110, d: .1, type: 'sine', v: .4 }); buzz(30); },
  whoosh: () => { noise({ d: .35, f: 400, to: 2400, q: .6, v: .25 }); },
  doors: () => { noise({ d: .45, f: 700, to: 300, q: .7, v: .25 }); tone({ f: 90, d: .15, type: 'sine', v: .3, at: .4 }); }
};
export type Sfx = keyof typeof sfx;
