import * as THREE from 'three';
import { box, card, label, rrect } from '../game/paper.ts';
import { LINE, ROWS } from '../game/content.ts';
import { tab, type Tab } from '../game/mech.ts';
import type { Mech, Place } from '../game/place.ts';
import type { Game } from '../game/game.ts';

// What every station's place shares: one lane, one way through. He comes out of the station at the left; its title
// says the role and one line; the way back to the train is at the right end, with the "visit the site" stand before
// it. Each mechanism is a part: it adds its paper to the group, its mechanism to the list, and runs its own rules.
export type Part = { tabs?: { tab: Tab; x: number; alive?: () => boolean }[]; update?: (dt: number, g: Game) => void; enter?: (g: Game) => void; exit?: (g: Game) => void };
export type Kit = {
  group: THREE.Group; mechs: Mech[]; parts: Part[]; color: string; id: string;
  // Tell a fact: caption by the thing, and punch its hole the first time.
  tell: (g: Game, id: string, text: string, at: THREE.Vector3, star?: boolean) => void;
  tab: typeof tab;
};
export type StationLook = { floor: string; wall: string; sky: string; trim?: string };
export function station(i: number, width: number, look: StationLook, build: (k: Kit) => void, secret?: { x: number; y: number; obj: THREE.Object3D }): Place {
  const st = LINE[i], group = new THREE.Group(), x1 = width;
  group.add(box(x1 + 10, .4, 4.2, look.floor, x1 / 2 - 1, -.4, -.5));
  group.add(box(x1 + 10, .05, .2, look.trim ?? st.color, x1 / 2 - 1, -.02, 1.55));
  const wall = box(x1 + 34, 6, .3, look.wall, x1 / 2, -.4, -3.2); wall.castShadow = false; group.add(wall);
  for (const [x, txt] of [[-2, 'Station'], [x1 + .8, 'To the trains']] as const) {
    group.add(box(1.8, 2.7, 1.4, '#3d444e', x, 0, -1.9));
    const c = card(1.9, .48, (g, W, H) => { rrect(g, 0, 0, W, H, 8, '#1d2026'); label(g, txt, W / 2, H / 2, H * .44, '#ffd27a', 'center', 600); }, { rim: .02 }); c.position.set(x, 2.85, -1.15); group.add(c);
  }
  const mechs: Mech[] = [], parts: Part[] = [];
  const kit: Kit = {
    group, mechs, parts, color: st.color, id: st.id, tab,
    // The hole is punched with the snap; his line comes after the settle, over his head.
    tell(g, id, text, _at, star = false) { g.punch(st.id, id, star); const place = g.place; setTimeout(() => { if (g.place === place) g.say(text); }, 400); }
  };
  build(kit);
  if (st.url) {
    const stand = card(1.1, 1.6, (g, W, H) => { rrect(g, 0, 0, W, H, 10, st.color); label(g, 'Visit', W / 2, H * .3, H * .13, '#fffaf0', 'center', 600); label(g, st.name, W / 2, H * .5, H * .12, '#fffaf0', 'center', 700); label(g, '↗', W / 2, H * .75, H * .2, '#fffaf0', 'center', 700); });
    stand.position.set(x1 - 2.6, 0, -1.3); group.add(stand);
    mechs.push({ id: 'visit', x: x1 - 2.6, at: new THREE.Vector3(x1 - 2.6, 2.1, -1), label: `Visit ${st.name} ↗`, use: () => { open(st.url!, '_blank', 'noopener'); } });
  }
  mechs.push({ id: 'back', x: x1 + .5, reach: 1.2, at: new THREE.Vector3(x1 + .7, 2.5, -1), label: 'Back to the train', up: true, use: g => { g.save.next = (i + 1) % LINE.length; g.emit('reboard', i); } });
  // The secret: once every marked hole here is punched, its corner glints now and then.
  const round = ROWS.find(r => r.id === st.id)?.round ?? 0;
  const glint = new THREE.Mesh(new THREE.OctahedronGeometry(.09), new THREE.MeshBasicMaterial({ color: '#fff7c2' }));
  if (secret) { glint.position.set(secret.x, secret.y, secret.obj.position.z + .3); group.add(glint); }
  return {
    id: `stop-${st.id}`, group, lane: { x0: -1.4, x1: x1 + .9, z: 0 }, solids: [], mechs,
    enter(g: Game) {
      g.hero.place(-1.4, 0, 1); g.hero.body.vx = 3; g.stage.scene.background = new THREE.Color(look.sky);
      if (!g.save.visited.includes(st.id)) g.save.visited.push(st.id);
      parts.forEach(p => p.enter?.(g));
      setTimeout(() => g.pins.show('title', `<span><b>${st.name}</b> · ${st.pin ?? st.role}</span>`, new THREE.Vector3(2, 3.3, 0), 'tag', 3800), 500);
    },
    exit(g: Game) { parts.forEach(p => p.exit?.(g)); },
    camera(g: Game) { const hw = g.stage.halfWidth(16.5), lead = g.hero.facing * Math.min(2.2, hw * .4), lo = Math.min(3.5, hw - 2); g.stage.want = { x: Math.max(lo, Math.min(x1 - lo, g.hero.body.x + lead)), y: 1.95, z: 0, dist: 16.5, pitch: .11, yaw: 0 }; },
    update(dt: number, g: Game) {
      for (const p of parts) {
        p.update?.(dt, g);
        for (const t of p.tabs ?? []) t.tab.tick(dt, Math.abs(g.hero.body.x - t.x), t.alive ? t.alive() : true);
      }
      if (secret) {
        const got = g.save.holes.filter(h => h.startsWith(`${st.id}/`) && !h.endsWith('*')).length, found = g.save.holes.some(h => h.startsWith(`${st.id}/`) && h.endsWith('*'));
        const on = got >= round && !found, ph = (g.time % 4) / 4;
        glint.visible = on && ph < .2; glint.scale.setScalar(Math.sin(ph / .2 * Math.PI) * 1.4); glint.rotation.y += dt * 6;
      }
    }
  };
}
