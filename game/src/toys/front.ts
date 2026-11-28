// The shopfront's toys (docs/BLIBLI_DESIGN.md): review wall, photo string, instant camera, review card; and what
// works on presence: the door, the pigeons, his own card joining the wall.
import { FRONT as F } from '../art/scenes/blibli/plan.ts';
import { REST, type Pose } from './rig.ts';
import { hangers, runner, view, type Ctx, type Toybox } from './box.ts';

const C = F.camera, S = F.string, B = F.board, SUN = '#f6b73c';
// The print hanging out of the camera's slot on its side, and on his peg on the string (offsets from the slot).
const OUT: Pose = { ...REST, y: -6, rz: 90, show: true }, PEG: Pose = { ...REST, x: S.prints[0][0] - C.x, y: S.prints[0][1] + 28 - C.y, z: S.z + 2 - (C.z + 19), show: true }, GONE: Pose = { ...REST, y: 26, show: false };
const FOLDED: Pose = { ...REST, rx: 96, show: false };
type Wall = { f: number; photo: boolean; stars: number };
// Which cards the wall's filter keeps. His own (0) is on the wall only once it has a star or a print.
const keeps = (w: Wall, i: number) => { const r = i ? F.reviews[i] : { photo: w.photo, stars: w.stars }; return (i > 0 || w.photo || w.stars > 0) && (w.f === 0 || (w.f === 1 ? r.photo : r.stars === 5)); };
const cardXY = (i: number) => [B.cols[i % 3], B.rows[Math.floor(i / 3)]] as const;

export function front(): Toybox {
  const hang = hangers([{ actor: 'bell', x: F.door.x, z: F.wall.z + 50, y: F.door.h + 8, r: 60, sound: 'ding' }]);
  let doorOpen = false, seen = '';
  const flown = [0, 0];
  const mine = (t: Record<string, number>) => `${t.rating ?? 0}|${(t.photo ?? 0) >= 2}`;
  const answer = (c: Ctx, glyphs: string[]) => F.shoppers.forEach((p, i) => c.say(p.x, 126, p.z, glyphs[i % glyphs.length]));
  const run = runner([
    view<Wall>({
      key: 'wall', read: t => ({ f: t.filter ?? 0, photo: (t.photo ?? 0) >= 2, stars: t.rating ?? 0 }),
      rest: (c, w) => { F.reviews.forEach((_, i) => c.rig.set(`card-${i}`, keeps(w, i) ? { ...REST, show: true } : FOLDED)); c.rig.set('tabs', REST); },
      play: (c, tl, from, to) => {
        if (from.f !== to.f) tl.call(() => c.sfx('tap'), 0).to('tabs', { y: 7 }, .08, 0, 'power2.out').to('tabs', { y: 0 }, .2, .08, 'back.out(3)');
        // A wave across the wall: cards that no longer match fold up and away; those that stay (or come back) hop.
        F.reviews.forEach((_, i) => {
          const n = `card-${i}`, t = (i % 3) * .07 + Math.floor(i / 3) * .04, was = keeps(from, i), is = keeps(to, i);
          if (was && !is) tl.call(() => c.sfx('flip'), t).to(n, { rx: 96 }, .2, t, 'power2.in').set(n, { show: false }, t + .2);
          else if (!was && is) tl.set(n, { show: true, rx: 96 }, t).to(n, { rx: 0 }, .26, t, 'back.out(2.4)').call(() => c.sfx('flip'), t);
          else if (is && from.f !== to.f) tl.to(n, { y: 9 }, .09, t, 'power2.out').to(n, { y: 0 }, .16, t + .09, 'power2.in');
        });
        if (from.f !== to.f) tl.call(() => answer(c, to.f === 2 ? ['!', '♪'] : to.f === 1 ? ['?', '!'] : ['…', '♪']), .3);
      }
    }),
    view<number>({
      key: 'gallery', read: t => t.gallery ?? 0,
      rest: (c, g) => { c.rig.set('blind', { ...REST, sy: g ? 1 : .05 }); c.rig.set('cord', REST); },
      // A tug on the cord: it dips and springs back, and the blind runs down (or up) behind it.
      play: (c, tl, _from, g) => { tl.call(() => c.sfx('tap'), 0).to('cord', { y: -18 }, .09, 0, 'power2.out').to('cord', { y: 0 }, .3, .09, 'elastic.out(1.1,.4)').call(() => c.sfx('slide'), .06).to('blind', { sy: g ? 1 : .05 }, .4, .06, g ? 'bounce.out' : 'power2.in'); }
    }),
    view<number>({
      key: 'camera', read: t => t.photo ?? 0,
      rest: (c, n) => { c.rig.set('camera', REST); c.rig.set('print', n === 0 ? GONE : n === 1 ? OUT : PEG); c.rig.set('print-new', n === 3 ? OUT : GONE); },
      play: (c, tl, from, n) => {
        const p = n === 1 ? 'print' : 'print-new';
        if (n === 1 || n === 3) {
          // The shot: flash and shutter at once, the camera kicks, then the print slides out of the slot on its side.
          tl.call(() => { c.fx.flash(); c.sfx('shutter'); c.fx.jolt('spot-phone', 10); }, 0).squash('camera', .78, 0, .3)
            .set(p, { ...GONE, rz: 90, show: true }, .12).call(() => c.sfx('slide'), .14).to(p, { y: -6 }, .34, .14, 'power1.out').to(p, { rz: 96 }, .08, .48, 'sine.inOut').to(p, { rz: 90 }, .1, .56, 'sine.inOut');
        } else {
          // He turns it upright, and it flies to his peg on the string.
          const q = from === 1 ? 'print' : 'print-new';
          tl.call(() => c.sfx('flip'), 0).to(q, { rz: -8 }, .16, 0, 'back.out(2)').to(q, { y: 14 }, .08, 0, 'power2.out').to(q, { rz: 0 }, .1, .16)
            .call(() => c.sfx('whoosh'), .2).arc(q, { x: PEG.x, y: PEG.y, z: PEG.z }, 70, .46, .2)
            .call(() => { c.sfx('tap'); c.fx.dust(S.prints[0][0], F.wall.z + 30, 0, 2); }, .66).to(q, { rz: 9 }, .08, .66, 'sine.out').to(q, { rz: -5 }, .12, undefined, 'sine.inOut').to(q, { rz: 0 }, .12, undefined, 'sine.inOut');
        }
      }
    }),
    view<number>({
      key: 'stars', read: t => t.rating ?? 0,
      rest: c => c.rig.set('stamp', REST),
      // The rubber stamp comes down on his card. The star itself is a sheet that follows the count (art/fold.tsx).
      play: (c, tl, from, n) => {
        // Off its ink pad, down on the card, and back.
        const [px, py, pz] = F.stand.pad, [hx, hy, hz] = F.stand.hit, on = { x: hx - px, y: hy - py, z: hz - pz };
        tl.arc('stamp', on, 30, .11, 0)
          .call(() => { c.sfx(from === 5 ? 'peel' : 'thump'); c.fx.shake(3); c.fx.scraps(F.stand.x - 24 + n * 10, F.stand.top + 24, F.stand.z + 12, [SUN, '#fff4e2'], 5); }, .11)
          .to('stamp', { sy: .7 }, .04, .11).to('stamp', { sy: 1 }, .1, .15, 'back.out(3)').arc('stamp', { x: 0, y: 0, z: 0 }, 26, .2, .2).squash('stamp', .86, .4, .16);
      }
    })
  ]);
  const stir = (c: Ctx, actor: string, y = 9) => c.rig.play(`stir-${actor}`, tl => { tl.to(actor, { y }, .09, 0, 'power2.out').to(actor, { y: 0 }, .2, .09, 'bounce.out'); }, () => c.rig.set(actor, { y: 0 }));
  return {
    sync(c, first) { run(c, first); if (first) seen = mine(c.toys); },
    near(c, stop) {
      if (stop === 'wall') stir(c, 'tabs', 7);
      if (stop === 'gallery') c.rig.play('stir-cord', tl => { tl.to('cord', { rz: 9 }, .12, 0, 'sine.out').to('cord', { rz: -6 }, .18, undefined, 'sine.inOut').to('cord', { rz: 0 }, .18, undefined, 'sine.inOut'); }, () => c.rig.set('cord', { rz: 0 }));
      if (stop === 'camera') stir(c, 'camera', 6);
      if (stop === 'stars') stir(c, 'stamp', 10);
    },
    frame(c) {
      hang.frame(c);
      const h = c.hero, d = F.door, now = performance.now();
      // The door opens as he comes and shuts behind him; the bell over it swings.
      const at = Math.abs(h.x - d.x) < 110 && h.z < 60;
      if (at !== doorOpen) {
        doorOpen = at;
        c.rig.play('door', tl => { tl.call(() => c.sfx(at ? 'ding' : 'tap'), at ? .08 : .2).to('door-l', { ry: at ? 78 : 0 }, .3, 0, at ? 'back.out(1.6)' : 'power2.in').to('door-r', { ry: at ? -78 : 0 }, .3, .03, at ? 'back.out(1.6)' : 'power2.in'); }, () => { c.rig.set('door-l', { ry: at ? 78 : 0 }); c.rig.set('door-r', { ry: at ? -78 : 0 }); });
        if (at) hang.swing(c, 'bell', 1, 22);
      }
      // His card joins the wall when he is there to see it: it drops onto its pin and the shoppers answer.
      const sig = mine(c.toys);
      if (sig !== seen && Math.abs(h.x - (B.x + B.w / 2)) < 330) {
        seen = sig;
        const [x, y] = cardXY(0), on = keeps({ f: c.toys.filter ?? 0, photo: (c.toys.photo ?? 0) >= 2, stars: c.toys.rating ?? 0 }, 0);
        if (on) c.rig.play('mine', tl => { tl.set('card-0', { ...REST, show: true, y: 60, rz: -14 }, 0).to('card-0', { y: 0 }, .26, .12, 'power2.in').to('card-0', { rz: 5 }, .1, .38).to('card-0', { rz: 0 }, .16, undefined, 'back.out(3)').call(() => { c.sfx('thump'); c.fx.scraps(x, y, F.wall.z + 12, [SUN, '#0092da', '#fff4e2'], 8); answer(c, ['!', '♪']); }, .38); }, () => c.rig.set('card-0', { ...REST, show: true }));
      }
      // Pigeons take off when he runs or jumps at them, and come back when he has gone.
      F.pigeons.forEach((p, i) => {
        const n = `pigeon-${'ab'[i]}`, near = Math.hypot(h.x - p.x, h.z - p.z) < 84;
        if (!flown[i] && near && (h.speed > .45 || h.y > 0)) {
          flown[i] = now; const dir = h.x < p.x ? 1 : -1;
          c.sfx('flutter', i * .08);
          c.rig.play(n, tl => { tl.to(n, { rz: -dir * 18 }, .1, i * .08).arc(n, { x: dir * 300, y: 240, z: -60 }, 20, .7, i * .08).set(n, { show: false }); }, () => c.rig.set(n, { ...REST, x: dir * 300, y: 240, z: -60, show: false }));
        } else if (flown[i] && now - flown[i] > 3200 && Math.hypot(h.x - p.x, h.z - p.z) > 200) {
          flown[i] = 0;
          c.rig.play(n, tl => { tl.set(n, { show: true, rz: 0 }, 0).arc(n, { x: 0, y: 0, z: 0 }, 10, .7, 0).call(() => c.sfx('tap'), .7).squash(n, .7, .7); }, () => c.rig.set(n, { ...REST, show: true }));
        }
      });
    }
  };
}
