import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { Settle, stepped } from '../game/mech.ts';
import { sfx } from '../game/sfx.ts';
import { tone } from '../core/audio.ts';
import { person, CROWD } from '../game/people.ts';
import { station, type Kit } from './station.ts';
import type { Game } from '../game/game.ts';

// Moperty: a street in his hometown. Folded paper houses with FOR SALE and FOR RENT signs; a plot where a house goes
// from sketch to front to back; a road sign that brings people in; a lamp that brings the evening on.
const INDIGO = '#3f51b5', V = (x: number, y: number, z = -1) => new THREE.Vector3(x, y, z);
export const MOPERTY = { width: 28, signpost: 4, houses: [6.4, 8.6, 10.8, 13, 15.2], lamp: 17.4, plot: 20, road: 23.4 };
type House = { g: THREE.Group; kind: 'sale' | 'rent'; windows: THREE.MeshStandardMaterial[]; down: number };

function house(k: Kit, x: number, kind: 'sale' | 'rent', color: string, roof: string): House {
  const g = new THREE.Group(); g.position.set(x, 0, -2.2);
  const body = box(1.7, 1.5, 1.2, color, 0, 0, 0); g.add(body);
  const r = new THREE.Mesh(new THREE.CylinderGeometry(.01, 1.15, .8, 4, 1), new THREE.MeshStandardMaterial({ color: roof })); r.rotation.y = Math.PI / 4; r.scale.set(1.05, 1, .75); r.position.y = 1.9; r.castShadow = true; g.add(r);
  const windows = [-.45, .45].map(wx => { const m = new THREE.MeshStandardMaterial({ color: '#fdf3d0', emissive: '#000' }); const w = new THREE.Mesh(new THREE.BoxGeometry(.35, .35, .03), m); w.position.set(wx, 1.0, .61); g.add(w); return m; });
  g.add(box(.36, .65, .03, '#7a5a3a', 0, 0, .61));
  const s = card(.9, .5, (c, W, H) => { rrect(c, 0, 0, W, H, 5, '#fffaf0'); c.fillStyle = kind === 'sale' ? '#e8552d' : '#35b58a'; c.fillRect(0, 0, W, H * .2); label(c, kind === 'sale' ? 'FOR SALE' : 'FOR RENT', W / 2, H * .6, H * .32, '#23262b', 'center', 700); }, { rim: .02 });
  s.position.set(.75, .55, 1.1); g.add(s, box(.04, .6, .04, '#8a6b4a', .75, 0, 1.1));
  k.group.add(g);
  return { g, kind, windows, down: 0 };
}
export function moperty(i: number) {
  const M = MOPERTY;
  const lampHead = new THREE.Group(); lampHead.position.set(M.lamp, 2.95, -1.2);
  (window as unknown as { __bell: number }).__bell = M.lamp;
  return station(i, M.width, { floor: '#c9c2b2', wall: '#bfe3f2', sky: '#bfe3f2', trim: '#8a8577' }, k => {
    const houses = M.houses.map((x, j) => house(k, x, j % 2 ? 'rent' : 'sale', ['#f4e1c1', '#d8e8d0', '#f2d0c4', '#d4dcef', '#efe3b0'][j], ['#a0522d', '#3f7a5b', '#8f3b2b', '#35577f', '#8f6b3f'][j]));
    signpost(k, houses); plot(k); roadSign(k); lamp(k, lampHead, houses);
  }, { x: M.lamp, y: 3.0, obj: lampHead });
}
// 1. The signpost: a wheel picks Sale or Rent. Matching houses stand; the others fold flat like a pop-up page.
function signpost(k: Kit, houses: House[]) {
  const x = MOPERTY.signpost; const MODES = ['All homes', 'For sale', 'For rent'] as const; let m = 0;
  k.group.add(box(.08, 2.1, .08, '#6b5a44', x, 0, -1.3));
  const plate = card(1.3, .45, (g, W, H) => { rrect(g, 0, 0, W, H, 6, INDIGO); label(g, MODES[m], W / 2, H / 2, H * .45, '#fffaf0', 'center', 700); }, { rim: .02 });
  plate.position.set(x + .5, 1.65, -1.24); k.group.add(plate);
  const wheel = new THREE.Group(); wheel.position.set(x, 1.15, -1.18); k.group.add(wheel);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .05, 20), new THREE.MeshStandardMaterial({ color: '#d7dbe0' })); disc.rotation.x = Math.PI / 2; wheel.add(disc);
  const t = k.tab('turn'); t.position.set(.24, .06, .04); wheel.add(t);
  const settle = new Settle();
  k.mechs.push({ id: 'signpost', x, at: V(x, 2.4), label: () => `Show: ${MODES[(m + 1) % 3]}`, use: async (g: Game) => {
    m = (m + 1) % 3; t.kick(); sfx.fold(); plate.redraw();
    const show = (h: House) => m === 0 || (m === 1 ? h.kind === 'sale' : h.kind === 'rent');
    const from = houses.map(h => h.down), to = houses.map(h => (show(h) ? 0 : 1)), w0 = wheel.rotation.z;
    await g.anims.play(260, kk => { const s = stepped(kk, 12, 260); wheel.rotation.z = w0 - s * 2.094; houses.forEach((h, j) => { h.down = from[j] + (to[j] - from[j]) * s; h.g.rotation.x = -h.down * Math.PI / 2 * .96; }); });
    settle.kick(); sfx.pop();
    if (m) k.tell(g, 'signpost', 'Homes for sale or rent, around my hometown.', V(x + 4, 3));
  } });
  k.parts.push({ tabs: [{ tab: t, x }], update: dt => { plate.rotation.z = settle.step(dt) * .1; } });
}
// 2. The plot: pull once for the sketch, again for the front, again and the house turns to show its back, all pipes
// and wiring. He designed it, built the front, and built the back.
function plot(k: Kit) {
  const x = MOPERTY.plot, z = -1.9; let st = 0, busy = false;
  k.group.add(box(2.4, .05, 1.6, '#a3b18a', x, 0, z));
  const easel = new THREE.Group(); easel.position.set(x - .2, 0, z + .3); k.group.add(easel);
  const sketch = card(1.3, 1.1, (g, W, H) => { rrect(g, 0, 0, W, H, 3, '#fffdf7'); g.strokeStyle = '#5c6b8a'; g.lineWidth = 3; g.setLineDash([8, 5]); g.strokeRect(W * .2, H * .45, W * .6, H * .45); g.beginPath(); g.moveTo(W * .15, H * .47); g.lineTo(W * .5, H * .15); g.lineTo(W * .85, H * .47); g.stroke(); g.strokeRect(W * .44, H * .65, W * .12, H * .25); });
  sketch.position.y = .6; easel.add(sketch, box(.05, .9, .05, '#8a6b4a', -.5, 0, -.1), box(.05, .9, .05, '#8a6b4a', .5, 0, -.1));
  easel.scale.y = .02;
  const home = new THREE.Group(); home.position.set(x, 0, z); k.group.add(home);
  const front = new THREE.Group(); home.add(front);
  front.add(box(1.6, 1.4, .9, '#e9d6f2', 0, 0, 0)); const fr = new THREE.Mesh(new THREE.CylinderGeometry(.01, 1.05, .75, 4, 1), new THREE.MeshStandardMaterial({ color: INDIGO })); fr.rotation.y = Math.PI / 4; fr.scale.set(1.05, 1, .62); fr.position.y = 1.78; fr.castShadow = true; front.add(fr);
  front.add(box(.32, .6, .03, '#7a5a3a', 0, 0, .46), box(.34, .34, .03, '#fdf3d0', -.45, .85, .46), box(.34, .34, .03, '#fdf3d0', .45, .85, .46));
  // The back: pipes and wiring folded into the wall.
  const back = new THREE.Group(); back.position.z = -.46; front.add(back);
  back.add(box(.08, 1.2, .04, '#7d8a96', -.4, .1, -.02), box(.6, .08, .04, '#7d8a96', -.1, 1.1, -.02), box(.05, 1.1, .03, '#e8552d', .35, .1, -.02), box(.5, .05, .03, '#e8552d', .55, .6, -.02), box(.25, .25, .04, '#3d444e', .45, .25, -.03));
  front.scale.y = .02; front.visible = false;
  const t = k.tab('right'); t.position.set(x - 1.4, .8, z + .9); k.group.add(t);
  const lines = ['First, I designed it.', 'Then I built the front…', '…and the back: the pipes and wiring.'];
  k.mechs.push({ id: 'plot', x, at: V(x, 2.6), label: () => ['Pull: sketch', 'Pull: build the front', 'Pull: turn it round', 'Turn it back'][st], on: () => !busy, use: async (g: Game) => {
    busy = true; t.kick(); sfx.fold();
    if (st === 0) { await g.anims.play(220, kk => { easel.scale.y = Math.max(.02, stepped(kk, 12, 220)); }); }
    else if (st === 1) { front.visible = true; await g.anims.play(260, kk => { const s = stepped(kk, 12, 260); front.scale.y = Math.max(.02, s); easel.position.x = x - .2 - s * 1.4; }); g.fx.burst(x, 1.2, z + .5, [INDIGO, '#fffaf0', '#f6b73c'], 12); }
    else if (st === 2) { await g.anims.play(320, kk => { home.rotation.y = stepped(kk, 12, 320) * Math.PI; }); }
    else { await g.anims.play(320, kk => { home.rotation.y = Math.PI * (1 - stepped(kk, 12, 320)); }); }
    sfx.pop();
    if (st < 3) { if (st === 2) k.tell(g, 'plot', lines[2], V(x, 3)); else g.caption(lines[st], V(x, 3)); }
    st = st === 3 ? 2 : st + 1; busy = false;
  } });
  k.parts.push({ tabs: [{ tab: t, x }] });
}
// 3. The road sign: a tall MOPERTY sign rises over the roofs, and people start walking in from the edge of town.
function roadSign(k: Kit) {
  const x = MOPERTY.road, z = -1.6; let up = false;
  const pole = new THREE.Group(); pole.position.set(x, -3.6, z); k.group.add(pole);
  pole.add(box(.1, 3.8, .1, '#6b5a44', 0, 0, 0));
  const board = card(1.8, .7, (g, W, H) => { rrect(g, 0, 0, W, H, 8, INDIGO); label(g, 'MOPERTY  →', W / 2, H * .45, H * .4, '#fffaf0', 'center', 700); label(g, 'homes near you', W / 2, H * .8, H * .17, '#cfd6ff'); });
  board.position.set(0, 3.8, .06); pole.add(board);
  k.group.add(box(.6, .4, .5, '#8a8577', x, 0, z));
  const t = k.tab('up'); t.position.set(x + .38, .25, z + .3); k.group.add(t);
  const visitors = [0, 1, 2, 3].map(j => { const c = person(CROWD[(j + 2) % CROWD.length]); c.visible = false; c.position.set(MOPERTY.width + 3 + j * 1.3, 0, -.9 - (j % 2) * .4); c.scale.x = -1.07; k.group.add(c); return c; });
  const settle = new Settle();
  k.mechs.push({ id: 'road', x, at: V(x, 2.2), label: 'Raise the sign', on: () => !up, use: async (g: Game) => {
    up = true; t.kick(); sfx.whoosh();
    await g.anims.play(420, kk => { pole.position.y = -3.6 + stepped(kk, 12, 420) * 3.6; });
    settle.kick(1.5); sfx.pop(); g.stage.shake(.08);
    visitors.forEach(v => (v.visible = true));
    k.tell(g, 'road', 'People had to find it, so I did the SEO.', V(x, 4.3));
  } });
  k.parts.push({ tabs: [{ tab: t, x, alive: () => !up }], update: (dt, g) => {
    board.rotation.z = settle.step(dt) * .1;
    visitors.forEach((v, j) => { if (!v.visible) return; v.position.x -= dt * (1 + j * .15); v.position.y = Math.abs(Math.sin(g.time * 8 + j)) * .06; if (v.position.x < MOPERTY.houses[j % 5]) v.position.x = MOPERTY.width + 3; });
  } });
}
// ★ The street lamp: jump into its head and evening falls; every window lights. Still running.
function lamp(k: Kit, head: THREE.Group, houses: House[]) {
  const x = MOPERTY.lamp;
  k.group.add(box(.09, 2.8, .09, '#3d444e', x, 0, -1.2));
  const glass = new THREE.MeshStandardMaterial({ color: '#fff4c2', emissive: '#000' });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), glass); head.add(bulb, box(.5, .08, .3, '#3d444e', 0, .15, 0)); k.group.add(head);
  let night = 0, want = 0, done = false; const sw = new Settle();
  k.parts.push({ update: (dt, g) => {
    const h = g.hero.body;
    if (h.vy > 0 && Math.abs(h.x - x) < .6 && h.y + 1.45 > 2.75 && want === 0) {
      want = 1; sw.kick(2); tone({ f: 523, d: .8, type: 'sine', v: .2 }); tone({ f: 784, d: .8, type: 'sine', v: .15, at: .2 });
      if (!done) { done = true; k.tell(g, 'lamp', 'Still running: I build and run the whole product.', new THREE.Vector3(x, 3.6, -1), true); }
      setTimeout(() => (want = 0), 9000);
    }
    head.rotation.z = sw.step(dt) * .15;
    night += (want - night) * Math.min(1, dt * 1.5);
    const bg = new THREE.Color('#bfe3f2').lerp(new THREE.Color('#1c2a4a'), night); (g.stage.scene.background as THREE.Color).copy(bg);
    g.stage.hemi.intensity = 1.15 - night * .7; g.stage.sun.intensity = 2.3 - night * 1.9;
    glass.emissive.setScalar(night * .9);
    houses.forEach((hs, j) => hs.windows.forEach(w => w.emissive.set('#ffcf6b').multiplyScalar(Math.max(0, night * 1.2 - j * .08))));
  } });
}
