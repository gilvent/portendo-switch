// Paper foley, made on the spot: every sound is a short burst of filtered noise or a sine blip, so nothing is loaded.
// Sound starts with the visitor's first press (browsers allow no earlier) and can be turned off; the choice is kept.
export type Sound = 'tap' | 'flip' | 'thump' | 'pop' | 'flutter' | 'rip' | 'shutter' | 'ding' | 'slide' | 'peel' | 'whoosh';
let ctx: AudioContext | null = null, noise: AudioBuffer | null = null, out: GainNode | null = null;
const KEY = 'paper-sound';
let on = (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } })();
export const soundOn = () => on;
export const setSound = (v: boolean) => { on = v; try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch { /* private window: the choice lasts for this visit */ } };
// Call from a key press or tap: the browser lets sound start only then.
export function wake() {
  if (!on) return;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC(); out = ctx.createGain(); out.gain.value = .5; out.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); let s = 1234567;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; }
  }
  if (ctx.state === 'suspended') void ctx.resume();
}
// One burst of noise through a band filter sweeping f0 -> f1, with a fast attack and a decay of `ms`.
function hiss(t: number, ms: number, f0: number, f1: number, gain: number, q = 1.2) {
  if (!ctx || !noise || !out) return;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), d = ms / 1000;
  src.buffer = noise; src.loop = true; f.type = 'bandpass'; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  src.connect(f).connect(g).connect(out); src.start(t, (t * 7.3) % .8); src.stop(t + d + .02);
}
function blip(t: number, ms: number, f0: number, f1: number, gain: number, type: OscillatorType = 'sine') {
  if (!ctx || !out) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), d = ms / 1000;
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(out); o.start(t); o.stop(t + d + .02);
}
const KIT: Record<Sound, (t: number) => void> = {
  tap: t => { hiss(t, 45, 2600, 1400, .35, 2); },
  flip: t => { hiss(t, 90, 900, 3200, .3); hiss(t + .09, 50, 2400, 1200, .22, 2); },
  thump: t => { blip(t, 110, 150, 55, .7); hiss(t, 60, 700, 300, .3); },
  pop: t => { blip(t, 70, 380, 760, .35, 'triangle'); },
  flutter: t => { for (let i = 0; i < 4; i++) hiss(t + i * .07, 55, 1800 + i * 300, 900, .16, 3); },
  rip: t => { hiss(t, 170, 700, 4200, .34, .8); },
  shutter: t => { hiss(t, 22, 5200, 3000, .5, 3); hiss(t + .06, 30, 3600, 1800, .4, 3); blip(t, 40, 1900, 900, .12, 'square'); },
  ding: t => { blip(t, 620, 1568, 1560, .2); blip(t, 420, 2349, 2340, .1); },
  slide: t => { hiss(t, 200, 500, 1500, .22, .9); },
  peel: t => { hiss(t, 130, 3000, 900, .26, 1.5); },
  whoosh: t => { hiss(t, 240, 300, 1300, .2, .7); }
};
export function play(name: Sound, delay = 0) {
  if (!on || !ctx || ctx.state !== 'running') return;
  KIT[name](ctx.currentTime + delay);
}
