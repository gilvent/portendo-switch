import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { Settle, stepped } from '../game/mech.ts';
import { sfx } from '../game/sfx.ts';
import { noise, tone } from '../core/audio.ts';
import { person } from '../game/people.ts';
import { station, type Kit } from './station.ts';
import type { Game } from '../game/game.ts';
import type { Solid } from '../game/body.ts';

// Radjastone: the stone showroom. A courtyard gallery of a natural-stone firm: an entrance arch with his tracing-paper
// sketch hinged over it, a feature wall whose slabs rise as he walks along, the owner with three stone samples, and a
// rough block waiting to be worked.
const OCHRE = '#9a883f', V = (x: number, y: number, z = -1) => new THREE.Vector3(x, y, z);
export const RADJA = { width: 27, arch: 4, wall0: 7.5, wall1: 15.5, block: 17.4, owner: 20.6 };
const STONES = [{ name: 'Marble', floor: '#ece8e1', wall: '#f5f2ec', slab: '#e2ddd3' }, { name: 'Andesite', floor: '#8d9095', wall: '#b5b8bc', slab: '#6f7378' }, { name: 'Limestone', floor: '#e6d6b0', wall: '#efe3c6', slab: '#d8c390' }];

export function radjastone(i: number) {
  const R = RADJA;
  const block = new THREE.Group(); block.position.set(R.block, 0, -.05);
  (window as unknown as { __bell: number }).__bell = R.block;
  let floorMat: THREE.MeshStandardMaterial | null = null, wallMat: THREE.MeshStandardMaterial | null = null;
  const place = station(i, R.width, { floor: STONES[2].floor, wall: STONES[2].wall, sky: '#f1e6cf', trim: OCHRE }, k => {
    // The station builder's first two meshes are the floor and the trim; the wall is the third.
    floorMat = (k.group.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    wallMat = (k.group.children[2] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    const slabs = featureWall(k);
    arch(k); owner(k, s => { floorMat!.color.set(s.floor); wallMat!.color.set(s.wall); slabs.forEach(m => m.color.set(s.slab)); });
    rough(k, block);
  }, { x: R.block, y: 1.1, obj: block });
  return place;
}
// 1. The arch, with his tracing-paper sketch hinged above it: lower the flap and the drawing lies over the stone line
// for line. He designed their site, then built it to match.
function arch(k: Kit) {
  const x = RADJA.arch, z = -2.3;
  k.group.add(box(.5, 2.6, .5, '#cdbb8e', x - 1.1, 0, z), box(.5, 2.6, .5, '#cdbb8e', x + 1.1, 0, z), box(2.7, .5, .5, '#cdbb8e', x, 2.6, z));
  const nameplate = card(1.6, .36, (g, W, H) => { rrect(g, 0, 0, W, H, 4, '#3d3527'); label(g, 'RADJASTONE', W / 2, H / 2, H * .5, '#e6d6b0', 'center', 700); }, { rim: .02 });
  nameplate.position.set(x, 2.68, z + .27); k.group.add(nameplate);
  const hinge = new THREE.Group(); hinge.position.set(x, 3.15, z + .5); k.group.add(hinge);
  const vellum = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 3.1), new THREE.MeshStandardMaterial({ color: '#fbf6e8', transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
  vellum.position.y = -1.55; hinge.add(vellum);
  const ink = new THREE.Group(); hinge.add(ink);
  const line = (w: number, h: number, lx: number, ly: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#4a5a8a', side: THREE.DoubleSide })); m.position.set(lx, ly, .005); ink.add(m); };
  for (const sx of [-1.1, 1.1]) { line(.03, 2.6, sx - .25, -1.85); line(.03, 2.6, sx + .25, -1.85); }
  line(2.7, .03, 0, -.3); line(2.7, .03, 0, -.8); line(.5, .03, -1.1, -3.12); line(.5, .03, 1.1, -3.12);
  hinge.rotation.x = -Math.PI * .5;
  const t = k.tab('down'); t.position.set(x + 1.5, 3.05, z + .55); k.group.add(t);
  let down = false; const settle = new Settle();
  k.mechs.push({ id: 'arch', x, at: V(x, 2.2, -.6), label: () => (down ? 'Lift the sketch' : 'Lower the sketch'), use: async (g: Game) => {
    down = !down; t.kick(); sfx.paper();
    const a = hinge.rotation.x, b = down ? 0 : -Math.PI * .5;
    await g.anims.play(260, kk => { hinge.rotation.x = a + (b - a) * stepped(kk, 12, 260); });
    settle.kick(); if (down) { sfx.pop(); k.tell(g, 'arch', 'I designed their site, then built it to match.', V(x, 3.6)); }
  } });
  k.parts.push({ tabs: [{ tab: t, x }], update: dt => { hinge.rotation.z = settle.step(dt) * .04; } });
}
// 2. The feature wall: its slabs rise and clack into place as he walks along, and sink again if he walks back.
// Animation he feels as he moves, the way the site's sections play as you scroll.
function featureWall(k: Kit) {
  const R = RADJA, n = 8, mats: THREE.MeshStandardMaterial[] = [];
  const slabs = Array.from({ length: n }, (_, j) => {
    const x = R.wall0 + (j + .5) * (R.wall1 - R.wall0) / n, h = 1.4 + ((j * 37) % 5) * .22;
    // Each slab grows up out of its slot in the floor (a group pivoted at its foot).
    const m = new THREE.Group(); m.position.set(x, 0, -2.6); const slab = box(.9, h, .3, STONES[2].slab); m.add(slab);
    mats.push(slab.material as THREE.MeshStandardMaterial); m.scale.y = .02; k.group.add(m);
    k.group.add(box(1, .03, .4, '#5c5240', x, 0, -2.6));
    return { m, x, h, up: 0, landed: false, settle: new Settle() };
  });
  let told = false;
  k.parts.push({ update: (dt, g) => {
    for (const s of slabs) {
      const want = g.hero.body.x > s.x - 1.2 ? 1 : 0;
      const was = s.up; s.up += (want ? 1 : -1) * dt / .28; s.up = Math.max(0, Math.min(1, s.up));
      if (s.up >= 1 && was < 1) { s.settle.kick(); noise({ d: .06, f: 600, q: 1.4, v: .35 }); tone({ f: 160 + slabs.indexOf(s) * 20, d: .08, type: 'triangle', v: .25 }); g.fx.puff(s.x, .1, -2.4, 2, .4); }
      s.m.scale.y = Math.max(.02, stepped(s.up, 12, 280) + s.settle.step(dt) * .06);
    }
    if (!told && slabs.every(s => s.up >= 1)) { told = true; k.tell(g, 'wall', 'Animation you feel as you move along.', V(R.wall1 - 1, 3.4)); }
  } });
  return mats;
}
// 3. The owner and his samples: he hands over a stone card; slotting it re-skins the showroom. Then he swaps one in
// himself. The owner updates the content himself.
function owner(k: Kit, skin: (s: typeof STONES[number]) => void) {
  const x = RADJA.owner, z = -1.6; let s = 2, swaps = 0, busy = false;
  const man = person({ shirt: '#6b4f2a', skin: '#c68e63', hair: '#d9d9d9', h: 1.4, face: 'smile', arm: true }); man.position.set(x + 1.1, 0, z); k.group.add(man);
  const stand = box(.8, 1.1, .45, '#5c4a32', x, 0, z); k.group.add(stand);
  const slot = box(.5, .05, .25, '#23262b', x, 1.1, z); k.group.add(slot);
  const sample = card(.45, .32, (g, W, H) => { rrect(g, 0, 0, W, H, 3, STONES[(s + 1) % 3].slab); label(g, STONES[(s + 1) % 3].name, W / 2, H * .75, H * .22, '#23262b', 'center', 700); }, { rim: .02 });
  sample.position.set(x + .75, 1.2, z + .2); k.group.add(sample);
  const t = k.tab('down'); t.position.set(x + .4, 1.0, z + .3); k.group.add(t);
  const apply = async (g: Game, by: 'him' | 'owner') => {
    s = (s + 1) % 3; sfx.fold();
    await g.anims.play(220, kk => { const e = stepped(kk, 12, 220); sample.position.set(x + .75 - e * .75, 1.2 - e * .25, z + .2 - e * .1); });
    skin(STONES[s]); sfx.pop(); g.fx.burst(x, 1.4, z + .3, [STONES[s].slab, '#fffaf0', OCHRE], 12); g.stage.shake(.06);
    sample.position.set(x + .75, 1.2, z + .2); sample.redraw();
    if (by === 'owner') k.tell(g, 'owner', 'The owner changes the content himself.', V(x, 3.1));
    else g.caption(`${STONES[s].name}. Now watch him swap one in.`, V(x, 3.1));
  };
  k.mechs.push({ id: 'owner', x, at: V(x, 2.4), label: () => `Slot in: ${STONES[(s + 1) % 3].name}`, on: () => !busy, use: async (g: Game) => {
    busy = true; t.kick(); await apply(g, 'him');
    // He hands the next one over himself.
    await g.anims.wait(1300); swaps++; man.position.y = .2; await apply(g, 'owner'); man.position.y = 0; busy = false;
  } });
  k.parts.push({ tabs: [{ tab: t, x, alive: () => !busy }], update: (_dt, g) => { void swaps; man.position.y = Math.max(0, man.position.y - .02); man.rotation.z = Math.sin(g.time * 2) * .02; } });
}
// ★ A rough block of stone by the wall. Jump on it three times and it splits: a tiny carved salaryman stands inside.
function rough(k: Kit, block: THREE.Group) {
  const x = RADJA.block, h = .45;
  const halves = [-1, 1].map(sd => { const m = box(.5, h, .7, '#b9a57a', sd * .25, 0, 0); block.add(m); return { m, sd }; });
  const statue = person({ shirt: '#cdbb8e', skin: '#cdbb8e', hair: '#b9a57a', h: .6, face: 'smile' }); statue.position.y = .02; statue.visible = false; block.add(statue);
  k.group.add(block);
  const solid: Solid = { x0: x - .5, x1: x + .5, z0: -1, z1: 1, h, id: 'block' };
  let hits = 0, open = 0, done = false, wasGround = true;
  k.parts.push({ enter: g => { if (!g.place.solids.includes(solid)) g.place.solids.push(solid); }, update: (dt, g) => {
    const b = g.hero.body;
    if (!wasGround && b.ground && b.floor >= h - .01 && Math.abs(b.x - x) < .6 && !done) {
      hits++; sfx.bonk(.4 + hits * .15); g.stage.shake(.08 * hits); g.fx.puff(x, h, 0, 4, .6); block.rotation.z = (hits % 2 ? 1 : -1) * .05;
      if (hits >= 3) { done = true; sfx.find(); open = .001; solid.h = 0; g.hero.kick(0, 5); statue.visible = true; k.tell(g, 'block', 'Freelance: one client, one developer, start to finish.', V(x, 2.6, -.1), true); }
    }
    wasGround = b.ground;
    block.rotation.z *= Math.exp(-dt * 10);
    if (open > 0) { open = Math.min(1, open + dt / .35); halves.forEach(hv => { hv.m.position.x = hv.sd * (.25 + stepped(open, 12, 350) * .45); hv.m.rotation.z = hv.sd * stepped(open, 12, 350) * .5; }); }
  } });
}
