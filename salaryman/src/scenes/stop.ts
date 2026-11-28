import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { sfx } from '../game/sfx.ts';
import { LINE } from '../game/content.ts';
import type { Mech, Place } from '../game/place.ts';
import type { Game } from '../game/game.ts';

// A station's place, greybox: one lane, one way through. He comes out of the station at the left; the way back to the
// train is at the right end. Its mechanisms are placeholders until the scene's own sheet is built.
export type Spot = { id: string; x: number; label: string; caption: string; star?: boolean; color?: string };
export const STOPS: Record<string, { width: number; spots: Spot[] }> = {
  blibli: { width: 30, spots: [
    { id: 'pedestal', x: 5, label: 'Turn the wheel', caption: 'Many teams’ features, one product page.' },
    { id: 'promo', x: 9, label: 'Pull the tab', caption: 'Promotions: the price, struck through.' },
    { id: 'checkout', x: 13, label: 'Pull the tab', caption: 'Add to cart, now one straight step.' },
    { id: 'renovate', x: 17, label: 'Flip a panel', caption: 'Ship a panel at a time, not all at once.' },
    { id: 'reviews', x: 21, label: 'Turn the wheel', caption: 'Filter reviews by photo or by rating.' }
  ] },
  moperty: { width: 24, spots: [
    { id: 'signpost', x: 5, label: 'Turn the sign', caption: 'Homes for sale or rent, near my hometown.' },
    { id: 'plot', x: 11, label: 'Pull the tab', caption: 'I designed it, built the front and the back.' },
    { id: 'roadsign', x: 17, label: 'Raise the sign', caption: 'People had to find it, so I did SEO.' }
  ] },
  radjastone: { width: 24, spots: [
    { id: 'vellum', x: 5, label: 'Lower the sketch', caption: 'I designed their site, then built it to match.' },
    { id: 'samples', x: 11, label: 'Slot a stone', caption: 'The owner updates the content himself.' },
    { id: 'wall', x: 17, label: 'Walk the wall', caption: 'Animation you feel as you scroll.' }
  ] },
  home: { width: 16, spots: [] }
};
export function stop(i: number): Place {
  const st = LINE[i], def = STOPS[st.id], group = new THREE.Group();
  const x1 = def.width;
  group.add(box(x1 + 8, .4, 4, '#d8d2c4', x1 / 2 - 1, -.4, -.4));
  group.add(box(x1 + 8, .04, .25, st.color, x1 / 2 - 1, 0, 1.5));
  const wall = box(x1 + 30, 5, .3, '#ece6d8', x1 / 2, -.4, -3); wall.castShadow = false; group.add(wall);
  // Station mouths at both ends.
  for (const [x, txt] of [[-1.6, 'Exit'], [x1 + .6, 'To the trains']] as const) {
    group.add(box(1.6, 2.6, 1.2, '#3d444e', x, 0, -1.5));
    const c = card(1.9, .5, (g, W, H) => { rrect(g, 0, 0, W, H, 8, '#1d2026'); label(g, txt, W / 2, H / 2, H * .45, '#ffd27a', 'center', 600); }, { rim: .02 }); c.position.set(x, 2.75, -.85); group.add(c);
  }
  const title = card(5, 1.2, (g, W, H) => { rrect(g, 0, 0, W, H, 14, '#fffaf0'); g.fillStyle = st.color; g.fillRect(0, H - 14, W, 14); label(g, st.name, W / 2, H * .38, H * .36, '#23262b', 'center', 700); label(g, st.role, W / 2, H * .74, H * .15, '#62676f', 'center', 600); });
  title.position.set(3, 3.2, -2.7); group.add(title);
  const mechs: Mech[] = [];
  const pops: { m: THREE.Object3D; t: number }[] = [];
  for (const s of def.spots) {
    const thing = box(1.2, 1.1, .8, '#bfc5cc', s.x, 0, -1.4); group.add(thing);
    const tab = box(.32, .32, .06, '#e8552d', s.x + .5, .8, -.98); group.add(tab);
    let state = 0;
    mechs.push({ id: s.id, x: s.x, at: new THREE.Vector3(s.x, 2, -1), label: s.label, use: (g: Game) => {
      state++; sfx.fold(); pops.push({ m: thing, t: 0 }); (thing.material as THREE.MeshStandardMaterial).color.set(state % 2 ? st.color : '#bfc5cc');
      g.fx.burst(s.x, 1.3, -1, [st.color, '#fffaf0', '#f6b73c'], 12);
      g.caption(s.caption, new THREE.Vector3(s.x, 2.6, -1));
      g.punch(st.id, s.id, s.star);
    } });
  }
  const visit: Mech = { id: 'visit', x: x1 - 3, at: new THREE.Vector3(x1 - 3, 2.2, -1), label: `Visit ${st.name}`, on: () => !!st.url, use: () => { if (st.url) open(st.url, '_blank', 'noopener'); } };
  if (st.url) { group.add(box(1, 1.8, .2, st.color, x1 - 3, 0, -1.6)); mechs.push(visit); }
  const back: Mech = { id: 'back', x: x1 + .3, reach: 1.2, at: new THREE.Vector3(x1 + .5, 2.5, -1), label: 'Back to the train', up: true, on: () => st.id !== 'home', use: g => { g.save.next = (i + 1) % LINE.length; g.emit('reboard', i); } };
  mechs.push(back);
  return {
    id: `stop-${st.id}`, group, lane: { x0: -1.2, x1: x1 + .9, z: 0 }, solids: [], mechs,
    enter(g: Game) {
      g.hero.place(-1.2, 0, 1); g.hero.body.vx = 3; g.stage.scene.background = new THREE.Color('#cfe6f2');
      if (!g.save.visited.includes(st.id)) g.save.visited.push(st.id);
      setTimeout(() => g.caption(`${st.name}: ${st.line}`, new THREE.Vector3(1.5, 2.8, 0), 3600), 450);
    },
    camera(g: Game) { const lead = g.hero.facing * 2.2; g.stage.want = { x: Math.max(4, Math.min(x1 - 4, g.hero.body.x + lead)), y: 1.9, z: 0, dist: 17, pitch: .12, yaw: 0 }; },
    update(dt: number) { for (const p of pops) { p.t += dt; const k = Math.min(1, p.t / .45); p.m.scale.y = 1 + Math.sin(k * Math.PI) * .25 * (1 - k); } }
  };
}
