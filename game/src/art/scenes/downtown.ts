import { add, box, carved, hinged, on, slot, unit, yaw, type Panel, type Scene, type V3 } from '../kit.ts';
import { CREAM, INK, cloud } from '../recipes.ts';
import { bar, bench, bicycle, bush, disc, fat, fawning, fbalcony, fblade, fbox, festoon, fflat, fflowers, flamp, frame, parasolTable, piece, pigeon, planter, scallopBlob, shadeTree, shopper, toCamera, tone } from './promenade.ts';
import { streetLamp, windowBox } from './street.ts';

// Moperty's downtown: a street corner in front of the Moperty sales gallery. The pavement is the main space. On the left
// an avenue crosses it and runs back to a rail viaduct, the one open view. Buildings close the other sides: a brick
// walk-up on the left, the gallery and a building site at the back, a corner café on the right.
const INDIGO = '#5b6bdc', LAV = '#a3adf2', YEL = '#f5b400', BRICK = '#b0664c', STONE = '#e3c9a0', ASPHALT = '#5d616b', STEEL = '#2f343c';
const GLASS = '#5d7f95', LIT = '#ffdf9e', LEAF = '#57b36f', FROND = '#3f9a5b', PLY = '#d9b380';
const TECH = { vue: '#42b884', laravel: '#f05340', sass: '#cf649a', postgres: '#336791', nginx: '#22963a', gcloud: '#4285f4' };
const X0 = -1500, X1 = 1500, Z0 = -330, KERB = 196, Z1 = 330, ROAD = -8, AVE = { x0: -640, x1: -380 };

let s = 1;
const r = (a: number, b: number) => { s = (s * 16807) % 2147483647; return a + (s / 2147483647) * (b - a); };
const pick = <T,>(a: T[]) => a[Math.floor(r(0, a.length))];
const f = (n: number) => n.toFixed(1);
// The Moperty mark, 42 x 30: two gabled houses side by side with a small house between them.
const mark = (k: number, a: string, b: string, m = '#fff') => `<g transform="scale(${k})"><path d="M0 9L7 0H14L21 9V30H0Z" fill="${a}"/><path d="M21 9L28 0H35L42 9V30H21Z" fill="${b}"/><path d="M15 30V22L21 17L27 22V30Z" fill="${m}"/><rect x="8" y="12" width="5" height="5" fill="${m}"/><rect x="29" y="12" width="5" height="5" fill="${m}"/></g>`;
// A small house pictogram, 30 x 30.
const house = (c: string, roof: string) => `<path d="M2 14L15 3L28 14V16H2Z" fill="${roof}"/><rect x="5" y="15" width="20" height="13" fill="${c}"/><rect x="12" y="19" width="6" height="9" fill="${roof}"/>`;

/* ---------- ground: pavement, the raised crossing, the avenue and the road in front ---------- */
function ground(): Panel[] {
  s = 5;
  const D = KERB - Z0, PAVE = ['#e3c9a0', '#ead4b0', '#dcc097', '#e7cfa6'];
  const slabs = (W: number) => {
    let out = '';
    for (let row = 0, y = 0; y < D; row++, y += 44) for (let x = row % 2 ? -36 : 0; x < W; x += 72) { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; out += `<rect x="${x + 1}" y="${y + 1}" width="70" height="42" fill="${PAVE[Math.floor((h - Math.floor(h)) * 4)]}"/>`; }
    // A band of studded paving along the kerb, and a darker course along the building line.
    return `<rect width="${W}" height="${D}" fill="#cdb48c"/>${out}<rect y="${D - 30}" width="${W}" height="22" fill="#d6a45c"/>${Array.from({ length: Math.floor(W / 14) }, (_, i) => `<circle cx="${i * 14 + 7}" cy="${D - 19}" r="3" fill="#bf8c46"/>`).join('')}<rect y="${D - 8}" width="${W}" height="8" fill="#f4ead8"/>`;
  };
  const flat = (id: string, x0: number, x1: number, z0: number, z1: number, y: number, c: string, print: string, rest: Partial<Panel> = {}): Panel =>
    ({ id, stock: 'greyboard', c, w: x1 - x0, h: z1 - z0, o: [x0, y, z1], u: [1, 0, 0], v: [0, 0, -1], density: .42, edge: 'fold', print, ...rest });
  const paveL = flat('pave-l', X0, AVE.x0, Z0, KERB, 0, '#cdb48c', slabs(AVE.x0 - X0), { split: 3 });
  const paveR = flat('pave-r', AVE.x1, X1, Z0, KERB, 0, '#cdb48c', slabs(X1 - AVE.x1) +
    // Tree pits with cast grates, a manhole, and the gallery's doormat of indigo pavers.
    `<g transform="translate(${420 - 70} ${-36 - Z0})"><rect width="140" height="60" fill="${tone(INDIGO, -.25)}"/><rect x="6" y="6" width="128" height="48" fill="${INDIGO}"/><rect x="16" y="16" width="108" height="6" fill="${LAV}"/><rect x="16" y="38" width="108" height="6" fill="${LAV}"/></g>` +
    `<circle cx="${AVE.x1 * -1 + 250}" cy="${D - 70}" r="20" fill="#9a8f80"/><circle cx="${AVE.x1 * -1 + 250}" cy="${D - 70}" r="14" fill="#b3a898"/>`, { split: 6 });
  // The crossing is raised to pavement height: brick, with broad white bars.
  const aw = AVE.x1 - AVE.x0, cd = KERB + 30;
  const crossing = flat('crossing', AVE.x0, AVE.x1, -30, KERB, 0, '#b98270', `<rect width="${aw}" height="${cd}" fill="#b98270"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${10 + i * 28}" y="34" width="14" height="${cd - 78}" fill="#f4ead8"/>`).join('')}<rect width="${aw}" height="8" fill="#9c6d5c"/><rect y="${cd - 8}" width="${aw}" height="8" fill="#9c6d5c"/>`, { density: .6 });
  // The avenue runs back from the crossing to the cross street under the viaduct.
  const al = -30 - (-360);
  const avenue = flat('avenue', AVE.x0, AVE.x1, -360, -30, ROAD, ASPHALT, `<rect width="${aw}" height="${al}" fill="${ASPHALT}"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${aw / 2 - 4}" y="${i * 54 + 6}" width="8" height="30" fill="#f4ead8"/>`).join('')}<rect x="14" y="${al - 22}" width="${aw - 28}" height="10" fill="#f4ead8"/><rect width="6" height="${al}" fill="#8a8d94"/><rect x="${aw - 6}" width="6" height="${al}" fill="#8a8d94"/>`, { density: .6 });
  const kerbSide = (id: string, x: number, dir: 1 | -1): Panel => ({ id, stock: 'greyboard', c: '#b9ab96', w: 330, h: -ROAD, o: [x, ROAD, dir > 0 ? Z0 : -30], u: [0, 0, dir], v: [0, 1, 0], density: .6, edge: 'fold' });
  // The road in front: a parking lane and the first lane line, then the diorama's front edge.
  const rw = X1 - X0, rd = Z1 - KERB;
  const road = flat('road', X0, X1, KERB, Z1, ROAD, ASPHALT, `<rect width="${rw}" height="${rd}" fill="${ASPHALT}"/>${Array.from({ length: Math.floor(rw / 150) }, (_, i) => `<rect x="${i * 150 + 20}" y="${rd - 34}" width="74" height="7" fill="#f4ead8"/>`).join('')}<rect width="${rw}" height="14" fill="#6c7079"/>${[620, 1180, 1960, 2540].map(x => `<rect x="${x}" y="22" width="44" height="26" fill="#484c55"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${x + 5 + k * 8}" y="25" width="3" height="20" fill="#6c7079"/>`).join('')}`).join('')}`, { split: 4 });
  const kerb: Panel = { id: 'kerb', stock: 'greyboard', c: '#d9cdb8', w: rw, h: -ROAD, o: [X0, ROAD, KERB], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'fold', split: 2 };
  const skirt: Panel = { id: 'road-skirt', stock: 'greyboard', c: '#3c3f47', w: rw, h: 50, o: [X0, ROAD - 50, Z1 + 1], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2, print: `<rect width="${rw}" height="8" fill="#787c85"/>` };
  return [paveL, paveR, crossing, avenue, kerbSide('ave-kerb-l', AVE.x0, 1), kerbSide('ave-kerb-r', AVE.x1, -1), road, kerb, skirt];
}

/* ---------- the open view down the avenue: a shadow box ---------- */
// Thin cut layers stood well apart, alternating pale and deep, each shading the next. They are real in the bake and
// then flattened onto two cards. Card one closes the avenue: the cross street with its shops, trees, a rail viaduct with
// a train on it and a bus passing in front. Card two stands further back and holds the towers beyond.
type Card = { id: string; x0: number; z: number; w: number; density: number };
const NEAR: Card = { id: 'ave-near', x0: -1250, z: -480, w: 1160, density: .95 };
const FAR: Card = { id: 'ave-far', x0: -1500, z: -740, w: 1500, density: .7 };
const sheet = (card: Card, id: string, gap: number, y0: number, h: number, c: string, mask: string, print = '', stock: Panel['stock'] = 'sugar', x = 0, w = card.w): Panel =>
  ({ id, stock, c, w, h, o: [card.x0 + x, y0, card.z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: card.density, decal: card.id, mask, print });
// A row of buildings cut from one sheet: each block its own colour, with windows and something on the roof.
function row(W: number, H: number, lo: number, hi: number, minW: number, maxW: number, cols: string[], win: string, lit: string, breaks: number, roofs: 'tanks' | 'masts' | 'none', shops = false) {
  let mask = '', print = '';
  for (let x = r(-30, 0); x < W;) {
    const bw = r(minW, maxW), bh = r(lo, hi), top = H - bh, c = pick(cols), dark = tone(c, -.14);
    const rect = `x="${f(x)}" y="${f(top)}" width="${f(bw + 1)}" height="${f(bh)}"`;
    mask += `<rect ${rect} fill="#fff"/>`; print += `<rect ${rect} fill="${c}"/><rect x="${f(x)}" y="${f(top)}" width="${f(bw)}" height="5" fill="${dark}"/>`;
    const sx = bw > 90 ? 24 : 19, foot = shops ? 46 : 12;
    for (let wx = x + 10; wx < x + bw - 16; wx += sx) for (let wy = top + 16; wy < H - foot - 16; wy += 28) print += `<rect x="${f(wx)}" y="${f(wy)}" width="10" height="15" fill="${r(0, 1) > .72 ? lit : win}"/>`;
    if (shops) { const aw = pick([YEL, INDIGO, CREAM, LAV]); print += `<rect x="${f(x + 6)}" y="${H - 40}" width="${f(bw - 12)}" height="40" fill="${LIT}"/><path d="M${f(x + 3)} ${H - 48}h${f(bw - 6)}l4 12h${f(-bw - 2)}Z" fill="${aw}"/>`; }
    const k = r(0, 1), cx = x + bw * r(.3, .7);
    if (roofs === 'tanks' && k < .45) { mask += `<rect x="${f(cx - 13)}" y="${f(top - 30)}" width="26" height="20" fill="#fff"/><path d="M${f(cx - 15)} ${f(top - 30)}L${f(cx)} ${f(top - 40)}L${f(cx + 15)} ${f(top - 30)}Z" fill="#fff"/><rect x="${f(cx - 11)}" y="${f(top - 10)}" width="3" height="10" fill="#fff"/><rect x="${f(cx + 8)}" y="${f(top - 10)}" width="3" height="10" fill="#fff"/>`; print += `<rect x="${f(cx - 13)}" y="${f(top - 30)}" width="26" height="20" fill="#9b7a5c"/><path d="M${f(cx - 15)} ${f(top - 30)}L${f(cx)} ${f(top - 40)}L${f(cx + 15)} ${f(top - 30)}Z" fill="#7a5c42"/><rect x="${f(cx - 11)}" y="${f(top - 10)}" width="22" height="10" fill="#5c4a3c"/>`; }
    else if (roofs === 'masts' && k < .4) { mask += `<rect x="${f(cx - 1.5)}" y="${f(top - 48)}" width="3" height="48" fill="#fff"/>`; print += `<rect x="${f(cx - 1.5)}" y="${f(top - 48)}" width="3" height="48" fill="${dark}"/>`; }
    else if (roofs !== 'none' && k < .7) { mask += `<rect x="${f(x + bw * .2)}" y="${f(top - 22)}" width="${f(bw * .6)}" height="22" fill="#fff"/>`; print += `<rect x="${f(x + bw * .2)}" y="${f(top - 22)}" width="${f(bw * .6)}" height="22" fill="${tone(c, .12)}"/><rect x="${f(x + bw * .2)}" y="${f(top - 22)}" width="${f(bw * .6)}" height="4" fill="${dark}"/>`; }
    x += bw + (r(0, 1) < breaks ? r(40, 90) : r(-2, 6));
  }
  return { mask, print };
}
function avenueView(): Panel[] {
  s = 23;
  const y0 = ROAD, W = NEAR.w;
  // Card one, back to front. The shops of the cross street, with gaps between blocks so the towers show through.
  const SH = 330, shops = row(W, SH, 190, 320, 90, 170, ['#c98a6e', STONE, '#d9a184', '#f0dcc0', BRICK, '#e8c9a8'], '#6b6f8f', LIT, .4, 'tanks', true);
  const card: Panel = { id: NEAR.id, stock: 'sugar', c: '#d9a184', w: W, h: SH, o: [NEAR.x0, y0, NEAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: NEAR.density, split: 2, mask: shops.mask, print: shops.print };
  // Street trees in front of the shops.
  let tm = '', tp = ''; const TH = 180;
  for (let x = r(10, 50); x < W; x += r(70, 120)) {
    const cr = r(30, 42), cy = TH - 84 - r(0, 16);
    tm += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="#fff"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 12)}" r="${f(cr * .7)}" fill="#fff"/><circle cx="${f(x - cr * .7)}" cy="${f(cy + 14)}" r="${f(cr * .6)}" fill="#fff"/><rect x="${f(x - 4)}" y="${f(cy)}" width="8" height="${f(TH - cy)}" fill="#fff"/>`;
    tp += `<rect x="${f(x - 4)}" y="${f(cy)}" width="8" height="${f(TH - cy)}" fill="#6e523a"/><circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="#3f8f5a"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 12)}" r="${f(cr * .7)}" fill="#347a4b"/><circle cx="${f(x - cr * .7)}" cy="${f(cy + 14)}" r="${f(cr * .6)}" fill="#4aa067"/>`;
  }
  const trees = sheet(NEAR, 'ave-trees', 40, y0, TH, '#3f8f5a', tm, tp);
  // The train stands on the viaduct, behind its parapet: three cars in the Moperty indigo.
  const cars = [0, 1, 2].map(i => `<rect x="${i * 172 + 2}" y="6" width="166" height="46" rx="10" fill="FILL"/>`).join('');
  const train = sheet(NEAR, 'ave-train', 66, y0 + 176, 52, INDIGO, cars.replaceAll('FILL', '#fff'),
    `${[0, 1, 2].map(i => `<rect x="${i * 172 + 2}" y="6" width="166" height="46" fill="${INDIGO}"/><rect x="${i * 172 + 2}" y="6" width="166" height="8" fill="${tone(INDIGO, -.25)}"/><rect x="${i * 172 + 2}" y="38" width="166" height="5" fill="${CREAM}"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${i * 172 + 14 + k * 30}" y="18" width="22" height="16" fill="${k === 2 ? CREAM : '#ffe9a8'}"/>`).join('')}`).join('')}`, 'cover', 380, 520);
  // The viaduct: pale stone arches, a deck and a parapet.
  const VH = 196, span = 164;
  const arches = Array.from({ length: Math.ceil(W / span) }, (_, i) => `M${i * span + 20} ${VH}V96A62 56 0 0 1 ${i * span + 144} 96V${VH}Z`).join(' ');
  const viaduct = sheet(NEAR, 'ave-viaduct', 82, y0, VH, '#eadfce', `<path fill-rule="evenodd" d="M0 0H${W}V${VH}H0Z ${arches}" fill="#fff"/>`,
    `<rect width="${W}" height="10" fill="#d3c5b0"/><rect y="24" width="${W}" height="6" fill="#d3c5b0"/>${Array.from({ length: Math.ceil(W / span) }, (_, i) => `<path d="M${i * span + 16} 96A66 60 0 0 1 ${i * span + 148} 96" stroke="#d3c5b0" stroke-width="7" fill="none"/><rect x="${i * span + 76}" y="30" width="12" height="16" fill="#d3c5b0"/><rect x="${i * span - 4}" y="${VH - 12}" width="28" height="12" fill="#d3c5b0"/>`).join('')}`, 'greyboard');
  // A bus passing in front of the arches.
  const bus = sheet(NEAR, 'ave-bus', 106, y0, 78, YEL, '<path d="M4 66V14Q4 4 14 4H196Q206 4 206 14V66Z" fill="#fff"/><circle cx="46" cy="64" r="14" fill="#fff"/><circle cx="162" cy="64" r="14" fill="#fff"/>',
    `<rect width="210" height="78" fill="${YEL}"/><rect y="46" width="210" height="6" fill="${CREAM}"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${16 + k * 36}" y="14" width="28" height="24" fill="#5d6c8a"/>`).join('')}<circle cx="46" cy="64" r="14" fill="${STEEL}"/><circle cx="162" cy="64" r="14" fill="${STEEL}"/><circle cx="46" cy="64" r="6" fill="#c9ccd1"/><circle cx="162" cy="64" r="6" fill="#c9ccd1"/>`, 'cover', 640, 210);
  // The near kerb of the cross street: a clipped hedge and lamp posts.
  let hm = '', hp = ''; const HH = 96;
  for (let x = 0; x < W; x += 46) hm += `<circle cx="${x + 23}" cy="${HH - 20}" r="25" fill="#fff"/>`;
  hm += `<rect y="${HH - 20}" width="${W}" height="20" fill="#fff"/>`;
  for (let x = 60; x < W; x += r(150, 210)) { hm += `<rect x="${f(x)}" y="6" width="4" height="${HH - 6}" fill="#fff"/><circle cx="${f(x + 2)}" cy="8" r="7" fill="#fff"/>`; hp += `<rect x="${f(x)}" y="6" width="4" height="${HH - 6}" fill="${STEEL}"/><circle cx="${f(x + 2)}" cy="8" r="7" fill="#fff4e2"/>`; }
  const hedge = sheet(NEAR, 'ave-hedge', 124, y0, HH, '#8fc49a', hm, hp);

  // Card two: the towers beyond, pale at the back, deeper in the middle, warm at the front.
  s = 61;
  const FW = FAR.w, BH = 640, back = row(FW, BH, 430, 630, 70, 130, ['#d5daf2', '#dcdcf0', '#cdd6ee'], '#e9edf8', '#f4f6fc', .3, 'masts');
  const far: Panel = { id: FAR.id, stock: 'sugar', c: '#d5daf2', w: FW, h: BH, o: [FAR.x0, y0, FAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FAR.density, split: 2, mask: back.mask, print: back.print };
  const MH = 540, mid = row(FW, MH, 330, 520, 80, 160, ['#8f9bd6', '#9aa3d8', '#8791c8', '#a39fd6'], '#c5cbee', '#ffe9a8', .3, 'tanks');
  const NH = 440, front = row(FW, NH, 290, 420, 90, 170, ['#e9cdb4', '#d9a98e', '#f1dfc6', '#c98f78'], '#7c7f9c', '#ffe9a8', .35, 'tanks');
  // A billboard on the front row carries the Moperty mark.
  const bb = `<rect x="700" y="${NH - 430}" width="150" height="84" fill="FILL"/><rect x="716" y="${NH - 346}" width="5" height="26" fill="FILL"/><rect x="829" y="${NH - 346}" width="5" height="26" fill="FILL"/>`;
  const bbPrint = `<rect x="700" y="${NH - 430}" width="150" height="84" fill="${CREAM}"/><rect x="706" y="${NH - 424}" width="138" height="72" fill="${INDIGO}"/><g transform="translate(733 ${NH - 414})">${mark(2, '#fff', LAV, INDIGO)}</g><rect x="716" y="${NH - 346}" width="5" height="26" fill="${STEEL}"/><rect x="829" y="${NH - 346}" width="5" height="26" fill="${STEEL}"/>`;
  return [card, trees, train, viaduct, bus, hedge, far, sheet(FAR, 'ave-far-mid', 56, y0, MH, '#8f9bd6', mid.mask, mid.print), sheet(FAR, 'ave-far-front', 116, y0, NH, '#e9cdb4', front.mask + bb.replaceAll('FILL', '#fff'), front.print + bbPrint)];
}
// The far distance: sky, two layers of cut clouds, then the city in three rows, pale to deep. All of it bakes into the
// CSS backdrop. Only world heights of about 400 to 780 show above the street.
function backdrop(): Panel[] {
  s = 11;
  const FARD = .72, z = -780;
  const gulls = [[2180, 640, 1.2], [2215, 622, 1], [2245, 650, .9], [3420, 700, 1], [3450, 686, .8]].map(([x, y, k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 6Q6 0 12 6Q18 0 24 6Q18 3 12 9Q6 3 0 6Z" fill="#fdfcf8"/>`).join('');
  const layer = (id: string, gap: number, w: number, h: number, c: string, art: { mask: string; print: string }): Panel => ({ id, stock: 'sugar', c, w, h, o: [-w / 2 + 120, 0, z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FARD, decal: 'sky', mask: art.mask, print: art.print });
  const clouds = (id: string, gap: number, c: string, at: number[][]): Panel => ({ id, stock: 'sugar', c, w: 5200, h: 1500, o: [-2480, -160, z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FARD, decal: 'sky', mask: at.map(([x, y, k]) => cloud(x, y, k, '#fff')).join('') });
  return [
    { id: 'sky', backdrop: true, stock: 'cover', c: '#a9d8f0', w: 5200, h: 1500, o: [-2480, -160, z], u: [1, 0, 0], v: [0, 1, 0], density: FARD, print: gulls },
    clouds('clouds-far', 14, '#dcecf8', [[700, 640, 1.1], [2650, 600, 1.2], [4200, 700, 1]]),
    clouds('clouds-near', 34, '#fffdf6', [[1050, 590, 1.6], [1900, 660, 1.2], [3150, 610, 1.5], [2350, 760, .8], [4500, 600, 1.1], [1500, 780, .7]]),
    layer('city-haze', 40, 4400, 720, '#d6e4ef', row(4400, 720, 300, 470, 60, 130, ['#d6e4ef', '#dce8f1', '#d0e0ec'], '#e8f1f7', '#f2f7fa', 0, 'masts')),
    layer('city-far', 100, 4200, 660, '#b4c6dc', row(4200, 660, 240, 540, 70, 170, ['#b4c6dc', '#bccde0', '#adc0d8'], '#d9e4ee', '#eaf1f6', 0, 'tanks')),
    layer('city-mid', 170, 3900, 540, '#e6d2ba', row(3900, 540, 180, 400, 90, 200, ['#e6d2ba', '#dcc3a8', '#eedfca', '#d6b9a0'], '#a39aa6', '#fff1c4', 0, 'tanks'))
  ];
}

/* ---------- the Moperty sales gallery: the mark built as a building ---------- */
// Two gabled houses joined into one, indigo and lavender, with the small white house between them as the entrance.
const G = { x: 40, z: -90, w: 620, d: 250, wall: 330, peak: 120 };
function gableRoof(id: string, cx: number, zf: number, half: number, peak: number, eave: number, depth: number, c: string, over = 24): Panel[] {
  const a = Math.atan2(peak, half), rise = Math.hypot(half + over, peak * (half + over) / half), ridge: V3 = [cx, eave + peak + 2, zf + 18], rd = depth + 30;
  const seams = Array.from({ length: Math.floor(rise / 26) }, (_, i) => `<path d="M${(i + 1) * 26} 0V${rd}" stroke="${tone(c, -.22)}" stroke-width="3"/>`).join('');
  return ([-1, 1] as const).flatMap(k => {
    const dn: V3 = [k * Math.cos(a), -Math.sin(a), 0];
    const base: Panel = k < 0 ? { id: `${id}-l`, stock: 'cover', c, w: rise, h: rd, o: add(ridge, dn, rise), u: [-dn[0], -dn[1], -dn[2]], v: [0, 0, -1], edge: 'cut', density: 1, print: seams }
      : { id: `${id}-r`, stock: 'cover', c, w: rise, h: rd, o: ridge, u: dn, v: [0, 0, -1], edge: 'cut', density: 1, print: seams };
    const lip: Panel = { id: `${base.id}-lip`, stock: 'cover', c: CREAM, w: rise, h: 8, o: add(k < 0 ? add(ridge, dn, rise) : ridge, [0, -8, 0]), u: base.u, v: [0, 1, 0], edge: 'fold', density: 1.4 };
    return [base, lip];
  });
}
function gallery(): Panel[] {
  const { x, z, w, d, wall, peak } = G, H = wall + peak, x0 = x - w / 2, hw = w / 2, density = 1.25;
  // Holes, measured from the wall's left foot: the listings window, the model window, and the two logo windows upstairs.
  const win = { list: [24, 40, 180, 150], model: [416, 40, 180, 150], upL: [110, 232, 90, 84], upR: [420, 232, 90, 84] } as const;
  const holes = Object.values(win).map(([a, b, c, e]) => `M${a} ${H - b}V${H - b - e}H${a + c}V${H - b}Z`).join(' ');
  const boards = (cx: number, c: string) => Array.from({ length: 16 }, (_, i) => `<path d="M${cx} ${peak + (i + 1) * 20}h${hw}" stroke="${tone(c, -.16)}" stroke-width="2"/>`).join('');
  const front: Panel = { id: 'gallery-front', stock: 'cover', c: INDIGO, w, h: H, o: [x0, 0, z], u: [1, 0, 0], v: [0, 1, 0], density, edge: 'cut',
    mask: `<path fill-rule="evenodd" d="M0 ${H}V${peak}L${hw / 2} 0L${hw} ${peak}L${hw * 1.5} 0L${w} ${peak}V${H}Z ${holes}" fill="#fff"/>`,
    print: `<rect width="${hw}" height="${H}" fill="${INDIGO}"/><rect x="${hw}" width="${hw}" height="${H}" fill="${LAV}"/>${boards(0, INDIGO)}${boards(hw, LAV)}` +
      `<rect y="${H - 16}" width="${hw}" height="16" fill="${tone(INDIGO, -.3)}"/><rect x="${hw}" y="${H - 16}" width="${hw}" height="16" fill="${tone(LAV, -.3)}"/>` +
      `<rect y="${H - 214}" width="${hw}" height="8" fill="${tone(INDIGO, .35)}"/><rect x="${hw}" y="${H - 214}" width="${hw}" height="8" fill="${tone(LAV, .45)}"/>` };
  // Through the logo windows: lit rooms in the mark's yellow, crossed into four panes.
  const yellow = `<rect width="110" height="104" fill="#ffd34d"/><rect y="70" width="110" height="34" fill="${YEL}"/>`;
  // Through the listings window: a pale pinboard wall. The listing cards themselves hang in front of the glass.
  const pinboard = `<rect width="200" height="170" fill="#f7efe0"/><rect y="6" width="200" height="6" fill="${tone(INDIGO, .5)}"/><rect y="84" width="200" height="4" fill="#e6dac6"/>`;
  // Through the model window: three house models on plinths.
  const models = `<rect width="200" height="170" fill="#f7efe0"/>${[0, 1, 2].map(k => `<rect x="${18 + k * 60}" y="${112 - (k % 2) * 14}" width="44" height="${58 + (k % 2) * 14}" fill="#fff"/><g transform="translate(${17 + k * 60} ${66 - (k % 2) * 14}) scale(1.55)">${house([LAV, CREAM, INDIGO][k], [INDIGO, YEL, tone(INDIGO, -.3)][k])}</g>`).join('')}`;
  const windows = [...windowBox('g-list', front, win.list[0], win.list[1], win.list[2], win.list[3], pinboard, 1, 1, 14), ...windowBox('g-model', front, win.model[0], win.model[1], win.model[2], win.model[3], models, 2, 1),
    ...windowBox('g-up-l', front, win.upL[0], win.upL[1], win.upL[2], win.upL[3], yellow, 2, 2, 10), ...windowBox('g-up-r', front, win.upR[0], win.upR[1], win.upR[2], win.upR[3], yellow, 2, 2, 10)];
  const walls = box({ id: 'gallery-body', x, z: z - d / 2, w, h: wall, d, stock: 'cover', c: INDIGO, side: INDIGO, noTop: true, left: boards(0, INDIGO).replaceAll(`h${hw}`, `h${d}`), right: boards(0, LAV).replaceAll(`h${hw}`, `h${d}`) })
    .filter(p => !p.id.endsWith('front')).map(p => (p.id.endsWith('right') ? { ...p, c: LAV, density: 1 } : { ...p, density: 1 }));
  const roofs = [...gableRoof('gallery-roof-a', x - hw / 2, z, hw / 2, peak, wall, d, tone(INDIGO, -.32), 12), ...gableRoof('gallery-roof-b', x + hw / 2, z, hw / 2, peak, wall, d, tone(LAV, -.3), 12)];
  // Relief on the front: flower boxes under the logo windows, an awning over the model window, lanterns, a blade sign.
  const F = frame(x0, z, 0);
  const dress = carved(front, [
    ...fflowers(F, 'g-flowers-l', win.upL[0] - 6, win.upL[1] - 18, 102), ...fflowers(F, 'g-flowers-r', win.upR[0] - 6, win.upR[1] - 18, 102),
    ...fawning(F, 'g-awning', win.model[0] - 10, 222, 200, 56, 28, INDIGO), ...flamp(F, 'g-lamp-l', 6, 150), ...flamp(F, 'g-lamp-r', 600, 150),
    ...fblade(F, 'g-blade', -2, 250, 60, 60, CREAM, `<circle cx="30" cy="30" r="27" fill="${INDIGO}"/><g transform="translate(9 15)">${mark(1, '#fff', LAV, INDIGO)}</g>`, '<circle cx="30" cy="30" r="30" fill="#fff"/>')]);

  // The entrance: the small white house, standing proud of the two big ones.
  const E = { w: 170, h: 196, d: 50, peak: 60, door: 104, dh: 156 }, ez = z + E.d, ex0 = x - E.w / 2, EH = E.h + E.peak;
  const eFront: Panel = { id: 'entry-front', stock: 'cover', c: '#f8f2e6', w: E.w, h: EH, o: [ex0, 0, ez], u: [1, 0, 0], v: [0, 1, 0], density: 1.6, edge: 'cut',
    mask: `<path fill-rule="evenodd" d="M0 ${EH}V${E.peak}L${E.w / 2} 0L${E.w} ${E.peak}V${EH}Z M${(E.w - E.door) / 2} ${EH}V${EH - E.dh}H${(E.w + E.door) / 2}V${EH}Z" fill="#fff"/>`,
    print: `${Array.from({ length: 11 }, (_, i) => `<path d="M0 ${E.peak + (i + 1) * 18}H${E.w}" stroke="#e6dccb" stroke-width="2"/>`).join('')}<rect y="${EH - 12}" width="${E.w}" height="12" fill="#d9cdb8"/>` +
      // The signboard over the door: the mark and the name.
      `<rect x="12" y="${EH - E.dh - 34}" width="${E.w - 24}" height="28" rx="4" fill="${INDIGO}"/><image href="/PUBLIC/img/brand/moperty-white.svg" x="20" y="${EH - E.dh - 31}" width="27" height="22"/><text x="${E.w / 2 + 14}" y="${EH - E.dh - 13}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="19" fill="#fff">moperty</text>` +
      `<circle cx="${E.w / 2}" cy="${E.peak - 4}" r="17" fill="${YEL}"/><path d="M${E.w / 2} ${E.peak - 21}v34M${E.w / 2 - 17} ${E.peak - 4}h34" stroke="#f8f2e6" stroke-width="4"/>` };
  const eWalls = box({ id: 'entry-body', x, z: z + E.d / 2, w: E.w, h: E.h, d: E.d, stock: 'cover', c: '#f8f2e6', side: '#f8f2e6', noTop: true }).filter(p => !p.id.endsWith('front'));
  const eRoof = gableRoof('entry-roof', x, ez - 12, E.w / 2, E.peak, E.h, E.d - 12, tone(INDIGO, -.5), 10);
  const room: Panel = { id: 'entry-room', stock: 'cover', c: LIT, w: E.door + 14, h: E.dh + 6, o: [x - E.door / 2 - 7, 0, ez - 20], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: 1, density: 1.2 };
  const leaf = (id: string, ox: number, edge: 'left' | 'right'): Panel => hinged({ id, stock: 'cover', c: INDIGO, w: E.door / 2, h: E.dh, o: [ox, 0, ez + .8], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, motion: { when: 'gallery-door', edge, deg: edge === 'left' ? 74 : -74 }, mask: slot(E.door / 2, E.dh, [9, 12, E.door / 2 - 18, 104]), print: `<rect x="${edge === 'left' ? E.door / 2 - 9 : 3}" y="${E.dh - 70}" width="6" height="22" rx="3" fill="${YEL}"/>` }, edge, 0);

  // The listings in the window: six cards, for sale (yellow ribbon) or for rent (lavender ribbon). The tabs above the
  // window filter them: all, for sale, for rent. Pictograms only.
  const lx = x0 + win.list[0], ly = win.list[1];
  const cards = Array.from({ length: 6 }, (_, i): Panel => {
    const sale = [0, 3, 4].includes(i), col = i % 3, rw = Math.floor(i / 3), c = sale ? YEL : LAV;
    return { id: `listing-${i}`, stock: 'bond', c: '#fff', w: 50, h: 62, o: [lx + 9 + col * 56, ly + 80 - rw * 70, z + 3], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3, show: { toy: 'filter', at: sale ? [0, 1] : [0, 2] },
      print: `<rect width="50" height="62" fill="#fff"/><rect width="50" height="9" fill="${c}"/><g transform="translate(6 12) scale(1.26)">${house([CREAM, '#e9cdb4', LAV, '#d9e6f2', STONE, '#f0dcc0'][i], [BRICK, INDIGO, STEEL, BRICK, INDIGO, STEEL][i])}</g><rect x="6" y="50" width="${22 + (i % 3) * 6}" height="3.5" fill="#b9b2a6"/><rect x="6" y="56" width="14" height="3" fill="${tone(c, -.2)}"/>` };
  });
  const icons = [`<g fill="${INDIGO}"><rect x="13" y="6" width="7" height="7"/><rect x="23" y="6" width="7" height="7"/><rect x="13" y="15" width="7" height="7"/><rect x="23" y="15" width="7" height="7"/></g>`,
    `<path d="M11 14L20 5H32V17L23 26Z" fill="${STEEL}"/><circle cx="27.5" cy="9.5" r="2.4" fill="${YEL}"/>`,
    `<circle cx="15" cy="14" r="7" fill="none" stroke="${STEEL}" stroke-width="4"/><path d="M22 14H35M30 14V20M34 14V19" stroke="${STEEL}" stroke-width="4" fill="none"/>`];
  const tabs = icons.map((icon, i): Panel => ({ id: `tab-${i}`, stock: 'cover', c: [CREAM, YEL, LAV][i], w: 44, h: 28, o: [lx + 14 + i * 54, ly + win.list[3] + 12, z + 2.4], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3,
    mask: '<path d="M0 28V7Q0 0 7 0H37Q44 0 44 7V28Z" fill="#fff"/>', print: icon, motion: { toy: 'filter', at: [i], slide: [0, 10, 0] } }));
  const rail = on(front, 1, win.list[0] - 4, win.list[1] + win.list[3] + 6, win.list[2] + 8, 8, { id: 'tab-rail', stock: 'cover', c: tone(INDIGO, -.3) });
  return [front, ...dress, ...walls, ...windows, ...roofs, eFront, ...eWalls, ...eRoof, room, leaf('gdoor-l', x - E.door / 2, 'left'), leaf('gdoor-r', x, 'right'), rail, ...tabs, ...cards];
}

/* ---------- the building site: Moperty's new block going up ---------- */
// A plywood hoarding with the site's boards on it; behind it the block rises one module at a time under a tower crane.
const SITE = { x: 850, z: -190, w: 290, d: 130, base: 130, mh: 64 };
function site(): Panel[] {
  const hx0 = 372, hw = 640, hh = 126, hz = -100;
  const hoard: Panel = { id: 'hoarding', stock: 'kraft', c: PLY, w: hw, h: hh, o: [hx0, 0, hz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5, split: 2,
    print: `<rect width="${hw}" height="${hh}" fill="${PLY}"/>${Array.from({ length: Math.floor(hw / 80) }, (_, i) => `<path d="M${(i + 1) * 80} 0V${hh}" stroke="#b98f5c" stroke-width="2"/>`).join('')}<rect width="${hw}" height="9" fill="${STEEL}"/>` +
      `<rect y="${hh - 18}" width="${hw}" height="18" fill="${YEL}"/>${Array.from({ length: Math.floor(hw / 36) }, (_, i) => `<path d="M${i * 36} ${hh}l14 -18h14l-14 18Z" fill="${STEEL}"/>`).join('')}` };
  // The drawing board: a pencil wireframe of the listing page; A paints it in.
  const bx = 570 - hx0 - 78, by = 22;
  const boardFrame = on(hoard, 1, bx - 6, by - 6, 168, 112, { id: 'canvas-frame', stock: 'cover', c: CREAM });
  const wire = `<rect width="156" height="100" fill="#fbf7ee"/><g fill="none" stroke="#9aa0a8" stroke-width="1.6" stroke-dasharray="5 3"><rect x="6" y="6" width="144" height="14"/><rect x="6" y="26" width="44" height="34"/><rect x="56" y="26" width="44" height="34"/><rect x="106" y="26" width="44" height="34"/><path d="M6 26L50 60M50 26L6 60M56 26L100 60M100 26L56 60M106 26L150 60M150 26L106 60"/><rect x="6" y="66" width="90" height="8"/><rect x="6" y="80" width="60" height="8"/><rect x="110" y="72" width="40" height="18" rx="9"/></g>`;
  const painted = `<rect width="156" height="100" fill="#fbf7ee"/><rect x="6" y="6" width="144" height="14" fill="${INDIGO}"/><g transform="translate(9 8) scale(.34)">${mark(1, '#fff', LAV, INDIGO)}</g><rect x="96" y="10" width="50" height="6" rx="3" fill="${LAV}"/>` +
    [0, 1, 2].map(k => `<rect x="${6 + k * 50}" y="26" width="44" height="34" fill="${['#dfe4fb', '#fdeec2', '#dfe4fb'][k]}"/><g transform="translate(${13 + k * 50} 28)">${house([CREAM, '#fff', LAV][k], [INDIGO, BRICK, STEEL][k])}</g>`).join('') +
    `<rect x="6" y="66" width="90" height="8" fill="${STEEL}"/><rect x="6" y="80" width="60" height="8" fill="#b9b2a6"/><rect x="110" y="72" width="40" height="18" rx="9" fill="${YEL}"/>`;
  const canvases = [wire, painted].map((print, i): Panel => ({ id: `canvas-${i}`, stock: 'bond', c: '#fbf7ee', w: 156, h: 100, o: [hx0 + bx, by, hz + 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.6, print, show: { toy: 'paint', at: [i] } }));
  // The site board: the mark, and the six tools as label bars.
  const sb = 760 - hx0 - 56;
  const board = on(hoard, 1.2, sb, 20, 112, 96, { id: 'site-board', stock: 'cover', c: CREAM, density: 2.6,
    print: `<rect width="112" height="96" fill="${CREAM}"/><rect width="112" height="26" fill="${INDIGO}"/><g transform="translate(8 5) scale(.55)">${mark(1, '#fff', LAV, INDIGO)}</g><rect x="38" y="10" width="62" height="6" rx="3" fill="#fff"/>` +
      Object.values(TECH).map((c, i) => `<rect x="${10 + (i % 2) * 50}" y="${36 + Math.floor(i / 2) * 19}" width="10" height="11" fill="${c}"/><rect x="${23 + (i % 2) * 50}" y="${39 + Math.floor(i / 2) * 19}" width="${22 + (i % 3) * 4}" height="5" fill="#b9b2a6"/>`).join('') });
  // A hard-hat sign by the gate end.
  const hat = on(hoard, 1, hw - 86, 30, 60, 60, { id: 'site-sign', stock: 'cover', c: INDIGO, mask: '<circle cx="30" cy="30" r="30" fill="#fff"/>', print: `<circle cx="30" cy="30" r="25" fill="#fff"/><path d="M14 36Q14 18 30 18Q46 18 46 36Z" fill="${YEL}"/><rect x="10" y="36" width="40" height="6" rx="3" fill="${tone(YEL, -.2)}"/>` });

  // Behind the hoarding: a podium, scaffolding, and the modules.
  const { x, z, w, d, base, mh } = SITE;
  const podium = box({ id: 'site-podium', x, z, w: w + 40, h: base, d: d + 30, stock: 'greyboard', c: '#b9b3a8', density: .8 });
  const SW = 400, SHh = 400, cell = 50;
  const scaffoldMask = Array.from({ length: SW / cell + 1 }, (_, i) => `<rect x="${Math.min(i * cell, SW - 5)}" width="5" height="${SHh}" fill="#fff"/>`).join('') + Array.from({ length: 6 }, (_, i) => `<rect y="${20 + i * 68}" width="${SW}" height="5" fill="#fff"/>`).join('') +
    [0, 2, 5, 7].map(i => bar(i * cell + 2, 360, i * cell + 48, 230, 3) + bar(i * cell + 48, 224, i * cell + 2, 92, 3)).join('');
  const scaffold: Panel = { id: 'scaffold', stock: 'greyboard', c: '#8e96a3', w: SW, h: SHh, o: [x - SW / 2, 0, z - d / 2 - 12], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .9, mask: scaffoldMask };
  // Each module is a folded box: the backend base, two front-end floors, then the roof.
  const floor = (c: string, trim: string, labels: [string, string][]) => (fw: number) => `<rect width="${fw}" height="${mh}" fill="${c}"/><rect width="${fw}" height="8" fill="${trim}"/><rect y="${mh - 6}" width="${fw}" height="6" fill="${trim}"/>` +
    Array.from({ length: Math.floor((fw - 20) / 46) }, (_, i) => `<rect x="${14 + i * 46}" y="16" width="30" height="34" fill="${GLASS}"/><rect x="${14 + i * 46}" y="16" width="30" height="11" fill="#8fb3c9"/>`).join('') +
    (fw > 200 ? labels.map(([name, col], k) => `<g transform="translate(${fw - 86} ${14 + k * 20})"><rect width="78" height="17" fill="#fbf7ee"/><rect width="8" height="17" fill="${col}"/><text x="13" y="12.6" font-family="Fredoka" font-weight="600" font-size="10" fill="${INK}">${name}</text></g>`).join('') : '');
  const MODS: { id: string; art: (fw: number) => string; c: string }[] = [
    { id: 'base', c: '#c9c2b6', art: floor('#c9c2b6', '#a8a195', [['POSTGRES', TECH.postgres], ['LARAVEL', TECH.laravel]]) },
    { id: 'f1', c: LAV, art: floor(LAV, tone(LAV, -.25), [['VUE', TECH.vue]]) },
    { id: 'f2', c: CREAM, art: floor(CREAM, '#e2d2b8', [['SASS', TECH.sass]]) }];
  const placed = MODS.flatMap((m, i) => box({ id: `mod-${m.id}`, x, z, y: base + i * mh, w, h: mh, d, stock: 'cover', c: m.c, front: m.art(w), left: m.art(d), right: m.art(d), density: 1.5 }).map(p => ({ ...p, show: { toy: 'build', at: [0, 1, 2, 3].slice(i) } })));
  const ry = base + 3 * mh, roofArt = (fw: number) => `<rect width="${fw}" height="30" fill="${INDIGO}"/><rect width="${fw}" height="7" fill="${tone(INDIGO, -.3)}"/>` + (fw > 200 ? [['NGINX', TECH.nginx], ['GOOGLE CLOUD', TECH.gcloud]].map(([name, col], k) => `<g transform="translate(${16 + k * 96} 10)"><rect width="${k ? 108 : 60}" height="15" fill="#fbf7ee"/><rect width="8" height="15" fill="${col}"/><text x="13" y="11.4" font-family="Fredoka" font-weight="600" font-size="9.5" fill="${INK}">${name}</text></g>`).join('') : '');
  const roof = [...box({ id: 'mod-roof', x, z, y: ry, w: w + 24, h: 30, d: d + 20, stock: 'cover', c: INDIGO, front: roofArt(w + 24), top: `<rect width="${w + 24}" height="${d + 20}" fill="${tone(INDIGO, -.2)}"/><rect x="20" y="20" width="90" height="60" fill="#8fc49a"/><rect x="200" y="30" width="70" height="50" fill="#c9ccd1"/>`, density: 1.5 }),
    // The lit roof sign: the mark, standing on the finished block.
    { id: 'mod-roof-sign', stock: 'vellum', c: '#fff4c2', w: 110, h: 76, o: [x - 55, ry + 30, z + 20], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', emit: .5, density: 2, mask: `<g transform="translate(4 0) scale(2.4)"><path d="M0 9L7 0H14L21 9L28 0H35L42 9V30H0Z" fill="#fff"/></g><rect x="10" y="68" width="6" height="8" fill="#fff"/><rect x="94" y="68" width="6" height="8" fill="#fff"/>`, print: `<g transform="translate(4 0)">${mark(2.4, INDIGO, LAV, '#fff4c2')}</g><rect y="72" width="110" height="4" fill="${STEEL}"/>` } as Panel]
    .map(p => ({ ...p, show: { toy: 'build', at: [3] } }));
  // The tower crane: a lattice mast and jib, cut flat, with the next module on its hook.
  const jy = 404, mx = x + 190, lattice = (len: number, t: number, vertical: boolean) => {
    const seg = (a: number, b: number, c: number, e: number) => (vertical ? bar(a, b, c, e, 3.4) : bar(b, a, e, c, 3.4));
    return seg(2, 0, 2, len) + seg(t - 2, 0, t - 2, len) + Array.from({ length: Math.floor(len / t) }, (_, i) => seg(2, i * t, t - 2, (i + 1) * t) + seg(2, (i + 1) * t, t - 2, (i + 1) * t)).join('');
  };
  const mast: Panel = { id: 'crane-mast', stock: 'cover', c: YEL, w: 40, h: jy + 60, o: [mx - 20, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, mask: lattice(jy + 60, 40, true) };
  const jl = 520, jib: Panel = { id: 'crane-jib', stock: 'cover', c: YEL, w: jl, h: 62, o: [mx - 400, jy, z + 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
    mask: `<g transform="translate(0 30)">${lattice(jl, 32, false)}</g>${bar(400, 4, 20, 34, 3)}${bar(400, 4, 500, 34, 3)}<rect x="394" width="12" height="34" fill="#fff"/><rect x="440" y="30" width="76" height="32" fill="#fff"/><rect x="372" y="34" width="36" height="28" fill="#fff"/>`,
    print: `<rect width="${jl}" height="62" fill="${YEL}"/><rect x="440" y="30" width="76" height="32" fill="#8e96a3"/><path d="M440 46h76M466 30v32M492 30v32" stroke="#6b7480" stroke-width="2"/><rect x="372" y="34" width="36" height="28" fill="${CREAM}"/><rect x="377" y="39" width="20" height="14" fill="${GLASS}"/>` };
  const hang = (i: number): Panel => {
    const bottom = base + i * mh + 34, isRoof = i === 3, mw = isRoof ? w + 24 : w, hgt = isRoof ? 30 : mh, H = jy + 30 - bottom, cy = H - hgt;
    const art = isRoof ? roofArt(mw) : MODS[i].art(mw);
    return { id: `hang-${i}`, stock: 'cover', c: isRoof ? INDIGO : MODS[i].c, w: mw, h: H, o: [x - mw / 2, bottom, z + 4], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5, show: { toy: 'build', at: [i - 1] },
      mask: `<rect x="${mw / 2 - 1.5}" width="3" height="${cy - 26}" fill="#fff"/>${bar(mw / 2, cy - 28, 24, cy, 2.4)}${bar(mw / 2, cy - 28, mw - 24, cy, 2.4)}<rect y="${cy}" width="${mw}" height="${hgt}" fill="#fff"/>`,
      print: `<rect width="${mw}" height="${cy}" fill="${STEEL}"/><g transform="translate(0 ${cy})">${art}</g>` };
  };
  const hook: Panel = { id: 'crane-hook', stock: 'cover', c: STEEL, w: 20, h: 70, o: [x - 10, jy - 40, z + 4], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5, show: { toy: 'build', at: [3] }, mask: '<rect x="8.5" width="3" height="52" fill="#fff"/><path d="M4 52H16V58Q16 68 8 68Q2 68 2 62H6Q6 64 8 64Q12 64 12 58V56H4Z" fill="#fff"/>' };
  return [hoard, boardFrame, ...canvases, board, hat, ...podium, scaffold, ...placed, ...roof, mast, jib, hang(1), hang(2), hang(3), hook];
}

/* ---------- freestanding street objects: folded volumes with cut pieces glued on ---------- */
// The finger-post at the avenue corner. Search is the magnifier on top; each A lifts the Moperty arrow one place.
function fingerPost(x: number, z: number): Panel[] {
  const post = box({ id: 'post', x, z, w: 9, h: 250, d: 9, stock: 'greyboard', c: STEEL, noTop: true });
  const arrowMask = '<path d="M0 0H104L122 16L104 32H0Z" fill="#fff"/>', slotY = [112, 150, 188];
  const arrow = (id: string, y: number, c: string, print: string, at: number[]): Panel => ({ id, stock: 'cover', c, w: 122, h: 32, o: [x + 2, y, z + 6], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.6, mask: arrowMask, print, show: { toy: 'rank', at } });
  const grey = (k: number) => `<rect width="122" height="32" fill="#eee6d8"/><rect x="10" y="9" width="${52 + k * 12}" height="5" fill="#b9b2a6"/><rect x="10" y="18" width="${36 + k * 8}" height="5" fill="#d3ccc0"/>`;
  const mine = `<rect width="122" height="32" fill="${INDIGO}"/><g transform="translate(9 5) scale(.74)">${mark(1, '#fff', LAV, INDIGO)}</g><rect x="46" y="9" width="48" height="5" fill="#fff"/><rect x="46" y="18" width="32" height="5" fill="${LAV}"/>`;
  const lens: Panel = { id: 'post-lens', stock: 'cover', c: STEEL, w: 62, h: 62, o: [x - 20, 236, z + 6], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4,
    mask: `<path fill-rule="evenodd" d="M2 24a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z M9 24a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z" fill="#fff"/>${bar(40, 40, 57, 57, 8)}`, print: `<rect width="62" height="62" fill="${STEEL}"/>${bar(40, 40, 57, 57, 8).replaceAll('#fff', YEL)}` };
  return [...post, lens,
    ...[0, 1, 2].map(i => arrow(`arrow-m-${i}`, slotY[i], INDIGO, mine, [i])),
    arrow('arrow-a', slotY[2], '#eee6d8', grey(0), [0, 1]), arrow('arrow-b', slotY[1], '#eee6d8', grey(1), [0, 2]), arrow('arrow-c', slotY[0], '#eee6d8', grey(2), [1, 2])];
}
// A street poster totem with a lit screen: the app in the browser, the map of the neighbourhood, then installed on the
// home screen.
function totem(x: number, z: number): Panel[] {
  const body = box({ id: 'totem', x, z, w: 84, h: 190, d: 26, stock: 'greyboard', c: STEEL, density: 1.6,
    front: `<rect width="84" height="190" fill="${STEEL}"/><rect y="0" width="84" height="26" fill="${INDIGO}"/><g transform="translate(27 5) scale(.56)">${mark(1, '#fff', LAV, INDIGO)}</g><rect y="172" width="84" height="18" fill="#454b55"/>` });
  const phone = (inner: string) => `<rect width="68" height="132" fill="#101318"/><rect x="4" y="5" width="60" height="122" rx="5" fill="#fbf7ee"/>${inner}`;
  const screens = [
    // The site in a browser: address bar, then listings.
    `<rect x="4" y="5" width="60" height="16" fill="#d9dde6"/><rect x="9" y="9" width="42" height="8" rx="4" fill="#fff"/><circle cx="57" cy="13" r="3" fill="${INDIGO}"/>` + [0, 1, 2].map(k => `<rect x="9" y="${27 + k * 33}" width="50" height="28" fill="${['#dfe4fb', '#fdeec2', '#dfe4fb'][k]}"/><g transform="translate(11 ${29 + k * 33}) scale(.8)">${house(CREAM, [INDIGO, BRICK, STEEL][k])}</g><rect x="38" y="${34 + k * 33}" width="18" height="4" fill="${STEEL}"/><rect x="38" y="${42 + k * 33}" width="12" height="4" fill="#b9b2a6"/>`).join(''),
    // The neighbourhood map with pins.
    `<rect x="4" y="5" width="60" height="122" rx="5" fill="#e4eed9"/><path d="M4 50H64M4 92H64M24 5V127M48 5V127" stroke="#fff" stroke-width="6"/><path d="M4 70Q30 60 64 78" stroke="#a9d8f0" stroke-width="8" fill="none"/>` + [[16, 34, YEL], [38, 66, LAV], [54, 30, YEL], [32, 108, LAV], [56, 104, YEL]].map(([px, py, c]) => `<path d="M${px} ${py}q-7 -9 0 -14q7 5 0 14Z" fill="${c}" stroke="${STEEL}" stroke-width="1.2"/>`).join(''),
    // Installed: the mark as an app icon on the home screen.
    `<rect x="4" y="5" width="60" height="122" rx="5" fill="${LAV}"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(k => k === 4 ? `<rect x="${24}" y="${52}" width="20" height="20" rx="5" fill="${INDIGO}"/><g transform="translate(27 56) scale(.34)">${mark(1, '#fff', LAV, INDIGO)}</g>` : `<rect x="${10 + (k % 3) * 18}" y="${16 + Math.floor(k / 3) * 22}" width="12" height="12" rx="3" fill="#fff" fill-opacity=".55"/>`).join('') + `<rect x="14" y="108" width="40" height="12" rx="6" fill="#fff" fill-opacity=".6"/>`];
  return [...body, ...screens.map((sc, i): Panel => ({ id: `screen-${i}`, stock: 'vellum', c: '#fbf7ee', w: 68, h: 132, o: [x - 34, 34, z + 14], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', emit: .45, density: 3, print: phone(sc), show: { toy: 'app', at: [i] } }))];
}
// A taxi folded from boxes: the body, the cabin set back on it, a lit roof sign, with wheels, bumpers and lamps glued on.
function taxi(id: string, x: number, z: number, rot: number): Panel[] {
  const P = piece(x, z, rot), R = yaw(rot), c = YEL, dark = tone(YEL, -.22);
  const body = box({ id: `${id}-body`, x, z, y: 16, w: 204, h: 44, d: 84, rot, stock: 'cover', c, side: c, density: 1.6,
    front: `<rect width="204" height="44" fill="${c}"/><rect y="14" width="204" height="8" fill="${STEEL}"/>${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 16 + (i % 2 ? 0 : 0)}" y="${i % 2 ? 14 : 18}" width="8" height="4" fill="${CREAM}"/>`).join('')}<path d="M70 0V44M134 0V44" stroke="${dark}" stroke-width="2"/><rect x="112" y="6" width="14" height="4" rx="2" fill="${dark}"/><path d="M14 44a24 24 0 0 1 48 0Z M142 44a24 24 0 0 1 48 0Z" fill="${STEEL}"/>`,
    right: `<rect width="84" height="44" fill="${dark}"/><rect x="8" y="22" width="68" height="14" fill="${STEEL}"/><rect x="6" y="6" width="18" height="10" rx="3" fill="#fff4e2"/><rect x="60" y="6" width="18" height="10" rx="3" fill="#fff4e2"/>`,
    top: `<rect width="204" height="84" fill="${tone(c, .18)}"/>` });
  const cb = add([x, 0, z], R([-12, 0, -2]));
  const glass = (w: number) => `<rect width="${w}" height="38" fill="${c}"/><rect x="6" y="6" width="${w - 12}" height="26" fill="#bfe0f2"/><rect x="${w / 2 - 3}" y="6" width="6" height="26" fill="${c}"/>`;
  const cabin = box({ id: `${id}-cabin`, x: cb[0], z: cb[2], y: 60, w: 112, h: 38, d: 76, rot, stock: 'cover', c, side: dark, density: 1.6, front: glass(112), right: glass(76).replace(`<rect x="${76 / 2 - 3}" y="6" width="6" height="26" fill="${c}"/>`, ''), top: `<rect width="112" height="76" fill="${tone(c, .18)}"/>` });
  const sign = box({ id: `${id}-sign`, x: cb[0], z: cb[2], y: 98, w: 40, h: 14, d: 14, rot, stock: 'vellum', c: '#fff4c2', density: 2, front: `<rect width="40" height="14" fill="#fff4c2"/>${[0, 1, 2, 3].map(k => `<rect x="${4 + k * 9}" y="${k % 2 ? 7 : 3}" width="5" height="4" fill="${STEEL}"/>`).join('')}` });
  const wheel = (k: string, cx: number) => {
    const w = P(`${id}-wheel-${k}`, [cx - 20, 0, 43.5], [1, 0, 0], [0, 1, 0], 40, 40, { stock: 'greyboard', c: STEEL, mask: disc(20) });
    return [w, on(w, 1.2, 8, 8, 24, 24, { id: `${id}-rim-${k}`, stock: 'cover', c: '#6b7480', mask: disc(12) }), on(w, 2.2, 14, 14, 12, 12, { id: `${id}-hub-${k}`, stock: 'cover', c: '#d9dde6', mask: disc(6) })];
  };
  const front = body.find(p => p.id.endsWith('front'))!;
  const bits = [on(front, 1, 0, 0, 204, 7, { id: `${id}-sill`, stock: 'cover', c: STEEL }), on(front, 1.4, 196, 22, 8, 12, { id: `${id}-lamp`, stock: 'vellum', c: '#fff4e2', emit: .4, mask: '<rect width="8" height="12" rx="3" fill="#fff"/>' }), on(front, 1.4, 0, 22, 6, 12, { id: `${id}-tail`, stock: 'vellum', c: '#e8552d', emit: .3, mask: '<rect width="6" height="12" rx="3" fill="#fff"/>' })];
  return [...body, ...cabin, ...sign, ...wheel('r', -64), ...wheel('f', 64), ...bits];
}
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
// A traffic cone: two identical cards slotted together at right angles.
function cone(id: string, x: number, z: number): Panel[] {
  const shape = '<path d="M11 0H19L27 36H30V42H0V36H3Z" fill="#fff"/>', print = `<rect width="30" height="42" fill="${YEL}"/><rect y="12" width="30" height="8" fill="${CREAM}"/><rect y="36" width="30" height="6" fill="${STEEL}"/>`;
  return [45, -45].map((d, i) => { const R = yaw(d); return toCamera({ id: `${id}-${i}`, stock: 'cover', c: YEL, w: 30, h: 42, o: add([x, 0, z], R([-15, 0, 0])), u: R([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2.2, mask: shape, print }); });
}
// A site barrier: a striped board on two folded feet.
function barrier(id: string, x: number, z: number, rot: number): Panel[] {
  const P = piece(x, z, rot);
  const frame = P(`${id}-frame`, [-64, 0, 0], [1, 0, 0], [0, 1, 0], 128, 62, { stock: 'greyboard', c: STEEL, mask: `${bar(12, 4, 4, 60, 5)}${bar(12, 4, 22, 60, 5)}${bar(116, 4, 106, 60, 5)}${bar(116, 4, 124, 60, 5)}<rect x="4" y="8" width="120" height="24" fill="#fff"/>` });
  return [frame, on(frame, 1, 4, 30, 120, 24, { id: `${id}-board`, stock: 'cover', c: CREAM, print: Array.from({ length: 6 }, (_, i) => `<path d="M${i * 24 - 4} 24l12 -24h12l-12 24Z" fill="${YEL}"/>`).join('') })];
}
// A fire hydrant: a folded box with a cap, and two nozzle discs glued on.
function hydrant(id: string, x: number, z: number): Panel[] {
  const b = box({ id, x, z, w: 22, h: 38, d: 22, stock: 'cover', c: YEL, front: `<rect y="8" width="22" height="5" fill="${tone(YEL, -.2)}"/>` });
  const cap = box({ id: `${id}-cap`, x, z, y: 38, w: 28, h: 7, d: 28, stock: 'cover', c: STEEL });
  return [...b, ...cap, on(b[0], 1.2, 6, 16, 10, 10, { id: `${id}-nozzle`, stock: 'cover', c: STEEL, mask: disc(5) })];
}
// A traffic signal: a folded head on a post, its three lenses cut from vellum and glued on.
function signal(id: string, x: number, z: number): Panel[] {
  const post = box({ id: `${id}-post`, x, z, w: 9, h: 190, d: 9, stock: 'greyboard', c: STEEL, noTop: true });
  const head = box({ id: `${id}-head`, x, z: z + 2, y: 190, w: 30, h: 78, d: 22, stock: 'greyboard', c: STEEL, density: 2 });
  return [...post, ...head, ...['#e8552d', YEL, '#35b58a'].map((c, i) => on(head[0], 1, 7, 54 - i * 24, 16, 16, { id: `${id}-lens${i}`, stock: 'vellum', c, emit: i === 2 ? .7 : .15, mask: disc(8) }))];
}
// A pallet of bricks waiting by the site.
const bricksStack = (id: string, x: number, z: number) => {
  const face = (w: number) => `<rect width="${w}" height="46" fill="${BRICK}"/>${Array.from({ length: 4 }, (_, rw) => Array.from({ length: Math.ceil(w / 22) + 1 }, (_, i) => `<rect x="${i * 22 - (rw % 2) * 11 + 1}" y="${rw * 11.5 + 1}" width="20" height="9.5" fill="${rw % 2 ? '#c0785c' : '#a85c44'}"/>`).join('')).join('')}`;
  return [...box({ id: `${id}-pallet`, x, z, w: 96, h: 10, d: 70, stock: 'kraft', c: '#b98450' }), ...box({ id, x, z, y: 10, w: 88, h: 46, d: 62, stock: 'cover', c: BRICK, front: face(88), left: face(62), right: face(62), top: `<rect width="88" height="62" fill="#c0785c"/><path d="M0 21H88M0 42H88M22 0V62M44 0V62M66 0V62" stroke="#a85c44" stroke-width="2"/>` })];
};

/* ---------- the buildings that close the corner, and everything standing on the pavement ---------- */
function surroundings(): Panel[] {
  // Left: a brick walk-up with a bakery on the ground floor and a flat to let upstairs.
  const L = frame(-960, 280, 80), LW = 560, LH = 470, g = 176;
  const lWin = (x: number, y: number, lit: boolean) => `<rect x="${x}" y="${LH - y - 96}" width="74" height="96" fill="${CREAM}"/><rect x="${x + 6}" y="${LH - y - 90}" width="62" height="84" fill="${lit ? LIT : GLASS}"/><path d="M${x + 37} ${LH - y - 90}v84M${x + 6} ${LH - y - 48}h62" stroke="${CREAM}" stroke-width="4"/>`;
  const lFront: Panel = { id: 'left-front', stock: 'cover', c: BRICK, w: LW, h: LH, o: L.o, u: L.u, v: [0, 1, 0], edge: 'cut', density: .9,
    mask: `<path d="M0 ${LH}V30H${LW * .3}V0H${LW * .7}V30H${LW}V${LH}Z" fill="#fff"/>`,
    print: `<rect width="${LW}" height="${LH}" fill="${BRICK}"/>${Array.from({ length: 22 }, (_, i) => `<path d="M0 ${34 + i * 12}H${LW}" stroke="#9c5640" stroke-width="1.6"/>`).join('')}<rect y="${LH - g}" width="${LW}" height="${g}" fill="${STONE}"/><rect y="${LH - g - 8}" width="${LW}" height="10" fill="#cdb48c"/><rect y="${LH - 14}" width="${LW}" height="14" fill="#b9a27c"/>` +
      [40, 176, 312, 448].map((x, i) => lWin(x, 196, i === 1) + lWin(x, 322, i === 2)).join('') +
      // The bakery's window and door.
      `<rect x="30" y="${LH - 150}" width="290" height="136" fill="${LIT}"/><path d="M30 ${LH - 56}h290" stroke="#b9a27c" stroke-width="5"/>${[0, 1, 2, 3, 4].map(k => `<ellipse cx="${64 + k * 54}" cy="${LH - 70}" rx="20" ry="11" fill="${['#c98a4e', '#d9a15e', '#b97a3e', '#d9a15e', '#c98a4e'][k]}"/>`).join('')}${[0, 1, 2, 3].map(k => `<rect x="${52 + k * 66}" y="${LH - 128}" width="40" height="30" rx="14" fill="#e3b574"/>`).join('')}` +
      `<rect x="362" y="${LH - 156}" width="84" height="142" fill="${tone(INDIGO, -.35)}"/><rect x="372" y="${LH - 146}" width="64" height="70" fill="${LIT}"/><rect x="476" y="${LH - 150}" width="64" height="136" fill="${LIT}"/>` };
  const lEnd: Panel = { id: 'left-end', stock: 'cover', c: '#9c5640', w: 160, h: LH - 30, o: add(L.o, L.n, -160), u: L.n, v: [0, 1, 0], edge: 'fold', density: 1, print: `<rect y="${LH - 30 - g}" width="160" height="${g}" fill="#d3b98f"/><rect x="44" y="90" width="70" height="92" fill="${GLASS}"/>` };
  const lRelief = carved(lFront, [
    ...fawning(L, 'left-awning', 20, 210, 310, 70, 38, YEL), ...fawning(L, 'left-awning-b', 466, 206, 86, 50, 26, INDIGO, false),
    ...fblade(L, 'left-pretzel', 340, 232, 66, 66, CREAM, `<circle cx="33" cy="33" r="29" fill="${tone(YEL, .1)}"/><path d="M19 40Q14 22 33 22Q52 22 47 40Q40 50 33 38Q26 50 19 40Z" fill="none" stroke="#8a5a30" stroke-width="6"/>`, '<circle cx="33" cy="33" r="33" fill="#fff"/>'),
    ...fbalcony(L, 'left-balcony-a', 30, 318, 230, 46), ...fbalcony(L, 'left-balcony-b', 304, 318, 230, 46),
    ...[40, 176, 312, 448].flatMap((x, i) => fflowers(L, `left-flowers${i}`, x - 4, 180, 82)),
    // The flat to let: a lavender banner with a key, hung from the upper balcony.
    fflat(L, 'left-banner', 338, 232, 50, 60, 84, { c: LAV, density: 2, mask: '<path d="M0 0H60V70L30 84L0 70Z" fill="#fff"/>', print: `<rect width="60" height="8" fill="${tone(LAV, -.3)}"/><circle cx="30" cy="28" r="10" fill="none" stroke="${tone(INDIGO, -.3)}" stroke-width="5"/><path d="M30 38V64M30 52H40M30 60H38" stroke="${tone(INDIGO, -.3)}" stroke-width="5" fill="none"/>` }),
    ...flamp(L, 'left-lamp-a', 336, 120), ...flamp(L, 'left-lamp-b', 452, 120),
    ...fbox(L, 'left-cornice', 0, LH - 44, 0, LW, 14, 22, { c: STONE }), ...fbox(L, 'left-sill', 0, g, 0, LW, 8, 14, { c: '#cdb48c' })
  ]);

  // Right: the corner café, its terrace under a parasol.
  const R = frame(1080, -290, -72), RW = 600, RH = 400, cafe = '#3f5f7a';
  const rFront: Panel = { id: 'right-front', stock: 'cover', c: cafe, w: RW, h: RH, o: R.o, u: R.u, v: [0, 1, 0], edge: 'cut', density: .9,
    print: `<rect width="${RW}" height="${RH}" fill="#f1e4cf"/>${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${20 + i * 20}H${RW}" stroke="#e2d2b8" stroke-width="2"/>`).join('')}<rect y="${RH - 206}" width="${RW}" height="206" fill="${cafe}"/><rect y="${RH - 212}" width="${RW}" height="8" fill="${tone(cafe, -.25)}"/>` +
      [40, 200, 360].map(x => `<rect x="${x}" y="${RH - 188}" width="140" height="150" fill="${LIT}"/><path d="M${x} ${RH - 118}h140" stroke="${cafe}" stroke-width="4"/>${[0, 1, 2].map(k => `<circle cx="${x + 30 + k * 40}" cy="${RH - 92}" r="10" fill="#5d4a3c"/><rect x="${x + 22 + k * 40}" y="${RH - 82}" width="16" height="30" fill="${[LAV, YEL, CREAM][k]}"/>`).join('')}`).join('') +
      `<rect x="520" y="${RH - 188}" width="60" height="188" fill="${tone(cafe, -.4)}"/>` + [40, 200, 360, 500].map(x => `<rect x="${x}" y="${RH - 360}" width="70" height="96" fill="${CREAM}"/><rect x="${x + 6}" y="${RH - 354}" width="58" height="84" fill="${GLASS}"/>`).join('') };
  const rRelief = carved(rFront, [
    ...[40, 200, 360].flatMap((x, i) => fawning(R, `right-awning-${i}`, x - 10, 228, 160, 70, 34, YEL)),
    ...fblade(R, 'right-cup', 504, 240, 66, 66, CREAM, `<circle cx="33" cy="33" r="30" fill="${CREAM}"/><rect x="20" y="22" width="22" height="22" rx="4" fill="${cafe}"/><path d="M42 27q8 0 8 6t-8 6" stroke="${cafe}" stroke-width="4" fill="none"/>`, '<circle cx="33" cy="33" r="33" fill="#fff"/>'),
    ...[40, 200, 360, 500].flatMap((x, i) => fflowers(R, `right-flowers${i}`, x - 4, 118, 78)),
    ...fbox(R, 'right-menu', 446, 0, 30, 50, 90, 8, { c: INK, front: `<rect x="5" y="8" width="40" height="60" fill="#3d444e"/>${[0, 1, 2, 3, 4].map(k => `<rect x="10" y="${14 + k * 10}" width="${20 + (k % 2) * 8}" height="3" fill="${CREAM}"/>`).join('')}` }),
    ...[0, 1].flatMap(k => fbox(R, `right-planter${k}`, 20 + k * 470, 0, 4, 60, 44, 40, { c: '#3d4a5a' })), ...[0, 1].map(k => fflat(R, `right-shrub${k}`, 16 + k * 470, 40, 26, 68, 50, { stock: 'sugar', c: FROND, mask: `<path d="${scallopBlob(68, 70, 8)}" fill="#fff"/>` })),
    ...flamp(R, 'right-lamp', 190, 250), ...fbox(R, 'right-cornice', 0, RH - 20, 0, RW, 20, 20, { c: '#e2d2b8' })
  ]);

  // String lights over the mouth of the avenue, from the walk-up to the gallery.
  const la = fat(L, 500, 350, 4), lights = [festoon('lights-a', la, [G.x - G.w / 2 - 4, la[1], G.z + 4], 60)];

  // The way back: an arrow on a post at the left end of the pavement.
  const back: Panel = { id: 'out-arrow', stock: 'cover', c: YEL, w: 150, h: 126, density: 1.6, o: [-775, 0, 56], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', mask: `<path d="M66 126V74H44V74L4 40L44 8V24H146V58H82V126Z" fill="#fff"/>`, print: `<rect x="66" y="66" width="16" height="60" fill="${STEEL}"/><text x="92" y="48" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="15" fill="${INK}">BACK</text>` };

  return [lFront, lEnd, ...lRelief, rFront, ...rRelief, ...lights, back,
    // Left pavement: a shade tree over a bench, a bicycle against it, the signal at the crossing.
    ...shadeTree('tree-l', -790, -150, 270), ...planter('tree-l-bed', -790, -150, 96), ...bench('bench', -745, -70, 150), ...bicycle('bike', -752, -30, 6, INDIGO),
    ...signal('signal', -654, -46), ...hydrant('hydrant', 150, 170),
    // The avenue corner: the finger-post, and a bed of bushes against the gallery's side wall.
    ...fingerPost(-376, -64), ...planter('corner-bed', -318, -200, 90, 34), ...bush('corner-bush', -318, -206, 104, 60, 30),
    // The dog walker on the crossing.
    ...shopper('walker', -560, 96, { coat: '#35b58a', legs: '#3d444e', skin: '#f3c9a0', hair: '#8a5a3a', style: 'shorts', build: 'average', face: 'sleepy', shoes: '#f4f1ea' }, false, 1, 0, false), ...dog('dog', -486, 118, -32, '#c98a4e'),
    // In front of the gallery: a couple at the model window, pigeons by the door.
    ...shopper('buyer-a', 190, -24, { coat: '#e88ab0', legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', style: 'dress', face: 'surprised', carry: YEL }, true),
    ...shopper('buyer-b', 250, -30, { coat: '#22324a', legs: '#3d444e', skin: '#f3c9a0', hair: '#4a2c1a', build: 'big', face: 'determined' }, false, 1, 0, false),
    ...pigeon('pigeon-a', -40, 96, -20, '#9aa3ad'), ...pigeon('pigeon-b', 6, 112, 16, '#b3bac3', true),
    // The poster totem between the gallery and the site.
    ...totem(430, -66),
    // The site: the painter at the drawing board, the forewoman by the barrier, bricks and cones.
    ...site(),
    ...shopper('painter', 668, -64, { coat: '#f4f1ea', legs: '#5b6bdc', skin: '#a8714f', hair: '#1d1a17', hat: LAV, face: 'cheerful', carry: INDIGO, build: 'average' }, true),
    ...shopper('foreman', 986, -40, { coat: YEL, legs: '#3d444e', skin: '#c99a7a', hair: '#2b2622', hat: '#f4f1ea', build: 'big', face: 'shout', tache: '#2b2622' }, true, 1, 0, false),
    ...bricksStack('bricks', 1010, -150), ...barrier('barrier', 930, 30, -14), ...cone('cone-a', 842, 38), ...cone('cone-b', 1016, 60),
    // The café terrace: a table under a parasol, a guest asleep in the sun, a tree at the corner.
    ...parasolTable('cafe-a', 1090, 110, YEL), ...shopper('guest', 1010, 150, { coat: LAV, legs: '#f4f1ea', skin: '#f3c9a0', hair: '#8a5a3a', style: 'dress', build: 'average', face: 'sleepy' }, false, 1, -20, false),
    ...shadeTree('tree-r', 1250, 250, 330), ...planter('tree-r-bed', 1250, 250, 110),
    // The kerb: lamps, a commuter waiting to cross, a taxi at the stand, a low bed of bushes at the front edge.
    ...streetLamp('lamp-a', -900, 180, 250, '#ffe7a8'), ...streetLamp('lamp-b', 1150, 184, 250, '#ffe7a8'),
    ...shopper('commuter', 356, 156, { coat: '#2bb5b8', legs: '#c8915a', skin: '#a8714f', hair: '#1d1a17', style: 'shorts', pack: INDIGO, hat: '#f4f1ea', build: 'average', face: 'cool' }, true, .95, 0, false),
    ...taxi('taxi', 230, 262, 0)];
}

export function downtown(): Scene {
  return { id: 'downtown', density: 2.1, camera: { zoom: 1, x0: -400, x1: 520 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] },
    panels: [...backdrop(), ...ground(), ...avenueView(), ...gallery(), ...surroundings()] };
}
