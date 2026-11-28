import * as THREE from 'three';
import { Stage } from '../core/stage.ts';
import { input, type Button } from '../core/input.ts';
import type { Shell } from '../shell/console.ts';
import { Hero } from './hero.ts';
import { Fx } from './fx.ts';
import { Pins } from './ui.ts';
import { Wipe } from './wipe.ts';
import { sfx } from './sfx.ts';
import type { Mech, Place } from './place.ts';
import type { StationId } from './content.ts';
import { Anims } from './mech.ts';

// The run of one visit: where he is, what he has punched, how far the train has got.
export type Save = {
  ticket: boolean;
  holes: string[];          // `${row}/${id}`, in the order punched
  rides: number;            // rides started
  next: number;             // index in LINE of the station the train is heading for
  firstStop: boolean;       // he has got off at a station at least once
  visited: StationId[];
  holds: number;            // successful strap holds
};
export class Game {
  stage: Stage; hero = new Hero(); fx: Fx; pins: Pins; wipe: Wipe;
  place!: Place;
  save: Save = { ticket: false, holes: [], rides: 0, next: 0, firstStop: false, visited: [], holds: 0 };
  near: Mech | null = null;
  busy = false;               // a transition is playing: input waits
  time = 0;
  anims = new Anims();
  private pendingUse: Mech | null = null;
  private ray = new THREE.Raycaster();
  listeners = new Set<(e: string, d?: unknown) => void>();

  constructor(public shell: Shell) {
    this.stage = new Stage(shell.screen);
    this.fx = new Fx(this.stage.scene);
    this.pins = new Pins(shell.overlay, this.stage.camera);
    this.wipe = new Wipe(shell.screen);
    this.stage.scene.add(this.hero.group, this.hero.shadowMesh);
    this.hero.onStep = () => { sfx.step(); if (Math.random() < .5) this.fx.puff(this.hero.body.x, 0, this.hero.body.z, 1, .2); };
    this.hero.onJump = () => { sfx.jump(); this.fx.puff(this.hero.body.x, this.hero.body.y, this.hero.body.z, 3, .4); };
    this.hero.onLand = v => { const p = Math.min(1, v / 12); sfx.land(p); this.fx.puff(this.hero.body.x, this.hero.body.y, this.hero.body.z, 3 + Math.round(p * 4), .6); if (p > .5) this.stage.shake(.18); };
    input.onPress(b => this.press(b));
    shell.screen.addEventListener('pointerdown', e => this.tap(e));
  }
  emit(e: string, d?: unknown) { this.listeners.forEach(f => f(e, d)); }
  // Change space behind a page turn (or no turn, the first time).
  async go(next: Place, from: string | null, turn = true) {
    this.busy = true;
    if (turn && this.place) { sfx.fold(); await this.wipe.close(); }
    if (this.place) { this.place.exit?.(this); this.stage.scene.remove(this.place.group); }
    this.anims.clear(); this.pins.clear(); this.near = null; this.pendingUse = null; input.target = null;
    this.hero.hang = null; this.hero.frozen = false; this.hero.thin = 0; this.hero.push = 0; this.hero.grip = 1;
    this.place = next;
    this.stage.resetLight();
    this.stage.scene.add(next.group);
    next.enter(this, from);
    next.camera(this); this.stage.snap();
    if (turn) { sfx.paper(); await this.wipe.open(); }
    this.busy = false;
    this.emit('place', next.id);
  }
  // Punch a hole in the ticket, once.
  punch(row: string, id: string, star = false) {
    const key = `${row}/${id}${star ? '*' : ''}`;
    if (this.save.holes.includes(key)) return false;
    this.save.holes.push(key);
    star ? sfx.find() : sfx.stamp();
    this.stage.shake(.12);
    this.emit('punch', { row, id, star });
    return true;
  }
  // A first-person caption stub by the thing that told it.
  // It stays up long enough to read: 1.2 s plus a little per word.
  caption(text: string, at: THREE.Vector3, ms = 1200 + 350 * text.split(' ').length) { this.pins.show('caption', `<span>${text}</span>`, at, 'say', ms); }
  // His own line: it rides above his head, so walking on does not leave it behind.
  say(text: string, ms = 1200 + 350 * text.split(' ').length) {
    const head = () => new THREE.Vector3(this.hero.body.x, this.hero.body.y + 1.95, this.hero.body.z);
    this.pins.show('caption', `<span>${text}</span>`, head(), 'say', ms, head);
  }
  private press(b: Button) {
    if (this.busy || !this.place) return;
    if (b === 'X' || b === 'B') { this.emit(b === 'X' ? 'ticket' : 'back'); return; }
    if (b === 'UP') { if (this.near?.up) this.useMech(this.near); return; }
    if (b === 'A') {
      if (this.place && (this.place as Place & { onA?: (g: Game) => boolean }).onA?.(this)) return;
      if (this.near) this.useMech(this.near); else this.hero.jump();
    }
  }
  useMech(m: Mech) {
    this.hero.release();
    m.use(this);
  }
  // A finger on the scene walks him there; on a mechanism, he works it when he arrives.
  private tap(e: PointerEvent) {
    if (this.busy || !this.place) return;
    if ((e.target as HTMLElement).closest('button,a,.ticket')) return;
    const r = this.shell.screen.getBoundingClientRect();
    const sx = e.clientX - r.left, sy = e.clientY - r.top;
    input.source = 'touch';
    // A place may claim the tap first (the car: a tap in the hold window grabs a strap, wherever the finger lands).
    if ((this.place as Place & { onTap?: (g: Game) => boolean }).onTap?.(this)) return;
    // Mechanisms first: a tap near one's prompt point.
    let best: Mech | null = null, bd = 70;
    for (const m of this.place.mechs) {
      if (m.on && !m.on()) continue;
      const p = m.at.clone().project(this.stage.camera), px = (p.x + 1) / 2 * r.width, py = (1 - p.y) / 2 * r.height;
      const d = Math.hypot(px - sx, (py - sy) * .6);
      if (d < bd) { bd = d; best = m; }
    }
    if (best) {
      if (this.near === best) { this.useMech(best); return; }
      input.target = { x: best.x, z: 0 }; this.pendingUse = best; return;
    }
    this.ray.setFromCamera(new THREE.Vector2(sx / r.width * 2 - 1, -(sy / r.height) * 2 + 1), this.stage.camera);
    const hit = new THREE.Vector3();
    if (this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -this.place.lane.z), hit)) {
      // A tap above his head is a jump; anywhere else on the scene, a walk.
      if (Math.abs(hit.x - this.hero.body.x) < .6 && hit.y > 1.6) { this.hero.jump(true); return; }
      input.target = { x: hit.x, z: 0 }; this.pendingUse = null;
    }
  }
  update(dt: number) {
    this.time += dt;
    input.poll();
    const p = this.place; if (!p) return;
    let move = { x: input.move.x, z: 0 };
    if (input.target && !this.busy) {
      const dx = input.target.x - this.hero.body.x;
      if (Math.abs(dx) < .12) { input.target = null; if (this.pendingUse && this.near === this.pendingUse) this.useMech(this.pendingUse); this.pendingUse = null; }
      else move = { x: Math.sign(dx) * Math.min(1, Math.abs(dx) * 1.5 + .25), z: 0 };
    }
    if (this.busy) move = { x: 0, z: 0 };
    if (!this.busy) this.hero.body.z = p.lane.z;
    const hits = this.hero.update(dt, move, input.held.A, { x0: p.lane.x0, x1: p.lane.x1, z0: p.lane.z, z1: p.lane.z }, p.solids);
    for (const h of hits) this.emit('hit', h);
    if (this.pendingUse && this.near === this.pendingUse && !input.target) { this.useMech(this.pendingUse); this.pendingUse = null; }
    this.anims.update(dt);
    p.update(dt, this);
    // What is in reach: the nearest enabled mechanism.
    let near: Mech | null = null, nd = Infinity;
    if (!this.busy && !this.hero.hang) for (const m of p.mechs) {
      if (m.on && !m.on()) continue;
      const d = Math.abs(m.x - this.hero.body.x);
      if (d < (m.reach ?? 1.3) && d < nd) { nd = d; near = m; }
    }
    if (near !== this.near) { this.near = near; if (near) sfx.pop(); }
    if (near) this.pins.show('prompt', `<div class="prompt"><b>A</b>${typeof near.label === 'string' ? near.label : near.label()}</div>`, near.at, 'pin');
    else this.pins.hide('prompt');
    p.camera(this);
  }
  render(dt: number) {
    this.hero.render(dt);
    this.stage.update(dt);
    this.fx.update(dt, this.stage.camera);
    this.pins.update();
    this.shell.sync();
    this.stage.render();
  }
}
