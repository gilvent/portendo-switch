import * as THREE from 'three';
import { rand } from '../core/math.ts';
import { reducedMotion } from '../core/stage.ts';

// Paper scraps and dust: the small bits every answer throws off. Scraps flutter (they fall slowly and rock, as paper
// does); dust puffs swell and fade. One instanced mesh each, so a burst costs nothing.
const N = 260;
type P = { x: number; y: number; z: number; vx: number; vy: number; vz: number; rx: number; ry: number; spin: number; life: number; max: number; s: number; dust: boolean; floor: number; col?: THREE.Color };
export class Fx {
  private scraps: THREE.InstancedMesh; private dust: THREE.InstancedMesh;
  private ps: P[] = []; private m = new THREE.Matrix4(); private q = new THREE.Quaternion(); private e = new THREE.Euler(); private c = new THREE.Color();
  constructor(scene: THREE.Scene) {
    this.scraps = new THREE.InstancedMesh(new THREE.PlaneGeometry(.11, .075), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 1 }), N);
    this.dust = new THREE.InstancedMesh(new THREE.CircleGeometry(.12, 10), new THREE.MeshBasicMaterial({ color: '#e9e4d8', transparent: true, opacity: .55, depthWrite: false }), 80);
    this.scraps.count = 0; this.dust.count = 0; this.scraps.castShadow = true; this.scraps.frustumCulled = false; this.dust.frustumCulled = false;
    scene.add(this.scraps, this.dust);
  }
  burst(x: number, y: number, z: number, colors: string[], n = 14, power = 1) {
    if (reducedMotion) return;
    for (let i = 0; i < n && this.ps.length < N; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(1.5, 4) * power;
      this.ps.push({ x, y, z, vx: Math.cos(a) * sp, vy: rand(3, 6.5) * power, vz: Math.sin(a) * sp * .5, rx: rand(0, 6), ry: rand(0, 6), spin: rand(-14, 14), life: 0, max: rand(1.2, 2.2), s: rand(.7, 1.3), dust: false, floor: 0, col: new THREE.Color(colors[i % colors.length]) });
    }
  }
  puff(x: number, y: number, z: number, n = 5, spread = .5) {
    if (reducedMotion) return;
    for (let i = 0; i < n; i++) this.ps.push({ x: x + rand(-spread, spread) * .3, y: y + .05, z: z + rand(-.1, .1), vx: rand(-spread, spread) * 2, vy: rand(.2, .8), vz: 0, rx: 0, ry: 0, spin: 0, life: 0, max: rand(.35, .6), s: rand(.6, 1.1), dust: true, floor: 0 });
  }
  update(dt: number, camera: THREE.Camera) {
    let si = 0, di = 0;
    this.ps = this.ps.filter(p => (p.life += dt) < p.max);
    for (const p of this.ps) {
      if (p.dust) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .9;
        const k = p.life / p.max, s = p.s * (.6 + k * 1.2) * (1 - k * k);
        this.q.copy(camera.quaternion); this.m.compose(new THREE.Vector3(p.x, p.y, p.z), this.q, new THREE.Vector3(s, s, s));
        if (di < 80) this.dust.setMatrixAt(di++, this.m);
      } else {
        // Paper falls fast, then catches the air and drifts, rocking.
        p.vy -= 16 * dt; if (p.vy < -1.6) p.vy = -1.6 + Math.sin(p.life * 9) * .4;
        p.vx *= Math.exp(-dt * 2.2); p.vz *= Math.exp(-dt * 2.2);
        p.x += (p.vx + Math.sin(p.life * 7 + p.spin) * .5) * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.y < p.floor + .02) { p.y = p.floor + .02; p.vx = p.vz = 0; p.vy = 0; p.rx = -Math.PI / 2; p.spin = 0; }
        else { p.rx += p.spin * dt; p.ry += p.spin * .7 * dt; }
        const fade = Math.min(1, (p.max - p.life) * 4);
        this.e.set(p.rx, p.ry, 0); this.q.setFromEuler(this.e);
        this.m.compose(new THREE.Vector3(p.x, p.y, p.z), this.q, new THREE.Vector3(p.s * fade, p.s * fade, 1));
        this.scraps.setColorAt(si, p.col ?? this.c.set('#fff'));
        this.scraps.setMatrixAt(si++, this.m);
      }
    }
    this.scraps.count = si; this.dust.count = di;
    if (this.scraps.instanceColor) this.scraps.instanceColor.needsUpdate = true;
    this.scraps.instanceMatrix.needsUpdate = true; this.dust.instanceMatrix.needsUpdate = true;
  }
}
