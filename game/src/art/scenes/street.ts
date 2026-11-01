import { add, backOf, box, hinged, on, slot, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, FOLIAGE, GRASS, INK, SUN, cloud, parcel, pines, reseed, scallopTop, specks, tuft } from '../recipes.ts';
import { heroPanels } from './_hero.ts';

const MINT = '#35b58a', PLUM = '#7c6be0', WARM = '#ffe7a8', LEAF = '#57b36f';
const SHOP = { x: 150, z: -80, w: 720, d: 300, ground: 230, upper: 150, peak: 120 };

function backdrop(): Panel[] {
  reseed(11);
  const card = (id: string, z: number, y: number, w: number, h: number, c: string, n: number, rise: number, print = ''): Panel => ({ id, stock: 'sugar', c, w, h, o: [-w / 2 + 120, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .36, mask: scallopTop(w, h, n, rise), print });
  return [
    { id: 'sky', backdrop: true, stock: 'cover', c: '#7cc6ea', w: 5200, h: 1500, o: [-2480, -160, -780], u: [1, 0, 0], v: [0, 1, 0], density: .3, print: `${cloud(1500, 330, 2)}${cloud(2400, 240, 1.5)}${cloud(3200, 340, 2.2)}${cloud(1950, 500, 1)}` },
    ...[card('hills-far', -640, -30, 4400, 420, '#a9d6dd', 22, 150, pines(4400, 250, '#8cc2cf', 66, 44)),
    card('hills-mid', -540, -30, 3800, 340, '#74bb9c', 18, 130, pines(3800, 210, '#4f9c82', 70, 54)),
    card('hedge', -440, -10, 3200, 250, FOLIAGE, 24, 74, specks(3200, 250, '#2f7d48', 220, 9))].map(p => ({ ...p, decal: 'sky' }))
  ];
}
function ground(): Panel[] {
  reseed(3);
  const lawn: Panel = { id: 'lawn', stock: 'sugar', c: GRASS, w: 3000, h: 660, o: [-1420, 0, 230], u: [1, 0, 0], v: [0, 0, -1], density: .6, edge: 'fold', print: specks(3000, 660, '#5da554', 640, 5) + specks(3000, 660, '#a8dc8a', 360, 3) };
  const skirt: Panel = { id: 'lawn-skirt', stock: 'sugar', c: '#5da554', w: 3000, h: 70, o: [-1420, -70, 231], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', mask: `<path d="M0 0H3000V34${Array.from({ length: 41 }, () => 'a36.5 30 0 0 1 -73 0').join('')}Z" fill="#fff"/>` };
  const paver = on(lawn, .7, 740, 55, 1360, 210, { id: 'pavers', stock: 'greyboard', c: '#e9dcc4', edge: 'cut', density: .6, print: Array.from({ length: 12 }, (_, i) => `<path d="M${(i + 1) * 113} 0V210" stroke="#c9b99b" stroke-width="2.4"/>`).join('') + '<path d="M0 105H1360" stroke="#c9b99b" stroke-width="2"/>' + specks(1360, 210, '#bcae94', 90, 3.4) });
  const verge = on(lawn, .4, 730, 262, 1380, 12, { id: 'kerb', stock: 'greyboard', c: '#cdbfa6', edge: 'cut', density: .6 });
  const path = on(lawn, .5, 1530, 262, 80, 58, { id: 'door-path', stock: 'greyboard', c: '#e4d6bd', edge: 'cut', density: .6 });
  return [lawn, skirt, paver, verge, path];
}
function windowBox(id: string, parent: Panel, x: number, y: number, w: number, h: number, goods: string, cols: number, rows: number, gap = 18): Panel[] {
  const inner: Panel = { id: `${id}-room`, stock: 'cover', c: '#f4cf8c', w: w + 10, h: h + 10, o: add(add(add(parent.o, parent.u, x - 5), parent.v, y - 5), [0, 0, -gap]), u: parent.u, v: parent.v, edge: 'fold', emit: .34, print: goods, density: 1.5, decal: parent.id };
  const bar = 5, pw = (w - bar * (cols - 1)) / cols, ph = (h - bar * (rows - 1)) / rows, panes: [number, number, number, number][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) panes.push([7 + c * (pw + bar), 7 + r * (ph + bar), pw, ph]);
  return [inner, on(parent, 1.2, x - 7, y - 7, w + 14, h + 14, { id: `${id}-frame`, stock: 'cover', c: CREAM, density: 1.5, mask: slot(w + 14, h + 14, ...panes) })];
}
function shop(): Panel[] {
  const { x, z, w, d, ground: g, upper, peak } = SHOP, h = g + upper, H = h + peak, density = 1.25;
  const door = { x: w / 2 - 68, w: 136, h: 190 };
  const win = [[60, 44, 210, 140], [450, 44, 210, 140]] as const;
  const up = [[116, 298, 96, 62], [312, 298, 96, 62], [508, 298, 96, 62]] as const;
  const shape = `<path fill-rule="evenodd" d="M0 ${H}V${peak}L${w / 2} 0L${w} ${peak}V${H}Z ${[...win, ...up].map(([a, b, c, e]) => `M${a} ${H - b}V${H - b - e}H${a + c}V${H - b}Z`).join(' ')} M${door.x} ${H}V${H - door.h}H${door.x + door.w}V${H}Z" fill="#fff"/>`;
  const clap = Array.from({ length: 18 }, (_, i) => `<path d="M0 ${peak + (i + 1) * 21}H${w}" stroke="#0577b4" stroke-width="2"/>`).join('');
  const front: Panel = { id: 'shop-front', stock: 'cover', c: BLUE, w, h: H, o: [x - w / 2, 0, z], u: [1, 0, 0], v: [0, 1, 0], density, edge: 'cut', mask: shape, print: clap + `<rect y="${H - g - 4}" width="${w}" height="10" fill="${CREAM}"/><rect y="${H - 16}" width="${w}" height="16" fill="${DEEP}"/>` };
  const goodsL = `<rect x="44" y="96" width="44" height="68" fill="${CORAL}"/><rect x="102" y="112" width="58" height="52" fill="${MINT}"/><rect x="176" y="88" width="24" height="76" fill="#1d2228"/><rect x="179" y="92" width="18" height="60" fill="#bfe6f8"/>`;
  const goodsR = `<rect x="34" y="104" width="46" height="60" fill="${PLUM}"/><rect x="96" y="84" width="60" height="80" fill="${SUN}"/><rect x="170" y="88" width="24" height="76" fill="#1d2228"/><rect x="173" y="92" width="18" height="60" fill="#ffd3a8"/>`;
  const windows = [...windowBox('win-l', front, win[0][0], win[0][1], win[0][2], win[0][3], goodsL, 2, 2), ...windowBox('win-r', front, win[1][0], win[1][1], win[1][2], win[1][3], goodsR, 2, 2),
    ...up.flatMap(([a, b, c, e], i) => windowBox(`win-up${i}`, front, a, b, c, e, `<path d="M0 0H116V24Q58 46 0 24Z" fill="#f6b73c"/>`, 2, 1, 10))];
  const doorRoom: Panel = { id: 'door-room', stock: 'cover', c: '#ffdf9e', w: door.w + 16, h: door.h + 8, o: [x - door.w / 2 - 8, 0, z - 22], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: 1, density };
  const leaf = (id: string, ox: number, edge: 'left' | 'right', deg: number): Panel => hinged({ id, stock: 'cover', c: DEEP, w: door.w / 2, h: door.h, o: [ox, 0, z + .8], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density, motion: { when: 'shop-door', edge, deg: edge === 'left' ? 74 : -74 }, mask: slot(door.w / 2, door.h, [12, 14, door.w / 2 - 24, 150]), print: '' }, edge, deg);
  const walls = box({ id: 'shop-body', x, z: z - d / 2, w, h, d, stock: 'cover', c: BLUE, noTop: true, right: clap, left: clap }).filter(p => !p.id.endsWith('front')).map(p => ({ ...p, density: 1 }));
  const rise = Math.hypot(w / 2 + 26, peak * (w / 2 + 26) / (w / 2)), a = Math.atan2(peak, w / 2), ridge: V3 = [x, H + 2, z + 18], rd = d + 40;
  const roof = (id: string, s: 1 | -1): Panel[] => {
    const dn: V3 = [s * Math.cos(a), -Math.sin(a), 0], base: Panel = s < 0 ? { id, stock: 'cover', c: DEEP, w: rise, h: rd, o: add(ridge, dn, rise), u: [-dn[0], -dn[1], -dn[2]], v: [0, 0, -1], edge: 'cut', density: 1 } : { id, stock: 'cover', c: DEEP, w: rise, h: rd, o: ridge, u: dn, v: [0, 0, -1], edge: 'cut', density: 1 };
    const lip: Panel = { id: `${id}-lip`, stock: 'cover', c: CREAM, w: rise, h: 8, o: add(s < 0 ? add(ridge, dn, rise) : ridge, [0, -8, 0]), u: base.u, v: [0, 1, 0], edge: 'fold', density: 1.4 };
    return [{ ...base, print: Array.from({ length: 13 }, (_, i) => `<path d="M${(i + 1) * rise / 14} 0V${rd}" stroke="#063f66" stroke-opacity=".6" stroke-width="3"/>`).join('') }, lip];
  };
  const stripe = Array.from({ length: 8 }, (_, i) => `<rect x="${i * 88}" width="44" height="66" fill="${CREAM}"/>`).join('');
  const awningTop: Panel = { id: 'awning', stock: 'cover', c: CORAL, w: 690, h: 66, o: [x - 345, g - 42, z + 60], u: [1, 0, 0], v: [0, .75, -.66], edge: 'fold', density: 1.6, print: stripe };
  const awningLip: Panel = { id: 'awning-lip', stock: 'cover', c: CORAL, w: 690, h: 22, o: [x - 345, g - 64, z + 60], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: `<path d="M0 22H690V10${Array.from({ length: 20 }, () => 'a17.5 12 0 0 0 -35 0').join('')}Z" transform="matrix(1 0 0 -1 0 22)" fill="#fff"/>`, print: Array.from({ length: 8 }, (_, i) => `<rect x="${i * 88}" width="44" height="22" fill="${CREAM}"/>`).join('') };
  const signBoard: Panel = { id: 'shop-sign', stock: 'cover', c: CREAM, w: 220, h: 58, o: [x - 110, g + 4, z + 10], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3, mask: `<rect width="220" height="58" rx="8" fill="#fff"/>`, print: `<image href="/PUBLIC/img/brand/blibli-logo.png" x="30" y="4" width="160" height="50" preserveAspectRatio="xMidYMid meet"/>` };
  const signSide: Panel = { id: 'shop-sign-top', stock: 'cover', c: '#e9dcc4', w: 220, h: 10, o: [x - 110, g + 62, z + 10], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 2 };
  const roundel: Panel = on(front, 1, w / 2 - 26, H - 72 - 26, 52, 52, { id: 'gable-roundel', stock: 'cover', c: CREAM, mask: '<circle cx="26" cy="26" r="26" fill="#fff"/>', print: `<circle cx="26" cy="26" r="17" fill="${WARM}"/><path d="M26 9V43M9 26H43" stroke="${CREAM}" stroke-width="4"/>` });
  return [front, ...walls, ...windows, doorRoom, leaf('door-l', x - door.w / 2, 'left', 0), leaf('door-r', x, 'right', 0), ...roof('shop-roof-l', -1), ...roof('shop-roof-r', 1), awningTop, awningLip, signBoard, roundel];
}
function dressing(): Panel[] {
  const postFace = '#3d444e';
  const board = [...box({ id: 'board-post', x: 592, z: -34, w: 12, h: 120, d: 12, stock: 'greyboard', c: postFace, noTop: true }),
    ...box({ id: 'board', x: 592, z: -34, y: 120, w: 160, h: 82, d: 14, stock: 'cover', c: CREAM, noTop: true, front: `<rect x="5" y="5" width="150" height="72" fill="none" stroke="${BLUE}" stroke-width="2.5"/><text x="80" y="50" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="24" fill="${DEEP}">Blibli.com</text>` })];
  const arrow: Panel = { id: 'out-arrow', stock: 'cover', c: SUN, w: 150, h: 126, o: [-715, 0, 60], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', mask: `<path d="M66 126V74H44V74L4 40L44 8V24H146V58H82V126Z" fill="#fff"/>`, print: `<rect x="66" y="66" width="16" height="60" fill="${postFace}"/><text x="92" y="48" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="15" fill="${INK}">BACK</text>` };
  const pot = box({ id: 'pot', x: -90, z: -70, w: 70, h: 34, d: 70, stock: 'kraft', c: '#7a5237', top: '<rect x="6" y="6" width="58" height="58" fill="#3a2616"/>' });
  const leaves = (id: string, rot: number): Panel[] => {
    const c = Math.cos(rot), s = Math.sin(rot), p: Panel = { id, stock: 'sugar', c: MINT, w: 96, h: 130, o: [-90 - 48 * c, 34, -70 + 48 * s], u: [c, 0, -s], v: [0, 1, 0], edge: 'cut', mask: '<path d="M46 130V92Q8 88 4 40Q34 44 46 76V50Q28 22 48 0Q68 22 50 50V70Q60 30 92 22Q88 66 50 76V130Z" fill="#fff"/>', print: '<path d="M48 130V6" stroke="#2a7f58" stroke-width="2"/>' };
    return [p, backOf(p)];
  };
  const shrub = (id: string, x: number, z: number, w: number, h: number, c: string, dark: string): Panel[] => { reseed(w); const p: Panel = { id, stock: 'sugar', c, w, h, o: [x - w / 2, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: scallopTop(w, h, Math.round(w / 60), 26), print: specks(w, h, dark, Math.round(w / 3), 7) }; return [p]; };
  const tree: Panel[] = (() => { reseed(5); const crown = (id: string, z: number, w: number, h: number, y: number, x: number, c: string, dark: string): Panel => ({ id, stock: 'sugar', c, w, h, o: [x - w / 2, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="#fff"/>`, print: specks(w, h, dark, 70, 9) }); return [{ id: 'trunk', stock: 'kraft', c: '#7a5237', w: 54, h: 210, o: [-627, 0, -170], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<path d="M6 210Q20 120 16 0H38Q34 120 48 210Z" fill="#fff"/>' }, crown('crown-a', -176, 340, 240, 150, -640, FOLIAGE, '#2f7d48'), { ...crown('crown-b', -160, 190, 130, 250, -570, LEAF, '#3f9a5b'), decal: 'crown-a' }, { ...crown('crown-c', -150, 150, 110, 210, -700, LEAF, '#3f9a5b'), decal: 'crown-a' }]; })();
  const cart = [...parcel({ id: 'door-box', label: 'BLIBLI.COM', color: BLUE, x: -14, z: -56, w: 66, h: 46, d: 44 })].filter(p => !/under|rear|left/.test(p.id) || p.ghost);
  return [...board, arrow, ...pot, ...leaves('plant-a', 0), ...shrub('shrub-d', 590, -130, 200, 92, FOLIAGE, '#2f7d48'), ...tree, ...cart,
    ...tuft('tuft-4', -30, 186, 40, 22, FOLIAGE, 4)];
}
export function street(): Scene {
  const panels = heroPanels().filter(p => !p.id.startsWith('tuft-3') && p.id !== 'post-top').map(p => {
    if (p.id.startsWith('foot-')) return { ...p, decal: 'lawn' };
    if (p.id === 'slot-flap') return { ...p, motion: { when: 'mailbox', edge: 'top', deg: -38 } as Panel['motion'] };
    if (p.id === 'letter') return { ...p, motion: { when: 'mailbox', slide: [0, -14, 0] as V3 } };
    if (p.id === 'flag') return { ...p, motion: { when: 'mailbox', edge: 'left', deg: -20 } as Panel['motion'] };
    if (p.id === 'playwright-flap-l') return { ...p, motion: { when: 'parcels', edge: 'left', deg: -30 } as Panel['motion'] };
    return p;
  });
  return { id: 'street', camera: { zoom: 1, x0: -300, x1: 300 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] }, panels: [...backdrop(), ...ground(), ...shop(), ...dressing(), ...panels] };
}
