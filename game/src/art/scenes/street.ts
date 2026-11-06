import { add, backOf, box, hinged, normal, on, slot, yaw, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, FOLIAGE, INK, SUN, cloud, parcel, reseed, scallopTop, specks } from '../recipes.ts';
import { heroPanels } from './_hero.ts';

const MINT = '#35b58a', PLUM = '#7c6be0', WARM = '#ffe7a8', LEAF = '#57b36f';
const SHOP = { x: 150, z: -80, w: 720, d: 300, ground: 230, upper: 150, peak: 120 };

// Rooflines cut from one sheet: blocks of varied width and height, some with a water tank, mast or stepped top.
function skyline(w: number, h: number, seed: number, lo: number, hi: number, minW: number, maxW: number) {
  reseed(seed);
  let d = `M0 ${h}`, x = 0;
  const rnd = (a: number, b: number) => { const t = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453; return a + (t - Math.floor(t)) * (b - a); };
  while (x < w) {
    const bw = rnd(minW, maxW), top = h - rnd(lo, hi), kind = Math.floor(rnd(0, 5));
    d += `V${top.toFixed(0)}`;
    if (kind === 1) d += `H${(x + bw * .3).toFixed(0)}V${(top - 18).toFixed(0)}H${(x + bw * .42).toFixed(0)}V${top.toFixed(0)}`;
    if (kind === 2) d += `H${(x + bw * .48).toFixed(0)}V${(top - 46).toFixed(0)}H${(x + bw * .52).toFixed(0)}V${top.toFixed(0)}`;
    if (kind === 3) d += `H${(x + bw * .2).toFixed(0)}V${(top - 26).toFixed(0)}H${(x + bw * .8).toFixed(0)}V${top.toFixed(0)}`;
    x += bw; d += `H${Math.min(w, x).toFixed(0)}`;
  }
  return `<path d="${d}V${h}Z" fill="#fff"/>`;
}
const windowsGrid = (w: number, h: number, c: string, every: number, top: number) => { let out = ''; for (let x = 18; x < w; x += every) for (let y = top; y < h - 20; y += 34) if ((x * 7 + y * 3) % 5 > 1) out += `<rect x="${x}" y="${y}" width="9" height="13" fill="${c}"/>`; return out; };
// Open surroundings: the city beyond the street, as flat layers that alternate pale and deep, then far hills.
function backdrop(): Panel[] {
  reseed(11);
  const card = (id: string, z: number, y: number, w: number, h: number, c: string, mask: string, print = ''): Panel => ({ id, stock: 'sugar', c, w, h, o: [-w / 2 + 120, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .36, mask, print });
  return [
    { id: 'sky', backdrop: true, stock: 'cover', c: '#7cc6ea', w: 5200, h: 1500, o: [-2480, -160, -780], u: [1, 0, 0], v: [0, 1, 0], density: .3, print: `${cloud(1500, 330, 2)}${cloud(2400, 240, 1.5)}${cloud(3200, 340, 2.2)}${cloud(1950, 500, 1)}` },
    ...[card('hills-far', -700, -30, 4400, 420, '#b9dfe3', scallopTop(4400, 420, 22, 150)),
    card('city-far', -650, -30, 4200, 640, '#a6cfe0', skyline(4200, 640, 3, 300, 560, 90, 220), windowsGrid(4200, 640, '#c6e3ee', 64, 120)),
    card('city-mid', -580, -30, 3900, 540, '#6fa6bf', skyline(3900, 540, 7, 240, 460, 120, 260), windowsGrid(3900, 540, '#f6dfa0', 52, 110)),
    card('trees-row', -520, -10, 3400, 300, '#4f9c82', scallopTop(3400, 300, 34, 70), specks(3400, 300, '#3a7f66', 200, 9)),
    card('rooftops', -470, -10, 3200, 420, '#e7b48a', skyline(3200, 420, 13, 260, 400, 160, 300), windowsGrid(3200, 420, '#fff4e2', 46, 60))].map(p => ({ ...p, decal: 'sky' }))
  ];
}
// The street: pavement for walking, a kerb, then the road with its markings, on one die-cut base sheet.
function ground(): Panel[] {
  reseed(3);
  const base: Panel = { id: 'lawn', stock: 'greyboard', c: '#6b6f76', w: 4000, h: 1100, o: [-1920, 0, 330], u: [1, 0, 0], v: [0, 0, -1], density: .45, edge: 'fold', split: 4, print: specks(4000, 1100, '#5b5f66', 600, 4) + Array.from({ length: 40 }, (_, i) => `<rect x="${i * 110}" y="72" width="62" height="7" fill="#f4efe2"/>`).join('') };
  const skirt: Panel = { id: 'lawn-skirt', stock: 'greyboard', c: '#4c5058', w: 4000, h: 70, o: [-1920, -70, 331], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2 };
  const paver = on(base, .7, 0, 143, 4000, 957, { id: 'pavers', stock: 'greyboard', c: '#e9dcc4', edge: 'cut', density: .45, print: Array.from({ length: 38 }, (_, i) => `<path d="M${(i + 1) * 107} 0V957" stroke="#c9b99b" stroke-width="2.4"/>`).join('') + Array.from({ length: 10 }, (_, i) => `<path d="M0 ${(i + 1) * 94}H4000" stroke="#c9b99b" stroke-width="2"/>`).join('') + specks(4000, 957, '#bcae94', 300, 3.4) });
  const verge = on(base, .9, 0, 143, 4000, 12, { id: 'kerb', stock: 'greyboard', c: '#cdbfa6', edge: 'cut', density: .6 });
  const zebra = on(base, .8, 2040, 4, 300, 136, { id: 'zebra', stock: 'greyboard', c: '#f4efe2', edge: 'cut', density: .6, mask: Array.from({ length: 7 }, (_, i) => `<rect x="${i * 44}" width="24" height="136" fill="#fff"/>`).join('') });
  const path = on(base, .9, 2030, 362, 80, 58, { id: 'door-path', stock: 'greyboard', c: '#e4d6bd', edge: 'cut', density: .6 });
  return [base, skirt, paver, verge, zebra, path];
}
// Enclosed surroundings: the neighbours. One shopfront design, varied in width, storeys, colour, awning and trade,
// set on a curve so the street wraps toward the viewer like a ring.
type Front = { id: string; x: number; z: number; w: number; h: number; rot: number; c: string; line: string; trim: string; awning: 'stripe' | 'flat' | 'none'; ac: string; icon: string; goods: string; storeys: number };
function shopfront(f: Front): Panel[] {
  const r = yaw(f.rot), o = add([f.x, 0, f.z], r([-f.w / 2, 0, 0])), u = r([1, 0, 0]), v: V3 = [0, 1, 0], n = normal({ u, v });
  const at = (x: number, y: number, gap: number): V3 => add(add(add(o, u, x), v, y), n, gap);
  const door = { x: f.w * .62, w: 74, h: 150 }, win = { x: 26, y: 40, w: f.w * .62 - 50, h: 120 };
  const cols = Math.max(2, Math.round(f.w / 120)), ups = Array.from({ length: f.storeys * cols }, (_, j) => ({ x: (j % cols + .5) * f.w / cols - 34, y: 236 + Math.floor(j / cols) * 104, w: 68, h: 64 }));
  const holes = [win, ...ups].map(q => `M${q.x} ${f.h - q.y}V${f.h - q.y - q.h}H${q.x + q.w}V${f.h - q.y}Z`).join(' ') + ` M${door.x} ${f.h}V${f.h - door.h}H${door.x + door.w}V${f.h}Z`;
  const top = `M0 ${f.h}V${f.h % 3 ? 26 : 12}H${f.w * .3}V0H${f.w * .7}V${f.h % 3 ? 26 : 12}H${f.w}V${f.h}Z`;
  const lines = Array.from({ length: Math.floor(f.h / 26) }, (_, i) => `<path d="M0 ${30 + i * 26}H${f.w}" stroke="${f.line}" stroke-width="1.6"/>`).join('');
  const front: Panel = { id: `${f.id}-front`, stock: 'cover', c: f.c, w: f.w, h: f.h, o, u, v, edge: 'cut', density: 1, mask: `<path fill-rule="evenodd" d="${top} ${holes}" fill="#fff"/>`, print: `${lines}<rect y="${f.h - 206}" width="${f.w}" height="10" fill="${f.trim}"/><rect y="${f.h - 14}" width="${f.w}" height="14" fill="${f.line}"/><rect y="26" width="${f.w}" height="8" fill="${f.trim}"/>` };
  const inside = (id: string, x: number, y: number, w: number, h: number, print: string, emit = .3): Panel => ({ id, stock: 'cover', c: '#f4cf8c', w: w + 10, h: h + 10, o: at(x - 5, y - 5, -16), u, v, edge: 'fold', emit, print, density: 1.2, decal: front.id });
  const frame = (id: string, x: number, y: number, w: number, h: number, cols: number): Panel => { const bar = 5, pw = (w - bar * (cols - 1)) / cols; return on(front, 1.2, x - 6, y - 6, w + 12, h + 12, { id, stock: 'cover', c: f.trim, density: 1.2, mask: slot(w + 12, h + 12, ...Array.from({ length: cols }, (_, i) => [6 + i * (pw + bar), 6, pw, h] as [number, number, number, number])) }); };
  const parts: Panel[] = [front, inside(`${f.id}-shop`, win.x, win.y, win.w, win.h, f.goods), frame(`${f.id}-shopframe`, win.x, win.y, win.w, win.h, 3),
    inside(`${f.id}-door`, door.x, 0, door.w, door.h, '', .7),
    ...ups.flatMap((q, i) => [inside(`${f.id}-up${i}`, q.x, q.y, q.w, q.h, `<path d="M0 0H${q.w + 10}V18Q${(q.w + 10) / 2} 34 0 18Z" fill="${f.ac}"/>`, .2), frame(`${f.id}-upframe${i}`, q.x, q.y, q.w, q.h, 2)])];
  const sign: Panel = { id: `${f.id}-sign`, stock: 'cover', c: CREAM, w: 92, h: 40, o: at(f.w * .62 - 9, 172, 8), u, v, edge: 'cut', density: 2, mask: '<rect width="92" height="40" rx="6" fill="#fff"/>', print: f.icon };
  if (f.awning !== 'none') {
    const aw = f.w - 30, stripe = f.awning === 'stripe' ? Array.from({ length: Math.ceil(aw / 60) }, (_, i) => `<rect x="${i * 60}" width="30" height="60" fill="${CREAM}"/>`).join('') : `<rect y="44" width="${aw}" height="6" fill="${CREAM}"/>`;
    parts.push({ id: `${f.id}-awning`, stock: 'cover', c: f.ac, w: aw, h: 60, o: add(at(15, 172, 0), n, 52), u, v: add(v, n, -.9), edge: 'fold', density: 1.2, print: stripe });
    parts.push({ id: `${f.id}-awning-lip`, stock: 'cover', c: f.ac, w: aw, h: 16, o: add(at(15, 156, 0), n, 52), u, v, edge: 'cut', density: 1.2, print: f.awning === 'stripe' ? stripe : '', mask: f.awning === 'stripe' ? `<path d="M0 0H${aw}V8${Array.from({ length: Math.ceil(aw / 30) }, () => 'a15 8 0 0 1 -30 0').join('')}Z" fill="#fff"/>` : undefined });
  }
  parts.push({ ...sign, o: f.awning === 'none' ? sign.o : at(f.w * .62 - 9, 240, 6) });
  return parts;
}
function neighbours(): Panel[] {
  const cup = `<rect x="34" y="12" width="20" height="18" rx="3" fill="${CORAL}"/><path d="M54 16Q62 16 62 21Q62 26 54 26" fill="none" stroke="${CORAL}" stroke-width="3"/><path d="M38 6Q42 2 38 -2M46 6Q50 2 46 -2" stroke="#8a6a48" stroke-width="2" fill="none"/>`;
  const book = `<path d="M28 10Q38 6 46 12V32Q38 26 28 30Z M64 10Q54 6 46 12V32Q54 26 64 30Z" fill="${DEEP}"/>`;
  const flower = `<g fill="${CORAL}">${Array.from({ length: 6 }, (_, i) => `<circle cx="${46 + Math.cos(i) * 8}" cy="${20 + Math.sin(i) * 8}" r="5"/>`).join('')}</g><circle cx="46" cy="20" r="4.5" fill="${SUN}"/>`;
  const shelf = (cs: string[]) => cs.map((c, i) => `<rect x="${14 + i * 40}" y="${54 - (i % 2) * 14}" width="28" height="${46 + (i % 2) * 14}" fill="${c}"/>`).join('') + `<rect y="100" width="400" height="10" fill="#a8693a"/>`;
  return [
    ...shopfront({ id: 'cafe', x: -560, z: -232, w: 330, h: 392, rot: 8, c: '#e9a77b', line: '#c98a5f', trim: CREAM, awning: 'stripe', ac: '#2f7d48', icon: cup, goods: shelf(['#8a5a3a', CREAM, '#c98a5f', '#8a5a3a', SUN]), storeys: 1 }),
    ...shopfront({ id: 'books', x: -930, z: -150, w: 300, h: 340, rot: 24, c: '#f2cf8a', line: '#d9b06a', trim: '#fff8ec', awning: 'flat', ac: DEEP, icon: book, goods: shelf([CORAL, DEEP, MINT, PLUM, CORAL, SUN]), storeys: 1 }),
    ...shopfront({ id: 'florist', x: 840, z: -176, w: 330, h: 440, rot: -16, c: '#9fc7b4', line: '#7fae99', trim: CREAM, awning: 'stripe', ac: CORAL, icon: flower, goods: shelf([CORAL, SUN, '#e88ab0', CORAL, '#57b36f']), storeys: 2 })
  ];
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
// Main space: freestanding street furniture and passers-by, each a real fold or a stand-up cut card.
const card = (id: string, x: number, z: number, w: number, h: number, c: string, rest: Partial<Panel> = {}, rot = 0, y = 0): Panel => { const r = yaw(rot); return { id, stock: 'cover', c, w, h, o: add([x, y, z], r([-w / 2, 0, 0])), u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1.4, ...rest }; };
function streetLamp(id: string, x: number, z: number, h: number, head: string, rot = 0): Panel[] {
  return [...box({ id: `${id}-post`, x, z, w: 10, h, d: 10, stock: 'greyboard', c: '#3d444e', noTop: true }),
    card(`${id}-arm`, x + 18, z, 46, 8, '#3d444e', { stock: 'greyboard' }, rot, h - 10),
    card(`${id}-head`, x + 34, z + 1, 34, 30, head, { stock: 'vellum', emit: .6, density: 2, mask: '<path d="M6 0H28L34 30H0Z" fill="#fff"/>', print: `<rect width="34" height="5" fill="#3d444e"/>` }, rot, h - 36)];
}
function passerBy(id: string, x: number, z: number, coat: string, bag: string, flip: boolean, kid = false): Panel {
  const k = kid ? .72 : 1, w = 74 * k, h = 176 * k;
  const body = `M22 176V120H14V64Q14 44 30 42Q20 36 22 22Q24 4 36 4Q50 4 50 22Q51 36 42 42Q58 44 58 64V100H70V140H50V176H40V128H32V176Z`;
  return card(id, x, z, w, h, coat, { density: 2, mask: `<g transform="scale(${k}) ${flip ? 'translate(74 0) scale(-1 1)' : ''}"><path d="${body}" fill="#fff"/></g>`, print: `<g transform="scale(${k}) ${flip ? 'translate(74 0) scale(-1 1)' : ''}"><rect width="74" height="44" fill="#f3c9a0"/><path d="M20 4Q36 -6 52 8V18Q36 10 20 18Z" fill="#3a2a1a"/><rect y="44" width="74" height="80" fill="${coat}"/><rect x="48" y="100" width="24" height="40" fill="${bag}"/><rect x="22" y="124" width="30" height="52" fill="#3f4a5c"/></g>` });
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
  // A street tree in its pit, between the café and the bookshop.
  const tree: Panel[] = (() => { reseed(5); const tx = -760, tz = -120; const crown = (id: string, z: number, w: number, h: number, y: number, x: number, c: string, dark: string): Panel => ({ id, stock: 'sugar', c, w, h, o: [x - w / 2, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="#fff"/>`, print: specks(w, h, dark, 70, 9) }); return [{ id: 'trunk', stock: 'kraft', c: '#7a5237', w: 44, h: 220, o: [tx - 22, 0, tz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<path d="M6 220Q16 120 13 0H31Q28 120 38 220Z" fill="#fff"/>' }, crown('crown-a', tz - 6, 280, 200, 170, tx, FOLIAGE, '#2f7d48'), { ...crown('crown-b', tz + 10, 160, 110, 260, tx + 56, LEAF, '#3f9a5b'), decal: 'crown-a' }, { ...crown('crown-c', tz + 20, 130, 96, 220, tx - 70, LEAF, '#3f9a5b'), decal: 'crown-a' }]; })();
  const cart = [...parcel({ id: 'door-box', label: 'BLIBLI.COM', color: BLUE, x: -14, z: -56, w: 66, h: 46, d: 44 })].filter(p => !/under|rear|left/.test(p.id) || p.ghost);
  // Bench under the right window, a sandwich board by the door, a bike, a bin and a hydrant.
  const bench = [...box({ id: 'bench', x: 340, z: -50, y: 30, w: 150, h: 10, d: 40, stock: 'greyboard', c: '#a8693a', top: `<path d="M0 13H150M0 27H150" stroke="#6d4524" stroke-width="2"/>` }), card('bench-back', 340, -68, 150, 34, '#a8693a', { stock: 'greyboard', print: `<path d="M0 12H150M0 24H150" stroke="#6d4524" stroke-width="2"/>` }, 0, 52), card('bench-legs', 340, -32, 150, 30, '#3d444e', { stock: 'greyboard', mask: '<path d="M8 0H22V30H8Z M128 0H142V30H128Z" fill="#fff"/>' })];
  const aboard = [card('aboard-a', 268, 36, 64, 92, CREAM, { print: `<rect x="4" y="4" width="56" height="84" fill="${DEEP}"/><g transform="translate(20 14)"><rect width="24" height="44" rx="4" fill="${CREAM}"/><rect x="3" y="5" width="18" height="32" fill="${BLUE}"/></g><g fill="${SUN}"><circle cx="20" cy="72" r="4"/><circle cx="32" cy="72" r="4" fill="${CORAL}"/><circle cx="44" cy="72" r="4" fill="${MINT}"/></g>` }, -20), { ...card('aboard-b', 262, 18, 64, 92, CREAM, {}, -20), v: unitV([0, .96, -.28]) }];
  const bike = card('bike', 520, -66, 120, 72, '#3d444e', { mask: '<path fill-rule="evenodd" d="M24 72a24 24 0 1 1 .01 0Z M24 64a16 16 0 1 0 -.01 0Z M96 72a24 24 0 1 1 .01 0Z M96 64a16 16 0 1 0 -.01 0Z M22 46L52 18H88L96 46L92 48L84 24H56L28 50Z M48 10H64V16H48Z M84 10L96 4L98 10L88 14Z" fill="#fff"/>', print: `<rect width="120" height="72" fill="${CORAL}"/><rect y="40" width="120" height="32" fill="#3d444e"/>` }, -6);
  const bin = box({ id: 'bin', x: 480, z: 150, w: 34, h: 56, d: 34, stock: 'cover', c: '#2f7d48', front: `<rect y="6" width="34" height="5" fill="${CREAM}"/>`, top: '<rect x="6" y="6" width="22" height="22" fill="#1d3a28"/>' });
  const hydrant = box({ id: 'hydrant', x: -520, z: 166, w: 22, h: 40, d: 22, stock: 'cover', c: CORAL, front: `<rect y="8" width="22" height="5" fill="${CREAM}"/>` });
  const people = [passerBy('walker-a', -40, 156, PLUM, BLUE, false), passerBy('walker-b', 410, 150, SUN, BLUE, true), passerBy('walker-c', 450, 140, '#57b36f', CORAL, true, true)];
  const scooter = card('scooter', -170, 262, 150, 104, BLUE, { mask: '<path fill-rule="evenodd" d="M28 104a22 22 0 1 1 .01 0Z M122 104a22 22 0 1 1 .01 0Z M20 70H130L136 50H100L92 24H104V14H84L94 50H40L30 34H8Z M96 0H150V40H96Z" fill="#fff"/>', print: `<rect width="150" height="104" fill="${BLUE}"/><rect x="96" width="54" height="40" fill="${CORAL}"/><rect x="104" y="8" width="38" height="6" fill="${CREAM}"/><rect y="78" width="150" height="26" fill="#23272d"/>` });
  return [...board, arrow, ...pot, ...leaves('plant-a', 0), ...shrub('shrub-d', 600, -130, 180, 92, FOLIAGE, '#2f7d48'), ...shrub('shrub-e', -330, -150, 150, 70, '#57b36f', '#3f9a5b'), ...tree, ...cart,
    ...streetLamp('lamp-a', -600, 176, 250, '#ffe7a8'), ...streetLamp('lamp-b', 720, 176, 230, '#fff4e2'), ...bench, ...aboard, bike, ...bin, ...hydrant, ...people, scooter];
}
const unitV = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
export function street(): Scene {
  const panels = heroPanels().filter(p => !p.id.startsWith('tuft-3') && p.id !== 'post-top').map(p => {
    if (p.id.startsWith('foot-')) return { ...p, decal: 'lawn' };
    if (p.id === 'slot-flap') return { ...p, motion: { when: 'mailbox', edge: 'top', deg: -38 } as Panel['motion'] };
    if (p.id === 'letter') return { ...p, motion: { when: 'mailbox', slide: [0, -14, 0] as V3 } };
    if (p.id === 'flag') return { ...p, motion: { when: 'mailbox', edge: 'left', deg: -20 } as Panel['motion'] };
    if (p.id === 'playwright-flap-l') return { ...p, motion: { when: 'parcels', edge: 'left', deg: -30 } as Panel['motion'] };
    return p;
  });
  return { id: 'street', camera: { zoom: 1, x0: -300, x1: 300 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] }, panels: [...backdrop(), ...ground(), ...neighbours(), ...shop(), ...dressing(), ...panels] };
}
