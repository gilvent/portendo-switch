import { add, box, carved, on, unit, yaw, type Panel, type Scene, type V3 } from '../kit.ts';
import { CREAM, cloud } from '../recipes.ts';
import { bench, bicycle, bush, disc, fawning, fbox, fflat, fflowers, flamp, frame, piece, pigeon, planter, shadeTree, shopper, toCamera, tone, type Frame } from './promenade.ts';
import { streetLamp } from './street.ts';

// Moperty's hometown square. You come up from the MRT into the square of a small town where a handful of homes are on
// offer. The square is the main space. A lane between the homes drops to the valley, the one open view. A house turned
// inward at each end closes the sides. Nothing here is a screen: the flyer board lists the homes, and a home opens on
// its fold like a doll's house.
const INDIGO = '#5b6bdc', LAV = '#a3adf2', YEL = '#f5b400', BRICK = '#b0664c', TILE = '#c98a6e', STONE = '#e3c9a0', WHITE = '#fbf7ee', STEEL = '#2f343c', TEAL = '#2a8d6a';
const LIT = '#ffdf9e', GLASS = '#5d7f95', GRASS = '#a9d3a2', KRAFT = '#b98450';
const X0 = -1600, X1 = 1600, GARDEN = -60, BACK = -340, FRONT = 380, HZ = -150, HD = 190;

let s = 1;
const r = (a: number, b: number) => { s = (s * 16807) % 2147483647; return a + (s / 2147483647) * (b - a); };
const pick = <T,>(a: T[]) => a[Math.floor(r(0, a.length))];
const f = (n: number) => n.toFixed(1);
// The Moperty mark, 42 x 30: two gabled houses side by side with a small house between them.
const mark = (k: number, a: string, b: string, m = '#fff') => `<g transform="scale(${k})"><path d="M0 9L7 0H14L21 9V30H0Z" fill="${a}"/><path d="M21 9L28 0H35L42 9V30H21Z" fill="${b}"/><path d="M15 30V22L21 17L27 22V30Z" fill="${m}"/><rect x="8" y="12" width="5" height="5" fill="${m}"/><rect x="29" y="12" width="5" height="5" fill="${m}"/></g>`;
// What is on offer, by picture alone: a price tag for sale, a key for rent. Drawn in a 40 x 34 box.
const offer = (kind: Offer, c: string) => kind === 'sale' ? `<path d="M6 17L17 4H35V20L24 33Z" fill="${c}"/><circle cx="29" cy="10" r="3" fill="${YEL}"/>` : `<circle cx="11" cy="17" r="8" fill="none" stroke="${c}" stroke-width="5"/><path d="M19 17H38M31 17V25M37 17V24" stroke="${c}" stroke-width="5" fill="none"/>`;
type Offer = 'sale' | 'rent';
type Home = { id: string; x: number; w: number; wall: number; peak: number; c: string; roof: string; door: string; offer: Offer; storeys: 1 | 2; chimney?: boolean };
// The four homes on the square, left to right. The lane runs between the second and the third.
const HOMES: Home[] = [
  { id: 'h1', x: -640, w: 230, wall: 250, peak: 92, c: WHITE, roof: INDIGO, door: INDIGO, offer: 'sale', storeys: 2, chimney: true },
  { id: 'h2', x: -355, w: 250, wall: 172, peak: 100, c: LAV, roof: tone(INDIGO, -.32), door: tone(INDIGO, -.32), offer: 'rent', storeys: 1 },
  { id: 'h3', x: 355, w: 240, wall: 250, peak: 92, c: STONE, roof: BRICK, door: BRICK, offer: 'sale', storeys: 2 },
  { id: 'h4', x: 650, w: 230, wall: 172, peak: 96, c: WHITE, roof: TILE, door: TILE, offer: 'rent', storeys: 1, chimney: true }];

/* ---------- ground: the square, the front gardens and the lane ---------- */
function ground(): Panel[] {
  const W = X1 - X0, D = FRONT - GARDEN, SETT = ['#f1e4cc', '#f6ecd8', '#e9dabd', '#f3e7d0'];
  let setts = '';
  for (let row = 0, y = 0; y < D; row++, y += 40) for (let x = row % 2 ? -32 : 0; x < W; x += 64) { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; setts += `<rect x="${x + 1}" y="${y + 1}" width="62" height="38" fill="${SETT[Math.floor((h - Math.floor(h)) * 4)]}"/>`; }
  // A ring of darker setts marks the middle of the square, in front of the lane.
  const ring = `<ellipse cx="${-X0}" cy="${170 - GARDEN}" rx="210" ry="120" fill="none" stroke="#d6c4a2" stroke-width="20"/><ellipse cx="${-X0}" cy="${170 - GARDEN}" rx="120" ry="64" fill="#e6d6b8"/><g transform="translate(${-X0 - 42} ${170 - GARDEN - 30}) scale(2)">${mark(1, '#d6c4a2', '#dccbaa', '#e6d6b8')}</g>`;
  // Both sheets ship as sixteen tiles: the camera here leans in close, and with wider tiles the browser's 3D sorting tears
  // holes in the ground where standing pieces' planes cut across it.
  const square: Panel = { id: 'square', stock: 'greyboard', c: '#e2d3b6', w: W, h: D, o: [X0, 0, FRONT], u: [1, 0, 0], v: [0, 0, -1], density: .42, edge: 'fold', split: 16, print: `<rect width="${W}" height="${D}" fill="#dccdb0"/>${setts}${ring}<rect y="${D - 14}" width="${W}" height="14" fill="#cdb48c"/>` };
  // The gardens: grass, with the lane's setts running through and a path from each gate to its door.
  const GD = GARDEN - BACK;
  const paths = HOMES.map(h => `<rect x="${h.x - X0 - 22}" y="${GD - (GARDEN - HZ)}" width="44" height="${GARDEN - HZ}" fill="#e9dabd"/>${[0, 1, 2].map(k => `<rect x="${h.x - X0 - 18}" y="${GD - 28 - k * 30}" width="36" height="22" rx="4" fill="#f6ecd8"/>`).join('')}`).join('');
  const beds = HOMES.map(h => `<ellipse cx="${h.x - X0 - h.w * .32}" cy="${GD - 40}" rx="34" ry="16" fill="#8fc48a"/><ellipse cx="${h.x - X0 + h.w * .32}" cy="${GD - 40}" rx="34" ry="16" fill="#8fc48a"/>`).join('');
  const garden: Panel = { id: 'garden', stock: 'sugar', c: GRASS, w: W, h: GD, o: [X0, 0, GARDEN], u: [1, 0, 0], v: [0, 0, -1], density: .5, edge: 'fold', split: 16,
    print: `<rect width="${W}" height="${GD}" fill="${GRASS}"/><rect x="${-X0 - 120}" width="240" height="${GD}" fill="#dccdb0"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${-X0 - 116}" y="${i * 40 + 2}" width="232" height="36" fill="${SETT[i % 4]}"/>`).join('')}${paths}${beds}` };
  const skirt: Panel = { id: 'square-skirt', stock: 'greyboard', c: '#9a8566', w: W, h: 50, o: [X0, -50, FRONT + 1], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2, print: `<rect width="${W}" height="8" fill="#cdb48c"/>` };
  return [square, garden, skirt];
}

/* ---------- the open view down the lane: a shadow box ---------- */
// Thin cut layers stood well apart, alternating pale and deep, each shading the next; real in the bake, then flattened
// onto two cards. Card one is the lower town just below the square. Card two, further back, is the valley: the river, the
// far bank and the hills.
type Card = { id: string; x0: number; z: number; w: number; density: number };
const NEAR: Card = { id: 'lane-near', x0: -1300, z: -480, w: 2600, density: .95 };
const FAR: Card = { id: 'lane-far', x0: -1800, z: -740, w: 3600, density: .6 };
const sheet = (card: Card, id: string, gap: number, y0: number, h: number, c: string, mask: string, print = '', stock: Panel['stock'] = 'sugar'): Panel =>
  ({ id, stock, c, w: card.w, h, o: [card.x0, y0, card.z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: card.density, decal: card.id, mask, print });
// A row of cottages cut from one sheet: gabled or hipped, each its own colour, with lit windows.
function cottages(W: number, H: number, lo: number, hi: number, minW: number, maxW: number, cols: string[], roofs: string[], win: string, breaks: number) {
  let mask = '', print = '';
  for (let x = r(-20, 10); x < W;) {
    const bw = r(minW, maxW), bh = r(lo, hi), pk = bw * r(.3, .42), top = H - bh, c = pick(cols), rc = pick(roofs);
    const body = `<rect x="${f(x)}" y="${f(top)}" width="${f(bw)}" height="${f(bh)}"`, gable = `<path d="M${f(x - 5)} ${f(top)}L${f(x + bw / 2)} ${f(top - pk)}L${f(x + bw + 5)} ${f(top)}Z"`;
    mask += `${body} fill="#fff"/>${gable} fill="#fff"/>`; print += `${body} fill="${c}"/>${gable} fill="${rc}"/>`;
    for (let wx = x + bw * .16; wx < x + bw - 12; wx += bw * .34) for (let wy = top + 10; wy < H - 20; wy += 30) print += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(bw * .16)}" height="14" fill="${r(0, 1) > .6 ? LIT : win}"/>`;
    if (r(0, 1) < .4) { mask += `<rect x="${f(x + bw * .7)}" y="${f(top - pk * .8)}" width="7" height="${f(pk * .6)}" fill="#fff"/>`; print += `<rect x="${f(x + bw * .7)}" y="${f(top - pk * .8)}" width="7" height="${f(pk * .6)}" fill="${tone(rc, -.2)}"/>`; }
    x += bw + (r(0, 1) < breaks ? r(24, 70) : r(2, 10));
  }
  return { mask, print };
}
// A ridge line: a soft run of hills, y measured down from the sheet's top.
function ridge(W: number, H: number, top: number, amp: number, len: number, phase: number) {
  let d = `M0 ${H}V${f(top + amp * Math.sin(phase))}`;
  for (let x = 0; x <= W; x += 20) d += `L${x} ${f(top + amp * Math.sin(x / len + phase) + amp * .4 * Math.sin(x / len * 2.7 + phase * 2))}`;
  return `${d}V${H}Z`;
}
const treeRow = (W: number, H: number, c: string[], lo: number, hi: number) => {
  let m = '', p = '';
  for (let x = r(0, 30); x < W; x += r(40, 80)) {
    const cr = r(lo, hi), cy = H - cr * 1.3 - r(0, 14), col = pick(c);
    m += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="#fff"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 8)}" r="${f(cr * .7)}" fill="#fff"/><rect x="${f(x - cr)}" y="${f(cy)}" width="${f(cr * 2.5)}" height="${f(H - cy)}" fill="#fff"/>`;
    p += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="${col}"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 8)}" r="${f(cr * .7)}" fill="${tone(col, -.12)}"/>`;
  }
  return { mask: m, print: p };
};
function laneView(): Panel[] {
  s = 29;
  const y0 = -70, W = NEAR.w;
  // Card one, back to front: the lower town's roofs, trees among them, a nearer row of cottages, then the lane's wall.
  const LH = 250, lower = cottages(W, LH, 120, 200, 70, 130, ['#f4ead8', STONE, '#e8c9a8', LAV, '#fff'], [INDIGO, BRICK, TILE, tone(INDIGO, -.3)], '#7c7f9c', .35);
  const card: Panel = { id: NEAR.id, stock: 'sugar', c: STONE, w: W, h: LH, o: [NEAR.x0, y0, NEAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: NEAR.density, split: 2, mask: lower.mask, print: lower.print };
  const TH = 170, trees = treeRow(W, TH, ['#3f8f5a', '#4aa067', '#347a4b'], 24, 38);
  const CH = 150, near = cottages(W, CH, 70, 110, 90, 150, [WHITE, '#f0dcc0', '#e3b9a8', '#d9e6f2'], [TILE, BRICK, INDIGO], GLASS, .5);
  // The wall at the foot of the lane: stone, with a hedge behind it and two gate posts where the lane goes through.
  const WH = 96, mid = W / 2;
  let wm = `<rect y="${WH - 46}" width="${W}" height="46" fill="#fff"/>`, wp = `<rect y="${WH - 46}" width="${W}" height="46" fill="#cfc2aa"/><rect y="${WH - 46}" width="${W}" height="7" fill="#e6dccb"/>${Array.from({ length: Math.floor(W / 40) }, (_, i) => `<path d="M${i * 40 + (i % 2) * 14} ${WH - 39}v39" stroke="#b9ab92" stroke-width="1.6"/>`).join('')}`;
  for (let x = 0; x < W; x += 44) if (Math.abs(x + 22 - mid) > 130) { wm += `<circle cx="${x + 22}" cy="${WH - 52}" r="26" fill="#fff"/>`; wp = `<circle cx="${x + 22}" cy="${WH - 52}" r="26" fill="#8fc49a"/>` + wp; }
  for (const gx of [mid - 96, mid + 78]) { wm += `<rect x="${gx}" y="14" width="18" height="${WH - 14}" fill="#fff"/><circle cx="${gx + 9}" cy="12" r="11" fill="#fff"/>`; wp += `<rect x="${gx}" y="14" width="18" height="${WH - 14}" fill="#e6dccb"/><circle cx="${gx + 9}" cy="12" r="11" fill="#fff4e2"/>`; }
  // Card two: far hills, a deeper hill dotted with houses, the far bank's town, then the river.
  s = 67;
  const FW = FAR.w, fy = -90, BH = 440;
  const far: Panel = { id: FAR.id, stock: 'sugar', c: '#dbe8ee', w: FW, h: BH, o: [FAR.x0, fy, FAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FAR.density, split: 2, mask: `<path d="${ridge(FW, BH, 90, 50, 210, .4)}" fill="#fff"/>` };
  const MH = 400; let dots = '';
  for (let i = 0; i < 40; i++) { const x = r(20, FW - 40), y = r(130, MH - 170); dots += `<rect x="${f(x)}" y="${f(y)}" width="16" height="11" fill="${pick([WHITE, '#f0dcc0', LAV])}"/><path d="M${f(x - 2)} ${f(y)}l10 -8l10 8Z" fill="${pick([BRICK, INDIGO, TILE])}"/>`; }
  const hill = sheet(FAR, 'lane-hill', 60, fy, MH, '#8fbf96', `<path d="${ridge(FW, MH, 80, 40, 150, 2.1)}" fill="#fff"/>`, dots);
  const TW = 300, bank = cottages(FW, TW, 50, 100, 50, 90, ['#f4ead8', STONE, '#e8c9a8', '#fff'], [BRICK, TILE, INDIGO], '#7c7f9c', .3);
  const town = sheet(FAR, 'lane-town', 124, fy, TW, STONE, bank.mask, bank.print);
  const RH = 190, river = sheet(FAR, 'lane-river', 184, fy, RH, '#8fcbe8', `<path d="${ridge(FW, RH, 8, 4, 40, 0)}" fill="#fff"/>`, Array.from({ length: 60 }, () => { const x = r(0, FW), y = r(20, RH - 10), l = r(20, 50); return `<path d="M${f(x)} ${f(y)}q${f(l / 4)} -3 ${f(l / 2)} 0t${f(l / 2)} 0" stroke="#d3eefa" stroke-width="2.4" fill="none"/>`; }).join(''));
  return [card, sheet(NEAR, 'lane-trees', 44, y0, TH, '#3f8f5a', trees.mask, trees.print), sheet(NEAR, 'lane-cottages', 88, y0, CH, WHITE, near.mask, near.print), sheet(NEAR, 'lane-wall', 126, y0, WH, '#cfc2aa', wm, wp, 'greyboard'), far, hill, town, river];
}
// The far distance, in the CSS backdrop: sky, two layers of cut clouds, then three ranges of hills, pale to deep, the
// nearest dotted with houses and pines. Only world heights of about 350 to 800 show above the homes.
function backdrop(): Panel[] {
  s = 13;
  const D = .72, z = -780;
  const gulls = [[2180, 600, 1.2], [2215, 582, 1], [2245, 610, .9], [3420, 660, 1], [3450, 646, .8]].map(([x, y, k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 6Q6 0 12 6Q18 0 24 6Q18 3 12 9Q6 3 0 6Z" fill="#fdfcf8"/>`).join('');
  const layer = (id: string, gap: number, h: number, c: string, mask: string, print = ''): Panel => ({ id, stock: 'sugar', c, w: 4400, h, o: [-2080, 0, z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: D, decal: 'sky', mask, print });
  const clouds = (id: string, gap: number, c: string, at: number[][]): Panel => ({ id, stock: 'sugar', c, w: 5200, h: 1500, o: [-2480, -160, z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: D, decal: 'sky', mask: at.map(([x, y, k]) => cloud(x, y, k, '#fff')).join('') });
  let dots = '';
  for (let i = 0; i < 60; i++) { const x = r(20, 4360), y = r(140, 330); dots += r(0, 1) > .5 ? `<rect x="${f(x)}" y="${f(y)}" width="20" height="14" fill="${pick([WHITE, '#f0dcc0', LAV])}"/><path d="M${f(x - 3)} ${f(y)}l13 -10l13 10Z" fill="${pick([BRICK, INDIGO, TILE])}"/>` : `<path d="M${f(x)} ${f(y)}l9 -26l9 26Z" fill="#4f8f62"/>`; }
  return [
    { id: 'sky', backdrop: true, stock: 'cover', c: '#a9d8f0', w: 5200, h: 1500, o: [-2480, -160, z], u: [1, 0, 0], v: [0, 1, 0], density: D, print: gulls },
    clouds('clouds-far', 14, '#dcecf8', [[700, 560, 1.1], [2650, 520, 1.2], [4200, 620, 1]]),
    clouds('clouds-near', 34, '#fffdf6', [[1050, 510, 1.6], [1900, 580, 1.2], [3150, 530, 1.5], [2350, 680, .8], [4500, 520, 1.1], [1500, 700, .7]]),
    layer('hills-far', 40, 560, '#d6e6ee', `<path d="${ridge(4400, 560, 80, 50, 260, 1)}" fill="#fff"/>`),
    layer('hills-mid', 100, 500, '#b4d3c0', `<path d="${ridge(4400, 500, 80, 44, 180, 3)}" fill="#fff"/>`),
    layer('hills-near', 170, 470, '#8fc096', `<path d="${ridge(4400, 470, 80, 40, 130, 5)}" fill="#fff"/>`, dots)
  ];
}

/* ---------- the homes ---------- */
function gableRoof(id: string, cx: number, zf: number, half: number, peak: number, eave: number, depth: number, c: string, over = 22): Panel[] {
  const a = Math.atan2(peak, half), rise = Math.hypot(half + over, peak * (half + over) / half), top: V3 = [cx, eave + peak + 2, zf + 16], rd = depth + 28;
  const seams = Array.from({ length: Math.floor(rd / 24) }, (_, i) => `<path d="M0 ${(i + 1) * 24}H${f(rise)}" stroke="${tone(c, -.2)}" stroke-width="3"/>`).join('');
  return ([-1, 1] as const).flatMap(k => {
    const dn: V3 = [k * Math.cos(a), -Math.sin(a), 0];
    const base: Panel = k < 0 ? { id: `${id}-l`, stock: 'cover', c, w: rise, h: rd, o: add(top, dn, rise), u: [-dn[0], -dn[1], -dn[2]], v: [0, 0, -1], edge: 'cut', density: 1, print: seams }
      : { id: `${id}-r`, stock: 'cover', c, w: rise, h: rd, o: top, u: dn, v: [0, 0, -1], edge: 'cut', density: 1, print: seams };
    const lip: Panel = { id: `${base.id}-lip`, stock: 'cover', c: CREAM, w: rise, h: 8, o: add(k < 0 ? add(top, dn, rise) : top, [0, -8, 0]), u: base.u, v: [0, 1, 0], edge: 'fold', density: 1.4 };
    return [base, lip];
  });
}
// One home: a folded box under a gabled roof, its front a cut sheet with glued window frames and carved relief.
// `opens` hinges the front on its left edge, so it can swing away and show the rooms.
function home(h: Home, opens = false): Panel[] {
  const { id, x, w, wall, peak, c, roof, door, storeys } = h, H = wall + peak, x0 = x - w / 2, fh = wall / storeys, line = tone(c, -.1);
  const win = (wx: number, wy: number, ww = 46, wh = 56) => `<rect x="${wx - 5}" y="${H - wy - wh - 5}" width="${ww + 10}" height="${wh + 10}" fill="#fff"/><rect x="${wx}" y="${H - wy - wh}" width="${ww}" height="${wh}" fill="${LIT}"/><path d="M${wx + ww / 2} ${H - wy - wh}v${wh}M${wx} ${H - wy - wh / 2}h${ww}" stroke="#fff" stroke-width="4"/>`;
  const wx = [w * .13, w * .87 - 46], rows = Array.from({ length: storeys }, (_, k) => k * fh + fh * .34);
  const front: Panel = { id: `${id}-front`, stock: 'cover', c, w, h: H, o: [x0, 0, HZ], u: [1, 0, 0], v: [0, 1, 0], density: 1.5, edge: 'cut',
    mask: `<path d="M0 ${H}V${peak}L${w / 2} 0L${w} ${peak}V${H}Z" fill="#fff"/>`,
    print: `<rect width="${w}" height="${H}" fill="${c}"/>${Array.from({ length: Math.floor(H / 18) }, (_, i) => `<path d="M0 ${peak * .5 + i * 18}H${w}" stroke="${line}" stroke-width="2"/>`).join('')}<rect y="${H - 12}" width="${w}" height="12" fill="${tone(c, -.2)}"/>` +
      (storeys > 1 ? `<rect y="${H - fh - 4}" width="${w}" height="7" fill="${tone(c, .5)}"/>` : '') +
      rows.flatMap((wy, k) => wx.map(a => win(a, wy)).concat(k ? [win(w / 2 - 23, wy)] : [])).join('') +
      // The door, with its fanlight and step.
      `<rect x="${w / 2 - 30}" y="${H - 104}" width="60" height="104" fill="#fff"/><rect x="${w / 2 - 24}" y="${H - 98}" width="48" height="98" fill="${door}"/><rect x="${w / 2 - 18}" y="${H - 92}" width="36" height="20" fill="${LIT}"/><circle cx="${w / 2 + 15}" cy="${H - 46}" r="3.4" fill="${YEL}"/>` +
      // A round window in the gable.
      `<circle cx="${w / 2}" cy="${peak * .78}" r="17" fill="#fff"/><circle cx="${w / 2}" cy="${peak * .78}" r="12" fill="${LIT}"/><path d="M${w / 2} ${peak * .78 - 12}v24M${w / 2 - 12} ${peak * .78}h24" stroke="#fff" stroke-width="3"/>`,
    ...(opens ? { motion: { toy: 'home', at: [1], edge: 'left', deg: 112 } as Panel['motion'] } : {}) };
  const F = frame(x0, HZ, 0);
  const dress = carved(front, [
    ...wx.flatMap((a, k) => fflowers(F, `${id}-flowers${k}`, a - 6, rows[0] - 16, 58)),
    ...fawning(F, `${id}-porch`, w / 2 - 44, 132, 88, 34, 16, roof, false), ...flamp(F, `${id}-lamp`, w / 2 + 44, 70),
    ...fbox(F, `${id}-step`, w / 2 - 38, 0, 0, 76, 8, 20, { c: '#e6dccb' })]);
  const walls = box({ id: `${id}-body`, x, z: HZ - HD / 2, w, h: wall, d: HD, stock: 'cover', c, side: c, noTop: true }).filter(p => !p.id.endsWith('front')).map(p => ({ ...p, density: 1 }));
  const chimney = h.chimney ? box({ id: `${id}-chimney`, x: x + w * .26, z: HZ - 60, y: wall + peak * .2, w: 28, h: peak * .9, d: 28, stock: 'cover', c: BRICK, front: `<rect width="28" height="8" fill="${tone(BRICK, .3)}"/>`, density: 1 }) : [];
  // The inside of a front that opens: plain lining paper with the window and door openings, seen once it has swung round.
  // It is baked shut inside the house, where no light reaches, so it carries its own light like the rooms do.
  const inside: Panel[] = opens ? [{ id: `${id}-lining`, stock: 'cover', c: '#f6ecd8', emit: .8, w, h: H, o: [x0 + w, 0, HZ - .6], u: [-1, 0, 0], v: [0, 1, 0], density: 1.5, edge: 'cut',
    mask: `<path d="M0 ${H}V${peak}L${w / 2} 0L${w} ${peak}V${H}Z" fill="#fff"/>`,
    print: `<rect width="${w}" height="${H}" fill="#f6ecd8"/>` + rows.flatMap((wy, k) => wx.map(a => [a, wy]).concat(k ? [[w / 2 - 23, wy]] : [])).map(([a, wy]) => `<rect x="${w - a - 51}" y="${H - wy - 61}" width="56" height="66" fill="#fff"/><rect x="${w - a - 46}" y="${H - wy - 56}" width="46" height="56" fill="#bfe0f2"/>`).join('') + `<rect x="${w / 2 - 30}" y="${H - 104}" width="60" height="104" fill="#fff"/><rect x="${w / 2 - 24}" y="${H - 98}" width="48" height="98" fill="${tone(door, .25)}"/><circle cx="${w / 2}" cy="${peak * .78}" r="14" fill="#bfe0f2"/>`,
    motion: { toy: 'home', at: [1], edge: 'right', deg: -112 } }] : [];
  return [front, ...inside, ...dress, ...walls, ...chimney, ...gableRoof(`${id}-roof`, x, HZ, w / 2, peak, wall, HD, roof)];
}
// The rooms behind the front that opens: a lit back wall papered room by room, a floor between the storeys, and
// furniture with real volume carved onto the wall. A cut frame at the opening shows the section, like a doll's house.
function rooms(h: Home): Panel[] {
  const { id, x, w, wall, peak } = h, x0 = x - w / 2, fh = wall / 2, H = wall + peak, bz = HZ - 64, lit = (p: Panel): Panel => ({ ...p, emit: .62 });
  const back: Panel = lit({ id: `${id}-rooms`, stock: 'cover', c: '#fff7e6', w, h: H, o: [x0, 0, bz], u: [1, 0, 0], v: [0, 1, 0], density: 1.6, edge: 'fold',
    mask: `<path d="M0 ${H}V${peak}L${w / 2} 0L${w} ${peak}V${H}Z" fill="#fff"/>`,
    print: `<rect width="${w}" height="${H}" fill="#8a6a4c"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${w / 2 - i * 22} ${peak - i * 14}V${peak}M${w / 2 + i * 22} ${peak - i * 14}V${peak}" stroke="#6e523a" stroke-width="3"/>`).join('')}` +
      // Upstairs: a bedroom in pale yellow and a study in mint. Downstairs: a lavender living room and a cream kitchen.
      `<rect y="${peak}" width="${w / 2}" height="${fh}" fill="#fdeec2"/><rect x="${w / 2}" y="${peak}" width="${w / 2}" height="${fh}" fill="#d6ecd9"/><rect y="${peak + fh}" width="${w / 2}" height="${fh}" fill="#dfe4fb"/><rect x="${w / 2}" y="${peak + fh}" width="${w / 2}" height="${fh}" fill="#f6ecd8"/>` +
      `${Array.from({ length: 5 }, (_, i) => `<path d="M${14 + i * 24} ${peak}v${fh}" stroke="#f6dfa0" stroke-width="3"/>`).join('')}${Array.from({ length: 4 }, (_, i) => `<rect x="${w / 2 + 12 + i * 26}" y="${H - 70}" width="22" height="22" fill="#fff"/>`).join('')}` +
      // A picture, a window and a clock on the walls.
      `<rect x="20" y="${peak + fh + 18}" width="44" height="32" fill="#fff"/><rect x="24" y="${peak + fh + 22}" width="36" height="24" fill="${LAV}"/><rect x="${w - 62}" y="${peak + 16}" width="42" height="46" fill="#bfe0f2"/><path d="M${w - 41} ${peak + 16}v46" stroke="#fff" stroke-width="4"/><circle cx="${w - 34}" cy="${peak + fh + 30}" r="13" fill="#fff"/><path d="M${w - 34} ${peak + fh + 30}v-8M${w - 34} ${peak + fh + 30}h6" stroke="${STEEL}" stroke-width="2"/>` });
  const F: Frame = frame(x0, bz, 0);
  const fb = (k: string, along: number, y: number, out: number, bw: number, bh: number, bd: number, c: string, front?: string) => fbox(F, `${id}-${k}`, along, y, out, bw, bh, bd, { c, front, density: 2 });
  const up = fh + 6;
  const furniture = carved(back, [
    // Living room: a sofa with its back and two cushions, a rug, a floor lamp.
    ...fb('sofa', 14, 0, 6, 86, 26, 34, INDIGO), ...fb('sofa-back', 14, 26, 0, 86, 26, 10, tone(INDIGO, -.15)), ...fb('cushion-a', 22, 26, 12, 22, 16, 8, YEL), ...fb('cushion-b', 66, 26, 12, 22, 16, 8, LAV),
    ...fb('lamp-post', 104, 0, 10, 4, 70, 4, STEEL), fflat(F, `${id}-shade`, 92, 66, 12, 28, 22, { stock: 'vellum', c: '#fff4c2', mask: '<path d="M6 0H22L28 22H0Z" fill="#fff"/>' }),
    // Kitchen: a counter with a hob, a table and a stool.
    ...fb('counter', w / 2 + 10, 0, 0, 60, 46, 22, WHITE, `<rect width="60" height="6" fill="${STONE}"/><rect x="6" y="14" width="22" height="26" fill="#e6dccb"/><rect x="32" y="14" width="22" height="26" fill="#e6dccb"/>`),
    ...fb('table', w / 2 + 52, 34, 26, 56, 6, 30, TILE), ...fb('table-leg-a', w / 2 + 56, 0, 30, 6, 34, 6, tone(TILE, -.2)), ...fb('table-leg-b', w / 2 + 98, 0, 30, 6, 34, 6, tone(TILE, -.2)),
    // Bedroom: a bed with its headboard, pillow and blanket.
    ...fb('bed', 14, up, 4, 90, 22, 46, WHITE), ...fb('headboard', 14, up, 0, 12, 48, 46, TILE), ...fb('pillow', 26, up + 22, 14, 24, 8, 26, '#fff'), ...fb('blanket', 54, up + 22, 6, 50, 5, 44, YEL),
    // Study: a bookshelf and a desk with a chair.
    ...fb('shelf', w / 2 + 14, up, 0, 46, 92, 16, TILE, `${[0, 1, 2, 3].map(k => `<rect x="4" y="${6 + k * 22}" width="38" height="16" fill="${tone(TILE, -.3)}"/>${[0, 1, 2, 3, 4].map(j => `<rect x="${6 + j * 7}" y="${8 + k * 22}" width="5" height="14" fill="${[INDIGO, YEL, LAV, WHITE, TEAL][(j + k) % 5]}"/>`).join('')}`).join('')}`),
    ...fb('desk', w / 2 + 66, up + 36, 0, 46, 6, 26, STONE), ...fb('desk-leg', w / 2 + 104, up, 4, 6, 36, 6, tone(STONE, -.2)), ...fb('chair', w / 2 + 74, up, 30, 22, 24, 20, INDIGO)
  ].map(lit));
  // The floor between the storeys, and the ground floor's boards.
  const floor = (k: string, y: number, c: string): Panel => lit({ id: `${id}-${k}`, stock: 'cover', c, w: w - 4, h: 62, o: [x0 + 2, y, HZ - 2], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.2, print: Array.from({ length: 5 }, (_, i) => `<path d="M0 ${i * 13 + 6}H${w}" stroke="${tone(c, -.12)}" stroke-width="2"/>`).join('') });
  // The section: the walls' and floors' cut edges, seen at the opening.
  const section: Panel = { id: `${id}-section`, stock: 'cover', c: '#fff', emit: .8, w, h: H, o: [x0, 0, HZ - 1], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6,
    mask: `<path fill-rule="evenodd" d="M0 ${H}V${peak}L${w / 2} 0L${w} ${peak}V${H}Z M8 ${H - 4}V${peak + fh + 4}H${w / 2 - 4}V${H - 4}Z M${w / 2 + 4} ${H - 4}V${peak + fh + 4}H${w - 8}V${H - 4}Z M8 ${peak + fh - 4}V${peak + 6}H${w / 2 - 4}V${peak + fh - 4}Z M${w / 2 + 4} ${peak + fh - 4}V${peak + 6}H${w - 8}V${peak + fh - 4}Z M${w / 2 - 44} ${peak - 4}L${w / 2} ${peak * .38}L${w / 2 + 44} ${peak - 4}Z" fill="#fff"/>` };
  return [back, ...furniture, floor('floor-up', fh, '#c99a62'), floor('floor-down', 1, '#c99a62'), section];
}
// A picket fence along a garden's front, cut from one sheet, with a gap where the path comes through.
function fence(h: Home): Panel[] {
  const W = h.w + 70, x0 = h.x - W / 2, n = Math.floor(W / 14);
  const pales = Array.from({ length: n }, (_, i) => Math.abs(i * 14 + 5 - W / 2) < 30 ? '' : `<path d="M${i * 14} 46V10L5 2L10 10V46Z" fill="#fff"/>`).join('');
  const rails = `<rect y="16" width="${W / 2 - 30}" height="5" fill="#fff"/><rect x="${W / 2 + 30}" y="16" width="${W / 2 - 30}" height="5" fill="#fff"/><rect y="34" width="${W / 2 - 30}" height="5" fill="#fff"/><rect x="${W / 2 + 30}" y="34" width="${W / 2 - 30}" height="5" fill="#fff"/>`;
  const run: Panel = { id: `${h.id}-fence`, stock: 'cover', c: '#fffdf6', w: W, h: 46, o: [x0, 0, GARDEN + 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: pales + rails };
  return [run];
}
// The board on a stake in each garden. When its flyer's tab is torn off at the board, it lifts.
const offerSign = (h: Home, i: number): Panel => ({ id: `sign-${i}`, stock: 'cover', c: h.offer === 'sale' ? YEL : LAV, w: 64, h: 112, o: [h.x - h.w / 2 - 6, 0, GARDEN - 16], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4,
  mask: '<rect x="28" y="50" width="8" height="62" fill="#fff"/><rect width="64" height="54" rx="6" fill="#fff"/>', print: `<rect width="64" height="112" fill="${STEEL}"/><rect width="64" height="54" fill="${h.offer === 'sale' ? YEL : LAV}"/><rect x="4" y="4" width="56" height="46" rx="4" fill="none" stroke="#fff" stroke-width="3"/><g transform="translate(12 10)">${offer(h.offer, STEEL)}</g>`,
  motion: { toy: 'flyer', at: [i + 1], slide: [0, 26, 0] } });

/* ---------- the flyer board ---------- */
// A roofed noticeboard at the mouth of the lane, one flyer for each home on the square: the home's own colours, a ribbon
// in yellow (for sale) or lavender (for rent), and a fringe of tear-off tabs. Each A tears one tab off the next flyer.
function flyerBoard(x: number, z: number, rot: number): Panel[] {
  const P = piece(x, z, rot), W = 330, BH = 150, y0 = 62;
  const back = P('board', [-W / 2, y0, 0], [1, 0, 0], [0, 1, 0], W, BH, { stock: 'kraft', c: '#d9b380', density: 2, edge: 'fold', print: `<rect width="${W}" height="${BH}" fill="#d9b380"/><rect width="${W}" height="${BH}" fill="none" stroke="${KRAFT}" stroke-width="16"/>` });
  // The posts are flat strips of board: a folded post here would have both its side faces in view, and the browser tears
  // the paving between two such planes.
  const posts = [-1, 1].map(k => P(`board-post${k}`, [k * (W / 2 - 16) - 6, 0, -3], [1, 0, 0], [0, 1, 0], 12, y0 + 4, { stock: 'greyboard', c: '#7a5c42', edge: 'fold' }));
  // A little roof over it, folded along its ridge, carrying the Moperty mark.
  const roof = [1, -1].map(k => P(`board-roof${k}`, [-W / 2 - 14, y0 + BH - 2, k * 34], [1, 0, 0], unit([0, 30, -k * 34]), W + 28, Math.hypot(30, 34), { stock: 'cover', c: '#7a5c42', edge: 'fold', density: 1.6, print: k > 0 ? `<g transform="translate(${W / 2 - 14} 10) scale(1.05)">${mark(1, '#fff', LAV, '#7a5c42')}</g>` : '' })).map(toCamera);
  const FW = 62, FH = 96, tabs = 5, tw = FW / tabs;
  const flyers = HOMES.flatMap((h, i) => {
    const fx = 22 + i * 74, fy = 22 + (i % 2) * 6, ribbon = h.offer === 'sale' ? YEL : LAV;
    const art = `<rect width="${FW}" height="${FH}" fill="#fff"/><rect width="${FW}" height="10" fill="${ribbon}"/><rect x="16" y="38" width="30" height="${h.storeys > 1 ? 26 : 18}" fill="${h.c}" stroke="#d9d2c4" stroke-width="1"/><path d="M12 38L31 24L50 38Z" fill="${h.roof}"/><rect x="28" y="${h.storeys > 1 ? 52 : 46}" width="6" height="${h.storeys > 1 ? 12 : 10}" fill="${h.door}"/><g transform="translate(4 12) scale(.34)">${offer(h.offer, STEEL)}</g>` +
      `<path d="M0 ${FH - 24}H${FW}" stroke="#b9b2a6" stroke-width="1.2"/>${Array.from({ length: tabs - 1 }, (_, k) => `<path d="M${(k + 1) * tw} ${FH - 24}V${FH}" stroke="#b9b2a6" stroke-width="1" stroke-dasharray="3 2"/>`).join('')}${Array.from({ length: tabs }, (_, k) => `<rect x="${k * tw + 4}" y="${FH - 17}" width="${tw - 8}" height="3" fill="#b9b2a6"/>`).join('')}<circle cx="${FW / 2}" cy="5" r="3.4" fill="${STEEL}"/>`;
    // The middle tab is its own slip of paper, so it can be gone. The flyer is cut around it.
    const body = on(back, 1, fx, BH - fy - FH, FW, FH, { id: `flyer-${i}`, stock: 'bond', c: '#fff', density: 3, print: art, mask: `<path d="M0 0H${FW}V${FH}H${tw * 3}V${FH - 24}H${tw * 2}V${FH}H0Z" fill="#fff"/>` });
    const tab: Panel = { ...on(back, 1.4, fx + tw * 2, BH - fy - FH, tw, 24, { id: `tab-${i}`, stock: 'bond', c: '#fff', density: 3, print: `<rect width="${tw}" height="24" fill="#fff"/><rect x="4" y="7" width="${tw - 8}" height="3" fill="#b9b2a6"/>` }), decal: undefined, show: { toy: 'flyer', at: [0, 1, 2, 3, 4].filter(k => k !== i + 1) } };
    return [body, tab];
  });
  return [back, ...posts, ...roof, ...flyers];
}

/* ---------- the MRT exit ---------- */
// A small head house: the stair down to the platforms under a teal canopy, and the station totem beside it.
function mrtExit(x: number, z: number): Panel[] {
  const W = 230, H = 170, D = 150, x0 = x - W / 2, fz = z + D / 2;
  const front: Panel = { id: 'mrt-front', stock: 'greyboard', c: '#c9d0d6', w: W, h: H, o: [x0, 0, fz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5,
    mask: `<path fill-rule="evenodd" d="M0 0H${W}V${H}H0Z M22 ${H}V34H${W - 22}V${H}Z" fill="#fff"/>`, print: `<rect width="${W}" height="${H}" fill="#c9d0d6"/><rect width="${W}" height="30" fill="${TEAL}"/><rect x="14" y="7" width="${W - 28}" height="16" rx="8" fill="#fff"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${30 + k * 36}" y="12" width="${k === 2 ? 26 : 18}" height="6" rx="3" fill="${k === 2 ? TEAL : '#b9c0c8'}"/>`).join('')}` };
  // The stair, going down into the dark: each tread a step lower and a tone deeper.
  const stair: Panel = { id: 'mrt-stair', stock: 'greyboard', c: '#3d444e', w: W - 30, h: H - 30, o: [x0 + 15, 0, fz - 40], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4, emit: .2,
    print: `<rect width="${W - 30}" height="${H - 30}" fill="#23272d"/>${[0, 1, 2, 3, 4, 5].map(k => `<rect x="${k * 9}" y="${H - 30 - (6 - k) * 17}" width="${W - 30 - k * 18}" height="17" fill="${tone('#8e96a3', -k * .12)}"/><rect x="${k * 9}" y="${H - 30 - (6 - k) * 17}" width="${W - 30 - k * 18}" height="4" fill="${YEL}"/>`).join('')}<rect x="${(W - 30) / 2 - 3}" y="20" width="6" height="${H - 60}" fill="#c9d0d6"/>` };
  const walls = box({ id: 'mrt-body', x, z, w: W, h: H, d: D, stock: 'greyboard', c: '#c9d0d6', side: '#b7bfc7', noTop: true, density: 1 }).filter(p => !p.id.endsWith('front'));
  const canopy = box({ id: 'mrt-canopy', x, z: z + 16, y: H, w: W + 50, h: 16, d: D + 70, stock: 'cover', c: TEAL, front: `<rect width="${W + 50}" height="5" fill="${tone(TEAL, -.25)}"/>`, top: `<rect width="${W + 50}" height="${D + 70}" fill="${tone(TEAL, .12)}"/>`, density: 1.2 });
  // The totem: a post with the line's roundel.
  const tx = x + W / 2 + 46, post = box({ id: 'mrt-totem', x: tx, z: fz + 6, w: 12, h: 230, d: 12, stock: 'greyboard', c: STEEL, noTop: true });
  const roundel: Panel = { id: 'mrt-roundel', stock: 'cover', c: TEAL, w: 76, h: 76, o: [tx - 38, 218, fz + 13], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4, mask: disc(38), print: `<circle cx="38" cy="38" r="31" fill="${TEAL}"/><text x="38" y="52" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="40" fill="#fff">M</text>` };
  return [front, stair, ...walls, ...canopy, ...post, roundel];
}

/* ---------- moving day ---------- */
// A removal van folded from boxes: the load box with its back open, the cab, wheels and lamps glued on.
function van(id: string, x: number, z: number, rot: number): Panel[] {
  const P = piece(x, z, rot), R = yaw(rot), at = (lx: number, lz = 0) => add([x, 0, z], R([lx, 0, lz]));
  const lc = at(-30), load = box({ id: `${id}-load`, x: lc[0], z: lc[2], y: 20, w: 170, h: 96, d: 90, rot, stock: 'cover', c: WHITE, side: '#ebe4d6', density: 1.6,
    front: `<rect width="170" height="96" fill="${WHITE}"/><rect y="70" width="170" height="8" fill="${INDIGO}"/><g transform="translate(58 18)"><path d="M4 22L27 4L50 22V24H4Z" fill="${INDIGO}"/><rect x="10" y="23" width="34" height="22" fill="${LAV}"/><rect x="23" y="30" width="9" height="15" fill="${INDIGO}"/></g>`,
    left: `<rect width="90" height="96" fill="#3d444e"/><rect x="8" y="40" width="34" height="50" fill="${KRAFT}"/><rect x="46" y="56" width="36" height="34" fill="#c99a62"/><rect x="14" y="14" width="30" height="26" fill="#c99a62"/>`, top: `<rect width="170" height="90" fill="#fff"/>` });
  const cc = at(84), cab = box({ id: `${id}-cab`, x: cc[0], z: cc[2], y: 20, w: 58, h: 70, d: 86, rot, stock: 'cover', c: YEL, side: tone(YEL, -.2), density: 1.6,
    front: `<rect width="58" height="70" fill="${YEL}"/><rect x="8" y="8" width="42" height="26" fill="#bfe0f2"/><rect x="34" y="44" width="12" height="4" rx="2" fill="${tone(YEL, -.25)}"/>`, right: `<rect width="86" height="70" fill="${tone(YEL, -.2)}"/><rect x="8" y="8" width="70" height="26" fill="#bfe0f2"/><rect x="8" y="46" width="16" height="10" rx="3" fill="#fff4e2"/><rect x="62" y="46" width="16" height="10" rx="3" fill="#fff4e2"/>`, top: `<rect width="58" height="86" fill="${tone(YEL, .2)}"/>` });
  const wheel = (k: string, cx: number) => {
    const w = P(`${id}-wheel-${k}`, [cx - 21, 0, 46.5], [1, 0, 0], [0, 1, 0], 42, 42, { stock: 'greyboard', c: STEEL, mask: disc(21) });
    return [w, on(w, 1.2, 9, 9, 24, 24, { id: `${id}-rim-${k}`, stock: 'cover', c: '#6b7480', mask: disc(12) }), on(w, 2.2, 15, 15, 12, 12, { id: `${id}-hub-${k}`, stock: 'cover', c: '#d9dde6', mask: disc(6) })];
  };
  return [...load, ...cab, ...wheel('r', -84), ...wheel('f', 80)];
}
// A carton: a folded kraft box with a strip of tape and a little house stamped on it.
const carton = (id: string, x: number, z: number, w: number, h: number, d: number, rot = 0, y = 0) => box({ id, x, z, y, w, h, d, rot, stock: 'kraft', c: KRAFT, side: '#a8743f', density: 1.8,
  front: `<rect x="${w / 2 - 5}" width="10" height="${h}" fill="#d9b781"/><g transform="translate(6 ${h - 24}) scale(.6)"><path d="M2 14L15 3L28 14V16H2Z" fill="#7a5237"/><rect x="5" y="15" width="20" height="13" fill="#7a5237"/></g>`, top: `<rect x="${w / 2 - 5}" width="10" height="${d}" fill="#d9b781"/>` });
// A cat sitting on a fence rail: flat, because it sits against the fence.
const cat = (id: string, x: number, y: number, z: number, c: string): Panel => ({ id, stock: 'sugar', c, w: 44, h: 40, o: [x - 22, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.6,
  mask: '<path d="M10 40V18Q8 12 10 2L16 8H24L30 2Q32 12 30 18Q40 22 40 40Z" fill="#fff"/><path d="M38 40Q46 30 42 18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>',
  print: `<rect width="44" height="40" fill="${c}"/><circle cx="15.5" cy="13" r="1.8" fill="${YEL}"/><circle cx="24.5" cy="13" r="1.8" fill="${YEL}"/><path d="M18 17h4l-2 2Z" fill="${tone(c, .5)}"/><path d="M14 40V28Q20 22 26 28V40Z" fill="${tone(c, .35)}"/>` });
// A letter box on a post by a gate.
const letterBox = (id: string, x: number, z: number, c: string): Panel[] => [{ id: `${id}-post`, stock: 'greyboard', c: STEEL, w: 6, h: 44, o: [x - 3, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.8 },
  ...box({ id, x, z, y: 44, w: 30, h: 20, d: 20, stock: 'cover', c, front: `<rect x="5" y="6" width="20" height="3" fill="${tone(c, -.3)}"/>`, density: 2 })];
// The sign that takes you to the product itself: a folded A-board with the mark.
function aBoard(id: string, x: number, z: number, rot: number): Panel[] {
  const P = piece(x, z, rot), face = `<rect x="5" y="5" width="60" height="86" fill="${INDIGO}"/><g transform="translate(14 20)">${mark(1, '#fff', LAV, INDIGO)}</g><rect x="14" y="60" width="42" height="6" rx="3" fill="#fff"/><rect x="20" y="72" width="30" height="5" rx="2.5" fill="${LAV}"/>`;
  return [P(`${id}-a`, [-35, 0, 14], [1, 0, 0], unit([0, 96, -14]), 70, Math.hypot(96, 14), { stock: 'cover', c: CREAM, edge: 'fold', density: 2.4, print: face }),
    { ...P(`${id}-b`, [35, 0, -14], [-1, 0, 0], unit([0, 96, 14]), 70, Math.hypot(96, 14), { stock: 'cover', c: CREAM, density: 1 }), ghost: true }];
}

/* ---------- the sides, and everything on the square ---------- */
function surroundings(): Panel[] {
  // Left: a row of two terraced houses turned in toward the square.
  const terrace = (id: string, F: Frame, W: number, H: number, cols: [string, string], roofC: string, doors: [string, string]): Panel[] => {
    const half = W / 2, g = 150;
    const win = (x: number, y: number, lit: boolean) => `<rect x="${x}" y="${H - y - 88}" width="66" height="88" fill="#fff"/><rect x="${x + 6}" y="${H - y - 82}" width="54" height="76" fill="${lit ? LIT : GLASS}"/><path d="M${x + 33} ${H - y - 82}v76M${x + 6} ${H - y - 44}h54" stroke="#fff" stroke-width="4"/>`;
    const one = (x: number, c: string, door: string, k: number) => `<rect x="${x}" width="${half}" height="${H}" fill="${c}"/>${Array.from({ length: Math.floor(H / 20) }, (_, i) => `<path d="M${x} ${46 + i * 20}h${half}" stroke="${tone(c, -.1)}" stroke-width="2"/>`).join('')}<rect x="${x}" y="${H - 12}" width="${half}" height="12" fill="${tone(c, -.2)}"/>` +
      win(x + 30, g + 40, k === 0) + win(x + half - 96, g + 40, k === 1) + win(x + 30, 36, k === 1) +
      `<rect x="${x + half - 100}" y="${H - 120}" width="64" height="120" fill="#fff"/><rect x="${x + half - 94}" y="${H - 114}" width="52" height="114" fill="${door}"/><rect x="${x + half - 88}" y="${H - 108}" width="40" height="22" fill="${LIT}"/>`;
    const front: Panel = { id: `${id}-front`, stock: 'cover', c: cols[0], w: W, h: H, o: F.o, u: F.u, v: [0, 1, 0], edge: 'cut', density: .9,
      mask: `<path d="M0 ${H}V44L${half / 2} 0L${half} 44L${half * 1.5} 0L${W} 44V${H}Z" fill="#fff"/>`, print: one(0, cols[0], doors[0], 0) + one(half, cols[1], doors[1], 1) + `<path d="M0 44L${half / 2} 0L${half} 44Z M${half} 44L${half * 1.5} 0L${W} 44Z" fill="none" stroke="${roofC}" stroke-width="16"/>` };
    const end: Panel = { id: `${id}-end`, stock: 'cover', c: tone(cols[0], -.12), w: 170, h: H - 44, o: add(F.o, F.n, -170), u: F.n, v: [0, 1, 0], edge: 'fold', density: 1, print: `<rect x="50" y="80" width="60" height="80" fill="${GLASS}"/>` };
    return [front, end, ...carved(front, [
      ...[0, 1].flatMap(k => [...fflowers(F, `${id}-fl${k}a`, k * half + 26, g + 24, 74), ...fflowers(F, `${id}-fl${k}b`, k * half + half - 100, g + 24, 74), ...fawning(F, `${id}-porch${k}`, k * half + half - 112, 150, 88, 40, 20, roofC, false), ...flamp(F, `${id}-lamp${k}`, k * half + half - 20, 80),
        ...fbox(F, `${id}-step${k}`, k * half + half - 108, 0, 0, 80, 8, 22, { c: '#e6dccb' })]),
      ...fbox(F, `${id}-eaves`, 0, H - 56, 0, W, 10, 18, { c: '#fff' })])];
  };
  const L = frame(-1210, 330, 80), R = frame(1230, -300, -72);
  const sides = [...terrace('left', L, 620, 380, [STONE, WHITE], BRICK, [BRICK, INDIGO]), ...terrace('right', R, 620, 380, [WHITE, LAV], INDIGO, [TILE, tone(INDIGO, -.3)])];

  const h3 = HOMES[2], h4 = HOMES[3], h2 = HOMES[1], h1 = HOMES[0];
  return [...sides,
    ...HOMES.flatMap((h, i) => [...home(h, h === h3), ...fence(h), offerSign(h, i), ...bush(`${h.id}-bush`, h.x + h.w / 2 + 8, GARDEN - 22, 96, 50)]), ...rooms(h3),
    // The MRT exit at the left end of the square, with the way to the product beside it.
    ...mrtExit(-930, 60), ...aBoard('visit', -710, 120, -10),
    // The flyer board stands at the mouth of the lane.
    ...flyerBoard(-84, -74, 0),
    // Small stories. A couple looking over the home that opens; a neighbour at her gate; a cat on the next fence.
    ...shopper('viewer-a', h3.x - 270, 150, { coat: '#e88ab0', legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', style: 'dress', face: 'surprised', carry: YEL }, true),
    ...shopper('viewer-b', h3.x - 322, 140, { coat: '#2bb5b8', legs: '#3d444e', skin: '#f3c9a0', hair: '#4a2c1a', build: 'average', face: 'cool' }, false, 1, 0, false),
    ...shopper('neighbour', h1.x + 70, -34, { coat: '#35b58a', legs: '#f4f1ea', skin: '#f3c9a0', hair: '#c9ccd1', style: 'dress', hat: '#f4e3c3', face: 'grumpy', carry: '#57b36f' }),
    cat('cat', h2.x - 80, 40, GARDEN + 3, '#3d444e'), ...letterBox('box-h2', h2.x + 62, GARDEN + 16, INDIGO), ...letterBox('box-h3', h3.x - 60, GARDEN + 16, BRICK),
    ...bicycle('bike', h1.x - 86, GARDEN + 18, 4, INDIGO),
    // Moving day at the last home: the van, cartons on the paving, the mover carrying one in, a child watching.
    ...van('van', h4.x + 120, 96, 8), ...carton('carton-a', h4.x - 60, 70, 56, 44, 44, -8), ...carton('carton-b', h4.x - 66, 68, 44, 34, 36, 10, 44), ...carton('carton-c', h4.x - 2, 100, 46, 36, 40, 14),
    ...shopper('mover', h4.x - 6, -10, { coat: '#f4f1ea', legs: '#5b6bdc', skin: '#a8714f', hair: '#1d1a17', build: 'big', face: 'determined', carry: KRAFT, hat: INDIGO }),
    ...shopper('child', h4.x - 130, 150, { coat: YEL, legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', style: 'shorts', face: 'cheerful' }, false, .7, 0, false),
    ...pigeon('pigeon-a', 60, 190, -20, '#9aa3ad'), ...pigeon('pigeon-b', 108, 204, 16, '#b3bac3', true),
    // The right end: a shade tree over a bench, someone dozing beside it.
    ...shadeTree('tree', 1010, 150, 300), ...planter('tree-bed', 1010, 150, 104), ...bench('bench', 880, 210, 150, -10),
    ...shopper('dozer', 930, 250, { coat: LAV, legs: '#3d444e', skin: '#f3c9a0', hair: '#8a5a3a', build: 'average', face: 'sleepy', hat: '#f4f1ea' }, true, 1, 0, false),
    // The front edge: a lamp at each end and two low beds of bushes.
    ...streetLamp('lamp-a', -1060, 340, 250, '#ffe7a8'), ...streetLamp('lamp-b', 1150, 344, 250, '#ffe7a8'),
    ...planter('front-bed-a', -420, 336, 84, 30), ...bush('front-bush-a', -420, 330, 96, 54, 26), ...planter('front-bed-b', 470, 336, 84, 30), ...bush('front-bush-b', 470, 330, 96, 54, 26)];
}

export function hometown(): Scene {
  return { id: 'hometown', density: 2.1, camera: { zoom: .85, x0: -420, x1: 380 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] },
    panels: [...backdrop(), ...ground(), ...laneView(), ...surroundings()] };
}
