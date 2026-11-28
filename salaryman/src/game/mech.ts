import * as THREE from 'three';
import { box, card } from './paper.ts';
import { reducedMotion } from '../core/stage.ts';
import { Spring } from '../core/math.ts';

// The movable-book grammar. Every interactive thing is one of five paper mechanisms (pull-tab, flap, wheel, slot,
// pop-up), and every one is worked the same way: a coral tab that wiggles when he is near (anticipation), a stepped
// snap like stop-motion, an overshoot that settles, then a first-person caption and a punch in the ticket.
export const GRAMMAR = { wiggleNear: 3.6, wiggleEvery: 2.5, wiggleFor: .3, snapFps: 12, settle: .4 };

// A tab: the one affordance. The pull-tab of a movable book: a coral tongue of card with a round end and two cream
// chevrons, coming out of a dark slot with a cream lip, tilted 12° off its host so the sun lights it and it casts its
// own shadow. Coral means "A works this" and nothing else. It previews its verb (out, in, out, in) every 2.5 s while
// he is near, and on use it jumps out one frame and settles back.
const CHEV = '#fff4e2';
export function tab(dir: 'left' | 'right' | 'down' | 'up' | 'turn' = 'right', size = .36) {
  const W = size, H = size * 1.33, turn = dir === 'turn';
  const g = new THREE.Group(), root = new THREE.Group(), slide = new THREE.Group();
  const tongue = card(W, H, (c, w, h) => {
    const r = w / 2, neck = w * .09;
    c.fillStyle = '#e8552d'; c.beginPath();
    c.moveTo(neck, h); c.lineTo(0, h * .78); c.lineTo(0, r); c.arc(r, r, r, Math.PI, 0); c.lineTo(w, h * .78); c.lineTo(w - neck, h); c.closePath(); c.fill();
    c.fillStyle = '#c9431f'; c.fillRect(neck, h * .9, w - neck * 2, h * .1);
    c.strokeStyle = CHEV; c.lineWidth = w * .15; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const f of [.26, .5]) {
      c.beginPath();
      if (turn) { const y = h * (f + .1), x = w * .5; c.moveTo(x - w * .14, y - w * .22); c.lineTo(x + w * .12, y); c.lineTo(x - w * .14, y + w * .22); }
      else { const y = h * f; c.moveTo(w * .25, y + w * .16); c.lineTo(w * .5, y - w * .06); c.lineTo(w * .75, y + w * .16); }
      c.stroke();
    }
  }, { rim: .03, res: 320 });
  slide.add(tongue); slide.rotation.x = .21;
  root.add(box(W + .12, .05, .03, '#2a2118', 0, -.05, 0), box(W + .16, .03, .028, CHEV, 0, -.08, 0), slide);
  const rot = { up: 0, left: Math.PI / 2, down: Math.PI, right: -Math.PI / 2, turn: -Math.PI / 4 }[dir];
  root.rotation.z = rot; root.position.set(Math.sin(rot) * H / 2, -Math.cos(rot) * H / 2, 0);
  g.add(root);
  const mat = tongue.material as THREE.MeshStandardMaterial;
  if (reducedMotion) { mat.emissiveMap = mat.map; }
  const back = new Spring(0, 300, 11);
  let clock = Math.random() * 2, done = false;
  return Object.assign(g, {
    tick(dt: number, near: number, alive = true) {
      clock += dt;
      g.visible = alive;
      // The preview: four frames of 83 ms, out, in, out, in.
      const ph = clock % GRAMMAR.wiggleEvery, frame = Math.floor(ph / .083);
      const out = alive && !done && near < GRAMMAR.wiggleNear && frame < 4 && frame % 2 === 0;
      const k = back.step(0, dt);
      if (reducedMotion) { mat.emissive.set(out ? '#5a1a08' : '#000'); slide.position.y = 0; slide.scale.setScalar(1); root.rotation.z = rot; return; }
      if (turn) { root.rotation.z = rot + (out ? .18 : 0) + k * 2.2; slide.position.y = 0; }
      else { slide.position.y = (out ? .08 : 0) + k; slide.scale.setScalar(out ? 1.1 : 1); }
    },
    // Used: one frame out, then it settles back over 400 ms.
    kick() { back.x = .16; back.v = 0; },
    spent(v = true) { done = v; }
  });
}
export type Tab = ReturnType<typeof tab>;

// Stepped time: a snap holds each pose for a frame of a 12 fps stop-motion film, so paper moves in clicks, not glides.
// Under reduced motion a snap does not travel: it holds its first pose and cuts to its last at the end of its time.
export const stepped = (k: number, fps = GRAMMAR.snapFps, ms = 250) => (reducedMotion ? (k >= 1 ? 1 : 0) : Math.min(1, Math.ceil(k * fps * ms / 1000) / (fps * ms / 1000)));

// Little timelines the scenes run: `play(ms, f)` calls f(k) with k from 0 to 1 and resolves at the end.
export class Anims {
  private list: { t: number; ms: number; f: (k: number) => void; done: () => void }[] = [];
  // Reduced motion keeps every timeline's length (time is never shortened, only travel): the pose holds at its
  // start and cuts to its end when the time is up.
  play(ms: number, f: (k: number) => void) {
    const g = reducedMotion ? (k: number) => f(k >= 1 ? 1 : 0) : f;
    return new Promise<void>(done => this.list.push({ t: 0, ms, f: g, done }));
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
