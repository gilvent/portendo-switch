// The Moperty lane: a hometown lane along the top of a rise, with a plot, a house on the market and the agent's
// office, and the town spread out below behind them (laneView.ts). Every toy of docs/MOPERTY_DESIGN.md is paper here:
// the ids, poses and motions are the ones the grey box was played with.
import { add, box, on, type Motion, type Panel, type Scene, type Show, type V3 } from '../kit.ts';
import { CORAL, CREAM, INK, SUN } from '../recipes.ts';
import { bush, shadeTree, shopper, tone, MINT, LEAF } from './promenade.ts';
import { EARTH, INDIGO, PICKET, ROOF, land, view } from './laneView.ts';

const UP: V3 = [0, 1, 0], WOOD = '#9b7a5c', WALL = '#fbeed3', BOND = '#fbf7ee', PENCIL = '#5a7fb5', TEAL = '#2f7f86';
type Extra = Partial<Panel>;
const sheet = (id: string, c: string, o: V3, u: V3, v: V3, w: number, h: number, x: Extra = {}): Panel => ({ id, stock: 'cover', c, o, u, v, w, h, edge: 'cut', ...x });
// A sheet standing square to the camera, its bottom-left corner at [x, y, z].
const front = (id: string, x: number, y: number, z: number, w: number, h: number, c: string, e: Extra = {}) => sheet(id, c, [x, y, z], [1, 0, 0], UP, w, h, e);
// A sheet lying flat, seen from above, from x to x + w and from z (its near edge) back by d.
const flat = (id: string, x: number, z: number, w: number, d: number, c: string, y = .6, e: Extra = {}) => sheet(id, c, [x, y, z], [1, 0, 0], [0, 0, -1], w, d, e);
// A sheet standing in a plane that runs front to back at `x`, facing right (+1) or left (-1), from z back by d.
const flank = (id: string, x: number, y: number, z: number, d: number, h: number, c: string, face: 1 | -1, e: Extra = {}) => sheet(id, c, [x, y, face > 0 ? z : z - d], [0, 0, face > 0 ? -1 : 1], UP, d, h, e);
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// The far face of a sheet that turns over: its own colour and print, read the right way round once it faces the camera.
const reverse = (p: Panel, c: string, print?: string): Panel => { const n = cross(p.u, p.v); return { ...p, id: `${p.id}-back`, c, print, o: add(add(p.o, p.u, p.w), n, -.6 / Math.hypot(...n)), u: [-p.u[0], -p.u[1], -p.u[2]] }; };
// A slide given in the world's own directions, turned into the sheet's (Motion.slide runs along u, v and the normal).
const slide = (p: Panel, by: V3): V3 => { const n = cross(p.u, p.v), dot = (a: V3) => a[0] * by[0] + a[1] * by[1] + a[2] * by[2], l = (a: V3) => Math.hypot(...a); return [dot(p.u) / l(p.u), dot(p.v) / l(p.v), dot(n) / l(n)]; };
const text = (cx: number, y: number, t: string, size: number, fill: string) => `<text x="${cx}" y="${y}" font-family="Fredoka" font-weight="600" font-size="${size}" fill="${fill}" text-anchor="middle">${t}</text>`;
const lines = (w: number, h: number, c: string, gap = 13, sw = 1.4) => `<path d="${Array.from({ length: Math.floor(h / gap) }, (_, i) => `M0 ${(i + 1) * gap}H${w}`).join('')}" stroke="${c}" stroke-width="${sw}"/>`;
// Roof tiles: courses of rounded tiles, every other course shifted, in two tones of the roof's colour.
const tiles = (w: number, h: number, c: string) => { let o = `<rect width="${w}" height="${h}" fill="${c}"/>`; for (let row = 0, y = 0; y < h; row++, y += 15) for (let x = row % 2 ? -11 : 0; x < w; x += 22) o += `<path d="M${x} ${y}H${x + 21}V${y + 9}a10.5 6 0 0 1 -21 0Z" fill="${(x * 7 + row * 13) % 5 < 2 ? tone(c, .1) : tone(c, -.07)}"/>`; return o; };
// Pictures used instead of words: a price tag (for sale), a key (for rent), a house, a plot of land, a warehouse.
const ICON = {
  tag: (c: string) => `<path d="M0 9L9 0H24V18H9Z" fill="${c}"/><circle cx="8" cy="9" r="2.6" fill="#000" fill-opacity=".28"/>`,
  key: (c: string) => `<circle cx="7" cy="9" r="7" fill="${c}"/><circle cx="7" cy="9" r="2.8" fill="#000" fill-opacity=".28"/><path d="M13 7H26V11H23V15H20V11H13Z" fill="${c}"/>`,
  house: (c: string, roof: string) => `<path d="M3 11H21V22H3Z" fill="${c}"/><path d="M0 12L12 1L24 12Z" fill="${roof}"/><rect x="10" y="15" width="5" height="7" fill="${roof}"/>`,
  land: () => `<path d="M0 22L4 13H22L26 22Z" fill="#8fc878"/><path d="M4 13H22" stroke="#6fae5c" stroke-width="1.6"/><rect x="12" y="2" width="2" height="14" fill="${WOOD}"/><path d="M14 2L23 5.5L14 9Z" fill="${CORAL}"/>`,
  shed: () => `<path d="M0 22V10Q13 0 26 10V22Z" fill="#b9c4cf"/><rect x="7" y="12" width="12" height="10" fill="#6b7480"/><path d="M7 15H19M7 18H19" stroke="#8f99a5" stroke-width="1"/>`
};
const icon = (svg: string, x: number, y: number, k: number) => `<g transform="translate(${x} ${y}) scale(${k})">${svg}</g>`;
// A window: frame, two lights and a glazing bar, with a shutter either side.
const windowAt = (x: number, y: number, w: number, h: number, shut: string) => `<rect x="${x - 13}" y="${y}" width="11" height="${h}" fill="${shut}"/><rect x="${x + w + 2}" y="${y}" width="11" height="${h}" fill="${shut}"/>${lines(0, 0, shut)}` +
  [x - 13, x + w + 2].map(sx => `<path d="${Array.from({ length: Math.floor(h / 7) }, (_, i) => `M${sx + 1.5} ${y + 4 + i * 7}h8`).join('')}" stroke="${tone(shut, -.25)}" stroke-width="1.6"/>`).join('') +
  `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" fill="#fffaf0"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8fc1d9"/><path d="M${x} ${y + h * .55}L${x + w * .5} ${y}H${x + w * .8}L${x} ${y + h * .9}Z" fill="#b7dcec"/><path d="M${x + w / 2} ${y}V${y + h}M${x} ${y + h / 2}H${x + w}" stroke="#fffaf0" stroke-width="3"/><rect x="${x - 6}" y="${y + h + 3}" width="${w + 12}" height="5" fill="#fffaf0"/>`;
const doorAt = (x: number, y: number, w: number, h: number, c: string) => `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 4}" fill="#fffaf0"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><rect x="${x + 6}" y="${y + 8}" width="${w - 12}" height="${h * .34}" rx="2" fill="${tone(c, .16)}"/><rect x="${x + 6}" y="${y + h * .5}" width="${w - 12}" height="${h * .4}" rx="2" fill="${tone(c, -.14)}"/><circle cx="${x + w - 8}" cy="${y + h * .52}" r="2.8" fill="${SUN}"/>`;

/* ---------- the plot: the pop-up house and what lies about a plot before it is built on ---------- */
const PLOT = { x: -400, w: 200, z: -72, d: 100, h: 120, gable: 46 };
function plot(): Panel[] {
  const { x, w, z, d, h, gable } = PLOT, back = z - d, laid: Show = { toy: 'build', at: [1, 2, 3, 4], fold: true }, pent = `<path d="M0 ${gable}L${d / 2} 0L${d} ${gable}V${h + gable}H0Z" fill="#fff"/>`;
  const rise = (p: Panel, delay: number): Panel => ({ ...p, show: laid, phantom: true, motion: { toy: 'build', at: [1, 2], slide: slide(p, [0, -(p.h + 4), 0]), spring: true, delay } });
  // The inside of the sheet is the drawing: plain bond with the plan in pencil, fold lines dashed, a glue tab marked.
  const pencil = (svg: string) => `<g fill="none" stroke="${PENCIL}" stroke-width="1.8" stroke-linecap="round">${svg}</g>`;
  const grid = (gw: number, gh: number) => `<path d="${Array.from({ length: Math.floor(gw / 20) }, (_, i) => `M${(i + 1) * 20} 0V${gh}`).join('')}${Array.from({ length: Math.floor(gh / 20) }, (_, i) => `M0 ${(i + 1) * 20}H${gw}`).join('')}" stroke="${PENCIL}" stroke-opacity=".16" stroke-width="1"/>`;
  const face = `<rect width="${w}" height="${h}" fill="#e6eef2"/>${lines(w, h, '#cfdde4')}<rect y="${h - 12}" width="${w}" height="12" fill="#b9c9d2"/>${windowAt(26, 34, 38, 40, MINT)}${windowAt(w - 64, 34, 38, 40, MINT)}${doorAt(w / 2 - 20, h - 82, 40, 82, TEAL)}`;
  const side = `<rect width="${d}" height="${h + gable}" fill="#d5e0e6"/>${lines(d, h + gable, '#c2d1d9')}<circle cx="${d / 2}" cy="${gable * .72}" r="9" fill="#8fc1d9" stroke="#fffaf0" stroke-width="3"/>`;
  const out: Panel[] = [
    flat('net-floor', x, z, w, d, BOND, .9, { stock: 'bond', show: laid, print: grid(w, d) + pencil(`<rect x="6" y="6" width="${w - 12}" height="${d - 12}"/><path d="M${w * .56} 6V${d * .6}H${w - 6}M6 ${d * .52}H${w * .3}M${w * .3} ${d * .52}v-14"/><path d="M${w * .42} ${d - 6}a16 16 0 0 1 16 -16" stroke-dasharray="4 4"/>`) + `<circle cx="${w - 26}" cy="24" r="12" fill="none" stroke="${PENCIL}" stroke-width="1.6"/><path d="M${w - 26} 30V16l-4 5m4 -5l4 5" stroke="${PENCIL}" stroke-width="1.6" fill="none"/>` }),
    sheet('net-front-in', BOND, [x + w, .7, z], [-1, 0, 0], [0, 0, 1], w, h, { stock: 'bond', show: laid, phantom: true, motion: { toy: 'build', at: [2, 3, 4], edge: 'bottom', deg: -90, spring: true }, print: grid(w, h) + pencil(`<rect x="${w / 2 - 20}" y="${h - 82}" width="40" height="82"/><rect x="26" y="34" width="38" height="40"/><rect x="${w - 64}" y="34" width="38" height="40"/><path d="M0 ${h - 1}H${w}" stroke-dasharray="7 5"/>`) }),
    front('net-front', x, 0, z, w, h, '#e6eef2', { show: laid, phantom: true, motion: { toy: 'build', at: [0, 1], edge: 'bottom', deg: -90, spring: true }, print: face }),
    rise(front('net-back', x, 0, back, w, h, BOND, { stock: 'bond', print: grid(w, h) }), 60),
    rise(sheet('net-left-in', BOND, [x, 0, z], [0, 0, -1], UP, d, h + gable, { stock: 'bond', mask: pent, print: grid(d, h + gable) }), 0), rise(sheet('net-left', '#d5e0e6', [x, 0, back], [0, 0, 1], UP, d, h + gable, { mask: pent, print: side }), 0),
    rise(sheet('net-right-in', BOND, [x + w, 0, back], [0, 0, 1], UP, d, h + gable, { stock: 'bond', mask: pent, print: grid(d, h + gable) }), 120), rise(sheet('net-right', '#d5e0e6', [x + w, 0, z], [0, 0, -1], UP, d, h + gable, { mask: pent, print: side }), 120)
  ];
  // The roof is folded on its own and put on last, from above; a pennant goes up on its ridge.
  const run = d / 2 + 10, up = gable * run / (d / 2), len = Math.hypot(run, up);
  out.push(sheet('net-roof', ROOF, [x - 12, h - gable * 10 / (d / 2), z + 10], [1, 0, 0], [0, up / len, -run / len], w + 24, len, { show: { toy: 'build', at: [4], drop: 150, fold: true }, phantom: true, print: tiles(w + 24, len, ROOF) + `<rect width="${w + 24}" height="6" fill="${tone(ROOF, -.25)}"/>` }));
  out.push(front('net-flag', x + w / 2 - 3, h + gable - 4, z - d / 2, 30, 34, MINT, { mask: '<path d="M0 0H4V34H0ZM4 2L30 9L4 16Z" fill="#fff"/>', print: `<rect width="4" height="34" fill="${WOOD}"/>`, show: { toy: 'build', at: [4], drop: 190, fold: true }, phantom: true }));
  // Survey stakes at the corners with a string line and pennants along the front.
  for (const [i, sx, sz] of [[0, x - 50, z + 112], [1, x + w + 50, z + 112], [2, x - 50, back - 30], [3, x + w + 50, back - 30]] as const) out.push(...box({ id: `stake-${i}`, x: sx, z: sz, w: 7, h: 38, d: 7, stock: 'greyboard', c: WOOD, top: `<rect width="7" height="7" fill="${CORAL}"/>` }));
  out.push(front('plot-string', x - 50, 22, z + 112, w + 100, 16, CORAL, { density: 2, mask: `<rect width="${w + 100}" height="1.6" fill="#fff"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${14 + i * 34} 1L${24 + i * 34} 1L${19 + i * 34} 15Z" fill="#fff"/>`).join('')}`, print: `<rect width="${w + 100}" height="1.6" fill="#8b6a4c"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${14 + i * 34} 1L${24 + i * 34} 1L${19 + i * 34} 15Z" fill="${[CORAL, SUN, MINT][i % 3]}"/>`).join('')}` }));
  // A heap of sand (two crossed cards), a stack of bricks and a wheelbarrow.
  const heap = '<path d="M0 46Q10 30 26 20Q40 4 52 16Q70 22 84 46Z" fill="#fff"/>', sand = (id: string, u: V3, o: V3): Panel => sheet(id, '#e6cf9a', o, u, UP, 84, 46, { stock: 'sugar', mask: heap, print: '<path d="M26 20Q40 4 52 16Q46 26 30 30Z" fill="#f1dfb4"/><path d="M52 16Q70 22 84 46H50Z" fill="#d6bd84"/>' });
  out.push(sand('sand-a', [1, 0, 0], [-250, 0, -150]), sand('sand-b', [.5, 0, -.87], [-229, 0, -114]));
  for (const [i, bx, bz, by, rot] of [[0, -168, 14, 0, 8], [1, -180, -14, 0, -6], [2, -172, 2, 20, 14]] as const) out.push(...box({ id: `brick-${i}`, x: bx, z: bz, y: by, w: 44, h: 20, d: 24, rot, stock: 'sugar', c: '#c8704a', front: '<path d="M0 10H44M22 0V10M11 10V20M33 10V20" stroke="#a9553a" stroke-width="1.6"/>', top: '<path d="M22 0V24M0 12H44" stroke="#a9553a" stroke-width="1.4"/>' }));
  out.push(...box({ id: 'barrow', x: -486, z: 30, y: 16, w: 62, h: 24, d: 36, rot: -14, stock: 'cover', c: '#3f8f6a', side: '#35795a', noTop: true, front: '<rect width="62" height="4" fill="#57b388"/>' }),
    sheet('barrow-load', EARTH, [-514, 36, 44], [.97, 0, .24], [.24, 0, -.97], 54, 28, { stock: 'sugar', print: '<circle cx="14" cy="10" r="5" fill="#bf9668"/><circle cx="36" cy="16" r="6" fill="#dcbc92"/>' }),
    front('barrow-wheel', -470, 0, 49, 24, 24, '#2b2f36', { mask: '<circle cx="12" cy="12" r="12" fill="#fff"/>', print: `<circle cx="12" cy="12" r="6" fill="#8f99a5"/><circle cx="12" cy="12" r="2.4" fill="#2b2f36"/>` }),
    front('barrow-legs', -526, 0, 40, 86, 40, '#2b2f36', { mask: '<path d="M0 8L44 26H86V32H42L10 20V40H5V16L0 14Z" fill="#fff"/>' }));
  return out;
}

/* ---------- the house on the market, its yard and its tree ---------- */
const HOUSE = { x: 70, w: 240, z: -110, d: 120, h: 290, floor: 150 };
function house(): Panel[] {
  const { x, w, z, d, h, floor } = HOUSE, back = z - d, hw = w / 2, opens = (edge: 'left' | 'right', deg: number): Motion => ({ toy: 'door', at: [1], edge, deg, spring: true });
  const wall = (ww: number, hh: number, c: string) => `<rect width="${ww}" height="${hh}" fill="${c}"/>${lines(ww, hh, tone(c, -.07))}<rect y="${hh - 16}" width="${ww}" height="16" fill="${tone(c, -.2)}"/><rect y="${hh - floor - 6}" width="${ww}" height="7" fill="#fffaf0"/>`;
  // Each leaf: an upstairs and a downstairs window with indigo shutters; the door is on the right leaf by the seam.
  const leafL = front('leaf-l', x, 0, z, hw, h, WALL, { phantom: true, motion: opens('left', -100), print: wall(hw, h, WALL) + windowAt(34, 46, 52, 60, INDIGO) + windowAt(34, 188, 52, 60, INDIGO) });
  const leafR = front('leaf-r', x + hw, 0, z, hw, h, WALL, { phantom: true, motion: opens('right', 100), print: wall(hw, h, WALL) + windowAt(40, 46, 52, 60, INDIGO) + doorAt(10, h - 108, 48, 108, TEAL) + `<rect x="74" y="${h - 86}" width="26" height="34" rx="3" fill="#fffaf0"/>${icon(ICON.house(INDIGO, ROOF), 78, h - 80, .75)}` });
  // The same windows from indoors: the light through them, a frame, and a curtain drawn to each side.
  const inner = (wx: number, wy: number) => `<rect x="${wx - 4}" y="${wy - 4}" width="60" height="68" fill="#fffaf0"/><rect x="${wx}" y="${wy}" width="52" height="60" fill="#d6ecf5"/><path d="M${wx + 26} ${wy}V${wy + 60}M${wx} ${wy + 30}H${wx + 52}" stroke="#fffaf0" stroke-width="3"/><path d="M${wx - 6} ${wy - 8}H${wx + 58}V${wy - 2}H${wx - 6}Z" fill="${WOOD}"/><path d="M${wx - 4} ${wy - 2}h16q2 34 -16 62Z M${wx + 56} ${wy - 2}h-16q-2 34 16 62Z" fill="${CORAL}" fill-opacity=".85"/>`;
  // Glued on, a little proud of the leaves: flower boxes under the upstairs windows, a hood over the door, a lamp.
  const bloom = (id: string, p: Panel, bx: number) => [on(p, 5, bx, h - 122, 64, 14, { id: `${id}-box`, stock: 'sugar', c: '#c8915a' }), on(p, 8, bx + 2, h - 112, 60, 22, { id: `${id}-bloom`, stock: 'sugar', c: LEAF, mask: `<path d="M0 22Q2 6 12 8Q18 0 28 6Q38 0 46 7Q58 4 60 22Z" fill="#fff"/>`, print: [8, 20, 31, 43, 53].map((cx, i) => `<circle cx="${cx}" cy="${9 + (i % 2) * 5}" r="4.5" fill="${[CORAL, '#e88ab0', SUN, CREAM, CORAL][i]}"/>`).join('') })];
  const hood = on(leafR, 7, 2, 110, 64, 20, { id: 'door-hood', stock: 'cover', c: INDIGO, mask: '<path d="M0 20L8 0H56L64 20Z" fill="#fff"/>', print: `<path d="M0 20L8 0H56L64 20Z" fill="${INDIGO}"/><path d="M16 0L12 20M32 0V20M48 0L52 20" stroke="${CREAM}" stroke-width="5"/>` });
  const lamp = on(leafL, 6, hw - 22, 96, 14, 24, { id: 'door-lamp', stock: 'vellum', c: '#ffe7a8', emit: .5, mask: '<path d="M3 0H11L14 5V20L11 24H3L0 20V5Z" fill="#fff"/>', print: '<rect width="14" height="4" fill="#3d444e"/><rect y="20" width="14" height="4" fill="#3d444e"/>' });
  // Inside: four rooms on the back wall, each papered its own way, and the furniture that stands up as it opens.
  const room = (rx: number, ry: number, rw: number, rh: number, c: string, extra: string) => `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${c}"/><g transform="translate(${rx} ${ry})">${extra}</g><rect x="${rx}" y="${ry + rh - 9}" width="${rw}" height="9" fill="${tone(c, -.2)}"/>`;
  const stripes = (rw: number, rh: number, c: string) => `<path d="${Array.from({ length: Math.floor(rw / 14) }, (_, i) => `M${7 + i * 14} 0V${rh}`).join('')}" stroke="${c}" stroke-width="5"/>`;
  const tile = (rw: number, rh: number, c: string) => `<path d="${Array.from({ length: Math.floor(rw / 15) }, (_, i) => `M${(i + 1) * 15} ${rh * .45}V${rh}`).join('')}${Array.from({ length: 4 }, (_, i) => `M0 ${rh * .45 + i * 15}H${rw}`).join('')}" stroke="${c}" stroke-width="1.6"/>`;
  const up = h - floor, backPrint = room(0, 0, hw - 3, up - 4, '#d9cfee', stripes(hw - 3, up - 4, '#cdc1e6') + `<rect x="38" y="26" width="44" height="46" fill="#fffaf0"/><rect x="42" y="30" width="36" height="38" fill="#8fc1d9"/><path d="M60 30V68M42 49H78" stroke="#fffaf0" stroke-width="3"/>`) +
    room(hw + 3, 0, hw - 3, up - 4, '#cfe7ef', tile(hw - 3, up - 4, '#a9cfdc') + `<circle cx="84" cy="34" r="15" fill="#fffaf0"/><circle cx="84" cy="34" r="11" fill="#b7dcec"/>`) +
    room(0, up + 4, hw - 3, floor - 4, '#f6dfa0', `<rect x="20" y="20" width="40" height="30" fill="#fffaf0"/><rect x="24" y="24" width="32" height="22" fill="#8fc878"/><path d="M24 46L36 32L44 40L50 34L56 46Z" fill="#4f9e66"/><circle cx="48" cy="29" r="3" fill="${SUN}"/>`) +
    room(hw + 3, up + 4, hw - 3, floor - 4, '#cdebd8', tile(hw - 3, floor - 4, '#a8d6bb') + `<rect x="18" y="16" width="62" height="8" fill="${WOOD}"/>${[24, 40, 56, 70].map((cx, i) => `<rect x="${cx}" y="${24}" width="3" height="${[14, 10, 16, 12][i]}" fill="#6b7480"/><circle cx="${cx + 1.5}" cy="${[42, 37, 44, 40][i]}" r="${[6, 4.5, 5, 5.5][i]}" fill="${[CORAL, SUN, '#8f99a5', MINT][i]}"/>`).join('')}`) +
    `<rect x="${hw - 3}" width="6" height="${h}" fill="#fffaf0"/><rect y="${up - 4}" width="${w}" height="8" fill="#fffaf0"/>`;
  const planks = (pw: number, pd: number, c: string) => `<rect width="${pw}" height="${pd}" fill="${c}"/><path d="${Array.from({ length: Math.floor(pd / 17) }, (_, i) => `M0 ${(i + 1) * 17}H${pw}`).join('')}" stroke="${tone(c, -.16)}" stroke-width="1.6"/>`;
  const pops: [string, number, number, number, number, string, string, string][] = [
    ['sofa', x + 18, 0, 82, 56, '#7c6be0', '<path d="M4 56V26Q4 8 20 8H62Q78 8 78 26V56H70V50H12V56Z M0 30Q0 22 8 22V50H0Z M82 30Q82 22 74 22V50H82Z" fill="#fff"/>', `<rect width="82" height="56" fill="#7c6be0"/><rect x="12" y="30" width="58" height="14" rx="4" fill="#9a8cf0"/><path d="M41 12V30" stroke="#6a59cf" stroke-width="2"/><rect y="22" width="9" height="28" fill="#6a59cf"/><rect x="73" y="22" width="9" height="28" fill="#6a59cf"/>`],
    ['table', x + 148, 0, 74, 62, WOOD, '<path d="M8 24H66V30H60V62H55V30H19V62H14V30H8Z M0 62V10H6V34H12V40H6V62Z M74 62V10H68V34H62V40H68V62Z M30 24V10Q37 2 44 10V24Z" fill="#fff"/>', `<rect width="74" height="62" fill="${WOOD}"/><rect x="8" y="24" width="58" height="6" fill="#c9a37c"/><path d="M30 24V10Q37 2 44 10V24Z" fill="${CORAL}"/><path d="M33 14h8" stroke="${CREAM}" stroke-width="2"/>`],
    ['bed', x + 16, floor, 88, 50, CORAL, '<path d="M0 50V6H8V26H80Q88 26 88 34V50H82V44H6V50Z" fill="#fff"/>', `<rect width="88" height="50" fill="${WOOD}"/><rect x="8" y="26" width="80" height="18" fill="${CORAL}"/><rect x="8" y="26" width="80" height="5" fill="#fffaf0"/><rect x="10" y="17" width="24" height="11" rx="4" fill="#fffaf0"/><path d="M44 34h36M44 39h28" stroke="#f2866a" stroke-width="2.4"/>`],
    ['bath', x + 150, floor, 72, 54, '#fffaf0', '<path d="M4 20H68Q72 20 72 24V34Q72 48 58 48V54H52V48H20V54H14V48Q0 48 0 34V24Q0 20 4 20Z M56 20V4Q56 0 60 0H66V5H61V20Z" fill="#fff"/><circle cx="20" cy="15" r="7" fill="#fff"/><circle cx="32" cy="12" r="5" fill="#fff"/><circle cx="42" cy="16" r="6" fill="#fff"/>', `<rect width="72" height="54" fill="#fffaf0"/><rect y="20" width="72" height="6" fill="#e3e9ee"/><circle cx="20" cy="15" r="7" fill="#d6ecf5"/><circle cx="32" cy="12" r="5" fill="#eaf5fa"/><circle cx="42" cy="16" r="6" fill="#d6ecf5"/><rect x="56" width="10" height="5" fill="#8f99a5"/><rect x="56" width="5" height="20" fill="#8f99a5"/>`]];
  const out: Panel[] = [
    flat('house-floor', x, z, w, d, '#c58c4d', .8, { emit: .3, print: planks(w, d, '#c58c4d') }), front('house-back', x, 0, back, w, h, '#d9cfee', { emit: .45, print: backPrint }),
    flat('house-upper', x, z, w, d, '#b98450', floor, { emit: .4, print: planks(w, d, '#b98450') }), front('house-upper-edge', x, floor - 9, z - 1, w, 9, '#fffaf0'),
    flank('house-left-in', x + 1.2, 0, z, d, h, '#eadfc8', 1, { emit: .5, print: `<rect y="${up - 4}" width="${d}" height="8" fill="#fffaf0"/>` }), flank('house-right-in', x + w - 1.2, 0, z, d, h, '#eadfc8', -1, { emit: .5, print: `<rect y="${up - 4}" width="${d}" height="8" fill="#fffaf0"/>` }),
    flank('house-left', x, 0, z, d, h, tone(WALL, -.06), -1, { print: wall(d, h, tone(WALL, -.06)) }), flank('house-right', x + w, 0, z, d, h, tone(WALL, -.06), 1, { print: wall(d, h, tone(WALL, -.06)) }),
    leafL, { ...reverse(leafL, '#f3e7cf', inner(hw - 86, 46) + inner(hw - 86, 188) + `<rect y="${up - 4}" width="${hw}" height="8" fill="#fffaf0"/>`), emit: .62, motion: opens('right', -100) },
    leafR, { ...reverse(leafR, '#f3e7cf', inner(hw - 92, 46) + `<rect x="${hw - 58}" y="${h - 108}" width="48" height="108" fill="${tone(TEAL, .2)}"/><rect y="${up - 4}" width="${hw}" height="8" fill="#fffaf0"/>`), emit: .62, motion: opens('left', 100) },
    ...bloom('bloom-l', leafL, 28), ...bloom('bloom-r', leafR, 34), hood, lamp,
    // The roof: one tiled slope toward the lane, a ridge cap, the gables' ends, and a chimney.
    sheet('house-roof', ROOF, [x - 16, h - 9, z + 14], [1, 0, 0], [0, .5, -.866], w + 32, 154, { print: tiles(w + 32, 154, ROOF) + `<rect width="${w + 32}" height="7" fill="${tone(ROOF, -.25)}"/>` }),
    front('house-eave', x - 16, h - 15, z + 14.5, w + 32, 8, '#fffaf0'),
    ...box({ id: 'chimney', x: x + w - 46, z: z - 70, y: h + 40, w: 26, h: 50, d: 22, stock: 'sugar', c: '#b5694c', front: '<rect width="26" height="7" fill="#8f4e36"/><path d="M0 22H26M0 36H26M13 7V22M7 22V36M19 22V36" stroke="#8f4e36" stroke-width="1.4"/>' }),
    ...pops.map(([id, px, py, pw, ph, c, mask, print], i) => front(`pop-${id}`, px, py, z - 56 + i * 4, pw, ph, c, { mask, print, emit: .3, motion: { toy: 'door', at: [0], edge: 'bottom', deg: 90, spring: true, delay: 160 + i * 80 }, phantom: true }))
  ];
  // The yard: a picket fence along the lane with a gate that opens for him, and the board that turns over.
  const pickets = (fw: number, fh: number) => `${Array.from({ length: Math.floor(fw / 15) }, (_, i) => `<path d="M${i * 15 + 2} ${fh}V7L${i * 15 + 7} 0L${i * 15 + 12} 7V${fh}Z" fill="#fff"/>`).join('')}<rect y="${fh * .32}" width="${fw}" height="6" fill="#fff"/><rect y="${fh * .72}" width="${fw}" height="6" fill="#fff"/>`;
  const fence = (id: string, fx: number, fw: number): Panel => front(id, fx, 0, 50, fw, 42, PICKET, { mask: pickets(fw, 42), density: 1.6 });
  const gate = front('gate', 150, 0, 50, 80, 38, '#f1d9a6', { mask: pickets(80, 38), density: 1.8, phantom: true, print: `<rect width="80" height="38" fill="#f1d9a6"/><path d="M2 34L78 14" stroke="#d9bb7e" stroke-width="5"/>`, motion: { toy: 'gate', at: [1], edge: 'left', deg: 100, spring: true } });
  const board = front('board', 338, 84, 16.4, 104, 64, CORAL, { phantom: true, density: 3, print: `<rect width="104" height="64" fill="${CORAL}"/><rect x="4" y="4" width="96" height="56" fill="none" stroke="#fffaf0" stroke-width="2.5"/>${icon(ICON.tag('#fffaf0'), 38, 9, 1.15)}${text(52, 52, 'FOR SALE', 17, '#fffaf0')}`, motion: { toy: 'board', at: [1], edge: 'mid', deg: 180, spring: true } });
  out.push(fence('fence-l', -60, 210), fence('fence-r', 230, 180), gate, ...['a', 'b', 'c', 'd'].flatMap((k, i) => box({ id: `fence-post-${k}`, x: [-60, 146, 234, 410][i], z: 50, w: 10, h: 50, d: 10, stock: 'cover', c: PICKET, top: `<rect width="10" height="10" fill="${INDIGO}"/>` })),
    ...box({ id: 'board-post', x: 390, z: 10, w: 9, h: 150, d: 9, stock: 'greyboard', c: WOOD }), board,
    { ...reverse(board, INDIGO, `<rect width="104" height="64" fill="${INDIGO}"/><rect x="4" y="4" width="96" height="56" fill="none" stroke="#fffaf0" stroke-width="2.5"/>${icon(ICON.key('#fffaf0'), 37, 9, 1.15)}${text(52, 52, 'FOR RENT', 17, '#fffaf0')}`), motion: board.motion },
    // Two pots by the door and a bush in the corner of the yard.
    ...box({ id: 'pot-a', x: 98, z: -84, w: 26, h: 24, d: 26, stock: 'sugar', c: '#c8704a', top: '<rect x="3" y="3" width="20" height="20" fill="#6b4a33"/>' }), ...bush('pot-a-plant', 98, -84, 46, 40, 22),
    ...bush('yard-bush', 350, -80, 96, 62));
  // The mango tree, its crown over the lane and clear of the upstairs rooms; fruit glued among the leaves.
  const tree = shadeTree('mango', -40, 4, 150).filter(p => !/leaves[13]$/.test(p.id)).map(p => (p.id === 'mango-trunk' ? p : { ...p, o: add(p.o, [-6, 0, 20]) as V3 }));
  out.push(...tree, ...tree.filter(p => /leaves[024]/.test(p.id)).flatMap((p, i) => [0, 1].map(k => on(p, 2, p.w * (.3 + k * .34), p.h * (.18 + (i + k) % 2 * .2), 13, 18, { id: `${p.id}-fruit${k}`, stock: 'sugar', c: '#f0a51e', mask: '<path d="M6.5 0Q13 6 12 12Q11 18 6.5 18Q1 18 1 11Q1 5 6.5 0Z" fill="#fff"/>', print: '<path d="M4 4Q8 7 8 14" stroke="#f7c861" stroke-width="2.4" fill="none"/>' }))));
  // The fallen ones: each a crossed pair, so it has a body from any side.
  const fallen = '<path d="M10 0Q20 8 18 17Q16 24 9 24Q1 24 1 15Q2 7 10 0Z" fill="#fff"/>';
  for (const [i, mx, mz] of [[0, -84, 112], [1, -46, 130], [2, -18, 104]] as const) { const show: Show = { toy: 'mango', at: [1, 2, 3].slice(i), drop: 170 }; out.push(front(`mango-${i}`, mx - 10, 0, mz, 20, 24, '#f0a51e', { stock: 'sugar', mask: fallen, show, density: 3, print: '<path d="M6 5Q12 9 12 19" stroke="#f7c861" stroke-width="3" fill="none"/><path d="M9 1l4 -1" stroke="#4f9e66" stroke-width="2"/>' }), sheet(`mango-${i}-x`, '#e0941a', [mx, 0, mz + 10], [0, 0, -1], UP, 20, 24, { stock: 'sugar', mask: fallen, show, density: 2 })); }
  return out;
}
// A hen folded like a tent along her back, with the comb, wing, beak and eye glued on.
function hen(id: string, x: number, z: number, c: string, k = 1, flip = false): Panel[] {
  const L = 40 * k, H = 34 * k, sx = (v: number) => (flip ? 40 - v : v);
  const body = `<g transform="scale(${k})"><path d="M${sx(2)} 14Q${sx(0)} 4 ${sx(8)} 8Q${sx(12)} 18 ${sx(22)} 16Q${sx(26)} 6 ${sx(31)} 4Q${sx(38)} 4 ${sx(37)} 12L${sx(40)} 14L${sx(36)} 16Q${sx(36)} 26 ${sx(24)} 28L${sx(25)} 34H${sx(21)}L${sx(20)} 28Q${sx(8)} 28 ${sx(2)} 14Z" fill="#fff"/></g>`;
  const near = sheet(`${id}`, c, [x - L / 2, 0, z + 7 * k], [1, 0, 0], [0, .98, -.2], L, H, { stock: 'sugar', mask: body, density: 3, edge: 'fold' });
  const g = (n: string, px: number, py: number, w: number, hh: number, col: string, m: string) => on(near, .8, (flip ? 40 - px - w : px) * k, py * k, w * k, hh * k, { id: `${id}-${n}`, stock: 'sugar', c: col, density: 3, mask: `<g transform="scale(${k}) ${flip ? `translate(${w} 0) scale(-1 1)` : ''}">${m}</g>` });
  return [near, { ...sheet(`${id}-far`, c, [x + L / 2, 0, z - 7 * k], [-1, 0, 0], [0, .98, .2], L, H, { stock: 'sugar', mask: body, density: 1 }), ghost: true },
    g('wing', 11, 10, 15, 10, tone(c, -.16), '<path d="M0 3Q8 -2 15 4Q10 11 2 9Z" fill="#fff"/>'), g('comb', 28, 28, 8, 6, '#d8322f', '<path d="M0 6Q0 0 3 3Q4 0 6 3Q8 1 8 6Z" fill="#fff"/>'),
    g('beak', 36, 18, 5, 4, SUN, '<path d="M0 0L5 2L0 4Z" fill="#fff"/>'), g('eye', 32, 22, 3, 3, INK, '<circle cx="1.5" cy="1.5" r="1.5" fill="#fff"/>'), g('tail', 0, 20, 9, 10, tone(c, -.24), '<path d="M9 10Q0 8 1 0Q7 2 9 6Z" fill="#fff"/>')];
}

/* ---------- the agent's office: a shophouse ---------- */
const OFFICE = { x: 450, w: 300, h: 300 };
function office(): Panel[] {
  const { x, w, h } = OFFICE, win = { x: 128, y: h - 160, w: 104, h: 98 }, PLASTER = '#f4f1ea';
  // The listings board: a framed board under a little roof, the mark once on its header, one card for each listing.
  const bx = x + 12, by = 180, card = (id: string, cx: number, c: string, art: string, show: Show) => front(id, cx, by + 8, 5, 44, 58, c, { stock: 'bond', show, density: 3, print: `<rect width="44" height="58" fill="#fffaf0"/><rect x="3" y="3" width="38" height="30" fill="${c}"/>${art}<path d="M6 40H38M6 46H30M6 52H34" stroke="#c9bfae" stroke-width="2.4"/>` });
  const mark = `<g fill="#fffaf0"><path d="M0 16V6L7 0L14 6V16H9V10H5V16Z"/><path d="M16 16V6L23 0L30 6V16H25V10H21V16Z"/></g>`;
  const agentParts = shopper('agent', x + win.x + 40, -16, { coat: INDIGO, legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', build: 'big', face: 'shout', tache: '#2b2622', lift: 26 }, false, 1.02);
  const agent = agentParts[0];
  const picture = (id: string, n: number, art: string) => front(id, x + win.x + 50, 66, -6, 52, 46, '#fffaf0', { stock: 'bond', density: 3, emit: .25, show: { toy: 'ask', at: [n] }, print: `<rect width="52" height="46" fill="#fffaf0"/><rect x="2" y="2" width="48" height="42" fill="none" stroke="${INDIGO}" stroke-width="2.4"/>${art}` });
  const facade = `<rect width="${w}" height="${h}" fill="${PLASTER}"/>${lines(w, h, '#e6e1d6', 22)}<rect y="${h - 176}" width="${w}" height="22" fill="${INDIGO}"/><rect y="${h - 180}" width="${w}" height="5" fill="#fffaf0"/><rect y="${h - 18}" width="${w}" height="18" fill="#cfc9bb"/>` +
    doorAt(8, h - 124, 64, 124, INDIGO).replace(/<rect x="14" y="[\d.]+" width="52" height="[\d.]+" rx="2" fill="[^"]+"\/>/, `<rect x="14" y="${h - 116}" width="52" height="56" rx="2" fill="#b7dcec"/>`) +
    `<rect x="${win.x - 6}" y="${win.y - 6}" width="${win.w + 12}" height="${win.h + 12}" fill="#fffaf0"/>` + windowAt(196, 38, 62, 74, MINT) + `<rect x="24" y="26" width="46" height="12" rx="2" fill="#fffaf0"/>`;
  return [
    front('office-front', x, 0, 0, w, h, PLASTER, { mask: `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0Z M${win.x} ${win.y}V${win.y + win.h}H${win.x + win.w}V${win.y}Z" fill="#fff"/>`, print: facade }),
    front('office-inside', x + win.x - 8, 30, -44, win.w + 16, 140, '#6f6558', { print: `<rect width="${win.w + 16}" height="140" fill="#6f6558"/><rect x="10" y="12" width="46" height="36" fill="#fffaf0"/><rect x="14" y="16" width="38" height="28" fill="#a3d68b"/>${icon(ICON.house(CREAM, ROOF), 22, 20, .9)}<rect x="66" y="12" width="46" height="5" fill="${WOOD}"/>${[70, 80, 92, 102].map((kx, i) => `<rect x="${kx}" y="17" width="2" height="6" fill="#3d444e"/>${icon(ICON.key(SUN), kx - 4, 22, .5 + (i % 2) * .08)}`).join('')}` }),
    flank('office-left', x, 0, 0, 220, h, '#e6e1d6', -1, { print: `<rect width="220" height="${h}" fill="#e6e1d6"/>${lines(220, h, '#d9d3c6', 22)}<rect y="${h - 176}" width="220" height="22" fill="${tone(INDIGO, -.12)}"/><rect y="${h - 18}" width="220" height="18" fill="#bdb7a9"/>` }),
    // A parapet with a cornice instead of a pitched roof: a shophouse's flat top.
    ...box({ id: 'parapet', x: x + w / 2, z: -9, y: h, w: w + 12, h: 20, d: 30, stock: 'cover', c: PLASTER, front: `<rect width="${w + 12}" height="6" fill="#fffaf0"/><rect y="14" width="${w + 12}" height="6" fill="#cfc9bb"/>` }),
    front('pediment', x + w / 2 - 60, h + 20, 2, 120, 34, PLASTER, { mask: '<path d="M0 34V18Q60 -12 120 18V34Z" fill="#fff"/>', print: `<circle cx="60" cy="19" r="9" fill="${INDIGO}"/>` }),
    // The counter: a sill with the bell on it under a striped awning; the upstairs balcony with its pots.
    ...box({ id: 'sill', x: x + win.x + win.w / 2, z: 10, y: 54, w: win.w + 14, h: 8, d: 20, stock: 'greyboard', c: '#fffaf0' }),
    ...box({ id: 'bell-base', x: x + win.x + 26, z: 12, y: 62, w: 22, h: 4, d: 16, stock: 'greyboard', c: '#3d444e' }),
    front('bell', x + win.x + 14, 66, 13, 24, 18, SUN, { stock: 'cover', density: 3, mask: '<path d="M0 18Q0 4 12 4Q24 4 24 18Z" fill="#fff"/><circle cx="12" cy="3" r="3" fill="#fff"/>', print: '<path d="M5 16Q5 8 12 7" stroke="#fbd98a" stroke-width="3" fill="none"/><rect y="15" width="24" height="3" fill="#d9972b"/>' }),
    ...(() => { const v: V3 = [0, .5, -.866]; const a = sheet('awning', INDIGO, [x + win.x - 12, 150, 38], [1, 0, 0], v, win.w + 24, 44, { density: 1.6, print: Array.from({ length: 4 }, (_, i) => `<rect x="${i * 32 + 16}" width="16" height="44" fill="${CREAM}"/>`).join('') });
      return [a, front('awning-lip', x + win.x - 12, 136, 38.5, win.w + 24, 14, INDIGO, { density: 1.6, mask: `<path d="M0 0H${win.w + 24}V5${Array.from({ length: 8 }, () => 'a8 9 0 0 1 -16 0').join('')}Z" fill="#fff"/>`, print: Array.from({ length: 4 }, (_, i) => `<rect x="${i * 32 + 16}" width="16" height="14" fill="${CREAM}"/>`).join('') })]; })(),
    ...box({ id: 'balcony', x: x + 227, z: 16, y: 180, w: 110, h: 8, d: 32, stock: 'cover', c: '#fffaf0' }),
    front('balcony-rail', x + 172, 188, 31, 110, 40, '#fffaf0', { mask: `<rect width="110" height="5" fill="#fff"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${Math.min(i * 13.4, 106)}" width="4" height="40" fill="#fff"/>`).join('')}` }),
    ...box({ id: 'balcony-pot', x: x + 200, z: 14, y: 188, w: 22, h: 18, d: 20, stock: 'sugar', c: '#c8704a' }), ...bush('balcony-plant', x + 200, 14, 44, 34, 204),
    // The agent stands on a step behind the counter, and ducks below it when nobody has rung.
    ...agentParts.map((p, i) => (i ? p : { ...agent, phantom: true, motion: { toy: 'ask', at: [0], slide: slide(agent, [0, -112, 0]), spring: true } as Motion })),
    picture('ask-1', 1, icon(ICON.land(), 7, 6, 1.45)), picture('ask-2', 2, icon(ICON.house(INDIGO, ROOF), 9, 6, 1.45)), picture('ask-3', 3, icon(ICON.shed(), 7, 6, 1.45)),
    front('listings', bx, by, 2, 108, 96, WOOD, { print: `<rect width="108" height="96" fill="${WOOD}"/><rect width="108" height="24" fill="${INDIGO}"/><g transform="translate(39 4)">${mark}</g><rect x="5" y="27" width="98" height="64" fill="#e9dcc3"/>` }),
    front('listings-roof', bx - 6, by + 94, 10, 120, 12, ROOF, { mask: '<path d="M0 12L8 0H112L120 12Z" fill="#fff"/>' }),
    card('card-plot-land', bx + 8, '#a3d68b', icon(ICON.land(), 9, 7, 1), { toy: 'build', at: [0, 1, 2, 3] }), card('card-plot-house', bx + 8, '#dfe8ef', icon(ICON.house('#fffaf0', ROOF), 10, 7, 1), { toy: 'build', at: [4] }),
    card('card-house-sale', bx + 56, CORAL, icon(ICON.tag('#fffaf0'), 10, 9, 1), { toy: 'board', at: [0] }), card('card-house-rent', bx + 56, INDIGO, icon(ICON.key('#fffaf0'), 9, 9, 1), { toy: 'board', at: [1] }),
    // A wall lamp by the door and a doormat.
    front('office-lamp', x + 84, 150, 8, 16, 26, '#ffe7a8', { stock: 'vellum', emit: .5, mask: '<path d="M3 0H13L16 5V22L13 26H3L0 22V5Z" fill="#fff"/>', print: '<rect width="16" height="4" fill="#3d444e"/><rect y="22" width="16" height="4" fill="#3d444e"/>' }),
    flat('doormat', x + 12, 34, 60, 26, '#b5773f', .7, { stock: 'sugar', decal: 'ground', print: `<rect x="3" y="3" width="54" height="20" fill="none" stroke="#8a5530" stroke-width="2"/>` })
  ];
}

export function lane(): Scene {
  const post = front('post', -670, 0, 12, 120, 150, '#fffaf0', { density: 2.4, mask: '<path d="M54 150V62H6V14H94L118 38L94 62H66V150Z" fill="#fff"/>', print: `<rect x="54" y="62" width="12" height="88" fill="${WOOD}"/><path d="M9 17H93L113 38L93 59H9Z" fill="${INDIGO}"/>${icon(ICON.house('#fffaf0', SUN), 14, 26, 1)}${text(66, 45, 'HOMES', 17, '#fffaf0')}`, phantom: true, motion: { toy: 'post', at: [0], edge: 'bottom', deg: 90, spring: true } });
  const looks = [['a', { coat: '#e88ab0', legs: '#f4f1ea', skin: '#f3c9a0', hair: '#4a2c1a', style: 'dress', face: 'cheerful' }, 1], ['b', { coat: SUN, legs: '#3d444e', skin: '#c99a7a', hair: '#2b2622', build: 'big', face: 'determined' }, 1], ['c', { coat: '#2bb5b8', legs: '#c8915a', skin: '#a8714f', hair: '#1d1a17', style: 'shorts', pack: CORAL, hat: '#f4f1ea', build: 'average', face: 'cool' }, .88]] as const;
  // They are baked standing on the front verge, in open light, and walked from there by the game.
  const people = looks.flatMap(([id, look, k], i) => shopper(`visitor-${id}`, 160 + i * 150, 276, look, false, k).map(p => ({ ...p, actor: `visitor-${id}` })));
  return {
    id: 'lane', density: 2, camera: { zoom: 1, x0: -470, x1: 500 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] },
    panels: [
      ...view(), ...land(),
      // The way back to the train: a yellow arrow at the lane's mouth.
      front('out-arrow', -772, 0, 110, 104, 100, SUN, { density: 2.2, mask: '<path d="M46 100V58H0L52 0L104 58H58V100Z" fill="#fff"/>', print: `<rect x="46" y="58" width="12" height="42" fill="${WOOD}"/>${text(52, 50, 'MRT', 19, INK)}` }),
      post, ...plot(), ...house(), ...office(), ...people,
      ...hen('hen-a', 424, 72, '#fffaf0'), ...hen('hen-b', 446, 90, '#c8915a', .8, true),
      // The cat on the fence, and planting at each end of the lane for people to come out from behind.
      front('cat', 92, 40, 50.6, 44, 36, '#6b7480', { stock: 'sugar', density: 3, mask: '<path d="M6 36Q0 22 8 14L6 2L14 8Q19 6 24 8L32 2L30 14Q34 20 32 28Q44 30 42 20Q46 22 44 30Q42 36 32 36Z" fill="#fff"/>', print: '<path d="M14 36Q12 24 19 22Q26 24 24 36Z" fill="#c9ced4"/><circle cx="14" cy="15" r="2" fill="#f6b73c"/><circle cx="24" cy="15" r="2" fill="#f6b73c"/><path d="M17 19h4l-2 2Z" fill="#e88ab0"/>' }),
      ...[[-1080, 232, 210, 150], [-960, 250, 190, 128], [-850, 270, 150, 92], [1100, 232, 210, 150], [985, 250, 190, 128], [885, 270, 140, 88]].flatMap(([bx, bz, bw, bh], i) => bush(`clump-${i}`, bx, bz, bw, bh)),
      ...bush('verge-a', -640, 268, 110, 60), ...bush('verge-b', -90, 280, 120, 58), ...bush('verge-c', 640, 268, 100, 56)
    ]
  };
}
