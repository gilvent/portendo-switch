import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { clamp, rand, Spring } from '../core/math.ts';
import { sfx } from '../game/sfx.ts';
import { bed, noise, tone } from '../core/audio.ts';
import { PERSON } from '../game/content.ts';
import { reducedMotion } from '../core/stage.ts';
import type { Mech, Place } from '../game/place.ts';
import type { Game } from '../game/game.ts';
import type { Solid } from '../game/body.ts';

// The terminus: the line surfaces at its last stop, late. The last train leaves behind him and uncovers the town at
// night; he walks through pools of lamp light to the gate, which keeps the ticket; the station puts its lamps out
// after him and he is lit by the doorway home. Then the console comes out of the dock with his card on it.
// Rule for the light: lamps hang in front of the paper, so the faces are lit.
const basic = (c: string) => new THREE.MeshBasicMaterial({ color: c });
export function home(): Place {
  const group = new THREE.Group();
  group.add(box(16.5, .4, 3.8, '#8f949b', 0, -.4, -.35), box(16.5, .02, .25, '#f2c230', 0, 0, -2.1), box(16.5, .2, 3, '#25282d', 0, -1.5, -3.8));
  // A parapet, not a wall: over it, the town.
  group.add(box(30, 1.1, .3, '#2c313a', 0, 0, -6.2), box(30, .5, .32, '#e8552d', 0, 1.0, -6.2));
  const town = new THREE.Group(); group.add(town);
  [[-12, 2.8, 5.2, -9], [-8.6, 2.4, 3.6, -10], [-5.4, 3.2, 6.4, -9], [-1.6, 2.6, 4.2, -10], [1.8, 3, 5.6, -9], [5.4, 2.4, 3.4, -10], [9, 3.2, 6, -9.5]].forEach(([x, w, h, z], b) => {
    town.add(box(w, h, .4, '#141a2c', x, -.4, z));
    for (let r = 0; r < Math.floor(h / .9); r++) for (let c = 0; c < Math.floor(w / .7); c++) {
      const lit = (r * 7 + c * 3 + b * 5) % 3 === 0, his = b === 4 && r === 2 && c === 1;
      if (!lit && !his) continue;
      const win = new THREE.Mesh(new THREE.PlaneGeometry(.34, .42), basic(his ? '#ff9a5c' : '#ffd48a'));
      win.position.set(x - w / 2 + .45 + c * .7, .3 + r * .9, z + .21); town.add(win);
    }
  });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(.55, 24), basic('#f4efd8')); moon.position.set(6.2, 6.6, -11); group.add(moon);
  // The last train stands behind him, lit inside; its windows spill onto the platform, and it leaves.
  const train = new THREE.Group(); group.add(train);
  train.add(box(36, 3.1, 2.6, '#cfd5dc', -10, -.9, -3.8));
  for (let i = -4; i <= 4; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, .05), new THREE.MeshStandardMaterial({ color: '#ffe9b0', emissive: '#ffcf6b', emissiveIntensity: .6 })); w.position.set(-10 + i * 3.6, 1.25, -2.48); train.add(w); }
  for (const x of [-6, -1.5]) { const l = new THREE.PointLight('#ffe2a8', 10, 7, 1.6); l.position.set(x, 1.6, -1.6); train.add(l); }
  const sign = card(4.2, 1.35, (g, W, H) => { rrect(g, 0, 0, W, H, 18, '#fffaf0'); g.fillStyle = '#e8552d'; g.fillRect(0, H - 22, W, 12); g.fillStyle = '#35b58a'; g.fillRect(0, H - 10, W, 10); label(g, PERSON.name, W / 2, H * .36, H * .38, '#23262b', 'center', 700); label(g, 'Terminus · end of the line', W / 2, H * .72, H * .16, '#62676f'); });
  sign.position.set(-2.5, 2.75, -1.5); group.add(sign);
  const spot = (c: string, i: number, d: number, a: number, pos: [number, number, number], to: [number, number, number]) => {
    const s = new THREE.SpotLight(c, i, d, a, pos[0] === -2.5 ? .8 : .7, 1.4); s.position.set(...pos); s.target.position.set(...to); group.add(s, s.target); return s;
  };
  // Three lamps in front of the paper: pools he walks through. The third is over the gate.
  const lamps = [-5.2, -.8, 3.6].map(x => {
    const light = spot('#ffc27a', 34, 11, .62, [x, 3.9, 1.5], [x, 0, -.6]);
    const fix = new THREE.Mesh(new THREE.BoxGeometry(.7, .1, .34), basic('#ffe2ad')); fix.position.set(x, 3.77, .9);
    const rod = box(.04, .9, .04, '#3a3f47', x, 3.82, .9);
    const shaft = new THREE.Mesh(new THREE.ConeGeometry(1.9, 3.7, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffc27a', transparent: true, opacity: .03, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    shaft.position.set(x, 1.87, .6); group.add(fix, rod, shaft);
    return { light, fix, shaft, base: 34 };
  });
  spot('#fff0d0', 16, 7, .5, [-2.5, 2.2, 2.6], [-2.5, 3.4, -1.5]);
  // The way out, and home: a warm doorway at the right.
  group.add(box(2.2, 3.2, .3, '#3a2f2a', 8.6, 0, -1.9));
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, .32), basic('#ffb469')); door.position.set(8.6, 1.2, -1.9); group.add(door);
  const out = new THREE.PointLight('#ffa552', 26, 12, 1.6); out.position.set(7.6, 1.5, .3); group.add(out);
  // The morning's bench: the sleeper has gone home and left his newspaper.
  group.add(box(1.8, .45, .5, '#2f6f9f', -1.6, 0, -1.3));
  const paper = card(.5, .36, g2 => { g2.fillStyle = '#f4f1e8'; g2.fillRect(0, 0, 200, 200); }, { rim: .01 }); paper.position.set(-1.7, .46, -1.25); paper.rotation.x = -1.2; group.add(paper);
  // The gate, its reader glowing green: the one thing to walk to.
  const gateX = 3.2;
  const gate = new THREE.Group(); gate.position.set(gateX, 0, 0);
  gate.add(box(.35, 1.05, .5, '#eef0f2', 0, 0, -.75), box(.35, 1.05, .5, '#eef0f2', 0, 0, .75));
  const cap = new THREE.Mesh(new THREE.BoxGeometry(.25, .04, .25), basic('#35e0a0')); cap.position.set(0, 1.07, -.75); gate.add(cap);
  const reader = new THREE.PointLight('#35e0a0', 1.6, 2.2, 2); reader.position.set(0, 1.25, -.4); gate.add(reader);
  const paddles = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(0, .55, s * .5); pv.add(box(.06, .5, .48, '#e8552d', 0, -.25, -s * .24)); gate.add(pv); return { pv, s }; });
  group.add(gate);
  const gateSolid: Solid = { x0: gateX - .2, x1: gateX + .2, z0: -2, z1: 2, h: 3 };
  const open = new Spring(0, 160, 10); let opened = false, done = false;
  const tapOut: Mech = { id: 'tap-out', x: gateX - .55, reach: 1, at: new THREE.Vector3(gateX, 1.7, 0), label: 'Tap out', on: () => !opened, use: g => void finish(g) };
  const rail = bed(380, .7);
  let t = 0, tx = 0, left = false, blown = false, cricket = 1.5, flicker = 6;
  // The ending's camera: null while he walks; then each beat sets it.
  let shot: { x: number; y: number; dist: number; pitch: number; yaw: number } | null = null;
  const self: Place = {
    id: 'home', group, lane: { x0: -7, x1: 7.2, z: 0 }, solids: [gateSolid], mechs: [tapOut],
    enter(g: Game) {
      g.hero.place(-5.5, 0, 1); g.stage.scene.background = new THREE.Color('#0a1022');
      g.stage.sun.intensity = .7; g.stage.sun.color.set('#9db8ff');
      g.stage.hemi.intensity = .8; g.stage.hemi.color.set('#3a4a78'); g.stage.hemi.groundColor.set('#2a1c14');
      setTimeout(() => g.pins.show('title', '<span>Home. Thanks for riding along.</span>', new THREE.Vector3(2, 3.9, 0), 'tag', 4000), 500);
    },
    exit() { rail.set(0); },
    camera(g: Game) {
      if (shot && !reducedMotion) { g.stage.want = { ...shot, z: 0 }; return; }
      if (shot) { g.stage.want = { x: 3.8, y: 1.7, z: 0, dist: 11.5, pitch: .08, yaw: 0 }; return; }
      const room = Math.max(2, 7.6 - g.stage.halfWidth(16)), k = reducedMotion ? 0 : clamp((g.hero.body.x + 5.5) / 8.7, 0, 1);
      g.stage.want = { x: Math.max(-room, Math.min(room, g.hero.body.x * (room > 2 ? 1 : .5))), y: 2.4 - k * .5, z: 0, dist: 18 - k * 3.5, pitch: .12 - k * .03, yaw: 0 };
    },
    update(dt: number, g: Game) {
      t += dt;
      const k = open.step(opened ? 1 : 0, dt); paddles.forEach(({ pv, s }) => (pv.rotation.y = s * k * 1.45));
      // The last train leaves: door ticks, the doors, a lurch; the town behind it.
      if (!left && t > 1.2) { left = true; tx = 0; [0, .2, .4].forEach(a => setTimeout(() => sfx.tick(), a * 1000)); setTimeout(() => { sfx.doors(); setTimeout(() => sfx.lurch(), 600); }, 700); }
      if (left && t > 2.5) {
        tx += dt; train.position.x = -8.8 * tx * tx;
        rail.set(Math.max(0, .25 - tx * .08), .8 + tx * .3);
        if (!blown && tx > .6) { blown = true; paper.visible = false; g.fx.burst(-1.7, .6, -1.2, ['#f4f1e8', '#e9e4d8'], 6, .6); sfx.paper(); g.fx.gust(-7, 2, -1, 6); }
        if (tx > .6 && tx < 1.6) g.hero.push = -2.1; else g.hero.push = 0;
        if (tx > 4) train.visible = false;
      }
      // Crickets: night, outdoors, quiet.
      cricket -= dt; if (cricket < 0) { cricket = rand(1.2, 2.4); [0, .055, .11].forEach(a => tone({ f: 4200, d: .03, type: 'sine', v: .025, at: a })); }
      // The left lamp is on its way out.
      flicker -= dt; if (flicker < 0 && !opened) { flicker = rand(6, 8); const L = lamps[0]; [0, 140].forEach(ms => setTimeout(() => { L.light.intensity = L.base * .6; noise({ d: .02, f: 1800, q: 3, v: .08 }); setTimeout(() => (L.light.intensity = L.base), 60); }, ms)); }
    }
  };
  async function finish(g: Game) {
    if (done) return; done = true; opened = true; self.solids = [];
    g.busy = true;
    sfx.beep(); (cap.material as THREE.MeshBasicMaterial).color.set('#ffffff'); reader.color.set('#ffffff');
    shot = { x: 3.8, y: 1.7, dist: 11.5, pitch: .08, yaw: 0 };
    g.emit('tap-out');
    await g.anims.wait(450);
    sfx.punch();                                       // the gate keeps the ticket
    await g.anims.wait(50);
    // He walks through; the view turns a little toward the door, the only yaw in the game.
    const t0 = performance.now(), x0 = g.hero.body.x;
    await new Promise<void>(res => { const f = () => { const k = Math.min(1, (performance.now() - t0) / 900); g.hero.body.x = x0 + k * 2.2; if (shot) { shot.x = 3.8 + k * .6; shot.yaw = -.12 * k; } if (k < 1) requestAnimationFrame(f); else res(); }; f(); });
    // He turns and waves, the way paper waves.
    g.hero.turn(-1); await g.anims.wait(160); g.hero.turn(1); await g.anims.wait(160); g.hero.turn(-1);
    g.hero.hop(4); sfx.home();
    await g.anims.wait(500);
    // The station puts its lamps out after him, left to right.
    for (const L of lamps) { L.light.intensity = 0; L.shaft.visible = false; (L.fix.material as THREE.MeshBasicMaterial).color.set('#6b6250'); sfx.relay(); await g.anims.wait(200); }
    await g.anims.wait(100);
    shot = { x: 3, y: 2.6, dist: 20, pitch: .2, yaw: 0 };
    g.emit('end');
  }
  return self;
}
