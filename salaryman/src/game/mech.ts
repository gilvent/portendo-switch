import * as THREE from 'three';
import { box } from './paper.ts';
import { reducedMotion } from '../core/stage.ts';
import { Spring } from '../core/math.ts';

// The movable-book grammar. Every interactive thing is one of five paper mechanisms (pull-tab, flap, wheel, slot,
// pop-up), and every one is worked the same way: a coral tab that wiggles when he is near (anticipation), a stepped
// snap like stop-motion, an overshoot that settles, then a first-person caption and a punch in the ticket.
export const GRAMMAR = { wiggleNear: 3.6, wiggleEvery: 2.5, wiggleFor: .3, snapFps: 12, settle: .4 };

// A tab: the one affordance. A small coral card with a pale arrow, standing proud of whatever it works.
export function tab(dir: 'left' | 'right' | 'down' | 'up' | 'turn' = 'right', size = .34) {
  const g = new THREE.Group();
  const t = box(size, size * .8, .05, '#e8552d'); t.position.y = -size * .4; g.add(t);
  const arrow = box(size * .45, size * .12, .052, '#fff4e2'); arrow.position.y = 0; g.add(arrow);
  const head = box(size * .14, size * .3, .053, '#fff4e2'); head.position.set(size * .2, 0, 0); g.add(head);
  const rot = { right: 0, left: Math.PI, up: Math.PI / 2, down: -Math.PI / 2, turn: Math.PI / 4 }[dir];
  [arrow, head].forEach(m => { m.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), rot); m.rotation.z = rot; });
  const wob = new Spring(0, 260, 9);
  let clock = Math.random() * 2, done = false;
  return Object.assign(g, {
    // Wiggle every few seconds while he is near and the thing still has something to show.
    tick(dt: number, near: number, alive = true) {
      clock += dt;
      if (alive && !done && near < GRAMMAR.wiggleNear && clock % GRAMMAR.wiggleEvery < dt) wob.kick(9);
      g.rotation.z = (reducedMotion ? 0 : wob.step(0, dt) * .25);
      g.visible = alive;
    },
    kick() { wob.kick(-14); },
    spent(v = true) { done = v; }
  });
}
export type Tab = ReturnType<typeof tab>;

// Stepped time: a snap holds each pose for a frame of a 12 fps stop-motion film, so paper moves in clicks, not glides.
export const stepped = (k: number, fps = GRAMMAR.snapFps, ms = 250) => (reducedMotion ? 1 : Math.min(1, Math.ceil(k * fps * ms / 1000) / (fps * ms / 1000)));

// Little timelines the scenes run: `play(ms, f)` calls f(k) with k from 0 to 1 and resolves at the end.
export class Anims {
  private list: { t: number; ms: number; f: (k: number) => void; done: () => void }[] = [];
  play(ms: number, f: (k: number) => void) {
    if (reducedMotion) { f(1); return Promise.resolve(); }
    return new Promise<void>(done => this.list.push({ t: 0, ms, f, done }));
  }
  wait(ms: number) { return this.play(ms, () => {}); }
  update(dt: number) {
    for (const a of [...this.list]) {
      a.t += dt * 1000; const k = Math.min(1, a.t / a.ms); a.f(k);
      if (k >= 1) { this.list.splice(this.list.indexOf(a), 1); a.done(); }
    }
  }
  clear() { this.list = []; }
}
// The settle after a snap: an object's scale or angle overshoots and wobbles back.
export class Settle {
  s = new Spring(0, 300, 11);
  kick(v = 1) { if (!reducedMotion) this.s.kick(v * 8); }
  step(dt: number) { return this.s.step(0, dt); }
}
