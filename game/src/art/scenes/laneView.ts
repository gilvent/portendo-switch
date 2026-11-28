// The lane's ground and its open view. The lane runs along the top of a rise, so everything behind the homes is one
// view over the hometown: a railing at the ridge's edge, then cut layers on two cards that keep their parallax, then
// the far backdrop of ridges, volcanoes and clouds.
import type { Panel } from '../kit.ts';
import { cloud } from '../recipes.ts';
import { tone } from './promenade.ts';

export const LAND = { x0: -1700, x1: 1700, z0: -330, z1: 330, lane: [56, 214] as const, path: [-128, -72] as const };
export const GRASS = '#8fc878', PAVE = '#e9dcc3', EARTH = '#cfa97c', ROOF = '#c8623f', INDIGO = '#3f51b5', PICKET = '#f7f2e7';
let s = 5;
const r = (a: number, b: number) => { s = (s * 16807) % 2147483647; return a + (s / 2147483647) * (b - a); };
const pick = <T,>(a: readonly T[]) => a[Math.floor(r(0, a.length))];
const f = (n: number) => n.toFixed(1);

/* ---------- the ground ---------- */
export function land(): Panel[] {
  s = 9;
  const W = LAND.x1 - LAND.x0, D = LAND.z1 - LAND.z0, X = (x: number) => x - LAND.x0, Y = (z: number) => z - LAND.z0, [l0, l1] = LAND.lane;
  // Paving blocks in three creams, laid in courses; a darker kerb course along each edge of the lane.
  let pave = '';
  for (let row = 0, y = Y(l0); y < Y(l1); row++, y += 26) for (let x = row % 2 ? -26 : 0; x < W; x += 52) pave += `<rect x="${x + 1}" y="${y + 1}" width="50" height="24" fill="${['#e9dcc3', '#f1e7d2', '#dfd0b4'][Math.floor(r(0, 3))]}"/>`;
  const tufts = Array.from({ length: 170 }, () => { const x = r(0, W), z = pick([r(-320, 40), r(224, 320)]), k = r(.7, 1.3); return `<path transform="translate(${f(x)} ${f(Y(z))}) scale(${f(k)})" d="M0 0l3 -9l2 7l3 -10l2 9l4 -7l-2 10Z" fill="${pick(['#7cb866', '#a3d68b', '#6fae5c'])}"/>`; }).join('');
  const patch = (x0: number, x1: number, z0: number, z1: number, c: string, rx = 14) => `<rect x="${X(x0)}" y="${Y(z0)}" width="${x1 - x0}" height="${z1 - z0}" rx="${rx}" fill="${c}"/>`;
  const stones = Array.from({ length: 9 }, (_, i) => `<ellipse cx="${X(-100 + (i % 2) * 14 - 7)}" cy="${Y(34 - i * 42)}" rx="19" ry="13" fill="${i % 2 ? '#e4d8c2' : '#d5c7ad'}"/>`).join('');
  const print = `<rect width="${W}" height="${D}" fill="${GRASS}"/>${tufts}` +
    // The plot's bare earth, the yard's lawn and its paved walk to the door, the forecourt before the office.
    patch(-470, -150, -250, 48, EARTH, 22) + Array.from({ length: 26 }, () => `<circle cx="${f(X(r(-455, -165)))}" cy="${f(Y(r(-235, 36)))}" r="${f(r(2, 5))}" fill="${pick(['#bf9668', '#dcbc92'])}"/>`).join('') +
    patch(-54, 404, -250, 50, '#a3d68b', 4) + patch(150, 230, -112, 56, '#e4d8c2', 2) + Array.from({ length: 7 }, (_, i) => `<path d="M${X(150)} ${Y(-112 + i * 24)}H${X(230)}" stroke="#cdbf a5" stroke-width="2"/>`.replace('cdbf a5', 'cdbfa5')).join('') +
    patch(416, 800, 0, 56, '#dfd0b4', 2) + stones +
    `<rect y="${Y(l0)}" width="${W}" height="${l1 - l0}" fill="#d9caae"/>${pave}<rect y="${Y(l0) - 7}" width="${W}" height="9" fill="#bfae90"/><rect y="${Y(l1) - 2}" width="${W}" height="9" fill="#bfae90"/>`;
  const ground: Panel = { id: 'ground', stock: 'sugar', c: GRASS, w: W, h: D, o: [LAND.x0, 0, LAND.z1], u: [1, 0, 0], v: [0, 0, -1], density: .42, edge: 'fold', split: 8, print };
  const skirt: Panel = { id: 'ground-skirt', stock: 'greyboard', c: '#8a6a4c', w: W, h: 50, o: [LAND.x0, -50, LAND.z1 + 1], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2, print: `<rect width="${W}" height="9" fill="#6fae5c"/>` };
  // The railing along the ridge's edge, open where the path goes down.
  const rail = (id: string, x0: number, x1: number): Panel => { const w = x1 - x0; return { id, stock: 'cover', c: PICKET, w, h: 46, o: [x0, 0, LAND.z0 + 6], u: [1, 0, 0], v: [0, 1, 0], density: .9, edge: 'cut', split: 2,
    mask: `<rect y="6" width="${w}" height="6" fill="#fff"/><rect y="24" width="${w}" height="5" fill="#fff"/>${Array.from({ length: Math.floor(w / 46) + 1 }, (_, i) => `<rect x="${Math.min(i * 46, w - 7)}" width="7" height="46" fill="#fff"/>`).join('')}` }; };
  return [ground, skirt, rail('rail-l', LAND.x0, LAND.path[0] - 6), rail('rail-r', LAND.path[1] + 6, LAND.x1)];
}

/* ---------- the open view ---------- */
type Card = { id: string; x0: number; z: number; w: number; y0: number; density: number };
const NEAR: Card = { id: 'view-near', x0: -1800, z: -470, w: 3600, y0: -90, density: .9 };
const TOWN: Card = { id: 'view-town', x0: -2000, z: -640, w: 4000, y0: -110, density: .7 };
const layer = (card: Card, id: string, gap: number, h: number, c: string, mask: string, print = '', x = 0, w = card.w): Panel =>
  ({ id, stock: 'sugar', c, w, h, o: [card.x0 + x, card.y0, card.z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: card.density, decal: card.id, mask, print });
// A rolling top edge: the height above the sheet's foot at x.
const roll = (w: number, h: number, base: number, amp: number, len: number, phase: number, fall = 0) => { let d = `M0 ${h}`; for (let x = 0; x <= w; x += 20) d += `L${x} ${f(h - base - amp * Math.sin(x / len + phase) - amp * .4 * Math.sin(x / (len * .37) + phase * 2) - fall * x / w)}`; return `${d}L${w} ${h}Z`; };
// A crown of leaves cut as overlapping rounds, in two tones.
function crowns(w: number, h: number, foot: number, lo: number, hi: number, step: [number, number], cols: [string, string][], from = 0, to = w, ground = cols[0][0]) {
  let m = `<rect x="${from}" y="${h - foot}" width="${to - from}" height="${foot}" fill="#fff"/>`, p = `<rect x="${from}" y="${h - foot}" width="${to - from}" height="${foot}" fill="${ground}"/>`;
  for (let x = from + r(0, 30); x < to; x += r(step[0], step[1])) {
    const cr = r(lo, hi), cy = h - foot - cr * .5 - r(0, 14), [c, d] = pick(cols), tall = r(0, 1) < .28;
    if (tall) { const th = cr * 2.6; m += `<path d="M${f(x - cr * .7)} ${f(cy + cr)}L${f(x)} ${f(cy + cr - th)}L${f(x + cr * .7)} ${f(cy + cr)}Z" fill="#fff"/>`; p += `<path d="M${f(x - cr * .7)} ${f(cy + cr)}L${f(x)} ${f(cy + cr - th)}L${f(x + cr * .7)} ${f(cy + cr)}Z" fill="${d}"/><path d="M${f(x)} ${f(cy + cr - th)}L${f(x + cr * .7)} ${f(cy + cr)}H${f(x)}Z" fill="${tone(d, -.14)}"/>`; continue; }
    m += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="#fff"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 7)}" r="${f(cr * .74)}" fill="#fff"/><rect x="${f(x - cr)}" y="${f(cy)}" width="${f(cr * 2.6)}" height="${f(h - cy)}" fill="#fff"/>`;
    p += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="${c}"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 7)}" r="${f(cr * .74)}" fill="${d}"/><circle cx="${f(x - cr * .3)}" cy="${f(cy - cr * .3)}" r="${f(cr * .42)}" fill="${tone(c, .18)}"/>`;
  }
  return { m, p };
}
// One small house of the town, standing on the sheet's foot line `base` above its bottom: a body, a roof of its own
// kind and colour, windows, and now and then a chimney, a porch or a sale or rent sign.
function home(x: number, h: number, base: number, k: number, sign = '') {
  const w = r(52, 86) * k, bh = r(30, 52) * k, top = h - base - bh, wall = pick(['#fff4e2', '#f6e3c0', '#e9d3c7', '#dfe8ef', '#f3d9a8', '#e7efe0']), roofC = pick([ROOF, '#b5533a', INDIGO, '#5a6fc0', '#4f8f8a', '#d98a52']), kind = Math.floor(r(0, 3)), rh = r(18, 30) * k;
  const roof = kind === 0 ? `M${f(x - 5)} ${f(top)}L${f(x + w / 2)} ${f(top - rh)}L${f(x + w + 5)} ${f(top)}Z` : kind === 1 ? `M${f(x - 5)} ${f(top)}L${f(x + 8)} ${f(top - rh * .8)}H${f(x + w - 8)}L${f(x + w + 5)} ${f(top)}Z` : `M${f(x - 4)} ${f(top)}V${f(top - rh * .5)}L${f(x + w + 4)} ${f(top - rh)}V${f(top)}Z`;
  let m = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(bh + base)}" fill="#fff"/><path d="${roof}" fill="#fff"/>`;
  let p = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(bh)}" fill="${wall}"/><rect x="${f(x + w * .62)}" y="${f(top)}" width="${f(w * .38)}" height="${f(bh)}" fill="${tone(wall, -.08)}"/><path d="${roof}" fill="${roofC}"/><path d="${roof}" fill="none" stroke="${tone(roofC, -.2)}" stroke-width="${f(2 * k)}"/>`;
  for (let wx = x + 8 * k; wx < x + w - 14 * k; wx += 20 * k) p += `<rect x="${f(wx)}" y="${f(top + 8 * k)}" width="${f(10 * k)}" height="${f(12 * k)}" fill="${r(0, 1) > .3 ? '#7fb3cf' : '#ffe7a8'}"/>`;
  p += `<rect x="${f(x + w * .42)}" y="${f(top + bh - 18 * k)}" width="${f(10 * k)}" height="${f(18 * k)}" fill="${tone(roofC, -.25)}"/>`;
  if (r(0, 1) > .55) { m += `<rect x="${f(x + w * .7)}" y="${f(top - rh - 6 * k)}" width="${f(8 * k)}" height="${f(rh)}" fill="#fff"/>`; p = `<rect x="${f(x + w * .7)}" y="${f(top - rh - 6 * k)}" width="${f(8 * k)}" height="${f(rh)}" fill="#a9705a"/>` + p; }
  if (sign) { const sx = x + w + 6 * k, sy = top + bh - 30 * k; m += `<rect x="${f(sx)}" y="${f(sy)}" width="${f(16 * k)}" height="${f(12 * k)}" fill="#fff"/><rect x="${f(sx + 7 * k)}" y="${f(sy)}" width="${f(2.4 * k)}" height="${f(30 * k + base)}" fill="#fff"/>`; p += `<rect x="${f(sx + 7 * k)}" y="${f(sy)}" width="${f(2.4 * k)}" height="${f(30 * k)}" fill="#8b6a4c"/><rect x="${f(sx)}" y="${f(sy)}" width="${f(16 * k)}" height="${f(12 * k)}" fill="${sign}"/>`; }
  return { m, p, w };
}
function homes(w: number, h: number, base: number, k: number, gap: [number, number], ground: string, signs: Record<number, string> = {}, from = 0, to = w) {
  let m = `<rect x="${from}" y="${h - base}" width="${to - from}" height="${base}" fill="#fff"/>`, p = `<rect x="${from}" y="${h - base}" width="${to - from}" height="${base}" fill="${ground}"/>`, n = 0;
  for (let x = from + r(10, 60); x < to - 80 * k; n++) { const one = home(x, h, base, k, signs[n]); m += one.m; p += one.p; x += one.w + r(gap[0], gap[1]); }
  return { m, p };
}

export function view(): Panel[] {
  s = 23;
  const out: Panel[] = [];
  // Near card, standing below the ridge: only what rises above its edge shows.
  { const W = NEAR.w, H = 300;
    const hill = roll(W, H, 150, 16, 210, .4);
    out.push({ id: NEAR.id, stock: 'sugar', c: '#9ed084', w: W, h: H, o: [NEAR.x0, NEAR.y0, NEAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: NEAR.density, split: 2, mask: `<path d="${hill}" fill="#fff"/>`,
      print: Array.from({ length: 36 }, (_, i) => `<path d="M${i * 100 + 20} ${H - 150}q30 -10 60 0" stroke="#b6de9c" stroke-width="5" fill="none"/>`).join('') });
    const roofs = homes(W, H, 132, 1.25, [70, 240], '#9ed084', { 3: '#f6b73c', 9: INDIGO, 14: '#f6b73c' });
    out.push(layer(NEAR, 'view-roofs', 34, H, '#fff4e2', roofs.m, roofs.p));
    const trees = crowns(W, H, 96, 26, 44, [120, 330], [['#63b06f', '#4f9e66'], ['#7fc49a', '#63b06f'], ['#4f9e66', '#438c59']], 0, W, '#9ed084');
    out.push(layer(NEAR, 'view-trees', 62, H, '#9ed084', trees.m, trees.p));
    // The road from the lane's path: it drops out of sight below the ridge, then winds away into the town, narrowing,
    // with a row of posts beside it.
    const rx = LAND.path[0] - NEAR.x0 - 6, road = `M${rx} ${H}V${H - 60}C${rx + 10} ${H - 86} ${rx + 150} ${H - 84} ${rx + 170} ${H - 104}C${rx + 186} ${H - 120} ${rx + 120} ${H - 124} ${rx + 132} ${H - 136}H${rx + 150}C${rx + 144} ${H - 126} ${rx + 222} ${H - 118} ${rx + 204} ${H - 96}C${rx + 186} ${H - 70} ${rx + 74} ${H - 76} ${rx + 68} ${H - 54}V${H}Z`;
    const posts = [[24, 92, 20], [78, 104, 17], [138, 116, 14], [176, 128, 11]].map(([px, py, ph]) => `<rect x="${rx + px}" y="${H - py - ph}" width="${ph / 6}" height="${ph}" fill="COL"/>`).join('');
    const turn = (svg: string) => `<g transform="translate(${2 * rx + 62} 0) scale(-1 1)">${svg}</g>`;
    out.push(layer(NEAR, 'view-road', 72, H, '#efe3c8', turn(`<path d="${road}" fill="#fff"/>${posts.replace(/COL/g, '#fff')}`), turn(`<path d="${road}" fill="#efe3c8"/>${posts.replace(/COL/g, '#8b6a4c')}`), 0, 1900));
    // A banana grove sweeping in from the left and stopping.
    let bm = '', bp = '';
    for (let x = 30; x < 760; x += r(60, 96)) { const top = H - 150 - r(60, 100); for (const a of [-58, -24, 8, 40, 66]) { const L = r(60, 84); bm += `<path transform="translate(${f(x)} ${f(top + 70)}) rotate(${a - 90})" d="M0 -5Q${f(L * .5)} -17 ${f(L)} 0Q${f(L * .5)} 13 0 5Z" fill="#fff"/>`; bp += `<path transform="translate(${f(x)} ${f(top + 70)}) rotate(${a - 90})" d="M0 -5Q${f(L * .5)} -17 ${f(L)} 0Q${f(L * .5)} 13 0 5Z" fill="${a > 20 ? '#5aab52' : '#7cc46a'}"/><path transform="translate(${f(x)} ${f(top + 70)}) rotate(${a - 90})" d="M0 0H${f(L)}" stroke="#b6de9c" stroke-width="2"/>`; } bm += `<rect x="${f(x - 5)}" y="${f(top + 66)}" width="10" height="${f(H - top - 66)}" fill="#fff"/>`; bp += `<rect x="${f(x - 5)}" y="${f(top + 66)}" width="10" height="${f(H - top - 66)}" fill="#8fb26a"/>`; }
    out.push(layer(NEAR, 'view-banana', 84, H, '#7cc46a', bm, bp, 0, 800));
  }
  // The town card, further back: paddies, a tree line over half of it, the town's rows, a water tower, a mound.
  { const W = TOWN.w, H = 420;
    let paddies = '';
    for (let x = 0; x < W; x += r(150, 280)) { const pw = r(110, 220), py = H - r(190, 250), c = pick(['#b9d98a', '#cfe39a', '#a5cc7a', '#d9e8a6']); paddies += `<path d="M${f(x)} ${f(py)}l${f(pw)} -8l22 44l${f(-pw - 10)} 10Z" fill="${c}"/>${Array.from({ length: 5 }, (_, i) => `<path d="M${f(x + 4)} ${f(py + 6 + i * 8)}l${f(pw + 8)} -8" stroke="${tone(c, -.12)}" stroke-width="2"/>`).join('')}`; }
    out.push({ id: TOWN.id, stock: 'sugar', c: '#a9d58c', w: W, h: H, o: [TOWN.x0, TOWN.y0, TOWN.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: TOWN.density, split: 2, mask: `<path d="${roll(W, H, 262, 12, 330, 1.2)}" fill="#fff"/>`, print: paddies });
    const far = homes(W, H, 236, .7, [4, 60], '#a9d58c'); out.push(layer(TOWN, 'town-far', 26, H, '#fff4e2', far.m, far.p));
    const line = crowns(W, H, 214, 16, 28, [34, 70], [['#5aab70', '#4f9e66'], ['#74bb80', '#5aab70']], 1700, W); out.push(layer(TOWN, 'town-trees', 52, H, '#5aab70', line.m, line.p));
    const mid = homes(W, H, 196, .95, [10, 130], '#b6de9c', { 6: '#f6b73c', 17: INDIGO }); out.push(layer(TOWN, 'town-mid', 78, H, '#fff4e2', mid.m, mid.p));
    // The water tower and the school with its flag stand between the rows.
    const tx = 2340, ty = H - 196;
    out.push(layer(TOWN, 'town-tower', 64, H, '#dfe8ef', `<path d="M${tx} ${ty - 128}h64v40h-64Z M${tx + 6} ${ty - 88}h8V${ty}h-8Z M${tx + 50} ${ty - 88}h8V${ty}h-8Z M${tx + 8} ${ty - 44}h48v5h-48Z" fill="#fff"/><path d="M${tx - 4} ${ty - 128}L${tx + 32} ${ty - 150}L${tx + 68} ${ty - 128}Z" fill="#fff"/>`,
      `<rect x="${tx}" y="${ty - 128}" width="64" height="40" fill="#dfe8ef"/><rect x="${tx + 40}" y="${ty - 128}" width="24" height="40" fill="#c5d3dd"/><rect x="${tx}" y="${ty - 112}" width="64" height="5" fill="${INDIGO}"/><path d="M${tx - 4} ${ty - 128}L${tx + 32} ${ty - 150}L${tx + 68} ${ty - 128}Z" fill="#8fa4b3"/><rect x="${tx + 6}" y="${ty - 88}" width="8" height="88" fill="#8fa4b3"/><rect x="${tx + 50}" y="${ty - 88}" width="8" height="88" fill="#8fa4b3"/><rect x="${tx + 8}" y="${ty - 44}" width="48" height="5" fill="#8fa4b3"/>`));
    const mx = 2900, mound = `M${mx} ${H - 190}Q${mx + 230} ${H - 330} ${mx + 520} ${H - 190}Z`;
    out.push(layer(TOWN, 'town-mound', 100, H, '#8cc97c', `<path d="${mound}" fill="#fff"/><circle cx="${mx + 250}" cy="${H - 282}" r="22" fill="#fff"/><rect x="${mx + 247}" y="${H - 282}" width="6" height="30" fill="#fff"/>`, `<path d="${mound}" fill="#8cc97c"/><path d="M${mx + 250} ${H - 258}Q${mx + 380} ${H - 250} ${mx + 520} ${H - 190}H${mx + 250}Z" fill="#7bb96c"/><rect x="${mx + 247}" y="${H - 282}" width="6" height="30" fill="#8b6a4c"/><circle cx="${mx + 250}" cy="${H - 282}" r="22" fill="#3f8f5a"/><circle cx="${mx + 243}" cy="${H - 289}" r="10" fill="#57b36f"/>`));
    const near = crowns(W, H, 168, 22, 38, [60, 170], [['#57b36f', '#4f9e66'], ['#7fc49a', '#57b36f']], 0, W, '#b6de9c'); out.push(layer(TOWN, 'town-hedge', 124, H, '#b6de9c', near.m, near.p));
  }
  // The far backdrop: sky, clouds, two volcanoes and two ridges. Only heights from about 200 up show over the land.
  { const SW = 5200, SH = 1500, Z = -780, Y0 = -160, sx = (x: number) => x + 2480, sy = (y: number) => SH - (y - Y0);
    const sheet = (id: string, gap: number, c: string, mask: string, print = ''): Panel => ({ id, stock: 'sugar', c, w: SW, h: SH, o: [-2480, Y0, Z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .72, decal: 'sky', mask, print });
    out.push({ id: 'sky', backdrop: true, stock: 'cover', c: '#a9dcf2', w: SW, h: SH, o: [-2480, Y0, Z], u: [1, 0, 0], v: [0, 1, 0], density: .72 });
    out.push(sheet('clouds-far', 14, '#d8eef8', [[500, 610, 1.3], [1900, 700, 1], [3000, 640, 1.4], [4300, 720, 1.1]].map(([x, y, k]) => cloud(x, sy(y), k, '#fff')).join('')));
    // A volcano is two faces: the one toward the sun and the one away, with gullies cut in darker paper.
    const cone = (cx: number, base: number, peak: number, half: number, c: string) => { const X0 = sx(cx), yb = sy(base), yp = sy(peak), lip = half * .08;
      return { m: `<path d="M${X0 - half} ${yb}L${X0 - lip} ${yp}Q${X0} ${yp + 9} ${X0 + lip} ${yp}L${X0 + half * 1.15} ${yb}Z" fill="#fff"/>`,
        p: `<path d="M${X0 + lip * .2} ${yp + 6}L${X0 + half * 1.15} ${yb}H${X0 + half * .1}Z" fill="${tone(c, -.13)}"/>${[-.5, -.22, .3, .62].map(t => `<path d="M${X0 + lip * t} ${yp + 14}L${X0 + half * t * 1.2} ${yb}" stroke="${tone(c, t > 0 ? -.22 : -.08)}" stroke-width="5"/>`).join('')}<path d="M${X0 - lip} ${yp}Q${X0} ${yp + 9} ${X0 + lip} ${yp}L${X0 + lip * 1.6} ${yp + 16}Q${X0} ${yp + 26} ${X0 - lip * 1.6} ${yp + 16}Z" fill="${tone(c, .3)}"/>` }; };
    const a = cone(-560, 150, 640, 620, '#a9c2dc'), b = cone(820, 150, 520, 470, '#b9cde3');
    out.push(sheet('volcano-b', 30, '#b9cde3', b.m, b.p), sheet('volcano-a', 44, '#a9c2dc', a.m, a.p));
    out.push(sheet('clouds-near', 58, '#fffdf6', [[900, 560, 1.5], [2300, 690, 1.1], [3700, 600, 1.6], [4700, 540, 1.2], [1500, 760, .8]].map(([x, y, k]) => cloud(x, sy(y), k, '#fff')).join('')));
    // A pale ridge sweeping in from the right, then a nearer one with woods on part of it and a hamlet on its slope.
    const ridge = (top: number, amp: number, len: number, ph: number, fall: number) => { let d = `M0 ${SH}`; for (let x = 0; x <= SW; x += 26) d += `L${x} ${f(sy(top + amp * Math.sin(x / len + ph) + fall * (x / SW - 1)))}`; return `${d}L${SW} ${SH}Z`; };
    out.push(sheet('ridge-far', 78, '#b5dcc0', `<path d="${ridge(420, 34, 520, 2, 260)}" fill="#fff"/>`, Array.from({ length: 16 }, (_, i) => `<circle cx="${3200 + i * 120}" cy="${sy(330 + (i % 3) * 14)}" r="${18 + (i % 4) * 5}" fill="#9fcfae"/>`).join('')));
    const woods = crowns(SW, SH, sy(-160) - sy(292), 20, 34, [36, 64], [['#4f9e66', '#438c59'], ['#63b06f', '#4f9e66']], 0, 1900);
    const hamlet = homes(SW, SH, sy(-160) - sy(268), .6, [8, 44], '#93cf86', {}, 2500, 3300);
    out.push(sheet('ridge-near', 112, '#93cf86', `<path d="${ridge(300, 22, 400, .6, -40)}" fill="#fff"/>`, Array.from({ length: 9 }, (_, i) => `<path d="M${3500 + i * 150} ${sy(250 - (i % 2) * 20)}l90 -10l20 40l-100 8Z" fill="${i % 2 ? '#b9d98a' : '#a5cc7a'}"/>`).join('')));
    out.push(sheet('ridge-woods', 132, '#4f9e66', woods.m.replace(/<rect[^>]*>/, ''), woods.p.replace(/<rect[^>]*>/, '')), sheet('ridge-hamlet', 132, '#fff4e2', hamlet.m.replace(/<rect[^>]*>/, ''), hamlet.p.replace(/<rect[^>]*>/, '')));
  }
  return out;
}
