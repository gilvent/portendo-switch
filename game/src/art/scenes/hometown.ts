import { add, box, carved, on, unit, yaw, type Panel, type Scene, type V3 } from '../kit.ts';
import { CREAM, cloud } from '../recipes.ts';
import { bench, bicycle, bush, disc, fawning, fbox, fflat, fflowers, flamp, frame, piece, pigeon, planter, shadeTree, shopper, toCamera, tone, type Frame } from './promenade.ts';
import { streetLamp } from './street.ts';

// Moperty's hometown green. A handful of homes on offer stand shoulder to shoulder along the back of a green on a ridge.
// The green is the main space. The homes close the middle of the back; at both ends the ridge falls away and the valley
// is the open view, over a low wall. Nothing stands at the sides but trees. Nothing here is a screen: the flyer board
// lists the homes, and a home opens on its fold like a doll's house.
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
// The four homes on the green, left to right, close together: no way through between them.
const HOMES: Home[] = [
  { id: 'h1', x: -425, w: 230, wall: 250, peak: 92, c: WHITE, roof: INDIGO, door: INDIGO, offer: 'sale', storeys: 2, chimney: true },
  { id: 'h2', x: -150, w: 250, wall: 172, peak: 100, c: LAV, roof: tone(INDIGO, -.32), door: tone(INDIGO, -.32), offer: 'rent', storeys: 1 },
  { id: 'h3', x: 130, w: 240, wall: 250, peak: 92, c: STONE, roof: BRICK, door: BRICK, offer: 'sale', storeys: 2 },
  { id: 'h4', x: 400, w: 230, wall: 172, peak: 96, c: WHITE, roof: TILE, door: TILE, offer: 'rent', storeys: 1, chimney: true }];

/* ---------- ground: the green's paving and the grass behind it ---------- */
function ground(): Panel[] {
  const W = X1 - X0, D = FRONT - GARDEN, SETT = ['#f1e4cc', '#f6ecd8', '#e9dabd', '#f3e7d0'];
  let setts = '';
  for (let row = 0, y = 0; y < D; row++, y += 40) for (let x = row % 2 ? -32 : 0; x < W; x += 64) { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; setts += `<rect x="${x + 1}" y="${y + 1}" width="62" height="38" fill="${SETT[Math.floor((h - Math.floor(h)) * 4)]}"/>`; }
  // A ring of darker setts marks the middle of the square, around the clock.
  const ring = `<ellipse cx="${-X0}" cy="${170 - GARDEN}" rx="210" ry="120" fill="none" stroke="#d6c4a2" stroke-width="20"/><ellipse cx="${-X0}" cy="${170 - GARDEN}" rx="150" ry="84" fill="#e6d6b8"/>`;
  // Both sheets ship as sixteen tiles: the camera here leans in close, and with wider tiles the browser's 3D sorting tears
  // holes in the ground where standing pieces' planes cut across it.
  const square: Panel = { id: 'square', stock: 'greyboard', c: '#e2d3b6', w: W, h: D, o: [X0, 0, FRONT], u: [1, 0, 0], v: [0, 0, -1], density: .42, edge: 'fold', split: 16, print: `<rect width="${W}" height="${D}" fill="#dccdb0"/>${setts}${ring}<rect y="${D - 14}" width="${W}" height="14" fill="#cdb48c"/>` };
  // The grass behind: the homes' gardens in the middle, open verge at both ends, and a path from each gate to its door.
  const GD = GARDEN - BACK;
  const paths = HOMES.map(h => `<rect x="${h.x - X0 - 22}" y="${GD - (GARDEN - HZ)}" width="44" height="${GARDEN - HZ}" fill="#e9dabd"/>${[0, 1, 2].map(k => `<rect x="${h.x - X0 - 18}" y="${GD - 28 - k * 30}" width="36" height="22" rx="4" fill="#f6ecd8"/>`).join('')}`).join('');
  const beds = HOMES.map(h => `<ellipse cx="${h.x - X0 - h.w * .32}" cy="${GD - 40}" rx="34" ry="16" fill="#8fc48a"/><ellipse cx="${h.x - X0 + h.w * .32}" cy="${GD - 40}" rx="34" ry="16" fill="#8fc48a"/>`).join('');
  const garden: Panel = { id: 'garden', stock: 'sugar', c: GRASS, w: W, h: GD, o: [X0, 0, GARDEN], u: [1, 0, 0], v: [0, 0, -1], density: .5, edge: 'fold', split: 16,
    print: `<rect width="${W}" height="${GD}" fill="${GRASS}"/>${paths}${beds}` };
  const skirt: Panel = { id: 'square-skirt', stock: 'greyboard', c: '#9a8566', w: W, h: 50, o: [X0, -50, FRONT + 1], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2, print: `<rect width="${W}" height="8" fill="#cdb48c"/>` };
  return [square, garden, skirt];
}

/* ---------- the open view at both ends of the green: a shadow box ---------- */
// Thin cut layers stood well apart, alternating pale and deep, each shading the next; real in the bake, then flattened
// onto two cards. Card one is the lower town just below the square. Card two, further back, is the valley floor and the
// far bank and the hills.
type Card = { id: string; x0: number; z: number; w: number; density: number };
const NEAR: Card = { id: 'lane-near', x0: -1900, z: -480, w: 3800, density: .95 };
const FAR: Card = { id: 'lane-far', x0: -2200, z: -740, w: 4400, density: .6 };
const sheet = (card: Card, id: string, gap: number, y0: number, h: number, c: string, mask: string, print = '', stock: Panel['stock'] = 'sugar'): Panel =>
  ({ id, stock, c, w: card.w, h, o: [card.x0, y0, card.z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: card.density, decal: card.id, mask, print });
/* The landscape kit. Every layer of the view is one cut sheet whose top edge is a profile: a height above the sheet's
   foot for each x. Layers differ in kind, not only in colour: faceted peaks, hills that sweep up from one side, rounded
   mounds, rolling bands. Detail is cut from lighter and darker tones of the sheet's own colour. */
type Prof = (x: number) => number;
const clamp = (u: number) => Math.min(1, Math.max(0, u)), ease = (u: number) => u * u * (3 - 2 * u);
const rolling = (hi: number, amp: number, len: number, ph: number): Prof => x => hi + amp * (.55 * Math.sin(x / len + ph) + .3 * Math.sin(x / len * 1.9 + ph * 2) + .15 * Math.sin(x / len * 3.3 + ph * 3));
const sweep = (x0: number, x1: number, lo: number, hi: number, dir: 1 | -1, ph = 0): Prof => x => lo + (hi - lo) * ease(clamp(dir > 0 ? (x1 - x) / (x1 - x0) : (x - x0) / (x1 - x0))) + 7 * Math.sin(x / 90 + ph);
const mound = (cx: number, hw: number, lo: number, hi: number): Prof => x => lo + (hi - lo) * Math.cos(clamp(Math.abs(x - cx) / hw) * Math.PI / 2) ** 1.5 + 5 * Math.sin(x / 70);
type Peak = { x: number; h: number; s: number };
const range = (pk: Peak[], floor: number): Prof => x => pk.reduce((y, p) => Math.max(y, p.h - Math.abs(x - p.x) * p.s), floor);
const both = (a: Prof, b: Prof): Prof => x => Math.max(a(x), b(x));
const line = (W: number, H: number, p: Prof, drop = 0, step = 12) => { let d = ''; for (let x = 0; x <= W; x += step) d += `${x ? 'L' : 'M'}${x} ${f(H - p(x) + drop)}`; return d; };
const cut = (W: number, H: number, p: Prof) => `<path d="${line(W, H, p)}V${H}H0Z" fill="#fff"/>`;
// The sheet's own detail: a pale strip along the crest where the light catches the cut edge, and darker contour lines
// below it, the way stacked card reads.
const crest = (W: number, H: number, p: Prof, c: string, contours = 2) => `<path d="${line(W, H, p, 5)}" stroke="${tone(c, .28)}" stroke-width="7" fill="none"/>` +
  Array.from({ length: contours }, (_, i) => `<path d="${line(W, H, x => p(x) * (1 - (i + 1) * .26), 0)}" stroke="${tone(c, -.07)}" stroke-width="3" fill="none"/>`).join('');
// A field: a patch of ploughed stripes lying on a slope.
const field = (x: number, y: number, w: number, h: number, skew: number, a: string, b: string) => `<g transform="translate(${f(x)} ${f(y)}) skewX(${skew})"><rect width="${f(w)}" height="${f(h)}" fill="${a}"/>${Array.from({ length: Math.floor(w / 9) }, (_, i) => `<rect x="${i * 9 + 2}" width="3.4" height="${f(h)}" fill="${b}"/>`).join('')}</g>`;
type Art = { m: string; p: string };
const none: Art = { m: '', p: '' }, join = (a: Art[]): Art => ({ m: a.map(q => q.m).join(''), p: a.map(q => q.p).join('') });
const shape = (d: string, c: string): Art => ({ m: `<path d="${d}" fill="#fff"/>`, p: `<path d="${d}" fill="${c}"/>` });
// Three trees, each cut in two tones: the lit side lighter.
function pine(x: number, base: number, h: number, c: string): Art {
  const w = h * .46, t = h / 3.4; let full = `M${f(x - w * .08)} ${f(base)}V${f(base - t * .4)}`, half = `M${f(x)} ${f(base - t * .4)}`;
  for (let k = 0; k < 3; k++) { const hw = w / 2 * (1 - k * .22), y = base - t * .4 - k * t; full += `L${f(x - hw)} ${f(y)}L${f(x - hw * .36)} ${f(y - t)}`; half += `L${f(x - hw)} ${f(y)}L${f(x - hw * .36)} ${f(y - t)}`; }
  full += `L${f(x)} ${f(base - h)}`; half += `L${f(x)} ${f(base - h)}Z`;
  for (let k = 2; k >= 0; k--) { const hw = w / 2 * (1 - k * .22), y = base - t * .4 - k * t; full += `L${f(x + hw * .36)} ${f(y - t)}L${f(x + hw)} ${f(y)}`; }
  full += `L${f(x + w * .08)} ${f(base - t * .4)}V${f(base)}Z`;
  return { m: `<path d="${full}" fill="#fff"/>`, p: `<path d="${full}" fill="${c}"/><path d="${half}" fill="${tone(c, .16)}"/>` };
}
function oak(x: number, base: number, h: number, c: string): Art {
  const R = h * .36, cy = base - h + R, blobs: [number, number, number][] = [[0, 0, R], [R * .8, R * .34, R * .72], [-R * .76, R * .4, R * .66]];
  const m = blobs.map(([dx, dy, rr]) => `<circle cx="${f(x + dx)}" cy="${f(cy + dy)}" r="${f(rr)}" fill="#fff"/>`).join('') + `<rect x="${f(x - R * .12)}" y="${f(cy)}" width="${f(R * .24)}" height="${f(base - cy)}" fill="#fff"/>`;
  const p = `<rect x="${f(x - R * .12)}" y="${f(cy)}" width="${f(R * .24)}" height="${f(base - cy)}" fill="#7a5c42"/>` + blobs.map(([dx, dy, rr], i) => `<circle cx="${f(x + dx)}" cy="${f(cy + dy)}" r="${f(rr)}" fill="${[c, tone(c, -.12), tone(c, -.05)][i]}"/>`).join('') + `<circle cx="${f(x - R * .28)}" cy="${f(cy - R * .26)}" r="${f(R * .46)}" fill="${tone(c, .18)}"/>`;
  return { m, p };
}
function poplar(x: number, base: number, h: number, c: string): Art {
  const rx = h * .13, e = `cx="${f(x)}" cy="${f(base - h * .56)}" rx="${f(rx)}" ry="${f(h * .46)}"`;
  return { m: `<ellipse ${e} fill="#fff"/><rect x="${f(x - 1.5)}" y="${f(base - h * .2)}" width="3" height="${f(h * .2)}" fill="#fff"/>`, p: `<rect x="${f(x - 1.5)}" y="${f(base - h * .2)}" width="3" height="${f(h * .2)}" fill="#7a5c42"/><ellipse ${e} fill="${c}"/><ellipse cx="${f(x - rx * .3)}" cy="${f(base - h * .6)}" rx="${f(rx * .5)}" ry="${f(h * .36)}" fill="${tone(c, .16)}"/>` };
}
const TREES = { pine, oak, poplar };
// A treeline on its own sheet: trees standing on the crest of the hill in front of it, in a value that contrasts with that
// hill. `runs` are [from, to] stretches, so a wood covers only part of a ridge.
function woods(W: number, H: number, ground: Prof, runs: [number, number][], kinds: (keyof typeof TREES)[], cols: string[], lo: number, hi: number, every: number): Art {
  const all: Art[] = [];
  for (const [a, b] of runs) for (let x = a + r(0, every); x < b; x += r(every * .6, every * 1.3)) { const h = r(lo, hi); all.push(TREES[pick(kinds)](x, H - ground(x) + h * .16, h, pick(cols))); }
  return join(all);
}
// One building, drawn standing on `base`. Roofs, chimneys, dormers, shutters and doors vary, so a row is a street, not a
// repeat.
function building(x: number, base: number, w: number, h: number, c: string, roofC: string, win: string, detail = 1): Art {
  const kind = pick(['gable', 'gable', 'hip', 'side', 'flat']), top = base - h, pk = kind === 'flat' ? 5 : w * r(.3, .44), out: Art[] = [];
  out.push({ m: `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" fill="#fff"/>`, p: `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" fill="${c}"/><rect x="${f(x + w * .62)}" y="${f(top)}" width="${f(w * .38)}" height="${f(h)}" fill="${tone(c, -.07)}"/><rect x="${f(x)}" y="${f(base - 5)}" width="${f(w)}" height="5" fill="${tone(c, -.2)}"/>` });
  if (r(0, 1) < .5) { const cx = x + w * r(.18, .78), ch = pk * r(.7, 1.1) + 8; out.push({ m: `<rect x="${f(cx)}" y="${f(top - ch)}" width="8" height="${f(ch)}" fill="#fff"/>`, p: `<rect x="${f(cx)}" y="${f(top - ch)}" width="8" height="${f(ch)}" fill="${tone(roofC, -.25)}"/><rect x="${f(cx - 1.5)}" y="${f(top - ch)}" width="11" height="3" fill="${tone(roofC, .3)}"/>` }); }
  const roof = kind === 'gable' ? `M${f(x - 5)} ${f(top)}L${f(x + w / 2)} ${f(top - pk)}L${f(x + w + 5)} ${f(top)}Z`
    : kind === 'hip' ? `M${f(x - 5)} ${f(top)}L${f(x + w * .22)} ${f(top - pk * .7)}H${f(x + w * .78)}L${f(x + w + 5)} ${f(top)}Z`
      : kind === 'side' ? `M${f(x - 5)} ${f(top)}L${f(x + 2)} ${f(top - pk * .62)}H${f(x + w - 2)}L${f(x + w + 5)} ${f(top)}Z` : `M${f(x - 3)} ${f(top)}V${f(top - 6)}H${f(x + w + 3)}V${f(top)}Z`;
  out.push({ m: `<path d="${roof}" fill="#fff"/>`, p: `<path d="${roof}" fill="${roofC}"/>` + (kind === 'side' || kind === 'hip' ? Array.from({ length: 3 }, (_, i) => `<path d="M${f(x)} ${f(top - pk * .16 * (i + 1))}H${f(x + w)}" stroke="${tone(roofC, -.14)}" stroke-width="1.6"/>`).join('') : '') + (kind === 'gable' ? `<path d="M${f(x + w / 2)} ${f(top - pk)}L${f(x + w + 5)} ${f(top)}H${f(x + w * .62)}Z" fill="${tone(roofC, -.12)}"/>` : '') });
  if (kind === 'side' && detail > .5 && w > 60) { const dx = x + w * .5 - 9; out.push({ m: `<path d="M${f(dx - 2)} ${f(top - pk * .2)}L${f(dx + 9)} ${f(top - pk * .2 - 14)}L${f(dx + 20)} ${f(top - pk * .2)}Z" fill="#fff"/>`, p: `<rect x="${f(dx)}" y="${f(top - pk * .2 - 4)}" width="18" height="${f(pk * .2 + 2)}" fill="${c}"/><path d="M${f(dx - 2)} ${f(top - pk * .2)}L${f(dx + 9)} ${f(top - pk * .2 - 14)}L${f(dx + 20)} ${f(top - pk * .2)}Z" fill="${tone(roofC, -.1)}"/><rect x="${f(dx + 5)}" y="${f(top - pk * .2 - 2)}" width="8" height="8" fill="${LIT}"/>` }); }
  const cols = Math.max(1, Math.floor((w - 12) / 26)), rows = Math.max(1, Math.floor((h - 26) / 30)), sx = (w - cols * 13) / (cols + 1); let p = '';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const wx = x + sx + i * (13 + sx), wy = top + 9 + j * 30;
    if (j === rows - 1 && i === Math.floor(cols / 2)) { p += `<rect x="${f(wx - 1)}" y="${f(base - 24)}" width="15" height="24" fill="${tone(roofC, -.15)}"/><rect x="${f(wx + 2)}" y="${f(base - 21)}" width="9" height="6" fill="${LIT}"/>`; continue; }
    p += `<rect x="${f(wx - 1.5)}" y="${f(wy - 1.5)}" width="16" height="19" fill="${tone(c, .5)}"/><rect x="${f(wx)}" y="${f(wy)}" width="13" height="16" fill="${r(0, 1) > .62 ? LIT : win}"/>`;
    if (detail > .5 && r(0, 1) < .35) p += `<rect x="${f(wx - 6)}" y="${f(wy)}" width="4.5" height="16" fill="${tone(roofC, .1)}"/><rect x="${f(wx + 14.5)}" y="${f(wy)}" width="4.5" height="16" fill="${tone(roofC, .1)}"/>`;
    if (detail > .5 && r(0, 1) < .25) p += `<rect x="${f(wx - 2)}" y="${f(wy + 16)}" width="17" height="4" fill="#c8915a"/><circle cx="${f(wx + 3)}" cy="${f(wy + 15)}" r="2.6" fill="#e8552d"/><circle cx="${f(wx + 10)}" cy="${f(wy + 15)}" r="2.6" fill="${YEL}"/>`;
  }
  out.push({ m: '', p });
  return join(out);
}
// A street of buildings on one sheet, with something between some of them: a tree, a clock tower, a washing line.
function street(W: number, H: number, lo: number, hi: number, minW: number, maxW: number, cols: string[], roofs: string[], win: string, breaks: number, detail: number, extras: ('oak' | 'poplar' | 'tower' | 'line')[] = []): Art {
  const all: Art[] = [];
  for (let x = r(-20, 10); x < W;) {
    const bw = r(minW, maxW), bh = r(lo, hi);
    all.push(building(x, H, bw, bh, pick(cols), pick(roofs), win, detail)); x += bw;
    if (r(0, 1) < breaks) {
      const gap = r(30, 80), k = extras.length ? pick(extras) : null;
      if (k === 'oak') all.push(oak(x + gap / 2, H, r(lo * .7, lo * 1.1), pick(['#4aa067', '#3f8f5a', '#5fb07a'])));
      else if (k === 'poplar') all.push(poplar(x + gap / 2, H, r(hi * .9, hi * 1.3), '#3f8f5a'));
      else if (k === 'tower') { const tw = 30, th = hi * 1.5, tx = x + gap / 2 - tw / 2; all.push({ m: `<rect x="${f(tx)}" y="${f(H - th)}" width="${tw}" height="${f(th)}" fill="#fff"/><path d="M${f(tx - 4)} ${f(H - th)}L${f(tx + tw / 2)} ${f(H - th - 34)}L${f(tx + tw + 4)} ${f(H - th)}Z" fill="#fff"/>`, p: `<rect x="${f(tx)}" y="${f(H - th)}" width="${tw}" height="${f(th)}" fill="#f4ead8"/><rect x="${f(tx + tw * .62)}" y="${f(H - th)}" width="${f(tw * .38)}" height="${f(th)}" fill="#e2d5bb"/><path d="M${f(tx - 4)} ${f(H - th)}L${f(tx + tw / 2)} ${f(H - th - 34)}L${f(tx + tw + 4)} ${f(H - th)}Z" fill="${INDIGO}"/><circle cx="${f(tx + tw / 2)}" cy="${f(H - th + 18)}" r="9" fill="#fff"/><path d="M${f(tx + tw / 2)} ${f(H - th + 18)}v-6M${f(tx + tw / 2)} ${f(H - th + 18)}h4" stroke="${STEEL}" stroke-width="1.6"/><rect x="${f(tx + 9)}" y="${f(H - th + 40)}" width="12" height="18" fill="${GLASS}"/>` }); }
      else if (k === 'line') all.push({ m: `<rect x="${f(x + 4)}" y="${f(H - lo * .7)}" width="3" height="${f(lo * .7)}" fill="#fff"/><rect x="${f(x + gap - 7)}" y="${f(H - lo * .7)}" width="3" height="${f(lo * .7)}" fill="#fff"/><rect x="${f(x + 4)}" y="${f(H - lo * .7)}" width="${f(gap - 8)}" height="2" fill="#fff"/>${[0, 1, 2].map(i => `<rect x="${f(x + 10 + i * (gap - 24) / 3)}" y="${f(H - lo * .7 + 2)}" width="${f((gap - 30) / 3)}" height="${14 + (i % 2) * 6}" fill="#fff"/>`).join('')}`, p: `<rect x="${f(x + 4)}" y="${f(H - lo * .7)}" width="${f(gap - 8)}" height="${f(lo * .7)}" fill="#7a5c42"/>${[0, 1, 2].map(i => `<rect x="${f(x + 10 + i * (gap - 24) / 3)}" y="${f(H - lo * .7 + 2)}" width="${f((gap - 30) / 3)}" height="${14 + (i % 2) * 6}" fill="${[WHITE, LAV, YEL][i]}"/>`).join('')}` });
      x += gap;
    } else x += r(2, 8);
  }
  return join(all);
}
// A clump of tiny roofs for a far hillside village.
const hamlet = (x: number, y: number, n: number): string => Array.from({ length: n }, () => { const hx = x + r(-60, 60), hy = y + r(-16, 16), k = r(.8, 1.3); return `<g transform="translate(${f(hx)} ${f(hy)}) scale(${f(k)})"><rect width="18" height="12" fill="${pick([WHITE, '#f0dcc0', LAV, '#fff'])}"/><rect x="11" width="7" height="12" fill="#00000014"/><path d="M-3 0L9 -9L21 0Z" fill="${pick([BRICK, INDIGO, TILE])}"/><rect x="3" y="4" width="4" height="4" fill="${LIT}"/></g>`; }).join('');

function laneView(): Panel[] {
  s = 29;
  const y0 = -70, W = NEAR.w, mid = W / 2;
  // Card one, the lower town just below the square, back to front. Five layers, 26 to 36 units apart.
  // 1. The back street: taller houses, a clock tower, poplars.
  const LH = 200, back = street(W, LH, 100, 176, 70, 124, ['#f4ead8', STONE, '#e8c9a8', LAV, WHITE, '#d9e6f2'], [INDIGO, BRICK, TILE, tone(INDIGO, -.3), '#8a6a5c'], '#7c7f9c', .32, 1, ['poplar', 'tower', 'oak']);
  const card: Panel = { id: NEAR.id, stock: 'sugar', c: STONE, w: W, h: LH, o: [NEAR.x0, y0 - 50, NEAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: NEAR.density, split: 2, mask: back.m, print: back.p };
  // 2. Garden trees between the two streets, a deep green against the pale houses behind.
  const TH = 190, flat: Prof = () => 20, trees = woods(W, TH, flat, [[0, W]], ['oak', 'oak', 'pine', 'poplar'], ['#3f8f5a', '#347a4b', '#4aa067'], 96, 150, 78);
  // 3. The near street: cottages with shutters, flower boxes and washing lines.
  const CH = 150, near = street(W, CH, 64, 104, 84, 140, [WHITE, '#f0dcc0', '#e3b9a8', '#d9e6f2', LAV], [TILE, BRICK, INDIGO, '#8a6a5c'], GLASS, .5, 1, ['line', 'oak', 'line']);
  // 4. Back gardens: a clipped hedge with fruit trees and bean poles standing out of it.
  const GH = 118; let gm = `<rect y="${GH - 30}" width="${W}" height="30" fill="#fff"/>`, gp = '';
  for (let x = 0; x < W; x += 40) { gm += `<circle cx="${x + 20}" cy="${GH - 32}" r="24" fill="#fff"/>`; gp += `<circle cx="${x + 20}" cy="${GH - 32}" r="24" fill="${x % 80 ? '#7fbf86' : '#8fc994'}"/><circle cx="${x + 12}" cy="${GH - 40}" r="10" fill="#a3d6a3"/>`; }
  const orchard = woods(W, GH, () => 30, [[0, W]], ['oak'], ['#5fb07a', '#6fbf86'], 60, 84, 150);
  // 5. The wall along the back of the green: coursed stone with a coping, flowers growing along its top, a pier every so often.
  const WH = 96;
  let wm = `<rect y="${WH - 46}" width="${W}" height="46" fill="#fff"/>`, wp = `<rect y="${WH - 46}" width="${W}" height="46" fill="#cfc2aa"/><rect y="${WH - 46}" width="${W}" height="7" fill="#e6dccb"/>`;
  for (let row = 0; row < 3; row++) for (let x = row % 2 ? -18 : 0; x < W; x += 36) wp += `<rect x="${x + 1}" y="${WH - 38 + row * 13}" width="34" height="11" fill="${pick(['#c6b89e', '#d6c9b0', '#bfb096'])}"/>`;
  for (let x = 14; x < W; x += r(22, 60)) { wm += `<circle cx="${f(x)}" cy="${WH - 50}" r="6" fill="#fff"/>`; wp += `<circle cx="${f(x)}" cy="${WH - 50}" r="6" fill="${pick(['#e8552d', YEL, '#e88ab0', WHITE])}"/><rect x="${f(x - 1)}" y="${WH - 46}" width="2" height="6" fill="#4aa067"/>`; }
  for (let gx = 120; gx < W; gx += 420) { wm += `<rect x="${gx}" y="14" width="18" height="${WH - 14}" fill="#fff"/><circle cx="${gx + 9}" cy="12" r="11" fill="#fff"/>`; wp += `<rect x="${gx}" y="14" width="18" height="${WH - 14}" fill="#e6dccb"/><rect x="${gx + 12}" y="14" width="6" height="${WH - 14}" fill="#d3c7b2"/><circle cx="${gx + 9}" cy="12" r="11" fill="#fff4e2"/>`; }

  // Card two, the valley, back to front. Nine layers, 30 to 50 units apart, alternating pale and deep. There is no water
  // in it: the Blibli street already has the river.
  s = 67;
  const FW = FAR.w, fy = -90, fmid = FW / 2;
  // 1. A pale hill of terraced fields.
  const AH = 620, a: Prof = rolling(556, 34, 260, .4);
  const far: Panel = { id: FAR.id, stock: 'sugar', c: '#c9dfb6', w: FW, h: AH, o: [FAR.x0, fy, FAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FAR.density, split: 2, mask: cut(FW, AH, a),
    print: crest(FW, AH, a, '#c9dfb6', 3) + Array.from({ length: 22 }, (_, i) => field(40 + i * 166 + r(-20, 20), AH - a(40 + i * 166) + r(26, 70), r(70, 120), r(26, 44), pick([-24, -14, 16, 26]), pick(['#b6d39e', '#d6e6b8', '#e6dca0']), pick(['#a3c48c', '#c6d9a6', '#d6ca8a']))).join('') };
  // 2. A wood on the next ridge, standing behind it.
  const BHh = 550, b: Prof = sweep(0, FW * .62, 400, 520, 1, 1);
  const wood1 = woods(FW, BHh + 60, b, [[0, FW * .34], [FW * .46, FW * .6]], ['pine', 'pine', 'oak'], ['#2f7453', '#3a8460', '#286a4a'], 50, 84, 36);
  // 3. That ridge: a deep hill sweeping up to the left, with a hamlet on its shoulder.
  const ridgeArt = crest(FW, BHh, b, '#5fa77a') + hamlet(FW * .2, BHh - b(FW * .2) + 46, 7) + hamlet(FW * .42, BHh - b(FW * .42) + 40, 5);
  // 4. A bright hill sweeping up to the right, with orchards in rows and a road winding over it.
  const CHh = 480, c2: Prof = sweep(FW * .3, FW, 330, 450, -1, 2);
  let orch = ''; for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { const ox = FW * .62 + i * 54 + j * 16, oy = CHh - c2(ox) + 30 + j * 24; orch += `<circle cx="${f(ox)}" cy="${f(oy)}" r="9" fill="#5fa77a"/><circle cx="${f(ox - 3)}" cy="${f(oy - 3)}" r="4" fill="#86c494"/>`; }
  let rd = ''; for (let k = 0; k <= 40; k++) { const t = k / 40, x = FW * (.5 + .46 * t) + 60 * Math.sin(t * 9); rd += `${k ? 'L' : 'M'}${f(x)} ${f(CHh - c2(x) * (.5 + .5 * t) + 8)}`; }
  const road = `<path d="${rd}" stroke="#f4ead8" stroke-width="9" fill="none" stroke-linejoin="round"/>`;
  // 5. The far bank's town: a street of houses with towers and poplars.
  const DH = 220, town = street(FW, DH, 54, 110, 46, 88, ['#f4ead8', STONE, '#e8c9a8', WHITE, LAV], [BRICK, TILE, INDIGO, '#8a6a5c'], '#7c7f9c', .3, .4, ['poplar', 'tower', 'oak', 'oak']);
  // 6. An avenue of poplars along the road below the town, on a low green bank, with telegraph poles between them.
  const VH = 300, bank: Prof = rolling(250, 5, 140, 2.2), avenue = woods(FW, VH + 110, bank, [[0, FW]], ['poplar', 'poplar', 'oak'], ['#3f8f5a', '#347a4b', '#4aa067'], 70, 104, 58);
  let pm = '', pp = ''; for (let x = 40; x < FW; x += 190) { const y = VH + 110 - bank(x) - 74; pm += `<rect x="${x}" y="${f(y)}" width="4" height="80" fill="#fff"/><rect x="${x - 12}" y="${f(y + 6)}" width="28" height="3" fill="#fff"/>`; pp += `<rect x="${x}" y="${f(y)}" width="4" height="80" fill="#7a5c42"/><rect x="${x - 12}" y="${f(y + 6)}" width="28" height="3" fill="#7a5c42"/>`; }
  // 7. Farmland on the valley floor: a deep band patched with ploughed fields, hedgerow trees, barns and a silo on its crest.
  const GHh = 250, farm: Prof = rolling(238, 9, 120, 1.7), farmTrees = woods(FW, GHh + 90, farm, [[0, fmid - 500], [fmid - 260, fmid + 200], [fmid + 520, FW]], ['oak', 'oak', 'poplar'], ['#3f8f5a', '#4aa067', '#347a4b'], 40, 64, 70);
  const barns: Art[] = [fmid - 380, fmid + 360, fmid + 1100, fmid - 1200].map((x, i) => join([building(x, GHh + 90 - farm(x) + 6, 70, 44, ['#c8553d', WHITE, '#c8553d', STONE][i], [STEEL, BRICK, '#5d4a3c', TILE][i], '#5d4a3c', 0),
    i % 2 ? none : { m: `<rect x="${f(x + 76)}" y="${f(GHh + 90 - farm(x) - 62)}" width="22" height="70" fill="#fff"/><circle cx="${f(x + 87)}" cy="${f(GHh + 90 - farm(x) - 62)}" r="11" fill="#fff"/>`, p: `<rect x="${f(x + 76)}" y="${f(GHh + 90 - farm(x) - 62)}" width="22" height="70" fill="#d9dde6"/><rect x="${f(x + 90)}" y="${f(GHh + 90 - farm(x) - 62)}" width="8" height="70" fill="#b7bfc7"/><circle cx="${f(x + 87)}" cy="${f(GHh + 90 - farm(x) - 62)}" r="11" fill="#c9d0d6"/>` }]));
  const farmTop = join([farmTrees, ...barns]);
  const patches = Array.from({ length: 26 }, (_, i) => { const x = 30 + i * 138 + r(-16, 16); return field(x, GHh + 90 - farm(x) + r(22, 70), r(80, 130), r(30, 50), pick([-26, -14, 14, 26]), pick(['#e6d48a', '#8fc47a', '#d6c06a', '#a9d68f', '#c98a5a']), pick(['#d6c06a', '#7fb46a', '#c4ad58', '#96c67c', '#b5774a'])); }).join('');
  const hay = Array.from({ length: 30 }, () => { const x = r(0, FW), y = GHh + 90 - farm(x) + r(30, 110); return `<path d="M${f(x - 7)} ${f(y)}a7 8 0 0 1 14 0Z" fill="#e6c860"/><path d="M${f(x - 7)} ${f(y)}a7 8 0 0 1 7 -8Z" fill="#f2dc86"/>`; }).join('');
  // 8. A pale meadow in front: allotment strips, a lane with a bus on it, sheep, and a post-and-rail fence along its crest.
  const MH = 214, mead: Prof = rolling(200, 6, 90, .6);
  let fm = '', fp = ''; for (let x = 6; x < FW; x += 34) { fm += `<rect x="${x}" y="${f(MH + 16 - mead(x) - 14)}" width="4" height="16" fill="#fff"/>`; fp += `<rect x="${x}" y="${f(MH + 16 - mead(x) - 14)}" width="4" height="16" fill="#f4ead8"/>`; }
  const rails = [4, 10].map(d => `<path d="${line(FW, MH + 16, mead, -d)}" stroke="#f4ead8" stroke-width="2.6" fill="none"/>`).join('');
  const railsM = [4, 10].map(d => `<path d="${line(FW, MH + 16, mead, -d)}" stroke="#fff" stroke-width="2.6" fill="none"/>`).join('');
  const sheep = Array.from({ length: 22 }, () => { const x = r(0, FW), y = MH + 16 - mead(x) + r(26, 80); return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="8" ry="5.4" fill="#fdfcf6"/><circle cx="${f(x + 7)}" cy="${f(y - 2)}" r="3" fill="${STEEL}"/><rect x="${f(x - 5)}" y="${f(y + 4)}" width="2" height="4" fill="${STEEL}"/><rect x="${f(x + 3)}" y="${f(y + 4)}" width="2" height="4" fill="${STEEL}"/>`; }).join('');
  const plots = Array.from({ length: 14 }, (_, i) => field(120 + i * 250 + r(-30, 30), MH + 16 - mead(120 + i * 250) + r(70, 110), r(90, 140), r(34, 50), pick([-18, 12, 20]), pick(['#b9d98a', '#e2dc9c', '#a3cf7c']), pick(['#a3c878', '#cfc884', '#8fbf6a']))).join('');
  const bus = `<g transform="translate(${fmid + 240} ${MH + 16 - mead(fmid + 240) + 96})"><rect width="76" height="30" rx="5" fill="${YEL}"/><rect y="19" width="76" height="4" fill="${WHITE}"/>${[0, 1, 2, 3].map(k => `<rect x="${6 + k * 17}" y="5" width="13" height="10" fill="${GLASS}"/>`).join('')}<circle cx="16" cy="30" r="6" fill="${STEEL}"/><circle cx="60" cy="30" r="6" fill="${STEEL}"/></g>`;
  let ln = ''; for (let x = 0; x <= FW; x += 40) ln += `${x ? 'L' : 'M'}${x} ${f(MH + 16 - mead(x) + 124 + 10 * Math.sin(x / 150))}`;
  return [card, sheet(NEAR, 'lane-trees', 30, y0 - 40, TH, '#3f8f5a', trees.m, trees.p), sheet(NEAR, 'lane-cottages', 62, y0 - 30, CH, WHITE, near.m, near.p),
    sheet(NEAR, 'lane-gardens', 96, y0 - 10, GH, '#7fbf86', gm + orchard.m, gp + orchard.p), sheet(NEAR, 'lane-wall', 128, y0, WH, '#cfc2aa', wm, wp, 'greyboard'),
    far, sheet(FAR, 'lane-wood', 36, fy, BHh + 60, '#2f7453', wood1.m, wood1.p), sheet(FAR, 'lane-ridge', 52, fy, BHh, '#5fa77a', cut(FW, BHh, b), ridgeArt),
    sheet(FAR, 'lane-orchard', 92, fy, CHh, '#a9d68f', cut(FW, CHh, c2), crest(FW, CHh, c2, '#a9d68f') + orch + road),
    sheet(FAR, 'lane-town', 126, 140, DH, STONE, town.m, town.p),
    sheet(FAR, 'lane-avenue', 164, fy, VH + 110, '#5fa77a', cut(FW, VH + 110, bank) + avenue.m + pm, crest(FW, VH + 110, bank, '#5fa77a', 0) + avenue.p + pp),
    sheet(FAR, 'lane-farm', 200, fy, GHh + 90, '#6fae6a', cut(FW, GHh + 90, farm) + farmTop.m, crest(FW, GHh + 90, farm, '#6fae6a', 0) + patches + hay + farmTop.p),
    sheet(FAR, 'lane-meadow', 232, fy, MH + 16, '#cfe6a8', cut(FW, MH + 16, mead) + fm + railsM, crest(FW, MH + 16, mead, '#cfe6a8', 0) + plots + `<path d="${ln}" stroke="#f4ead8" stroke-width="12" fill="none"/>` + bus + sheep + fp + rails)];
}
// The far distance, in the CSS backdrop: sky, a pale sun, two layers of cut clouds, then seven layers of land from snowy
// peaks down to the wooded hills behind the valley. Kinds and values alternate, and each wood is its own sheet behind its
// hill. Only world heights of about 350 to 800 show above the homes.
function backdrop(): Panel[] {
  s = 13;
  const D = .72, z = -780, BW = 4400, bx0 = -2080;
  const gulls = [[2180, 560, 1.2], [2215, 542, 1], [2245, 570, .9], [3420, 620, 1], [3450, 606, .8], [900, 640, 1], [930, 626, .8]].map(([x, y, k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 6Q6 0 12 6Q18 0 24 6Q18 3 12 9Q6 3 0 6Z" fill="#fdfcf8"/>`).join('');
  const land = (id: string, gap: number, h: number, c: string, mask: string, print = ''): Panel => ({ id, stock: 'sugar', c, w: BW, h, o: [bx0, 0, z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: D, decal: 'sky', mask, print });
  const clouds = (id: string, gap: number, c: string, at: number[][]): Panel => ({ id, stock: 'sugar', c, w: 5200, h: 1500, o: [-2480, -160, z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: D, decal: 'sky', mask: at.map(([x, y, k]) => cloud(x, y, k, '#fff')).join('') });
  // Faceted peaks: each a lit face and a shaded face, the tall ones capped with snow cut in a zigzag.
  const peaksArt = (H: number, pk: Peak[], floor: number, c: string, snowAt: number) => pk.map(p => {
    const run = (p.h - floor) / p.s, tx = p.x, ty = H - p.h;
    let out = `<path d="M${f(tx)} ${f(ty)}L${f(tx + run)} ${f(H - floor)}H${f(tx + run * .22)}Z" fill="${tone(c, -.1)}"/><path d="M${f(tx)} ${f(ty)}L${f(tx - run * .5)} ${f(ty + run * .5 * p.s)}L${f(tx - run * .12)} ${f(H - floor)}H${f(tx + run * .22)}Z" fill="${tone(c, .2)}"/>`;
    if (p.h > snowAt) { const d = (p.h - snowAt) * .8, wL = d / p.s; let zig = `M${f(tx)} ${f(ty - 2)}L${f(tx + wL)} ${f(ty + d)}`; for (let i = 1; i <= 6; i++) zig += `L${f(tx + wL - i * wL / 3)} ${f(ty + d + (i % 2 ? -d * .26 : d * .1))}`; out += `<path d="${zig}Z" fill="#fdfdf8"/><path d="M${f(tx)} ${f(ty - 2)}L${f(tx + wL)} ${f(ty + d)}L${f(tx + wL * .3)} ${f(ty + d * .8)}Z" fill="#dbe8ee"/>`; }
    return out;
  }).join('');
  const mk = (n: number, x0: number, x1: number, lo: number, hi: number, sl: number): Peak[] => Array.from({ length: n }, (_, i) => ({ x: x0 + (i + .5) * (x1 - x0) / n + r(-.3, .3) * (x1 - x0) / n, h: r(lo, hi), s: sl * r(.85, 1.2) }));
  const P1 = mk(9, 0, BW, 590, 740, .62), p1 = range(P1, 430), P2 = mk(6, BW * .28, BW, 520, 660, .7), p2 = range(P2, 380), P3 = mk(5, 0, BW * .6, 480, 600, .66), p3 = range(P3, 380);
  // Hills: a deep wooded band, a pale sweep with fields, a mound with a village, a deep sweep, then rolling woods.
  const h4 = rolling(470, 26, 200, 1.3), h5 = both(sweep(0, BW * .55, 330, 480, 1, 2), rolling(350, 14, 150, 4)), h6 = both(mound(BW * .64, 760, 300, 452), rolling(330, 16, 170, 2)), h7 = both(sweep(BW * .4, BW, 300, 430, -1, 5), rolling(318, 14, 120, 3)), h8 = rolling(366, 20, 110, 5);
  const w4 = woods(BW, 560, h4, [[0, BW]], ['pine'], ['#3a7f66', '#2f7460', '#44896e'], 44, 70, 30);
  const w6 = woods(BW, 520, h6, [[BW * .34, BW * .5], [BW * .72, BW * .9]], ['oak', 'pine'], ['#2f7453', '#3a8460'], 46, 74, 34);
  const w8 = woods(BW, 470, h8, [[0, BW * .22], [BW * .3, BW * .58], [BW * .66, BW]], ['pine', 'oak', 'pine', 'poplar'], ['#286a4a', '#2f7453', '#3a8460'], 54, 92, 34);
  const fields5 = Array.from({ length: 16 }, (_, i) => { const x = 60 + i * 150; return field(x, 560 - h5(x) + r(30, 80), r(70, 130), r(28, 46), pick([-22, -12, 14, 24]), pick(['#c3dba0', '#e2dc9c', '#d6e6b8']), pick(['#afc98c', '#cfc884', '#c3d6a3'])); }).join('');
  return [
    { id: 'sky', backdrop: true, stock: 'cover', c: '#a9d8f0', w: 5200, h: 1500, o: [-2480, -160, z], u: [1, 0, 0], v: [0, 1, 0], density: D, print: gulls },
    { id: 'sun', stock: 'sugar', c: '#fff3c4', w: 5200, h: 1500, o: [-2480, -160, z + 8], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: D, decal: 'sky', mask: '<circle cx="2760" cy="650" r="66" fill="#fff"/>' },
    clouds('clouds-far', 18, '#dcecf8', [[700, 500, 1.1], [2650, 470, 1.2], [4200, 560, 1], [1700, 430, .8], [3600, 420, .9]]),
    clouds('clouds-near', 40, '#fffdf6', [[1050, 470, 1.6], [1900, 540, 1.2], [3150, 480, 1.5], [2350, 620, .8], [4500, 470, 1.1], [1500, 640, .7], [300, 600, 1]]),
    land('peaks-far', 70, 760, '#cfdfe8', cut(BW, 760, p1), peaksArt(760, P1, 430, '#cfdfe8', 640)),
    land('peaks-right', 104, 680, '#a9c6cf', cut(BW, 680, p2), peaksArt(680, P2, 380, '#a9c6cf', 600)),
    land('peaks-left', 138, 620, '#bcd6d6', cut(BW, 620, p3), peaksArt(620, P3, 380, '#bcd6d6', 560)),
    land('wood-high', 168, 560, '#3a7f66', w4.m, w4.p), land('hill-high', 184, 520, '#6fae8c', cut(BW, 520, h4), crest(BW, 520, h4, '#6fae8c')),
    land('hill-fields', 222, 560, '#b9d996', cut(BW, 560, h5), crest(BW, 560, h5, '#b9d996') + fields5 + hamlet(BW * .12, 560 - 400, 6)),
    land('wood-mound', 252, 520, '#2f7453', w6.m, w6.p), land('hill-mound', 268, 480, '#7fc08a', cut(BW, 480, h6), crest(BW, 480, h6, '#7fc08a') + hamlet(BW * .64, 480 - 400, 9) + hamlet(BW * .58, 480 - 372, 5)),
    land('hill-deep', 304, 450, '#4f9a72', cut(BW, 450, h7), crest(BW, 450, h7, '#4f9a72') + hamlet(BW * .86, 450 - 380, 6)),
    land('wood-low', 334, 470, '#286a4a', w8.m, w8.p), land('hill-low', 350, 400, '#9bd08c', cut(BW, 400, h8), crest(BW, 400, h8, '#9bd08c', 1))
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
// A roofed noticeboard at the left end of the green, one flyer for each home on the square: the home's own colours, a ribbon
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
// A dog folded like a tent along its back, with the head a separate card glued square across the front and the tail a
// card behind. Ears, nose and a patch are glued on in tones of its own colour.
function dog(id: string, x: number, z: number, rot: number, c: string): Panel[] {
  const P = piece(x, z, rot), L = 58, H = 36, t = 9, h = Math.hypot(H, t);
  const body = `<path d="M3 ${f(h)}V12Q3 2 14 2H46Q56 2 56 12V${f(h)}H46V${f(h * .62)}H36V${f(h)}H26V${f(h * .62)}H14V${f(h)}Z" fill="#fff"/>`;
  const near = P(`${id}-near`, [-L / 2, 0, t], [1, 0, 0], unit([0, H, -t]), L, h, { stock: 'sugar', c, density: 2.6, mask: body, edge: 'fold' });
  const far: Panel = { ...P(`${id}-far`, [L / 2, 0, -t], [-1, 0, 0], unit([0, H, t]), L, h, { stock: 'sugar', c, density: 1, mask: body }), ghost: true };
  const head = toCamera(P(`${id}-head`, [L / 2 - 2, 14, 15], [0, 0, -1], [0, 1, 0], 30, 34, { stock: 'sugar', c, density: 2.6, mask: '<path d="M4 10L1 0L11 5H19L29 0L26 10V22Q26 34 15 34Q4 34 4 22Z" fill="#fff"/>' }));
  const tail = P(`${id}-tail`, [-L / 2 - 9, 20, 1], [1, 0, 0], [0, 1, 0], 14, 26, { stock: 'sugar', c: tone(c, -.12), density: 2.6, mask: '<path d="M14 26Q0 20 2 0Q8 10 14 16Z" fill="#fff"/>' });
  return [near, far, head, tail,
    on(near, .8, 16, 12, 22, 14, { id: `${id}-patch`, stock: 'sugar', c: tone(c, .4), density: 2.6, mask: '<ellipse cx="11" cy="7" rx="11" ry="7" fill="#fff"/>' }),
    on(near, .8, 40, h - 10, 14, 5, { id: `${id}-collar`, stock: 'cover', c: INDIGO, density: 2.6 }),
    on(head, .8, 9, 4, 12, 9, { id: `${id}-muzzle`, stock: 'sugar', c: tone(c, .4), density: 2.6, mask: '<ellipse cx="6" cy="4.5" rx="6" ry="4.5" fill="#fff"/>' }),
    on(head, 1.4, 12.5, 8, 5, 4, { id: `${id}-nose`, stock: 'cover', c: STEEL, density: 2.6, mask: '<ellipse cx="2.5" cy="2" rx="2.5" ry="2" fill="#fff"/>' }),
    on(head, .8, 7, 17, 4, 4, { id: `${id}-eye-l`, stock: 'cover', c: STEEL, density: 2.6, mask: disc(2) }), on(head, .8, 19, 17, 4, 4, { id: `${id}-eye-r`, stock: 'cover', c: STEEL, density: 2.6, mask: disc(2) })];
}
// A long raised bed for the front edge: a folded stone box of soil, with bushes in layers and cut blossoms glued on.
function longBed(id: string, x: number, z: number, w: number): Panel[] {
  const stone = (len: number) => `<rect width="${len}" height="30" fill="#d6c9b0"/>${Array.from({ length: Math.ceil(len / 30) }, (_, i) => `<rect x="${i * 30 + 1}" y="9" width="28" height="9" fill="#cdbfa4"/><rect x="${i * 30 + 16}" y="20" width="28" height="9" fill="#c6b89e"/>`).join('')}<rect width="${len}" height="6" fill="#efe6d4"/>`;
  const bed = box({ id, x, z, w, h: 30, d: 64, stock: 'cover', c: '#d6c9b0', front: stone(w), left: stone(64), right: stone(64), top: `<rect width="${w}" height="64" fill="#efe6d4"/><rect x="7" y="7" width="${w - 14}" height="50" fill="#6b4a33"/>` });
  const n = Math.floor(w / 96), plants = Array.from({ length: n }, (_, i) => { const bx = x - w / 2 + (i + .5) * w / n, b = bush(`${id}-bush${i}`, bx, z - 6 + (i % 2) * 8, 92, 46 + (i % 2) * 10, 26);
    return [...b, ...[0, 1, 2, 3].map(k => on(b[0], 12, 12 + k * 20, 18 + (k % 2) * 16, 11, 11, { id: `${id}-bloom${i}${k}`, stock: 'sugar', c: [YEL, WHITE, '#e88ab0', LAV][(i + k) % 4], mask: disc(5.5) }))]; });
  return [...bed, ...plants.flat()];
}
// The square's centrepiece: a low folded bed of flowers with the town clock standing in it. The clock's head is a folded
// box with a cut face glued on; its post is a flat strip.
function clockBed(x: number, z: number): Panel[] {
  s = 91;
  const side = (len: number) => `<rect width="${len}" height="26" fill="#d6c9b0"/><rect width="${len}" height="6" fill="#efe6d4"/>${Array.from({ length: Math.ceil(len / 34) }, (_, i) => `<rect x="${i * 34 + 2}" y="10" width="30" height="13" fill="#cdbfa4"/>`).join('')}`;
  const bed = box({ id: 'clock-bed', x, z, w: 190, h: 26, d: 130, stock: 'cover', c: '#d6c9b0', front: side(190), left: side(130), right: side(130), top: `<rect width="190" height="130" fill="#efe6d4"/><rect x="8" y="8" width="174" height="114" fill="#8fc48a"/>${Array.from({ length: 34 }, (_, i) => `<circle cx="${f(r(18, 172))}" cy="${f(r(18, 112))}" r="${f(r(4, 6.5))}" fill="${[YEL, WHITE, '#e88ab0', LAV, '#e8552d'][i % 5]}"/>`).join('')}` }).map(q => (q.id.endsWith('top') ? { ...q, density: 1.6 } : q));
  const post: Panel = { id: 'clock-post', stock: 'greyboard', c: STEEL, w: 9, h: 150, o: [x - 4.5, 26, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.8 };
  const head = box({ id: 'clock-head', x, z, y: 170, w: 54, h: 54, d: 16, stock: 'cover', c: tone(INDIGO, -.3), density: 2.4, front: `<rect width="54" height="54" fill="${tone(INDIGO, -.3)}"/>` });
  const face = on(head[0], 1.2, 6, 6, 42, 42, { id: 'clock-face', stock: 'cover', c: '#fffdf6', density: 2.4, mask: disc(21), print: `<circle cx="21" cy="21" r="21" fill="#fffdf6"/>${Array.from({ length: 12 }, (_, i) => `<rect x="20" y="2" width="2" height="${i % 3 ? 3 : 6}" fill="${STEEL}" transform="rotate(${i * 30} 21 21)"/>`).join('')}<path d="M21 21V9M21 21L29 25" stroke="${STEEL}" stroke-width="2.6" stroke-linecap="round"/><circle cx="21" cy="21" r="2.4" fill="${YEL}"/>` });
  const cap = box({ id: 'clock-cap', x, z, y: 224, w: 64, h: 8, d: 24, stock: 'cover', c: YEL, density: 2 });
  return [...bed, post, ...head, face, ...cap, ...bush('clock-bush-a', x - 54, z - 14, 70, 40, 24), ...bush('clock-bush-b', x + 56, z - 10, 64, 36, 24)];
}
// A cat sitting on a fence rail: flat, because it sits against the fence.
const cat = (id: string, x: number, y: number, z: number, c: string): Panel => ({ id, stock: 'sugar', c, w: 44, h: 40, o: [x - 22, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.6,
  mask: '<path d="M10 40V18Q8 12 10 2L16 8H24L30 2Q32 12 30 18Q40 22 40 40Z" fill="#fff"/><path d="M38 40Q46 30 42 18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>',
  print: `<rect width="44" height="40" fill="${c}"/><circle cx="15.5" cy="13" r="1.8" fill="${YEL}"/><circle cx="24.5" cy="13" r="1.8" fill="${YEL}"/><path d="M18 17h4l-2 2Z" fill="${tone(c, .5)}"/><path d="M14 40V28Q20 22 26 28V40Z" fill="${tone(c, .35)}"/>` });
// A letter box on a post by a gate.
const letterBox = (id: string, x: number, z: number, c: string): Panel[] => [{ id: `${id}-post`, stock: 'greyboard', c: STEEL, w: 6, h: 44, o: [x - 3, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.8 },
  ...box({ id, x, z, y: 44, w: 30, h: 20, d: 20, stock: 'cover', c, front: `<rect x="5" y="6" width="20" height="3" fill="${tone(c, -.3)}"/>`, density: 2 })];
// The way back: a finger-post whose arrow points off the green. The arrow is a cut card; the post is a flat strip.
function wayBack(x: number, z: number): Panel[] {
  return [{ id: 'back-post', stock: 'greyboard', c: STEEL, w: 9, h: 170, o: [x - 4.5, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.8 },
    { id: 'back-arrow', stock: 'cover', c: YEL, w: 150, h: 46, o: [x - 140, 118, z + 3], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.2, mask: '<path d="M26 0H150V46H26L0 23Z" fill="#fff"/>',
      print: `<rect width="150" height="46" fill="${YEL}"/><text x="88" y="31" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="22" fill="${STEEL}">BACK</text>` }];
}
// The sign that takes you to the product itself: a folded A-board with the mark.
function aBoard(id: string, x: number, z: number, rot: number): Panel[] {
  const P = piece(x, z, rot), face = `<rect x="5" y="5" width="60" height="86" fill="${INDIGO}"/><g transform="translate(14 20)">${mark(1, '#fff', LAV, INDIGO)}</g><rect x="14" y="60" width="42" height="6" rx="3" fill="#fff"/><rect x="20" y="72" width="30" height="5" rx="2.5" fill="${LAV}"/>`;
  return [P(`${id}-a`, [-35, 0, 14], [1, 0, 0], unit([0, 96, -14]), 70, Math.hypot(96, 14), { stock: 'cover', c: CREAM, edge: 'fold', density: 2.4, print: face }),
    { ...P(`${id}-b`, [35, 0, -14], [-1, 0, 0], unit([0, 96, 14]), 70, Math.hypot(96, 14), { stock: 'cover', c: CREAM, density: 1 }), ghost: true }];
}

/* ---------- everything on the green ---------- */
function surroundings(): Panel[] {
  const [h1, h2, h3, h4] = HOMES;
  return [
    ...HOMES.flatMap((h, i) => [...home(h, h === h3), ...fence(h), offerSign(h, i)]), ...rooms(h3),
    ...bush('h1-bush', h1.x - h1.w / 2 - 40, GARDEN - 22, 96, 50), ...bush('h4-bush', h4.x + h4.w / 2 + 44, GARDEN - 22, 96, 50),
    // The left end, open to the valley: the way back, the flyer board, and the way to the product itself.
    ...wayBack(-1010, 60), ...flyerBoard(-800, -80, 0), ...aBoard('visit', -600, 30, -8),
    ...shadeTree('tree-l', -1230, 40, 320), ...planter('tree-l-bed', -1230, 40, 104),
    // Small stories. A couple by the clock; a neighbour at her gate; a cat on the next fence.
    ...shopper('viewer-a', -150, 204, { coat: '#e88ab0', legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', style: 'dress', face: 'surprised', carry: YEL }, true),
    ...shopper('viewer-b', -204, 194, { coat: '#2bb5b8', legs: '#3d444e', skin: '#f3c9a0', hair: '#4a2c1a', build: 'average', face: 'cool' }, false, 1, 0, false),
    ...shopper('neighbour', h1.x + 70, -34, { coat: '#35b58a', legs: '#f4f1ea', skin: '#f3c9a0', hair: '#c9ccd1', style: 'dress', hat: '#f4e3c3', face: 'grumpy', carry: '#57b36f' }),
    cat('cat', h2.x - 80, 40, GARDEN + 3, '#3d444e'), ...letterBox('box-h2', h2.x + 62, GARDEN + 16, INDIGO), ...letterBox('box-h3', h3.x + 64, GARDEN + 16, BRICK),
    // Moving day at the last home: the van, cartons on the paving, the mover carrying one in, a child and a dog watching.
    ...van('van', h4.x + 150, 96, 8), ...carton('carton-a', h4.x - 40, 70, 56, 44, 44, -8), ...carton('carton-b', h4.x - 46, 68, 44, 34, 36, 10, 44), ...carton('carton-c', h4.x + 18, 100, 46, 36, 40, 14),
    ...shopper('mover', h4.x + 10, -10, { coat: '#f4f1ea', legs: '#5b6bdc', skin: '#a8714f', hair: '#1d1a17', build: 'big', face: 'determined', carry: KRAFT, hat: INDIGO }),
    ...shopper('child', h4.x - 60, 190, { coat: YEL, legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', style: 'shorts', face: 'cheerful' }, false, .7, 0, false),
    ...dog('dog', h4.x - 120, 210, -30, '#c98a4e'),
    ...pigeon('pigeon-a', 150, 250, -20, '#9aa3ad'), ...pigeon('pigeon-b', 198, 262, 16, '#b3bac3', true),
    // The right end, open to the valley: a shade tree over a bench, someone dozing, a bicycle against the tree's bed.
    ...shadeTree('tree', 900, 60, 300), ...planter('tree-bed', 900, 60, 104), ...bench('bench', 800, 150, 150, -10), ...bicycle('bike', 1010, -20, -8, INDIGO),
    ...shopper('dozer', 850, 196, { coat: LAV, legs: '#3d444e', skin: '#f3c9a0', hair: '#8a5a3a', build: 'average', face: 'sleepy', hat: '#f4f1ea' }, true, 1, 0, false),
    // The front edge: a lamp at each end and two long beds of bushes.
    ...streetLamp('lamp-a', -1100, 340, 250, '#ffe7a8'), ...streetLamp('lamp-b', 1150, 344, 250, '#ffe7a8'),
    ...longBed('front-bed-a', -520, 338, 300), ...longBed('front-bed-b', 560, 338, 300),
    // The middle of the green: the town clock in its bed of flowers.
    ...clockBed(0, 176)];
}

export function hometown(): Scene {
  return { id: 'hometown', density: 2.1, camera: { zoom: .85, x0: -400, x1: 340 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] },
    panels: [...backdrop(), ...ground(), ...laneView(), ...surroundings()] };
}
