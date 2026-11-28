import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { Settle, stepped } from '../game/mech.ts';
import { sfx } from '../game/sfx.ts';
import { buzz, tone } from '../core/audio.ts';
import { person, CROWD } from '../game/people.ts';
import { station, type Kit } from './station.ts';
import type { Game } from '../game/game.ts';

// Blibli.com: the store built around one product. A department-store floor with one paper desk lamp on a pedestal
// (the product page), the store front being renovated, and the customers' review wall at the far end. Every
// mechanism acts out one true thing about the work; none of them is a screen.
const BLUE = '#0092da', V = (x: number, y: number, z = -1) => new THREE.Vector3(x, y, z);
const VARIANTS = [{ c: '#e8552d', name: 'Coral', price: '349' }, { c: '#35b58a', name: 'Mint', price: '349' }, { c: '#f6b73c', name: 'Sun', price: '379' }];
export const BLIBLI = { width: 41, pedestal: 4, promo: 7.6, recs: 11.4, checkout: 15.4, panels: 19.6, lever: 23, camera: 26.6, reviews: 30.4, gallery: 34.4, bell: 39.4 };

function lampModel(color: string) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color, roughness: .8 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, .08, 20), m); base.position.y = .04;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(.05, .55, .05), m); arm.position.set(.05, .33, 0); arm.rotation.z = -.25;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.2, .26, 20, 1, true), new THREE.MeshStandardMaterial({ color, roughness: .8, side: THREE.DoubleSide })); shade.position.set(.2, .62, 0); shade.rotation.z = .9;
  [base, arm, shade].forEach(o => { o.castShadow = true; g.add(o); });
  return Object.assign(g, { setColor: (c: string) => { m.color.set(c); (shade.material as THREE.MeshStandardMaterial).color.set(c); } });
}

export function blibli(i: number) {
  const B = BLIBLI;
  const bell = new THREE.Group(); bell.position.set(B.bell, 2.6, -.4);
  (window as unknown as { __bell: number }).__bell = B.bell;
  return station(i, B.width, { floor: '#e8e1d3', wall: '#f4f1ea', sky: '#d8ecf6' }, k => {
    sign(k, 2, 'Smartphones & Gadgets');
    pedestal(k); promo(k); recs(k); checkout(k); renovation(k); camera(k); reviews(k); gallery(k); flashSale(k, bell);
  }, { x: B.bell, y: 2.6, obj: bell });
}
function sign(k: Kit, x: number, text: string) {
  const c = card(3.2, .5, (g, W, H) => { rrect(g, 0, 0, W, H, 8, BLUE); label(g, text, W / 2, H / 2, H * .45, '#fffaf0', 'center', 600); }, { rim: .02 });
  c.position.set(x + 2.5, 3.2, -3); k.group.add(c);
}

// 1. The pedestal: a wheel turns the product through its variants; the first turn brings the other counters' clerks
// leaning in with their bits. The product page is where many teams' features meet.
function pedestal(k: Kit) {
  const x = BLIBLI.pedestal, z = -1.3;
  k.group.add(box(1.1, .95, .8, '#fffaf0', x, 0, z));
  const lamp = lampModel(VARIANTS[0].c); lamp.position.set(x - .05, .95, z); k.group.add(lamp);
  const wheel = new THREE.Group(); wheel.position.set(x, .48, z + .42); k.group.add(wheel);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .05, 24), new THREE.MeshStandardMaterial({ color: '#d7dbe0' })); disc.rotation.x = Math.PI / 2; wheel.add(disc);
  VARIANTS.forEach((v, n) => { const d = new THREE.Mesh(new THREE.CircleGeometry(.07, 12), new THREE.MeshStandardMaterial({ color: v.c })); d.position.set(Math.sin(n * 2.094) * .19, Math.cos(n * 2.094) * .19, .03); wheel.add(d); });
  const t = k.tab('turn'); t.position.set(.3, .1, .04); wheel.add(t);
  let n = 0;
  const tag = card(.6, .4, (g, W, H) => { rrect(g, 0, 0, W, H, 6, '#fffaf0'); label(g, VARIANTS[n].name, W / 2, H * .32, H * .26, '#62676f'); label(g, `Rp ${VARIANTS[n].price}k`, W / 2, H * .7, H * .3, '#23262b', 'center', 700); });
  tag.position.set(x + .62, .95, z + .3); tag.rotation.z = -.08; k.group.add(tag);
  const clerks = ['Promotions', 'Reviews', 'Shipping'].map((name, j) => {
    const c = person({ ...CROWD[j + 4], arm: false }); c.position.set(x - 1.6 + j * 1.6, -1.3, -2.5); k.group.add(c);
    return { c, name, up: 0 };
  });
  const settle = new Settle(); let clerksUp = false;
  k.mechs.push({ id: 'pedestal', x, at: V(x, 2.2), label: 'Turn the wheel', use: async (g: Game) => {
    n = (n + 1) % 3; sfx.fold(); t.kick();
    const from = wheel.rotation.z;
    await g.anims.play(220, kk => { wheel.rotation.z = from - stepped(kk, 12, 220) * 2.094; lamp.scale.y = 1 - Math.sin(stepped(kk, 12, 220) * Math.PI) * .6; });
    lamp.setColor(VARIANTS[n].c); tag.redraw(); settle.kick(); sfx.pop();
    g.fx.burst(x, 1.6, z + .4, [VARIANTS[n].c, '#fffaf0'], 10, .7);
    if (!clerksUp) {
      clerksUp = true;
      clerks.forEach((cl, j) => setTimeout(() => { cl.up = 1; sfx.pop(); g.pins.show(`clerk${j}`, `<span>${cl.name}</span>`, V(cl.c.position.x, 2.05, -2.4), 'tag', 2600); }, 250 + j * 220));
      k.tell(g, 'pedestal', 'Many teams’ features on one page. I built them.', V(x, 2.7));
    }
  } });
  k.parts.push({ tabs: [{ tab: t, x }], update: dt => {
    const s = settle.step(dt); lamp.scale.set(1 + s * .08, Math.max(.3, lamp.scale.y + (1 - lamp.scale.y) * Math.min(1, dt * 12)) + s * .1, 1 + s * .08);
    clerks.forEach(cl => { cl.c.position.y += ((cl.up ? 0 : -1.3) - cl.c.position.y) * Math.min(1, dt * 9); });
  } });
}
// 2. The price sign: pull the tab and a sale banner drops; the price is struck through. Promotions.
function promo(k: Kit) {
  const x = BLIBLI.promo, z = -1.6;
  k.group.add(box(.06, 1.9, .06, '#8a919b', x, 0, z));
  let sale = false;
  const price = card(1.2, .7, (g, W, H) => {
    rrect(g, 0, 0, W, H, 8, '#fffaf0'); label(g, 'Rp 349k', W / 2, H * (sale ? .35 : .5), H * (sale ? .26 : .38), sale ? '#9aa0a8' : '#23262b', 'center', 700);
    if (sale) { g.strokeStyle = '#e8552d'; g.lineWidth = 6; g.beginPath(); g.moveTo(W * .2, H * .38); g.lineTo(W * .8, H * .32); g.stroke(); label(g, 'Rp 279k', W / 2, H * .72, H * .34, '#e8552d', 'center', 700); }
  });
  price.position.set(x, 1.25, z + .06); k.group.add(price);
  const banner = new THREE.Group(); banner.position.set(x, 2.55, z + .1); k.group.add(banner);
  const flag = card(1.3, .5, (g, W, H) => { rrect(g, 0, 0, W, H, 6, '#e8552d'); label(g, 'SALE  −20%', W / 2, H / 2, H * .5, '#fffaf0', 'center', 700); }); flag.position.y = -.5; banner.add(flag);
  banner.rotation.x = -Math.PI / 2;
  const t = k.tab('down'); t.position.set(x + .66, 1.05, z + .1); k.group.add(t);
  const settle = new Settle();
  k.mechs.push({ id: 'promo', x, at: V(x, 2.2), label: () => (sale ? 'Push the tab back' : 'Pull the tab'), use: async (g: Game) => {
    sale = !sale; t.kick(); sfx.paper();
    const a = banner.rotation.x, b = sale ? 0 : -Math.PI / 2;
    await g.anims.play(200, kk => { banner.rotation.x = a + (b - a) * stepped(kk, 12, 200); });
    price.redraw(); settle.kick(); if (sale) { sfx.pop(); g.fx.burst(x, 2.1, z + .3, ['#e8552d', '#f6b73c', '#fffaf0'], 16); k.tell(g, 'promo', 'Promotions were one of those features.', V(x, 2.8)); }
  } });
  k.parts.push({ tabs: [{ tab: t, x }], update: dt => { banner.rotation.z = settle.step(dt) * .08; } });
}
// 3. "You may also like": its items stay folded flat until he comes near, then pop up one by one. Lazy loading.
function recs(k: Kit) {
  const x = BLIBLI.recs, z = -2;
  k.group.add(box(3, .9, .55, '#d7dbe0', x, 0, z));
  const head = card(2.4, .38, (g, W, H) => { rrect(g, 0, 0, W, H, 6, '#23262b'); label(g, 'You may also like', W / 2, H / 2, H * .5, '#fffaf0'); }, { rim: .02 }); head.position.set(x, 2.15, z); k.group.add(head);
  const items = [0, 1, 2, 3].map(j => {
    const ix = x - 1.05 + j * .7, colors = ['#35b58a', '#f6b73c', '#7b4b8f', '#e8552d'];
    const m = j % 2 ? box(.4, .55, .35, colors[j], ix, .9, z) : lampModel(colors[j]);
    if (j % 2 === 0) m.position.set(ix, .9, z);
    m.scale.y = .05; k.group.add(m);
    return { m, ix, up: false, settle: new Settle(), t: 0 };
  });
  let told = false;
  k.parts.push({ update: (dt, g) => {
    for (const it of items) {
      if (!it.up && Math.abs(g.hero.body.x - it.ix) < 2.3) { it.up = true; it.settle.kick(1.2); sfx.pop(); tone({ f: 700 + items.indexOf(it) * 110, d: .08, type: 'sine', v: .15 }); }
      if (it.up) it.t = Math.min(1, it.t + dt / .22);
      it.m.scale.y = Math.max(.05, stepped(it.t, 12, 220)) + it.settle.step(dt) * .12;
    }
    if (!told && items.every(i => i.t >= 1)) { told = true; k.tell(g, 'recs', 'Recommendations load only as they come into view.', V(x, 2.7)); }
  } });
}
// 4. Checkout: the old way to the basket winds through three turns; pull the tab and the chute refolds into one
// straight run, and the product drops in. The revamp's simpler add to cart.
function checkout(k: Kit) {
  const x = BLIBLI.checkout, z = -1.4;
  const basket = box(.9, .45, .7, BLUE, x + 1.3, 0, z); k.group.add(basket);
  const segs = [0, 1, 2].map(() => { const s = box(1, .08, .5, '#b7bec7', 0, 0, 0); const p = new THREE.Group(); p.add(s); s.position.set(0, 0, 0); k.group.add(p); return p; });
  const zig = [{ x: x - .9, y: 2.05, r: -.35 }, { x: x - .1, y: 1.55, r: .35 }, { x: x + .7, y: 1.05, r: -.35 }];
  const straight = [{ x: x - .7, y: 1.9, r: -.6 }, { x: x + .05, y: 1.4, r: -.6 }, { x: x + .8, y: .9, r: -.6 }];
  const put = (k2: number) => segs.forEach((s, j) => { const a = zig[j], b = straight[j]; s.position.set(a.x + (b.x - a.x) * k2, a.y + (b.y - a.y) * k2, z); s.rotation.z = a.r + (b.r - a.r) * k2; });
  put(0);
  const parcel = box(.3, .3, .3, '#e8552d', 0, 0, 0); k.group.add(parcel); parcel.position.set(x - 1.3, 2.25, z);
  const t = k.tab('right'); t.position.set(x - 1.5, 1.2, z + .4); k.group.add(t);
  let simple = false;
  k.mechs.push({ id: 'checkout', x, at: V(x, 2.6), label: () => (simple ? 'Another one' : 'Pull the tab'), use: async (g: Game) => {
    t.kick(); sfx.fold();
    if (!simple) { simple = true; await g.anims.play(240, kk => put(stepped(kk, 12, 240))); }
    // The product slides the straight chute into the basket.
    parcel.position.set(x - 1.2, 2.2, z);
    await g.anims.play(420, kk => { const e = kk * kk; parcel.position.set(x - 1.2 + e * 2.5, 2.2 - e * 1.7, z); parcel.rotation.z = -e * 3; });
    sfx.land(.4); g.fx.puff(x + 1.3, .5, z, 4); g.stage.shake(.06);
    k.tell(g, 'checkout', 'The revamp made add to cart one simple step.', V(x, 2.9));
    await g.anims.wait(300); parcel.position.set(x - 1.2, 2.2, z); parcel.rotation.z = 0;
  } });
  k.parts.push({ tabs: [{ tab: t, x }] });
}
// 5. The store front, under renovation: a tab flips one panel to the new look while shoppers keep coming in; a taped
// lever that says ALL AT ONCE jams the whole front and scatters them. Incremental release beats big bang.
function renovation(k: Kit) {
  const x = BLIBLI.panels, z = -2.7;
  const frame = box(4.6, 3, .2, '#cfd3d8', x + 1.4, 0, z - .15); k.group.add(frame);
  const panels = [0, 1, 2].map(j => {
    const p = new THREE.Group(); p.position.set(x + j * 1.4, 1.5, z);
    const face = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.6, .06), new THREE.MeshStandardMaterial({ color: '#9aa0a8' })); face.castShadow = true; p.add(face); k.group.add(p);
    return { p, face, done: false };
  });
  const shoppers = [0, 1, 2].map(j => { const c = person(CROWD[j]); c.position.set(x - 1.5 + j * 2, 0, -1.9); k.group.add(c); return { c, v: .9 + j * .2, scatter: 0 }; });
  const t = k.tab('turn'); t.position.set(x - .5, 1.1, -1.1); k.group.add(t);
  const lever = new THREE.Group(); lever.position.set(BLIBLI.lever, .9, -1.4); k.group.add(lever);
  k.group.add(box(.5, .9, .4, '#5c6168', BLIBLI.lever, 0, -1.4));
  const stick = box(.07, .7, .07, '#e8552d', 0, 0, 0); lever.add(stick); lever.rotation.z = .5;
  const tape = card(.9, .32, (g, W, H) => { rrect(g, 0, 0, W, H, 3, '#f6b73c'); label(g, 'ALL AT ONCE', W / 2, H / 2, H * .46, '#23262b', 'center', 700); }, { rim: .01 });
  tape.position.set(BLIBLI.lever, 1.05, -1.18); tape.rotation.z = .1; k.group.add(tape);
  let jam = 0, flipping = false;
  k.mechs.push({ id: 'panel', x, at: V(x, 2.4), label: () => (panels.every(p => p.done) ? 'Panels done' : 'Flip a panel'), on: () => !flipping, use: async (g: Game) => {
    const p = panels.find(q => !q.done); t.kick();
    if (!p) { sfx.bonk(.1); return; }
    flipping = true; sfx.fold();
    await g.anims.play(260, kk => { const s = stepped(kk, 12, 260); p.p.rotation.y = s * Math.PI; if (s >= .5 && !p.done) { p.done = true; (p.face.material as THREE.MeshStandardMaterial).color.set(BLUE); } });
    p.p.rotation.y = 0; flipping = false; sfx.pop(); g.fx.burst(p.p.position.x, 2, z + .3, [BLUE, '#fffaf0'], 8, .6);
    if (panels.every(q => q.done)) k.tell(g, 'renovate', 'Panel by panel, and the shop never closed.', V(x + 1.4, 3));
    else g.caption(['One panel shipped. The shop stays open.', 'Another, and the shoppers keep coming.'][panels.filter(q => q.done).length - 1], V(x + 1.4, 3));
  } });
  k.mechs.push({ id: 'lever', x: BLIBLI.lever, at: V(BLIBLI.lever, 2.2), label: 'Pull: ALL AT ONCE', on: () => jam <= 0, use: async (g: Game) => {
    jam = 1.6; sfx.deny(); buzz([40, 30, 60]); g.stage.shake(.45);
    await g.anims.play(160, kk => { lever.rotation.z = .5 - kk; });
    shoppers.forEach(s => (s.scatter = 1));
    k.tell(g, 'renovate', 'All at once? Everything jams. Ship it small.', V(x + 1.4, 3));
  } });
  k.parts.push({ tabs: [{ tab: t, x, alive: () => !panels.every(p => p.done) }], update: (dt, g) => {
    // Shoppers stream in through the open front; jammed, they scatter.
    for (const s of shoppers) {
      if (s.scatter > 0) { s.scatter -= dt; s.c.position.x -= dt * 6; s.c.position.y = Math.abs(Math.sin(s.scatter * 14)) * .3; }
      else { s.c.position.x += s.v * dt; s.c.position.y = Math.abs(Math.sin(g.time * 8 + s.v * 9)) * .06; }
      if (s.c.position.x > x + 3.6) s.c.position.x = x - 1.8;
      if (s.c.position.x < x - 6) s.c.position.x = x - 1.8;
    }
    if (jam > 0) { jam -= dt; panels.forEach((p, j) => { p.p.rotation.y = Math.PI / 2 * .8 + Math.sin(g.time * 40 + j) * .08 * jam; }); if (jam <= 0) { panels.forEach(p => (p.p.rotation.y = 0)); lever.rotation.z = .5; sfx.fold(); } }
  } });
}
// 6. The instant camera: its photo comes out sideways, the way phone uploads once arrived; A turns it upright.
function camera(k: Kit) {
  const x = BLIBLI.camera, z = -1.3;
  k.group.add(box(.5, 1, .5, '#5c6168', x, 0, z), box(.7, .5, .45, '#f4f1ea', x, 1, z));
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .1, 20), new THREE.MeshStandardMaterial({ color: '#23262b' })); lens.rotation.x = Math.PI / 2; lens.position.set(x, 1.25, z + .25); k.group.add(lens);
  const photo = card(.45, .55, (g, W, H) => { rrect(g, 0, 0, W, H, 3, '#fffaf0'); rrect(g, W * .08, W * .08, W * .84, H * .66, 2, '#8fd3f4'); g.fillStyle = '#35b58a'; g.fillRect(W * .08, H * .5, W * .84, H * .2); g.fillStyle = '#e8552d'; g.beginPath(); g.arc(W * .5, H * .38, W * .14, 0, 7); g.fill(); label(g, '★★★★★', W / 2, H * .86, H * .1, '#f6b73c'); });
  photo.visible = false; k.group.add(photo);
  const t = k.tab('right'); t.position.set(x + .42, 1.05, z + .25); k.group.add(t);
  let st = 0;
  k.mechs.push({ id: 'camera', x, at: V(x, 2.3), label: () => (st === 1 ? 'Turn it upright' : 'Take a photo'), use: async (g: Game) => {
    t.kick();
    if (st === 0) {
      st = 1; tone({ f: 1800, d: .05, type: 'square', v: .15 }); sfx.paper(); photo.visible = true;
      await g.anims.play(300, kk => { const s = stepped(kk, 12, 300); photo.position.set(x + .35 + s * .55, 1.0, z + .3); photo.rotation.z = -Math.PI / 2; });
      g.caption('From a phone, the photo came in sideways.', V(x, 2.8));
    } else if (st === 1) {
      st = 2; sfx.fold();
      await g.anims.play(220, kk => { photo.rotation.z = -Math.PI / 2 * (1 - stepped(kk, 12, 220)); });
      sfx.pop(); k.tell(g, 'camera', 'Turned upright. Lesson: test on real devices.', V(x, 2.8));
      await g.anims.wait(1400); photo.visible = false; st = 0;
    }
  } });
  k.parts.push({ tabs: [{ tab: t, x }] });
}
// 7. The review wall: a wheel filters it. Cards without a photo, or with too few stars, fold face-down.
function reviews(k: Kit) {
  const x = BLIBLI.reviews, z = -2.75;
  k.group.add(box(3.8, 2.4, .1, '#d9cdb6', x, .5, z - .08));
  const data = [{ s: 5, p: true }, { s: 3, p: false }, { s: 4, p: true }, { s: 2, p: false }, { s: 5, p: false }, { s: 4, p: true }, { s: 1, p: true }, { s: 4, p: false }];
  const cards = data.map((d, j) => {
    const c = card(.78, .95, (g, W, H) => { rrect(g, 0, 0, W, H, 5, '#fffaf0'); if (d.p) rrect(g, W * .1, H * .08, W * .8, H * .45, 3, '#8fd3f4'); label(g, '★'.repeat(d.s) + '☆'.repeat(5 - d.s), W / 2, H * .68, H * .11, '#f6b73c'); g.fillStyle = '#c9ccd1'; g.fillRect(W * .12, H * .8, W * .76, H * .05); g.fillRect(W * .12, H * .88, W * .5, H * .05); }, { rim: .02 });
    const piv = new THREE.Group(); piv.position.set(x - 1.4 + (j % 4) * .93, j < 4 ? 1.75 : .7, z); c.position.y = -.48; piv.add(c); piv.position.y += .48; k.group.add(piv);
    return { piv, d, down: false };
  });
  const FILTERS = ['All reviews', 'With photos', '4 stars & up'];
  let f = 0;
  const head = card(1.6, .34, (g, W, H) => { rrect(g, 0, 0, W, H, 6, '#23262b'); label(g, FILTERS[f], W / 2, H / 2, H * .5, '#fffaf0'); }, { rim: .02 }); head.position.set(x, 3.05, z); k.group.add(head);
  const wheel = new THREE.Group(); wheel.position.set(x + 2.15, 1.4, z + .15); k.group.add(wheel);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .05, 24), new THREE.MeshStandardMaterial({ color: '#d7dbe0' })); disc.rotation.x = Math.PI / 2; wheel.add(disc);
  const t = k.tab('turn'); t.position.set(.28, .08, .04); wheel.add(t);
  k.mechs.push({ id: 'reviews', x, at: V(x, 3.4), label: () => `Filter: ${FILTERS[(f + 1) % 3]}`, use: async (g: Game) => {
    f = (f + 1) % 3; t.kick(); sfx.fold(); head.redraw();
    const show = (d: { s: number; p: boolean }) => (f === 0 ? true : f === 1 ? d.p : d.s >= 4);
    const from = wheel.rotation.z;
    await g.anims.play(220, kk => {
      wheel.rotation.z = from - stepped(kk, 12, 220) * 2.094;
      for (const c of cards) { const want = !show(c.d); if (want !== c.down) c.piv.rotation.x = (c.down ? Math.PI : 0) + (want ? 1 : -1) * Math.PI * stepped(kk, 12, 220) * .92; }
    });
    for (const c of cards) { c.down = !show(c.d); c.piv.rotation.x = c.down ? Math.PI * .92 : 0; }
    sfx.pop();
    if (f) k.tell(g, 'filter', 'Filter reviews by photo, or by rating.', V(x, 3.7));
  } });
  k.parts.push({ tabs: [{ tab: t, x }] });
}
// 8. The gallery: tall, wide and square photos re-lay from a grid to a list, and every one fits its frame.
function gallery(k: Kit) {
  const x = BLIBLI.gallery, z = -2.75;
  k.group.add(box(3.2, 2.5, .1, '#23262b', x, .45, z - .08));
  const ratios = [1.5, .66, 1, .75, 1.33, 1];
  const ph = ratios.map((r, j) => {
    const c = card(1, 1, (g, W, H) => { g.fillStyle = ['#8fd3f4', '#f6b73c', '#35b58a', '#e8552d', '#b39ddb', '#ffd27a'][j]; g.fillRect(0, 0, W, H); g.fillStyle = '#fffaf066'; g.beginPath(); g.arc(W * .5, H * .45, Math.min(W, H) * .2, 0, 7); g.fill(); }, { rim: .015, res: 80 });
    k.group.add(c); return { c, r };
  });
  // Fit each photo inside a cell, keeping its own shape.
  const fit = (r: number, cw: number, chh: number) => (r > cw / chh ? [cw, cw / r] : [chh * r, chh]);
  const layout = (list: boolean) => ph.map((p, j) => {
    if (!list) { const cx = x - 1 + (j % 3), cy = j < 3 ? 2.1 : 1.05; const [w, h] = fit(p.r, .86, .86); return { x: cx, y: cy - h / 2, w, h }; }
    const cy = 2.45 - j * .36; const [w, h] = fit(p.r, .5, .3); return { x: x - 1.1, y: cy - h / 2, w, h };
  });
  let list = false, cur = layout(false);
  const place = (L: typeof cur) => ph.forEach((p, j) => { p.c.position.set(L[j].x, L[j].y, z + .02); p.c.scale.set(L[j].w, L[j].h, 1); });
  place(cur);
  const lines = [0, 1, 2, 3, 4, 5].map(j => { const l = box(1.6, .05, .02, '#9aa0a8', x + .5, 2.36 - j * .36, z + .02); l.visible = false; k.group.add(l); return l; });
  const t = k.tab('down'); t.position.set(x + 1.75, 1.7, z + .1); k.group.add(t);
  k.mechs.push({ id: 'gallery', x, at: V(x, 3.4), label: () => (list ? 'Grid view' : 'List view'), use: async (g: Game) => {
    list = !list; t.kick(); sfx.paper();
    const a = cur, b = layout(list);
    await g.anims.play(320, kk => { const s = stepped(kk, 12, 320); place(a.map((p, j) => ({ x: p.x + (b[j].x - p.x) * s, y: p.y + (b[j].y - p.y) * s, w: p.w + (b[j].w - p.w) * s, h: p.h + (b[j].h - p.h) * s }))); });
    cur = b; lines.forEach(l => (l.visible = list)); sfx.pop();
    k.tell(g, 'gallery', 'Tall, wide or square: every photo fits.', V(x, 3.7));
  } });
  k.parts.push({ tabs: [{ tab: t, x }] });
}
// ★ The bell over the way out. Jump into it: a flash sale floods the floor with shoppers, the counter spins, and
// nothing falls over. The page had to stay fast under heavy traffic.
function flashSale(k: Kit, bell: THREE.Group) {
  const cup = new THREE.Mesh(new THREE.ConeGeometry(.22, .3, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#f6b73c', side: THREE.DoubleSide, metalness: .3, roughness: .5 }));
  cup.position.y = -.15; cup.castShadow = true; bell.add(cup, box(.03, .25, .03, '#8a919b', 0, 0, 0)); k.group.add(bell);
  const crowd = Array.from({ length: 22 }, (_, j) => { const c = person(CROWD[j % CROWD.length]); c.visible = false; c.position.set(-3, 0, -.6 - (j % 3) * .45); k.group.add(c); return { c, d: j * .12 }; });
  let rush = -1, count = 1200, swing = 0, sw = 0, rung = false;
  const counter = card(1.5, .5, (g, W, H) => { rrect(g, 0, 0, W, H, 6, '#23262b'); label(g, `${Math.floor(count).toLocaleString('en')} visitors`, W / 2, H / 2, H * .38, '#ffd27a'); }, { rim: .02 });
  counter.position.set(BLIBLI.bell - 2, 3.1, -2.9); counter.visible = false; k.group.add(counter);
  k.parts.push({ update: (dt, g) => {
    const h = g.hero.body;
    if (rush < 0 && h.vy > 0 && Math.abs(h.x - BLIBLI.bell) < .65 && h.y + 1.45 > 2.3) {
      rush = 0; sw = 5; tone({ f: 1320, d: .6, type: 'sine', v: .3 }); tone({ f: 1760, d: .5, type: 'sine', v: .2, at: .05 }); counter.visible = true;
      if (!rung) { rung = true; k.tell(g, 'bell', 'Flash sale! The page had to stay fast.', new THREE.Vector3(BLIBLI.bell - 1, 3.4, -1), true); }
    }
    sw += (-swing * 40 - sw * 3) * dt; swing += sw * dt; bell.rotation.z = swing * .4;
    if (rush >= 0) {
      rush += dt; count += dt * 18000; counter.redraw();
      for (const p of crowd) { const tt = rush - p.d; p.c.visible = tt > 0 && tt < 3.2; p.c.position.x = BLIBLI.width - (tt / 3.2) * (BLIBLI.width + 4); p.c.position.y = Math.abs(Math.sin(tt * 16)) * .1; }
      if (rush > 6.2) { rush = -1; crowd.forEach(p => (p.c.visible = false)); counter.visible = false; }
    }
  } });
}
