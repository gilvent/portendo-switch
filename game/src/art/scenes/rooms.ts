import { add, box, on, relief, slot, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, bricks, flutes, planks, reseed, specks, upArrows } from '../recipes.ts';

const MINT = '#35b58a', PLUM = '#7c6be0', WOOD = '#a8693a', STEEL = '#3d444e', GLOW = '#ffe9b0';
const W = 1040, D = 500, ROOM_LIGHT = { sun: 1.9, sky: .42, skyColor: [1, .9, .78] as const };
const WARM = [1, .83, .58] as const;
const wallAt = { back: (w: number, h: number, c: string, rest: Partial<Panel> & { id: string }): Panel => ({ stock: 'cover', c, w, h, o: [-w / 2, 0, -D / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.3, ...rest }) };
const left = (h: number, c: string, id: string, print: string, mask?: string): Panel => ({ id, stock: 'cover', c, w: D, h, o: [-W / 2, 0, -D / 2], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: 1.1, print, mask });
const right = (h: number, c: string, id: string, print: string, mask?: string): Panel => ({ id, stock: 'cover', c, w: D, h, o: [W / 2, 0, D / 2], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold', density: 1.1, print, mask });
const floor = (id: string, c: string, print: string): Panel => ({ id, stock: 'greyboard', c, w: W, h: D, o: [-W / 2, 0, D / 2], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.3, print });
const sill = (id: string, c: string): Panel => ({ id, stock: 'greyboard', c, w: W + 40, h: 22, o: [-W / 2 - 20, -22, D / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2 });

const shelf = (parent: Panel, id: string, x: number, y: number, w: number, goods: { x: number; w: number; h: number; c: string; print?: string }[]): Panel[] => {
  const n: V3 = [0, 0, 1], base = add(add(parent.o, parent.u, x), parent.v, y);
  return relief(parent, [
    { id: `${id}-edge`, stock: 'greyboard', c: WOOD, w, h: 10, o: add(base, n, 34), u: parent.u, v: parent.v, edge: 'fold' },
    { id: `${id}-top`, stock: 'greyboard', c: WOOD, w, h: 34, o: add(add(base, n, 34), parent.v, 10), u: parent.u, v: [0, 0, -1], edge: 'fold', ghost: true },
    ...goods.map((g, i): Panel => ({ id: `${id}-g${i}`, stock: 'cover', c: g.c, w: g.w, h: g.h, o: add(add(add(base, parent.u, g.x), parent.v, 10), n, 18), u: parent.u, v: parent.v, edge: 'fold', print: g.print }))
  ]);
};
const phoneBox = (c: string, screen: string) => ({ c, print: `<rect x="5" y="6" width="18" height="34" rx="2" fill="#1d2228"/><rect x="7" y="9" width="14" height="27" fill="${screen}"/>` });
const lampSet = (id: string, x: number, z: number, y: number, top: number): Panel[] => {
  const shade: Panel = { id: `${id}-shade`, stock: 'vellum', c: '#f3e2bd', w: 74, h: 44, o: [x - 37, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', emit: .9, density: 2, mask: '<path d="M22 0H52L74 44H0Z" fill="#fff"/>', print: `<path d="M0 41H74" stroke="${INK}" stroke-width="3"/>` };
  const cord: Panel = { id: `${id}-cord`, stock: 'greyboard', c: '#1a1410', w: 3, h: top - y - 44, o: [x - 1.5, y + 44, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1 };
  return [shade, cord];
};
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
const liteBox = (id: string, x: number, z: number, y: number, w: number, h: number, d: number, c = KRAFT, rot = 0, group?: string): Panel[] => box({ id, x, z, y, w, h, d, rot, stock: 'kraft', c, front: `${flutes(w, h)}<rect x="${w / 2 - 6}" width="12" height="${h}" fill="#d9b781"/><rect x="5" y="${h - 18}" width="${Math.min(30, w * .4)}" height="13" fill="#fbf7ee"/>`, right: flutes(d, h) + (h > 40 ? upArrows(d * .34, h * .2) : ''), top: `${flutes(w, d)}<rect x="${w / 2 - 6}" width="12" height="${d}" fill="#d9b781"/><path d="M0 ${d / 2}H${w}" stroke="#4a2c14" stroke-opacity=".5"/>` }).filter(p => !/-left$/.test(p.id) || !group).map(p => (group ? { ...p, group, density: 2, ghost: /rear|under/.test(p.id) ? true : p.ghost } : p));

export function shop(): Scene {
  reseed(21);
  const H = 420, back = wallAt.back(W, H, '#d9a968', { id: 'wall-back', print: bricks(W, H, '#cf9554', '#b98a55') });
  const lw = left(H, '#d9a968', 'wall-left', bricks(D, H, '#cf9554', '#b98a55')), rw = right(H, '#d9a968', 'wall-right', bricks(D, H, '#cf9554', '#b98a55'));
  const fl = floor('floor', '#c58c4d', planks(W, D, '#c58c4d', '#7a4e24', 62));
  const rug = on(fl, .6, 300, 26, 340, 130, { id: 'rug', stock: 'sugar', c: CORAL, mask: '<rect width="340" height="130" rx="62" fill="#fff"/>', print: `<rect x="10" y="10" width="320" height="110" rx="54" fill="none" stroke="${CREAM}" stroke-width="7"/>` });
  const mat = on(fl, .6, 450, 0, 140, 44, { id: 'door-mat', stock: 'sugar', c: DEEP, print: `<text x="70" y="30" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="20" fill="${CREAM}">Blibli.com</text>` });
  const banner = (id: string, x: number, y: number, w: number, c: string, text: string) => on(back, 3, x, y, w, 46, { id, stock: 'cover', c, print: `<text x="${w / 2}" y="31" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="24" fill="${CREAM}">${text}</text>`, mask: `<path d="M0 0H${w}V46H0L10 23Z" fill="#fff"/>` });
  const win = (id: string, x: number) => [on(back, 1.2, x, 190, 130, 150, { id, stock: 'vellum', c: GLOW, emit: .85, density: 2, print: `<rect width="130" height="150" fill="${GLOW}"/>` }), on(back, 3, x - 8, 182, 146, 166, { id: `${id}-frame`, stock: 'cover', c: CREAM, density: 2, mask: slot(146, 166, [8, 8, 62, 71], [76, 8, 62, 71], [8, 87, 62, 71], [76, 87, 62, 71]) })];
  const poster = on(back, 1.4, 455, 150, 130, 190, { id: 'poster', stock: 'bond', c: BLUE, print: `<rect x="40" y="26" width="50" height="100" rx="7" fill="#1d2228"/><rect x="45" y="34" width="40" height="84" fill="#bfe6f8"/><text x="65" y="164" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="19" fill="${CREAM}">Smartphones</text>` });
  const shelves = [
    ...shelf(back, 'sh-a', 60, 130, 300, [0, 1, 2, 3, 4, 5].map(i => ({ x: 12 + i * 46, w: 30, h: 46, ...phoneBox([CORAL, SUN, MINT, PLUM, BLUE, CREAM][i], ['#bfe6f8', '#ffd3a8', '#c8f0d8'][i % 3]) }))),
    ...shelf(back, 'sh-b', 60, 56, 300, [0, 1, 2, 3].map(i => ({ x: 14 + i * 70, w: 50, h: 40, c: [MINT, CREAM, CORAL, KRAFT][i] }))),
    ...shelf(back, 'sh-c', 660, 130, 240, [0, 1, 2, 3, 4].map(i => ({ x: 12 + i * 44, w: 30, h: 46, ...phoneBox([SUN, BLUE, CORAL, MINT, PLUM][i], ['#ffd3a8', '#bfe6f8', '#c8f0d8'][i % 3]) }))),
    ...shelf(back, 'sh-d', 660, 56, 240, [0, 1, 2].map(i => ({ x: 14 + i * 76, w: 54, h: 42, c: [PLUM, KRAFT, SUN][i] }))),
  ];
  const sideShelves = relief(lw, [{ id: 'sl-board', stock: 'greyboard', c: WOOD, w: 260, h: 10, o: [-W / 2 + 26, 210, -150], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold' }, ...[0, 1, 2, 3, 4].map((i): Panel => ({ id: `sl-g${i}`, stock: 'cover', c: [BLUE, SUN, CORAL, MINT, CREAM][i], w: 34, h: 50, o: [-W / 2 + 14, 220, -140 + i * 48], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold' }))]);
  const shelfR = relief(rw, [{ id: 'sr-board', stock: 'greyboard', c: WOOD, w: 200, h: 10, o: [W / 2 - 26, 190, 210], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold' }, ...[0, 1, 2].map((i): Panel => ({ id: `sr-g${i}`, stock: 'cover', c: [CORAL, CREAM, BLUE][i], w: 40, h: 56, o: [W / 2 - 14, 200, 200 - i * 62], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold' }))]);
  const island = box({ id: 'island', x: -30, z: -30, w: 250, h: 70, d: 110, stock: 'cover', c: WOOD, top: planks(250, 110, WOOD, '#6d4524', 36), front: `<rect x="8" y="8" width="234" height="54" fill="${CREAM}"/><text x="125" y="44" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="24" fill="${DEEP}">Recommendations</text>` });
  const phones = [['#bfe6f8', -120], ['#ffd3a8', -62], ['#c8f0d8', -4], ['#e0d4ff', 54]].map(([c, x], i): Panel => ({ id: `phone-${i}`, stock: 'cover', c: '#1d2228', w: 36, h: 66, o: [(x as number) + 0, 70, -24], u: [.99, 0, -.1], v: [0, .96, -.26], edge: 'cut', mask: '<rect width="36" height="66" rx="5" fill="#fff"/>', print: `<rect x="3.5" y="5" width="29" height="55" fill="${c}"/><rect x="7" y="9" width="22" height="14" fill="#fff" fill-opacity=".55"/>` }));
  const stand = box({ id: 'cat-stand', x: -300, z: -132, w: 110, h: 86, d: 60, stock: 'cover', c: DEEP, front: `<text x="55" y="50" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="15" fill="${CREAM}">Product Detail</text>` });
  const tablet: Panel = { id: 'tablet', stock: 'cover', c: '#1d2228', w: 92, h: 124, o: [-346, 84, -104], u: [1, 0, 0], v: [0, .93, -.37], edge: 'cut', mask: '<rect width="92" height="124" rx="8" fill="#fff"/>', print: `<rect x="7" y="7" width="78" height="110" fill="${CREAM}"/><rect x="14" y="14" width="64" height="44" fill="#bfe6f8"/><g fill="${BLUE}"><rect x="14" y="66" width="64" height="9"/><rect x="14" y="81" width="46" height="9"/><rect x="14" y="96" width="56" height="9"/></g>`, motion: { when: 'catalog', edge: 'bottom', deg: -10 } };
  const foreground: Panel[] = [
    ...liteBox('fg-box-a', -470, 196, 0, 90, 74, 60), ...liteBox('fg-box-b', -462, 196, 74, 66, 50, 46, KRAFT, 7),
    { id: 'fg-plant', stock: 'sugar', c: '#2f7d48', w: 120, h: 170, o: [400, 0, 214], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<path d="M60 170Q40 120 10 96Q40 92 54 112Q30 50 44 10Q66 40 66 104Q84 62 112 50Q106 104 72 134L66 170Z" fill="#fff"/>' },
    { id: 'fg-pot', stock: 'cover', c: CORAL, w: 62, h: 44, o: [428, 0, 216], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', mask: '<path d="M0 0H62L52 44H10Z" fill="#fff"/>' }
  ];
  const panels = [sill('sill', '#6d4524'), fl, rug, mat, back, lw, rw, ...win('win-a', 150), ...win('win-b', 760), banner('tag-promo', 70, 352, 230, CORAL, 'Promotions'), banner('tag-rec', 680, 352, 240, BLUE, 'Smartphones'), poster, ...shelves, ...sideShelves, ...shelfR, ...island, ...phones, ...stand, tablet, ...stairCard('stairs', 395, 1, WOOD), ...lampSet('lamp-a', -220, -20, 300, H), ...lampSet('lamp-b', 210, -20, 300, H), ...foreground];
  return { id: 'shop', camera: { zoom: .8, x0: -30, x1: 30 }, light: ROOM_LIGHT, lamps: [lamp(-220, -20, 300), lamp(210, -20, 300)], panels };
}

export function storeroom(): Scene {
  reseed(33);
  const H = 300, PEAK = 200, TOP = H + PEAK, wood = '#8f6f55';
  const back = wallAt.back(W, TOP, wood, { id: 'wall-back', mask: `<path d="M0 ${TOP}V${PEAK}L${W / 2} 0L${W} ${PEAK}V${TOP}Z" fill="#fff"/>`, print: planks(W, TOP, wood, '#5e4530', 74, 'y') });
  const lw = left(H, wood, 'wall-left', planks(D, H, wood, '#5e4530', 74, 'y')), rw = right(H, wood, 'wall-right', planks(D, H, wood, '#5e4530', 74, 'y'));
  const fl = floor('floor', '#8b8275', specks(W, D, '#6f675c', 320, 4) + Array.from({ length: 5 }, (_, i) => `<path d="M${(i + 1) * W / 6} 0V${D}" stroke="#6f675c" stroke-width="2"/>`).join('') + `<path d="M0 214H${W}M0 222H${W}" stroke="${SUN}" stroke-width="5" stroke-dasharray="26 18"/>`);
  const roundWin = on(back, 1.2, W / 2 - 60, 318, 120, 120, { id: 'round-win', stock: 'vellum', c: GLOW, emit: .85, density: 2, mask: '<circle cx="60" cy="60" r="60" fill="#fff"/>', print: `<rect width="120" height="120" fill="${GLOW}"/>` });
  const roundFrame = on(back, 3, W / 2 - 68, 310, 136, 136, { id: 'round-frame', stock: 'cover', c: CREAM, density: 2, mask: '<path fill-rule="evenodd" d="M68 0a68 68 0 1 0 .01 0Z M68 8a60 60 0 1 1 -.01 0Z" fill="#fff"/><rect x="65" y="4" width="6" height="128" fill="#fff"/><rect x="4" y="65" width="128" height="6" fill="#fff"/>' });
  const rack = (id: string, x: number, wide: number, seed: number): Panel[] => { reseed(seed); return relief(back, [0, 1, 2].flatMap(r => [{ id: `${id}-r${r}`, stock: 'greyboard', c: STEEL, w: wide, h: 8, o: [x, 96 + r * 66, -D / 2 + 34], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold' } as Panel, ...liteBox(`${id}-b${r}a`, x + wide * .22, -D / 2 + 22, 104 + r * 66, 62, 44, 30).slice(0, 1), ...liteBox(`${id}-b${r}b`, x + wide * .64, -D / 2 + 22, 104 + r * 66, 76, 50, 30, r % 2 ? CORAL : KRAFT).slice(0, 1)])); };
  const beltBox = (id: string, x: number, z: number, w: number): Panel[] => box({ id, x, z, w, h: 62, d: 70, stock: 'greyboard', c: STEEL, top: Array.from({ length: Math.round(w / 26) }, (_, i) => `<rect x="${i * 26}" width="13" height="70" fill="#5b6470"/>`).join(''), front: Array.from({ length: Math.round(w / 52) }, (_, i) => `<rect x="${14 + i * 52}" y="16" width="26" height="30" fill="${SUN}"/>`).join('') });
  const desk = box({ id: 'desk', x: 150, z: -112, w: 320, h: 84, d: 100, stock: 'cover', c: WOOD, top: planks(320, 100, WOOD, '#6d4524', 34), front: `<path d="M108 10V76M212 10V76" stroke="#6d4524" stroke-width="3"/><g fill="${CREAM}"><rect x="46" y="38" width="20" height="6"/><rect x="150" y="38" width="20" height="6"/><rect x="254" y="38" width="20" height="6"/></g>` });
  const starRow = (n: number, y: number) => Array.from({ length: 5 }, (_, i) => `<text x="${14 + i * 19}" y="${y}" font-size="19" fill="${i < n ? SUN : '#5b6470'}">★</text>`).join('');
  const screen: Panel = { id: 'monitor', stock: 'cover', c: '#23272d', w: 186, h: 116, o: [57, 110, -119], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: .25, print: `<rect x="8" y="8" width="170" height="100" fill="#0e2a3d"/>${starRow(5, 38)}${starRow(4, 66)}${starRow(5, 94)}<rect x="126" y="20" width="38" height="24" fill="#bfe6f8"/><rect x="126" y="50" width="38" height="24" fill="#ffd3a8"/>`, motion: { when: 'computer', edge: 'bottom', deg: -8 } };
  const neck = box({ id: 'neck', x: 150, z: -126, y: 84, w: 40, h: 26, d: 14, stock: 'greyboard', c: STEEL });
  const keyboard = on(desk[desk.length - 1], .8, 96, 34, 128, 38, { id: 'keyboard', stock: 'cover', c: '#e9ebee', print: Array.from({ length: 4 }, (_, i) => `<path d="M6 ${7 + i * 8}H122" stroke="#9aa2ac" stroke-width="4" stroke-dasharray="7 2"/>`).join('') });
  const chair = [...box({ id: 'chair', x: 150, z: -22, w: 70, h: 46, d: 62, stock: 'cover', c: BLUE }), { id: 'chair-back', stock: 'cover', c: BLUE, w: 70, h: 44, o: [115, 46, -52], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', mask: '<rect width="70" height="44" rx="12" fill="#fff"/>' } as Panel];
  const stack = [...liteBox('st-a', -250, -120, 0, 84, 62, 64), ...liteBox('st-b', -160, -126, 0, 70, 52, 58), ...liteBox('st-c', -236, -122, 62, 62, 46, 50, KRAFT, 10)];
  const fgBoxes = [...liteBox('fg-a', 470, 210, 0, 100, 96, 70), ...liteBox('fg-b', 462, 212, 96, 74, 58, 56, CORAL, -6), ...liteBox('fg-c', -470, 214, 0, 80, 60, 56)];
  const onBelt = (group: string, c: string, x: number, z: number) => liteBox(group, x, z, 62, 54, 40, 46, c, 0, group);
  const panels = [sill('sill', '#4a3424'), fl, back, lw, rw, roundWin, roundFrame, ...rack('rack-a', 40, 300, 1), ...rack('rack-b', 700, 300, 2),
    ...beltBox('belt-a', 40, -200, 760), ...beltBox('belt-b', 270, 118, 300), ...onBelt('p-a', KRAFT, -300, -200), ...onBelt('p-b', CORAL, 150, 118),
    ...desk, keyboard, screen, ...neck, ...chair, ...stack, ...stairCard('stairs', -395, -1, WOOD), ...lampSet('lamp-a', -120, -30, 300, 480), ...lampSet('lamp-b', 170, -110, 300, 490), ...fgBoxes];
  return {
    id: 'storeroom', camera: { zoom: .8, x0: -30, x1: 30 }, light: ROOM_LIGHT, lamps: [lamp(-120, -30, 300), lamp(170, -110, 300)], panels,
    runs: [{ group: 'p-a', from: [-300, 0, -200], to: [380, 0, -200], count: 3, seconds: 15 }, { group: 'p-b', from: [150, 0, 118], to: [390, 0, 118], count: 2, seconds: 8 }]
  };
}
