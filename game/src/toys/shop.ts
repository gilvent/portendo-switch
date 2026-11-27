// The shop floor's toys (docs/BLIBLI_DESIGN.md): showcase phone, price tag, catalog, stock and basket, recommended shelf.
import { FLOOR as F } from '../art/scenes/blibli/plan.ts';
import { REST } from './rig.ts';
import { hangers, runner, view, type Ctx, type Toybox } from './box.ts';

const P = F.promo, R = P.reel, CORAL = '#e8552d';
// How long after the press his head reaches the reel: the crouch, then the rise.
export const KNOCK = .2;
// The coupon stuck on the tag, as an offset from where it hangs under the reel.
const STUCK = { x: P.x + 20 - R.x, y: P.top + 44 - R.y, z: P.z + 10 - R.z - 1, rz: -14 };
const LEAVES = ['cat-cover', 'cat-leaf-1', 'cat-leaf-2'], TURNED = [-166, -158, -150];
const slot = (k: number) => { const b = F.stock.boxes[F.stock.order[k]], s = F.basket.slots[k]; return { x: s[0] - b[0], y: s[1] - b[1], z: s[2] - b[2] }; };

export function shop(): Toybox {
  const hang = hangers([{ actor: 'reel', x: R.x, z: R.z, y: R.y - 24, sound: 'tap' }, ...F.lamps.map((l, i) => ({ actor: `lamp-${i}`, x: l.x, z: l.z, y: F.lampY, sound: 'tap' as const }))]);
  // The shelf: which cards have been turned face up since the set last changed. Never saved.
  const dealt = F.recs.xs.map(() => false);
  let dealing = false;
  const deal = (c: Ctx) => {
    const order = F.recs.xs.map((x, i) => ({ i, d: Math.abs(x - c.hero.x) })).filter(k => !dealt[k.i]).sort((a, b) => a.d - b.d);
    if (!order.length) return;
    dealing = true; for (const k of order) dealt[k.i] = true;
    c.rig.play('recs-deal', tl => { order.forEach((k, j) => { const n = `rec-${k.i}`, t = j * .1; tl.call(() => c.sfx('flip'), t).to(n, { ry: 0 }, .26, t, 'back.out(2.2)').to(n, { y: 12 }, .1, t, 'power2.out').to(n, { y: 0 }, .16, t + .1, 'power2.in'); }); },
      () => { dealing = false; dealt.forEach((d, i) => c.rig.set(`rec-${i}`, { ...REST, ry: d ? 0 : 180 })); });
  };
  const run = runner([
    view<number>({
      key: 'showcase', read: t => t.variant ?? 0,
      rest: (c, v) => { c.rig.set('phone', REST); F.showcase.chips.forEach((_, i) => c.rig.set(`chip-${i}`, { ...REST, y: i === v ? 14 : 0, s: i === v ? 1.3 : 1 })); },
      // The colour has already changed, so the turn starts edge-on: the first half of the card flip took no time.
      play: (c, tl, from, to) => {
        tl.call(() => c.sfx('flip'), 0).set('phone', { ry: -92 }, 0).to('phone', { ry: 0 }, .3, 0, 'back.out(2.4)').to('phone', { y: 20 }, .11, 0, 'power2.out').to('phone', { y: 0 }, .17, .11, 'power2.in').squash('phone', .9, .28);
        tl.to(`chip-${from}`, { y: 0, s: 1 }, .16, 0, 'power2.in').to(`chip-${to}`, { y: 14, s: 1.3 }, .26, .06, 'back.out(3)').call(() => c.sfx('pop'), .08);
        // Every boxed phone in the shop has turned the same colour: they answer one after another.
        [0, 1, 2].forEach(i => tl.squash(`box-${i}`, .84, .16 + i * .07, .24));
      }
    }),
    view<number>({
      key: 'promo', read: t => t.promo ?? 0,
      rest: (c, p) => { c.rig.set('coupon', p ? { ...REST, ...STUCK } : REST); c.rig.set('burst', { ...REST, s: p ? 1 : .01, show: !!p }); c.rig.set('tag', REST); },
      play: (c, tl, _from, to) => {
        // His head reaches the reel KNOCK after the press: nothing on the tag moves before that.
        tl.call(() => { hang.swing(c, 'reel', -1, 18); c.sfx('thump'); }, KNOCK);
        if (to) {
          tl.to('coupon', { rz: 38 }, .14, KNOCK, 'sine.inOut').to('coupon', { rz: -30 }, .16, undefined, 'sine.inOut').to('coupon', { rz: STUCK.rz }, .14, undefined, 'sine.out')
            .arc('coupon', STUCK, 14, .44, KNOCK).call(() => c.sfx('flutter'), KNOCK + .05)
            .call(() => { c.sfx('pop'); c.fx.scraps(P.x + 30, P.top + 40, P.z + 14, [CORAL, '#f6b73c', '#fff4e2'], 7); }, KNOCK + .44)
            .squash('tag', .82, KNOCK + .44).set('burst', { show: true, s: .01, rz: -50 }, KNOCK + .44).to('burst', { s: 1, rz: 0 }, .3, KNOCK + .46, 'back.out(3)');
        } else {
          tl.call(() => c.sfx('peel'), KNOCK).to('burst', { s: .01, rz: 40 }, .16, KNOCK, 'power2.in').set('burst', { show: false })
            .to('coupon', { rz: 60 }, .12, KNOCK, 'power2.out').arc('coupon', { x: 0, y: 0, z: 0 }, 30, .36, KNOCK + .06).to('coupon', { rz: 0 }, .24, KNOCK + .18, 'back.out(2)').squash('tag', .9, KNOCK);
        }
      }
    }),
    view<number>({
      key: 'catalog', read: t => t.catalog ?? 0,
      rest: (c, n) => { c.rig.set('catalog', { ...REST, y: n ? 8 : 0, s: n ? 1.14 : 1 }); LEAVES.forEach((l, i) => c.rig.set(l, { ...REST, ry: n > i ? TURNED[i] : 0 })); },
      play: (c, tl, from, to) => {
        if (to) {
          if (!from) tl.to('catalog', { y: 8, s: 1.14 }, .2, 0, 'back.out(2.5)');
          tl.call(() => c.sfx('flip'), 0).to(LEAVES[to - 1], { ry: TURNED[to - 1] }, .36, 0, 'power2.inOut');
        } else {
          LEAVES.slice().reverse().forEach((l, i) => tl.to(l, { ry: 0 }, .24, i * .07, 'power2.in'));
          tl.call(() => c.sfx('flutter'), 0).to('catalog', { y: 0, s: 1 }, .18, .3, 'power2.in').call(() => c.sfx('tap'), .44).squash('catalog', .92, .46);
        }
      }
    }),
    view<number>({
      key: 'cart', read: t => t.cart ?? 0,
      rest: (c, n) => { F.stock.order.forEach((b, k) => c.rig.set(`box-${b}`, k < n ? { ...REST, ...slot(k) } : REST)); c.rig.set('basket', REST); c.rig.set('basket-front', REST); },
      play: (c, tl, _from, n) => {
        if (n) {
          // One press, one box: off the stack in an arc, into the basket, which squashes under it.
          const b = `box-${F.stock.order[n - 1]}`, T = .1;
          tl.call(() => c.sfx('whoosh'), T).to(b, { rz: -200 }, .2, T, 'none').to(b, { rz: -360 }, .18, T + .2, 'power2.out').set(b, { rz: 0 }).arc(b, slot(n - 1), 96, .38, T)
            .call(() => { c.sfx('thump'); c.fx.dust(F.basket.x, F.basket.z + 40, 0, 3); }, T + .38).squash('basket', .8, T + .38, .26).squash('basket-front', .8, T + .38, .26).squash(b, .86, T + .38);
        } else {
          F.stock.order.forEach((bx, k) => { const t = (2 - k) * .1; tl.arc(`box-${bx}`, { x: 0, y: 0, z: 0 }, 60, .32, t).call(() => c.sfx('tap'), t + .32).squash(`box-${bx}`, .86, t + .32); });
          tl.call(() => c.sfx('whoosh'), 0).squash('basket', .9, 0).squash('basket-front', .9, 0);
        }
      }
    }),
    view<number>({
      key: 'recs', read: t => t.recs ?? 0,
      rest: c => { if (!dealing) dealt.forEach((d, i) => c.rig.set(`rec-${i}`, { ...REST, ry: d ? 0 : 180 })); },
      // A new set slides in face down. It is turned over by `frame` below, outward from where he stands.
      play: (c, tl) => {
        dealt.fill(false); dealing = false;
        F.recs.xs.forEach((_, i) => tl.set(`rec-${i}`, { ...REST, ry: 180, x: 46, show: false }, 0).set(`rec-${i}`, { show: true }, i * .03).to(`rec-${i}`, { x: 0 }, .2, i * .03, 'back.out(1.6)'));
        tl.call(() => c.sfx('slide'), 0);
      }
    })
  ]);
  // What stirs when he comes into reach of each stop.
  const stir = (c: Ctx, actor: string, y = 9) => c.rig.play(`stir-${actor}`, tl => { tl.to(actor, { y }, .09, 0, 'power2.out').to(actor, { y: 0 }, .2, .09, 'bounce.out'); }, () => c.rig.set(actor, { y: 0 }));
  return {
    sync: (c, first) => { run(c, first); },
    near(c, stop) {
      if (stop === 'showcase') stir(c, 'phone');
      if (stop === 'promo') hang.swing(c, 'reel', 1, 7);
      if (stop === 'catalog' && !(c.toys.catalog ?? 0)) c.rig.play('catalog', tl => { tl.to('cat-cover', { ry: -26 }, .12, 0, 'power2.out').to('cat-cover', { ry: 0 }, .22, .12, 'back.out(2)'); }, () => c.rig.set('cat-cover', { ry: 0 }));
      if (stop === 'cart') stir(c, 'basket-front', 7);
    },
    frame(c) {
      hang.frame(c);
      // The shelf deals itself out when he comes to it.
      if (!dealing && dealt.includes(false) && c.hero.z < -60 && c.hero.x > F.recs.xs[0] - 70 && c.hero.x < F.recs.xs[4] + 50) deal(c);
    }
  };
}
