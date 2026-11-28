// Every sound is synthesised: no samples to load, and each can be pitched by how hard the thing was hit. Nothing plays
// until the player has pressed something; one switch mutes it all. Phones also buzz for the heavy answers.
type Tone = { f: number; to?: number; d: number; type?: OscillatorType; v?: number; at?: number };
type Noise = { d: number; f: number; to?: number; q?: number; v?: number; at?: number; type?: BiquadFilterType };
let ctx: AudioContext | null = null, out: GainNode | null = null, noiseBuf: AudioBuffer | null = null;
let muted = (() => { try { return localStorage.getItem('ps-mute') === '1'; } catch { return false; } })();

function ready() {
  if (muted || typeof AudioContext === 'undefined') return null;
  if (!navigator.userActivation?.hasBeenActive) return null;
  if (!ctx) {
    ctx = new AudioContext(); out = ctx.createGain(); out.gain.value = .22;
    const comp = ctx.createDynamicsCompressor(); out.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
export function tone({ f, to, d, type = 'triangle', v = .5, at = 0 }: Tone) {
  const c = ready(); if (!c || !out) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(out); o.start(t); o.stop(t + d + .03);
}
export function noise({ d, f, to, q = 1, v = .5, at = 0, type = 'bandpass' }: Noise) {
  const c = ready(); if (!c || !out || !noiseBuf) return;
  const n = c.createBufferSource(), flt = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + at;
  n.buffer = noiseBuf; n.loop = true; flt.type = type; flt.Q.value = q; flt.frequency.setValueAtTime(f, t); if (to) flt.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(.02, d / 3)); g.gain.exponentialRampToValueAtTime(.001, t + d);
  n.connect(flt).connect(g).connect(out); n.start(t, Math.random()); n.stop(t + d + .03);
}
// A held sound whose loudness and pitch the game sets every frame (the train's rumble).
export function bed(f: number, q = .8) {
  let src: AudioBufferSourceNode | null = null, flt: BiquadFilterNode | null = null, g: GainNode | null = null;
  return {
    set(level: number, pitch = 1) {
      const c = ready(); if (!c || !out || !noiseBuf) return;
      if (!src) { src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true; flt = c.createBiquadFilter(); flt.type = 'lowpass'; flt.Q.value = q; g = c.createGain(); g.gain.value = 0; src.connect(flt).connect(g).connect(out); src.start(); }
      g!.gain.setTargetAtTime(Math.max(0, level), c.currentTime, .08); flt!.frequency.setTargetAtTime(f * pitch, c.currentTime, .08);
    }
  };
}
export const buzz = (ms: number | number[]) => { try { if (!muted) navigator.vibrate?.(ms); } catch { /* not a phone */ } };
export const isMuted = () => muted;
export function setMuted(m: boolean) { muted = m; try { localStorage.setItem('ps-mute', m ? '1' : '0'); } catch { /* private window */ } if (out) out.gain.value = m ? 0 : .22; }
