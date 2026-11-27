// The Moperty lane as a grey box: every piece that moves, at its true size and place, cut from plain card with no
// print. It exists to play the mechanics (docs/MOPERTY_DESIGN.md) before any art is drawn; the art pass keeps these
// ids, poses and motions and replaces the cards.
import { add, box, type Motion, type Panel, type Scene, type Show, type V3 } from '../kit.ts';

const CARD = '#f1ebdf', SHADE = '#ddd3c1', DARK = '#8f8779', GROUND = '#b9c7a6', ROAD = '#d8cdb9', USE = '#e8552d', BLUE = '#3f51b5', INK = '#2b2622';
const UP: V3 = [0, 1, 0];
type Extra = Partial<Panel>;
const sheet = (id: string, c: string, o: V3, u: V3, v: V3, w: number, h: number, x: Extra = {}): Panel => ({ id, stock: 'cover', c, o, u, v, w, h, edge: 'cut', ...x });
// A sheet standing square to the camera, its bottom-left corner at [x, y, z].
const front = (id: string, x: number, y: number, z: number, w: number, h: number, c: string, e: Extra = {}) => sheet(id, c, [x, y, z], [1, 0, 0], UP, w, h, e);
// A sheet lying on the ground, seen from above, from x to x + w and from z (its near edge) back by d.
const flat = (id: string, x: number, z: number, w: number, d: number, c: string, y = .6, e: Extra = {}) => sheet(id, c, [x, y, z], [1, 0, 0], [0, 0, -1], w, d, e);
// A sheet standing in a plane that runs front to back at `x`, facing right (+1) or left (-1), from z back by d.
const flank = (id: string, x: number, y: number, z: number, d: number, h: number, c: string, face: 1 | -1, e: Extra = {}) => sheet(id, c, [x, y, face > 0 ? z : z - d], [0, 0, face > 0 ? -1 : 1], UP, d, h, e);
const text = (w: number, h: number, t: string, size = 15, fill = '#fffaf0') => `<text x="${w / 2}" y="${h / 2 + size * .36}" font-family="Fredoka" font-weight="600" font-size="${size}" fill="${fill}" text-anchor="middle">${t}</text>`;
// The far face of a sheet that turns over: its own colour and print, read the right way round once it faces the camera.
const reverse = (p: Panel, c: string, print?: string): Panel => ({ ...p, id: `${p.id}-back`, c, print, o: add(p.o, p.u, p.w), u: [-p.u[0], -p.u[1], -p.u[2]] });
// A slide given in the world's own directions, turned into the sheet's (Motion.slide runs along u, v and the normal).
const slide = (p: Panel, by: V3): V3 => { const n: V3 = [p.u[1] * p.v[2] - p.u[2] * p.v[1], p.u[2] * p.v[0] - p.u[0] * p.v[2], p.u[0] * p.v[1] - p.u[1] * p.v[0]], dot = (a: V3) => a[0] * by[0] + a[1] * by[1] + a[2] * by[2], l = (a: V3) => Math.hypot(...a); return [dot(p.u) / l(p.u), dot(p.v) / l(p.v), dot(n) / l(n)]; };
const person = (w: number, h: number) => `<path d="M${w * .5} 0a${w * .36} ${w * .36} 0 0 1 ${w * .2} ${w * .66}h${w * .22}v${h - w * .66}H${w * .08}V${w * .66}h${w * .22}A${w * .36} ${w * .36} 0 0 1 ${w * .5} 0Z" fill="#fff"/>`;

// The plot. The house is a pop-up. Its sheet lies flat as the plan: the floor, and the front wall lying toward the
// camera with its inside up. Then the front folds up; then the back and the gabled sides come up through their slots
// in the ground; then the roof is put on.
const PLOT = { x: -400, w: 200, z: -72, d: 100, h: 120, gable: 46 };
function plot(): Panel[] {
  const { x, w, z, d, h, gable } = PLOT, back = z - d, laid: Show = { toy: 'build', at: [1, 2, 3, 4], fold: true }, pent = `<path d="M0 ${gable}L${d / 2} 0L${d} ${gable}V${h + gable}H0Z" fill="#fff"/>`;
  const rise = (p: Panel, delay: number): Panel => ({ ...p, show: laid, phantom: true, motion: { toy: 'build', at: [1, 2], slide: slide(p, [0, -(p.h + 4), 0]), spring: true, delay } });
  const out: Panel[] = [
    flat('plot-ground', x - 70, z + 126, w + 140, d + 180, '#c9bf9e', .3),
    flat('net-floor', x, z, w, d, CARD, .9, { show: laid, print: `<path d="M${w * .55} 0V${d * .6}H${w}M0 ${d * .5}H${w * .3}" fill="none" stroke="${DARK}" stroke-width="2" stroke-dasharray="6 4"/>` }),
    sheet('net-front-in', '#e9e1d2', [x + w, .7, z], [-1, 0, 0], [0, 0, 1], w, h, { show: laid, phantom: true, motion: { toy: 'build', at: [2, 3, 4], edge: 'bottom', deg: -90, spring: true }, print: `<g fill="none" stroke="${DARK}" stroke-width="2" stroke-dasharray="6 4"><rect x="${w / 2 - 22}" y="${h - 84}" width="44" height="84"/><rect x="24" y="30" width="40" height="38"/><rect x="${w - 64}" y="30" width="40" height="38"/></g>` }),
    front('net-front', x, 0, z, w, h, CARD, { show: laid, phantom: true, motion: { toy: 'build', at: [0, 1], edge: 'bottom', deg: -90, spring: true }, print: `<rect x="${w / 2 - 22}" y="${h - 84}" width="44" height="84" fill="${DARK}"/><rect x="24" y="30" width="40" height="38" fill="${SHADE}"/><rect x="${w - 64}" y="30" width="40" height="38" fill="${SHADE}"/>` }),
    rise(front('net-back', x, 0, back, w, h, '#e9e1d2'), 60),
    rise(sheet('net-left-in', '#e4dccb', [x, 0, z], [0, 0, -1], UP, d, h + gable, { mask: pent }), 0), rise(sheet('net-left', SHADE, [x, 0, back], [0, 0, 1], UP, d, h + gable, { mask: pent }), 0),
    rise(sheet('net-right-in', '#e4dccb', [x + w, 0, back], [0, 0, 1], UP, d, h + gable, { mask: pent }), 120), rise(sheet('net-right', SHADE, [x + w, 0, z], [0, 0, -1], UP, d, h + gable, { mask: pent }), 120)
  ];
  // The roof is folded on its own and put on last, from above; a pennant goes up on its ridge.
  const run = d / 2 + 10, up = gable * run / (d / 2), len = Math.hypot(run, up);
  out.push(sheet('net-roof', USE, [x - 12, h - gable * 10 / (d / 2), z + 10], [1, 0, 0], [0, up / len, -run / len], w + 24, len, { show: { toy: 'build', at: [4], drop: 150, fold: true }, phantom: true }));
  out.push(front('net-flag', x + w / 2 - 3, h + gable - 4, z - d / 2, 30, 34, '#35b58a', { mask: '<path d="M0 0H4V34H0ZM4 2L30 9L4 16Z" fill="#fff"/>', show: { toy: 'build', at: [4], drop: 190, fold: true }, phantom: true }));
  for (const [i, sx, sz] of [[0, x - 50, z + 112], [1, x + w + 50, z + 112], [2, x - 50, back - 30], [3, x + w + 50, back - 30]] as const) out.push(...box({ id: `stake-${i}`, x: sx, z: sz, w: 6, h: 34, d: 6, stock: 'greyboard', c: DARK }));
  return out;
}

// The house that is on the market: two storeys. Its front is two leaves that open like a doll's house; inside, the
// rooms' furniture stands up as it opens, upstairs clear of his head.
const HOUSE = { x: 70, w: 240, z: -110, d: 120, h: 290, floor: 150 };
function house(): Panel[] {
  const { x, w, z, d, h, floor } = HOUSE, back = z - d, opens = (edge: 'left' | 'right', deg: number): Motion => ({ toy: 'door', at: [1], edge, deg, spring: true });
  const win = (wx: number, wy: number) => `<rect x="${wx}" y="${wy}" width="46" height="52" fill="${SHADE}"/>`;
  const leafL = front('leaf-l', x, 0, z, w / 2, h, CARD, { motion: opens('left', -100), print: win(36, 44) + win(36, 180) });
  const leafR = front('leaf-r', x + w / 2, 0, z, w / 2, h, CARD, { motion: opens('right', 100), print: win(40, 44) + `<rect x="0" y="${h - 100}" width="48" height="100" fill="${DARK}"/>` });
  const pops = [['sofa', x + 16, 0, 70, 52, '#b7a3c9'], ['table', x + 150, 0, 66, 60, '#c9a37c'], ['bed', x + 14, floor, 84, 46, '#e8a9a0'], ['bath', x + 156, floor, 60, 58, '#a9c4cf']] as const;
  return [
    flat('house-floor', x, z, w, d, '#cdb99a', .8), front('house-back', x, 0, back, w, h, '#d9cdb8', { print: `<rect x="${w / 2 - 3}" y="0" width="6" height="${h}" fill="#c4b79f"/>` }),
    flat('house-upper', x, z, w, d, '#c4b193', floor), front('house-upper-edge', x, floor - 8, z - 1, w, 8, '#a8977b'),
    flank('house-left-in', x, 0, z, d, h, '#cfc3ae', 1), flank('house-right-in', x + w, 0, z, d, h, '#cfc3ae', -1),
    flank('house-left', x, 0, z, d, h, SHADE, -1), flank('house-right', x + w, 0, z, d, h, SHADE, 1),
    leafL, { ...reverse(leafL, '#e4dccb'), motion: opens('right', -100) }, leafR, { ...reverse(leafR, '#e4dccb'), motion: opens('left', 100) },
    sheet('house-roof', USE, [x - 14, h - 8, z + 12], [1, 0, 0], [0, .5, -.866], w + 28, 150),
    ...pops.map(([id, px, py, pw, ph, c], i) => front(`pop-${id}`, px, py, z - 56 + i * 4, pw, ph, c, { motion: { toy: 'door', at: [0], edge: 'bottom', deg: 90, spring: true, delay: 160 + i * 80 }, phantom: true })),
    // The yard: a low fence along the lane with a gate that opens for him, and the board that turns over.
    front('fence-l', -60, 0, 50, 210, 38, CARD), front('fence-r', 230, 0, 50, 180, 38, CARD),
    front('gate', 150, 0, 50, 80, 34, '#e9c98f', { motion: { toy: 'gate', at: [1], edge: 'left', deg: 100, spring: true } }),
    ...box({ id: 'board-post', x: -16, z: 10, w: 8, h: 86, d: 8, stock: 'greyboard', c: DARK }),
    ...(() => { const b = front('board', -68, 84, 14.5, 104, 64, USE, { print: text(104, 64, 'FOR SALE', 17), motion: { toy: 'board', at: [1], edge: 'mid', deg: 180, spring: true } }); return [b, { ...reverse(b, BLUE, text(104, 64, 'FOR RENT', 17)), motion: b.motion }]; })(),
    // The mango tree in the yard, its crown over the lane. Each jump under it drops one.
    front('tree-trunk', 361, 0, 6, 22, 150, '#9b7a5c'), front('tree-crown-a', 300, 130, 10, 150, 120, '#7fa56a', { mask: '<ellipse cx="75" cy="60" rx="75" ry="60" fill="#fff"/>' }),
    front('tree-crown-b', 312, 112, 74, 130, 86, '#93b87c', { mask: '<ellipse cx="65" cy="43" rx="65" ry="43" fill="#fff"/>' }),
    ...[[338, 112], [374, 130], [398, 104]].map(([mx, mz], i) => front(`mango-${i}`, mx - 9, 0, mz, 18, 22, '#f0a51e', { mask: '<ellipse cx="9" cy="11" rx="9" ry="11" fill="#fff"/>', show: { toy: 'mango', at: [1, 2, 3].slice(i), drop: 160 } })),
    front('hen-a', 412, 0, 70, 30, 26, '#fffaf0', { mask: '<ellipse cx="15" cy="13" rx="15" ry="13" fill="#fff"/>' }), front('hen-b', 436, 0, 86, 26, 22, '#e8c9a0', { mask: '<ellipse cx="13" cy="11" rx="13" ry="11" fill="#fff"/>' }),
    front('cat', 96, 38, 50.5, 34, 24, '#5d6670', { mask: '<ellipse cx="17" cy="14" rx="17" ry="10" fill="#fff"/><circle cx="28" cy="8" r="8" fill="#fff"/>' })
  ];
}

// The agent's office, in a shophouse: the door, then the counter window. The bell on the sill brings the agent up in
// the window with a card; the board over the shopfront carries one card for each listing in the lane, as it stands now.
const OFFICE = { x: 450, w: 300, h: 300 };
function office(): Panel[] {
  const { x, w, h } = OFFICE, win = { x: 128, y: h - 160, w: 104, h: 98 };
  const card = (id: string, cx: number, c: string, label: string, show: Show) => front(id, cx, 196, 3, 44, 56, c, { show, print: text(44, 56, label, 24) });
  const agent = front('agent', x + win.x + 40, 30, -16, 60, 110, '#35b58a', { mask: person(60, 110), phantom: true });
  return [
    front('office-front', x, 0, 0, w, h, CARD, { mask: `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0Z M${win.x} ${win.y}V${win.y + win.h}H${win.x + win.w}V${win.y}Z" fill="#fff"/>`, print: `<rect x="6" y="${h - 124}" width="68" height="124" fill="${DARK}"/><rect x="0" y="${h - 176}" width="${w}" height="8" fill="${SHADE}"/>` }),
    front('office-inside', x + win.x - 8, 30, -44, win.w + 16, 140, '#5a5348'), flank('office-left', x, 0, 0, 200, h, SHADE, -1),
    ...box({ id: 'sill', x: x + win.x + win.w / 2, z: 9, y: 54, w: win.w + 8, h: 8, d: 18, stock: 'greyboard', c: SHADE }),
    ...box({ id: 'bell', x: x + win.x + 26, z: 10, y: 62, w: 18, h: 12, d: 12, stock: 'cover', c: '#f6b73c' }),
    { ...agent, motion: { toy: 'ask', at: [0], slide: slide(agent, [0, -100, 0]), spring: true } },
    ...['L', 'H', 'W'].map((t, i) => front(`ask-${i + 1}`, x + win.x + 6, 100, -8, 42, 34, '#fffaf0', { show: { toy: 'ask', at: [i + 1] }, print: text(42, 34, t, 20, INK) })),
    front('listings', x + 12, 186, 1.5, 104, 76, '#7d8793'),
    card('card-plot-land', x + 18, '#93b87c', 'L', { toy: 'build', at: [0, 1, 2, 3] }), card('card-plot-house', x + 18, '#f1ebdf', 'H', { toy: 'build', at: [4] }),
    card('card-house-sale', x + 66, USE, 'S', { toy: 'board', at: [0] }), card('card-house-rent', x + 66, BLUE, 'R', { toy: 'board', at: [1] })
  ];
}

export function lane(): Scene {
  const post = front('post', -670, 0, 12, 120, 150, '#fffaf0', { mask: '<path d="M54 150V60H8V16H96L118 38L96 60H66V150Z" fill="#fff"/>', print: `<rect width="120" height="62" fill="${BLUE}"/>${text(104, 76, 'HOMES', 17)}`, phantom: true, motion: { toy: 'post', at: [0], edge: 'bottom', deg: 90, spring: true } });
  const people = ([['a', 60, 112, '#e88ab0'], ['b', 72, 126, '#f6b73c'], ['c', 54, 98, '#2bb5b8']] as const).map(([id, w, h, c]) => front(`visitor-${id}`, -w / 2, 0, 0, w, h, c, { mask: person(w, h), actor: `visitor-${id}` }));
  return {
    id: 'lane', density: 2, camera: { zoom: 1, x0: -470, x1: 470 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] },
    panels: [
      flat('ground', -1400, 320, 2800, 760, GROUND, 0, { density: .5 }), flat('road', -1400, 210, 2800, 170, ROAD, .2, { density: .5 }),
      front('out-arrow', -760, 0, 110, 78, 96, '#f0a51e', { mask: '<path d="M34 96V40H0L39 0L78 40H44V96Z" fill="#fff"/>' }),
      front('hedge-l', -1100, 0, 205, 250, 210, '#7fa56a'), front('hedge-r', 870, 0, 205, 250, 210, '#7fa56a'),
      post, ...plot(), ...house(), ...office(), ...people,
      ...box({ id: 'barrow', x: -486, z: 12, w: 56, h: 30, d: 34, stock: 'greyboard', c: DARK }), ...box({ id: 'sand', x: -548, z: -60, w: 70, h: 22, d: 50, stock: 'kraft', c: '#d9c08c' })
    ]
  };
}
