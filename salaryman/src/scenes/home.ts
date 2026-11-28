import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { Spring } from '../core/math.ts';
import { sfx } from '../game/sfx.ts';
import { tone } from '../core/audio.ts';
import { PERSON } from '../game/content.ts';
import type { Mech, Place } from '../game/place.ts';
import type { Game } from '../game/game.ts';
import type { Solid } from '../game/body.ts';

// The terminus: his home station at night. He steps off the last train; the gate takes the ticket; the console comes
// out of the dock and is in the hand again, with his card on its screen. The day's commute bookends the visit.
export function home(): Place {
  const group = new THREE.Group();
  group.add(box(16.5, .4, 3.8, '#9aa0a8', 0, -.4, -.35), box(16.5, .02, .25, '#f2c230', 0, 0, -2.1), box(16.5, .2, 3, '#25282d', 0, -1.5, -3.8));
  const wall = box(30, 6, .3, '#3a3f47', 0, -1.4, -6.2); wall.castShadow = false; group.add(wall);
  group.add(box(30, .5, .32, '#e8552d', 0, 1.0, -6.2));
  // The last train stands behind him, lit inside.
  const train = box(36, 3.1, 2.6, '#cfd5dc', -10, -.9, -3.8); group.add(train);
  for (let i = -4; i <= 4; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, .05), new THREE.MeshStandardMaterial({ color: '#ffe9b0', emissive: '#ffcf6b', emissiveIntensity: .6 })); w.position.set(-10 + i * 3.6, 1.25, -2.48); group.add(w); }
  const sign = card(4.2, 1.35, (g, W, H) => { rrect(g, 0, 0, W, H, 18, '#fffaf0'); g.fillStyle = '#e8552d'; g.fillRect(0, H - 22, W, 12); g.fillStyle = '#35b58a'; g.fillRect(0, H - 10, W, 10); label(g, PERSON.name, W / 2, H * .36, H * .38, '#23262b', 'center', 700); label(g, 'Terminus · end of the line', W / 2, H * .72, H * .16, '#62676f'); });
  sign.position.set(-2.5, 2.75, -1.5); group.add(sign);
  // Lamps over the platform: pools of warm light in the dark.
  for (const x of [-5, 0, 5]) { const l = new THREE.PointLight('#ffd9a0', 6, 7, 1.6); l.position.set(x, 3.4, 0); group.add(l, box(.8, .08, .3, '#ffe9b0', x, 3.5, 0)); }
  const gateX = 3.2;
  const gate = new THREE.Group(); gate.position.set(gateX, 0, 0);
  gate.add(box(.35, 1.05, .5, '#eef0f2', 0, 0, -.75), box(.35, 1.05, .5, '#eef0f2', 0, 0, .75));
  const paddles = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(0, .55, s * .5); pv.add(box(.06, .5, .48, '#e8552d', 0, -.25, -s * .24)); gate.add(pv); return { pv, s }; });
  group.add(gate);
  const gateSolid: Solid = { x0: gateX - .2, x1: gateX + .2, z0: -2, z1: 2, h: 3 };
  const open = new Spring(0, 160, 10); let opened = false, done = false;
  const tapOut: Mech = { id: 'tap-out', x: gateX - .55, reach: 1, at: new THREE.Vector3(gateX, 1.7, 0), label: 'Tap out', on: () => !opened, use: g => void finish(g) };
  const self: Place = {
    id: 'home', group, lane: { x0: -7, x1: 7.2, z: 0 }, solids: [gateSolid], mechs: [tapOut],
    enter(g: Game) {
      g.hero.place(-5.5, 0, 1); g.stage.scene.background = new THREE.Color('#0d1018');
      g.stage.sun.intensity = .25; g.stage.hemi.intensity = .35; g.stage.hemi.color.set('#8aa0d0');
      setTimeout(() => g.pins.show('title', '<span><b>Alvaro L.</b> · end of the line. Thanks for riding.</span>', new THREE.Vector3(-1, 3.6, 0), 'tag', 4000), 500);
    },
    camera(g: Game) { const room = Math.max(2, 7.6 - g.stage.halfWidth(16)); g.stage.want = { x: Math.max(-room, Math.min(room, g.hero.body.x * (room > 2 ? 1 : .5))), y: 2.1, z: 0, dist: 16, pitch: .1, yaw: 0 }; },
    update(dt: number) { const k = open.step(opened ? 1 : 0, dt); paddles.forEach(({ pv, s }) => (pv.rotation.y = s * k * 1.45)); }
  };
  async function finish(g: Game) {
    if (done) return; done = true; opened = true; self.solids = [];
    sfx.beep();
    g.emit('tap-out');
    await g.anims.wait(500);
    // He walks through, turns, and waves.
    g.busy = true;
    const t0 = performance.now();
    await new Promise<void>(res => { const f = () => { const k = Math.min(1, (performance.now() - t0) / 900); g.hero.body.x = gateX - .6 + k * 2.2; if (k < 1) requestAnimationFrame(f); else res(); }; f(); });
    g.hero.place(g.hero.body.x, 0, -1); g.hero.hop(4);
    [523, 659, 784, 1046].forEach((f, i) => tone({ f, d: .5, type: 'sine', v: .2, at: i * .15 }));
    g.emit('end');
  }
  return self;
}
