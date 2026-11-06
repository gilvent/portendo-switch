import { add, box, on, relief, slot, yaw, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, bricks, cloud, flutes, planks, reseed, specks, upArrows } from '../recipes.ts';

const MINT = '#35b58a', PLUM = '#7c6be0', WOOD = '#a8693a', STEEL = '#3d444e', GLOW = '#ffe9b0', SKY = '#8fd3f4', GREY = '#c9ccd1';
const W = 1040, D = 500, ROOM_LIGHT = { sun: 1.9, sky: .42, skyColor: [1, .9, .78] as const };
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
  const lamps = [[-175, -60], [0, -90], [175, -60]] as const;
  const panels = [sill('sill', '#6d4524'), fl, rug, mat, back, lw, rw, peg, ...accessories, ...wallDeco, ...win('win-a', 150, 4), ...win('win-b', 760, 9),
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

export function storeroom(): Scene {
  reseed(33);
  const H = 300, PEAK = 200, TOP = H + PEAK, wood = '#8f6f55', plank = (w: number, h: number) => planks(w, h, wood, '#5e4530', 74, 'y');
  const back = backWall(W, TOP, wood, { id: 'wall-back', mask: `<path d="M0 ${TOP}V${PEAK}L${W / 2} 0L${W} ${PEAK}V${TOP}Z" fill="#fff"/>`, print: plank(W, TOP) });
  const lw = leftWall(H, wood, 'wall-left', plank(D, H)), rw = rightWall(H, wood, 'wall-right', plank(D, H));
  const fl = floor('floor', '#8b8275', specks(W, D, '#6f675c', 320, 4) + Array.from({ length: 5 }, (_, i) => `<path d="M${(i + 1) * W / 6} 0V${D}" stroke="#6f675c" stroke-width="2"/>`).join('') + `<path d="M0 214H${W}M0 222H${W}" stroke="${SUN}" stroke-width="5" stroke-dasharray="26 18"/>`);
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

  // Side walls: shelving in relief, stacked with returns and packing stock.
  const rackOn = (wall: Panel, side: 1 | -1, id: string): Panel[] => {
    const at = (z: number, y: number, out: number): V3 => [side * (W / 2 - out), y, z];
    return relief(wall, [0, 1, 2].flatMap(r => [
      { id: `${id}-r${r}`, stock: 'greyboard', c: STEEL, w: 300, h: 8, o: at(side < 0 ? 150 : -150, 70 + r * 72, 34), u: wall.u, v: [0, 1, 0], edge: 'fold' } as Panel,
      ...[0, 1, 2].map((k): Panel => ({ id: `${id}-b${r}${k}`, stock: 'kraft', c: (r + k) % 3 === 1 ? CORAL : KRAFT, w: [70, 54, 82][k], h: [48, 40, 52][(k + r) % 3], o: at((side < 0 ? 140 : -140) + (side < 0 ? -1 : 1) * (6 + k * 96), 78 + r * 72, 22), u: wall.u, v: [0, 1, 0], edge: 'fold', print: flutes(80, 52) + `<rect x="${[29, 21, 35][k]}" width="12" height="52" fill="#d9b781"/>` }))
    ]));
  };
  const beltBox = (id: string, x: number, z: number, w: number): Panel[] => box({ id, x, z, w, h: 62, d: 70, stock: 'greyboard', c: STEEL, top: Array.from({ length: Math.round(w / 26) }, (_, i) => `<rect x="${i * 26}" width="13" height="70" fill="#5b6470"/>`).join(''), front: Array.from({ length: Math.round(w / 52) }, (_, i) => `<rect x="${14 + i * 52}" y="16" width="26" height="30" fill="${SUN}"/>`).join('') });
  const onBelt = (group: string, c: string, x: number, z: number) => carton(group, x, z, 62, 54, 40, 46, c, 0, group);
  const stack = [...carton('st-a', -330, 140, 0, 84, 62, 64), ...carton('st-c', -316, 138, 62, 62, 46, 50, KRAFT, 10)];
  const fgBoxes = [...carton('fg-a', 470, 210, 0, 100, 96, 70), ...carton('fg-b', 462, 212, 96, 74, 58, 56, CORAL, -6), ...carton('fg-c', -470, 214, 0, 80, 60, 56)];
  const lamps = [[-170, -40], [60, 30], [290, -60]] as const;
  const panels = [sill('sill', '#4a3424'), fl, back, lw, rw, roundWin, roundFrame, cork, corkFrame, ...tabs, ...reviewCards, oldCard, ...cans, roller,
    pegboard, ...grid, line, ...list, ...rackOn(lw, -1, 'rack-l'), ...rackOn(rw, 1, 'rack-r'),
    ...beltBox('belt-a', 40, -200, 760), ...beltBox('belt-b', 270, 118, 300), ...onBelt('p-a', KRAFT, -300, -200), ...onBelt('p-b', CORAL, 150, 118),
    ...desk, ...camera, ejected, form, ...ratings, pinned, ...mug, ...stack, ...stairCard('stairs', -395, -1, WOOD),
    ...lamps.flatMap(([x, z], i) => lampSet(`lamp-${i}`, x, z, 300, 480 - Math.abs(x) * .38)), ...fgBoxes];
  return {
    id: 'storeroom', camera: { zoom: .8, x0: -30, x1: 30 }, light: ROOM_LIGHT, lamps: lamps.map(([x, z]) => lamp(x, z, 300)), panels,
    runs: [{ group: 'p-a', from: [-300, 0, -200], to: [380, 0, -200], count: 3, seconds: 15 }, { group: 'p-b', from: [150, 0, 118], to: [390, 0, 118], count: 2, seconds: 8 }]
  };
}
