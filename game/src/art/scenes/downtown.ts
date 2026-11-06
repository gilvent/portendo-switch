import { add, backOf, box, hinged, normal, on, slot, tilted, yaw, type Lamp, type Panel, type Scene, type V3 } from '../kit.ts';
import { CORAL, CREAM, FOLIAGE, INK, SUN, cloud, reseed, scallopTop, specks } from '../recipes.ts';
import { birds, blocks, card, passerBy, streetLamp } from './street.ts';

// Moperty: a downtown block at golden hour. The palette is the logo's: indigo, lavender and window yellow, on brick and stone.
export const INDIGO = '#5b6bdc', LAVENDER = '#a3adf2', GLOW = '#f5b400', WORD = '#7b88ea', INDIGO_DARK = '#46549f';
const BRICK = '#b0664c', BRICK_LINE = '#8f4f3a', STONE = '#e3c9a0', STEEL = '#2f343c', LIT = '#f7d48a', DARK_PANE = '#465479', TAXI = '#f2c14e';
export const HQ = { x: 150, z: -110, tw: 245, eave: 353, peak: 460, d: 230, hw: 156, heave: 186, hpeak: 251, hd: 70 };
type Kind = 'sale' | 'rent';
const LISTINGS: { id: string; kind: Kind; flag: [number, number] }[] = [
  { id: 'west', kind: 'rent', flag: [-700, -58] }, { id: 'site', kind: 'sale', flag: [-150, -46] },
  { id: 'brownstone', kind: 'sale', flag: [430, -64] }, { id: 'corner', kind: 'rent', flag: [780, -84] }];
// The listing filter's states: everything, then only for sale, then only for rent.
const FILTER: (Kind | 'all')[] = ['all', 'sale', 'rent'];
const listed = (k: Kind) => FILTER.flatMap((f, i) => (f === 'all' || f === k ? [i] : []));

// The Moperty mark, printed small wherever a listing or sign carries it. Drawn from the logo's own proportions (394 x 370).
export const mark = (x: number, y: number, k: number, light = false) => `<g transform="translate(${x} ${y}) scale(${k})">
<path d="M14 370Q0 370 0 356V85L98 0L197 85V370Z" fill="${INDIGO}"/><path d="M197 85L295 0L394 85V356Q394 370 380 370H197Z" fill="${LAVENDER}"/>
<path d="M134 370V220L197 168L260 220V370Z" fill="${light ? '#fff' : CREAM}"/><g fill="${GLOW}"><rect x="28" y="120" width="70" height="70" rx="10"/><rect x="296" y="120" width="70" height="70" rx="10"/><rect x="162" y="246" width="70" height="70" rx="10"/></g>
<path d="M63 120V190M331 120V190M197 246V316M162 281H232" stroke="${light ? '#fff' : CREAM}" stroke-width="7"/></g>`;
const word = (x: number, y: number, size: number, c = WORD, anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Fredoka" font-weight="600" font-size="${size}" fill="${c}">moperty</text>`;
// A listing poster as an agent would print it: the deal in large type and the marketplace's mark underneath.
const poster = (kind: Kind, w: number, h: number) => `<rect width="${w}" height="${h}" fill="#fffaf0"/><rect width="${w}" height="${h * .42}" fill="${kind === 'sale' ? CORAL : INDIGO}"/>
<text x="${w / 2}" y="${h * .3}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="${Math.min(w * .2, h * .22)}" fill="#fffaf0">${kind === 'sale' ? 'FOR SALE' : 'FOR RENT'}</text>
${mark(w * .1, h * .52, Math.min(w * .2, h * .36) / 394)}${word(w * .36, h * .78, Math.min(w * .17, h * .2))}`;

let far = 1;
const fr = (a: number, b: number) => { far = (far * 16807) % 2147483647; return a + (far / 2147483647) * (b - a); };

// Open surroundings: the city past the end of the avenue, from a pale skyline of towers to the nearest dark row with tanks.
function backdrop(): Panel[] {
  reseed(17);
  const FAR = .72;
  const layer = (id: string, z: number, y: number, w: number, h: number, c: string, mask: string, print = ''): Panel => ({ id, stock: 'sugar', c, w, h, o: [-w / 2 + 120, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FAR, mask, print, decal: 'sky' });
  // Far towers: tall slim slabs with stepped crowns and one spire in the middle of the view.
  far = 9; let tMask = '', tPrint = '';
  for (let x = 0; x < 4400;) {
    const bw = fr(70, 150), bh = fr(380, 760), top = 900 - bh, c = ['#c9d5f2', '#bccbee', '#d3dcf4'][Math.floor(fr(0, 3))];
    const crown = fr(0, 1) > .55 ? `<rect x="${(x + bw * .2).toFixed(0)}" y="${(top - 40).toFixed(0)}" width="${(bw * .6).toFixed(0)}" height="40" FILL/><rect x="${(x + bw * .35).toFixed(0)}" y="${(top - 70).toFixed(0)}" width="${(bw * .3).toFixed(0)}" height="30" FILL/>` : '';
    tMask += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="#fff"/>` + crown.replaceAll('FILL', 'fill="#fff"');
    tPrint += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="${c}"/>${crown.replaceAll('FILL', `fill="${c}"`)}`;
    for (let wy = top + 20; wy < 880; wy += 24) for (let wx = x + 8; wx < x + bw - 10; wx += 14) if (fr(0, 1) > .62) tPrint += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="6" height="10" fill="${fr(0, 1) > .5 ? '#fbe7b5' : '#e3e9f8'}"/>`;
    x += bw + fr(-10, 30);
  }
  const spire = `<path d="M2140 900V300H2160V230H2172V160H2184V40L2190 0L2196 40V160H2208V230H2220V300H2240V900Z" FILL/>`;
  tMask += spire.replace('FILL', 'fill="#fff"');
  tPrint += spire.replace('FILL', 'fill="#b6c5ea"') + Array.from({ length: 24 }, (_, i) => `<rect x="2150" y="${320 + i * 24}" width="80" height="3" fill="#d3dcf4"/>`).join('') + `<circle cx="2190" cy="4" r="5" fill="${CORAL}"/>`;
  const mid = blocks(4000, 620, 23, 260, 560, 90, 190, ['#8f9fd6', '#8394cf', '#9aa8dc'], '#f9d98e', true);
  const warm = blocks(3800, 480, 31, 180, 400, 90, 170, ['#d9a27a', '#c98f6c', '#e3b98f', '#b98a9a'], '#ffe2a0', true);
  const near = blocks(3600, 440, 43, 220, 420, 110, 210, ['#5f6aa0', '#6b74a8', '#575f8f'], '#f7c96c', true);
  const plane = `<g transform="translate(3060 640)"><path d="M0 8L40 4L52 0H58L50 6L64 6L70 2H74L70 10L56 12L44 18H36L44 12L6 12Z" fill="#fffdf6"/></g><path d="M3060 652H2760" stroke="#fffdf6" stroke-width="3" stroke-dasharray="40 12" opacity=".7"/>`;
  return [
    { id: 'sky', backdrop: true, stock: 'cover', c: '#8fb3e6', w: 5200, h: 1500, o: [-2480, -160, -780], u: [1, 0, 0], v: [0, 1, 0], density: FAR,
      // Golden hour: the low band of sky goes warm in flat steps, the sun sits upper left where the light comes from.
      print: `<rect y="820" width="5200" height="120" fill="#a9c1ea"/><rect y="900" width="5200" height="600" fill="#f2c6a8"/><circle cx="1180" cy="640" r="74" fill="#ffe7a8"/><circle cx="1180" cy="640" r="54" fill="${SUN}"/>${cloud(500, 660, 1.2, '#f6d6c8')}${cloud(1700, 610, 1.4, '#fdeee4')}${cloud(2600, 700, 1, '#f6d6c8')}${cloud(3500, 600, 1.6, '#fdeee4')}${cloud(4300, 680, 1.1, '#f6d6c8')}${cloud(2150, 780, .7, '#fdeee4')}${plane}${birds([[1900, 700, 1.1], [1935, 684, .9], [1960, 708, .8], [3900, 740, 1], [3930, 728, .8]])}` },
    layer('towers-far', -700, 0, 4400, 900, '#c9d5f2', tMask, tPrint),
    layer('city-mid', -640, 0, 4000, 620, '#8f9fd6', mid.mask, mid.print),
    layer('city-warm', -590, 10, 3800, 480, '#d9a27a', warm.mask, warm.print),
    layer('city-near', -540, 0, 3600, 440, '#5f6aa0', near.mask, near.print)
  ];
}

// Pavement for walking, the kerb, then the road. The cross avenue cuts back through the block on the left.
const AVENUE = { x0: -668, x1: -548 };
function ground(): Panel[] {
  reseed(5);
  const base: Panel = { id: 'road', stock: 'greyboard', c: '#5d616b', w: 4000, h: 1100, o: [-1920, 0, 330], u: [1, 0, 0], v: [0, 0, -1], density: .45, edge: 'fold', split: 4,
    print: specks(4000, 1100, '#4d515a', 600, 4) + Array.from({ length: 36 }, (_, i) => `<rect x="${i * 112}" y="${1100 - 76}" width="60" height="6" fill="${TAXI}"/>`).join('')
      + [[1500, 1100 - 40], [2400, 1100 - 110], [2900, 1100 - 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#4a4d55"/><circle cx="${x}" cy="${y}" r="20" fill="none" stroke="#6a6e77" stroke-width="2"/><path d="M${x - 14} ${y}H${x + 14}M${x} ${y - 14}V${y + 14}" stroke="#6a6e77" stroke-width="2"/>`).join('')
      + [1700, 2250, 2700].map(x => `<rect x="${x}" y="${1100 - 142}" width="44" height="10" fill="#2d3036"/><path d="M${x + 6} ${1100 - 142}v10M${x + 14} ${1100 - 142}v10M${x + 22} ${1100 - 142}v10M${x + 30} ${1100 - 142}v10M${x + 38} ${1100 - 142}v10" stroke="#5d616b" stroke-width="2"/>`).join('')
      // The avenue's own centre line, running back between the buildings.
      + Array.from({ length: 6 }, (_, i) => `<rect x="${1920 + (AVENUE.x0 + AVENUE.x1) / 2 - 3}" y="${i * 70}" width="6" height="40" fill="${TAXI}"/>`).join('') };
  const skirt: Panel = { id: 'road-skirt', stock: 'greyboard', c: '#41444b', w: 4000, h: 70, o: [-1920, -70, 331], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2 };
  const pw = 4000, ph = 957, ax0 = AVENUE.x0 + 1920, ax1 = AVENUE.x1 + 1920, cut = 330 - 143 - (-30);
  // Slabs everywhere except the avenue, which only the pavement's front strip crosses.
  const paver = on(base, .7, 0, 143, pw, ph, { id: 'pavement', stock: 'greyboard', c: '#ddd5c6', edge: 'cut', density: .45,
    mask: `<path fill-rule="evenodd" d="M0 0H${pw}V${ph}H0Z M${ax0} 0V${ph - cut}H${ax1}V0Z" fill="#fff"/>`,
    print: Array.from({ length: 50 }, (_, i) => `<path d="M${(i + 1) * 80} 0V${ph}" stroke="#bdb3a1" stroke-width="2.2"/>`).join('') + Array.from({ length: 12 }, (_, i) => `<path d="M0 ${(i + 1) * 80}H${pw}" stroke="#bdb3a1" stroke-width="2"/>`).join('') + specks(pw, ph, '#b3a994', 260, 3) });
  const kerb = on(base, .9, 0, 143, 4000, 12, { id: 'kerb', stock: 'greyboard', c: '#c9c0ae', edge: 'cut', density: .6 });
  const zebra = on(base, .8, 1920 - 760, 4, 300, 136, { id: 'zebra', stock: 'greyboard', c: '#f1ece0', edge: 'cut', density: .6, mask: Array.from({ length: 7 }, (_, i) => `<rect x="${i * 44}" width="24" height="136" fill="#fff"/>`).join('') });
  const door = on(base, .9, 1920 + HQ.x - 60, 330 - HQ.z - 40 - 16, 120, 16, { id: 'hq-step', stock: 'greyboard', c: '#cfc6b4', edge: 'cut', density: .8 });
  return [base, skirt, paver, kerb, zebra, door];
}

// One downtown building design, varied by width, storeys, brick, ground floor and roof furniture. Windows are real holes
// with lit rooms behind; fire escapes, cornices and sills are carved relief on the facade.
type Bldg = {
  id: string; x: number; z: number; w: number; h: number; rot: number; c: string; line: string; trim: string; storeys: number; cols: number;
  ground: 'shop' | 'stoop'; ac?: string; flowers?: boolean; chimney?: number; icon?: string; goods?: string; fire?: number; tank?: number; side?: 'left' | 'right'; sideW?: number; sidePrint?: string;
  listing?: { kind: Kind; at: [number, number] }; seed: number; lit?: number;
};
function building(f: Bldg): Panel[] {
  reseed(f.seed);
  const r = yaw(f.rot), o = add([f.x, 0, f.z], r([-f.w / 2, 0, 0])), u = r([1, 0, 0]), v: V3 = [0, 1, 0], n = normal({ u, v });
  const at = (x: number, y: number, gap: number): V3 => add(add(add(o, u, x), v, y), n, gap);
  const G = f.ground === 'shop' ? 150 : 120, top = f.h - 40, sh = (top - G) / f.storeys, ww = Math.min(50, f.w / f.cols * .42), wh = sh * .58;
  const ups: { x: number; y: number; w: number; h: number }[] = [];
  for (let s = 0; s < f.storeys; s++) for (let c = 0; c < f.cols; c++) ups.push({ x: (c + .5) * f.w / f.cols - ww / 2, y: G + s * sh + sh * .22, w: ww, h: wh });
  const door = f.ground === 'shop' ? { x: f.w * .66, y: 0, w: 60, h: 118 } : { x: f.w / 2 - 32, y: 46, w: 64, h: 110 };
  const shop = f.ground === 'shop' ? { x: 22, y: 26, w: f.w * .66 - 44, h: 96 } : null;
  const holes = [...ups, door, ...(shop ? [shop] : [])].map(q => `M${q.x} ${f.h - q.y}V${f.h - q.y - q.h}H${q.x + q.w}V${f.h - q.y}Z`).join(' ');
  const brick = `<pattern id="${f.id}-brick" width="28" height="12" patternUnits="userSpaceOnUse"><rect width="28" height="12" fill="${f.c}"/><path d="M0 11.5H28M0 5.5H28M7 0V5.5M21 6V11.5" stroke="${f.line}" stroke-width="1.1"/></pattern>`;
  const lintels = ups.map(q => `<rect x="${q.x - 5}" y="${f.h - q.y - q.h - 9}" width="${q.w + 10}" height="9" fill="${f.trim}"/>`).join('');
  const front: Panel = { id: `${f.id}-front`, stock: 'cover', c: f.c, w: f.w, h: f.h, o, u, v, edge: 'cut', density: 1,
    mask: `<path fill-rule="evenodd" d="M0 ${f.h}V0H${f.w}V${f.h}Z ${holes}" fill="#fff"/>`,
    print: `<defs>${brick}</defs><rect width="${f.w}" height="${f.h}" fill="url(#${f.id}-brick)"/>${lintels}<rect y="${f.h - G - 8}" width="${f.w}" height="12" fill="${f.trim}"/><rect y="${f.h - 12}" width="${f.w}" height="12" fill="${f.line}"/>` };
  const room = (id: string, q: { x: number; y: number; w: number; h: number }, print: string, emit: number, c = LIT): Panel => ({ id, stock: 'cover', c, w: q.w + 10, h: q.h + 10, o: at(q.x - 5, q.y - 5, -14), u, v, edge: 'fold', emit, print, density: 1, decal: front.id });
  const lit = f.lit ?? .55;
  const parts: Panel[] = [front];
  ups.forEach((q, i) => {
    const on_ = (f.seed * 7 + i * 13) % 10 / 10 < lit, blind = (i * 5 + f.seed) % 3;
    const print = on_ ? `<rect width="${q.w + 10}" height="${q.h + 10}" fill="${LIT}"/>${blind === 0 ? `<rect width="${q.w + 10}" height="${(q.h + 10) * .35}" fill="#e9b25f"/>` : blind === 1 ? `<path d="M0 0H${(q.w + 10) * .3}Q${(q.w + 10) * .2} ${q.h * .6} 0 ${q.h + 10}Z M${q.w + 10} 0H${(q.w + 10) * .7}Q${(q.w + 10) * .8} ${q.h * .6} ${q.w + 10} ${q.h + 10}Z" fill="${CORAL}" fill-opacity=".7"/>` : `<rect x="4" y="${q.h * .7}" width="${q.w * .5}" height="${q.h * .3 + 6}" fill="#5c7a4f"/>`}`
      : `<rect width="${q.w + 10}" height="${q.h + 10}" fill="${DARK_PANE}"/><path d="M0 ${q.h * .2}L${q.w + 10} ${q.h * .05}" stroke="#7d8db8" stroke-width="3" opacity=".5"/>`;
    parts.push(room(`${f.id}-room${i}`, q, print, on_ ? .5 : 0, on_ ? LIT : DARK_PANE));
    parts.push(on(front, 1.2, q.x - 4, q.y - 4, q.w + 8, q.h + 8, { id: `${f.id}-sash${i}`, stock: 'cover', c: f.trim, density: 1.2, mask: slot(q.w + 8, q.h + 8, [4, 4, q.w, q.h / 2 - 2], [4, q.h / 2 + 6, q.w, q.h / 2 - 2]) }));
  });
  // Sills stick out under every window, and a deep cornice caps the front: carved, so the camera sees their tops.
  const lbox = (id: string, lx: number, ly: number, w: number, h: number, d: number, c: string, extra: Partial<Parameters<typeof box>[0]> = {}) => {
    const p = at(lx, 0, d / 2);
    return box({ id, x: p[0], z: p[2], y: ly, w, h, d, rot: f.rot, stock: 'cover', c, ...extra });
  };
  const carved: Panel[] = [];
  ups.forEach((q, i) => carved.push(...lbox(`${f.id}-sill${i}`, q.x + q.w / 2, q.y - 7, q.w + 12, 7, 9, f.trim)));
  ups.forEach((q, i) => { if ((i * 7 + f.seed) % 5 === 1) carved.push(...lbox(`${f.id}-ac${i}`, q.x + q.w / 2, q.y + 2, 34, 22, 22, '#d9dbe0', { front: `<path d="M4 5H30M4 10H30M4 15H30" stroke="#9aa0ab" stroke-width="1.6"/>` })); });
  if (f.flowers) ups.forEach((q, i) => { const fl = Array.from({ length: 6 }, (_, k) => `<circle cx="${4 + k * (q.w + 4) / 6}" cy="${3 + (k % 2) * 2}" r="3.4" fill="${[CORAL, SUN, '#e88ab0'][k % 3]}"/>`).join(''); carved.push(...lbox(`${f.id}-flowers${i}`, q.x + q.w / 2, q.y - 2, q.w + 8, 14, 14, '#7a4f3c', { top: `<rect width="${q.w + 8}" height="14" fill="#3f9a5b"/>${fl}`, front: `<rect width="${q.w + 8}" height="5" fill="#3f9a5b"/>${fl}` })); });
  carved.push(...lbox(`${f.id}-cornice`, f.w / 2, top + 8, f.w + 16, 22, 22, f.trim, { front: `<path d="${Array.from({ length: Math.ceil(f.w / 18) + 1 }, (_, i) => `M${i * 18 + 6} 14v8`).join('')}" stroke="${f.line}" stroke-width="5"/>` }));
  carved.push(...lbox(`${f.id}-band`, f.w / 2, G - 4, f.w, 10, 8, f.trim));
  // Fire escape: a landing under each storey's windows, railings, and stairs running parallel to the wall between landings.
  if (f.fire !== undefined) {
    const fx = f.fire * f.w / f.cols - 6, fw = f.w / f.cols * 2 + 12, depth = 38;
    for (let s = 0; s < f.storeys; s++) {
      const y = G + s * sh + sh * .2 - 6;
      carved.push({ id: `${f.id}-landing${s}`, stock: 'greyboard', c: STEEL, w: fw, h: depth, o: at(fx, y, depth), u, v: [-n[0], -n[1], -n[2]], edge: 'cut', density: 1, mask: slot(fw, depth, ...Array.from({ length: Math.floor(fw / 10) }, (_, k) => [k * 10 + 3, 4, 5, depth - 8] as [number, number, number, number])) });
      carved.push({ id: `${f.id}-rail${s}`, stock: 'greyboard', c: STEEL, w: fw, h: 34, o: at(fx, y, depth), u, v, edge: 'cut', density: 1.2,
        mask: `<path fill-rule="evenodd" d="M0 0H${fw}V34H0Z ${Array.from({ length: Math.floor(fw / 8) }, (_, k) => `M${k * 8 + 3} 4V30H${k * 8 + 8}V4Z`).join(' ')}" fill="#fff"/>` });
      for (const side of [0, fw - 3]) carved.push({ id: `${f.id}-end${s}-${side ? 'r' : 'l'}`, stock: 'greyboard', c: STEEL, w: depth, h: 34, o: at(fx + side + 3, y, depth), u: [-n[0], -n[1], -n[2]], v, edge: 'cut', density: 1, mask: `<path fill-rule="evenodd" d="M0 0H${depth}V34H0Z M3 4V30H${depth - 3}V4Z" fill="#fff"/>` });
      if (s < f.storeys - 1) {
        const run = fw * .62, len = Math.hypot(run, sh), deg = Math.atan2(sh, run) * 180 / Math.PI;
        const stair: Panel = { id: `${f.id}-stair${s}`, stock: 'greyboard', c: STEEL, w: len, h: 22, o: at(fx + fw * .19 + run / 2 - len / 2, y + sh / 2 - 11, depth * .55), u, v, edge: 'cut', density: 1,
          mask: `<path fill-rule="evenodd" d="M0 0H${len}V22H0Z ${Array.from({ length: Math.floor(len / 9) }, (_, k) => `M${k * 9 + 3} 4V18H${k * 9 + 9}V4Z`).join(' ')}" fill="#fff"/>` };
        carved.push(tilted(stair, s % 2 ? -deg : deg));
      }
    }
    const y0 = G + sh * .2 - 6;
    // Life on the landings: washing pegged to the second rail, pot plants on the first and third.
    const y1 = G + sh + sh * .2 - 6;
    carved.push({ id: `${f.id}-washing`, stock: 'bond', c: '#fff', w: fw - 16, h: 44, o: at(fx + 8, y1 - 10, depth + 2), u, v, edge: 'cut', density: 1.4,
      mask: `<path d="M0 0H${fw - 16}V2H0Z M10 2H34V30H28V18H16V30H10Z M44 2H62V40H44Z M72 2H${Math.min(fw - 20, 100)}V24H72Z" fill="#fff"/>`,
      print: `<rect x="10" width="24" height="30" fill="${CORAL}"/><rect x="44" width="18" height="40" fill="#7fb2c4"/><rect x="72" width="40" height="24" fill="${SUN}"/><rect width="${fw}" height="2" fill="${STEEL}"/>` });
    [0, 2].filter(s2 => s2 < f.storeys).forEach(s2 => {
      const yy = G + s2 * sh + sh * .2 - 6;
      carved.push({ id: `${f.id}-pots${s2}`, stock: 'sugar', c: FOLIAGE, w: 40, h: 34, o: at(fx + 12 + s2 * 20, yy, depth - 10), u, v, edge: 'cut', density: 1.4,
        mask: '<path d="M8 34L6 20H34L32 34Z M4 22Q2 8 12 4Q16 14 20 20Q22 2 30 0Q38 12 36 22Z" fill="#fff"/>', print: `<path d="M6 20H34L32 34H8Z" fill="#b5654a"/>` });
    });
    carved.push({ id: `${f.id}-drop`, stock: 'greyboard', c: STEEL, w: 24, h: 70, o: at(fx + fw - 34, y0 - 70, depth - 4), u, v, edge: 'cut', density: 1, mask: `<path fill-rule="evenodd" d="M0 0H24V70H0Z ${Array.from({ length: 7 }, (_, k) => `M4 ${k * 10 + 3}V${k * 10 + 9}H20V${k * 10 + 3}Z`).join(' ')}" fill="#fff"/>` });
  }
  parts.push(...carved.map(p => ({ ...p, decal: front.id, view: true })));
  // Ground floor: a corner shop under an awning, or a raised stoop to the front door.
  if (shop) {
    parts.push(room(`${f.id}-shop`, shop, f.goods ?? '', .45));
    parts.push(on(front, 1.2, shop.x - 6, shop.y - 6, shop.w + 12, shop.h + 12, { id: `${f.id}-shopframe`, stock: 'cover', c: f.trim, density: 1.2, mask: slot(shop.w + 12, shop.h + 12, ...Array.from({ length: 3 }, (_, i) => [6 + i * (shop.w - 10) / 3 + i * 5, 6, (shop.w - 10) / 3, shop.h] as [number, number, number, number])) }));
    parts.push(room(`${f.id}-door`, door, `<rect x="8" y="10" width="${door.w - 6}" height="${door.h - 10}" fill="#ffe2a8"/><rect x="${door.w * .55}" y="${door.h * .5}" width="6" height="14" fill="${INK}"/>`, .7, '#8a5a3a'));
    const aw = f.w - 24, stripe = Array.from({ length: Math.ceil(aw / 50) }, (_, i) => `<rect x="${i * 50}" width="25" height="56" fill="${CREAM}"/>`).join('');
    parts.push({ id: `${f.id}-awning`, stock: 'cover', c: f.ac ?? FOLIAGE, w: aw, h: 56, o: add(at(12, 140, 0), n, 48), u, v: add(v, n, -.86), edge: 'fold', density: 1.2, print: stripe });
    parts.push({ id: `${f.id}-awning-lip`, stock: 'cover', c: f.ac ?? FOLIAGE, w: aw, h: 14, o: add(at(12, 126, 0), n, 48), u, v, edge: 'cut', density: 1.2, print: stripe, mask: `<path d="M0 0H${aw}V7${Array.from({ length: Math.ceil(aw / 25) }, () => 'a12.5 7 0 0 1 -25 0').join('')}Z" fill="#fff"/>` });
    if (f.icon) parts.push(on(front, 6, f.w * .66 - 14, G - 2, 88, 34, { id: `${f.id}-sign`, stock: 'cover', c: CREAM, density: 2, decal: undefined, mask: '<rect width="88" height="34" rx="5" fill="#fff"/>', print: f.icon }));
  } else {
    parts.push(room(`${f.id}-door`, door, `<rect x="5" y="5" width="${door.w}" height="${door.h * .3}" fill="#ffe2a8"/><rect x="5" y="${door.h * .34}" width="${door.w}" height="${door.h * .7}" fill="${INDIGO_DARK}"/><path d="M${door.w / 2 + 5} ${door.h * .34}V${door.h + 10}" stroke="#2f3770" stroke-width="2"/>`, .5, '#5a3a28'));
    // The stoop: five steps up to the door, with its side walls.
    const steps = 5, rise = door.y / steps, tread = 16, sw = door.w + 30, sd = steps * tread;
    const stepsPrint = Array.from({ length: steps }, (_, i) => `<rect y="${i * rise}" width="${sw}" height="2" fill="#7a5a48"/>`).join('');
    const p = at(door.x + door.w / 2, 0, sd / 2);
    const stoop = box({ id: `${f.id}-stoop`, x: p[0], z: p[2], w: sw, h: door.y, d: sd, rot: f.rot, stock: 'cover', c: STONE, front: stepsPrint,
      left: `<path d="M0 0H${sd}L0 ${door.y}Z" fill="#cdb38a"/>`, right: `<path d="M0 0H${sd}L${sd} ${door.y}Z" fill="#cdb38a"/>` });
    parts.push(...stoop.filter(q => !q.id.endsWith('-rear') && !q.id.endsWith('-under')));
  }
  // A side wall where the block ends, turned to the avenue or the next gap.
  if (f.side) {
    const sw = f.sideW ?? 200, right = f.side === 'right';
    const so = right ? add(o, u, f.w) : add(o, n, -sw), su: V3 = right ? [-n[0], -n[1], -n[2]] : n;
    parts.push({ id: `${f.id}-side`, stock: 'cover', c: f.line, w: sw, h: f.h, o: so, u: su, v, edge: 'fold', density: .8,
      print: `<defs><pattern id="${f.id}-sbrick" width="28" height="12" patternUnits="userSpaceOnUse"><rect width="28" height="12" fill="${f.line}"/><path d="M0 11.5H28M0 5.5H28M7 0V5.5M21 6V11.5" stroke="#6e3a2a" stroke-width="1.1" stroke-opacity=".7"/></pattern></defs><rect width="${sw}" height="${f.h}" fill="url(#${f.id}-sbrick)"/>${f.sidePrint ?? ''}` });
  }
  // Roof furniture behind the parapet: a timber water tank on steel legs.
  if (f.tank !== undefined) {
    const tw = 74, th = 128;
    parts.push({ id: `${f.id}-tank`, stock: 'kraft', c: '#8a6a50', w: tw, h: th, o: at(f.tank - tw / 2, f.h - 26, -46), u, v, edge: 'cut', density: 1.4,
      mask: `<path d="M10 ${th}V78H6V30Q6 24 12 22L37 0L62 22Q68 24 68 30V78H64V${th}H58V84H16V${th}Z" fill="#fff"/>`,
      print: `<path d="M6 22L37 0L68 22Z" fill="#5d4a3c"/><g stroke="#3d342c" stroke-width="2.4"><path d="M6 36H68M6 54H68M6 70H68"/></g><path d="M18 26V78M30 24V78M44 24V78M56 26V78" stroke="#6e5340" stroke-width="1.2"/><rect y="78" width="74" height="${th - 78}" fill="${STEEL}"/>` });
  }
  if (f.chimney !== undefined) parts.push({ id: `${f.id}-chimney`, stock: 'cover', c: f.line, w: 34, h: 60, o: at(f.chimney, f.h - 20, -30), u, v, edge: 'cut', density: 1.4, print: `<rect width="34" height="8" fill="${f.trim}"/><path d="M0 22H34M0 38H34" stroke="#6e3a2a" stroke-width="1.2"/>` });
  if (f.listing) {
    const [lx, ly] = f.listing.at;
    parts.push(on(front, 1.6, lx, ly, 70, 46, { id: `${f.id}-poster`, stock: 'bond', c: '#fffaf0', density: 3, print: poster(f.listing.kind, 70, 46) }));
  }
  return parts;
}

// The Moperty office: the logo built as a building. Two tall gabled towers, indigo and lavender, with the small white
// house in front as the entrance, every window lit in the logo's yellow.
function headquarters(): Panel[] {
  const { x, z, tw, eave, peak, d, hw, heave, hpeak, hd } = HQ, rise = peak - eave, k = peak / 370;
  const out: Panel[] = [];
  const winPx = 70 * k, rx = 10 * k;
  const towerMask = (left: boolean) => {
    const holes = [[28 * k, peak - 190 * k], [28 * k, peak - 190 * k - winPx - 52]].map(([wx, wy]) => { const xx = left ? wx : tw - wx - winPx; return `M${xx} ${peak - wy}V${peak - wy - winPx}H${xx + winPx}V${peak - wy}Z`; }).join(' ');
    const display = left ? `M18 ${peak - 18}V${peak - 108}H${tw - hw / 2 - 18}V${peak - 18}Z` : `M${hw / 2 + 18} ${peak - 18}V${peak - 108}H${tw - 18}V${peak - 18}Z`;
    return `<path fill-rule="evenodd" d="M0 ${rise}L${tw / 2} 0L${tw} ${rise}V${peak - (left ? 0 : 16)}${left ? '' : `Q${tw} ${peak} ${tw - 16} ${peak}`}H${left ? 16 : 0}${left ? `Q0 ${peak} 0 ${peak - 16}` : ''}Z ${holes} ${display}" fill="#fff"/>`;
  };
  const towers = [{ id: 'hq-l', c: INDIGO, roof: '#4c5bc8', side: '#4f5ec9', ox: x - tw, left: true }, { id: 'hq-r', c: LAVENDER, roof: '#8f9ae6', side: '#919ce6', ox: x, left: false }];
  for (const t of towers) {
    const front: Panel = { id: `${t.id}-front`, stock: 'cover', c: t.c, w: tw, h: peak, o: [t.ox, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1, mask: towerMask(t.left),
      print: `<rect y="${peak - 14}" width="${tw}" height="14" fill="${t.left ? '#3f4cb0' : '#8590de'}"/>` };
    out.push(front);
    // The logo's windows: rounded, split down the middle, glowing; and a shop window of listings at street level.
    const wins = [peak - 190 * k, peak - 190 * k - winPx - 52].map(wy => [t.left ? 28 * k : tw - 28 * k - winPx, wy] as const);
    wins.forEach(([wx, wy], i) => {
      out.push({ id: `${t.id}-room${i}`, stock: 'cover', c: GLOW, w: winPx + 12, h: winPx + 12, o: [t.ox + wx - 6, wy - 6, z - 14], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: .7, density: 1, decal: front.id,
        print: `<rect width="${winPx + 12}" height="${winPx + 12}" fill="${GLOW}"/><rect x="${winPx * .2}" y="${winPx * .55}" width="${winPx * .5}" height="${winPx * .4}" fill="#e09a00"/>` });
      out.push(on(front, 1.2, wx - 5, wy - 5, winPx + 10, winPx + 10, { id: `${t.id}-frame${i}`, stock: 'cover', c: CREAM, density: 1.4,
        mask: `<path fill-rule="evenodd" d="M${rx} 0H${winPx + 10 - rx}Q${winPx + 10} 0 ${winPx + 10} ${rx}V${winPx + 10 - rx}Q${winPx + 10} ${winPx + 10} ${winPx + 10 - rx} ${winPx + 10}H${rx}Q0 ${winPx + 10} 0 ${winPx + 10 - rx}V${rx}Q0 0 ${rx} 0Z M5 5V${winPx + 5}H${winPx / 2 + 2}V5Z M${winPx / 2 + 8} 5V${winPx + 5}H${winPx + 5}V5Z" fill="#fff"/>` }));
    });
    const dx = t.left ? 18 : hw / 2 + 18, dw = tw - hw / 2 - 36;
    const cards = Array.from({ length: 3 }, (_, i) => `<g transform="translate(${10 + i * (dw / 3)} 16)"><rect width="${dw / 3 - 12}" height="62" fill="#fffaf0"/><rect x="4" y="4" width="${dw / 3 - 20}" height="30" fill="${[LAVENDER, '#9fc7b4', STONE][(i + (t.left ? 0 : 1)) % 3]}"/><path d="M${dw / 6 - 6} 10L${dw / 6 + 6} 18V30H${dw / 6 - 18}V18Z" fill="#fffaf0"/><rect x="4" y="40" width="${dw / 4}" height="5" fill="${INK}" fill-opacity=".6"/><rect x="4" y="50" width="${dw / 6}" height="4" fill="${i % 2 ? CORAL : INDIGO}"/></g>`).join('');
    out.push({ id: `${t.id}-display`, stock: 'cover', c: '#ffe7b0', w: dw + 10, h: 100, o: [t.ox + dx - 5, 13, z - 14], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: .45, density: 1, decal: front.id, print: `<rect width="${dw + 10}" height="100" fill="#ffe7b0"/>${cards}` });
    out.push(on(front, 1.2, dx - 5, 13, dw + 10, 100, { id: `${t.id}-dframe`, stock: 'cover', c: CREAM, density: 1.2, mask: slot(dw + 10, 100, [5, 5, dw / 2 - 2, 90], [dw / 2 + 8, 5, dw / 2 - 3, 90]) }));
    const sideX = t.left ? t.ox : t.ox + tw;
    out.push({ id: `${t.id}-side`, stock: 'cover', c: t.side, w: d, h: eave, o: t.left ? [sideX, 0, z - d] : [sideX, 0, z], u: t.left ? [0, 0, 1] : [0, 0, -1], v: [0, 1, 0], edge: 'fold', density: .8,
      print: [0, 1].flatMap(r => [0, 1, 2].map(i => `<g transform="translate(${34 + i * 64} ${eave - (r ? 330 : 236)})"><rect width="44" height="44" rx="6" fill="${GLOW}"/><path d="M22 0V44" stroke="${t.side}" stroke-width="4"/></g>`)).join('') });
    // Two roof slopes per tower, meeting the neighbour's in a valley.
    const a = Math.atan2(rise, tw / 2), len = Math.hypot(tw / 2, rise) + 4, ridge: V3 = [t.ox + tw / 2, peak + 1, z + 4];
    for (const s of [-1, 1] as const) {
      const dn: V3 = [s * Math.cos(a), -Math.sin(a), 0];
      const slope: Panel = s < 0 ? { id: `${t.id}-roof-l`, stock: 'cover', c: t.roof, w: len, h: d + 8, o: add(ridge, dn, len), u: [-dn[0], -dn[1], -dn[2]], v: [0, 0, -1], edge: 'cut', density: .8 }
        : { id: `${t.id}-roof-r`, stock: 'cover', c: t.roof, w: len, h: d + 8, o: ridge, u: dn, v: [0, 0, -1], edge: 'cut', density: .8 };
      out.push({ ...slope, print: Array.from({ length: 6 }, (_, i) => `<path d="M${(i + 1) * len / 7} 0V${d + 8}" stroke="#000" stroke-opacity=".1" stroke-width="2"/>`).join('') });
    }
  }
  // The small white house: the front door, with the logo's four-pane window above it.
  const hz = z + hd, hx = x - hw / 2, hrise = hpeak - heave, door = { w: 70, h: 104 }, win = 56;
  const holes = `M${hw / 2 - door.w / 2} ${hpeak}V${hpeak - door.h}H${hw / 2 + door.w / 2}V${hpeak}Z M${hw / 2 - win / 2} ${hpeak - 126}V${hpeak - 126 - win}H${hw / 2 + win / 2}V${hpeak - 126}Z`;
  const house: Panel = { id: 'hq-house', stock: 'cover', c: '#fbf8f1', w: hw, h: hpeak, o: [hx, 0, hz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
    mask: `<path fill-rule="evenodd" d="M0 ${hrise}L${hw / 2} 0L${hw} ${hrise}V${hpeak}H0Z ${holes}" fill="#fff"/>` };
  out.push(house);
  out.push({ id: 'hq-house-room', stock: 'cover', c: GLOW, w: win + 10, h: win + 10, o: [x - win / 2 - 5, 121, hz - 12], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: .7, density: 1.2, decal: house.id });
  out.push(on(house, 1.2, hw / 2 - win / 2 - 5, 121, win + 10, win + 10, { id: 'hq-house-frame', stock: 'cover', c: CREAM, density: 1.6, mask: slot(win + 10, win + 10, [5, 5, win / 2 - 2, win / 2 - 2], [win / 2 + 7, 5, win / 2 - 2, win / 2 - 2], [5, win / 2 + 7, win / 2 - 2, win / 2 - 2], [win / 2 + 7, win / 2 + 7, win / 2 - 2, win / 2 - 2]) }));
  out.push({ id: 'hq-lobby', stock: 'cover', c: '#ffe2a8', w: door.w + 20, h: door.h + 8, o: [x - door.w / 2 - 10, 0, hz - 26], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: .9, density: 1.2,
    print: `<rect x="10" y="40" width="${door.w}" height="6" fill="${INDIGO}"/>${mark(door.w / 2 - 6, 14, 32 / 394)}` });
  const leaf = (id: string, ox: number, edge: 'left' | 'right'): Panel => ({ id, stock: 'cover', c: INDIGO, w: door.w / 2, h: door.h, o: [ox, 0, hz + .8], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6,
    motion: { when: 'hq-door', edge, deg: edge === 'left' ? 72 : -72 }, mask: slot(door.w / 2, door.h, [7, 8, door.w / 2 - 14, door.h - 26]) });
  out.push(leaf('hq-door-l', x - door.w / 2, 'left'), leaf('hq-door-r', x, 'right'));
  out.push({ id: 'hq-house-l', stock: 'cover', c: '#ece6da', w: hd, h: heave, o: [hx, 0, z], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: 1 });
  const ha = Math.atan2(hrise, hw / 2), hl = Math.hypot(hw / 2, hrise) + 8, hridge: V3 = [x, hpeak + 1, hz + 8];
  for (const s of [-1, 1] as const) {
    const dn: V3 = [s * Math.cos(ha), -Math.sin(ha), 0];
    out.push(s < 0 ? { id: 'hq-house-roof-l', stock: 'cover', c: '#e4ddd0', w: hl, h: hd + 8, o: add(hridge, dn, hl), u: [-dn[0], -dn[1], -dn[2]], v: [0, 0, -1], edge: 'cut', density: 1 }
      : { id: 'hq-house-roof-r', stock: 'cover', c: '#e4ddd0', w: hl, h: hd + 8, o: hridge, u: dn, v: [0, 0, -1], edge: 'cut', density: 1 });
  }
  // The name, on a low stone sign at the foot of the indigo tower, as on the logo.
  out.push(...box({ id: 'hq-sign', x: x - 150, z: z + 50, w: 200, h: 48, d: 26, stock: 'cover', c: '#fbf8f1', side: '#e4ddd0', front: `${mark(12, 8, 32 / 394)}${word(54, 36, 30)}`, top: '' }).filter(p => !/rear|under|left/.test(p.id)));
  out.push(...box({ id: 'hq-planter', x: x + 150, z: z + 44, w: 120, h: 30, d: 36, stock: 'cover', c: '#e4ddd0', top: `<rect x="4" y="4" width="112" height="28" fill="#4a3424"/>` }).filter(p => /front|top/.test(p.id)));
  out.push(card('hq-shrub', x + 150, z + 52, 130, 56, FOLIAGE, { stock: 'sugar', density: 1.6, mask: scallopTop(130, 56, 4, 18), print: specks(130, 56, '#2f7d48', 40, 6) }, 0, 28));
  return out;
}

// A new block going up, module by module. The tower crane sets each finished floor on the last; the hoarding hides the base.
const SITE = { x: -330, z: -230, w: 270, d: 150, fh: 92 };
// Each module waits on the hook a little above the floor it will sit on.
const hangY = (i: number) => i * SITE.fh + 56;
const MODULES = [
  { id: 'base', tags: [['POSTGRES', '#336791'], ['LARAVEL', '#F9322C']], c: '#cfc6b8' },
  { id: 'floor1', tags: [['VUE', '#42b884']], c: '#d9d1c4' },
  { id: 'floor2', tags: [['SASS', '#cf649a']], c: '#cfc6b8' },
  { id: 'roof', tags: [['NGINX', '#22963a'], ['GOOGLE CLOUD', '#fbbd05']], c: '#d9d1c4' }];
function site(): Panel[] {
  const out: Panel[] = [];
  const modPrint = (w: number, h: number, i: number, lit: boolean) => `<rect y="${h - 8}" width="${w}" height="8" fill="#a39a8c"/>${Array.from({ length: 5 }, (_, k) => `<rect x="${14 + k * (w - 20) / 5}" y="${i === 3 ? 30 : 16}" width="${(w - 20) / 5 - 14}" height="${i === 3 ? 34 : 52}" fill="${lit ? LIT : DARK_PANE}"/>`).join('')}`;
  const tagged = (p: Panel, tags: string[][], id: string) => tags.map(([name, c], k) => on(p, 1, 12 + k * 104, p.h - 22, 96, 16, { id: `${id}-tag${k}`, stock: 'bond', c: '#fbf7ee', density: 3, print: `<rect width="5" height="16" fill="${c}"/><text x="10" y="12" font-family="Fredoka" font-weight="600" font-size="10" fill="${INK}">${name}</text>` }));
  MODULES.forEach((m, i) => {
    const h = i === 3 ? 72 : SITE.fh, y = i * SITE.fh, faces = box({ id: `mod-${m.id}`, x: SITE.x, z: SITE.z, y, w: SITE.w, h, d: SITE.d, stock: 'cover', c: m.c, side: '#bdb3a4', front: modPrint(SITE.w, h, i, i === 3), right: modPrint(SITE.d, h, i, false).replace(/width="\d+(\.\d+)?" height="(52|34)"/g, 'width="10" height="$2"'), noTop: true })
      .filter(p => !/rear|under|left/.test(p.id)).map(p => ({ ...p, density: 1.2 }));
    const at = i === 0 ? undefined : Array.from({ length: 4 - i }, (_, s) => s + i);
    const all = [...faces, ...tagged(faces[0], m.tags, `mod-${m.id}`)];
    if (i === 3) all.push({ id: 'mod-roof-sign', stock: 'cover', c: INDIGO, w: 130, h: 34, o: [SITE.x - 65, y + h, SITE.z + 10], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2, emit: .4, print: `${mark(8, 5, 24 / 394, true)}${word(42, 26, 22, '#fff')}` });
    out.push(...all.map(p => (at ? { ...p, show: { toy: 'build', at } } : p)));
    // The same module hangs from the hook while it is the next to go up.
    if (i > 0) {
      const hang = box({ id: `hang-${m.id}`, x: SITE.x + 10, z: SITE.z + 20, y: hangY(i), w: SITE.w, h, d: SITE.d, rot: 6, stock: 'cover', c: m.c, side: '#bdb3a4', front: modPrint(SITE.w, h, i, false), noTop: true })
        .filter(p => !/rear|under|left/.test(p.id)).map(p => ({ ...p, density: 1.2 }));
      out.push(...[...hang, ...tagged(hang[0], m.tags, `hang-${m.id}`)].map(p => ({ ...p, show: { toy: 'build', at: [i - 1] } })));
    }
  });
  // The tower crane: a lattice mast, the jib out over the site, cab, counterweight, trolley and hook.
  const mx = -560, mz = -300, mh = 480, lattice = (w: number, h: number, along: 'v' | 'h') => along === 'v'
    ? `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0Z ${Array.from({ length: Math.floor(h / w) }, (_, k) => `M4 ${k * w + 4}L${w - 4} ${k * w + 4}L4 ${(k + 1) * w - 2}Z M${w - 4} ${k * w + 8}L${w - 4} ${(k + 1) * w - 2}L8 ${(k + 1) * w - 2}Z`).join(' ')}" fill="#fff"/>`
    : `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0Z ${Array.from({ length: Math.floor(w / h) }, (_, k) => `M${k * h + 4} 4H${(k + 1) * h - 3}L${k * h + 4} ${h - 4}Z M${(k + 1) * h - 3} 7V${h - 4}H${k * h + 8}Z`).join(' ')}" fill="#fff"/>`;
  out.push({ id: 'crane-mast', stock: 'greyboard', c: SUN, w: 30, h: mh, o: [mx - 15, 0, mz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, mask: lattice(30, mh, 'v') });
  out.push({ id: 'crane-jib', stock: 'greyboard', c: SUN, w: 520, h: 26, o: [mx - 130, mh, mz + 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, mask: lattice(520, 26, 'h') });
  out.push({ id: 'crane-top', stock: 'greyboard', c: SUN, w: 60, h: 70, o: [mx - 30, mh + 26, mz + 1], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
    mask: `<path d="M0 70L26 0H34L60 70H50L30 14L10 70Z" fill="#fff"/>`, print: '' });
  out.push({ id: 'crane-ties', stock: 'greyboard', c: STEEL, w: 520, h: 72, o: [mx - 130, mh + 24, mz + 1.5], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1,
    mask: `<path d="M0 70L130 0L520 68L519 72L130 4L1 72Z" fill="#fff"/>` });
  out.push({ id: 'crane-weight', stock: 'greyboard', c: '#8b8275', w: 70, h: 50, o: [mx - 120, mh - 50, mz + 3], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4, print: `<path d="M0 17H70M0 34H70" stroke="#6b6357" stroke-width="2"/>` });
  out.push({ id: 'crane-cab', stock: 'cover', c: SUN, w: 46, h: 40, o: [mx + 15, mh - 40, mz + 4], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<path d="M0 0H46V40H6L0 30Z" fill="#fff"/>', print: `<path d="M8 6H40V22H4Z" fill="${DARK_PANE}"/>` });
  const hookX = SITE.x + 10;
  // One cable per toy state: down to the waiting module, or wound up with the hook empty once the roof is on.
  [0, 1, 2, 3].forEach(st => {
    const bottom = st < 3 ? hangY(st + 1) + (st + 1 === 3 ? 72 : SITE.fh) + 8 : mh - 120, len = mh - bottom;
    out.push({ id: `crane-cable-${st}`, stock: 'greyboard', c: STEEL, w: 40, h: len + 30, o: [hookX - 20, bottom - 30, SITE.z + 40], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
      mask: `<path fill-rule="evenodd" d="M8 0H32V10H22V${len - 6}H18V10H8Z M14 ${len - 8}H26V${len + 6}H14Z M19 ${len + 6}H21V${len + 14}Q30 ${len + 18} 28 ${len + 26}Q20 ${len + 32} 12 ${len + 24}H16Q20 ${len + 28} 24 ${len + 24}Q25 ${len + 19} 19 ${len + 17}Z" fill="#fff"/>`,
      print: `<rect width="40" height="10" fill="${SUN}"/>`, show: { toy: 'build', at: [st] } });
  });
  // The hoarding: plywood sheets with the developer's listing pasted up, an open gate, and hazard striping at the foot.
  const hx0 = -540, hw = 410, hh = 84, gate = { x: 150, w: 110 };
  const ply = Array.from({ length: Math.ceil(hw / 82) }, (_, i) => `<path d="M${i * 82} 0V${hh}" stroke="#a5824f" stroke-width="2"/>`).join('');
  const stripes = `<g>${Array.from({ length: Math.ceil(hw / 20) + 2 }, (_, i) => `<path d="M${i * 20 - 14} ${hh}L${i * 20} ${hh - 14}H${i * 20 + 10}L${i * 20 - 4} ${hh}Z" fill="${INK}"/>`).join('')}<rect y="${hh - 14}" width="${hw}" height="14" fill="${SUN}" opacity="0"/></g>`;
  const hoard: Panel = { id: 'hoarding', stock: 'kraft', c: '#d4b07c', w: hw, h: hh, o: [hx0, 0, -60], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
    mask: `<path fill-rule="evenodd" d="M0 0H${hw}V${hh}H0Z M${gate.x} ${hh}V8H${gate.x + gate.w}V${hh}Z" fill="#fff"/>`,
    print: `<rect y="${hh - 14}" width="${hw}" height="14" fill="${SUN}"/>${stripes}${ply}<g transform="translate(18 6)">${poster('sale', 96, 64)}</g><g transform="translate(${gate.x + gate.w + 16} 6)"><rect width="122" height="64" fill="${INDIGO}"/>${mark(8, 10, 52 / 394, true)}${word(64, 40, 17, '#fff')}<rect x="64" y="50" width="48" height="5" fill="${LAVENDER}"/></g>` };
  out.push(hoard, backOf(hoard, '#b8945e'));
  out.push({ id: 'site-ground', stock: 'kraft', c: '#9a7a58', w: hw - 10, h: 210, o: [hx0 + 5, .6, -62], u: [1, 0, 0], v: [0, 0, -1], edge: 'cut', density: .6, decal: 'road', print: specks(hw - 10, 210, '#7a5c3e', 80, 5) });
  return out;
}

// The listings map: a city board on the pavement with the block drawn from above. A switches the filter tab; pins on
// the board and flags on the street mark every listing that matches.
function listingsBoard(): Panel[] {
  const bx = 300, bz = -40, bw = 190, bh = 120, by = 86, out: Panel[] = [];
  const map = `<rect width="${bw}" height="${bh}" fill="#eef0f7"/><rect y="${bh - 34}" width="${bw}" height="22" fill="#9aa0ab"/><path d="M0 ${bh - 23}H${bw}" stroke="${TAXI}" stroke-width="1.6" stroke-dasharray="7 5"/><rect x="${bw * .1}" y="0" width="18" height="${bh - 34}" fill="#9aa0ab"/>
<g fill="#cfd3de"><rect x="${bw * .1 + 24}" y="10" width="${bw * .9 - 30}" height="${bh - 52}"/></g><rect x="4" y="10" width="${bw * .1 - 8}" height="${bh - 52}" fill="${BRICK}"/>
<rect x="${bw * .1 + 26}" y="14" width="38" height="${bh - 60}" fill="#d4b07c"/><rect x="${bw * .1 + 70}" y="14" width="40" height="${bh - 60}" fill="${LAVENDER}"/><rect x="${bw * .1 + 70}" y="14" width="20" height="${bh - 60}" fill="${INDIGO}"/><rect x="${bw * .1 + 116}" y="14" width="22" height="${bh - 60}" fill="#9a6b55"/><rect x="${bw * .1 + 144}" y="14" width="${bw * .9 - 150}" height="${bh - 60}" fill="#d9a968"/>
<circle cx="${bw * .1 + 96}" cy="${bh - 38}" r="4" fill="${CORAL}"/><circle cx="${bw * .1 + 96}" cy="${bh - 38}" r="8" fill="none" stroke="${CORAL}" stroke-width="1.6"/>`;
  const legs = card('board-legs', bx, bz, bw - 20, by + 4, STEEL, { stock: 'greyboard', mask: `<path d="M0 0H${bw - 20}V8H${bw - 30}V${by + 4}H${bw - 40}V8H30V${by + 4}H20V8H0Z" fill="#fff"/>` });
  const board = box({ id: 'board', x: bx, z: bz, y: by, w: bw + 14, h: bh + 14, d: 10, stock: 'cover', c: INDIGO_DARK, front: `<g transform="translate(7 7)">${map}</g>`, top: '' }).filter(p => !/rear|under/.test(p.id)).map(p => ({ ...p, density: 2 }));
  out.push(legs, ...board);
  const pinAt = [[bw * .05, 40], [bw * .1 + 45, 30], [bw * .1 + 127, 30], [bw * .1 + 160, 40]];
  LISTINGS.forEach((l, i) => {
    const [px, py] = pinAt[i];
    out.push({ id: `pin-${l.id}`, stock: 'cover', c: l.kind === 'sale' ? CORAL : INDIGO, w: 16, h: 22, o: [bx - bw / 2 + px - 1, by + 7 + bh - py - 22, bz + 5 + 3], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 4,
      mask: '<path d="M8 22Q0 12 0 8A8 8 0 0 1 16 8Q16 12 8 22Z" fill="#fff"/>', print: `<circle cx="8" cy="8" r="3.4" fill="#fff"/>`, show: { toy: 'filter', at: listed(l.kind) } });
  });
  const tabs = ['ALL', 'SALE', 'RENT'];
  tabs.forEach((t, i) => out.push({ id: `tab-${i}`, stock: 'cover', c: [CREAM, CORAL, LAVENDER][i], w: 52, h: 26, o: [bx - bw / 2 + 14 + i * 58, by + bh + 4, bz + 5.6], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3,
    mask: '<path d="M0 26V7Q0 0 7 0H45Q52 0 52 7V26Z" fill="#fff"/>', print: `<text x="26" y="17" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="12" fill="${i === 0 ? INK : '#fff'}">${t}</text>`, motion: { toy: 'filter', at: [i], slide: [0, 12, 0] } }));
  // The flags on the street: feather banners in the listing's colour, planted at each matching property.
  LISTINGS.forEach(l => {
    const [fx, fz] = l.flag, c = l.kind === 'sale' ? CORAL : INDIGO;
    out.push({ ...card(`flag-${l.id}`, fx, fz, 46, 190, c, { density: 2, mask: '<path d="M21 190V24Q24 0 44 2V150Q34 140 25 146V190Z" fill="#fff"/>',
      print: `<rect x="21" width="4" height="190" fill="${STEEL}"/><g transform="translate(25 6)"><path d="M0 0H19V144Q10 136 0 140Z" fill="${c}"/><circle cx="10" cy="20" r="6" fill="#fff"/><path d="M10 34Q5 28 5 25A5 5 0 0 1 15 25Q15 28 10 34Z" fill="${GLOW}"/><text transform="translate(14 110) rotate(-90)" font-family="Fredoka" font-weight="600" font-size="12" fill="#fff">${l.kind === 'sale' ? 'SALE' : 'RENT'}</text></g>` }), show: { toy: 'filter', at: listed(l.kind) } });
  });
  return out;
}

// The street kiosk: a tall screen that shows the Moperty web app in a phone's browser, offers to add it to the home
// screen, then shows the installed icon among the phone's apps.
function kiosk(): Panel[] {
  const kx = -170, kz = -40, kw = 96, kh = 236, sw = 74, sh = 140, out: Panel[] = [];
  const body = box({ id: 'kiosk', x: kx, z: kz, w: kw, h: kh, d: 26, stock: 'cover', c: '#3a4050', side: '#2c313d', top: '',
    front: `<rect x="${kw / 2 - 20}" y="${kh - 34}" width="40" height="6" rx="3" fill="#1d2129"/><rect x="0" y="${kh - 18}" width="${kw}" height="18" fill="${INDIGO_DARK}"/>${mark(kw / 2 - 30, kh - 15, 12 / 394, true)}${word(kw / 2 - 12, kh - 4, 11, '#fff')}` }).filter(p => !/rear|under/.test(p.id));
  out.push(...body);
  const head = `<rect width="${sw}" height="12" fill="#f4f5f8"/><rect x="4" y="3" width="${sw - 8}" height="7" rx="3.5" fill="#dfe2ea"/><text x="10" y="9" font-family="Fredoka" font-weight="600" font-size="5.4" fill="${INK}">moperty.id</text><rect x="6.5" y="5" width="2" height="3" fill="#3a8a5a"/>`;
  const app = `<rect y="12" width="${sw}" height="${sh - 12}" fill="#f7f6fb"/><rect y="12" width="${sw}" height="16" fill="${INDIGO}"/>${mark(4, 15, 10 / 394, true)}${word(18, 24, 8, '#fff')}
${Array.from({ length: 3 }, (_, i) => `<g transform="translate(5 ${33 + i * 34})"><rect width="${sw - 10}" height="30" rx="3" fill="#fff"/><rect x="3" y="3" width="26" height="24" rx="2" fill="${[LAVENDER, '#9fc7b4', STONE][i]}"/><path d="M9 14L16 8L23 14V22H9Z" fill="#fff"/><rect x="33" y="6" width="24" height="4" fill="${INK}" fill-opacity=".7"/><rect x="33" y="14" width="18" height="3" fill="${INK}" fill-opacity=".4"/><rect x="33" y="21" width="14" height="5" rx="2" fill="${i === 1 ? CORAL : INDIGO}"/></g>`).join('')}`;
  const screens = [
    head + app,
    head + app + `<rect y="12" width="${sw}" height="${sh - 12}" fill="#000" fill-opacity=".35"/><g transform="translate(0 ${sh - 54})"><rect width="${sw}" height="54" rx="6" fill="#fff"/><rect x="${sw / 2 - 8}" y="3" width="16" height="2" rx="1" fill="#c9ccd6"/>${mark(6, 11, 16 / 394)}<rect x="28" y="12" width="34" height="4" fill="${INK}" fill-opacity=".75"/><rect x="28" y="20" width="24" height="3" fill="${INK}" fill-opacity=".4"/><rect x="6" y="34" width="${sw - 12}" height="13" rx="6.5" fill="${INDIGO}"/><path d="M${sw / 2} 37V44M${sw / 2 - 3.5} 40.5H${sw / 2 + 3.5}" stroke="#fff" stroke-width="1.6"/></g>`,
    `<rect width="${sw}" height="${sh}" fill="#7f8ed8"/><circle cx="${sw * .8}" cy="20" r="26" fill="#9aa7e4"/><rect y="${sh - 50}" width="${sw}" height="50" fill="#6c7bc8"/>
${Array.from({ length: 12 }, (_, i) => `<rect x="${7 + (i % 4) * 16}" y="${12 + Math.floor(i / 4) * 22}" width="12" height="12" rx="3" fill="${['#f2a65a', '#57b36f', '#e8552d', '#35b58a', '#f6b73c', '#cf649a'][i % 6]}"/>`).join('')}
<rect x="${7 + 16}" y="${12 + 3 * 22}" width="12" height="12" rx="3" fill="#fff"/>${mark(7 + 16 + 1.6, 12 + 3 * 22 + 1.6, 8.8 / 394)}<rect x="${7 + 16 - 3}" y="${12 + 3 * 22 + 14}" width="18" height="2.4" fill="#fff"/>
<rect x="6" y="${sh - 22}" width="${sw - 12}" height="16" rx="6" fill="#fff" fill-opacity=".35"/>${Array.from({ length: 4 }, (_, i) => `<rect x="${11 + i * 16}" y="${sh - 20}" width="11" height="11" rx="3" fill="${['#57b36f', '#0092da', '#f6b73c', '#e8552d'][i]}"/>`).join('')}`];
  screens.forEach((s, i) => out.push({ id: `screen-${i}`, stock: 'vellum', c: '#f7f6fb', w: sw, h: sh, o: [kx - sw / 2, kh - 44 - sh, kz + 13 + 1.2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 4, emit: .35, mask: `<rect width="${sw}" height="${sh}" rx="5" fill="#fff"/>`, print: s, show: { toy: 'app', at: [i] } }));
  return out;
}

// The street painter: an easel by the brownstone. A takes the pencil wireframe of the app's listing screen to paint.
function easel(): Panel[] {
  const ex = 610, ez = 0, cw = 92, ch = 116, out: Panel[] = [];
  out.push(card('easel-legs', ex, ez - 4, 110, 190, '#8a5a3a', { stock: 'kraft', mask: '<path d="M8 190L50 0H60L102 190H92L55 22L18 190Z M24 110H86V118H24Z M50 0H60V190H50Z" fill="#fff"/>' }, -8));
  const wire = `<rect width="${cw}" height="${ch}" fill="#fbf8f1"/><g fill="none" stroke="#8a8f99" stroke-width="1.4"><rect x="14" y="8" width="64" height="100" rx="6"/><rect x="20" y="16" width="52" height="10"/>${Array.from({ length: 3 }, (_, i) => `<rect x="20" y="${32 + i * 24}" width="52" height="20"/><path d="M22 ${34 + i * 24}L38 ${50 + i * 24}M38 ${34 + i * 24}L22 ${50 + i * 24}"/><path d="M42 ${37 + i * 24}H66M42 ${43 + i * 24}H58"/>`).join('')}</g><path d="M4 112L30 106" stroke="#c9bfae" stroke-width="1"/>`;
  const paint = `<rect width="${cw}" height="${ch}" fill="#fbf8f1"/><rect x="14" y="8" width="64" height="100" rx="6" fill="${STEEL}"/><rect x="18" y="12" width="56" height="92" fill="#f7f6fb"/><rect x="18" y="12" width="56" height="12" fill="${INDIGO}"/>${mark(21, 14.4, 7 / 394, true)}<rect x="32" y="16" width="20" height="4" fill="#fff"/>
${Array.from({ length: 3 }, (_, i) => `<g transform="translate(21 ${28 + i * 25})"><rect width="50" height="22" fill="#fff"/><rect x="2" y="2" width="18" height="18" fill="${[LAVENDER, '#9fc7b4', STONE][i]}"/><path d="M6 12L11 7L16 12V18H6Z" fill="#fff"/><rect x="23" y="4" width="20" height="3.4" fill="${INK}" fill-opacity=".7"/><rect x="23" y="13" width="12" height="5" rx="2" fill="${i === 1 ? CORAL : INDIGO}"/></g>`).join('')}`;
  [wire, paint].forEach((p, i) => out.push({ ...card(`canvas-${i}`, ex + 1, ez + 16, cw, ch, '#fbf8f1', { density: 3.4, print: p, mask: `<rect width="${cw}" height="${ch}" fill="#fff"/>` }, -8, 108), v: [0, .985, -.17] as V3, show: { toy: 'paint', at: [i] } }));
  // The painter, palette in hand, and a stool with the paint pots.
  out.push(passerBy('painter', ex + 82, ez + 30, '#e9a77b', SUN, true));
  out.push(...box({ id: 'paint-stool', x: ex - 70, z: ez + 18, w: 38, h: 40, d: 30, stock: 'kraft', c: '#8a5a3a', top: `<circle cx="10" cy="10" r="6" fill="${INDIGO}"/><circle cx="24" cy="12" r="6" fill="${GLOW}"/><circle cx="16" cy="22" r="5" fill="${CORAL}"/>` }).filter(p => /front|top/.test(p.id)));
  return out;
}

// The finger-post on the corner: street arrows stacked on one pole, a magnifier on top. A lifts the Moperty arrow one place up.
function signpost(): Panel[] {
  const px = -640, pz = -14, ph = 300, out: Panel[] = [];
  out.push(card('post', px, pz, 10, ph, STEEL, { stock: 'greyboard' }));
  out.push(card('seek', px, pz + 2, 52, 60, STEEL, { stock: 'greyboard', density: 2.4, mask: '<path fill-rule="evenodd" d="M22 0A22 22 0 1 1 21.9 0Z M22 7A15 15 0 1 0 22.1 7Z M22 44H30V60H22Z" fill="#fff"/>', print: `<circle cx="22" cy="22" r="15" fill="#d8e6f6"/><path d="M14 16Q18 10 26 12" stroke="#fff" stroke-width="3" fill="none"/>` }, 0, ph - 4));
  const arrow = (id: string, slot_: number, right: boolean, c: string, print: string): Panel => card(id, px + (right ? 62 : -62), pz + 6 + slot_ * .5, 128, 30, c, { density: 2.6,
    mask: right ? '<path d="M0 0H110L128 15L110 30H0Z" fill="#fff"/>' : '<path d="M18 0H128V30H18L0 15Z" fill="#fff"/>', print }, 0, ph - 50 - slot_ * 38);
  const plain = (c: string, right: boolean) => `<rect width="128" height="30" fill="${c}"/><rect x="${right ? 4 : 20}" y="4" width="104" height="22" fill="none" stroke="#fff" stroke-width="1.6"/><rect x="${right ? 16 : 34}" y="12" width="${right ? 52 : 46}" height="6" fill="#fff" fill-opacity=".85"/><rect x="${right ? 74 : 86}" y="12" width="20" height="6" fill="#fff" fill-opacity=".55"/>`;
  const ours = (right: boolean) => `<rect width="128" height="30" fill="#fbf8f1"/><rect x="${right ? 4 : 20}" y="4" width="104" height="22" fill="none" stroke="${INDIGO}" stroke-width="1.6"/>${mark(right ? 10 : 26, 6, 18 / 394)}${word(right ? 34 : 50, 21, 15)}`;
  // Places from the top: the order of the three arrows in each state of the toy.
  const order = [['a', 'b', 'm'], ['a', 'm', 'b'], ['m', 'a', 'b']];
  order.forEach((ids, s) => ids.forEach((who, place) => {
    const right = place !== 1;
    out.push({ ...arrow(`arrow-${who}-${s}`, place, right, who === 'm' ? '#fbf8f1' : who === 'a' ? '#2f7d58' : '#3a6ea8', who === 'm' ? ours(right) : plain(who === 'a' ? '#2f7d58' : '#3a6ea8', right)), show: { toy: 'rank', at: [s] } });
  }));
  return out;
}

// Main space dressing: lamps, a traffic light, cars, people going about their evening, and the move-in at the corner.
function dressing(): Panel[] {
  const out: Panel[] = [];
  out.push(...streetLamp('lamp-a', -290, 176, 260, '#ffe7a8'), ...streetLamp('lamp-b', 430, 176, 250, '#ffe7a8'));
  // Traffic light on the avenue corner, facing the road.
  out.push(card('signal-post', -548, 178, 8, 210, STEEL, { stock: 'greyboard' }));
  out.push(card('signal', -548, 183, 30, 76, STEEL, { stock: 'greyboard', density: 2.4, mask: '<rect width="30" height="76" rx="6" fill="#fff"/>', emit: .15, print: `<circle cx="15" cy="14" r="8" fill="#5a2a22"/><circle cx="15" cy="38" r="8" fill="#5a4a22"/><circle cx="15" cy="62" r="8" fill="#5be08a"/>` }, 0, 200));
  // Taxis and the moving van, cut as stand-up profiles on the road.
  const car = (id: string, x: number, z: number, flip: boolean, c: string, top: string) => card(id, x, z, 196, 84, c, { density: 1.8,
    mask: `<g ${flip ? 'transform="translate(196 0) scale(-1 1)"' : ''}><path fill-rule="evenodd" d="M6 64V44Q6 38 14 36L46 32L70 8Q74 4 82 4H132Q140 4 144 10L160 32L184 36Q192 38 192 46V64Z M28 84A20 20 0 1 1 28.1 84Z M162 84A20 20 0 1 1 162.1 84Z" fill="#fff"/></g>`,
    print: `<g ${flip ? 'transform="translate(196 0) scale(-1 1)"' : ''}><rect width="196" height="84" fill="${c}"/><path d="M76 12H104V32H56Z M110 12H134L150 32H110Z" fill="${DARK_PANE}"/>${top}<rect y="50" width="196" height="4" fill="#000" fill-opacity=".12"/><circle cx="28" cy="64" r="20" fill="#23272d"/><circle cx="28" cy="64" r="8" fill="#9aa0ab"/><circle cx="162" cy="64" r="20" fill="#23272d"/><circle cx="162" cy="64" r="8" fill="#9aa0ab"/><rect x="184" y="40" width="8" height="6" fill="#fff4d0"/><rect x="6" y="40" width="6" height="6" fill="${CORAL}"/></g>` });
  const check = `<g fill="${INK}">${Array.from({ length: 10 }, (_, i) => `<rect x="${40 + i * 12}" y="${i % 2 ? 40 : 44}" width="6" height="4"/>`).join('')}</g><rect x="88" y="0" width="26" height="8" fill="#fff4d0"/>`;
  out.push(car('taxi-a', -330, 262, false, TAXI, check), car('taxi-b', 120, 296, true, TAXI, check));
  out.push(card('van', 690, 238, 270, 156, '#fbf8f1', { density: 1.6,
    mask: '<path fill-rule="evenodd" d="M0 130V0H196V30H230Q240 30 246 40L266 80Q270 86 270 96V130Z M46 156A24 24 0 1 1 46.1 156Z M224 156A24 24 0 1 1 224.1 156Z" fill="#fff"/>',
    print: `<rect width="270" height="156" fill="#fbf8f1"/><rect x="196" y="30" width="74" height="100" fill="${INDIGO}"/><path d="M204 38H234L254 76H204Z" fill="${DARK_PANE}"/><rect y="110" width="270" height="20" fill="#3d444e"/>${mark(20, 22, 60 / 394)}${word(90, 64, 34)}<rect x="90" y="74" width="80" height="6" fill="${LAVENDER}"/><circle cx="46" cy="132" r="24" fill="#23272d"/><circle cx="46" cy="132" r="9" fill="#9aa0ab"/><circle cx="224" cy="132" r="24" fill="#23272d"/><circle cx="224" cy="132" r="9" fill="#9aa0ab"/>` }));
  // The ramp down from the van, and boxes on their way into the flat for rent.
  out.push({ id: 'ramp', stock: 'greyboard', c: '#9aa0ab', w: 60, h: 120, o: [530, 0, 200], u: [1, 0, 0], v: [0, .36, -.93], edge: 'cut', density: 1, print: Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 15 + 7}H60" stroke="#7d838e" stroke-width="2"/>`).join('') });
  const carton = (id: string, x: number, z: number, y: number, w: number, h: number, rot: number) => box({ id, x, z, y, w, h, d: w * .8, rot, stock: 'kraft', c: '#b98450', front: `<rect x="${w / 2 - 5}" width="10" height="${h * .6}" fill="#d9b781"/><path d="M${w * .2} ${h * .7}h${w * .3}" stroke="${INK}" stroke-width="2"/>`, top: `<rect x="${w / 2 - 5}" width="10" height="${w * .8}" fill="#d9b781"/>` }).filter(p => !/rear|under|right/.test(p.id));
  out.push(...carton('box-a', 730, 130, 0, 56, 44, 6), ...carton('box-b', 736, 130, 44, 44, 34, -8));
  out.push(card('mover', 676, 140, 74, 176, '#3a6ea8', { density: 2, mask: `<path d="M22 176V120H14V64Q14 44 30 42Q20 36 22 22Q24 4 36 4Q50 4 50 22Q51 36 42 42Q58 44 58 64V60H70V108H6V60Z M14 108H58V120H50V176H40V128H32V176Z" fill="#fff"/>`, print: `<rect width="74" height="44" fill="#f3c9a0"/><path d="M20 4Q36 -6 52 8V18Q36 10 20 18Z" fill="#3a2a1a"/><rect y="44" width="74" height="80" fill="#3a6ea8"/><rect x="6" y="60" width="64" height="48" fill="#b98450"/><rect x="34" y="60" width="8" height="48" fill="#d9b781"/><rect x="22" y="124" width="30" height="52" fill="#3f4a5c"/>` }));
  // A couple stopped by the brownstone's sign, a commuter, a parent and child, and a dog walker.
  out.push(passerBy('viewer-a', 392, -10, '#7c6be0', CREAM, false));
  out.push(passerBy('commuter', -30, 120, '#3d444e', '#8a5a3a', false), passerBy('parent', 210, 140, '#57b36f', SUN, true), passerBy('child', 250, 132, CORAL, LAVENDER, true, true));
  out.push(passerBy('walker', -470, 130, '#e9a77b', INDIGO, false));
  out.push(card('dog', -410, 140, 64, 40, '#8a6a50', { density: 2.4, mask: '<path d="M8 40V18Q4 14 4 8L14 12H40Q46 4 54 4Q62 6 62 14L58 18H54V40H48V24H18V40Z" fill="#fff"/>', print: `<rect width="64" height="40" fill="#8a6a50"/><circle cx="56" cy="10" r="1.8" fill="${INK}"/>` }));
  out.push({ id: 'leash', stock: 'greyboard', c: CORAL, w: 52, h: 60, o: [-462, 30, 136], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2, mask: '<path d="M0 0Q30 40 52 60L50 60Q28 42 0 3Z" fill="#fff"/>' });
  // A street tree in its pit, a hydrant at the kerb, a bin and newspaper boxes by the kiosk.
  reseed(13);
  out.push({ id: 'trunk', stock: 'kraft', c: '#7a5237', w: 34, h: 200, o: [700 - 17, 0, -50], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<path d="M4 200Q12 110 10 0H24Q22 110 30 200Z" fill="#fff"/>' });
  out.push({ id: 'crown', stock: 'sugar', c: FOLIAGE, w: 190, h: 150, o: [700 - 95, 150, -46], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<ellipse cx="95" cy="75" rx="95" ry="75" fill="#fff"/>', print: specks(190, 150, '#2f7d48', 60, 9) + specks(190, 150, '#e9a36a', 14, 6) });
  out.push(...box({ id: 'hydrant', x: -250, z: 160, w: 22, h: 42, d: 22, stock: 'cover', c: CORAL, front: `<rect y="8" width="22" height="5" fill="${CREAM}"/>` }).filter(p => /front|top/.test(p.id)));
  out.push(...box({ id: 'bin', x: 60, z: 150, w: 34, h: 58, d: 34, stock: 'cover', c: '#2f7d58', front: `<rect y="6" width="34" height="5" fill="${CREAM}"/>`, top: '<rect x="6" y="6" width="22" height="22" fill="#1d3a28"/>' }).filter(p => /front|top/.test(p.id)));
  out.push(...box({ id: 'news-a', x: -250, z: -36, w: 40, h: 64, d: 34, stock: 'cover', c: INDIGO, front: `<rect x="5" y="6" width="30" height="22" fill="#fbf8f1"/><rect x="8" y="9" width="24" height="3" fill="${INK}"/><rect x="8" y="15" width="18" height="2" fill="${INK}" fill-opacity=".5"/>` }).filter(p => /front|top/.test(p.id)));
  const pigeon = (id: string, x: number, z: number, flip: boolean, c = '#8d96a3'): Panel => card(id, x, z, 30, 22, c, { density: 3, mask: `<g ${flip ? 'transform="translate(30 0) scale(-1 1)"' : ''}><path d="M4 12Q4 4 12 6L16 2Q22 0 24 4L29 6L24 8Q24 16 16 18L18 22H15L13 18Q6 18 4 12Z M0 10L6 9L5 13Z" fill="#fff"/></g>`, print: `<g ${flip ? 'transform="translate(30 0) scale(-1 1)"' : ''}><rect width="30" height="22" fill="${c}"/><circle cx="21" cy="4.6" r="1.4" fill="${INK}"/></g>` });
  out.push(pigeon('pigeon-a', 100, 70, false), pigeon('pigeon-b', 132, 82, true, '#a4acb7'));
  out.push({ ...pigeon('ridge-a', HQ.x - HQ.tw / 2 + 30, HQ.z - 40, false, '#5b6470'), o: [HQ.x - HQ.tw / 2 - 15, HQ.peak + 1, HQ.z - 40] }, { ...pigeon('ridge-b', HQ.x + HQ.tw / 2 - 10, HQ.z - 60, true, '#5b6470'), o: [HQ.x + HQ.tw / 2 - 15, HQ.peak + 1, HQ.z - 90] });
  return out;
}

const cup = `<rect x="30" y="8" width="18" height="16" rx="3" fill="${CORAL}"/><path d="M48 12Q55 12 55 16Q55 21 48 21" fill="none" stroke="${CORAL}" stroke-width="3"/>`;
const deli = `<circle cx="24" cy="17" r="9" fill="${CORAL}"/><circle cx="44" cy="17" r="9" fill="${SUN}"/><circle cx="64" cy="17" r="9" fill="#57b36f"/>`;
const shelves = (cs: string[]) => cs.map((c, i) => `<rect x="${12 + i * 34}" y="${40 - (i % 2) * 12}" width="24" height="${50 + (i % 2) * 12}" fill="${c}"/>`).join('') + `<rect y="88" width="400" height="10" fill="#8a5a3a"/>`;
function neighbours(): Panel[] {
  return [
    ...building({ id: 'west', x: -850, z: -150, w: 330, h: 560, rot: 18, c: BRICK, line: BRICK_LINE, trim: STONE, storeys: 4, cols: 4, ground: 'shop', ac: '#2f7d58', icon: cup, goods: shelves(['#8a5a3a', CREAM, '#c98a5f', '#8a5a3a', SUN, CREAM, '#8a5a3a', CORAL]), fire: 1, tank: 240, side: 'right', sideW: 240, seed: 3,
      sidePrint: `<g transform="translate(40 120)"><rect width="160" height="120" fill="${INDIGO}" opacity=".85"/>${mark(14, 20, 56 / 394, true)}${word(80, 66, 24, '#fff', 'middle')}<rect x="20" y="90" width="120" height="8" fill="${LAVENDER}"/></g>`,
      listing: { kind: 'rent', at: [184, 300] } }),
    ...building({ id: 'brownstone', x: 530, z: -150, w: 200, h: 400, rot: -8, c: '#9a6b55', line: '#7a4f3c', trim: STONE, storeys: 3, cols: 2, ground: 'stoop', seed: 7, lit: .7, flowers: true, chimney: 40 }),
    ...building({ id: 'corner', x: 860, z: -190, w: 330, h: 520, rot: -20, c: '#d9a968', line: '#b98a4c', trim: CREAM, storeys: 4, cols: 4, ground: 'shop', ac: CORAL, icon: deli, goods: shelves([CORAL, SUN, '#57b36f', CORAL, SUN, '#57b36f', CREAM, CORAL]), fire: 2, tank: 90, seed: 11,
      listing: { kind: 'rent', at: [20, 300] } })
  ];
}
// The brownstone's agent sign: a post in the front yard with the board hanging from its arm.
function yardSign(): Panel[] {
  const sx = 452, sz = -46;
  return [card('yard-post', sx, sz, 80, 150, '#fbf8f1', { density: 2, mask: '<path d="M0 0H80V8H12V150H4V8H0Z" fill="#fff"/>' }),
    card('yard-board', sx + 6, sz + 2, 66, 50, '#fffaf0', { stock: 'cover', density: 3, print: poster('sale', 66, 50), mask: '<rect width="66" height="50" fill="#fff"/>' }, 0, 82),
    card('yard-chains', sx + 6, sz + 1, 60, 10, STEEL, { density: 3, stock: 'greyboard', mask: '<path d="M6 0H8V10H6Z M52 0H54V10H52Z" fill="#fff"/>' }, 0, 132)];
}
// A slim view down the avenue between the west block and the site: a far crossing, a cab and people under the lights.
function avenue(): Panel[] {
  const mid = (AVENUE.x0 + AVENUE.x1) / 2;
  return [
    card('av-cab', mid - 10, -360, 120, 52, TAXI, { density: 1.2, mask: '<path fill-rule="evenodd" d="M2 40V26L28 20L44 4H86L100 20L118 24V40Z M20 52A12 12 0 1 1 20.1 52Z M100 52A12 12 0 1 1 100.1 52Z" fill="#fff"/>', print: `<rect width="120" height="52" fill="${TAXI}"/><path d="M48 8H84V20H40Z" fill="${DARK_PANE}"/><rect y="40" width="120" height="12" fill="#23272d"/>` }),
    card('av-people', mid + 30, -470, 90, 90, '#46549f', { density: 1, mask: '<path d="M8 90V40Q8 30 16 30Q10 26 12 18Q14 10 20 10Q28 10 28 18Q28 26 24 30Q32 30 32 40V90Z M48 90V36Q48 26 56 26Q50 22 52 14Q54 6 60 6Q68 6 68 14Q68 22 64 26Q72 26 72 36V90Z" fill="#fff"/>', print: '<rect width="90" height="90" fill="#46549f"/>' }),
    card('av-signal', mid - 40, -430, 140, 120, STEEL, { stock: 'greyboard', density: 1, mask: '<path d="M8 120V6H132V12H14V120Z M100 12H122V58H100Z" fill="#fff"/>', print: `<circle cx="111" cy="24" r="6" fill="#5a2a22"/><circle cx="111" cy="44" r="6" fill="#5be08a"/>` }, 0, 160),
    card('av-lights', mid, -300, 150, 40, '#ffe7a8', { stock: 'vellum', density: 1.2, emit: .8, mask: `<path d="M0 4Q75 40 150 4" fill="none" stroke="#fff" stroke-width="1.4"/>${Array.from({ length: 9 }, (_, i) => { const t = (i + .5) / 9, x = t * 150, y = 4 + 4 * 18 * t * (1 - t); return `<circle cx="${x.toFixed(1)}" cy="${(y + 4).toFixed(1)}" r="3.4" fill="#fff"/>`; }).join('')}` }, 0, 300)
  ];
}

export function downtown(): Scene {
  const lamps: Lamp[] = [{ at: [-256, 228, 176], color: [1, .83, .58], energy: 60 }, { at: [464, 218, 176], color: [1, .83, .58], energy: 60 }, { at: [HQ.x, 90, HQ.z + HQ.hd + 30], color: [1, .83, .58], energy: 30 }];
  return { id: 'downtown', camera: { zoom: 1, x0: -350, x1: 450 }, light: { sun: 2.2, sky: .56, skyColor: [.95, .88, .86] }, lamps,
    panels: [...backdrop(), ...ground(), ...avenue(), ...neighbours(), ...headquarters(), ...site(), ...yardSign(), ...listingsBoard(), ...kiosk(), ...easel(), ...signpost(), ...dressing()] };
}
