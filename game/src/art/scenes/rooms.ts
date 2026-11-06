import { add, box, carved, on, relief, slot, yaw, type Panel, type Scene, type Stock, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, TAPE, bricks, cloud, flutes, planks, reseed, specks, upArrows } from '../recipes.ts';

const MINT = '#35b58a', PLUM = '#7c6be0', WOOD = '#a8693a', STEEL = '#3d444e', GLOW = '#ffe9b0', SKY = '#8fd3f4', GREY = '#c9ccd1';
const W = 1040, D = 500,
  // The store-room stairwell: a notch in the front-left of the floor, from the landing at z0 to the front edge.
  WELL = { x0: -482, x1: -292, z0: 90 }, ROOM_LIGHT = { sun: 1.9, sky: .42, skyColor: [1, .9, .78] as const };
const WARM = [1, .83, .58] as const;
// The phone's three colours. The showcase, the catalog close-up and the swatch chips all read this list.
export const VARIANT_COLORS = [BLUE, CORAL, MINT] as const;

/* ---------- room shell: the building cut open, near wall removed. Side walls face into the room. ---------- */
const backWall = (w: number, h: number, c: string, rest: Partial<Panel> & { id: string }): Panel => ({ stock: 'cover', c, w, h, o: [-w / 2, 0, -D / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.3, ...rest });
const leftWall = (h: number, c: string, id: string, print: string, mask?: string): Panel => ({ id, stock: 'cover', c, w: D, h, o: [-W / 2, 0, D / 2], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold', density: 1.1, print, mask });
const rightWall = (h: number, c: string, id: string, print: string, mask?: string): Panel => ({ id, stock: 'cover', c, w: D, h, o: [W / 2, 0, -D / 2], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: 1.1, print, mask });
const floor = (id: string, c: string, print: string): Panel => ({ id, stock: 'greyboard', c, w: W, h: D, o: [-W / 2, 0, D / 2], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.3, print });
const sill = (id: string, c: string): Panel => ({ id, stock: 'greyboard', c, w: W + 40, h: 22, o: [-W / 2 - 20, -22, D / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2 });
// A piece placed on a parent that stays its own quad, because it moves or swaps.
const loose = (p: Panel, gap: number, x: number, y: number, w: number, h: number, rest: Partial<Panel> & Pick<Panel, 'id' | 'stock' | 'c'>): Panel => ({ ...on(p, gap, x, y, w, h, rest), decal: undefined });
// A card standing on the floor facing the camera, turned by `rot` degrees and leaned back by `lean`.
const stand = (id: string, x: number, z: number, y: number, w: number, h: number, c: string, rest: Partial<Panel> & { stock?: Panel['stock'] } = {}, rot = 0, lean = 0): Panel => {
  const r = yaw(rot), v: V3 = r([0, Math.cos(lean * Math.PI / 180), -Math.sin(lean * Math.PI / 180)]);
  return { id, stock: 'cover', c, w, h, o: add([x, y, z], r([-w / 2, 0, 0])), u: r([1, 0, 0]), v, edge: 'cut', ...rest };
};
const lampSet = (id: string, x: number, z: number, y: number, top: number): Panel[] => [
  { id: `${id}-shade`, stock: 'vellum', c: '#f3e2bd', w: 74, h: 44, o: [x - 37, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', emit: .9, density: 2, mask: '<path d="M22 0H52L74 44H0Z" fill="#fff"/>', print: `<path d="M0 41H74" stroke="${INK}" stroke-width="3"/>` },
  { id: `${id}-cord`, stock: 'greyboard', c: '#1a1410', w: 3, h: top - y - 44, o: [x - 1.5, y + 44, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1 }
];
const lamp = (x: number, z: number, y: number) => ({ at: [x, y - 4, z] as V3, color: WARM, energy: 46 });
const stairCard = (id: string, x: number, flip: 1 | -1, wood: string): Panel[] => {
  const steps = 7, run = 26, rise = 34, ry = steps * rise, rz = steps * run, sw = 150, sl = Math.hypot(ry, rz);
  const stepPrint = Array.from({ length: steps }, (_, i) => { const a = i * sl / steps; return `<rect y="${a}" width="${sw}" height="${sl / steps}" fill="${i % 2 ? '#000' : '#fff'}" fill-opacity=".08"/><path d="M0 ${a}H${sw}" stroke="#3a2010" stroke-width="3"/>`; }).join('');
  const ramp: Panel = { id, stock: 'greyboard', c: wood, w: sw, h: sl, o: [x - sw / 2, 0, -60], u: [1, 0, 0], v: [0, ry / sl, -rz / sl], edge: 'fold', density: 1.3, print: stepPrint };
  const side = flip > 0 ? x - sw / 2 : x + sw / 2;
  const sawtooth = Array.from({ length: steps }, (_, i) => `H${(i + 1) * run}V${ry - (i + 1) * rise}`).join('');
  const stringer: Panel = flip > 0
    ? { id: `${id}-side`, stock: 'greyboard', c: '#6d4524', w: rz, h: ry, o: [side, 0, -60 - rz], u: [0, 0, 1], v: [0, 1, 0], edge: 'cut', density: 1.3, mask: `<g transform="translate(${rz} 0) scale(-1 1)"><path d="M0 ${ry}V${ry}${sawtooth}V${ry}Z" fill="#fff"/></g>` }
    : { id: `${id}-side`, stock: 'greyboard', c: '#6d4524', w: rz, h: ry, o: [side, 0, -60], u: [0, 0, -1], v: [0, 1, 0], edge: 'cut', density: 1.3, mask: `<path d="M0 ${ry}V${ry}${sawtooth}V${ry}Z" fill="#fff"/>` };
  return [ramp, stringer];
};
const carton = (id: string, x: number, z: number, y: number, w: number, h: number, d: number, c = KRAFT, rot = 0, group?: string): Panel[] => box({ id, x, z, y, w, h, d, rot, stock: 'kraft', c, front: `${flutes(w, h)}<rect x="${w / 2 - 6}" width="12" height="${h}" fill="#d9b781"/><rect x="5" y="${h - 18}" width="${Math.min(30, w * .4)}" height="13" fill="#fbf7ee"/>`, right: flutes(d, h) + (h > 40 ? upArrows(d * .34, h * .2) : ''), top: `${flutes(w, d)}<rect x="${w / 2 - 6}" width="12" height="${d}" fill="#d9b781"/><path d="M0 ${d / 2}H${w}" stroke="#4a2c14" stroke-opacity=".5"/>` }).filter(p => !/-left$/.test(p.id) || !group).map(p => (group ? { ...p, group, density: 2, ghost: /rear|under/.test(p.id) ? true : p.ghost } : p));

/* ---------- shared prints ---------- */
const phoneArt = (w: number, h: number, body: string, screen = '#bfe6f8') => `<rect width="${w}" height="${h}" fill="${body}"/><rect x="${w * .09}" y="${h * .08}" width="${w * .82}" height="${h * .8}" fill="#1d2228"/><rect x="${w * .13}" y="${h * .12}" width="${w * .74}" height="${h * .72}" fill="${screen}"/><rect x="${w * .2}" y="${h * .2}" width="${w * .6}" height="${h * .26}" fill="#fff" fill-opacity=".5"/><circle cx="${w / 2}" cy="${h * .94}" r="${w * .05}" fill="${CREAM}"/>`;
const phoneBox = (c: string, screen: string) => ({ c, print: `<rect x="5" y="6" width="18" height="34" rx="2" fill="#1d2228"/><rect x="7" y="9" width="14" height="27" fill="${screen}"/>` });
const textBars = (x: number, y: number, w: number, n: number, c = '#c9ccd1', gap = 7) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${(w * [1, .82, .9, .64][i % 4]).toFixed(1)}" height="${gap * .5}" rx="${gap * .25}" fill="${c}"/>`).join('');
const stars = (x: number, y: number, n: number, s = 9) => Array.from({ length: 5 }, (_, i) => `<path transform="translate(${x + i * s * 1.15} ${y}) scale(${s / 20})" d="M10 0L13 7L20 7.6L14.6 12.2L16.4 19.4L10 15.4L3.6 19.4L5.4 12.2L0 7.6L7 7Z" fill="${i < n ? SUN : '#b7bcc3'}"/>`).join('');
// The view through a window: the street outside, as layered flat prints (open surroundings, seen from inside).
const streetView = (w: number, h: number, seed: number) => {
  reseed(seed);
  const roofs = Array.from({ length: 5 }, (_, i) => { const bw = w / 4, x = i * bw - bw * .4, bh = h * (.28 + (i % 3) * .1); return `<rect x="${x}" y="${h - bh}" width="${bw * .92}" height="${bh}" fill="${['#e9a77b', '#d77b6a', '#f2cf8a', '#9fc7b4'][i % 4]}"/><g fill="#fff4e2" fill-opacity=".85">${Array.from({ length: 2 }, (_, k) => `<rect x="${x + bw * (.16 + k * .4)}" y="${h - bh + 10}" width="${bw * .22}" height="${bh * .22}"/>`).join('')}</g>`; }).join('');
  return `<rect width="${w}" height="${h}" fill="${SKY}"/>${cloud(w * .12, h * .1, .32)}${cloud(w * .6, h * .02, .26)}<path d="M0 ${h * .62}Q${w * .3} ${h * .44} ${w * .55} ${h * .58}T${w} ${h * .5}V${h}H0Z" fill="#a9d6dd"/>${roofs}`;
};

/* ---------- first floor: the product detail page as a shop ---------- */
export function shop(): Scene {
  reseed(21);
  const H = 420, brick = (w: number) => bricks(w, H, '#cf9554', '#b98a55');
  const back = backWall(W, H, '#d9a968', { id: 'wall-back', print: brick(W) });
  const lw = leftWall(H, '#d9a968', 'wall-left', brick(D)), rw = rightWall(H, '#d9a968', 'wall-right', brick(D));
  const fl = floor('floor', '#c58c4d', planks(W, D, '#c58c4d', '#7a4e24', 62));
  const rug = on(fl, .6, 360, 40, 320, 120, { id: 'rug', stock: 'sugar', c: CORAL, mask: '<rect width="320" height="120" rx="58" fill="#fff"/>', print: `<rect x="10" y="10" width="300" height="100" rx="50" fill="none" stroke="${CREAM}" stroke-width="7"/>` });
  const mat = on(fl, .6, 450, 0, 140, 44, { id: 'door-mat', stock: 'sugar', c: DEEP, print: `<g fill="${CREAM}">${Array.from({ length: 9 }, (_, i) => `<rect x="${14 + i * 13}" y="12" width="6" height="20" rx="3"/>`).join('')}</g>` });

  // Back wall: two windows onto the street, icon pennants, shelves of boxed phones in relief.
  const win = (id: string, x: number, seed: number) => [on(back, 1.2, x, 190, 130, 150, { id, stock: 'vellum', c: GLOW, emit: .55, density: 2, print: streetView(130, 150, seed) }), on(back, 3, x - 8, 182, 146, 166, { id: `${id}-frame`, stock: 'cover', c: CREAM, density: 2, mask: slot(146, 166, [8, 8, 62, 71], [76, 8, 62, 71], [8, 87, 62, 71], [76, 87, 62, 71]) })];
  const pennant = (id: string, x: number, y: number, c: string, icon: string) => on(back, 3, x, y, 120, 46, { id, stock: 'cover', c, print: icon, mask: '<path d="M0 0H120V46H0L12 23Z" fill="#fff"/>' });
  const percent = `<g fill="${CREAM}"><circle cx="50" cy="15" r="6"/><circle cx="72" cy="31" r="6"/><path d="M48 36L74 10" stroke="${CREAM}" stroke-width="5"/></g>`;
  const phoneIcon = `<rect x="52" y="7" width="18" height="32" rx="3" fill="${CREAM}"/><rect x="55" y="11" width="12" height="22" fill="${BLUE}"/>`;
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
    ...shelf('sh-c', 660, 130, 240, [0, 1, 2, 3, 4].map(i => ({ x: 12 + i * 44, w: 30, h: [46, 46, 40, 46, 40][i], ...phoneBox([SUN, BLUE, CORAL, MINT, PLUM][i], screens[(i + 1) % 3]) }))),
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
  const shopper = stand('shopper', -450, -40, 0, 70, 176, '#3f5f7a', { stock: 'cover', density: 2, mask: '<path d="M22 176V120H14V64Q14 44 30 42Q20 36 22 22Q24 4 36 4Q50 4 50 22Q51 36 42 42Q58 44 58 64V100H70V140H50V176H40V128H32V176Z" fill="#fff"/>', print: `<rect y="0" width="70" height="44" fill="#f3c9a0"/><path d="M20 4Q36 -6 52 8V18Q36 10 20 18Z" fill="#4a2c1a"/><rect y="44" width="70" height="80" fill="${MINT}"/><rect x="48" y="100" width="22" height="40" fill="${CORAL}"/><rect x="22" y="124" width="30" height="52" fill="#3f5f7a"/>` }, 35);

  // Right wall: a clock and a framed print of the phone, in relief.
  const rwOn = (id: string, z: number, y: number, w: number, h: number, c: string, print: string, out: number, mask?: string): Panel => ({ id, stock: 'cover', c, w, h, o: [W / 2 - out, y, z], u: [0, 0, 1], v: [0, 1, 0], edge: 'cut', print, mask });
  const wallDeco = relief(rw, [
    rwOn('clock', -40, 300, 64, 64, CREAM, `<circle cx="32" cy="32" r="26" fill="#fff"/><g stroke="${INK}" stroke-width="3" stroke-linecap="round"><path d="M32 32V14M32 32L44 38"/></g>${Array.from({ length: 12 }, (_, i) => `<circle cx="${32 + Math.cos(i * Math.PI / 6) * 21}" cy="${32 + Math.sin(i * Math.PI / 6) * 21}" r="1.6" fill="${INK}"/>`).join('')}`, 6, '<circle cx="32" cy="32" r="32" fill="#fff"/>'),
    rwOn('frame', 60, 180, 120, 150, WOOD, `<rect x="8" y="8" width="104" height="134" fill="${CORAL}"/><g transform="translate(36 26)">${phoneArt(48, 92, CORAL)}</g>`, 5),
    rwOn('shelf-r', 210, 150, 120, 10, WOOD, '', 30), ...[0, 1].map(i => rwOn(`pot-r${i}`, 220 + i * 54, 160, 34, 40, i ? MINT : SUN, `<rect width="34" height="10" fill="${INK}" fill-opacity=".2"/>`, 22))
  ]);
  // Showcase: the phone on a turntable. Its colour is the page's variant picker; the chips are the swatches.
  const ped = box({ id: 'pedestal', x: 0, z: -112, w: 130, h: 76, d: 90, stock: 'cover', c: DEEP, front: `<rect x="10" y="10" width="110" height="56" fill="none" stroke="${CREAM}" stroke-width="3"/>`, top: `<ellipse cx="65" cy="45" rx="56" ry="38" fill="${CREAM}"/><ellipse cx="65" cy="45" rx="44" ry="28" fill="#e9dcc4"/>` });
  const phones = VARIANT_COLORS.map((c, i): Panel => ({ ...stand(`phone-${i}`, 0, -118, 78, 48, 92, c, { density: 3, mask: '<rect width="48" height="92" rx="7" fill="#fff"/>', print: phoneArt(48, 92, c, screens[i]) }, 0, 12), show: { toy: 'variant', at: [i] } }));
  const chips = VARIANT_COLORS.map((c, i): Panel => ({ ...loose(ped[0], 1.4, 34 + i * 26, 50, 16, 16, { id: `chip-${i}`, stock: 'cover', c, mask: '<circle cx="8" cy="8" r="8" fill="#fff"/>' }), motion: { toy: 'variant', at: [i], slide: [0, 14, 6] } }));

  // Catalog paper: a tri-fold leaflet on a low stand. Its close-up holds the secondary pages.
  const catStand = box({ id: 'cat-stand', x: -175, z: -128, w: 84, h: 44, d: 54, stock: 'greyboard', c: WOOD });
  const leafPrint = (k: number) => `<rect width="56" height="76" fill="#fbf7ee"/><rect width="56" height="9" fill="${[BLUE, CORAL, MINT][k]}"/>${k === 1 ? `<g transform="translate(16 16)">${phoneArt(24, 44, BLUE)}</g>${textBars(8, 64, 40, 2)}` : textBars(7, 18, 42, 7)}`;
  const leaflet = [-1, 0, 1].map((k): Panel => {
    const rot = k * -32, hx = k === 0 ? -28 : k < 0 ? -28 : 28, r = yaw(rot);
    const hinge: V3 = [-175 + hx * (k === 0 ? 0 : 1), 44, -120], o = k === 0 ? [-175 - 28, 44, -120] as V3 : k < 0 ? add(hinge, r([-56, 0, 0])) : hinge;
    return { id: `leaflet-${k + 1}`, stock: 'bond', c: '#fbf7ee', w: 56, h: 76, o, u: r([1, 0, 0]), v: [0, .97, -.24], edge: 'fold', density: 3, print: leafPrint(k + 1) };
  });

  // Price tag: the promotion. Pressing A sticks the deal on and tears the coupon off.
  const promoStand = box({ id: 'promo-stand', x: 175, z: -128, w: 80, h: 54, d: 54, stock: 'cover', c: CORAL, front: `<g fill="${CREAM}"><circle cx="30" cy="20" r="6"/><circle cx="50" cy="36" r="6"/></g><path d="M28 40L52 16" stroke="${CREAM}" stroke-width="5"/>` });
  const pole = stand('promo-pole', 175, -128, 54, 4, 86, STEEL, { stock: 'greyboard' });
  const tagPrint = (deal: boolean) => `<rect width="84" height="54" fill="${CREAM}"/><circle cx="10" cy="27" r="4" fill="${INK}"/><rect x="20" y="12" width="52" height="11" rx="3" fill="${deal ? '#b7bcc3' : INK}"/>${deal ? `<path d="M16 24L76 10" stroke="${CORAL}" stroke-width="3.4"/><rect x="20" y="31" width="44" height="13" rx="3" fill="${CORAL}"/>` : textBars(20, 33, 44, 2)}`;
  const tags = [false, true].map((deal, i): Panel => ({ ...stand(`tag-${i}`, 175, -122, 82, 84, 54, CREAM, { stock: 'bond', density: 3, mask: '<path d="M14 0H84V54H14L0 27Z" fill="#fff"/>', print: tagPrint(deal) }, -6), show: { toy: 'promo', at: [i] } }));
  const burstPath = Array.from({ length: 16 }, (_, i) => { const t = i * Math.PI / 8, r = i % 2 ? 13 : 20; return `${i ? 'L' : 'M'}${(20 + Math.cos(t) * r).toFixed(1)} ${(20 + Math.sin(t) * r).toFixed(1)}`; }).join('');
  const burst: Panel = { ...stand('promo-burst', 207, -116, 114, 40, 40, SUN, { density: 3, mask: `<path d="${burstPath}Z" fill="#fff"/>`, print: `<rect width="40" height="40" fill="${SUN}"/><g fill="${CORAL}"><circle cx="14" cy="14" r="4"/><circle cx="26" cy="26" r="4"/></g><path d="M12 28L28 12" stroke="${CORAL}" stroke-width="3.4"/>` }, 8), show: { toy: 'promo', at: [1] } };
  const coupon = (i: number): Panel => i === 0
    ? { ...stand('coupon-0', 175, -121, 55, 60, 26, '#fff4e2', { stock: 'bond', density: 3, print: `<rect width="60" height="26" fill="#fff4e2" stroke="${CORAL}" stroke-width="2" stroke-dasharray="4 3"/><circle cx="14" cy="13" r="8" fill="${CORAL}"/>${textBars(28, 8, 26, 2, '#e8a089')}` }, -6), show: { toy: 'promo', at: [0] } }
    : { id: 'coupon-1', stock: 'bond', c: '#fff4e2', w: 60, h: 26, o: [146, 54.6, -104], u: yaw(18)([1, 0, 0]), v: yaw(18)([0, 0, -1]), edge: 'cut', density: 3, print: `<rect width="60" height="26" fill="#fff4e2" stroke="${CORAL}" stroke-width="2" stroke-dasharray="4 3"/><circle cx="14" cy="13" r="8" fill="${CORAL}"/>${textBars(28, 8, 26, 2, '#e8a089')}`, show: { toy: 'promo', at: [1] } };

  // Basket: add to cart in one press. Each press drops one more boxed phone in; the fourth empties it.
  const basket = box({ id: 'basket', x: -395, z: 110, w: 92, h: 50, d: 66, stock: 'cover', c: BLUE, noTop: true, front: `<g fill="${DEEP}">${Array.from({ length: 5 }, (_, i) => `<rect x="${10 + i * 16}" y="12" width="8" height="26" rx="4"/>`).join('')}</g>`, right: `<g fill="${DEEP}">${Array.from({ length: 3 }, (_, i) => `<rect x="${10 + i * 16}" y="12" width="8" height="26" rx="4"/>`).join('')}</g>` });
  const handle = stand('basket-handle', -395, 110, 50, 92, 46, DEEP, { mask: '<path d="M0 46Q0 0 46 0Q92 0 92 46H82Q82 10 46 10Q10 10 10 46Z" fill="#fff"/>' });
  const inCart = [0, 1, 2].flatMap(k => box({ id: `cart-${k}`, x: -418 + k * 22, z: 104 + (k % 2) * 8, y: 22 + k * 6, w: 30, h: 46, d: 14, rot: [-8, 6, -3][k], stock: 'cover', c: VARIANT_COLORS[k], front: `<rect x="5" y="6" width="20" height="34" rx="2" fill="#1d2228"/><rect x="7" y="9" width="16" height="27" fill="${screens[k]}"/>` }).filter(p => /front|top/.test(p.id)).map((p): Panel => ({ ...p, show: { toy: 'cart', at: [1, 2, 3].filter(n => n > k) } })));

  // Recommended shelf: a stepped riser. Boxes wait behind grey placeholders that fold away as you arrive
  // (lazy loading); A turns the shelf to the next set (the carousel).
  const riser = [...box({ id: 'riser-lo', x: 405, z: 60, w: 150, h: 40, d: 50, stock: 'greyboard', c: WOOD, front: planks(150, 40, WOOD, '#6d4524', 20) }), ...box({ id: 'riser-hi', x: 405, z: 12, w: 150, h: 84, d: 46, stock: 'greyboard', c: WOOD, front: planks(150, 84, WOOD, '#6d4524', 28) })];
  const recCols = [[SUN, PLUM, CORAL, MINT], [BLUE, CREAM, MINT, CORAL]];
  const recs = [0, 1, 2, 3].flatMap(k => {
    const x = 360 + (k % 2) * 82, z = k < 2 ? 70 : 22, y = k < 2 ? 40 : 84;
    const slotted = recCols.map((cols, set): Panel => ({ ...stand(`rec-${k}-${set}`, x, z, y, 44, 62, cols[k], { density: 2.4, print: `<rect width="44" height="62" fill="${cols[k]}"/><rect x="9" y="8" width="26" height="44" rx="3" fill="#1d2228"/><rect x="12" y="12" width="20" height="34" fill="${screens[(k + set) % 3]}"/>${stars(6, 54, 4 + ((k + set) % 2), 6)}` }), show: { toy: 'recs', at: [set] } }));
    const skeleton: Panel = { ...stand(`rec-${k}-wait`, x, z + 1.5, y, 46, 64, GREY, { stock: 'bond', density: 2, print: `<rect width="46" height="64" fill="${GREY}"/><rect x="10" y="9" width="26" height="30" rx="3" fill="#e2e5e9"/>${textBars(9, 46, 28, 2, '#e2e5e9')}` }), motion: { when: 'recs', edge: 'bottom', deg: 84 } };
    return [...slotted, skeleton];
  });

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
  const lamps = [[-175, -60], [0, -90], [175, -60]] as const;
  const panels = [sill('sill', '#6d4524'), bunting, fl, rug, mat, back, lw, rw, peg, ...accessories, ...wallDeco, ...win('win-a', 150, 4), ...win('win-b', 760, 9),
    pennant('tag-promo', 120, 352, CORAL, percent), pennant('tag-phones', 800, 352, BLUE, phoneIcon), poster, ...shelves,
    ...ped, ...phones, ...chips, ...catStand, ...leaflet, ...promoStand, pole, ...tags, burst, coupon(0), coupon(1),
    ...basket, handle, ...inCart, ...riser, ...recs, shopper, ...stairCard('stairs', 395, 1, WOOD),
    ...lamps.flatMap(([x, z], i) => lampSet(`lamp-${i}`, x, z, 300, H)), ...foreground];
  return { id: 'shop', camera: { zoom: .8, x0: -30, x1: 30 }, light: ROOM_LIGHT, lamps: lamps.map(([x, z]) => lamp(x, z, 300)), panels };
}

/* ---------- second floor: product reviews ---------- */
// Six reviews on the board: stars, and a photo whose shape varies the way customers' photos do.
const REVIEWS = [{ stars: 5, photo: 'tall' }, { stars: 4, photo: null }, { stars: 5, photo: 'wide' }, { stars: 3, photo: 'square' }, { stars: 5, photo: null }, { stars: 4, photo: 'wide' }] as const;
// Which reviews each board filter keeps: 0 all, 1 with photo, 2 five stars.
const KEEP = [(_: typeof REVIEWS[number]) => true, (r: typeof REVIEWS[number]) => !!r.photo, (r: typeof REVIEWS[number]) => r.stars === 5];
const PHOTO_SHAPE = { tall: [26, 40], wide: [44, 26], square: [32, 32] } as const;
const snapshot = (w: number, h: number, k: number) => {
  const sky = ['#bfe6f8', '#ffd3a8', '#c8f0d8', '#e0d4ff'][k % 4], ground = ['#7fbf6a', '#e9a77b', '#35b58a', '#0a6aa8'][k % 4];
  return `<rect width="${w}" height="${h}" fill="${sky}"/><circle cx="${w * .72}" cy="${h * .28}" r="${Math.min(w, h) * .14}" fill="${SUN}"/><path d="M0 ${h * .72}L${w * .35} ${h * .46}L${w * .6} ${h * .66}L${w} ${h * .5}V${h}H0Z" fill="${ground}"/>`;
};


// Stock on the store-room racks. `w` is depth off the wall, `d` the width along it; `face` prints the side turned to the room.
type Good = { w: number; h: number; d: number; stock: Stock; c: string; side?: string; face: string; end?: string; top?: string; noTop?: boolean; rot?: number };
function stockItems() {
  const label = (x: number, y: number, w = 22, c = CORAL) => `<rect x="${x}" y="${y}" width="${w}" height="${w * .55}" fill="#fbf7ee"/><rect x="${x}" y="${y}" width="${w}" height="3" fill="${c}"/>`;
  return {
    carton: (d: number, h: number, open = false): Good => ({ w: 26, h, d, stock: 'kraft', c: KRAFT, face: `${flutes(d, h)}<rect x="${d / 2 - 5}" width="10" height="${h * .55}" fill="${TAPE}"/>${label(5, h - 18)}${h > 44 ? upArrows(d - 24, 8) : ''}`, end: `${flutes(26, h)}<rect x="5" y="${h * .4}" width="16" height="9" fill="#fbf7ee"/>`, top: open ? `<rect width="26" height="${d}" fill="#5a3a20"/><path d="M0 0L26 ${d * .2}V${d * .45}L0 ${d * .3}Z" fill="${KRAFT}"/>` : `${flutes(26, d)}<rect x="8" width="10" height="${d}" fill="${TAPE}"/>` }),
    tote: (c: string, d: number): Good => ({ w: 28, h: 34, d, stock: 'cover', c, face: `<rect x="${d / 2 - 11}" y="5" width="22" height="7" rx="3.5" fill="${INK}" fill-opacity=".7"/>${label(5, 17, 18, INK)}<rect y="${34 - 4}" width="${d}" height="4" fill="#000" fill-opacity=".12"/>`, end: `<rect x="9" y="5" width="10" height="6" rx="3" fill="${INK}" fill-opacity=".7"/>`, top: `<rect x="3" y="3" width="22" height="${d - 6}" fill="${INK}" fill-opacity=".55"/><rect x="6" y="${d * .2}" width="14" height="${d * .3}" fill="${KRAFT}"/><rect x="8" y="${d * .58}" width="12" height="${d * .25}" fill="${CREAM}"/>` }),
    crate: (c: string, d: number): Good => ({ w: 28, h: 30, d, stock: 'cover', c, face: Array.from({ length: 4 }, (_, i) => `<rect x="4" y="${4 + i * 7}" width="${d - 8}" height="3" fill="#000" fill-opacity=".22"/>`).join('') + `<rect x="${d / 2 - 9}" y="4" width="18" height="6" rx="3" fill="${INK}" fill-opacity=".6"/>`, end: Array.from({ length: 4 }, (_, i) => `<rect x="3" y="${4 + i * 7}" width="22" height="3" fill="#000" fill-opacity=".22"/>`).join(''), top: `<rect x="3" y="3" width="22" height="${d - 6}" fill="#000" fill-opacity=".3"/>` }),
    phones: (c: string, n: number): Good => ({ w: 22, h: 30, d: n * 17, stock: 'cover', c, face: Array.from({ length: n }, (_, i) => `<path d="M${i * 17} 0V30" stroke="#000" stroke-opacity=".25"/><rect x="${i * 17 + 4}" y="5" width="9" height="18" rx="1.5" fill="${INK}"/><rect x="${i * 17 + 5}" y="7" width="7" height="13" fill="#bfe6f8"/>`).join(''), end: `<rect x="4" y="6" width="14" height="4" fill="${CREAM}"/>` }),
    tapes: (n: number): Good => ({ w: 20, h: 20, d: n * 21, stock: 'vellum', c: '#e9d5a6', face: Array.from({ length: n }, (_, i) => `<circle cx="${i * 21 + 10.5}" cy="10" r="9" fill="${TAPE}"/><circle cx="${i * 21 + 10.5}" cy="10" r="5" fill="${KRAFT}"/>`).join('') }),
    binders: (n: number): Good => ({ w: 26, h: 54, d: n * 10, stock: 'cover', c: INK, face: Array.from({ length: n }, (_, i) => `<rect x="${i * 10}" width="9.4" height="54" fill="${[BLUE, CORAL, SUN, MINT, PLUM, BLUE][i % 6]}"/><rect x="${i * 10 + 2}" y="10" width="5.4" height="14" fill="#fbf7ee"/><circle cx="${i * 10 + 4.7}" cy="42" r="2.2" fill="${INK}" fill-opacity=".5"/>`).join('') }),
    wrap: (d: number): Good => ({ w: 28, h: 28, d, stock: 'vellum', c: '#dbeef5', face: Array.from({ length: Math.floor(d / 7) }, (_, i) => Array.from({ length: 4 }, (_, k) => `<circle cx="${4 + i * 7 + (k % 2) * 3.5}" cy="${4 + k * 7}" r="2.3" fill="#fff" fill-opacity=".8"/>`).join('')).join(''), end: `<circle cx="14" cy="14" r="12" fill="#c4e2ec"/><circle cx="14" cy="14" r="4" fill="${KRAFT}"/>` }),
    flats: (d: number, n: number): Good => ({ w: 28, h: n * 3.4, d, stock: 'kraft', c: KRAFT, face: Array.from({ length: n }, (_, i) => `<rect y="${i * 3.4}" width="${d - (i % 3) * 4}" height="1.4" fill="${i % 2 ? '#94633a' : '#d1a46e'}"/>`).join('') }),
    labels: (): Good => ({ w: 24, h: 24, d: 48, stock: 'bond', c: '#fbf7ee', face: [0, 1].map(i => `<circle cx="${12 + i * 24}" cy="12" r="10.5" fill="#fff"/><circle cx="${12 + i * 24}" cy="12" r="4" fill="${[SUN, MINT][i]}"/>`).join('') })
  };
}
// The handrail fixed to the left wall, falling with the stairs from the landing to the front of the floor slab.
function wallRail(): Panel[] {
  // Drawn from the front end back up the slope so both faces turn toward the room and the light.
  const z0 = 92, z1 = 248, y0 = 98, y1 = 14, len = Math.hypot(z1 - z0, y1 - y0), u: V3 = [0, (y0 - y1) / len, (z0 - z1) / len];
  return [
    { id: 'wall-rail', stock: 'greyboard', c: '#6d4524', w: len, h: 7, o: [-W / 2 + 12, y1 - 7, z1], u, v: [0, (z1 - z0) / len, (y0 - y1) / len], edge: 'fold' },
    { id: 'wall-rail-top', stock: 'greyboard', c: '#86593a', w: len, h: 8, o: [-W / 2 + 12, y1, z1], u, v: [-1, 0, 0], edge: 'fold' }
  ];
}

export function storeroom(): Scene {
  reseed(33);
  const H = 300, PEAK = 200, TOP = H + PEAK, wood = '#8f6f55', plank = (w: number, h: number) => planks(w, h, wood, '#5e4530', 74, 'y');
  const back = backWall(W, TOP, wood, { id: 'wall-back', mask: `<path d="M0 ${TOP}V${PEAK}L${W / 2} 0L${W} ${PEAK}V${TOP}Z" fill="#fff"/>`, print: plank(W, TOP) });
  const lw = { ...leftWall(H, wood, 'wall-left', plank(D, H)), density: 2 }, rw = { ...rightWall(H, wood, 'wall-right', plank(D, H)), density: 2 };
  // The stairs go down: the floor is notched at the front left and the cut slab shows the flight dropping to the shop.
  const fl = floor('floor', '#8b8275', specks(W, D, '#6f675c', 320, 4) + Array.from({ length: 5 }, (_, i) => `<path d="M${(i + 1) * W / 6} 0V${D}" stroke="#6f675c" stroke-width="2"/>`).join('') + `<path d="M0 214H${W}M0 222H${W}" stroke="${SUN}" stroke-width="5" stroke-dasharray="26 18"/><path d="M${WELL.x0 + W / 2 - 4} ${D}V${D / 2 + WELL.z0 - 4}H${WELL.x1 + W / 2 + 4}V${D}" fill="none" stroke="${SUN}" stroke-width="5" stroke-dasharray="14 10"/>`);
  // The floor's print runs from the back edge (top) to the front edge (bottom), so the notch sits at the bottom.
  fl.mask = `<path fill-rule="evenodd" d="M0 0H${W}V${D}H0Z M${WELL.x0 + W / 2} ${D}V${D / 2 + WELL.z0}H${WELL.x1 + W / 2}V${D}Z" fill="#fff"/>`;
  const roundWin = on(back, 1.2, W / 2 - 60, 318, 120, 120, { id: 'round-win', stock: 'vellum', c: GLOW, emit: .5, density: 2, mask: '<circle cx="60" cy="60" r="60" fill="#fff"/>', print: streetView(120, 120, 17) });
  const roundFrame = on(back, 3, W / 2 - 68, 310, 136, 136, { id: 'round-frame', stock: 'cover', c: CREAM, density: 2, mask: '<path fill-rule="evenodd" d="M68 0a68 68 0 1 0 .01 0Z M68 8a60 60 0 1 1 -.01 0Z" fill="#fff"/><rect x="65" y="4" width="6" height="128" fill="#fff"/><rect x="4" y="65" width="128" height="6" fill="#fff"/>' });
  const bx = (wx: number) => wx + W / 2;

  // Review board: cork on the back wall. Three paper tabs filter it; reviews that drop out fold down.
  const cork = on(back, 2, bx(80), 100, 400, 196, { id: 'cork', stock: 'greyboard', c: '#c89a62', print: specks(400, 196, '#9a6e3c', 260, 3), edge: 'cut' });
  const corkFrame = on(back, 3, bx(74), 94, 412, 208, { id: 'cork-frame', stock: 'greyboard', c: '#6d4524', mask: slot(412, 208, [6, 6, 400, 196]) });
  const tabIcons = [`<g fill="${INK}"><rect x="11" y="9" width="22" height="3"/><rect x="11" y="15" width="22" height="3"/><rect x="11" y="21" width="22" height="3"/></g>`, `<rect x="11" y="10" width="22" height="15" rx="3" fill="${INK}"/><circle cx="22" cy="17.5" r="4.5" fill="${CREAM}"/>`, stars(14, 8, 1, 16)];
  const tabs = tabIcons.map((icon, i): Panel => ({ ...loose(back, 3.4, bx(100 + i * 52), 288, 44, 32, { id: `tab-${i}`, stock: 'cover', c: [CREAM, SKY, SUN][i], mask: '<path d="M0 32V8Q0 0 8 0H36Q44 0 44 8V32Z" fill="#fff"/>', print: icon }), motion: { toy: 'filter', at: [i], slide: [0, 12, 0] } }));
  const reviewCards = REVIEWS.map((r, i): Panel => {
    const col = i % 3, row = Math.floor(i / 3), w = 112, h = 78, hide = [0, 1, 2].filter(f => !KEEP[f](r));
    const photo = r.photo ? PHOTO_SHAPE[r.photo] : null;
    const print = `<rect width="${w}" height="${h}" fill="#fbf7ee"/><circle cx="${w / 2}" cy="5" r="3.4" fill="${CORAL}"/>${stars(7, 10, r.stars, 9)}${photo ? `<g transform="translate(7 ${70 - photo[1]})">${snapshot(photo[0], photo[1], i)}</g>${textBars(photo[0] + 13, 30, w - photo[0] - 22, 4)}` : textBars(8, 30, w - 18, 5)}`;
    return { ...loose(back, 4.2 + i * .2, bx(98 + col * 126), 196 - row * 92, w, h, { id: `review-${i}`, stock: 'bond', c: '#fbf7ee', density: 2.6, print }), ...(hide.length ? { show: { toy: 'filter', at: [0, 1, 2].filter(f => !hide.includes(f)) } } : {}) };
  });
  // One card is still in the old theme: the redesign is being rolled out, card by card.
  const oldCard = on(back, 4, bx(-6), 112, 70, 60, { id: 'old-card', stock: 'bond', c: '#e4e4e4', print: `<rect width="70" height="60" fill="#e4e4e4"/><rect width="70" height="12" fill="#9aa2ac"/>${textBars(6, 20, 56, 5, '#b7bcc3')}` });
  const cans = [...box({ id: 'can-new', x: 470, z: -120, w: 34, h: 40, d: 34, stock: 'cover', c: BLUE, top: `<rect width="34" height="34" fill="${BLUE}"/><circle cx="17" cy="17" r="12" fill="${DEEP}"/>`, front: `<rect y="10" width="34" height="16" fill="${CREAM}"/><path d="M6 0V12M24 0V8" stroke="${BLUE}" stroke-width="5"/>` }), ...box({ id: 'can-old', x: 446, z: -82, w: 30, h: 34, d: 30, rot: 14, stock: 'cover', c: '#9aa2ac', front: `<rect y="9" width="30" height="13" fill="#e4e4e4"/>` })];
  const roller = stand('roller', 432, -128, 0, 26, 92, BLUE, { mask: '<path d="M0 72H26V92H0Z M11 0H15V72H11Z" fill="#fff"/>', print: `<rect y="72" width="26" height="20" fill="${BLUE}"/><rect x="11" width="4" height="72" fill="${STEEL}"/>` }, -18, -14);

  // Photo gallery on a pegboard: grid view pins square crops in rows; list view hangs every photo
  // at its own shape on a line, each over its caption card.
  const pegboard = on(back, 2, bx(-340), 104, 300, 190, { id: 'gallery-board', stock: 'greyboard', c: '#e9dcc4', print: Array.from({ length: 13 }, (_, i) => Array.from({ length: 8 }, (_, k) => `<circle cx="${12 + i * 23}" cy="${12 + k * 23}" r="2.2" fill="#a8977a"/>`).join('')).join('') });
  const shapes = ['tall', 'wide', 'square', 'wide', 'tall', 'square'] as const;
  const grid = shapes.map((_, i): Panel => ({ ...loose(back, 3.4 + i * .1, bx(-322 + (i % 3) * 94), 208 - Math.floor(i / 3) * 90, 72, 72, { id: `grid-${i}`, stock: 'bond', c: '#fff', density: 2.6, print: `<rect width="72" height="72" fill="#fff"/><g transform="translate(5 5)">${snapshot(62, 62, i)}</g>` }), show: { toy: 'gallery', at: [0] } }));
  const lineY = 276;
  const line = { ...loose(back, 3, bx(-336), lineY, 292, 2, { id: 'gallery-line', stock: 'greyboard', c: INK }), show: { toy: 'gallery', at: [1] } } as Panel;
  let lx = bx(-330);
  const list = shapes.flatMap((s, i): Panel[] => {
    const [pw, ph] = PHOTO_SHAPE[s].map(n => n * 1.15), x = lx; lx += pw + 6;
    return [{ ...loose(back, 3.4 + i * .1, x, lineY - ph - 2, pw, ph, { id: `list-${i}`, stock: 'bond', c: '#fff', density: 2.6, print: `<rect width="${pw}" height="${ph}" fill="#fff"/><g transform="translate(3 3)">${snapshot(pw - 6, ph - 6, i)}</g><rect x="${pw / 2 - 3}" y="0" width="6" height="5" fill="${SUN}"/>` }), show: { toy: 'gallery', at: [1] } },
      { ...loose(back, 3.3, x, lineY - ph - 46, pw, 34, { id: `cap-${i}`, stock: 'bond', c: '#fbf7ee', density: 2.4, print: `<rect width="${pw}" height="34" fill="#fbf7ee"/>${stars(3, 4, [5, 4, 5, 3, 5, 4][i], 5)}${textBars(3, 16, pw - 8, 2)}` }), show: { toy: 'gallery', at: [1] } }];
  });

  // Reviewer's desk: write a review. The camera's print comes out sideways (the phone camera's EXIF turn);
  // the next press sets it upright on the review card. The card's stars count up with each press.
  const desk = box({ id: 'desk', x: -60, z: 60, w: 260, h: 80, d: 90, stock: 'cover', c: WOOD, top: planks(260, 90, WOOD, '#6d4524', 30), front: `<path d="M86 10V72M174 10V72" stroke="#6d4524" stroke-width="3"/><g fill="${CREAM}"><rect x="34" y="36" width="20" height="6"/><rect x="120" y="36" width="20" height="6"/><rect x="206" y="36" width="20" height="6"/></g>` });
  const camera = box({ id: 'camera', x: -148, z: 66, y: 80, w: 62, h: 48, d: 40, stock: 'cover', c: CREAM, front: `<rect width="62" height="14" fill="${CORAL}"/><circle cx="31" cy="27" r="14" fill="${INK}"/><circle cx="31" cy="27" r="8" fill="#3d5a73"/><circle cx="34" cy="24" r="2.4" fill="#bfe6f8"/><rect x="48" y="18" width="9" height="6" fill="${INK}"/><rect x="10" y="40" width="42" height="3" fill="${INK}"/>`, top: `<rect x="44" y="12" width="12" height="8" rx="2" fill="${CORAL}"/>` });
  const shot = (rot: boolean) => `<rect width="${rot ? 50 : 40}" height="${rot ? 40 : 50}" fill="#fff"/><g transform="${rot ? 'translate(4 36) rotate(-90)' : 'translate(4 4)'}">${snapshot(32, 32, 2)}</g>`;
  const ejected: Panel = { id: 'photo-out', stock: 'bond', c: '#fff', w: 50, h: 40, o: [-173, 80.8, 124], u: [1, 0, 0], v: [0, .12, -.99], edge: 'cut', density: 3, print: shot(true), show: { toy: 'photo', at: [1] } };
  const form = stand('review-form', 20, 66, 80, 118, 84, '#fbf7ee', { stock: 'bond', density: 3, print: `<rect width="118" height="84" fill="#fbf7ee"/><rect width="118" height="10" fill="${BLUE}"/><rect x="8" y="34" width="40" height="44" fill="none" stroke="#c9ccd1" stroke-width="2" stroke-dasharray="4 3"/>${textBars(56, 40, 54, 5)}` }, 0, 14);
  const ratings = [1, 2, 3, 4, 5].map((n, i): Panel => ({ ...stand(`stars-${n}`, 20, 67.2, 80, 118, 84, '#fbf7ee', { stock: 'bond', density: 3, mask: '<rect x="4" y="13" width="110" height="18" fill="#fff"/>', print: `<rect width="118" height="84" fill="#fbf7ee"/>${stars(8, 15, n, 14)}` }, 0, 14), show: { toy: 'rating', at: [i] } }));
  const pinned: Panel = { ...stand('photo-on', -11, 68.4, 84.5, 40, 44, '#fff', { stock: 'bond', density: 3, print: `<rect width="40" height="44" fill="#fff"/><g transform="translate(4 4)">${snapshot(32, 36, 2)}</g>` }, 0, 14), show: { toy: 'photo', at: [2] } };
  const mug = box({ id: 'mug', x: 50, z: 84, y: 80, w: 22, h: 26, d: 22, stock: 'cover', c: CORAL, front: `<rect y="6" width="22" height="5" fill="${CREAM}"/>` });

  // Side walls: steel racking carved in relief. Every piece has real depth, so shelf lips, box ends and tops read from the room.
  const rack = (wall: Panel, side: 1 | -1, id: string, z0: number, z1: number, rows: Good[][]): Panel[] => {
    const DEPTH = 30, x = side * (W / 2 - DEPTH / 2), span = z1 - z0, levels = [26, 104, 182, 258];
    const face = (p: string, q?: string) => (side < 0 ? { right: p, front: q } : { left: p, front: q });
    const posts = [z0 + 3, (z0 + z1) / 2, z1 - 3].flatMap((z, i) => box({ id: `${id}-post${i}`, x, z, w: DEPTH, h: 280, d: 6, stock: 'greyboard', c: '#6b7480', ...face(`<g fill="#2f353d">${Array.from({ length: 22 }, (_, k) => `<rect x="1.6" y="${8 + k * 12}" width="2.8" height="5"/>`).join('')}</g>`, `<path d="M3 0V280M${DEPTH - 3} 0V280" stroke="#4d5560" stroke-width="3"/>${Array.from({ length: 13 }, (_, k) => `<path d="M3 ${10 + k * 21}L${DEPTH - 3} ${20 + k * 21}" stroke="#4d5560" stroke-width="2"/>`).join('')}`) }));
    const boards = levels.flatMap((y, i) => box({ id: `${id}-shelf${i}`, x, z: (z0 + z1) / 2, y: y - 6, w: DEPTH + 2, h: 6, d: span, stock: 'greyboard', c: '#58606b', ...face(`<rect width="${span}" height="2" fill="#7b838e"/>`), top: `<rect width="${DEPTH + 2}" height="${span}" fill="#6b737e"/>` }));
    const goods = rows.flatMap((row, r) => {
      let z = z0 + 8;
      return row.flatMap((g, k) => {
        const gap = 6 + ((k * 7 + r * 3) % 4) * 3, at = z + g.d / 2; z += g.d + gap;
        if (z > z1 - 4) return [];
        return box({ id: `${id}-g${r}${k}`, x: x + side * (DEPTH - g.w) / 2, z: at, y: levels[r], w: g.w, h: g.h, d: g.d, stock: g.stock, c: g.c, side: g.side, ...face(g.face, g.end), top: g.top, noTop: g.noTop, rot: g.rot });
      });
    });
    return carved(wall, [...posts, ...boards, ...goods]);
  };
  const plinth = (side: 1 | -1, id: string, z0: number, z1: number): Panel => ({ id, stock: 'greyboard', c: '#2f353d', w: z1 - z0, h: 22, o: side < 0 ? [-W / 2 + 32, 0, z1] : [W / 2 - 32, 0, z0], u: side < 0 ? [0, 0, -1] : [0, 0, 1], v: [0, 1, 0], edge: 'fold' });
  const STOCK_ITEMS = stockItems();
  const rackL = rack(lw, -1, 'rack-l', -238, 70, [
    [STOCK_ITEMS.carton(56, 52), STOCK_ITEMS.tote(CORAL, 62), STOCK_ITEMS.carton(44, 40, true), STOCK_ITEMS.crate(MINT, 58), STOCK_ITEMS.carton(48, 60)],
    [STOCK_ITEMS.phones(BLUE, 3), STOCK_ITEMS.phones(CORAL, 2), STOCK_ITEMS.phones(MINT, 3), STOCK_ITEMS.tapes(3), STOCK_ITEMS.binders(5)],
    [STOCK_ITEMS.wrap(96), STOCK_ITEMS.flats(70, 6), STOCK_ITEMS.carton(40, 34, true), STOCK_ITEMS.tote(SUN, 50)],
    [STOCK_ITEMS.carton(52, 30), STOCK_ITEMS.carton(70, 36, true), STOCK_ITEMS.crate(STEEL, 54), STOCK_ITEMS.carton(40, 26)]
  ]);
  const rackR = rack(rw, 1, 'rack-r', -238, 150, [
    [STOCK_ITEMS.crate(MINT, 60), STOCK_ITEMS.carton(66, 58), STOCK_ITEMS.tote(CORAL, 58), STOCK_ITEMS.carton(50, 44, true), STOCK_ITEMS.carton(58, 62), STOCK_ITEMS.crate(SUN, 52)],
    [STOCK_ITEMS.binders(6), STOCK_ITEMS.phones(CORAL, 3), STOCK_ITEMS.carton(48, 46), STOCK_ITEMS.phones(BLUE, 2), STOCK_ITEMS.labels(), STOCK_ITEMS.phones(MINT, 2)],
    [STOCK_ITEMS.flats(80, 8), STOCK_ITEMS.tote(BLUE, 60), STOCK_ITEMS.wrap(84), STOCK_ITEMS.carton(46, 40, true), STOCK_ITEMS.tapes(4)],
    [STOCK_ITEMS.carton(60, 34), STOCK_ITEMS.crate(STEEL, 56), STOCK_ITEMS.carton(44, 30, true), STOCK_ITEMS.carton(70, 34), STOCK_ITEMS.tote(MINT, 48)]
  ]);
  // Over the stairwell the left wall carries the handrail, the extinguisher and a downward arrow.
  const wallBits = carved(lw, [
    ...box({ id: 'extinguisher', x: -W / 2 + 12, z: 84, y: 70, w: 22, h: 70, d: 22, stock: 'cover', c: CORAL, right: `<rect y="20" width="22" height="26" fill="${CREAM}"/><rect x="5" y="26" width="12" height="3" fill="${INK}"/><rect x="5" y="33" width="9" height="3" fill="${INK}"/>`, top: `<circle cx="11" cy="11" r="6" fill="${INK}"/>` }),
    ...box({ id: 'ext-bracket', x: -W / 2 + 4, z: 84, y: 60, w: 8, h: 90, d: 28, stock: 'greyboard', c: STEEL }),
    ...wallRail(),
    ...[0, 1, 2].flatMap(i => box({ id: `rail-bracket-${i}`, x: -W / 2 + 4, z: 104 + i * 64, y: 72 - i * 35, w: 8, h: 18, d: 6, stock: 'greyboard', c: STEEL }))
  ]);
  const downSign = on(lw, 1.2, 30, 196, 110, 50, { id: 'down-sign', stock: 'cover', c: MINT, mask: '<rect width="110" height="50" rx="8" fill="#fff"/>', print: `<rect x="5" y="5" width="100" height="40" rx="6" fill="none" stroke="${CREAM}" stroke-width="3"/><path d="M30 12V30H20L36 44L52 30H42V12Z" fill="${CREAM}"/><g fill="${CREAM}"><rect x="62" y="26" width="10" height="6"/><rect x="72" y="20" width="10" height="12"/><rect x="82" y="14" width="10" height="18"/></g>` });

  const beltBox = (id: string, x: number, z: number, w: number): Panel[] => box({ id, x, z, w, h: 62, d: 70, stock: 'greyboard', c: STEEL, top: Array.from({ length: Math.round(w / 26) }, (_, i) => `<rect x="${i * 26}" width="13" height="70" fill="#5b6470"/>`).join(''), front: Array.from({ length: Math.round(w / 52) }, (_, i) => `<rect x="${14 + i * 52}" y="16" width="26" height="30" fill="${SUN}"/>`).join('') });
  const onBelt = (group: string, c: string, x: number, z: number) => carton(group, x, z, 62, 54, 40, 46, c, 0, group);
  const stack = [...carton('st-a', -235, 176, 0, 84, 62, 64), ...carton('st-c', -226, 174, 62, 62, 46, 50, KRAFT, 10)];
  const fgBoxes = [...carton('fg-a', 470, 210, 0, 100, 96, 70), ...carton('fg-b', 462, 212, 96, 74, 58, 56, CORAL, -6)];
  // Floor clutter, grouped where a real stock room would keep it.
  const pallet = [...box({ id: 'pallet', x: -410, z: -200, w: 124, h: 16, d: 92, stock: 'greyboard', c: '#a07a52', front: `<g fill="#3a2a1c">${[0, 1, 2].map(i => `<rect x="${10 + i * 44}" y="5" width="18" height="11"/>`).join('')}</g>`, top: Array.from({ length: 6 }, (_, i) => `<rect y="${i * 16}" width="124" height="11" fill="#b58b5f"/>`).join(''), right: `<g fill="#3a2a1c"><rect x="8" y="5" width="22" height="11"/><rect x="62" y="5" width="22" height="11"/></g>` }),
    // pal-a's right face is pressed against pal-b: lit in the bake, never drawn.
    ...carton('pal-a', -440, -196, 16, 58, 52, 80).map(p => (p.id === 'pal-a-right' ? { ...p, ghost: true } : p)), ...carton('pal-b', -382, -198, 16, 56, 52, 80, KRAFT, 3), ...carton('pal-c', -420, -200, 68, 76, 44, 70, CORAL, -4)];
  const truck = stand('hand-truck', 446, 22, 0, 52, 120, STEEL, { stock: 'greyboard', density: 2, mask: '<path d="M6 0H14V96H46V104H40A12 12 0 1 1 18 104H6Z M18 6H40V12H18Z" fill="#fff"/>', print: `<rect width="52" height="120" fill="${STEEL}"/><circle cx="29" cy="108" r="9" fill="#14171b"/><circle cx="29" cy="108" r="3" fill="#8a929c"/><rect x="18" y="6" width="22" height="6" fill="${CORAL}"/>` }, -24, 10);
  const truckLoad = carton('truck-box', 452, 30, 6, 44, 56, 36, KRAFT, -24);
  const bin = [...box({ id: 'recycle', x: 80, z: 178, w: 56, h: 52, d: 44, stock: 'cover', c: '#2f7d5b', noTop: true, front: `<rect x="8" y="8" width="40" height="5" fill="${CREAM}"/><path d="M20 30L28 20L36 30M23 38H33" stroke="${CREAM}" stroke-width="3" fill="none"/>`, right: `<rect x="6" y="8" width="32" height="5" fill="${CREAM}"/>` }),
    stand('recycle-flats', 84, 172, 30, 50, 48, KRAFT, { stock: 'kraft', print: `${flutes(50, 48)}<rect x="4" y="12" width="42" height="2" fill="#94633a"/>`, mask: '<path d="M0 48V10L20 0L50 6V48Z" fill="#fff"/>' }, 8, 10)];
  const stool = box({ id: 'stool', x: 470, z: -30, w: 44, h: 40, d: 40, stock: 'cover', c: SUN, front: `<path d="M6 40V8H38V40H32V14H12V40Z" fill="#000" fill-opacity=".18"/>`, top: `<rect x="4" y="4" width="36" height="32" rx="4" fill="#000" fill-opacity=".08"/>` });
  // Slivers the camera sees edge-on stay in the bake but are not drawn.
  const sliver = (p: Panel) => (/-left$/.test(p.id) ? { ...p, ghost: true } : p);
  const tapeGun = box({ id: 'tape-gun', x: 300, z: 112, y: 62, w: 30, h: 20, d: 14, rot: 18, stock: 'cover', c: CORAL, front: `<circle cx="10" cy="10" r="7" fill="${TAPE}"/><circle cx="10" cy="10" r="3" fill="${INK}"/>` }).map(sliver);
  const scale = box({ id: 'scale', x: 200, z: 112, y: 62, w: 52, h: 12, d: 44, stock: 'cover', c: '#e9ebee', front: `<rect x="6" y="3" width="20" height="6" fill="#1d2228"/><rect x="8" y="4" width="14" height="4" fill="#9be7c4"/>`, top: `<rect x="5" y="5" width="42" height="34" fill="#c9ccd1"/>` }).map(sliver);
  // Under the roof slopes: two high shelves of overflow stock, carved in relief on the back wall.
  const high = (id: string, wx: number, items: { w: number; h: number; c: string; stock: Stock; print?: string }[]): Panel[] => {
    let x = wx - 104;
    return carved(back, [...box({ id: `${id}-board`, x: wx, z: -D / 2 + 15, y: 310, w: 220, h: 6, d: 30, stock: 'greyboard', c: '#58606b' }),
      ...[-90, 90].flatMap((dx, i) => box({ id: `${id}-arm${i}`, x: wx + dx, z: -D / 2 + 3, y: 284, w: 6, h: 26, d: 6, stock: 'greyboard', c: STEEL })),
      ...items.flatMap((g, i) => { const cx = x + g.w / 2; x += g.w + 6; return box({ id: `${id}-i${i}`, x: cx, z: -D / 2 + 15, y: 316, w: g.w, h: g.h, d: 24, stock: g.stock, c: g.c, front: g.print }); })]);
  };
  const highShelves = [
    ...high('high-l', -235, [{ w: 46, h: 30, c: KRAFT, stock: 'kraft', print: flutes(46, 30) + `<rect x="18" width="10" height="16" fill="${TAPE}"/>` }, { w: 36, h: 26, c: CORAL, stock: 'cover' }, { w: 54, h: 34, c: KRAFT, stock: 'kraft', print: flutes(54, 34) + `<rect x="6" y="18" width="18" height="10" fill="#fbf7ee"/>` }, { w: 40, h: 22, c: MINT, stock: 'cover' }]),
    ...high('high-r', 235, [{ w: 40, h: 22, c: SUN, stock: 'cover' }, { w: 56, h: 34, c: KRAFT, stock: 'kraft', print: flutes(56, 34) + `<rect x="23" width="10" height="20" fill="${TAPE}"/>` }, { w: 34, h: 28, c: BLUE, stock: 'cover' }, { w: 50, h: 30, c: KRAFT, stock: 'kraft', print: flutes(50, 30) }])
  ];
  // The flight down: four treads and risers inside the notch, a section of the floor slab, and a balustrade on the open side.
  const SLAB = 92, steps = 4, rise = SLAB / steps, run = (D / 2 - WELL.z0) / steps, ww = WELL.x1 - WELL.x0;
  const flight = Array.from({ length: steps }, (_, i): Panel[] => [
    { id: `step-${i}-riser`, stock: 'greyboard', c: '#6d4524', w: ww, h: rise, o: [WELL.x0, -rise * (i + 1), WELL.z0 + run * i], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4 },
    { id: `step-${i}-tread`, stock: 'greyboard', c: WOOD, w: ww, h: run, o: [WELL.x0, -rise * (i + 1), WELL.z0 + run * (i + 1)], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.4, print: `<rect width="${ww}" height="5" fill="#c08a58"/><rect y="5" width="${ww}" height="2" fill="#3a2010" fill-opacity=".5"/>` }
  ]).flat();
  const wellWall: Panel = { id: 'well-wall', stock: 'greyboard', c: '#5e4530', w: D / 2 - WELL.z0, h: SLAB, o: [WELL.x0, -SLAB, D / 2], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold', density: 1.2, print: planks(D / 2 - WELL.z0, SLAB, '#5e4530', '#3e2c1e', 40, 'y') };
  const slab: Panel = { id: 'slab', stock: 'greyboard', c: '#4a3424', w: W + 40, h: SLAB, o: [-W / 2 - 20, -SLAB, D / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
    mask: `<path fill-rule="evenodd" d="M0 0H${W + 40}V${SLAB}H0Z M${WELL.x0 + W / 2 + 20} 0V${SLAB}H${WELL.x1 + W / 2 + 20}V0Z" fill="#fff"/>`,
    print: `<rect width="${W + 40}" height="8" fill="#8b8275"/><rect y="8" width="${W + 40}" height="4" fill="#2a1d14"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${12 + i * 78}" y="16" width="20" height="${SLAB - 34}" fill="#5e4530"/>`).join('')}<rect y="${SLAB - 18}" width="${W + 40}" height="18" fill="#d9a968"/><rect y="${SLAB - 18}" width="${W + 40}" height="3" fill="#2a1d14" fill-opacity=".5"/>` };
  const baluster = (n: number) => Array.from({ length: n }, (_, i) => `M${8 + i * ((D / 2 - WELL.z0 - 16) / (n - 1)) - 2} 8V58h4V8Z`).join(' ');
  const rail: Panel = { id: 'well-rail', stock: 'greyboard', c: '#6d4524', w: D / 2 - WELL.z0, h: 66, o: [WELL.x1 + 2, 0, D / 2], u: [0, 0, -1], v: [0, 1, 0], edge: 'cut', density: 2,
    mask: `<path d="M0 0H${D / 2 - WELL.z0}V10H0Z M0 0H10V66H0Z M${D / 2 - WELL.z0 - 12} 0H${D / 2 - WELL.z0}V66H${D / 2 - WELL.z0 - 12}Z ${baluster(7)}" fill="#fff"/>`, print: `<rect width="${D / 2 - WELL.z0}" height="4" fill="#86593a"/>` };
  // A packer at the far belt.
  const packer = stand('packer', 400, -150, 0, 70, 168, STEEL, { density: 2, mask: '<path d="M22 168V116H12V62Q12 44 28 42Q20 36 22 22Q24 4 36 4Q50 4 50 22Q51 36 42 42Q58 44 58 62V116H48V168H38V122H32V168Z" fill="#fff"/>', print: `<rect width="70" height="44" fill="#c99a7a"/><path d="M18 14Q36 -8 54 14V20H18Z" fill="${CORAL}"/><rect y="44" width="70" height="76" fill="${MINT}"/><rect x="18" y="56" width="34" height="64" fill="#2f7d5b"/><rect y="120" width="70" height="48" fill="${STEEL}"/>` }, -12);
  const lamps = [[-170, -40], [60, 30], [290, -60]] as const;
  const panels = [slab, fl, back, lw, rw, roundWin, roundFrame, cork, corkFrame, ...tabs, ...reviewCards, oldCard, ...cans, roller,
    pegboard, ...grid, line, ...list, ...rackL, ...rackR, plinth(-1, 'plinth-l', -238, 70), plinth(1, 'plinth-r', -238, 150), ...wallBits, downSign, ...highShelves,
    ...flight, wellWall, rail, ...pallet, truck, ...truckLoad, ...bin, ...stool, ...tapeGun, ...scale,
    packer, ...beltBox('belt-a', 40, -200, 760), ...beltBox('belt-b', 270, 118, 300), ...onBelt('p-a', KRAFT, -300, -200), ...onBelt('p-b', CORAL, 150, 118),
    ...desk, ...camera, ejected, form, ...ratings, pinned, ...mug, ...stack,
    ...lamps.flatMap(([x, z], i) => lampSet(`lamp-${i}`, x, z, 300, 480 - Math.abs(x) * .38)), ...fgBoxes];
  return {
    id: 'storeroom', camera: { zoom: .8, x0: -30, x1: 30 }, light: ROOM_LIGHT, lamps: lamps.map(([x, z]) => lamp(x, z, 300)), panels,
    runs: [{ group: 'p-a', from: [-300, 0, -200], to: [380, 0, -200], count: 3, seconds: 15 }, { group: 'p-b', from: [150, 0, 118], to: [390, 0, 118], count: 2, seconds: 8 }]
  };
}
