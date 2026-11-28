// Paper foley, made on the spot: every sound is a short burst of filtered noise or a sine blip, so nothing is loaded.
// Sound starts with the visitor's first press (browsers allow no earlier) and can be turned off; the choice is kept.
export type Sound = 'tap' | 'flip' | 'thump' | 'pop' | 'flutter' | 'rip' | 'shutter' | 'ding' | 'slide' | 'peel' | 'whoosh' | 'beep' | 'chime' | 'squeal' | 'clack' | 'buzz' | 'arrive';
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
  whoosh: t => { hiss(t, 240, 300, 1300, .2, .7); },
  beep: t => { blip(t, 90, 1320, 1320, .16, 'square'); blip(t + .11, 140, 1760, 1760, .16, 'square'); },
  chime: t => { blip(t, 520, 880, 876, .2); blip(t + .34, 760, 659, 656, .2); },
  squeal: t => { hiss(t, 620, 3400, 1500, .1, 9); hiss(t, 520, 500, 160, .26, .8); },
  clack: t => { blip(t, 50, 110, 60, .34); hiss(t, 26, 1500, 700, .14, 2); blip(t + .13, 46, 100, 56, .26); hiss(t + .13, 24, 1400, 650, .1, 2); },
  buzz: t => { blip(t, 220, 140, 138, .16, 'sawtooth'); },
  // A train coming in: a low roar that swells for two seconds, then the brakes.
  arrive: t => { if (!ctx || !noise || !out) return; const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = noise; src.loop = true; f.type = 'lowpass'; f.frequency.setValueAtTime(90, t); f.frequency.linearRampToValueAtTime(520, t + 1.5); f.frequency.linearRampToValueAtTime(140, t + 2.2); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + 1.4); g.gain.linearRampToValueAtTime(0, t + 2.3); src.connect(f).connect(g).connect(out); src.start(t); src.stop(t + 2.4); hiss(t + 1.5, 620, 3400, 1500, .08, 9); }
};
// How long each sound buzzes a phone, in milliseconds: the knocks and thumps are felt as well as heard.
const FELT: Partial<Record<Sound, number>> = { thump: 22, tap: 8, pop: 10, shutter: 14, clack: 6, beep: 12, flip: 6, squeal: 30 };
const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
function felt(ms: number, delay: number) {
  // Only on a touch device, and only once he has touched it: browsers refuse a buzz before that.
  if (calm() || typeof navigator === 'undefined' || !navigator.vibrate || !navigator.userActivation?.hasBeenActive || !matchMedia('(pointer:coarse)').matches) return;
  if (delay > 0) window.setTimeout(() => { try { navigator.vibrate(ms); } catch { /* not allowed here */ } }, delay * 1000);
  else try { navigator.vibrate(ms); } catch { /* not allowed here */ }
}
// The train's running sound: one low rumble that follows its speed (0 stopped, 1 cruising). Call with 0 to let it die.
let humG: GainNode | null = null, humF: BiquadFilterNode | null = null, humS: AudioBufferSourceNode | null = null;
export function hum(level: number) {
  if (!on || !ctx || ctx.state !== 'running' || !noise || !out) { if (humG && ctx) humG.gain.setTargetAtTime(0, ctx.currentTime, .1); return; }
  if (!humS) { humS = ctx.createBufferSource(); humF = ctx.createBiquadFilter(); humG = ctx.createGain(); humS.buffer = noise; humS.loop = true; humF.type = 'lowpass'; humG.gain.value = 0; humS.connect(humF).connect(humG).connect(out); humS.start(); }
  humG!.gain.setTargetAtTime(Math.max(0, level) * .16, ctx.currentTime, .12); humF!.frequency.setTargetAtTime(110 + level * 240, ctx.currentTime, .12);
}
export function play(name: Sound, delay = 0) {
  const ms = FELT[name]; if (ms) felt(ms, delay);
  if (!on || !ctx || ctx.state !== 'running') return;
  KIT[name](ctx.currentTime + delay);
}
