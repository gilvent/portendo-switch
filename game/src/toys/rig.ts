// The live paper: what a toy script uses to move the actors of a scene (art/fold.tsx draws them). Poses are in world
// units, y up. Motion is built as an ordinary smooth timeline and then shown at paper's frame rate: the timeline is
// stepped through in whole frames, so an arc, a flip and a squash all land on the same beats.
import gsap from 'gsap';
import { LIGHT } from '../light.ts';

// rx tips the top toward the camera, ry turns the piece like a door about its upright, rz rolls it in its own plane.
export type Pose = { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; sx?: number; sy?: number; s?: number; show?: boolean };
export const PAPER_FPS = 14;
const vars = (p: Pose): gsap.TweenVars => {
  const v: gsap.TweenVars = {};
  if (p.x !== undefined) v.x = p.x; if (p.y !== undefined) v.y = -p.y; if (p.z !== undefined) v.z = p.z;
  if (p.rx !== undefined) v.rotationX = p.rx; if (p.ry !== undefined) v.rotationY = p.ry; if (p.rz !== undefined) v.rotation = p.rz;
  if (p.s !== undefined) { v.scaleX = p.s; v.scaleY = p.s; } if (p.sx !== undefined) v.scaleX = p.sx; if (p.sy !== undefined) v.scaleY = p.sy;
  if (p.show !== undefined) v.autoAlpha = p.show ? 1 : 0;
  return v;
};
export const REST: Pose = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1 };

export type Rig = {
  calm: boolean;
  el(name: string): HTMLElement | null;
  // Snap an actor to a pose (missing parts keep their value).
  set(name: string, p: Pose): void;
  // Run a transition under `key`. Anything still running under that key is dropped first: its `settle` is called so
  // the pieces stand where that transition would have left them, then `build` adds the new motion to a fresh timeline.
  play(key: string, build: (tl: Tl) => void, settle: () => void, fps?: number): void;
  // Stop everything (the scene is going away).
  kill(): void;
};
// A timeline that speaks poses. `at` is a timeline position (seconds, or gsap's '<', '>-.1' forms).
export type Tl = {
  to(name: string, p: Pose, dur: number, at?: gsap.Position, ease?: string): Tl;
  set(name: string, p: Pose, at?: gsap.Position): Tl;
  // A throw: across to [x, z] in a straight line while y rises to `peak` and falls to `y`.
  arc(name: string, to: { x?: number; y?: number; z?: number }, peak: number, dur: number, at?: gsap.Position): Tl;
  // A squash on landing (or any knock): squeezes to `sy` and springs back.
  squash(name: string, sy: number, at?: gsap.Position, dur?: number): Tl;
  // Sounds and paper bits: skipped when the transition is dropped half way.
  call(f: () => void, at?: gsap.Position): Tl;
  raw: gsap.core.Timeline;
};

export function makeRig(root: HTMLElement, calm: boolean): Rig {
  const els = new Map<string, HTMLElement | null>();
  const el = (name: string) => { if (!els.has(name)) els.set(name, root.querySelector<HTMLElement>(`[data-actor="${name}"]`)); return els.get(name) ?? null; };
  const running = new Map<string, { drive: gsap.core.Tween; tl: gsap.core.Timeline; settle: () => void }>();
  // A travelling actor's shadow stays on the ground beneath it, slides away from the sun as it rises, and thins.
  const shadows = [...root.querySelectorAll<HTMLElement>('[data-shadow]')].map(s => ({ s, a: el(s.dataset.shadow ?? '') })).filter(k => k.a);
  const follow = () => { for (const { s, a } of shadows) { const x = +gsap.getProperty(a!, 'x'), y = -+gsap.getProperty(a!, 'y'), z = +gsap.getProperty(a!, 'z'), up = Math.max(0, y); s.style.transform = `translate3d(${(x + up * LIGHT.dx).toFixed(1)}px,calc(var(--drop) - 1px),${(z - up * LIGHT.dy * .5).toFixed(1)}px) rotateX(90deg) scale(${(1 - Math.min(.5, up / 300)).toFixed(2)})`; s.style.opacity = getComputedStyle(a!).visibility === 'hidden' ? '0' : (1 - Math.min(.6, up / 240)).toFixed(2); } };
  if (shadows.length) { gsap.ticker.add(follow); follow(); }
  const wrap = (raw: gsap.core.Timeline): Tl => {
    const t: Tl = {
      raw,
      to(name, p, dur, at, ease = 'power2.out') { const e = el(name); if (e) raw.to(e, { ...vars(p), duration: dur, ease }, at); return t; },
      set(name, p, at) { const e = el(name); if (e) raw.set(e, vars(p), at); return t; },
      arc(name, to, peak, dur, at) {
        const e = el(name); if (!e) return t;
        const y0 = -+gsap.getProperty(e, 'y'), y1 = to.y ?? y0, top = Math.max(y0, y1) + peak, up = Math.sqrt(top - y0), down = Math.sqrt(top - y1), k = up / (up + down || 1);
        raw.addLabel(`arc${raw.getChildren().length}`, at);
        const label = `arc${raw.getChildren().length}`;
        raw.to(e, { x: to.x, z: to.z, duration: dur, ease: 'none' }, label).to(e, { y: -top, duration: dur * k, ease: 'power1.out' }, label).to(e, { y: -y1, duration: dur * (1 - k), ease: 'power1.in' }, `${label}+=${dur * k}`);
        return t;
      },
      squash(name, sy, at, dur = .22) { const e = el(name); if (e) raw.to(e, { scaleY: sy, scaleX: 1 + (1 - sy) * .6, duration: dur * .3, ease: 'power2.out' }, at).to(e, { scaleY: 1, scaleX: 1, duration: dur * .7, ease: 'back.out(3)' }); return t; },
      call(f, at) { raw.call(f, undefined, at); return t; }
    };
    return t;
  };
  return {
    calm, el,
    set(name, p) { const e = el(name); if (e) gsap.set(e, vars(p)); },
    play(key, build, settle, fps = PAPER_FPS) {
      const old = running.get(key);
      if (old) { old.drive.kill(); old.tl.kill(); old.settle(); running.delete(key); }
      if (calm) { settle(); return; }
      const tl = gsap.timeline({ paused: true });
      build(wrap(tl));
      const dur = tl.duration();
      if (!dur) { settle(); return; }
      const drive = gsap.to(tl, { progress: 1, duration: dur, ease: `steps(${Math.max(1, Math.round(dur * fps))})`, onComplete: () => { running.delete(key); settle(); } });
      running.set(key, { drive, tl, settle });
    },
    kill() { for (const r of running.values()) { r.drive.kill(); r.tl.kill(); } running.clear(); gsap.ticker.remove(follow); }
  };
}
