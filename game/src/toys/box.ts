// A toybox is what makes one space's paper answer: it reads the toys' states and poses the scene's actors to match,
// and it watches where he is for the things that work on presence alone. The state itself lives in the game
// (game.ts): a toybox only ever shows it, so a deep link, the route sheet and a mashed button all end in the same place.
import type { Toys } from '../art/fold.tsx';
import type { Fx } from '../fx.ts';
import { play as sound, type Sound } from '../sfx.ts';
import type { Rig, Tl } from './rig.ts';

// Where he is this frame: his feet on the floor plan, how high he has jumped, how fast he is going (0..1).
export type Hero = { x: number; z: number; y: number; speed: number };
export type Ctx = { rig: Rig; fx: Fx; toys: Toys; hero: Hero; say(x: number, y: number, z: number, glyph: string): void; sfx(name: Sound, delay?: number): void };
export type Toybox = {
  // The toys changed (or, with `first`, the space has just opened: snap everything, play nothing).
  sync(c: Ctx, first: boolean): void;
  // Every frame, with where he is.
  frame?(c: Ctx, dt: number): void;
  // He has just come into reach of a stop: its toy stirs, so he sees what the A is for.
  near?(c: Ctx, stop: string): void;
};
// One toy's view. `read` picks its state out of the toys; `rest` stands the pieces where that state leaves them;
// `play` builds the motion from one state to the next. A view with no `play` just snaps.
export type View<S> = { key: string; read(t: Toys): S; rest(c: Ctx, s: S): void; play?(c: Ctx, tl: Tl, from: S, to: S): void };
export const view = <S>(v: View<S>) => v as View<unknown>;
export function runner(views: View<unknown>[]) {
  const last = new Map<string, { k: string; s: unknown }>();
  return (c: Ctx, first: boolean) => {
    for (const v of views) {
      const s = v.read(c.toys), k = JSON.stringify(s), old = last.get(v.key);
      if (old && old.k === k) continue;
      last.set(v.key, { k, s });
      if (first || !old || !v.play) v.rest(c, s);
      else c.rig.play(v.key, tl => v.play!(c, tl, old.s, s), () => v.rest(c, s));
    }
  };
}
// Things that hang where his head can reach: a jump under one knocks it, and it swings about its fixing.
export type Hanger = { actor: string; x: number; z: number; y: number; r?: number; sound?: Sound };
export const HEAD = 137;
export function hangers(list: Hanger[]) {
  const hit = new Map<string, number>();
  const swing = (c: Ctx, h: Hanger, dir: number, amp = 15) => c.rig.play(`hang-${h.actor}`, tl => { tl.to(h.actor, { rz: dir * amp }, .09, 0, 'power2.out').to(h.actor, { rz: -dir * amp * .6 }, .2, undefined, 'sine.inOut').to(h.actor, { rz: dir * amp * .3 }, .2, undefined, 'sine.inOut').to(h.actor, { rz: 0 }, .22, undefined, 'sine.inOut'); }, () => c.rig.set(h.actor, { rz: 0 }), 18);
  return {
    swing: (c: Ctx, actor: string, dir = 1, amp?: number) => { const h = list.find(k => k.actor === actor); if (h) swing(c, h, dir, amp); },
    frame(c: Ctx) {
      if (c.hero.y <= 0) return;
      const now = performance.now();
      for (const h of list) {
        if (c.hero.y + HEAD < h.y - 6 || Math.abs(c.hero.x - h.x) > (h.r ?? 42) || Math.abs(c.hero.z - h.z) > 46 || now - (hit.get(h.actor) ?? -1e9) < 700) continue;
        hit.set(h.actor, now); swing(c, h, c.hero.x <= h.x ? 1 : -1); c.sfx(h.sound ?? 'tap');
      }
    }
  };
}
export const sfx = sound;
