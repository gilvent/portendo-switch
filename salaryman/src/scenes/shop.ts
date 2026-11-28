import * as THREE from 'three';
import { box, card, label, mat, rrect } from '../game/paper.ts';
import { Settle, stepped } from '../game/mech.ts';
import { sfx } from '../game/sfx.ts';
import { noise, tone } from '../core/audio.ts';
import { clamp, rand, Spring } from '../core/math.ts';
import { person, CROWD } from '../game/people.ts';
import { reducedMotion } from '../core/stage.ts';
import { station, type Kit } from './station.ts';
import type { Game } from '../game/game.ts';

// Blibli.com: a paper shop floor. Not an account of the work, a toy of the place: whatever he touches ends up in the
// bag on his arm, the till rings it up, a courier rides it to the trains, and it is on his seat when he boards. Each
// of the five movable-book mechanisms appears once (wheel, pull-tab, flap, pop-up, slot); the sale bell is the secret.
const BLUE = '#0092da', SUN = '#f6b73c', MINT = '#35b58a', CREAM = '#fffaf0', INK = '#23262b';
const V = (x: number, y: number, z = -1) => new THREE.Vector3(x, y, z);
export const BLIBLI = { width: 38, greeter: 1.6, lamp: 4.5, shelfA: 8, cans: 11, shelfB: 14.3, fitting: 17.5, box: 24, shelfC: 27.2, till: 30, courier: 32.4, bell: 33 };
const shop = { sale: false, redraws: [] as (() => void)[] };

// Anything that goes in the bag: a group whose origin is its bottom, so it stacks.
function item(m: THREE.Object3D, h: number, kind: string) { const g = new THREE.Group(); g.add(m); return Object.assign(g, { h, kind }); }
type Item = ReturnType<typeof item>;
const mini = (color: string, kind: string, w = .2, h = .2) => item(box(w, h, .18, color), h, kind);

// The bag on his arm, and the tower of things standing out of it. The tower leans against his acceleration on a
// spring; when he jumps, the things float apart and clatter back on landing.
function makeBag(k: Kit) {
  const g = new THREE.Group();
  g.add(box(.42, .46, .2, BLUE), box(.03, .16, .03, '#06639a', -.1, .46, 0), box(.03, .16, .03, '#06639a', .1, .46, 0));
  const tower = new THREE.Group(); tower.position.y = .46; g.add(tower);
  const items: { m: Item; lift: number }[] = [];
  const lean = new Spring(0, 90, 6), pop = new Spring(.01, 300, 12), wob = new Settle();
  let side = -1, lastVx = 0, wasGround = true, shown = false;
  g.visible = false;
  const height = () => items.reduce((n, it) => n + it.m.h, 0);
  const bag = {
    g, get count() { return items.length; },
    show() { if (shown) return; shown = true; g.visible = true; pop.x = .01; pop.kick(9); sfx.pop(); },
    // Where the next thing lands, in the world.
    top() { tower.updateWorldMatrix(true, false); return tower.localToWorld(new THREE.Vector3(0, height(), 0)); },
    // A thing hops from where it is into the bag, along an arc.
    async add(gm: Game, m: Item, from: THREE.Vector3, scale = 1) {
      bag.show();
      k.group.add(m); m.position.copy(from); m.scale.setScalar(scale);
      const start = from.clone(), spin = rand(-1, 1) > 0 ? 1 : -1;
      await gm.anims.play(400, t => { const to = bag.top(); m.position.lerpVectors(start, to, t); m.position.y += Math.sin(t * Math.PI) * 1.1; m.rotation.z = t * Math.PI * 2 * spin; });
      k.group.remove(m); m.rotation.set(0, 0, 0); m.scale.setScalar(scale);
      if (items.length >= 8) { const old = items.shift()!; tower.remove(old.m); }
      items.push({ m, lift: 0 }); tower.add(m);
      tone({ f: 820 + items.length * 70, d: .08, type: 'sine', v: .2 }); wob.kick(.8);
    },
    // Everything out of the bag (for the till), with where each one is now.
    take() { const out = items.map(it => { it.m.updateWorldMatrix(true, false); const p = it.m.getWorldPosition(new THREE.Vector3()); tower.remove(it.m); return { m: it.m, p }; }); items.length = 0; return out; },
    update(dt: number, gm: Game) {
      const h = gm.hero, b = h.body;
      side += (-h.facing - side) * Math.min(1, dt * 10);
      g.position.set(side * .44, .2, .14);
      g.scale.setScalar(Math.max(.01, pop.step(1, dt)) * (1 + wob.step(dt) * .06));
      lean.kick(-(b.vx - lastVx) * .7); lastVx = b.vx;
      const L = reducedMotion ? 0 : clamp(lean.step(0, dt), -.5, .5);
      let y = 0;
      items.forEach((it, i) => {
        const want = b.ground ? 0 : (i + 1) * .06;
        it.lift += (want - it.lift) * Math.min(1, dt * (b.ground ? 16 : 5));
        it.m.position.set(L * y * .35, y + it.lift, 0); it.m.rotation.z = L * .4 + (b.ground ? 0 : Math.sin(gm.time * 9 + i) * .08);
        y += it.m.h;
      });
      if (!wasGround && b.ground && items.length) items.forEach((_, i) => noise({ d: .03, f: 1500 + i * 160, q: 3, v: .14, at: i * .045 }));
      wasGround = b.ground;
    }
  };
  return bag;
}
type Bag = ReturnType<typeof makeBag>;

export function blibli(i: number) {
  const B = BLIBLI;
  shop.sale = false; shop.redraws = [];
  const bell = new THREE.Group(); bell.position.set(B.bell, 2.75, -.4);
  (window as unknown as { __bell: number }).__bell = B.bell;
  return station(i, B.width, { floor: '#e8e1d3', wall: '#f4f1ea', sky: '#d8ecf6' }, k => {
    const bag = makeBag(k);
    k.parts.push({ enter: g => { g.hero.group.add(bag.g); }, exit: g => { g.hero.group.remove(bag.g); }, update: (dt, g) => bag.update(dt, g) });
    fascia(k);
    greeter(k, bag);
    lamp(k, bag);
    const shelves = [shelf(k, B.shelfA, [MINT, SUN, '#7b4b8f', BLUE]), shelf(k, B.shelfB, [SUN, '#c0392b', MINT, '#8fd3f4']), shelf(k, B.shelfC, ['#7b4b8f', BLUE, SUN, MINT])];
    cans(k, bag);
    fitting(k);
    surprise(k, bag);
    till(k, bag);
    strollers(k);
    flashSale(k, bell, shelves);
  }, { x: B.bell, y: 2.75, obj: bell });
}
function fascia(k: Kit) {
  const c = card(2.6, .8, (g, W, H) => { rrect(g, 0, 0, W, H, 22, BLUE); label(g, 'blibli', W / 2, H * .52, H * .6, CREAM, 'center', 700); }, { rim: .03 });
  c.position.set(3.4, 3.05, -3); k.group.add(c);
}
// The greeter at the door bows, and a flat bag hops onto his arm and pops open. It says "shop" in the first second.
function greeter(k: Kit, bag: Bag) {
  const x = BLIBLI.greeter, c = person({ shirt: BLUE, face: 'smile' }); c.position.set(x, 0, -1.1); k.group.add(c);
  k.group.add(box(.5, .8, .4, '#d7dbe0', x - .75, 0, -1.5));
  for (let j = 0; j < 3; j++) k.group.add(box(.42, .05, .22, BLUE, x - .75, .8 + j * .06, -1.5));
  let t = -1;
  k.parts.push({ update: (dt, g) => {
    if (t < 0 && g.hero.body.x > x - 1.1) { t = 0; sfx.paper(); }
    if (t >= 0 && t < 1.2) { t += dt; c.rotation.x = Math.sin(Math.min(1, t / .8) * Math.PI) * .45; if (t > .35) bag.show(); }
  } });
}
// 1. The lamp carousel (wheel): the wheel ratchets the lamp through its colours, and a boxed lamp of that colour hops
// into the bag.
const VARIANTS = [{ c: BLUE, price: 349 }, { c: MINT, price: 349 }, { c: SUN, price: 379 }];
function lampModel(color: string) {
  const g = new THREE.Group(), m = mat(color), sm = mat(color, { side: THREE.DoubleSide });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, .08, 20), m); base.position.y = .04;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(.05, .55, .05), m); arm.position.set(.05, .33, 0); arm.rotation.z = -.25;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.2, .26, 20, 1, true), sm); shade.position.set(.2, .62, 0); shade.rotation.z = .9;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffd27a', emissiveIntensity: 0 })); bulb.position.set(.24, .56, 0);
  [base, arm, shade].forEach(o => { o.castShadow = true; g.add(o); }); g.add(bulb);
  return Object.assign(g, { setColor: (c: string) => { m.color.set(c); sm.color.set(c); }, light: (v: number) => ((bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = v) });
}
function priceTag(price: () => number) {
  const c = card(.62, .4, (g, W, H) => {
    rrect(g, 0, 0, W, H, 6, CREAM); const p = price();
    if (!shop.sale) { label(g, `Rp ${p}k`, W / 2, H / 2, H * .36, INK, 'center', 700); return; }
    label(g, `Rp ${p}k`, W / 2, H * .3, H * .24, '#9aa0a8', 'center', 700); g.strokeStyle = '#c0392b'; g.lineWidth = 5; g.beginPath(); g.moveTo(W * .2, H * .33); g.lineTo(W * .8, H * .27); g.stroke();
    label(g, `Rp ${Math.round(p * .8)}k`, W / 2, H * .7, H * .32, '#c0392b', 'center', 700);
  });
  shop.redraws.push(() => c.redraw());
  return c;
}
function lamp(k: Kit, bag: Bag) {
  const x = BLIBLI.lamp, z = -1.3;
  k.group.add(box(1.1, .95, .8, CREAM, x, 0, z));
  const lampM = lampModel(VARIANTS[0].c); lampM.position.set(x - .05, .95, z); k.group.add(lampM);
  const wheel = new THREE.Group(); wheel.position.set(x, .48, z + .42); k.group.add(wheel);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .05, 24), mat('#d7dbe0')); disc.rotation.x = Math.PI / 2; wheel.add(disc);
  VARIANTS.forEach((v, n) => { const d = new THREE.Mesh(new THREE.CircleGeometry(.07, 12), mat(v.c)); d.position.set(Math.sin(n * 2.094) * .19, Math.cos(n * 2.094) * .19, .03); wheel.add(d); });
  const t = k.tab('turn'); t.position.set(.3, .1, .04); wheel.add(t);
  let n = 0, told = false, glow = 0;
  const tag = priceTag(() => VARIANTS[n].price); tag.position.set(x + .62, .95, z + .3); tag.rotation.z = -.08; k.group.add(tag);
  const settle = new Settle();
  k.mechs.push({ id: 'lamp', x, at: V(x, 2.2), label: 'Turn the wheel', use: async (g: Game) => {
    n = (n + 1) % 3; t.kick();
    const from = wheel.rotation.z;
    [0, .07, .14].forEach(at => tone({ f: 2400, d: .025, type: 'square', v: .06, at }));
    await g.anims.play(220, kk => { wheel.rotation.z = from - stepped(kk, 12, 220) * 2.094; lampM.scale.y = 1 - Math.sin(stepped(kk, 12, 220) * Math.PI) * .7; });
    lampM.setColor(VARIANTS[n].c); tag.redraw(); settle.kick(); sfx.pop(); glow = 1; tone({ f: 1800, d: .03, type: 'square', v: .08, at: .05 });
    g.fx.burst(x, 1.6, z + .4, [VARIANTS[n].c, CREAM], 10, .7);
    void bag.add(g, mini(VARIANTS[n].c, 'lamp', .2, .24), V(x, 1.4, z + .3));
    if (!told) { told = true; k.tell(g, 'lamp', 'Just looking. Fine, I’ll take one.', V(x, 2.7)); }
  } });
  k.parts.push({ tabs: [{ tab: t, x }], update: dt => {
    const s = settle.step(dt); lampM.scale.set(1 + s * .08, Math.max(.3, lampM.scale.y + (1 - lampM.scale.y) * Math.min(1, dt * 12)) + s * .1, 1 + s * .08);
    glow = Math.max(.25, glow - dt * .8); lampM.light(glow * 1.6);
  } });
}
// A shelf whose goods stand up one by one as he comes near (unmarked: the shop unfolding as he walks in). The sale
// stampede folds them flat as it passes; they restock in a wave.
function shelf(k: Kit, x: number, colors: string[]) {
  const z = -2;
  k.group.add(box(3, .9, .55, '#d7dbe0', x, 0, z), box(3, .05, .5, '#c3c9d0', x, 1.6, z - .02), box(.05, 1.65, .05, '#9aa0a8', x - 1.45, 0, z - .2), box(.05, 1.65, .05, '#9aa0a8', x + 1.45, 0, z - .2));
  const goods = [0, 1, 2, 3, 4, 5].map(j => {
    const ix = x - 1.1 + (j % 4) * .73, top = j < 4 ? .9 : 1.65, c = colors[j % colors.length];
    const m = j % 3 === 0 ? (() => { const cyl = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .45, 14), mat(c)); cyl.position.y = .225; cyl.castShadow = true; const gg = new THREE.Group(); gg.add(cyl); return gg; })() : (() => { const gg = new THREE.Group(); gg.add(box(.36, j % 2 ? .5 : .34, .3, c)); return gg; })();
    m.position.set(j < 4 ? ix : x - .7 + (j - 4) * 1.2, top, z); m.scale.y = .05; k.group.add(m);
    return { m, ix: m.position.x, up: false, t: 0, settle: new Settle() };
  });
  let folded = false;
  k.parts.push({ update: (dt, g) => {
    for (const it of goods) {
      if (!it.up && !folded && Math.abs(g.hero.body.x - it.ix) < 2.6) { it.up = true; it.settle.kick(1.2); tone({ f: 640 + goods.indexOf(it) * 90, d: .07, type: 'sine', v: .12 }); }
      it.t = it.up && !folded ? Math.min(1, it.t + dt / .22) : Math.max(0, it.t - dt / .12);
      it.m.scale.y = Math.max(.05, stepped(it.t, 12, 220)) + it.settle.step(dt) * .12;
    }
  } });
  return { x, fold() { folded = true; }, restock(g: Game) { folded = false; goods.forEach((it, j) => { it.up = false; setTimeout(() => { if (Math.abs(g.hero.body.x - it.ix) < 40) { it.up = true; it.settle.kick(1.2); tone({ f: 700 + j * 80, d: .06, type: 'sine', v: .1 }); } }, j * 70); }); } };
}
// 2. The can pyramid (pull-tab): pull the bottom can and the pyramid holds its breath, then comes down and rolls all
// over the floor; the cans hop back up in stop-motion. Second time, only the top can drops (into the bag). Third, down.
function cans(k: Kit, bag: Bag) {
  const x = BLIBLI.cans, z = -1.25, top = .72, R = .12, HC = .27;
  k.group.add(box(1.5, top, .7, '#cfd3d8', x, 0, z));
  k.group.add(box(.05, 1.2, .05, '#8a919b', x + 1.05, 0, z + .1));
  const tag = priceTag(() => 12); tag.position.set(x + 1.05, 1.2, z + .14); k.group.add(tag);
  const home: { x: number; y: number }[] = [];
  [4, 3, 2, 1].forEach((n, r) => { for (let j = 0; j < n; j++) home.push({ x: x + (j - (n - 1) / 2) * .26, y: top + r * HC + HC / 2 }); });
  const colors = ['#c0392b', SUN, MINT, BLUE];
  const tins = home.map((p, j) => {
    const g = new THREE.Group(), inner = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, HC, 16), mat(colors[j % 4])); cyl.castShadow = true;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, HC * .42, 16), mat(CREAM));
    inner.add(cyl, band); g.add(inner); g.position.set(p.x, p.y, z); k.group.add(g);
    return { g, inner, x: p.x, y: p.y, vx: 0, vy: 0, loose: false };
  });
  const pull = 1, topCan = tins.length - 1;
  const t = k.tab('down', .26); t.position.set(home[pull].x, top + .02, z + R + .06); k.group.add(t);
  const clerk = person({ ...CROWD[2], face: 'o' }); clerk.position.set(x - .3, -1.3, z - .75); k.group.add(clerk);
  let busy = false, pulls = 0, clerkUp = 0, told = false;
  const can = (j: number) => { const it = mini(colors[j % 4], 'can', .16, .2); return it; };
  const reset = (s: typeof tins[number], j: number) => { s.loose = false; s.x = home[j].x; s.y = home[j].y; s.vx = s.vy = 0; s.g.position.set(s.x, s.y, z); s.g.rotation.z = 0; s.inner.rotation.x = 0; s.g.visible = true; };
  k.mechs.push({ id: 'cans', x, at: V(x, 2.3), label: 'Pull the bottom can', on: () => !busy, use: async (g: Game) => {
    busy = true; t.kick(); pulls++;
    const p = tins[pull];
    sfx.paper();
    await g.anims.play(150, kk => { p.g.position.z = z + stepped(kk, 12, 150) * .4; });
    p.g.visible = false; p.g.position.z = z;
    void bag.add(g, can(pull), V(p.x, p.y, z + .4));
    if (!told) { told = true; k.tell(g, 'cans', 'I only wanted the bottom one.', V(x, 2.8)); }
    // The held breath: the top can wobbles; the clerk comes up behind the table.
    clerkUp = 1;
    await g.anims.play(380, kk => { tins[topCan].g.rotation.z = Math.sin(kk * 30) * .12 * kk; });
    tins[topCan].g.rotation.z = 0;
    if (pulls % 2 === 0) {
      // Only the top can drops, bounces once, and lands in the bag.
      const s = tins[topCan]; s.g.visible = false; sfx.bonk(.3);
      await bag.add(g, can(topCan), V(s.x, s.y, z));
      await g.anims.wait(500);
      reset(p, pull); reset(s, topCan); sfx.pop(); clerkUp = 0; busy = false; return;
    }
    // Down it comes.
    sfx.bonk(.7); g.stage.shake(.25); noise({ d: .5, f: 1200, to: 400, q: .6, v: .35 });
    tins.forEach((s, j) => { if (j === pull) return; s.loose = true; s.vx = (s.x - x) * 4 + rand(-2.6, 2.6); s.vy = rand(.5, 3); s.inner.rotation.x = Math.PI / 2; });
    // One rolls for his head.
    const hx = g.hero.body.x;
    if (Math.abs(hx - x) < 3.2) { const s = tins[topCan]; s.vx = (hx - s.x) * 2.2; s.vy = 6; setTimeout(() => { if (g.place.id === 'stop-blibli') { g.hero.hop(3.5); sfx.bonk(.45); } }, 420); }
    await g.anims.wait(1500);
    // Back up, bottom row first, one clack each on a rising pitch.
    for (let j = 0; j < tins.length; j++) {
      const s = tins[j], fx0 = s.g.position.x, fy0 = s.g.position.y; s.loose = false;
      if (j === pull) { reset(s, j); s.g.scale.setScalar(.01); }
      await g.anims.play(70, kk => { const e = stepped(kk, 12, 70); if (j !== pull) s.g.position.set(fx0 + (home[j].x - fx0) * e, fy0 + (home[j].y - fy0) * e + Math.sin(e * Math.PI) * .4, z); else s.g.scale.setScalar(Math.max(.01, e)); });
      reset(s, j); s.g.scale.setScalar(1); tone({ f: 420 + j * 55, d: .05, type: 'triangle', v: .16 });
    }
    clerkUp = 0; busy = false;
  } });
  k.parts.push({ tabs: [{ tab: t, x, alive: () => !busy }], update: dt => {
    clerk.position.y += ((clerkUp ? -.3 : -1.3) - clerk.position.y) * Math.min(1, dt * 8);
    for (const s of tins) {
      if (!s.loose) continue;
      s.vy -= 18 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      const onTable = Math.abs(s.x - x) < .75 && s.y > top;
      const floor = onTable ? top + R : R;
      if (s.y < floor) { s.y = floor; if (s.vy < -1.5) { s.vy *= -.35; noise({ d: .03, f: 2000, q: 3, v: .1 }); } else s.vy = 0; s.vx *= .985; }
      if (s.y <= floor + .001) s.vx *= Math.exp(-dt * 1.3);
      if (Math.abs(s.x - x) > 3.4) { s.x = x + Math.sign(s.x - x) * 3.4; s.vx *= -.3; }
      s.g.position.set(s.x, s.y, z + (s.y < top ? .45 : 0)); s.g.rotation.z -= s.vx / R * dt * .5;
    }
  } });
}
// 3. The fitting room (flap): the curtain drops in front of him, three rustles, and it snaps up on the next look. He
// keeps wearing it, price tag and all.
const LOOKS = ['glasses', 'cap', 'bow', 'all'] as const;
function wearable(kind: 'glasses' | 'cap' | 'bow') {
  const g = new THREE.Group();
  if (kind === 'glasses') { g.add(box(.14, .09, .03, INK, .09, .97, .03), box(.13, .09, .03, INK, .245, .97, .03), box(.06, .02, .03, INK, .17, 1.02, .03)); }
  if (kind === 'cap') { g.add(box(.6, .15, .34, BLUE, 0, 1.27, 0), box(.32, .04, .34, BLUE, .36, 1.26, 0), box(.08, .04, .08, CREAM, 0, 1.42, 0)); }
  if (kind === 'bow') { const a = box(.12, .1, .03, '#c0392b', -.06, .7, .04), b = box(.12, .1, .03, '#c0392b', .06, .7, .04); a.rotation.z = .4; b.rotation.z = -.4; g.add(a, b, box(.04, .06, .035, '#8e2a1f', 0, .72, .05)); }
  return g;
}
function priceTagOn(at: THREE.Vector3) {
  const piv = new THREE.Group(); piv.position.copy(at);
  piv.add(box(.008, .16, .008, '#c9ccd1', 0, -.16, .04));
  const t = card(.09, .13, (g, W, H) => { rrect(g, 0, 0, W, H, 3, CREAM); g.fillStyle = '#9aa0a8'; g.beginPath(); g.arc(W / 2, H * .15, W * .1, 0, 7); g.fill(); }, { rim: .008, res: 300 });
  t.position.set(-.045, -.3, .045); piv.add(t);
  return piv;
}
function fitting(k: Kit) {
  const x = BLIBLI.fitting, rail = 2.45, cz = .55, CW = 1.7, CH = 2.4;
  k.group.add(box(2.4, 2.7, .12, '#cfd3d8', x, 0, -1.7));
  const mirror = card(.7, 1.6, (g, W, H) => { rrect(g, 0, 0, W, H, 10, '#cfe6f2'); g.fillStyle = '#ffffff88'; g.beginPath(); g.moveTo(W * .2, H * .1); g.lineTo(W * .45, H * .1); g.lineTo(W * .15, H * .5); g.lineTo(W * .1, H * .3); g.fill(); }, { rim: .03 });
  mirror.position.set(x + .6, .5, -1.62); k.group.add(mirror);
  k.group.add(box(.06, .06, 2.3, '#8a919b', x - .9, rail, -.6), box(.06, .06, 2.3, '#8a919b', x + .9, rail, -.6), box(1.9, .07, .07, '#8a919b', x, rail, cz));
  const piv = new THREE.Group(); piv.position.set(x, rail, cz); k.group.add(piv);
  const curtain = card(CW, CH, (g, W, H) => { g.fillStyle = '#7b4b8f'; g.fillRect(0, 0, W, H); g.fillStyle = '#6a3d7d'; for (let j = 0; j < 7; j++) g.fillRect(W * (j / 7 + .06), 0, W * .04, H); g.fillStyle = '#e8d5ef'; g.fillRect(0, H * .92, W, H * .03); }, { rim: .02, res: 90 });
  curtain.position.y = -CH - .02; piv.add(curtain);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, CW + .1, 12), mat('#6a3d7d')); roll.rotation.z = Math.PI / 2; roll.position.set(x, rail - .06, cz); k.group.add(roll);
  piv.scale.y = .03;
  const t = k.tab('down', .28); t.position.set(x + .62, rail - .25, cz + .08); k.group.add(t);
  let n = -1, busy = false, told = false;
  const worn = { now: null as THREE.Group | null };
  k.mechs.push({ id: 'fitting', x, at: V(x, 2.85, .3), label: 'Pull the curtain', on: () => !busy, use: async (g: Game) => {
    busy = true; t.kick(); const h = g.hero; h.frozen = true;
    const x0 = h.body.x; await g.anims.play(160, kk => { h.body.x = x0 + (x - x0) * kk; });
    noise({ d: .14, f: 380, q: .7, v: .45 }); sfx.fold();
    await g.anims.play(200, kk => { piv.scale.y = Math.max(.03, stepped(kk, 12, 200)); });
    g.stage.shake(.08);
    // Three rustles; the old look is tossed over the top.
    n = (n + 1) % LOOKS.length;
    const old = worn.now;
    for (let r = 0; r < 3; r++) {
      noise({ d: .12, f: 2600, to: 1200, q: .8, v: .3 });
      g.fx.burst(x + (r % 2 ? .95 : -.95), 1.2, cz, ['#7b4b8f', CREAM], 4, .4);
      await g.anims.play(170, kk => { curtain.scale.x = (CW + .04) * (1 + Math.sin(kk * Math.PI) * .07); piv.position.x = x + Math.sin(kk * Math.PI) * (r % 2 ? .07 : -.07); });
      if (r === 1 && old) {
        h.wear.remove(old); k.group.add(old); old.position.set(x, 0, 0); old.scale.set(1, 1, 1);
        void g.anims.play(600, kk => { old.position.set(x + kk * 1.1, Math.sin(kk * Math.PI) * 2.2 + 1 - kk * 1.2, -kk * 1.4); old.rotation.z = kk * 8; }).then(() => k.group.remove(old));
      }
    }
    const look = LOOKS[n], now = new THREE.Group();
    (look === 'all' ? ['glasses', 'cap', 'bow'] as const : [look]).forEach(kd => now.add(wearable(kd)));
    const tagAt = look === 'bow' ? new THREE.Vector3(.1, .68, .02) : look === 'glasses' ? new THREE.Vector3(.31, .99, .02) : new THREE.Vector3(.5, 1.25, .02);
    const tg = priceTagOn(tagAt); now.add(tg);
    h.swingers.length = 0; h.swingers.push(tg);
    h.wear.add(now); worn.now = now;
    sfx.pop(); tone({ f: 660, to: 1320, d: .12, type: 'sine', v: .22 });
    await g.anims.play(120, kk => { piv.scale.y = Math.max(.03, 1 - stepped(kk, 12, 120)); });
    piv.position.x = x; curtain.scale.x = CW + .04;
    g.fx.burst(x, 1.4, cz, [SUN, CREAM, BLUE], 14, .8);
    h.frozen = false; h.hop(4);
    if (!told) { told = true; k.tell(g, 'fitting', 'Tag stays on. That’s the look.', V(x, 2.9, .3)); }
    busy = false;
  } });
  k.parts.push({ tabs: [{ tab: t, x, alive: () => !busy }] });
}
// 4. The surprise box (pop-up): it springs by itself as he walks past, toy and all; the toy hops onto his tower.
// After that, A pushes the spring back in, the box rattles, and out comes the next toy.
function toyModel(n: number) {
  const g = new THREE.Group();
  if (n === 0) { const b = new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 10), mat(SUN)); b.position.y = .17; const h = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 8), mat(SUN)); h.position.set(.1, .38, 0); g.add(b, h, box(.1, .04, .08, '#e67e22', .22, .35, 0)); }
  if (n === 1) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .4, 12), mat(MINT)); c.position.y = .2; g.add(c, box(.16, .06, .07, MINT, -.13, .22, 0), box(.06, .12, .07, MINT, -.2, .28, 0), box(.14, .06, .07, MINT, .12, .28, 0), box(.06, .1, .07, MINT, .17, .33, 0)); }
  if (n === 2) { g.add(box(.3, .26, .24, '#9aa0a8', 0, 0, 0), box(.22, .18, .2, '#b7bec7', 0, .26, 0), box(.03, .12, .03, '#8a919b', 0, .44, 0), box(.06, .06, .02, '#e74c3c', -.05, .32, .1), box(.06, .06, .02, '#e74c3c', .05, .32, .1)); }
  if (n === 3) { const ear = (s: number) => { const e = new THREE.Mesh(new THREE.ConeGeometry(.06, .12, 4), mat('#e67e22')); e.position.set(s * .08, .46, 0); return e; }; g.add(box(.28, .22, .2, '#e67e22', 0, 0, 0), box(.24, .2, .2, '#e67e22', 0, .22, 0), ear(-1), ear(1)); }
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return g;
}
function surprise(k: Kit, bag: Bag) {
  const x = BLIBLI.box, z = -1.2, S = .9;
  k.group.add(box(S, .8, S, BLUE, x, 0, z), box(.14, .81, S + .02, SUN, x, 0, z), box(S + .02, .81, .14, SUN, x, 0, z));
  const lid = new THREE.Group(); lid.position.set(x, .8, z - S / 2); k.group.add(lid);
  lid.add(box(S + .06, .12, S + .06, BLUE, 0, 0, S / 2), box(.15, .13, S + .07, SUN, 0, 0, S / 2));
  const coil = new THREE.Group(); coil.position.set(x, .8, z); k.group.add(coil);
  const spring = box(.1, 1, .1, '#c9ccd1'); coil.add(spring);
  const zig = [0, 1, 2, 3, 4].map(j => { const r = box(.22, .03, .12, '#b7bec7', 0, j * .2, 0); r.rotation.z = j % 2 ? .4 : -.4; coil.add(r); return r; });
  let toy = toyModel(0); coil.add(toy);
  let n = 0, state: 'shut' | 'up' | 'busy' = 'shut', told = false, len = 0, manual = -1;
  const lenS = new Spring(0, 140, 7), sway = new Spring(0, 60, 2.5);
  const setLen = (l: number) => { len = Math.max(0, l); spring.scale.y = Math.max(.01, len); spring.position.y = len / 2; zig.forEach((r, j) => (r.position.y = len * (j + .5) / 5)); toy.position.set(0, len, 0); coil.visible = len > .02; };
  setLen(0); lenS.x = 0;
  const t = k.tab('down', .28); t.position.set(x + .55, .95, z + .48); k.group.add(t);
  const spring_ = async (g: Game) => {
    state = 'busy';
    noise({ d: .06, f: 900, q: 1, v: .3 });
    await g.anims.play(120, kk => { lid.rotation.x = -stepped(kk, 12, 120) * 1.9; });
    manual = -1; lenS.x = .05; lenS.v = 0; lenS.kick(14); sway.kick(3);
    tone({ f: 260, to: 900, d: .25, type: 'sine', v: .3 }); tone({ f: 900, to: 700, d: .18, type: 'sine', v: .15, at: .2 });
    g.fx.burst(x, 1.2, z, [SUN, CREAM, '#d9cdb6'], 18, .9); g.stage.shake(.1);
    if (Math.abs(g.hero.body.x - x) < 2.2) g.hero.hop(3);
    if (!told) { told = true; k.tell(g, 'box', 'Didn’t need it. Bought it anyway.', V(x, 2.9)); }
    await g.anims.wait(650);
    // The toy unhooks and hops onto his tower; the next one is waiting inside.
    const from = toy.getWorldPosition(new THREE.Vector3()); coil.remove(toy);
    const it = item(toy, .45 * .5, 'toy'); toy.position.set(0, 0, 0);
    void bag.add(g, it, from, .5);
    n = (n + 1) % 4; toy = toyModel(n); toy.visible = false; coil.add(toy);
    state = 'up';
  };
  k.mechs.push({ id: 'box', x, at: V(x, 2.2), label: 'Push it back in', on: () => state === 'up', use: async (g: Game) => {
    state = 'busy'; t.kick(); sfx.fold();
    toy.visible = true;
    await g.anims.play(150, kk => { manual = 1.4 * (1 - stepped(kk, 12, 150)); });
    manual = 0;
    await g.anims.play(100, kk => { lid.rotation.x = -1.9 * (1 - stepped(kk, 12, 100)); });
    for (let r = 0; r < 4; r++) noise({ d: .04, f: 700 + r * 90, q: 2, v: .25, at: r * .07 });
    await g.anims.play(300, kk => { lid.position.x = x + Math.sin(kk * 40) * .04; });
    lid.position.x = x;
    await spring_(g);
  } });
  k.parts.push({ tabs: [{ tab: t, x, alive: () => state === 'up' }], update: (dt, g) => {
    if (state === 'shut' && Math.abs(g.hero.body.x - x) < 1.5) void spring_(g);
    setLen(manual >= 0 ? manual : lenS.step(state === 'shut' ? 0 : 1.4, dt));
    coil.rotation.z = reducedMotion ? 0 : sway.step(0, dt) * .12;
  } });
}
// 5. The till (slot): his things hop over the scanner one beep at a time while the receipt chatters out of the slot;
// ka-ching, the bag is sealed and slides down the chute into the courier's box, and the courier rides it to the trains.
function till(k: Kit, bag: Bag) {
  const x = BLIBLI.till, z = -1.3, top = 1.05, cx = BLIBLI.courier;
  k.group.add(box(2.3, top, .8, '#d7dbe0', x, 0, z), box(2.32, .05, .82, '#b7bec7', x, top - .05, z));
  k.group.add(box(.6, .4, .5, INK, x - .45, top, z), box(.3, .03, .1, '#000', x - .45, top + .4, z));
  const drawer = box(.52, .12, .4, '#9aa0a8', x - .45, top - .14, z + .1); k.group.add(drawer);
  k.group.add(box(.05, .55, .05, '#5c6168', x + .15, top, z), box(.05, .55, .05, '#5c6168', x + .55, top, z), box(.45, .05, .1, '#5c6168', x + .35, top + .55, z));
  const beam = box(.36, .015, .3, '#ff5b5b', x + .35, top + .01, z); (beam.material as THREE.MeshStandardMaterial).emissive.set('#ff2020'); beam.visible = false; k.group.add(beam);
  k.group.add(box(.6, .35, .5, '#c3c9d0', x, 0, z - .75));
  const clerk = person({ shirt: BLUE, face: 'smile' }); clerk.position.set(x - .1, .35, z - .75); k.group.add(clerk);
  const receipt = card(.2, 1, (g, W, H) => { g.fillStyle = CREAM; g.fillRect(0, 0, W, H); g.fillStyle = '#c9ccd1'; for (let j = 0; j < 14; j++) g.fillRect(W * .15, H * (.04 + j * .07), W * (j % 3 ? .7 : .45), H * .018); }, { rim: .01, res: 120 });
  const rpiv = new THREE.Group(); rpiv.position.set(x - .45, top + .41, z); rpiv.add(receipt); rpiv.scale.y = .001; k.group.add(rpiv);
  // The chute, from the hatch at the counter's end down into the courier's box.
  const hatch = box(.4, .2, .5, '#9aa0a8', x + 1.05, top, z); k.group.add(hatch);
  const chute = box(1.1, .05, .4, '#b7bec7', 0, 0, 0); chute.position.set(x + 1.65, top + .02, z + .3); chute.rotation.z = -.22; k.group.add(chute);
  // The courier and the scooter.
  const scooter = new THREE.Group(); scooter.position.set(cx, 0, z + .3); k.group.add(scooter);
  const wheel = (wx: number) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .1, 16), mat(INK)); w.rotation.x = Math.PI / 2; w.position.set(wx, .17, 0); return w; };
  scooter.add(box(1.0, .22, .3, '#5c6168', 0, .18, 0), wheel(-.38), wheel(.38), box(.06, .6, .06, '#5c6168', .42, .35, 0), box(.25, .05, .05, '#5c6168', .42, .95, 0));
  const crate = box(.5, .45, .5, BLUE, -.3, .4, 0); scooter.add(crate);
  const rider = person({ shirt: SUN, h: 1.05 }); rider.position.set(.05, .3, .05); scooter.add(rider);
  const parcel = new THREE.Group(); parcel.add(box(.32, .38, .18, BLUE), box(.06, .2, .01, CREAM, .07, .2, .095)); parcel.visible = false; k.group.add(parcel);
  let busy = false, away = 0, told = false, wheelie = 0;
  k.mechs.push({ id: 'till', x, at: V(x, 2.5), label: () => (bag.count ? `Pay (${bag.count})` : 'Pay'), on: () => !busy && away <= 0, use: async (g: Game) => {
    busy = true;
    const things = bag.take();
    const SCALE = [523, 587, 659, 784, 880, 988, 1046, 1175];
    let notch = 0;
    const chatter = () => { notch++; const want = Math.min(1, .12 + notch * .11); const a = rpiv.scale.y; void g.anims.play(80, kk => { rpiv.scale.y = a + (want - a) * stepped(kk, 12, 80); }); noise({ d: .05, f: 3000, q: 1.5, v: .12 }); };
    if (!things.length) { tone({ f: 330, d: .12, type: 'square', v: .1 }); beam.visible = true; chatter(); await g.anims.wait(250); }
    for (let j = 0; j < things.length; j++) {
      const { m, p } = things[j]; k.group.add(m); m.position.copy(p);
      const a = p.clone(), sc = new THREE.Vector3(x + .35, top + .15, z);
      beam.visible = true;
      await g.anims.play(170, kk => { m.position.lerpVectors(a, sc, kk); m.position.y += Math.sin(kk * Math.PI) * .6; });
      tone({ f: SCALE[j % SCALE.length] * 2, d: .07, type: 'square', v: .1 }); chatter(); clerk.rotation.z = .1;
      void g.anims.play(160, kk => { m.position.set(sc.x + kk * .55, sc.y + Math.sin(kk * Math.PI) * .2, z); m.scale.multiplyScalar(.9); }).then(() => k.group.remove(m));
      clerk.rotation.z = 0;
    }
    // He is wearing something with its tag still on: the clerk beeps that too.
    if (g.hero.swingers.length) { await g.anims.wait(120); tone({ f: 1760, d: .07, type: 'square', v: .1 }); chatter(); g.pins.show('beep', '<span>beep</span>', V(g.hero.body.x, 1.9, 0), 'tag', 700); }
    beam.visible = false;
    // Ka-ching.
    await g.anims.wait(160);
    tone({ f: 1568, d: .12, type: 'triangle', v: .25 }); tone({ f: 2093, d: .35, type: 'triangle', v: .22, at: .08 }); noise({ d: .08, f: 5000, q: 2, v: .2 });
    await g.anims.play(100, kk => { drawer.position.z = z + .1 + stepped(kk, 12, 100) * .35; });
    g.fx.burst(x - .45, top + 1.3, z, [CREAM], 6, .4);
    sfx.stamp(); clerk.position.y = .5;
    if (!told) { told = true; k.tell(g, 'till', 'Do I still get the staff discount?', V(x, 2.95)); }
    await g.anims.wait(220); clerk.position.y = .35;
    void g.anims.play(400, kk => { rpiv.scale.y = Math.max(.001, (1 - kk) * rpiv.scale.y); });
    // Sealed, down the chute, into the courier's box.
    parcel.visible = true; parcel.position.set(x + 1.05, top + .2, z + .3); parcel.rotation.set(0, 0, 0);
    await g.anims.play(420, kk => { const e = kk * kk; parcel.position.set(x + 1.1 + e * (cx - .3 - x - 1.1), top + .2 - e * (top + .2 - .86), z + .3); parcel.rotation.z = -e * Math.PI * 2; });
    parcel.visible = false; crate.scale.set(1.12, .88, 1.12); setTimeout(() => crate.scale.set(1, 1, 1), 120);
    sfx.land(.5); g.fx.puff(cx - .3, .9, z + .3, 5); g.stage.shake(.08);
    await g.anims.play(100, kk => { drawer.position.z = z + .1 + (1 - kk) * .35; });
    // Beep beep; a wheelie; off to the trains.
    sfx.beep(); await g.anims.wait(250); sfx.beep();
    wheelie = 1; away = 9; busy = false;
  } });
  k.parts.push({ update: (dt, g) => {
    if (away > 0) {
      away -= dt;
      const t = 9 - away;
      if (t < 2.2) { scooter.position.x = cx + t * t * 3; if (Math.random() < dt * 30) g.fx.puff(scooter.position.x - .6, .1, z + .3, 1, .5); }
      else if (away > 2) scooter.position.x = BLIBLI.width + 6;
      else { scooter.position.x = cx + away * 3; if (away <= 0) { scooter.position.x = cx; noise({ d: .1, f: 300, q: 1, v: .15 }); } }
      wheelie = Math.max(0, wheelie - dt * .9);
    }
    scooter.rotation.z = reducedMotion ? 0 : Math.sin(Math.min(1, wheelie) * Math.PI) * .3 * (wheelie > 0 ? 1 : 0);
  } });
}
function strollers(k: Kit) {
  const walkers = [{ a: 6, b: 16, v: .8, j: 0 }, { a: 19.5, b: 28.5, v: -.9, j: 3 }].map(w => {
    const c = person(CROWD[w.j]); const bg = box(.3, .32, .14, BLUE, .25, .25, .06); c.add(bg);
    c.position.set((w.a + w.b) / 2, 0, -2.45); k.group.add(c); return { ...w, c };
  });
  k.parts.push({ update: (dt, g) => {
    for (const w of walkers) {
      w.c.position.x += w.v * dt; if (w.c.position.x > w.b || w.c.position.x < w.a) w.v *= -1;
      w.c.scale.x = w.v > 0 ? 1 : -1; w.c.position.y = Math.abs(Math.sin(g.time * 7 + w.j)) * .05;
    }
  } });
}
// ★ The sale bell. Jump and tug its tassel: a wave of SALE flags drops over the floor right to left, a stampede of
// shoppers pours in from the trains and back out with full bags, and coupons flutter down. The shop stays on sale.
function flashSale(k: Kit, bell: THREE.Group, shelves: ReturnType<typeof shelf>[]) {
  const B = BLIBLI;
  const cup = new THREE.Mesh(new THREE.ConeGeometry(.24, .32, 16, 1, true), new THREE.MeshStandardMaterial({ color: SUN, side: THREE.DoubleSide, metalness: .3, roughness: .5 }));
  cup.position.y = -.16; cup.castShadow = true;
  bell.add(cup, box(.03, .3, .03, '#8a919b', 0, 0, 0), box(.015, .3, .015, '#d9cdb6', 0, -.62, 0), box(.08, .14, .08, SUN, 0, -.48, 0)); k.group.add(bell);
  const xs = [B.lamp, B.cans, B.fitting, B.box, B.till];
  const flags = xs.map(fx => {
    const p = new THREE.Group(); p.position.set(fx, 3.45, -2.95); k.group.add(p);
    const f = card(1.3, .5, (g, W, H) => { rrect(g, 0, 0, W, H, 6, SUN); label(g, 'SALE', W / 2, H / 2, H * .55, INK, 'center', 700); }); f.position.y = -.5; p.add(f);
    p.rotation.x = -Math.PI / 2; return p;
  });
  const crowd = Array.from({ length: 22 }, (_, j) => { const c = person(CROWD[j % CROWD.length]); const bg = box(.3, .32, .14, BLUE, .1, 1.3, .06); bg.visible = false; c.add(bg); c.visible = false; c.position.set(-3, 0, -.5 - (j % 3) * .5); k.group.add(c); return { c, bg, d: j * .07 }; });
  let rush = -1, swing = 0, sw = 0, rung = false;
  k.parts.push({ update: (dt, g) => {
    const h = g.hero.body;
    if (!h.ground && Math.abs(h.x - B.bell) < 3 && Math.random() < dt * 4) sw += rand(-.4, .4);
    if (rush < 0 && h.vy > 0 && Math.abs(h.x - B.bell) < .65 && h.y + 1.45 > 2.15) {
      rush = 0; sw = 6;
      tone({ f: 1320, d: .7, type: 'sine', v: .3 }); tone({ f: 1760, d: .6, type: 'sine', v: .2, at: .05 }); tone({ f: 1320, d: .5, type: 'sine', v: .2, at: .35 });
      if (!rung) { rung = true; k.tell(g, 'bell', 'Flash sale! Who rang that? Oh. Me.', V(B.bell - 1, 3.5, -.4), true); }
      // The wave of flags, right to left.
      flags.forEach((p, j) => { const at = (B.bell - xs[j]) / 14; void g.anims.wait(at * 1000).then(() => g.anims.play(180, kk => { p.rotation.x = -Math.PI / 2 * (1 - stepped(kk, 12, 180)); })).then(() => { sfx.pop(); g.fx.burst(xs[j], 2.8, -2.6, [SUN, CREAM], 10, .7); if (j === 0) { shop.sale = true; shop.redraws.forEach(f => f()); } }); });
    }
    sw += (-swing * 40 - sw * 3) * dt; swing += sw * dt; bell.rotation.z = reducedMotion ? 0 : swing * .4;
    if (rush >= 0) {
      const was = rush; rush += dt;
      for (const p of crowd) {
        const tt = rush - p.d;
        if (tt < 0 || tt > 5.2) { p.c.visible = false; continue; }
        p.c.visible = true;
        const going = tt < 2.6, k2 = going ? tt / 2.6 : (tt - 2.6) / 2.6;
        p.c.position.x = going ? B.width - k2 * (B.width + 3) : -3 + k2 * (B.width + 3);
        p.c.scale.x = going ? -1 : 1; p.bg.visible = !going;
        p.c.position.y = Math.abs(Math.sin(tt * 16)) * .1;
      }
      // The front of the crowd folds each shelf as it passes; he is bowled into a hop.
      const front = B.width - (rush / 2.6) * (B.width + 3);
      if (rush < 5.6) shelves.forEach(s => { if (was > 0 && front < s.x) s.fold(); });
      if (Math.abs(front - h.x) < .5 && h.ground) { g.hero.hop(5); g.stage.shake(.2); sfx.bonk(.3); }
      if (rush > 4.8 && rush < 8) { if (Math.random() < dt * 14) g.fx.burst(h.x + rand(-7, 7), 4.2, rand(-1.5, .5), [SUN, CREAM, '#ffd27a'], 2, .25); }
      if (was < 5.6 && rush >= 5.6) shelves.forEach(s => s.restock(g));
      if (rush > 8.2) { rush = -1; crowd.forEach(p => (p.c.visible = false)); }
    }
  } });
}
