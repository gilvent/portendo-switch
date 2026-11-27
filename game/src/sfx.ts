// Every answer has a sound of its own, synthesised: no samples. Nothing plays before the player has pressed
// something (browsers do not allow it, and neither should a portfolio), and one switch mutes all of it.
type Tone = { f: number; to?: number; d: number; type?: OscillatorType; v?: number; at?: number };
type Hiss = { d: number; f: number; to?: number; q?: number; v?: number; at?: number };
let ctx: AudioContext | null = null, out: GainNode | null = null, buf: AudioBuffer | null = null;
let muted = (() => { try { return localStorage.getItem('mute') === '1'; } catch { return false; } })();
const last = new Map<string, number>();

function ready() {
  if (muted || typeof AudioContext === 'undefined' || !navigator.userActivation?.hasBeenActive) return null;
  if (!ctx) {
    ctx = new AudioContext(); out = ctx.createGain(); out.gain.value = .2; out.connect(ctx.destination);
    buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = buf.getChannelData(0); let s = 7;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
function tone({ f, to, d, type = 'triangle', v = .5, at = 0 }: Tone) {
  const c = ready(); if (!c || !out) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(out); o.start(t); o.stop(t + d + .02);
}
function hiss({ d, f, to, q = 1, v = .5, at = 0 }: Hiss) {
  const c = ready(); if (!c || !out || !buf) return;
  const n = c.createBufferSource(), flt = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + at;
  n.buffer = buf; n.loop = true; flt.type = 'bandpass'; flt.Q.value = q; flt.frequency.setValueAtTime(f, t); if (to) flt.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(.03, d / 3)); g.gain.exponentialRampToValueAtTime(.001, t + d);
  n.connect(flt).connect(g).connect(out); n.start(t); n.stop(t + d + .02);
}

const SOUNDS = {
  // The platform.
  beep: () => { tone({ f: 1320, d: .09, type: 'square', v: .25 }); tone({ f: 1760, d: .14, type: 'square', v: .25, at: .1 }); },
  deny: () => { tone({ f: 190, d: .16, type: 'sawtooth', v: .3 }); tone({ f: 150, d: .2, type: 'sawtooth', v: .3, at: .12 }); },
  clack: () => { hiss({ d: .06, f: 2400, q: 2, v: .6 }); tone({ f: 320, to: 140, d: .07, v: .4 }); },
  rattle: () => { for (let i = 0; i < 3; i++) hiss({ d: .04, f: 1800 + i * 300, q: 3, v: .4, at: i * .05 }); },
  flap: () => { for (let i = 0; i < 6; i++) hiss({ d: .025, f: 3200, q: 4, v: .3, at: i * .035 }); },
  arrive: () => { hiss({ d: 2.1, f: 180, to: 90, q: .7, v: .9 }); hiss({ d: .9, f: 5200, to: 2600, q: 6, v: .16, at: 1.2 }); },
  leave: () => { hiss({ d: 1.4, f: 90, to: 260, q: .7, v: .8 }); },
  // The train.
  chime: () => { [784, 659, 523].forEach((f, i) => tone({ f, d: .5, type: 'sine', v: .4, at: i * .2 })); },
  doors: () => { hiss({ d: .42, f: 900, to: 2600, q: 1.2, v: .45 }); tone({ f: 130, d: .1, v: .4, at: .4 }); },
  brake: () => { hiss({ d: 1.1, f: 4200, to: 1500, q: 8, v: .2 }); hiss({ d: 1.2, f: 160, to: 70, q: .8, v: .7 }); },
  tick: () => tone({ f: 1500, d: .04, type: 'square', v: .18 }),
  wind: () => { hiss({ d: .5, f: 500, to: 1400, q: 1.5, v: .35 }); for (let i = 0; i < 5; i++) hiss({ d: .03, f: 2600, q: 5, v: .25, at: .1 + i * .07 }); },
  pickup: () => { tone({ f: 420, to: 640, d: .12, v: .35 }); hiss({ d: .05, f: 2000, q: 2, v: .3 }); },
  // Toys.
  ting: () => { tone({ f: 2100, d: .22, type: 'sine', v: .22 }); tone({ f: 3150, d: .12, type: 'sine', v: .1 }); },
  bonk: () => { tone({ f: 240, to: 120, d: .14, type: 'square', v: .3 }); hiss({ d: .05, f: 900, q: 1, v: .4 }); },
  clink: () => { tone({ f: 1250, d: .07, type: 'square', v: .14 }); tone({ f: 1880, d: .1, type: 'triangle', v: .16, at: .01 }); },
  clank: () => { tone({ f: 620, to: 480, d: .12, type: 'square', v: .2 }); hiss({ d: .08, f: 1400, q: 2, v: .5 }); },
  crunch: () => { for (let i = 0; i < 4; i++) hiss({ d: .05, f: 1200 + i * 500, q: 3, v: .5, at: i * .03 }); },
  pop: () => tone({ f: 380, to: 900, d: .09, v: .3 }),
  // Him.
  jump: () => tone({ f: 300, to: 620, d: .13, type: 'triangle', v: .22 }),
  land: () => { tone({ f: 150, to: 80, d: .08, v: .4 }); hiss({ d: .05, f: 700, q: 1, v: .25 }); },
  use: () => tone({ f: 660, to: 990, d: .08, type: 'triangle', v: .25 }),
  stamp: () => { tone({ f: 110, to: 70, d: .1, v: .6 }); hiss({ d: .06, f: 1000, q: 1, v: .4 }); }
};
export type Sound = keyof typeof SOUNDS;
// `gap`: the same sound will not start again within this many milliseconds (a can rattling along a wall).
export function play(name: Sound, gap = 40) {
  const now = performance.now();
  if (now - (last.get(name) ?? -1e9) < gap) return;
  last.set(name, now);
  try { SOUNDS[name](); } catch { /* a sound is never worth an error */ }
}
export const isMuted = () => muted;
export function setMuted(m: boolean) { muted = m; try { localStorage.setItem('mute', m ? '1' : '0'); } catch { /* private mode */ } if (m && ctx) void ctx.suspend(); }
