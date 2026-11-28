import * as THREE from 'three';
import { clamp, damp } from './math.ts';

// The diorama's camera and light. One sun, upper left and in front (as the art bible has it), so every shadow falls
// right and back. The camera is a long lens a little above the floor: a photographed paper model.
export const SUN = new THREE.Vector3(-.62, 1, 1).normalize();
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Stage {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(26, 16 / 9, .1, 400);
  sun = new THREE.DirectionalLight(0xfff4e6, 2.3);
  hemi = new THREE.HemisphereLight(0xdfe9f5, 0x8a8170, 1.15);
  // Where the camera looks and from how far. The rig eases toward `want`; trauma shakes it.
  look = new THREE.Vector3(0, 1, 0);
  want = { x: 0, y: 1, z: 0, dist: 14, pitch: .2, yaw: 0 };
  rig = { ...this.want };
  trauma = 0;
  kick = new THREE.Vector3();
  private t = 0;

  constructor(public host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.localClippingEnabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.setAttribute('data-testid', 'canvas');
    this.scene.background = new THREE.Color('#1c2026');
    this.sun.position.copy(SUN).multiplyScalar(30);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const s = this.sun.shadow.camera; s.left = -16; s.right = 16; s.top = 12; s.bottom = -10; s.near = 1; s.far = 80;
    this.sun.shadow.bias = -.0004; this.sun.shadow.normalBias = .02; this.sun.shadow.radius = 4;
    this.scene.add(this.sun, this.sun.target, this.hemi);
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
  }
  resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  // Shake on a hit: trauma 0..1, felt as its square so small knocks stay small.
  shake(amount: number) { if (!reducedMotion) this.trauma = clamp(this.trauma + amount, 0, 1); }
  // A one-off shove of the whole view (a landing, a brake), springing back.
  nudge(x: number, y: number) { if (!reducedMotion) { this.kick.x += x; this.kick.y += y; } }
  snap() { Object.assign(this.rig, this.want); }
  update(dt: number) {
    this.t += dt;
    const r = this.rig, w = this.want, k = reducedMotion ? 30 : 5;
    r.x = damp(r.x, w.x, k, dt); r.y = damp(r.y, w.y, k, dt); r.z = damp(r.z, w.z, k, dt);
    r.dist = damp(r.dist, w.dist, k * .8, dt); r.pitch = damp(r.pitch, w.pitch, k, dt); r.yaw = damp(r.yaw, w.yaw, k, dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    this.kick.multiplyScalar(Math.exp(-dt * 9));
    const sh = this.trauma * this.trauma, n = (o: number) => Math.sin(this.t * 37 + o) * Math.sin(this.t * 23.1 + o * 2);
    this.look.set(r.x + this.kick.x + sh * .25 * n(1), r.y + this.kick.y + sh * .2 * n(2), r.z);
    const cp = Math.cos(r.pitch);
    this.camera.position.set(this.look.x + Math.sin(r.yaw) * cp * r.dist, this.look.y + Math.sin(r.pitch) * r.dist, this.look.z + Math.cos(r.yaw) * cp * r.dist);
    this.camera.lookAt(this.look);
    this.camera.rotation.z += sh * .02 * n(3);
    // The sun's shadow box follows the camera so shadows stay sharp wherever he walks.
    this.sun.target.position.set(r.x, 0, r.z);
    this.sun.position.copy(SUN).multiplyScalar(30).add(this.sun.target.position);
  }
  render() { this.renderer.render(this.scene, this.camera); }
}
