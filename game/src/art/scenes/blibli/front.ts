// The shopfront on the promenade: product reviews. Phase 2 greybox: plain boxes and cards, moving pieces as actors.
import { box, card, cast, flat, type Actor, type Panel, type Scene, type Tint } from '../../kit.ts';
import { FRONT as F, VARIANT } from './plan.ts';

const WALL = '#e6e1d6', GROUND = '#d6cdbd', BODY = '#b9b2a5', DARK = '#7f796f', PALE = '#f4efe6', OLD = '#b98450', NEW = '#0092da', CORAL = '#e8552d', INK = '#2b2622', SUN = '#f6b73c';
// The colour chosen inside the shop: a sheet out here follows it by its full name.
const BY_COLOUR: Tint = { toy: 'blibli-shop/variant', colors: VARIANT };
const done = (stop: string, on: boolean) => ({ toy: `done:${stop}`, at: [on ? 1 : 0] });
const trim = (stop: string, x: number, y: number, z: number, w: number, h = 10): Panel[] => [
  card(x, y, z, w, h, { id: `trim-${stop}-old`, c: OLD, show: done(stop, false) }), card(x, y, z, w, h, { id: `trim-${stop}-new`, c: NEW, show: done(stop, true) })
];
const starPath = (cx: number, cy: number, R: number) => `M${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5, q = i % 2 ? R * .45 : R; return `${(cx + Math.sin(a) * q).toFixed(1)} ${(cy - Math.cos(a) * q).toFixed(1)}`; }).join('L')}Z`;
export const stars = (n: number, x: number, y: number, R: number, gap: number, of = 5) => Array.from({ length: of }, (_, i) => `<path d="${starPath(x + i * gap, y, R)}" fill="${i < n ? SUN : INK}" fill-opacity="${i < n ? 1 : .14}"/>`).join('');
const lines = (x: number, y: number, w: number, n: number, gap = 7) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${w * (i % 2 ? .7 : 1)}" height="3" rx="1.5" fill="${INK}" fill-opacity=".28"/>`).join('');
const snap = (w: number, h: number, c: string) => `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="${c}"/><circle cx="${w * .7}" cy="${h * .34}" r="${Math.min(w, h) * .12}" fill="${SUN}"/><path d="M3 ${h - 3}L${w * .34} ${h * .5}L${w * .6} ${h - 3}Z" fill="${INK}" fill-opacity=".3"/>`;

export function front(): Scene {
  const g = F.ground, w = F.wall, panels: Panel[] = [], actors: Record<string, Actor> = {};
  panels.push(flat(g.x0, 0, g.front, g.x1 - g.x0, g.front - g.back, { id: 'ground', c: GROUND }), card(w.x0, 0, w.z, w.x1 - w.x0, w.h, { id: 'facade', c: WALL, edge: 'fold' }));
  panels.push(card(g.x0 + 20, 0, 60, 70, 60, { id: 'out-arrow', c: SUN, mask: '<path d="M0 30L28 4V20H70V40H28V56Z" fill="#fff"/>' }));
  panels.push(card(F.siteBoard.x - 30, 0, F.siteBoard.z, 60, 88, { id: 'site-board', c: NEW, print: `<rect x="8" y="10" width="44" height="30" rx="3" fill="${PALE}"/>${lines(10, 50, 40, 3)}` }));

  // Review wall: six cards on a board in the left window; each folds up about its top edge when it does not match.
  const b = F.board, bz = w.z + 2, cw = b.card.w, ch = b.card.h;
  panels.push(card(b.x, b.y, bz, b.w, b.h, { id: 'board', c: '#d8cfbd' }), ...trim('wall', b.x, b.y + b.h + 2, bz + 1, b.w, 12));
  F.reviews.forEach((rv, i) => {
    const cx = b.cols[i % 3], cy = b.rows[Math.floor(i / 3)], x = cx - cw / 2, y = cy - ch / 2, name = `card-${i}`;
    const body = i ? stars(rv.stars, 10, 12, 5.5, 13.5) + (rv.photo ? `<g transform="translate(6 24)">${snap(26, 26, [NEW, CORAL, '#35b58a'][i % 3])}</g>${lines(38, 30, 30, 4, 8)}` : lines(8, 28, cw - 16, 5, 8)) : lines(40, 30, 28, 4, 8);
    const sheets: Panel[] = [card(x, y, bz + 2, cw, ch, { id: name, c: PALE, stock: 'bond', print: body })];
    if (!i) {
      // His own card: the stars he stamped and the print he took, each a sheet that follows its toy.
      for (let n = 1; n <= 5; n++) sheets.push(card(x + 4, y + ch - 20, bz + 2.6, cw - 8, 16, { id: `mine-stars-${n}`, c: PALE, stock: 'bond', print: stars(n, 8, 8, 5.5, 13.5), show: { toy: 'rating', at: [n] } }));
      sheets.push(card(x + 4, y + ch - 20, bz + 2.6, cw - 8, 16, { id: 'mine-stars-0', c: PALE, stock: 'bond', print: stars(0, 8, 8, 5.5, 13.5), show: { toy: 'rating', at: [0] } }));
      sheets.push(card(x + 8, y + 8, bz + 2.6, 24, 30, { id: 'mine-photo', c: PALE, tint: BY_COLOUR, show: { toy: 'photo', at: [2, 3] } }));
      panels.push(card(cx - 4, cy + ch / 2 - 10, bz + 1, 8, 8, { id: 'mine-pin', c: CORAL, mask: '<circle cx="4" cy="4" r="4" fill="#fff"/>' }));
    }
    panels.push(...cast(name, sheets));
    actors[name] = { pivot: [cx, cy + ch / 2, bz + 2] };
  });
  // The tab strip over the wall: one sheet per filter, the chosen tab standing proud.
  const tabs = (on: number) => ['<circle cx="0" cy="0" r="5"/><circle cx="12" cy="0" r="5"/><circle cx="24" cy="0" r="5"/>', `<g transform="translate(-2 -9) scale(.72)">${snap(34, 26, NEW)}</g>`, `<path d="${starPath(12, 0, 9)}" fill="${SUN}"/>`]
    .map((icon, i) => `<g transform="translate(${10 + i * 62} ${i === on ? 0 : 10})"><rect width="54" height="34" rx="5" fill="${i === on ? NEW : BODY}"/><g transform="translate(15 17)" fill="${PALE}">${icon}</g></g>`).join('');
  panels.push(...cast('tabs', [0, 1, 2].map(k => card(b.x + 30, b.y + b.h - 4, bz + 3, 196, 36, { id: `tabs-${k}`, c: PALE, mask: [0, 1, 2].map(i => `<rect x="${10 + i * 62}" y="${i === k ? 0 : 10}" width="54" height="${i === k ? 36 : 26}" rx="5" fill="#fff"/>`).join(''), print: tabs(k), show: { toy: 'filter', at: [k] } }))));
  actors.tabs = { pivot: [b.x + 128, b.y + b.h - 4, bz + 3] };

  // The door: two leaves on their hinges, a bell on a spring over it.
  const d = F.door;
  panels.push(card(d.x - d.w / 2 - 8, 0, w.z + 1, d.w + 16, d.h + 10, { id: 'door-frame', c: NEW }), card(d.x - d.w / 2, 0, w.z + 1.6, d.w, d.h, { id: 'door-dark', c: '#3d444e' }));
  for (const [side, sx] of [['l', -1], ['r', 1]] as const) {
    panels.push(...cast(`door-${side}`, [card(sx < 0 ? d.x - d.w / 2 : d.x, 0, w.z + 3, d.w / 2, d.h, { id: `door-${side}`, c: PALE, print: `<rect x="8" y="${d.h * .1}" width="${d.w / 2 - 16}" height="${d.h * .6}" fill="#bfe6f8"/><rect x="${sx < 0 ? d.w / 2 - 12 : 6}" y="${d.h * .55}" width="6" height="22" rx="3" fill="${DARK}"/>` })]));
    actors[`door-${side}`] = { pivot: [d.x + sx * d.w / 2, 0, w.z + 3] };
  }
  panels.push(...cast('bell', [card(d.x - 12, d.h + 16, w.z + 16, 24, 26, { id: 'bell', c: SUN, mask: '<path d="M12 0C22 0 20 16 24 22H0C4 16 2 0 12 0ZM8 22H16V26H8Z" fill="#fff"/>' })]));
  actors.bell = { pivot: [d.x, d.h + 42, w.z + 16] };

  // Photo string: six prints at their own shapes, three over three, in the right window. The first peg is his: the
  // camera's print flies to it. A blind with six square windows rolls down over them when the cord is tugged.
  const s = F.string, sw = 3 * s.cell + 26, top = s.y + s.cell + 22;
  panels.push(card(s.x - sw / 2 - 10, s.y - s.cell - 26, w.z + 2, sw + 20, 2 * s.cell + 58, { id: 'window', c: '#cfe3ea' }), ...trim('gallery', s.x - sw / 2 - 10, top + 12, w.z + 3, sw + 20, 12));
  [s.prints[0][1] + 34, s.prints[3][1] + 34].forEach((y, i) => panels.push(card(s.x - sw / 2 - 6, y, s.z, sw + 12, 2, { id: `string-${i}`, c: DARK, stock: 'greyboard' })));
  s.prints.forEach(([x, y, pw, ph], i) => { if (i) panels.push(card(x - pw / 2, y - ph / 2, s.z + 1, pw, ph, { id: `print-${i}`, c: PALE, stock: 'bond', print: snap(pw, ph, [CORAL, '#35b58a', NEW, '#7c6be0', SUN][i - 1]) })); });
  panels.push(card(s.prints[0][0] - 4, s.prints[0][1] + 26, s.z + 1, 8, 12, { id: 'peg-mine', c: OLD }));
  const holes = s.prints.map(([x, y]) => { const c = s.cell - 14; return `M${x - (s.x - sw / 2) - c / 2} ${top - y - c / 2}v${c}h${c}v${-c}Z`; }).join(' ');
  panels.push(...cast('blind', [card(s.x - sw / 2, top - (2 * s.cell + 40), s.z + 5, sw, 2 * s.cell + 40, { id: 'blind', c: '#f1e6cf', mask: `<path fill-rule="evenodd" d="M0 0H${sw}V${2 * s.cell + 40}H0Z ${holes}" fill="#fff"/>` })]));
  actors.blind = { pivot: [s.x, top, s.z + 5] };
  panels.push(card(s.x - sw / 2 - 4, top - 4, s.z + 6, sw + 8, 12, { id: 'blind-roll', c: DARK, stock: 'greyboard' }));
  panels.push(...cast('cord', [card(s.x + sw / 2 + 12, top - 96, s.z + 6, 3, 96, { id: 'cord', c: DARK, stock: 'greyboard' }), card(s.x + sw / 2 + 6, top - 110, s.z + 6, 15, 15, { id: 'cord-knob', c: CORAL, mask: '<circle cx="7.5" cy="7.5" r="7.5" fill="#fff"/>' })]));
  actors.cord = { pivot: [s.x + sw / 2 + 13, top, s.z + 6] };

  // Photo spot: the phone on the unboxing table, and the instant camera on its tripod aimed at it.
  const t = F.table, c = F.camera;
  panels.push(...box({ id: 'table', x: t.x, z: t.z, w: 120, h: t.top, d: 64, stock: 'cover', c: BODY }), ...box({ id: 'parcel', x: t.x + 30, z: t.z - 4, y: t.top, w: 50, h: 30, d: 40, stock: 'kraft', c: OLD }), ...trim('camera', t.x - 60, t.top - 12, t.z + 32.8, 120));
  panels.push(card(t.x - 46, t.top, t.z + 8, 32, 58, { id: 'spot-phone', c: PALE, tint: BY_COLOUR }), card(t.x - 41, t.top + 7, t.z + 8.8, 22, 44, { id: 'spot-phone-screen', c: '#1d2228' }));
  panels.push(card(c.x - 30, 0, c.z - 2, 60, c.y, { id: 'tripod', c: DARK, stock: 'greyboard', mask: `<path d="M26 0H34L60 ${c.y}H52L30 22L8 ${c.y}H0Z" fill="#fff"/>` }));
  panels.push(...cast('camera', [...box({ id: 'camera', x: c.x, z: c.z, y: c.y, w: 58, h: 42, d: 34, stock: 'cover', c: PALE }), card(c.x + 6, c.y + 8, c.z + 17.8, 26, 26, { id: 'camera-lens', c: '#23272d', mask: '<circle cx="13" cy="13" r="13" fill="#fff"/>', print: '<circle cx="13" cy="13" r="7" fill="#4f6a86"/>' }), card(c.x - 24, c.y + 26, c.z + 17.8, 14, 9, { id: 'camera-flash', c: SUN })]));
  actors.camera = { pivot: [c.x, c.y, c.z] };
  // The print: a white card with the phone on it, in the phone's colour. It hangs from the camera's slot by its top.
  // There are two: the one on his peg, and a fresh one when he shoots again while the first hangs there.
  for (const n of ['print', 'print-new']) {
    panels.push(...cast(n, [card(c.x - 20, c.y - 52, c.z + 19, 40, 52, { id: `${n}-paper`, c: '#fdfaf2', stock: 'bond' }), card(c.x - 9, c.y - 42, c.z + 19.6, 18, 30, { id: `${n}-pic`, c: PALE, tint: BY_COLOUR })]));
    actors[n] = { pivot: [c.x, c.y, c.z + 19] };
  }

  // Writing stand: his review card on a sloping top, and the rubber stamp over it.
  const st = F.stand, tilt: [number, number, number] = [0, .55, -.835];
  panels.push(...box({ id: 'stand', x: st.x, z: st.z, w: 70, h: st.top, d: 46, stock: 'cover', c: BODY }), ...trim('stars', st.x - 35, st.top - 12, st.z + 23.8, 70));
  const sheet = (id: string, print: string, rest: Partial<Panel> = {}): Panel => ({ id, stock: 'bond', c: PALE, o: [st.x - 36, st.top + 1, st.z + 22], u: [1, 0, 0], v: tilt, w: 72, h: 52, edge: 'cut', print, ...rest });
  panels.push(sheet('my-card', lines(8, 28, 56, 3, 8)));
  for (let n = 0; n <= 5; n++) panels.push({ ...sheet(`stars-${n}`, stars(n, 9, 10, 5.5, 13.5)), o: [st.x - 36, st.top + 1.5 + 34 * tilt[1], st.z + 22 + 34 * tilt[2]], h: 18, show: { toy: 'rating', at: [n] } });
  panels.push(...cast('stamp', [...box({ id: 'stamp', x: st.x + 6, z: st.z + 4, y: st.top + 62, w: 24, h: 26, d: 22, stock: 'cover', c: CORAL }), card(st.x + 2, st.top + 88, st.z + 4, 8, 16, { id: 'stamp-grip', c: DARK })]));
  actors.stamp = { pivot: [st.x + 6, st.top + 62, st.z + 4] };
  panels.push(...box({ id: 'can-a', x: st.x + 62, z: st.z + 20, w: 26, h: 28, d: 26, stock: 'cover', c: NEW }), ...box({ id: 'can-b', x: st.x + 84, z: st.z - 6, w: 24, h: 26, d: 24, stock: 'cover', c: OLD }));

  // The courier's scooter at the kerb: its rack carries as many parcels as the basket inside holds.
  const sc = F.scooter;
  panels.push(...box({ id: 'scooter', x: sc.x, z: sc.z, w: 120, h: 44, d: 36, stock: 'cover', c: NEW }));
  for (let n = 1; n <= 3; n++) panels.push(card(sc.x - 50, 44, sc.z, 100, 70, { id: `parcels-${n}`, c: OLD, stock: 'kraft', mask: [[0, 36, 44, 34], [50, 36, 44, 34], [24, 0, 46, 34]].slice(0, n).map(([x, y, bw, bh]) => `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="#fff"/>`).join(''), show: { toy: 'blibli-shop/cart', at: [n] } }));

  // People reading the wall, and pigeons on the plaza.
  F.shoppers.forEach((p, i) => panels.push(card(p.x - 32, 0, p.z, 64, 118, { id: `shopper-${'ab'[i]}`, c: ['#8fa3b8', '#b89a8f'][i], mask: '<path d="M32 0C52 0 58 16 58 30C58 44 48 52 46 56C56 60 60 70 60 118H4C4 70 8 60 18 56C16 52 6 44 6 30C6 16 12 0 32 0Z" fill="#fff"/>' })));
  F.pigeons.forEach((p, i) => { const n = `pigeon-${'ab'[i]}`; panels.push(...cast(n, [card(p.x - 13, 0, p.z, 26, 18, { id: n, c: '#8d95a0', mask: '<path d="M0 12C2 4 10 2 16 6L22 2L26 6L22 8C22 14 16 18 8 18Z" fill="#fff"/>' })])); actors[n] = { pivot: [p.x, 0, p.z], shadow: [26, 12] }; });
  return { id: 'street', panels, actors, light: { sun: 3.2, sky: .62, skyColor: [.62, .78, 1] }, camera: { zoom: 1, x0: -300, x1: 560 } };
}
