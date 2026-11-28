import * as THREE from 'three';
import { card } from './paper.ts';
import { clamp, damp, Spring } from '../core/math.ts';
import { moveBody, type Body, type Rect, type Solid } from './body.ts';
import { reducedMotion } from '../core/stage.ts';

// The player: one cut card at paper-toy proportions. He turns like a card (a quick flip through edge-on), squashes
// before a jump and on a landing, leans into his stride, and bobs a step at a time.
export const HERO = {
  speed: 4.4, depthSpeed: 2.8, accel: 30, decel: 26, airControl: .55,
  jump: 7.4, rise: 24, fall: 42, cut: .45, coyote: .09, buffer: .12,
  flip: .14, height: 1.5
};
export class Hero {
  group = new THREE.Group();
  sheet: THREE.Mesh;
  body: Body = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: .28, ground: true, floor: 0 };
  facing = 1;
  // Forces from the world (the train's acceleration), in units/s², and how well his feet grip against them (0..1).
  push = 0; grip = 1;
  frozen = false;
  private flipT = 1; private flipFrom = 1;
  private squash = new Spring(1, 320, 14);
  private lean = 0; private stride = 0; private coyote = 0; private buffered = 0; private holding = false;
  private shadow: THREE.Mesh;
  onStep?: () => void; onLand?: (speed: number) => void; onJump?: () => void;

  constructor() {
    this.sheet = card(1.05, HERO.height, (g, W, H) => {
      const s = W / 105;
      // legs
      g.fillStyle = '#1d1f24'; g.fillRect(36 * s, H - 30 * s, 13 * s, 26 * s); g.fillRect(56 * s, H - 30 * s, 13 * s, 26 * s);
      g.fillStyle = '#121316'; g.beginPath(); g.ellipse(41 * s, H - 5 * s, 11 * s, 6 * s, 0, 0, 7); g.ellipse(64 * s, H - 5 * s, 11 * s, 6 * s, 0, 0, 7); g.fill();
      // jacket over a light tee
      g.fillStyle = '#26292f'; g.beginPath(); g.roundRect(24 * s, H - 78 * s, 57 * s, 52 * s, 12 * s); g.fill();
      g.fillStyle = '#eef0f2'; g.beginPath(); g.moveTo(44 * s, H - 78 * s); g.lineTo(61 * s, H - 78 * s); g.lineTo(58 * s, H - 30 * s); g.lineTo(47 * s, H - 30 * s); g.fill();
      // head
      g.fillStyle = '#f4c9a3'; g.beginPath(); g.ellipse(53 * s, H - 104 * s, 31 * s, 30 * s, 0, 0, 7); g.fill();
      // spiky crop
      g.fillStyle = '#16181c'; g.beginPath(); g.moveTo(20 * s, H - 104 * s);
      const tufts = [[24, 128], [32, 140], [42, 134], [50, 146], [58, 136], [68, 145], [76, 132], [86, 124]];
      for (const [x, y] of tufts) g.lineTo(x * s, H - y * s);
      g.lineTo(86 * s, H - 104 * s); g.quadraticCurveTo(60 * s, H - 118 * s, 20 * s, H - 104 * s); g.fill();
      // set brows, eyes ahead, a sure smile (turned toward his walk)
      g.fillStyle = '#16181c'; g.fillRect(54 * s, H - 110 * s, 12 * s, 3.5 * s); g.fillRect(72 * s, H - 110 * s, 10 * s, 3.5 * s);
      g.beginPath(); g.ellipse(61 * s, H - 101 * s, 3.4 * s, 4.4 * s, 0, 0, 7); g.ellipse(77 * s, H - 101 * s, 3 * s, 4.2 * s, 0, 0, 7); g.fill();
      g.strokeStyle = '#7a3b2a'; g.lineWidth = 2.4 * s; g.lineCap = 'round'; g.beginPath(); g.arc(68 * s, H - 92 * s, 6 * s, .2, Math.PI - .6); g.stroke();
    });
    this.sheet.position.x = 0;
    const sh = new THREE.Mesh(new THREE.CircleGeometry(.36, 20), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .18, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = .01; this.shadow = sh;
    this.group.add(this.sheet);
  }
  get shadowMesh() { return this.shadow; }
  place(x: number, z: number, facing = 1) { Object.assign(this.body, { x, z, y: 0, vx: 0, vz: 0, vy: 0, ground: true }); this.facing = facing; this.flipT = 1; this.flipFrom = facing; }
  // A pressed with nothing to use: a jump (buffered a moment so a slightly early press still counts).
  jump() { this.buffered = HERO.buffer; }
  release() { this.holding = false; }
  hop(v = 4) { if (this.body.ground) { this.body.vy = v; this.body.ground = false; this.squash.x = 1.12; } }
  kick(vx: number, vy = 0) { this.body.vx += vx; if (vy) { this.body.vy = vy; this.body.ground = false; } }
  update(dt: number, move: { x: number; z: number }, holdA: boolean, bounds: Rect, solids: Solid[]) {
    const b = this.body, H = HERO;
    const mx = this.frozen ? 0 : move.x, mz = this.frozen ? 0 : move.z;
    const ctl = b.ground ? 1 : H.airControl;
    const ax = (want: number, v: number, max: number) => {
      const target = want * max, rate = (Math.abs(want) > .05 ? H.accel : H.decel) * ctl;
      return Math.abs(target - v) < rate * dt ? target : v + Math.sign(target - v) * rate * dt;
    };
    // The world's push acts on him whether he walks or not; his grip takes the edge off it while he stands.
    const slip = b.ground ? (1 - this.grip) : 1;
    b.vx = ax(mx, b.vx - this.pushCarry, H.speed) + this.pushCarry;
    this.pushCarry = damp(this.pushCarry + this.push * slip * dt, 0, b.ground ? 3.2 * (.4 + this.grip) : .2, dt);
    b.vz = ax(mz, b.vz, H.depthSpeed);
    if (mx > .1 && this.facing < 0) this.turn(1); else if (mx < -.1 && this.facing > 0) this.turn(-1);
    // Jump: coyote time after a ledge, a buffered press, a cut when A is let go early.
    this.coyote = b.ground ? H.coyote : Math.max(0, this.coyote - dt);
    if (this.buffered > 0) {
      this.buffered -= dt;
      if (this.coyote > 0 && !this.frozen) { b.vy = H.jump; b.ground = false; this.coyote = 0; this.buffered = 0; this.holding = true; this.squash.x = .78; this.squash.kick(6); this.onJump?.(); }
    }
    if (this.holding && !holdA && b.vy > 0) { b.vy *= H.cut; this.holding = false; }
    const wasGround = b.ground, vy = b.vy;
    const hits = moveBody(b, dt, bounds, solids, b.vy > 0 ? H.rise : H.fall);
    if (!wasGround && b.ground) { this.squash.x = clamp(1 + vy * .028, .7, .95); this.onLand?.(-vy); }
    // Walk cycle: a step every so far, a bob and a footstep with each.
    const sp = Math.hypot(b.vx, b.vz);
    if (b.ground && sp > .4) { const was = Math.floor(this.stride); this.stride += sp * dt * 1.55; if (Math.floor(this.stride) !== was) this.onStep?.(); } else this.stride = Math.round(this.stride);
    this.lean = damp(this.lean, clamp(-b.vx * .045 + this.pushCarry * .03, -.3, .3), 10, dt);
    return hits;
  }
  private pushCarry = 0;
  private turn(f: number) { this.flipFrom = this.facing; this.facing = f; this.flipT = reducedMotion ? 1 : 0; }
  // Draw: position, the flip, squash and stretch, lean and bob.
  render(dt: number) {
    const b = this.body;
    this.flipT = Math.min(1, this.flipT + dt / HERO.flip);
    const sx = this.flipT < 1 ? Math.cos(this.flipT * Math.PI) * -this.flipFrom : this.facing;
    const sq = this.squash.step(1, dt), air = !b.ground ? clamp(b.vy * .03, -.12, .14) : 0;
    const sy = clamp(sq + air, .65, 1.35), sxs = 1 / Math.sqrt(sy);
    const bob = b.ground ? Math.abs(Math.sin(this.stride * Math.PI)) * .06 : 0;
    this.group.position.set(b.x, b.y + bob, b.z);
    this.sheet.scale.set((1.05 + .07) * sx * sxs, (HERO.height + .07) * sy, 1);
    this.group.rotation.z = reducedMotion ? 0 : this.lean;
    // A card turning shows its edge: a little yaw sells it as paper.
    this.sheet.rotation.y = this.flipT < 1 ? Math.sin(this.flipT * Math.PI) * .5 : 0;
    this.shadow.position.set(b.x + .08, b.floor + .012, b.z + .02);
    const lift = clamp(1 - (b.y - b.floor) * .35, .45, 1); this.shadow.scale.setScalar(lift);
  }
}
