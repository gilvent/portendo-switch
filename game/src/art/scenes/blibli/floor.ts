// The shop floor: product detail. The shell is rooms.ts'; here stand the five toys, every moving piece its own actor
// (toys/shop.ts poses them). Plans and positions: plan.ts. What each toy stands for: docs/BLIBLI_DESIGN.md.
import { backOf, box, card, carved, cast, flat, sideL, sideR, type Actor, type Panel, type Scene, type Tint } from '../../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, planks } from '../../recipes.ts';
import { shopper } from '../promenade.ts';
import { MINT, ROOM_LIGHT, lamp, lampSet, shopShell, textBars } from '../rooms.ts';
import { FLOOR as F, VARIANT } from './plan.ts';

const WOOD = '#a8693a', STEEL = '#3d444e', PLUM = '#7c6be0', WHITE = '#ffffff';
// A sheet that takes the chosen colour: white dyed-through paper, so its cut edge is its own colour.
const BY_COLOUR: Tint = { toy: 'variant', colors: VARIANT };
const dyed = { stock: 'sugar' as const, c: WHITE, tint: BY_COLOUR };
const done = (stop: string, on: boolean) => ({ toy: `done:${stop}`, at: [on ? 1 : 0] });
// A station's trim: one strip that is plain kraft until the station is first used, then the new look.
const trim = (stop: string, x: number, y: number, z: number, w: number, h = 10): Panel[] => [
  card(x, y, z, w, h, { id: `trim-${stop}-old`, stock: 'kraft', c: KRAFT, density: 2, show: done(stop, false) }),
  card(x, y, z, w, h, { id: `trim-${stop}-new`, c: BLUE, density: 2, print: Array.from({ length: Math.floor(w / 14) }, (_, i) => `<circle cx="${7 + i * 14}" cy="${h / 2}" r="2.2" fill="${CREAM}"/>`).join(''), show: done(stop, true) })
];
// The faces of a folded box that the room's camera can see: its front, its top, and the side turned to the middle.
const seen = (ps: Panel[], x: number) => ps.filter(p => p.ghost || /-(front|top)$/.test(p.id) || p.id.endsWith(x < 0 ? '-right' : '-left'));
const screen = (w: number, h: number) => `<rect x="${w * .1}" y="${h * .08}" width="${w * .8}" height="${h * .8}" rx="2" fill="#1d2228"/><rect x="${w * .17}" y="${h * .14}" width="${w * .3}" height="${h * .2}" fill="#fff" fill-opacity=".22"/><circle cx="${w / 2}" cy="${h * .94}" r="${w * .05}" fill="#1d2228" fill-opacity=".5"/>`;

export function floor(): Scene {
  const shell = shopShell(), panels: Panel[] = [...shell.panels], actors: Record<string, Actor> = {}, H = shell.H;

  // Showcase: the phone on a turntable. A swatch chip for each colour on the pedestal's front.
  const s = F.showcase, pz = s.z + 45;
  const ped = box({ id: 'pedestal', x: s.x, z: s.z, w: 130, h: s.top, d: 90, stock: 'cover', c: DEEP, front: `<rect x="10" y="10" width="110" height="${s.top - 20}" fill="none" stroke="${CREAM}" stroke-width="3"/>`, top: `<ellipse cx="65" cy="45" rx="56" ry="38" fill="${CREAM}"/><ellipse cx="65" cy="45" rx="44" ry="28" fill="#e9dcc4"/>` });
  panels.push(...ped, ...trim('showcase', s.x - 65, s.top - 9, pz + .8, 130, 9));
  const phone = card(s.x - 27, s.top, s.z, 54, 104, { id: 'phone-front', ...dyed, round: 8, edge: 'cut', print: screen(54, 104) });
  panels.push(...cast('phone', [phone, { ...backOf(phone, WHITE), ...dyed, print: `<rect x="8" y="8" width="18" height="24" rx="5" fill="#1d2228" fill-opacity=".55"/><circle cx="17" cy="15" r="4" fill="#1d2228"/><circle cx="17" cy="25" r="4" fill="#1d2228"/>` }]));
  actors.phone = { pivot: [s.x, s.top, s.z] };
  s.chips.forEach((cx, i) => { panels.push(...cast(`chip-${i}`, [card(s.x + cx - 10, 30, pz + 1.4, 20, 20, { id: `chip-${i}`, c: VARIANT[i], density: 3, mask: '<circle cx="10" cy="10" r="10" fill="#fff"/>' })])); actors[`chip-${i}`] = { pivot: [s.x + cx, 30, pz + 1.4] }; });

  // Price tag: a punched tag on a post. The coupon reel hangs from the ceiling over where he stands; its tail is the next coupon.
  const p = F.promo, tz = p.z + 9, R = p.reel;
  panels.push(...seen(box({ id: 'tag-post', x: p.x, z: p.z, w: 12, h: p.top, d: 12, stock: 'greyboard', c: STEEL }), p.x), flat(p.x - 22, .7, p.z + 20, 44, 40, { id: 'tag-foot', stock: 'greyboard', c: STEEL, mask: '<ellipse cx="22" cy="20" rx="22" ry="20" fill="#fff"/>', decal: 'floor' }), ...trim('promo', p.x - 20, p.top - 26, p.z + 7, 40, 9));
  const tagPrint = (deal: boolean) => `<circle cx="10" cy="27" r="4" fill="${INK}"/><rect x="20" y="12" width="52" height="11" rx="3" fill="${deal ? '#b7bcc3' : INK}"/>${deal ? `<path d="M16 24L76 10" stroke="${CORAL}" stroke-width="3.4"/><rect x="20" y="31" width="44" height="13" rx="3" fill="${CORAL}"/>` : textBars(20, 33, 44, 2)}`;
  panels.push(...cast('tag', [false, true].map((deal, i) => card(p.x - 46, p.top - 8, tz, 84, 54, { id: i ? 'tag-new' : 'tag-old', stock: 'bond', c: CREAM, density: 3, mask: '<path d="M14 0H84V54H14L0 27Z" fill="#fff"/>', print: tagPrint(deal), show: { toy: 'promo', at: [i] } }))));
  actors.tag = { pivot: [p.x, p.top - 8, tz] };
  const drum = box({ id: 'reel-drum', x: R.x, z: R.z, y: R.y, w: 56, h: 30, d: 30, stock: 'cover', c: CORAL, front: `<rect y="11" width="56" height="8" fill="${CREAM}"/><g fill="${CREAM}"><circle cx="20" cy="9" r="3.6"/><circle cx="36" cy="21" r="3.6"/></g><path d="M19 24L37 6" stroke="${CREAM}" stroke-width="3"/>` });
  panels.push(...cast('reel', [card(R.x - 1.5, R.y + 30, R.z, 3, H - R.y - 30, { id: 'reel-cord', stock: 'greyboard', c: '#1a1410', edge: 'fold', density: 1 }), ...seen(drum, R.x)]));
  actors.reel = { pivot: [R.x, H, R.z] };
  const couponPrint = `<rect x="1.5" y="1.5" width="43" height="23" fill="none" stroke="${CORAL}" stroke-width="2" stroke-dasharray="4 3"/><circle cx="12" cy="13" r="7" fill="${CORAL}"/>${textBars(23, 8, 18, 2, '#e8a089')}`;
  panels.push(...cast('coupon', [card(R.x - 23, R.y - 26, R.z + 16, 46, 26, { id: 'coupon', stock: 'bond', c: '#fff4e2', density: 3, print: couponPrint })]));
  actors.coupon = { pivot: [R.x, R.y, R.z + 16] };
  const burstPath = Array.from({ length: 16 }, (_, i) => { const t = i * Math.PI / 8, r = i % 2 ? 15 : 23; return `${i ? 'L' : 'M'}${(23 + Math.cos(t) * r).toFixed(1)} ${(23 + Math.sin(t) * r).toFixed(1)}`; }).join('');
  panels.push(...cast('burst', [card(p.x + 24, p.top + 26, tz + 2.5, 46, 46, { id: 'promo-burst', c: SUN, density: 3, mask: `<path d="${burstPath}Z" fill="#fff"/>`, print: `<g fill="${CORAL}"><circle cx="17" cy="17" r="4.4"/><circle cx="29" cy="29" r="4.4"/></g><path d="M15 31L31 15" stroke="${CORAL}" stroke-width="3.6"/>` })]));
  actors.burst = { pivot: [p.x + 47, p.top + 49, tz + 2.5] };

  // Catalog: three leaves hinged along one spine, standing on a low stand. Each turned leaf swings over to the left.
  const c = F.catalog, L = c.leaf, sx = c.x - L.w / 2, cz = c.z + 8;
  panels.push(...box({ id: 'cat-stand', x: c.x, z: c.z, w: 100, h: c.top, d: 56, stock: 'greyboard', c: WOOD, front: planks(100, c.top, WOOD, '#6d4524', 27) }), ...trim('catalog', c.x - 50, c.top - 9, c.z + 28.8, 100, 9));
  actors.catalog = { pivot: [c.x, c.top, cz] };
  const leaf = (name: string, k: number, print: string, extra: Panel[] = []) => {
    const front = card(sx, c.top, cz - k, L.w, L.h, { id: `cat-${name}`, c: '#fbf7ee', stock: 'bond', density: 3, print });
    panels.push(...cast(`cat-${name}`, [front, { ...backOf(front, '#f1ead9'), print: textBars(8, 14, L.w - 16, 7, '#d9d2c2') }, ...extra]));
    actors[`cat-${name}`] = { pivot: [sx, c.top, cz - k], parent: 'catalog' };
  };
  leaf('cover', 0, `<rect width="${L.w}" height="12" fill="${BLUE}"/><rect x="19" y="20" width="20" height="34" rx="3" fill="${DEEP}"/><rect x="22" y="24" width="14" height="24" fill="#bfe6f8"/>${textBars(10, 60, L.w - 20, 2)}`);
  leaf('leaf-1', 1, `<rect width="${L.w}" height="6" fill="${BLUE}"/>${textBars(33, 16, 19, 5, '#c9ccd1', 9)}<g>${VARIANT.map((v, i) => `<circle cx="${12 + i * 10}" cy="68" r="3.4" fill="${v}"/>`).join('')}</g>`,
    [card(sx + 8, c.top + 16, cz - .5, 20, 40, { id: 'cat-phone', ...dyed, round: 3, density: 3, print: screen(20, 40) })]);
  const coupon = (on: boolean) => `<rect x="1" y="1" width="40" height="22" fill="none" stroke="${on ? CREAM : '#c9ccd1'}" stroke-width="2" stroke-dasharray="4 3"/><circle cx="11" cy="12" r="6" fill="${on ? CREAM : '#c9ccd1'}"/><rect x="21" y="9" width="15" height="3" rx="1.5" fill="${on ? CREAM : '#c9ccd1'}"/><rect x="21" y="14" width="10" height="3" rx="1.5" fill="${on ? CREAM : '#c9ccd1'}"/>`;
  leaf('leaf-2', 2, `<rect width="${L.w}" height="6" fill="${CORAL}"/><rect x="8" y="14" width="34" height="8" rx="2" fill="${INK}"/>${textBars(8, 28, 30, 1)}`, [
    card(sx + 8, c.top + 8, cz - 1.5, 42, 24, { id: 'cat-deal-off', stock: 'bond', c: '#fbf7ee', density: 3, print: coupon(false), show: { toy: 'promo', at: [0] } }),
    card(sx + 8, c.top + 8, cz - 1.5, 42, 24, { id: 'cat-deal-on', stock: 'bond', c: CORAL, density: 3, print: coupon(true), show: { toy: 'promo', at: [1] } })]);
  panels.push(...cast('catalog', [card(sx, c.top, cz - 3, L.w, L.h, { id: 'cat-board', c: '#fbf7ee', stock: 'bond', density: 3, print: `<rect width="${L.w}" height="6" fill="${MINT}"/><rect x="8" y="14" width="24" height="14" fill="${BLUE}"/><path d="M32 18H42L48 24V28H32Z" fill="${DEEP}"/><circle cx="16" cy="30" r="4" fill="#23272d"/><circle cx="40" cy="30" r="4" fill="#23272d"/><rect x="8" y="42" width="30" height="11" rx="5.5" fill="#dfeef6"/><rect x="20" y="57" width="30" height="11" rx="5.5" fill="#fff0d9"/>` })]));

  // Stock and basket: three boxed phones, each its own actor so it can be thrown, and a basket that squashes.
  const b = F.stock.box;
  F.stock.boxes.forEach(([bx, by, bz], i) => {
    const faces = seen(box({ id: `box-${i}`, x: bx, z: bz, y: by, w: b.w, h: b.h, d: b.d, stock: 'sugar', c: WHITE, front: `<rect x="17" y="7" width="16" height="30" rx="2.5" fill="#1d2228"/><rect x="19" y="10" width="12" height="22" fill="#1d2228" fill-opacity=".0"/><rect x="20" y="11" width="10" height="20" fill="#fff" fill-opacity=".3"/><rect y="${b.h - 5}" width="${b.w}" height="5" fill="#1d2228" fill-opacity=".18"/>`, top: `<rect x="${b.w / 2 - 5}" width="10" height="${b.d}" fill="#1d2228" fill-opacity=".16"/>` }), bx);
    panels.push(...cast(`box-${i}`, faces.map(q => (q.ghost ? q : { ...q, tint: BY_COLOUR }))));
    actors[`box-${i}`] = { pivot: [bx, by, bz], shadow: [58, 34] };
  });
  const k = F.basket, bw = 124, bd = 72, slots = (n: number) => `<g fill="${DEEP}">${Array.from({ length: n }, (_, i) => `<rect x="${12 + i * 17}" y="10" width="8" height="24" rx="4"/>`).join('')}</g>`;
  panels.push(...cast('basket', [
    flat(k.x - bw / 2, 1, k.z + bd / 2, bw, bd, { id: 'basket-floor', c: '#085890' }), card(k.x - bw / 2, 0, k.z - bd / 2, bw, 50, { id: 'basket-back', c: DEEP, print: slots(7) }),
    sideL(k.x - bw / 2, 0, k.z + bd / 2, bd, 46, { id: 'basket-left', c: DEEP }), sideR(k.x + bw / 2, 0, k.z - bd / 2, bd, 46, { id: 'basket-right', c: DEEP })]));
  // The basket's front stands in front of the boxes that land in it, so it is its own actor nearer the camera.
  panels.push(...cast('basket-front', [card(k.x - bw / 2, 0, k.z + bd / 2, bw, 44, { id: 'basket-front', c: BLUE, print: `${slots(7)}<rect width="${bw}" height="5" fill="${DEEP}"/>` }), ...trim('cart', k.x - bw / 2, 44, k.z + bd / 2, bw, 9)]));
  actors.basket = { pivot: [k.x, 0, k.z] }; actors['basket-front'] = { pivot: [k.x, 0, k.z + bd / 2] };

  // Recommended shelf: five product cards on a wall shelf over his head, where the clerk is laying them out. Face
  // down, a card shows its patterned back.
  const rc = F.recs, cw = rc.card.w, ch = rc.card.h, x0 = rc.xs[0] - 36, sw = rc.xs[4] - rc.xs[0] + 72;
  panels.push(...carved(shell.back, [...box({ id: 'rec-shelf', x: x0 + sw / 2, z: rc.z - 8, y: rc.y - 10, w: sw, h: 10, d: 36, stock: 'greyboard', c: WOOD }), ...[0, 1].flatMap(i => box({ id: `rec-bracket-${i}`, x: x0 + 30 + i * (sw - 60), z: rc.z - 14, y: rc.y - 34, w: 8, h: 24, d: 20, stock: 'greyboard', c: STEEL }))]), ...trim('recs', x0, rc.y - 10, rc.z + 10.8, sw, 10));
  const goods = [
    (cl: string) => `<path d="M10 30Q10 12 22 12Q34 12 34 30" stroke="${cl}" stroke-width="4" fill="none"/><rect x="6" y="26" width="9" height="14" rx="3" fill="${cl}"/><rect x="29" y="26" width="9" height="14" rx="3" fill="${cl}"/>`,
    (cl: string) => `<rect x="12" y="8" width="20" height="34" rx="4" fill="${cl}"/><rect x="15" y="11" width="8" height="8" rx="3" fill="#1d2228"/>`,
    (cl: string) => `<circle cx="22" cy="24" r="12" fill="${cl}"/><rect x="18" y="6" width="8" height="8" fill="${cl}"/><rect x="18" y="34" width="8" height="8" fill="${cl}"/><circle cx="22" cy="24" r="7" fill="#1d2228"/>`,
    (cl: string) => `<rect x="9" y="12" width="26" height="26" rx="5" fill="${cl}"/><circle cx="22" cy="25" r="8" fill="#1d2228"/><circle cx="22" cy="25" r="3" fill="${cl}"/>`,
    (cl: string) => `<rect x="15" y="20" width="14" height="22" rx="2" fill="${cl}"/><path d="M19 20V12M25 20V12" stroke="${cl}" stroke-width="3"/><path d="M22 42Q22 50 30 48" stroke="#1d2228" stroke-width="2" fill="none"/>`
  ];
  const SETS = [[CORAL, MINT, SUN, BLUE, PLUM], [SUN, BLUE, CORAL, PLUM, MINT]], backPrint = `<rect x="4" y="4" width="${cw - 8}" height="${ch - 8}" fill="none" stroke="${CREAM}" stroke-width="2"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${12 + (i % 3) * 10}" cy="${12 + Math.floor(i / 3) * 12}" r="2.4" fill="${CREAM}"/>`).join('')}`;
  rc.xs.forEach((x, i) => {
    const face = (set: number) => card(x - cw / 2, rc.y, rc.z, cw, ch, { id: `rec-${i}-${'ab'[set]}`, c: '#fbf7ee', density: 3, print: `${goods[(i + set * 2) % 5](SETS[set][i])}${Array.from({ length: 5 }, (_, n) => `<circle cx="${10 + n * 6}" cy="${ch - 8}" r="2" fill="${n < 4 + ((i + set) % 2) ? SUN : '#d9d2c2'}"/>`).join('')}`, show: { toy: 'recs', at: [set] } });
    panels.push(...cast(`rec-${i}`, [face(0), face(1), { ...backOf(card(x - cw / 2, rc.y, rc.z, cw, ch, { id: `rec-${i}`, c: BLUE, density: 3 }), BLUE), print: backPrint }]));
    actors[`rec-${i}`] = { pivot: [x, rc.y, rc.z] };
  });
  // The clerk on her step stool at the end of the shelf.
  panels.push(...seen(box({ id: 'stool', x: 494, z: -172, w: 64, h: 30, d: 44, stock: 'greyboard', c: WOOD, front: planks(64, 30, WOOD, '#6d4524', 15) }), 494),
    ...shopper('clerk', 494, -168, { coat: BLUE, legs: '#22324a', skin: '#e2b08a', hair: '#2b2622', style: 'dress', build: 'average', face: 'cheerful', lift: 30 }, true));

  // Pendant lamps over the open floor, low enough that a jump knocks them.
  F.lamps.forEach((l, i) => { panels.push(...cast(`lamp-${i}`, lampSet(`lamp-${i}`, l.x, l.z, F.lampY, H))); actors[`lamp-${i}`] = { pivot: [l.x, H, l.z] }; });
  return { id: 'shop', panels, actors, camera: { zoom: .8, x0: -30, x1: 30 }, light: ROOM_LIGHT, lamps: [...F.lamps.map(l => lamp(l.x, l.z, F.lampY)), lamp(300, -40, 330)] };
}
