// The shop floor: product detail. Phase 2 greybox: plain boxes and cards, every moving piece already its own actor.
import { backOf, box, card, cast, flat, sideL, sideR, type Actor, type Panel, type Scene, type Tint } from '../../kit.ts';
import { FLOOR as F, VARIANT } from './plan.ts';

const WALL = '#e6e1d6', GROUND = '#cfc8ba', BODY = '#b9b2a5', DARK = '#7f796f', PALE = '#f4efe6', OLD = '#b98450', NEW = '#0092da', CORAL = '#e8552d', INK = '#2b2622';
const BY_COLOUR: Tint = { toy: 'variant', colors: VARIANT };
const done = (stop: string, on: boolean) => ({ toy: `done:${stop}`, at: [on ? 1 : 0] });
// A station's trim: one strip that is kraft until the station is first used, then blue.
const trim = (stop: string, x: number, y: number, z: number, w: number, h = 10): Panel[] => [
  card(x, y, z, w, h, { id: `trim-${stop}-old`, c: OLD, show: done(stop, false) }), card(x, y, z, w, h, { id: `trim-${stop}-new`, c: NEW, show: done(stop, true) })
];
const lines = (x: number, y: number, w: number, n: number, gap = 7) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${w * (i % 2 ? .7 : 1)}" height="3" rx="1.5" fill="${INK}" fill-opacity=".28"/>`).join('');

export function floor(): Scene {
  const r = F.room, W = r.x1 - r.x0, D = r.front - r.back, panels: Panel[] = [], actors: Record<string, Actor> = {};
  panels.push(flat(r.x0, 0, r.front, W, D, { id: 'floor', c: GROUND }), card(r.x0, 0, r.back, W, r.h, { id: 'wall-back', c: WALL, edge: 'fold' }), sideL(r.x0, 0, r.front, D, r.h, { id: 'wall-left', c: WALL }), sideR(r.x1, 0, r.back, D, r.h, { id: 'wall-right', c: WALL }));
  panels.push(flat(F.door.x - 80, .6, r.front, 160, 60, { id: 'door-mat', c: CORAL }));

  // Showcase: the phone on its pedestal, a swatch chip for each colour on the pedestal's front.
  const s = F.showcase, pz = s.z + 40;
  panels.push(...box({ id: 'pedestal', x: s.x, z: s.z, w: 116, h: s.top, d: 80, stock: 'cover', c: BODY }), ...trim('showcase', s.x - 58, s.top - 12, pz + .8, 116));
  const phone = card(s.x - 28, s.top, s.z, 56, 104, { id: 'phone-front', c: PALE, tint: BY_COLOUR });
  panels.push(...cast('phone', [phone, { ...backOf(phone, PALE), tint: BY_COLOUR }, card(s.x - 21, s.top + 12, s.z + .8, 42, 80, { id: 'phone-screen', c: '#1d2228' })]));
  actors.phone = { pivot: [s.x, s.top, s.z] };
  s.chips.forEach((cx, i) => { panels.push(...cast(`chip-${i}`, [card(s.x + cx - 10, 36, pz + 1.2, 20, 20, { id: `chip-${i}`, c: VARIANT[i] })])); actors[`chip-${i}`] = { pivot: [s.x + cx, 36, pz + 1.2] }; });

  // Price tag: a card on a post. The coupon reel hangs from the ceiling over where he stands; its tail is the next coupon.
  const p = F.promo, tz = p.z + 8;
  panels.push(...box({ id: 'tag-post', x: p.x, z: p.z, w: 14, h: p.top, d: 14, stock: 'greyboard', c: DARK }), ...trim('promo', p.x - 20, 0, p.z + 24, 40, 12));
  const price = (cut: boolean) => `<rect x="10" y="${cut ? 9 : 16}" width="${cut ? 34 : 52}" height="${cut ? 7 : 12}" rx="2" fill="${INK}" fill-opacity="${cut ? .35 : .8}"/>${cut ? `<path d="M7 15L48 9" stroke="${CORAL}" stroke-width="2.4"/><rect x="10" y="24" width="52" height="13" rx="2" fill="${CORAL}"/>` : ''}`;
  panels.push(...cast('tag', [card(p.x - 36, p.top, tz, 72, 46, { id: 'tag-old', c: PALE, print: price(false), show: { toy: 'promo', at: [0] } }), card(p.x - 36, p.top, tz, 72, 46, { id: 'tag-new', c: PALE, print: price(true), show: { toy: 'promo', at: [1] } })]));
  actors.tag = { pivot: [p.x, p.top, tz] };
  const reel = p.reel;
  panels.push(...cast('reel', [card(reel.x - 1.5, reel.y + 26, reel.z, 3, r.h - reel.y - 26, { id: 'reel-cord', c: DARK, stock: 'greyboard' }), card(reel.x - 26, reel.y, reel.z, 52, 28, { id: 'reel-drum', c: BODY, print: `<circle cx="26" cy="14" r="9" fill="${DARK}"/><text x="26" y="18" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="11" fill="${PALE}">%</text>` })]));
  actors.reel = { pivot: [reel.x, r.h, reel.z] };
  panels.push(...cast('coupon', [card(reel.x - 17, reel.y - 24, reel.z + 1, 34, 24, { id: 'coupon', c: CORAL, print: `<text x="17" y="17" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="14" fill="${PALE}">%</text>` })]));
  actors.coupon = { pivot: [reel.x, reel.y, reel.z + 1] };
  const star = (n: number, R: number, k: number) => `<path d="M${Array.from({ length: n * 2 }, (_, i) => { const a = i * Math.PI / n, q = i % 2 ? R * k : R; return `${(R + Math.sin(a) * q).toFixed(1)} ${(R - Math.cos(a) * q).toFixed(1)}`; }).join('L')}Z" fill="#fff"/>`;
  panels.push(...cast('burst', [card(p.x + 22, p.top + 22, tz + 2, 46, 46, { id: 'promo-burst', c: '#f6b73c', mask: star(10, 23, .72) })]));
  actors.burst = { pivot: [p.x + 45, p.top + 45, tz + 2] };

  // Catalog: three leaves hinged along one spine, standing on a stand. Each turned leaf swings over to the left.
  const c = F.catalog, L = c.leaf, sx = c.x - L.w / 2, cz = c.z + 6;
  panels.push(...box({ id: 'cat-stand', x: c.x, z: c.z, w: 96, h: c.top, d: 56, stock: 'cover', c: BODY }), ...trim('catalog', c.x - 48, c.top - 12, c.z + 28.8, 96));
  actors.catalog = { pivot: [c.x, c.top, cz] };
  const leaf = (name: string, k: number, print: string, extra: Panel[] = []) => {
    const front = card(sx, c.top, cz - k, L.w, L.h, { id: `cat-${name}`, c: PALE, stock: 'bond', print });
    panels.push(...cast(`cat-${name}`, [front, backOf(front, '#e9e2d4'), ...extra]));
    actors[`cat-${name}`] = { pivot: [sx, c.top, cz - k], parent: 'catalog' };
  };
  leaf('cover', 0, `<rect x="8" y="10" width="42" height="10" rx="2" fill="${NEW}"/>${lines(8, 30, 42, 3)}<rect x="19" y="52" width="20" height="14" rx="2" fill="${INK}" fill-opacity=".2"/>`);
  leaf('leaf-1', 1, lines(34, 14, 18, 6), [card(sx + 8, c.top + 24, cz - .6, 20, 38, { id: 'cat-phone', c: PALE, tint: BY_COLOUR })]);
  leaf('leaf-2', 2, `<rect x="8" y="12" width="42" height="14" rx="2" fill="${INK}" fill-opacity=".25"/>`, [
    card(sx + 8, c.top + 10, cz - 1.6, 42, 30, { id: 'cat-deal-off', c: '#e9e2d4', print: `<rect x="1" y="1" width="40" height="28" fill="none" stroke="${INK}" stroke-opacity=".4" stroke-dasharray="4 3"/>`, show: { toy: 'promo', at: [0] } }),
    card(sx + 8, c.top + 10, cz - 1.6, 42, 30, { id: 'cat-deal-on', c: CORAL, print: `<text x="21" y="21" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="16" fill="${PALE}">%</text>`, show: { toy: 'promo', at: [1] } })]);
  panels.push(...cast('catalog', [card(sx, c.top, cz - 3, L.w, L.h, { id: 'cat-board', c: PALE, stock: 'bond', print: `<rect x="8" y="12" width="26" height="16" rx="2" fill="${NEW}"/><circle cx="14" cy="32" r="4" fill="${INK}"/><circle cx="28" cy="32" r="4" fill="${INK}"/><path d="M38 30H52" stroke="${NEW}" stroke-width="2" stroke-dasharray="3 3"/><rect x="8" y="44" width="30" height="10" rx="5" fill="${INK}" fill-opacity=".2"/><rect x="20" y="58" width="30" height="10" rx="5" fill="${OLD}" fill-opacity=".5"/>` })]));

  // Stock and basket: three boxed phones, each its own actor so it can be thrown, and a basket that squashes.
  const b = F.stock.box;
  F.stock.boxes.forEach(([bx, by, bz], i) => {
    panels.push(...cast(`box-${i}`, box({ id: `box-${i}`, x: bx, z: bz, y: by, w: b.w, h: b.h, d: b.d, stock: 'cover', c: PALE }).map(q => (q.ghost ? q : { ...q, tint: BY_COLOUR }))));
    actors[`box-${i}`] = { pivot: [bx, by, bz], shadow: [58, 34] };
  });
  const k = F.basket, bw = 124, bd = 72;
  panels.push(...cast('basket', [
    flat(k.x - bw / 2, 1, k.z + bd / 2, bw, bd, { id: 'basket-floor', c: DARK }), card(k.x - bw / 2, 0, k.z - bd / 2, bw, 50, { id: 'basket-back', c: DARK }),
    sideL(k.x - bw / 2, 0, k.z + bd / 2, bd, 46, { id: 'basket-left', c: DARK }), sideR(k.x + bw / 2, 0, k.z - bd / 2, bd, 46, { id: 'basket-right', c: DARK })]));
  // The basket's front stands in front of the boxes that land in it, so it is its own actor nearer the camera.
  panels.push(...cast('basket-front', [card(k.x - bw / 2, 0, k.z + bd / 2, bw, 40, { id: 'basket-front', c: BODY, mask: `<path fill-rule="evenodd" d="M0 0H${bw}V40H0Z M10 8V16H${bw - 10}V8Z M10 22V30H${bw - 10}V22Z" fill="#fff"/>` }), ...trim('cart', k.x - bw / 2, 30, k.z + bd / 2 + .8, bw).map(q => ({ ...q, h: 10 }))]));
  actors.basket = { pivot: [k.x, 0, k.z] }; actors['basket-front'] = { pivot: [k.x, 0, k.z + bd / 2] };

  // Recommended shelf: five product cards on a wall shelf over his head. Face down, a card shows its plain back.
  const rc = F.recs, cw = rc.card.w, ch = rc.card.h, SETS = [[CORAL, '#35b58a', '#f6b73c', NEW, '#7c6be0'], ['#f6b73c', NEW, CORAL, '#7c6be0', '#35b58a']];
  panels.push(...box({ id: 'rec-shelf', x: (rc.xs[0] + rc.xs[4]) / 2, z: rc.z - 4, y: rc.y - 10, w: rc.xs[4] - rc.xs[0] + 70, h: 10, d: 36, stock: 'greyboard', c: DARK }), ...trim('recs', rc.xs[0] - 35, rc.y - 10, rc.z + 14.8, rc.xs[4] - rc.xs[0] + 70));
  rc.xs.forEach((x, i) => {
    const face = (set: number) => card(x - cw / 2, rc.y, rc.z, cw, ch, { id: `rec-${i}-${'ab'[set]}`, c: PALE, print: `<rect x="8" y="8" width="${cw - 16}" height="${ch - 30}" rx="3" fill="${SETS[set][i]}"/>${lines(8, ch - 16, cw - 16, 2, 6)}`, show: { toy: 'recs', at: [set] } });
    const blank = backOf(card(x - cw / 2, rc.y, rc.z, cw, ch, { id: `rec-${i}`, c: '#d9d2c4', print: `<rect x="5" y="5" width="${cw - 10}" height="${ch - 10}" fill="none" stroke="${INK}" stroke-opacity=".18" stroke-width="2"/>` }));
    panels.push(...cast(`rec-${i}`, [face(0), face(1), { ...blank, print: `<rect x="5" y="5" width="${cw - 10}" height="${ch - 10}" fill="none" stroke="${INK}" stroke-opacity=".18" stroke-width="2"/>` }]));
    actors[`rec-${i}`] = { pivot: [x, rc.y, rc.z] };
  });

  // Pendant lamps over the open floor, low enough that a jump knocks them.
  F.lamps.forEach((l, i) => {
    panels.push(...cast(`lamp-${i}`, [card(l.x - 1.5, F.lampY + 38, l.z, 3, r.h - F.lampY - 38, { id: `lamp-${i}-cord`, c: DARK, stock: 'greyboard' }), card(l.x - 38, F.lampY, l.z, 76, 40, { id: `lamp-${i}-shade`, c: PALE, mask: `<path d="M22 0H54L76 40H0Z" fill="#fff"/>` })]));
    actors[`lamp-${i}`] = { pivot: [l.x, r.h, l.z] };
  });
  return { id: 'shop', panels, actors, light: { sun: 0, sky: .5, skyColor: [1, .97, .92] }, camera: { zoom: .8, x0: -30, x1: 30 } };
}
