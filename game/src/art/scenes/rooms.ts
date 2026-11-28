import { add, box, carved, on, relief, slot, yaw, type Panel, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, bricks, cloud, flutes, planks, reseed, specks, upArrows } from '../recipes.ts';

export const MINT = '#35b58a', PLUM = '#7c6be0', WOOD = '#a8693a', STEEL = '#3d444e', GLOW = '#ffe9b0', SKY = '#8fd3f4', GREY = '#c9ccd1';
export const W = 1040, D = 500, ROOM_LIGHT = { sun: 1.9, sky: .42, skyColor: [1, .9, .78] as const };
const WARM = [1, .83, .58] as const;
// The phone's three colours. The showcase, the catalog close-up and the swatch chips all read this list.
export const VARIANT_COLORS = [BLUE, CORAL, MINT] as const;

/* ---------- room shell: the building cut open, near wall removed. Side walls face into the room. ---------- */
export const backWall = (w: number, h: number, c: string, rest: Partial<Panel> & { id: string }): Panel => ({ stock: 'cover', c, w, h, o: [-w / 2, 0, -D / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.3, ...rest });
const leftWall = (h: number, c: string, id: string, print: string, mask?: string): Panel => ({ id, stock: 'cover', c, w: D, h, o: [-W / 2, 0, D / 2], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold', density: 1.1, print, mask });
const rightWall = (h: number, c: string, id: string, print: string, mask?: string): Panel => ({ id, stock: 'cover', c, w: D, h, o: [W / 2, 0, -D / 2], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: 1.1, print, mask });
const floor = (id: string, c: string, print: string): Panel => ({ id, stock: 'greyboard', c, w: W, h: D, o: [-W / 2, 0, D / 2], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.3, print });
const sill = (id: string, c: string): Panel => ({ id, stock: 'greyboard', c, w: W + 40, h: 22, o: [-W / 2 - 20, -22, D / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2 });
// A piece placed on a parent that stays its own quad, because it moves or swaps.
export const loose = (p: Panel, gap: number, x: number, y: number, w: number, h: number, rest: Partial<Panel> & Pick<Panel, 'id' | 'stock' | 'c'>): Panel => ({ ...on(p, gap, x, y, w, h, rest), decal: undefined });
// A card standing on the floor facing the camera, turned by `rot` degrees and leaned back by `lean`.
export const stand = (id: string, x: number, z: number, y: number, w: number, h: number, c: string, rest: Partial<Panel> & { stock?: Panel['stock'] } = {}, rot = 0, lean = 0): Panel => {
  const r = yaw(rot), v: V3 = r([0, Math.cos(lean * Math.PI / 180), -Math.sin(lean * Math.PI / 180)]);
  return { id, stock: 'cover', c, w, h, o: add([x, y, z], r([-w / 2, 0, 0])), u: r([1, 0, 0]), v, edge: 'cut', ...rest };
};
export const lampSet = (id: string, x: number, z: number, y: number, top: number): Panel[] => [
  { id: `${id}-shade`, stock: 'vellum', c: '#f3e2bd', w: 74, h: 44, o: [x - 37, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', emit: .9, density: 2, mask: '<path d="M22 0H52L74 44H0Z" fill="#fff"/>', print: `<path d="M0 41H74" stroke="${INK}" stroke-width="3"/>` },
  { id: `${id}-cord`, stock: 'greyboard', c: '#1a1410', w: 3, h: top - y - 44, o: [x - 1.5, y + 44, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1 }
];
export const lamp = (x: number, z: number, y: number) => ({ at: [x, y - 4, z] as V3, color: WARM, energy: 46 });
const f = (n: number) => n.toFixed(1);
export const carton = (id: string, x: number, z: number, y: number, w: number, h: number, d: number, c = KRAFT, rot = 0, group?: string): Panel[] => box({ id, x, z, y, w, h, d, rot, stock: 'kraft', c, front: `${flutes(w, h)}<rect x="${w / 2 - 6}" width="12" height="${h}" fill="#d9b781"/><rect x="5" y="${h - 18}" width="${Math.min(30, w * .4)}" height="13" fill="#fbf7ee"/>`, right: flutes(d, h) + (h > 40 ? upArrows(d * .34, h * .2) : ''), top: `${flutes(w, d)}<rect x="${w / 2 - 6}" width="12" height="${d}" fill="#d9b781"/><path d="M0 ${d / 2}H${w}" stroke="#4a2c14" stroke-opacity=".5"/>` }).filter(p => !/-left$/.test(p.id) || !group).map(p => (group ? { ...p, group, density: 2, ghost: /rear|under/.test(p.id) ? true : p.ghost } : p));

/* ---------- shared prints ---------- */
export const phoneArt = (w: number, h: number, body: string, screen = '#bfe6f8') => `<rect width="${w}" height="${h}" fill="${body}"/><rect x="${w * .09}" y="${h * .08}" width="${w * .82}" height="${h * .8}" fill="#1d2228"/><rect x="${w * .13}" y="${h * .12}" width="${w * .74}" height="${h * .72}" fill="${screen}"/><rect x="${w * .2}" y="${h * .2}" width="${w * .6}" height="${h * .26}" fill="#fff" fill-opacity=".5"/><circle cx="${w / 2}" cy="${h * .94}" r="${w * .05}" fill="${CREAM}"/>`;
export const phoneBox = (c: string, screen: string) => ({ c, print: `<rect x="5" y="6" width="18" height="34" rx="2" fill="#1d2228"/><rect x="7" y="9" width="14" height="27" fill="${screen}"/>` });
export const textBars = (x: number, y: number, w: number, n: number, c = '#c9ccd1', gap = 7) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${(w * [1, .82, .9, .64][i % 4]).toFixed(1)}" height="${gap * .5}" rx="${gap * .25}" fill="${c}"/>`).join('');
export const stars = (x: number, y: number, n: number, s = 9) => Array.from({ length: 5 }, (_, i) => `<path transform="translate(${x + i * s * 1.15} ${y}) scale(${s / 20})" d="M10 0L13 7L20 7.6L14.6 12.2L16.4 19.4L10 15.4L3.6 19.4L5.4 12.2L0 7.6L7 7Z" fill="${i < n ? SUN : '#b7bcc3'}"/>`).join('');
// The view through a window: the street outside, as layered flat prints (open surroundings, seen from inside).
const streetView = (w: number, h: number, seed: number) => {
  reseed(seed);
  const roofs = Array.from({ length: 5 }, (_, i) => { const bw = w / 4, x = i * bw - bw * .4, bh = h * (.28 + (i % 3) * .1); return `<rect x="${x}" y="${h - bh}" width="${bw * .92}" height="${bh}" fill="${['#e9a77b', '#d77b6a', '#f2cf8a', '#9fc7b4'][i % 4]}"/><g fill="#fff4e2" fill-opacity=".85">${Array.from({ length: 2 }, (_, k) => `<rect x="${x + bw * (.16 + k * .4)}" y="${h - bh + 10}" width="${bw * .22}" height="${bh * .22}"/>`).join('')}</g>`; }).join('');
  return `<rect width="${w}" height="${h}" fill="${SKY}"/>${cloud(w * .12, h * .1, .32)}${cloud(w * .6, h * .02, .26)}<path d="M0 ${h * .62}Q${w * .3} ${h * .44} ${w * .55} ${h * .58}T${w} ${h * .5}V${h}H0Z" fill="#a9d6dd"/>${roofs}`;
};


/* ---------- the shop's shell: walls dressed in relief, floor, ceiling bunting, what stands at the front edge ---------- */
// The room is one floor inside. The toys that stand in it are in blibli/floor.ts.
export function shopShell(): { panels: Panel[]; back: Panel; H: number } {
  reseed(21);
  const H = 420, brick = (w: number) => bricks(w, H, '#cf9554', '#b98a55');
  const back = backWall(W, H, '#d9a968', { id: 'wall-back', print: brick(W) });
  const lw = { ...leftWall(H, '#d9a968', 'wall-left', brick(D)), density: 1.8 }, rw = { ...rightWall(H, '#d9a968', 'wall-right', brick(D)), density: 1.8 };
  const fl = floor('floor', '#c58c4d', planks(W, D, '#c58c4d', '#7a4e24', 62));
  const rug = on(fl, .6, 360, 40, 320, 120, { id: 'rug', stock: 'sugar', c: CORAL, mask: '<rect width="320" height="120" rx="58" fill="#fff"/>', print: `<rect x="10" y="10" width="300" height="100" rx="50" fill="none" stroke="${CREAM}" stroke-width="7"/>` });
  const mat = on(fl, .6, 450, 0, 140, 44, { id: 'door-mat', stock: 'sugar', c: DEEP, print: `<g fill="${CREAM}">${Array.from({ length: 9 }, (_, i) => `<rect x="${14 + i * 13}" y="12" width="6" height="20" rx="3"/>`).join('')}</g>` });

  // Back wall: two windows onto the street, icon pennants, shelves of boxed phones in relief.
  const win = (id: string, x: number, seed: number) => [on(back, 1.2, x, 190, 130, 150, { id, stock: 'vellum', c: GLOW, emit: .55, density: 2, print: streetView(130, 150, seed) }), on(back, 3, x - 8, 182, 146, 166, { id: `${id}-frame`, stock: 'cover', c: CREAM, density: 2, mask: slot(146, 166, [8, 8, 62, 71], [76, 8, 62, 71], [8, 87, 62, 71], [76, 87, 62, 71]) })];
  const pennant = (id: string, x: number, y: number, c: string, icon: string) => on(back, 3, x, y, 120, 46, { id, stock: 'cover', c, print: icon, mask: '<path d="M0 0H120V46H0L12 23Z" fill="#fff"/>' });
  const percent = `<g fill="${CREAM}"><circle cx="50" cy="15" r="6"/><circle cx="72" cy="31" r="6"/><path d="M48 36L74 10" stroke="${CREAM}" stroke-width="5"/></g>`;
    const poster = on(back, 1.4, 455, 160, 130, 180, { id: 'poster', stock: 'bond', c: BLUE, print: `<rect x="34" y="22" width="62" height="118" fill="#0a6aa8"/><g transform="translate(40 28)">${phoneArt(50, 104, '#1d2228')}</g><g fill="${CREAM}"><circle cx="45" cy="160" r="6"/><circle cx="65" cy="160" r="6" fill="${CORAL}"/><circle cx="85" cy="160" r="6" fill="${MINT}"/></g>` });
  const shelf = (id: string, x: number, y: number, w: number, goods: { x: number; w: number; h: number; c: string; print?: string }[]): Panel[] => {
    const n: V3 = [0, 0, 1], base = add(add(back.o, back.u, x), back.v, y);
    return relief(back, [
      { id: `${id}-edge`, stock: 'greyboard', c: WOOD, w, h: 10, o: add(base, n, 34), u: back.u, v: back.v, edge: 'fold' },
      { id: `${id}-top`, stock: 'greyboard', c: WOOD, w, h: 34, o: add(add(base, n, 34), back.v, 10), u: back.u, v: [0, 0, -1], edge: 'fold', ghost: true },
      ...goods.map((g, i): Panel => ({ id: `${id}-g${i}`, stock: 'cover', c: g.c, w: g.w, h: g.h, o: add(add(add(base, back.u, g.x), back.v, 10), n, 18), u: back.u, v: back.v, edge: 'fold', print: g.print }))
    ]);
  };
  const screens = ['#bfe6f8', '#ffd3a8', '#c8f0d8'];
  const shelves = [
    ...shelf('sh-a', 60, 130, 300, [0, 1, 2, 3, 4, 5].map(i => ({ x: 12 + i * 46, w: 30, h: 46, ...phoneBox([BLUE, CORAL, MINT, BLUE, SUN, CORAL][i], screens[i % 3]) }))),
    ...shelf('sh-b', 60, 56, 300, [0, 1, 2, 3].map(i => ({ x: 14 + i * 70, w: [50, 40, 56, 44][i], h: [40, 34, 44, 30][i], c: [MINT, CREAM, CORAL, KRAFT][i] }))),
    ...shelf('sh-d', 660, 56, 240, [0, 1, 2].map(i => ({ x: 14 + i * 76, w: [54, 48, 60][i], h: [42, 36, 46][i], c: [PLUM, KRAFT, SUN][i] })))
  ];

  // Left wall: accessories on a pegboard, in relief (enclosed: hugs the wall, sticks out a little).
  const peg = on(lw, 1, 60, 130, 300, 200, { id: 'pegboard', stock: 'greyboard', c: '#e9dcc4', print: specks(300, 200, '#8a7a60', 0) + Array.from({ length: 13 }, (_, i) => Array.from({ length: 9 }, (_, k) => `<circle cx="${12 + i * 23}" cy="${12 + k * 22}" r="2.4" fill="#8a7a60"/>`).join('')).join('') });
  const hang = (id: string, z: number, y: number, w: number, h: number, c: string, print = '', out = 8): Panel => ({ id, stock: 'cover', c, w, h, o: [-W / 2 + out, y, z], u: [0, 0, -1], v: [0, 1, 0], edge: 'cut', print });
  const accessories = relief(lw, [
    ...[0, 1, 2, 3].map(i => hang(`case-${i}`, 160 - i * 50, 250, 30, 56, VARIANT_COLORS[i % 3], `<rect x="4" y="5" width="9" height="9" rx="3" fill="#1d2228"/>`, 10)),
    ...[0, 1, 2].map(i => hang(`buds-${i}`, 150 - i * 66, 160, 44, 52, CREAM, `<rect width="44" height="12" fill="${[BLUE, CORAL, INK][i]}"/><circle cx="16" cy="32" r="7" fill="#fff"/><circle cx="29" cy="32" r="7" fill="#fff"/>`, 12)),
    hang('cable', -60, 150, 50, 70, '#fff', `<circle cx="25" cy="34" r="20" fill="none" stroke="#e9ebee" stroke-width="5"/>`, 6)
  ]);

  // Right wall: a clock and a framed print of the phone, in relief.
  const rwOn = (id: string, z: number, y: number, w: number, h: number, c: string, print: string, out: number, mask?: string): Panel => ({ id, stock: 'cover', c, w, h, o: [W / 2 - out, y, z], u: [0, 0, 1], v: [0, 1, 0], edge: 'cut', print, mask });
  const wallDeco = carved(rw, [
    rwOn('clock', -40, 300, 64, 64, CREAM, `<circle cx="32" cy="32" r="26" fill="#fff"/><g stroke="${INK}" stroke-width="3" stroke-linecap="round"><path d="M32 32V14M32 32L44 38"/></g>${Array.from({ length: 12 }, (_, i) => `<circle cx="${32 + Math.cos(i * Math.PI / 6) * 21}" cy="${32 + Math.sin(i * Math.PI / 6) * 21}" r="1.6" fill="${INK}"/>`).join('')}`, 6, '<circle cx="32" cy="32" r="32" fill="#fff"/>'),
    rwOn('frame', 60, 180, 120, 150, WOOD, `<rect x="8" y="8" width="104" height="134" fill="${CORAL}"/><g transform="translate(36 26)">${phoneArt(48, 92, CORAL)}</g>`, 5),
    ...[].map(i => rwOn(`pot-r${i}`, 220 + i * 54, 160, 34, 40, i ? MINT : SUN, `<rect width="34" height="10" fill="${INK}" fill-opacity=".2"/>`, 22))
  ]);
  // Display cabinets carved against both side walls: drawers below, boxed products and stands on top.
  const cabinet = (wall: Panel, side: 1 | -1, id: string, z0: number, z1: number, goods: { w: number; h: number; c: string; print?: string }[]): Panel[] => {
    const DEPTH = 40, x = side * (W / 2 - DEPTH / 2), len = z1 - z0, face = (p: string) => (side < 0 ? { right: p } : { left: p });
    const drawers = `<rect width="${len}" height="96" fill="${WOOD}"/>${Array.from({ length: Math.floor(len / 70) }, (_, i) => `<rect x="${8 + i * 70}" y="14" width="62" height="34" fill="#c08a58"/><rect x="${8 + i * 70}" y="54" width="62" height="34" fill="#c08a58"/><rect x="${30 + i * 70}" y="28" width="18" height="5" fill="${CREAM}"/><rect x="${30 + i * 70}" y="68" width="18" height="5" fill="${CREAM}"/>`).join('')}<rect width="${len}" height="8" fill="#e9dcc4"/>`;
    let z = z0 + 10;
    const top = goods.flatMap((g, i) => { const at = z + g.w / 2; z += g.w + 10; return box({ id: `${id}-g${i}`, x: x + side * 4, z: at, y: 96, w: 26, h: g.h, d: g.w, stock: 'cover', c: g.c, ...face(g.print ?? '') }); });
    return carved(wall, [...box({ id: `${id}-body`, x, z: (z0 + z1) / 2, w: DEPTH, h: 96, d: len, stock: 'greyboard', c: WOOD, ...face(drawers), top: `<rect width="${DEPTH}" height="${len}" fill="#e9dcc4"/>` }), ...top]);
  };
  const phoneBoxPrint = (c: string) => `<rect x="5" y="6" width="${14}" height="26" rx="2" fill="#1d2228"/><rect x="7" y="9" width="10" height="20" fill="${c}"/>`;
  const headset = `<path d="M6 30Q6 8 20 8Q34 8 34 30" stroke="${INK}" stroke-width="4" fill="none"/><rect x="2" y="24" width="10" height="14" rx="3" fill="${INK}"/><rect x="28" y="24" width="10" height="14" rx="3" fill="${INK}"/>`;
  const cabinets = [
    ...cabinet(lw, -1, 'cab-l', -110, 200, [{ w: 24, h: 40, c: BLUE, print: phoneBoxPrint('#bfe6f8') }, { w: 24, h: 40, c: CORAL, print: phoneBoxPrint('#ffd3a8') }, { w: 24, h: 40, c: MINT, print: phoneBoxPrint('#c8f0d8') }, { w: 48, h: 44, c: CREAM, print: headset }, { w: 60, h: 24, c: SUN }, { w: 40, h: 54, c: PLUM, print: `<rect x="8" y="8" width="24" height="38" rx="4" fill="#1d2228"/>` }, { w: 30, h: 30, c: KRAFT }]),
    ...cabinet(rw, 1, 'cab-r', -20, 170, [{ w: 50, h: 52, c: '#1d2228', print: `<rect x="5" y="5" width="40" height="30" fill="#8fd3f4"/><rect x="20" y="38" width="10" height="14" fill="${STEEL}"/>` }, { w: 40, h: 40, c: CREAM, print: headset }, { w: 24, h: 40, c: SUN, print: phoneBoxPrint('#bfe6f8') }, { w: 24, h: 40, c: BLUE, print: phoneBoxPrint('#ffd3a8') }])
  ];

  const foreground: Panel[] = [
    ...carton('fg-box-a', -470, 196, 0, 90, 74, 60), ...carton('fg-box-b', -462, 196, 74, 66, 50, 46, KRAFT, 7),
    { id: 'fg-plant', stock: 'sugar', c: '#2f7d48', w: 120, h: 170, o: [400, 0, 214], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<path d="M60 170Q40 120 10 96Q40 92 54 112Q30 50 44 10Q66 40 66 104Q84 62 112 50Q106 104 72 134L66 170Z" fill="#fff"/>' },
    { id: 'fg-pot', stock: 'cover', c: CORAL, w: 62, h: 44, o: [428, 0, 216], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', mask: '<path d="M0 0H62L52 44H10Z" fill="#fff"/>' }
  ];
  // Bunting strung across the room at ceiling height: the overhead layer that closes the box from above.
  const sag = (x: number) => 30 + 26 * Math.sin(Math.PI * x / W) ** 1;
  const flags = Array.from({ length: 22 }, (_, i) => { const x = 24 + i * 46, y = sag(x); return `<path d="M${x - 15} ${y.toFixed(1)}L${x + 15} ${(y + 1.5).toFixed(1)}L${x} ${(y + 34).toFixed(1)}Z" fill="#fff"/>`; }).join('');
  const string = `<path d="M0 30${Array.from({ length: 41 }, (_, i) => `L${(i + 1) * W / 41} ${sag((i + 1) * W / 41).toFixed(1)}`).join('')}" stroke="#fff" stroke-width="3" fill="none"/>`;
  const bunting: Panel = { id: 'bunting', stock: 'cover', c: CREAM, w: W, h: 96, o: [-W / 2, H - 100, 120], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4, mask: string + flags, print: `${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 46 + 9}" width="30" height="96" fill="${[CORAL, SUN, BLUE, MINT][i % 4]}"/>`).join('')}` };
  const star = `<path transform="translate(44 5) scale(1.8)" d="M10 0L13 7L20 7.6L14.6 12.2L16.4 19.4L10 15.4L3.6 19.4L5.4 12.2L0 7.6L7 7Z" fill="${CREAM}"/>`;
  const panels = [sill('sill', '#6d4524'), bunting, fl, rug, mat, back, lw, rw, peg, ...accessories, ...wallDeco, ...cabinets, ...win('win-a', 150, 4), ...win('win-b', 632, 9),
    pennant('tag-promo', 120, 352, CORAL, percent), pennant('tag-recs', 840, 352, SUN, star), poster, ...shelves, ...foreground];
  return { panels, back, H };
}
