import { add, backOf, box, normal, on, slot, tilted, yaw, type Lamp, type Panel, type Scene, type V3 } from '../kit.ts';
import { CORAL, CREAM, FOLIAGE, INK, SUN, reseed, rnd, specks } from '../recipes.ts';
import { card, streetLamp } from './street.ts';

// Moperty: a downtown block at golden hour. The palette is the logo's: indigo, lavender and window yellow, on brick and stone.
export const INDIGO = '#5b6bdc', LAVENDER = '#a3adf2', GLOW = '#f5b400', WORD = '#7b88ea', INDIGO_DARK = '#3d4aa8';
const BRICK = '#b0664c', BRICK_LINE = '#8f4f3a', STONE = '#e3c9a0', STEEL = '#2f343c', LIT = '#f7d48a', DARK_PANE = '#465479', TAXI = '#f2c14e';
type Kind = 'sale' | 'rent';
const LISTINGS: { id: string; kind: Kind; flag: [number, number] }[] = [
  { id: 'west', kind: 'rent', flag: [-760, -62] }, { id: 'cafe', kind: 'rent', flag: [-236, -60] },
  { id: 'brownstone', kind: 'sale', flag: [470, -70] }, { id: 'site', kind: 'sale', flag: [580, -50] }];
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

// Open surroundings above the low block: a dusk skyline of towers in flat cut rows, paler with distance, under a warm
// banded sky with two tones of cut cloud. Far enough to stay put, so the stack bakes into the CSS backdrop.
function backdrop(): Panel[] {
  reseed(17);
  const FAR = .72;
  const layer = (id: string, z: number, y: number, w: number, h: number, c: string, mask: string, print = ''): Panel => ({ id, stock: 'sugar', c, w, h, o: [-w / 2 + 120, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FAR, mask, print, decal: 'sky' });
  // A row of towers: slabs with stepped crowns, spires, masts and tanks, each its own tone, windows lit at random.
  const towers = (w: number, h: number, seed: number, lo: number, hi: number, cols: string[], lit: number, glow: string) => {
    far = seed; let x = -fr(0, 60), mask = '', print = '';
    while (x < w) {
      const bw = fr(70, 170), bh = fr(lo, hi), top = h - bh, c = cols[Math.floor(fr(0, cols.length))], kind = Math.floor(fr(0, 5));
      let crown = '';
      if (kind === 0) crown = `<rect x="${x + bw * .18}" y="${top - 34}" width="${bw * .64}" height="36" FILL/><rect x="${x + bw * .32}" y="${top - 62}" width="${bw * .36}" height="30" FILL/><rect x="${x + bw * .47}" y="${top - 110}" width="${bw * .06}" height="50" FILL/>`;
      if (kind === 1) crown = `<path d="M${x + bw * .2} ${top}L${x + bw * .5} ${top - bw * .7}L${x + bw * .8} ${top}Z" FILL/>`;
      if (kind === 2) crown = `<rect x="${x + bw * .6}" y="${top - 44}" width="26" height="30" FILL/><rect x="${x + bw * .6 + 2}" y="${top - 14}" width="3" height="14" FILL/><rect x="${x + bw * .6 + 21}" y="${top - 14}" width="3" height="14" FILL/>`;
      if (kind === 3) crown = `<rect x="${x + bw * .3}" y="${top - 70}" width="3" height="70" FILL/><rect x="${x + bw * .3 - 10}" y="${top - 50}" width="23" height="3" FILL/>`;
      mask += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="#fff"/>` + crown.replaceAll('FILL', 'fill="#fff"');
      print += `<rect x="${x.toFixed(0)}" y="${(top - 120).toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${(bh + 120).toFixed(0)}" fill="${c}"/><rect x="${(x + bw * .62).toFixed(0)}" y="${top.toFixed(0)}" width="${(bw * .38).toFixed(0)}" height="${bh.toFixed(0)}" fill="#000" fill-opacity=".08"/>`;
      for (let wy = top + 16; wy < h - 10; wy += 20) for (let wx = x + 7; wx < x + bw - 9; wx += 12) if (fr(0, 1) < lit) print += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="5" height="9" fill="${fr(0, 1) > .3 ? glow : '#fff2d6'}"/>`;
      x += bw + fr(-14, 10);
    }
    return { mask, print };
  };
  const far1 = towers(4400, 900, 9, 420, 820, ['#d9c6d6', '#d1c0d9', '#e0cdd6'], .18, '#f7e3c4');
  const far2 = towers(4100, 760, 21, 320, 680, ['#b4a8c8', '#a99fc2', '#bcaecb'], .3, '#fbd99a');
  const mid = towers(3900, 620, 33, 240, 560, ['#8b84ae', '#7f7aa6', '#958cb2'], .38, '#ffd27a');
  const near = towers(3700, 480, 47, 180, 440, ['#625f8a', '#57557f', '#6b6690'], .45, '#ffc861');
  const cloudBank = (x: number, y: number, k: number, c: string) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 60Q-8 30 30 30Q36 0 74 8Q100 -14 132 12Q170 2 178 32Q214 30 212 60Z" fill="${c}"/>`;
  return [
    { id: 'sky', backdrop: true, stock: 'cover', c: '#c6b3d4', w: 5200, h: 1500, o: [-2480, -160, -780], u: [1, 0, 0], v: [0, 1, 0], density: FAR,
      // Dusk in flat steps, lavender overhead to apricot at the horizon; the low sun sits upper left, where the light comes from.
      print: `<rect y="560" width="5200" height="120" fill="#d2bdd6"/><rect y="680" width="5200" height="110" fill="#e6c3c8"/><rect y="790" width="5200" height="110" fill="#f3cbb4"/><rect y="900" width="5200" height="600" fill="#f8d6a6"/><circle cx="1260" cy="800" r="80" fill="#fbe2b0"/><circle cx="1260" cy="800" r="58" fill="#f9c873"/>` },
    layer('clouds-far', -770, 560, 5000, 260, '#efc8bf', [cloudBank(300, 40, 1.4, '#fff'), cloudBank(1700, 10, 1.8, '#fff'), cloudBank(3000, 60, 1.2, '#fff'), cloudBank(3900, 20, 1.6, '#fff')].join(''), ''),
    layer('clouds-near', -755, 600, 5000, 220, '#f9dccb', [cloudBank(800, 60, 1.1, '#fff'), cloudBank(2300, 30, 1.5, '#fff'), cloudBank(3500, 80, .9, '#fff'), cloudBank(4400, 40, 1.2, '#fff')].join(''), ''),
    layer('towers-far', -720, 0, 4400, 900, '#d9c6d6', far1.mask, far1.print),
    layer('towers-far2', -680, 0, 4100, 760, '#b4a8c8', far2.mask, far2.print),
    layer('towers-mid', -630, 0, 3900, 620, '#8b84ae', mid.mask, mid.print),
    layer('towers-near', -580, 0, 3700, 480, '#625f8a', near.mask, near.print)
  ];
}

// The street crosses an avenue on the left. Pavement for walking, the kerb and road in front; the avenue runs back
// between the blocks, its own pavements printed down both sides.
const AVENUE = { x0: -650, x1: -450 };
function ground(): Panel[] {
  reseed(5);
  const ax = 1920 + AVENUE.x0, aw = AVENUE.x1 - AVENUE.x0;
  const base: Panel = { id: 'road', stock: 'greyboard', c: '#5d616b', w: 4000, h: 1100, o: [-1920, 0, 330], u: [1, 0, 0], v: [0, 0, -1], density: .45, edge: 'fold', split: 4,
    print: specks(4000, 1100, '#4d515a', 600, 4) + Array.from({ length: 36 }, (_, i) => `<rect x="${i * 112}" y="${1100 - 76}" width="60" height="6" fill="${TAXI}"/>`).join('')
      + [[1500, 1100 - 40], [2400, 1100 - 110], [2900, 1100 - 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#4a4d55"/><circle cx="${x}" cy="${y}" r="20" fill="none" stroke="#6a6e77" stroke-width="2"/><path d="M${x - 14} ${y}H${x + 14}M${x} ${y - 14}V${y + 14}" stroke="#6a6e77" stroke-width="2"/>`).join('')
      + [1800, 2250, 2700].map(x => `<rect x="${x}" y="${1100 - 142}" width="44" height="10" fill="#2d3036"/><path d="M${x + 6} ${1100 - 142}v10M${x + 14} ${1100 - 142}v10M${x + 22} ${1100 - 142}v10M${x + 30} ${1100 - 142}v10M${x + 38} ${1100 - 142}v10" stroke="#5d616b" stroke-width="2"/>`).join('')
      // The avenue: its pavements, centre line and a crossing at its mouth.
      + `<rect x="${ax - 40}" y="0" width="40" height="${1100 - 360}" fill="#cfc6b6"/><rect x="${ax + aw}" y="0" width="40" height="${1100 - 360}" fill="#cfc6b6"/>`
      + Array.from({ length: 8 }, (_, i) => `<rect x="${ax + aw / 2 - 3}" y="${i * 80}" width="6" height="44" fill="${TAXI}"/>`).join('')
      + Array.from({ length: 6 }, (_, i) => `<rect x="${ax + 10 + i * 32}" y="${1100 - 400}" width="18" height="40" fill="#f1ece0"/>`).join('') };
  const skirt: Panel = { id: 'road-skirt', stock: 'greyboard', c: '#41444b', w: 4000, h: 70, o: [-1920, -70, 331], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2 };
  const pw = 4000, ph = 957, cut = 330 - 143 - (-30);
  const paver = on(base, .7, 0, 143, pw, ph, { id: 'pavement', stock: 'greyboard', c: '#ddd5c6', edge: 'cut', density: .45,
    mask: `<path fill-rule="evenodd" d="M0 0H${pw}V${ph}H0Z M${ax} 0V${ph - cut}H${ax + aw}V0Z" fill="#fff"/>`,
    print: Array.from({ length: 50 }, (_, i) => `<path d="M${(i + 1) * 80} 0V${ph}" stroke="#bdb3a1" stroke-width="2.2"/>`).join('') + Array.from({ length: 12 }, (_, i) => `<path d="M0 ${(i + 1) * 80}H${pw}" stroke="#bdb3a1" stroke-width="2"/>`).join('') + specks(pw, ph, '#b3a994', 260, 3) });
  const kerb = on(base, .9, 0, 143, 4000, 12, { id: 'kerb', stock: 'greyboard', c: '#c9c0ae', edge: 'cut', density: .6 });
  // Zebra crossings over the main road at both corners of the intersection.
  const zebra = (id: string, x: number) => on(base, .8, 1920 + x, 4, 150, 136, { id, stock: 'greyboard', c: '#f1ece0', edge: 'cut', density: .6, mask: Array.from({ length: 4 }, (_, i) => `<rect x="${i * 40}" width="22" height="136" fill="#fff"/>`).join('') });
  const door = on(base, .9, 1920 + GALLERY.x - 60, 330 - GALLERY.z - GALLERY.hd - 16, 120, 16, { id: 'gallery-step', stock: 'greyboard', c: '#cfc6b4', edge: 'cut', density: .8 });
  return [base, skirt, paver, kerb, zebra('zebra-a', AVENUE.x0 - 10), zebra('zebra-b', AVENUE.x1 - 140), door];
}

// The view down the avenue, built like the reference shadow box: seven depths of tower rows flanking the road, paler
// and taller with distance, the left row's avenue faces turned toward us, cars and lamps receding between them, a
// spire closing the view and paper cranes flying across. Every piece is real in the bake, so each layer shades the
// next; then all of it is painted onto one card along the camera's rays (carved), so it costs a single quad.
function avenueView(): Panel[] {
  const mid = (AVENUE.x0 + AVENUE.x1) / 2, half = (AVENUE.x1 - AVENUE.x0) / 2 + 30;
  const view: Panel = { id: 'avenue-view', stock: 'cover', c: '#b9aec9', w: 1500, h: 1150, o: [mid - 900, 0, -790], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .7, mask: '<rect width="1" height="1" fill="#fff"/>' };
  const out: Panel[] = [];
  const DEPTHS = [-260, -330, -400, -470, -540, -610, -690];
  const tone = (k: number, a: string[], b: string[]) => (k % 2 ? b : a)[k % 3 % (k % 2 ? b.length : a.length)];
  DEPTHS.forEach((z, k) => {
    far = 101 + k * 17;
    const t = k / (DEPTHS.length - 1);
    const deep = ['#6b6690', '#78739c', '#8680a8', '#958eb3', '#a59dbd', '#b8aecb', '#cbbfd8'][k], pale = ['#857ea4', '#918ab0', '#9e96ba', '#aca4c3', '#bbb2cc', '#cbc0d6', '#dacfe0'][k];
    for (const side of [-1, 1]) {
      let mask = '', print = ''; const rowW = 420, h = 1000, x0 = side < 0 ? mid - half - rowW : mid + half;
      let x = 0, edgeH = 0;
      while (x < rowW) {
        const bw = fr(70, 140) * (1 - t * .25), bh = fr(160, 270) + t * fr(380, 640), top = h - bh, c = fr(0, 1) > .5 ? deep : pale;
        mask += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="#fff"/>`;
        print += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="${c}"/><rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="7" fill="#000" fill-opacity=".14"/>`;
        for (let wy = top + 14; wy < h - 30; wy += 18) for (let wx = x + 6; wx < x + bw - 8; wx += 11) if (fr(0, 1) < .5 - t * .2) print += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="5" height="9" fill="${fr(0, 1) > .25 ? '#ffd27a' : '#fff1d0'}"/>`;
        if (fr(0, 1) > .6) { const cx = x + bw * fr(.3, .6); mask += `<rect x="${(cx - 12).toFixed(0)}" y="${(top - 30).toFixed(0)}" width="24" height="22" fill="#fff"/><rect x="${(cx - 10).toFixed(0)}" y="${(top - 8).toFixed(0)}" width="20" height="8" fill="#fff"/>`; print += `<rect x="${(cx - 12).toFixed(0)}" y="${(top - 30).toFixed(0)}" width="24" height="22" fill="#6e5546"/><path d="M${(cx - 12).toFixed(0)} ${(top - 22).toFixed(0)}h24M${(cx - 12).toFixed(0)} ${(top - 15).toFixed(0)}h24" stroke="#4a382e" stroke-width="2"/>`; }
        // Fire escapes zigzag down the nearest rows.
        if (k < 3 && fr(0, 1) > .4) for (let fy = top + 40; fy < h - 60; fy += 46) print += `<path d="M${(x + bw * .2).toFixed(0)} ${fy}h${(bw * .5).toFixed(0)}M${(x + bw * .25).toFixed(0)} ${fy}l${(bw * .4).toFixed(0)} 40" stroke="#2c2a40" stroke-width="2"/>`;
        if ((side < 0 && x + bw >= rowW) || (side > 0 && x === 0)) edgeH = bh;
        x += bw;
      }
      out.push({ id: `av-row${k}-${side < 0 ? 'l' : 'r'}`, stock: 'sugar', c: deep, w: rowW, h, o: [x0, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .6, mask, print });
      // The left row's last tower turns its long face to the avenue, toward us.
      if (side < 0) out.push({ id: `av-face${k}`, stock: 'sugar', c: pale, emit: .12, w: 66, h: edgeH, o: [mid - half, 0, z], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold', density: .6,
        print: Array.from({ length: Math.floor(edgeH / 18) }, (_, r) => Array.from({ length: 5 }, (_, q) => (q * 7 + r * 3 + k) % 5 < 2 ? `<rect x="${6 + q * 12}" y="${14 + r * 18}" width="5" height="9" fill="#ffd27a"/>` : '').join('')).join('') });
    }
    // Between the rows: cars seen from behind, a lamp each side and a little life on the pavements.
    if (k < 6) {
      const s = 1 - t * .3, lane = (k % 2 ? 1 : -1) * 34;
      out.push({ id: `av-car${k}`, stock: 'cover', c: k % 3 === 0 ? TAXI : ['#3a6ea8', '#c9c3b8', CORAL][k % 3], w: 56 * s, h: 34 * s, o: [mid + lane - 28 * s, 0, z + 30], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
        mask: `<path d="M4 34V16L12 4H44L52 16V34Z" transform="scale(${s})" fill="#fff"/>`, print: `<g transform="scale(${s})"><path d="M14 6H42L48 15H8Z" fill="${DARK_PANE}"/><rect x="6" y="20" width="8" height="5" fill="#e8552d"/><rect x="42" y="20" width="8" height="5" fill="#e8552d"/><rect x="4" y="28" width="48" height="6" fill="#23272d"/></g>` });
      for (const sd of [-1, 1]) out.push({ id: `av-lamp${k}${sd < 0 ? 'l' : 'r'}`, stock: 'greyboard', c: STEEL, w: 30, h: 120 * s, o: [mid + sd * (half - 18) - 15, 0, z + 20], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
        mask: `<path d="M${sd < 0 ? 4 : 24} ${120 * s}V6H${sd < 0 ? 24 : 6}V0H${sd < 0 ? 30 : 0}V12H${sd < 0 ? 8 : 22}V${120 * s}Z" fill="#fff"/>`, print: `<rect x="${sd < 0 ? 18 : 0}" y="0" width="12" height="12" fill="#ffe7a8"/>`, emit: .6 });
      if (k % 2 === 0) out.push({ id: `av-folk${k}`, stock: 'sugar', c: '#3d3a5c', w: 40, h: 60 * s, o: [mid - half + 6, 0, z + 12], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
        mask: `<g transform="scale(${s})"><path d="M4 60V26Q4 18 10 18Q6 14 7 9Q9 3 13 3Q18 3 18 9Q18 14 15 18Q20 18 20 26V60Z M24 60V30Q24 22 30 22Q26 18 27 13Q29 7 33 7Q38 7 38 13Q38 18 35 22Q40 22 40 30V60Z" fill="#fff"/></g>` });
      if (k === 1 || k === 4) out.push({ id: `av-tree${k}`, stock: 'sugar', c: '#3f7a5b', w: 70 * s, h: 110 * s, o: [mid + half - 60, 0, z + 14], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
        mask: `<g transform="scale(${s})"><path d="M31 110V60H39V110Z" fill="#fff"/><circle cx="35" cy="40" r="30" fill="#fff"/><circle cx="20" cy="56" r="18" fill="#fff"/><circle cx="52" cy="54" r="18" fill="#fff"/></g>`, print: `<g transform="scale(${s})"><rect x="31" y="60" width="8" height="50" fill="#5a4030"/><circle cx="28" cy="34" r="16" fill="#5a9a74"/></g>` });
    }
  });
  // Strung lights across the avenue mouth, a spire closing the view, and paper cranes flying over the road.
  out.push({ id: 'av-lights', stock: 'vellum', c: '#ffe7a8', w: 2 * half, h: 40, o: [mid - half, 300, -220], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, emit: .8,
    mask: `<path d="M0 4Q${half} 44 ${2 * half} 4" fill="none" stroke="#fff" stroke-width="1.6"/>${Array.from({ length: 11 }, (_, i) => { const tt = (i + .5) / 11, xx = tt * 2 * half, yy = 4 + 80 * tt * (1 - tt); return `<circle cx="${xx.toFixed(1)}" cy="${(yy + 4).toFixed(1)}" r="3.6" fill="#fff"/>`; }).join('')}` });
  out.push({ id: 'av-spire', stock: 'sugar', c: '#cbbad4', w: 120, h: 1100, o: [mid - 60, 0, -760], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .6,
    mask: `<path d="M0 1100V420H14V340H28V250H42V140H54V40L60 0L66 40V140H78V250H92V340H106V420H120V1100Z" fill="#fff"/>`,
    print: `<rect x="80" width="40" height="1100" fill="#b9a8c6"/>${Array.from({ length: 30 }, (_, i) => `<rect x="10" y="${440 + i * 22}" width="100" height="3" fill="#e3d4df"/>`).join('')}${Array.from({ length: 40 }, (_, i) => (i * 7) % 3 ? '' : `<rect x="${20 + (i % 5) * 18}" y="${450 + Math.floor(i / 5) * 60}" width="6" height="10" fill="#ffd27a"/>`).join('')}` });
  const crane = (id: string, x: number, y: number, z: number, k: number, flip: boolean): Panel[] => {
    const dir = flip ? -1 : 1, o: V3 = [x, y, z];
    // Each crane is folded: two wings meeting at the body crease, one lifted, one lowered, and a pointed tail.
    return [
      { id: `${id}-wl`, stock: 'bond', c: '#fbf7ee', w: 30 * k, h: 14 * k, o, u: [dir, .2, .3], v: [0, 1, -.3], edge: 'fold', density: 3, mask: `<path d="M0 ${14 * k}L${30 * k} 0L${10 * k} ${14 * k}Z" fill="#fff"/>` },
      { id: `${id}-wr`, stock: 'bond', c: '#efe6d6', w: 30 * k, h: 12 * k, o: add(o, [0, 0, -1], 1), u: [dir, -.25, -.3], v: [0, 1, .2], edge: 'fold', density: 3, mask: `<path d="M0 0L${30 * k} ${12 * k}L${12 * k} 0Z" fill="#fff"/>` },
      { id: `${id}-tail`, stock: 'bond', c: '#f6efe2', w: 26 * k, h: 8 * k, o: add(o, [-dir * 24 * k, 0, 0]), u: [dir, 0, 0], v: [0, 1, 0], edge: 'fold', density: 3, mask: `<path d="M0 0L${26 * k} ${8 * k}L${26 * k} ${2 * k}Z" fill="#fff"/>` }];
  };
  [[-560, 470, -330, 1.3, false], [-500, 520, -420, 1, true], [-610, 560, -500, .9, false], [-450, 600, -560, .8, true], [-540, 420, -280, 1.1, true], [-470, 660, -640, .7, false]]
    .forEach(([x, y, z, k, f], i) => out.push(...crane(`av-crane${i}`, x as number, y as number, z as number, k as number, f as boolean)));
  return [view, ...out.map(p => ({ ...p, decal: view.id, view: true }))];
}

// Freestanding recipes in the cut-and-glued manner: folded bodies with separately cut pieces glued on.
// A street tree: a forked trunk card, and a crown of two scalloped cards slotted at right angles, each printed with
// clusters in three greens, the sunlit half lighter, plus a small front cluster glued proud of the slot.
function slotTree(id: string, x: number, z: number, h: number, rot = 0): Panel[] {
  reseed(id.length * 31 + Math.round(x));
  const cw = h * .78, ch = h * .62, cy = h - ch;
  const blobs = Array.from({ length: 11 }, (_, i) => { const a = i / 11 * Math.PI * 2; return [cw / 2 + Math.cos(a) * cw * .3 + rnd(-6, 6), ch * .5 + Math.sin(a) * ch * .3 + rnd(-6, 6), Math.min(cw, ch) * rnd(.17, .24)]; });
  blobs.push([cw / 2, ch * .5, Math.min(cw, ch) * .36], [cw * .36, ch * .38, Math.min(cw, ch) * .26], [cw * .64, ch * .4, Math.min(cw, ch) * .26]);
  const crownMask = blobs.map(([bx, by, r]) => `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff"/>`).join('');
  const crownPrint = (light: boolean) => `<rect width="${cw}" height="${ch}" fill="${FOLIAGE}"/><rect width="${cw / 2}" height="${ch}" fill="${light ? '#4fae6c' : '#469f62'}"/>` + blobs.map(([bx, by, r], i) => `<circle cx="${(bx - r * .2).toFixed(1)}" cy="${(by - r * .25).toFixed(1)}" r="${(r * .62).toFixed(1)}" fill="${['#5cbb76', '#3a8c55', '#6cc482', '#347f4c'][i % 4]}"/><path d="M${(bx - r * .5).toFixed(1)} ${(by + r * .2).toFixed(1)}q${(r * .5).toFixed(1)} ${(r * .3).toFixed(1)} ${r.toFixed(1)} 0" stroke="#2c6e43" stroke-width="2" fill="none"/>`).join('');
  const r = yaw(rot), trunkW = 36;
  const trunk: Panel = { id: `${id}-trunk`, stock: 'kraft', c: '#7a5237', w: trunkW * 3, h: cy + ch * .5, o: add([x, 0, z], r([-trunkW * 1.5, 0, 0])), u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1.6,
    mask: `<path d="M${trunkW * 1.2} ${cy + ch * .5}Q${trunkW * 1.35} ${cy} ${trunkW * 1.25} ${cy * .55}L${trunkW * .4} ${cy * .2}L${trunkW * .55} ${cy * .1}L${trunkW * 1.4} ${cy * .42}L${trunkW * 1.5} ${cy * .1}L${trunkW * 1.68} ${cy * .1}L${trunkW * 1.62} ${cy * .45}L${trunkW * 2.5} ${cy * .15}L${trunkW * 2.62} ${cy * .25}L${trunkW * 1.78} ${cy * .62}Q${trunkW * 1.68} ${cy} ${trunkW * 1.85} ${cy + ch * .5}Z" fill="#fff"/>`,
    print: `<rect width="${trunkW * 1.5}" height="${cy + ch}" fill="#8a6244"/><path d="M${trunkW * 1.4} ${cy * .7}v${cy * .3}M${trunkW * 1.6} ${cy * .5}v${cy * .4}" stroke="#5e3f29" stroke-width="2"/>` };
  const crown = (k: 'a' | 'b', d: number): Panel => { const rr = yaw(rot + d * .6); return { id: `${id}-crown-${k}`, stock: 'sugar', c: FOLIAGE, w: cw, h: ch, o: add([x, cy, z], rr([-cw / 2, 0, 0])), u: rr([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1.4, mask: crownMask, print: crownPrint(k === 'a') }; };
  const front: Panel = { id: `${id}-cluster`, stock: 'sugar', c: '#4fae6c', w: cw * .5, h: ch * .4, o: add([x, cy + ch * .12, z], r([-cw * .1, 0, cw * .32])), u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1.6,
    mask: `<circle cx="${cw * .14}" cy="${ch * .22}" r="${ch * .17}" fill="#fff"/><circle cx="${cw * .3}" cy="${ch * .16}" r="${ch * .15}" fill="#fff"/><circle cx="${cw * .38}" cy="${ch * .26}" r="${ch * .13}" fill="#fff"/>`, print: `<rect width="${cw}" height="${ch}" fill="#5cbb76"/><rect x="${cw * .25}" width="${cw}" height="${ch}" fill="#4fae6c"/>` };
  const grate: Panel = { id: `${id}-grate`, stock: 'greyboard', c: '#4d4a46', w: 80, h: 60, o: add([x, .8, z], r([-40, 0, 30])), u: r([1, 0, 0]), v: r([0, 0, -1]), edge: 'cut', density: 1.2, decal: 'pavement', print: Array.from({ length: 6 }, (_, i) => `<path d="M${8 + i * 13} 6V54" stroke="#2f2d2b" stroke-width="3"/>`).join('') };
  return [trunk, crown('a', 40), crown('b', -40), front, grate];
}
// A rooftop water tank, folded: a hexagonal drum of timber staves with hoops, a conical cap of three gores and a cut
// steel stand underneath.
function foldedTank(id: string, x: number, z: number, y: number): Panel[] {
  const R = 30, H = 62, out: Panel[] = [], n = 6;
  const corner = (i: number): V3 => [x + R * Math.sin(i / n * Math.PI * 2), y + 46, z + R * Math.cos(i / n * Math.PI * 2)];
  const staves = (w: number) => `<g stroke="#5e4634" stroke-width="1"><path d="M${w / 3} 0V${H}M${2 * w / 3} 0V${H}"/></g><g stroke="#2f2a26" stroke-width="3"><path d="M0 14H${w}M0 34H${w}M0 52H${w}"/></g>`;
  for (let i = 0; i < n; i++) {
    const a = corner(i), b = corner(i + 1), u: V3 = [b[0] - a[0], 0, b[2] - a[2]], w = Math.hypot(u[0], u[2]), nz = (u[0] * 0 + -u[0]) ; void nz;
    const p: Panel = { id: `${id}-stave${i}`, stock: 'kraft', c: i % 2 ? '#8a6a50' : '#957358', w, h: H, o: b, u: [-u[0] / w, 0, -u[2] / w], v: [0, 1, 0], edge: 'fold', density: 1.6, print: staves(w) };
    if (normal(p)[2] > -.2) out.push(p);
  }
  const apex: V3 = [x, y + 46 + H + 30, z];
  for (let i = 0; i < n; i += 2) {
    const a = corner(i), c = corner(i + 2), base: V3 = [c[0] - a[0], 0, c[2] - a[2]], bw = Math.hypot(base[0], base[2]), u: V3 = [base[0] / bw, 0, base[2] / bw];
    const mid: V3 = [(a[0] + c[0]) / 2, y + 46 + H, (a[2] + c[2]) / 2], up: V3 = [apex[0] - mid[0], apex[1] - mid[1], apex[2] - mid[2]], sl = Math.hypot(...up);
    const p: Panel = { id: `${id}-cap${i}`, stock: 'kraft', c: '#5d4a3c', w: bw, h: sl, o: [a[0], y + 46 + H, a[2]], u, v: [up[0] / sl, up[1] / sl, up[2] / sl], edge: 'cut', density: 1.6, mask: `<path d="M0 ${sl}H${bw}L${bw / 2} 0Z" fill="#fff"/>` };
    const facing = normal(p)[2] > 0 ? p : { ...p, o: [c[0], y + 46 + H, c[2]] as V3, u: [-u[0], 0, -u[2]] as V3 };
    if (normal(facing)[2] > -.2 && normal(facing)[1] > 0) out.push(facing);
  }
  out.push({ id: `${id}-stand`, stock: 'greyboard', c: STEEL, w: 2 * R + 6, h: 48, o: [x - R - 3, y, z + R * .7], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
    mask: `<path d="M2 48L8 0H${2 * R - 2}L${2 * R + 4} 48H${2 * R - 2}L${2 * R - 8} 8H14L8 48Z M10 22H${2 * R - 4}V26H10Z" fill="#fff"/>` });
  return out;
}
// A car folded from two boxes, the lower body and the cabin, with its wheels cut separately and glued on.
function foldedCar(id: string, x: number, z: number, c: string, flip = false, taxi = false): Panel[] {
  const L = 196, d = 84, s = flip ? -1 : 1, out: Panel[] = [];
  const side = (w: number, h: number) => `<rect y="${h - 6}" width="${w}" height="6" fill="#000" fill-opacity=".14"/><path d="M${w * .5} 4V${h - 8}" stroke="#000" stroke-opacity=".18" stroke-width="1.4"/>${taxi ? `<g fill="${INK}">${Array.from({ length: 12 }, (_, i) => `<rect x="${w * .2 + i * 8}" y="${h * .32 + (i % 2) * 4}" width="4" height="4"/>`).join('')}</g>` : ''}`;
  out.push(...box({ id: `${id}-body`, x, z, y: 16, w: L, h: 40, d, stock: 'cover', c, side: c, front: side(L, 40), right: `<rect x="${d * .1}" y="12" width="${d * .2}" height="8" fill="${flip ? '#fff4d0' : CORAL}"/><rect x="${d * .7}" y="12" width="${d * .2}" height="8" fill="${flip ? '#fff4d0' : CORAL}"/>`, left: `<rect x="${d * .1}" y="12" width="${d * .2}" height="8" fill="${flip ? CORAL : '#fff4d0'}"/><rect x="${d * .7}" y="12" width="${d * .2}" height="8" fill="${flip ? CORAL : '#fff4d0'}"/>` }).filter(p => !/rear|under/.test(p.id)));
  const cab = 112;
  out.push(...box({ id: `${id}-cab`, x: x - s * 10, z, y: 56, w: cab, h: 34, d: d - 8, stock: 'cover', c, front: `<path d="M8 4H${cab / 2 - 3}V30H2Z M${cab / 2 + 3} 4H${cab - 8}L${cab - 2} 30H${cab / 2 + 3}Z" fill="${DARK_PANE}"/><path d="M10 7L22 7L12 20Z" fill="#7d8db8" opacity=".6"/>`, left: `<rect x="6" y="4" width="${d - 20}" height="26" fill="${DARK_PANE}"/>`, right: `<rect x="6" y="4" width="${d - 20}" height="26" fill="${DARK_PANE}"/>`, top: taxi ? `<rect x="${cab / 2 - 14}" y="${(d - 8) / 2 - 7}" width="28" height="14" fill="#fff4d0"/>` : '' }).filter(p => !/rear|under/.test(p.id)));
  for (const wx of [-L * .32, L * .32]) out.push({ id: `${id}-wheel${wx < 0 ? 'a' : 'b'}`, stock: 'greyboard', c: '#23272d', w: 40, h: 40, o: [x + wx - 20, 0, z + d / 2 + 1.2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2,
    mask: '<circle cx="20" cy="20" r="20" fill="#fff"/>', print: '<circle cx="20" cy="20" r="11" fill="#9aa0ab"/><circle cx="20" cy="20" r="5" fill="#5d636e"/><path d="M8 12A14 14 0 0 1 20 6" stroke="#4a4f57" stroke-width="2" fill="none"/>' });
  if (taxi) out.push({ id: `${id}-sign`, stock: 'cover', c: '#fff4d0', w: 34, h: 12, o: [x - s * 10 - 17, 90, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4, emit: .4, print: `<rect width="34" height="3" fill="${INK}"/>` });
  return out;
}
// A person: the body card printed in toned patches (the sunlit half of face and coat lighter), with the near arm and
// whatever it carries cut as a second card glued just proud of the body.
type Who = { coat: string; legs?: string; hair?: string; bag?: string; skin?: string; kid?: boolean; flip?: boolean; carry?: 'bag' | 'case' | 'phone' | 'none' };
function person(id: string, x: number, z: number, w: Who, rot = 0): Panel[] {
  const k = w.kid ? .72 : 1, W = 74 * k, H = 176 * k, f = w.flip ? `translate(74 0) scale(-1 1)` : '', skin = w.skin ?? '#f0c49a', legs = w.legs ?? '#3f4a5c';
  const deep = (c: string, m = .82) => '#' + [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * m).toString(16).padStart(2, '0')).join('');
  const body = `M22 176V120H14V64Q14 44 30 42Q20 36 22 22Q24 4 36 4Q50 4 50 22Q51 36 42 42Q58 44 58 64V120H50V176H40V128H32V176Z`;
  const g = (s: string) => `<g transform="scale(${k}) ${f}">${s}</g>`;
  const print = g(`<rect width="74" height="44" fill="${skin}"/><path d="M36 4Q50 4 50 22Q50 36 42 42H36Z" fill="${deep(skin, .9)}"/><path d="M21 6Q36 -6 52 8V18Q44 12 36 13Q28 12 21 18Z" fill="${w.hair ?? '#3a2a1a'}"/><circle cx="41" cy="23" r="1.6" fill="${INK}"/>
<rect y="44" width="74" height="78" fill="${w.coat}"/><rect x="36" y="44" width="38" height="78" fill="${deep(w.coat)}"/><path d="M30 44L36 58L42 44Z" fill="#fbf8f1"/><path d="M36 58V118" stroke="${deep(w.coat, .68)}" stroke-width="1.4"/>
<rect y="120" width="74" height="56" fill="${legs}"/><rect x="40" y="120" width="34" height="56" fill="${deep(legs)}"/><rect x="20" y="170" width="14" height="6" fill="#2a2622"/><rect x="38" y="170" width="14" height="6" fill="#2a2622"/>`);
  const r = yaw(rot), o = add([x, 0, z], r([-W / 2, 0, 0]));
  const out: Panel[] = [{ id, stock: 'cover', c: w.coat, w: W, h: H, o, u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2, mask: g(`<path d="${body}" fill="#fff"/>`), print }];
  const carry = w.carry ?? 'bag', bag = w.bag ?? CORAL;
  const thing = carry === 'bag' ? `<rect x="52" y="100" width="20" height="30" rx="2" fill="#fff"/><path d="M56 100Q62 90 68 100" stroke="#fff" stroke-width="2.4" fill="none"/>` : carry === 'case' ? `<rect x="48" y="112" width="26" height="20" rx="2" fill="#fff"/><rect x="56" y="108" width="10" height="5" fill="#fff"/>` : carry === 'phone' ? `<rect x="40" y="62" width="9" height="15" rx="1.6" fill="#fff"/>` : '';
  const arm = carry === 'phone' ? `M48 46Q58 48 58 62L50 76L42 76L50 62Z` : `M48 46Q58 48 58 60V106H50V60Z`;
  const armPrint = `<rect width="74" height="176" fill="${deep(w.coat, .9)}"/><rect x="54" width="20" height="176" fill="${deep(w.coat, .76)}"/><path d="${arm}" fill="none"/>
<rect x="${carry === 'phone' ? 42 : 50}" y="${carry === 'phone' ? 70 : 102}" width="9" height="7" fill="${skin}"/>${carry === 'bag' ? `<rect x="52" y="100" width="20" height="30" rx="2" fill="${bag}"/><rect x="62" y="100" width="10" height="30" fill="${deep(bag)}"/><path d="M56 100Q62 90 68 100" stroke="${deep(bag, .6)}" stroke-width="2.4" fill="none"/>`
    : carry === 'case' ? `<rect x="48" y="112" width="26" height="20" rx="2" fill="#5a3a24"/><rect x="62" y="112" width="12" height="20" fill="#4a2f1d"/><rect x="56" y="108" width="10" height="5" fill="#3a2414"/>` : carry === 'phone' ? `<rect x="40" y="62" width="9" height="15" rx="1.6" fill="#23272d"/><rect x="41.5" y="64" width="6" height="10" fill="#9fb4f0"/>` : ''}`;
  if (carry !== 'none') out.push({ id: `${id}-arm`, stock: 'cover', c: w.coat, w: W, h: H, o: add(o, normal({ u: r([1, 0, 0]), v: [0, 1, 0] }), 5), u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2, mask: g(`<path d="${arm}" fill="#fff"/>${thing}<rect x="${carry === 'phone' ? 42 : 50}" y="${carry === 'phone' ? 70 : 102}" width="9" height="7" fill="#fff"/>`), print: g(armPrint) });
  return out;
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

// The Moperty sales gallery: two buildings joined into one, cut to the logo. The indigo and the lavender house each
// keep their gable and the big yellow window, the white house between them is the entrance, and the ground floor is
// a lit gallery of scale models. Each colour comes in three tones (deep for structure, base for walls, light for trim).
export const GALLERY = { x: 60, z: -110, tw: 230, eave: 330, peak: 430, d: 220, hw: 150, heave: 190, hpeak: 250, hd: 66 };
const TONES = { l: { deep: '#4553c0', base: INDIGO, light: '#7d8ae8', roof: '#3d4aa8' }, r: { deep: '#8792e2', base: LAVENDER, light: '#c3caf8', roof: '#7f8ad9' } } as const;
function gallery(): Panel[] {
  const { x, z, tw, eave, peak, d, hw, heave, hpeak, hd } = GALLERY, rise = peak - eave, out: Panel[] = [];
  const win = { s: 92, y: 196 }, shop = { y: 18, h: 112 };
  for (const side of ['l', 'r'] as const) {
    const T = TONES[side], left = side === 'l', ox = left ? x - tw : x;
    const wx = left ? 26 : tw - 26 - win.s, gx0 = left ? 14 : hw / 2 + 12, gx1 = left ? tw - hw / 2 - 12 : tw - 14;
    const holes = `M${wx} ${peak - win.y}V${peak - win.y - win.s}H${wx + win.s}V${peak - win.y}Z M${gx0} ${peak - shop.y}V${peak - shop.y - shop.h}H${gx1}V${peak - shop.y}Z M${tw / 2 - 14} ${rise - 20}A14 14 0 1 0 ${tw / 2 + 14} ${rise - 20}A14 14 0 1 0 ${tw / 2 - 14} ${rise - 20}Z`;
    const outline = left ? `M0 ${rise}L${tw / 2} 0L${tw} ${rise}V${peak}H14Q0 ${peak} 0 ${peak - 14}Z` : `M0 ${rise}L${tw / 2} 0L${tw} ${rise}V${peak - 14}Q${tw} ${peak} ${tw - 14} ${peak}H0Z`;
    // Wall in its base tone, with fine vertical board lines in the deep tone and a plinth.
    const boards = Array.from({ length: Math.floor(tw / 23) }, (_, i) => `<path d="M${(i + 1) * 23} 0V${peak}" stroke="${T.deep}" stroke-opacity=".35" stroke-width="1.4"/>`).join('');
    const front: Panel = { id: `gal-${side}-front`, stock: 'cover', c: T.base, w: tw, h: peak, o: [ox, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1, mask: `<path fill-rule="evenodd" d="${outline} ${holes}" fill="#fff"/>`,
      print: `${boards}<rect y="${peak - 14}" width="${tw}" height="14" fill="${T.deep}"/>` };
    out.push(front);
    const room = (id: string, q: { x: number; y: number; w: number; h: number }, print: string, emit: number, c: string): Panel => ({ id, stock: 'cover', c, w: q.w + 12, h: q.h + 12, o: [ox + q.x - 6, q.y - 6, z - 16], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit, density: 1, decal: front.id, print });
    // The logo window: glowing, split down the middle, set in a light-tone surround with a balconette below.
    out.push(room(`gal-${side}-room`, { x: wx, y: win.y, w: win.s, h: win.s }, `<rect width="${win.s + 12}" height="${win.s + 12}" fill="${GLOW}"/><rect x="10" y="${win.s * .5}" width="${win.s * .4}" height="${win.s * .5}" fill="#e09a00"/><rect x="${win.s * .55}" y="${win.s * .3}" width="${win.s * .3}" height="${win.s * .25}" fill="#fbe39a"/>`, .7, GLOW));
    const wy = win.y, r = 12;
    out.push(on(front, 1.4, wx - 7, wy - 7, win.s + 14, win.s + 14, { id: `gal-${side}-frame`, stock: 'cover', c: T.light, density: 1.4,
      mask: `<path fill-rule="evenodd" d="M${r} 0H${win.s + 14 - r}Q${win.s + 14} 0 ${win.s + 14} ${r}V${win.s + 14 - r}Q${win.s + 14} ${win.s + 14} ${win.s + 14 - r} ${win.s + 14}H${r}Q0 ${win.s + 14} 0 ${win.s + 14 - r}V${r}Q0 0 ${r} 0Z M7 7V${win.s + 7}H${win.s / 2 + 4}V7Z M${win.s / 2 + 10} 7V${win.s + 7}H${win.s + 7}V7Z" fill="#fff"/>` }));
    // The gable roundel, lit, with a cross.
    out.push(room(`gal-${side}-vent`, { x: tw / 2 - 14, y: peak - rise + 6, w: 28, h: 28 }, `<rect width="40" height="40" fill="${GLOW}"/>`, .6, GLOW));
    out.push(on(front, 1.2, tw / 2 - 18, peak - rise + 2, 36, 36, { id: `gal-${side}-roundel`, stock: 'cover', c: T.light, density: 2, mask: `<path fill-rule="evenodd" d="M0 18A18 18 0 1 0 36 18A18 18 0 1 0 0 18Z M4 18A14 14 0 1 1 32 18A14 14 0 1 1 4 18Z M17 4H19V32H17Z M4 17H32V19H4Z" fill="#fff"/>` }));
    // The gallery: models of houses on white plinths, framed listings on easels, a pendant over each plinth.
    const gw = gx1 - gx0, models = Array.from({ length: Math.max(2, Math.floor(gw / 52)) }, (_, i) => { const mx = 12 + i * (gw - 20) / Math.max(2, Math.floor(gw / 52)), c = [LAVENDER, '#e3c9a0', INDIGO, '#9fc7b4'][(i + (left ? 0 : 2)) % 4];
      return `<rect x="${mx}" y="${shop.h - 30}" width="40" height="42" fill="#fbf8f1"/><rect x="${mx + 26}" y="${shop.h - 30}" width="14" height="42" fill="#e4ddd0"/><path d="M${mx + 4} ${shop.h - 30}V${shop.h - 50}L${mx + 20} ${shop.h - 64}L${mx + 36} ${shop.h - 50}V${shop.h - 30}Z" fill="${c}"/><rect x="${mx + 14}" y="${shop.h - 46}" width="8" height="8" fill="${GLOW}"/><path d="M${mx + 20} 0V${shop.h - 84}" stroke="${INK}" stroke-width="1"/><path d="M${mx + 12} ${shop.h - 76}H${mx + 28}L${mx + 24} ${shop.h - 84}H${mx + 16}Z" fill="${INK}"/><circle cx="${mx + 20}" cy="${shop.h - 74}" r="3" fill="#fff4d0"/>`; }).join('');
    out.push(room(`gal-${side}-gallery`, { x: gx0, y: shop.y, w: gw, h: shop.h }, `<rect width="${gw + 12}" height="${shop.h + 12}" fill="#fff1d6"/><rect y="${shop.h - 12}" width="${gw + 12}" height="24" fill="#d9c7a6"/>${models}`, .55, '#fff1d6'));
    out.push(on(front, 1.2, gx0 - 6, shop.y - 6, gw + 12, shop.h + 12, { id: `gal-${side}-mullions`, stock: 'cover', c: T.deep, density: 1.2, mask: slot(gw + 12, shop.h + 12, [6, 6, gw / 2 - 3, shop.h], [gw / 2 + 9, 6, gw / 2 - 3, shop.h]) }));
    // Carved relief: pilasters at both edges, a string course over the gallery, a cornice along the eave, the
    // balconette under the logo window, and a lantern on the wall.
    const carved: Panel[] = [];
    const lb = (id: string, cx: number, cy: number, w: number, h: number, dd: number, c: string, extra: Partial<Parameters<typeof box>[0]> = {}) => box({ id, x: ox + cx, z: z + dd / 2, y: cy, w, h, d: dd, stock: 'cover', c, side: T.deep, ...extra });
    carved.push(...lb(`gal-${side}-pil-a`, 7, 0, 14, eave, 10, T.light), ...lb(`gal-${side}-pil-b`, tw - 7, 0, 14, eave, 10, T.light));
    carved.push(...lb(`gal-${side}-course`, tw / 2, shop.y + shop.h + 8, tw, 12, 12, T.light, { front: `<rect y="9" width="${tw}" height="3" fill="${T.deep}"/>` }));
    carved.push(...lb(`gal-${side}-cornice`, tw / 2, eave - 12, tw + 8, 12, 16, T.light));
    carved.push(...lb(`gal-${side}-balc`, wx + win.s / 2, wy - 16, win.s + 20, 8, 22, T.deep));
    carved.push({ id: `gal-${side}-rail`, stock: 'greyboard', c: T.deep, w: win.s + 20, h: 26, o: [ox + wx - 10, wy - 8, z + 22], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4, mask: `<path fill-rule="evenodd" d="M0 0H${win.s + 20}V26H0Z ${Array.from({ length: Math.floor((win.s + 20) / 9) }, (_, i) => `M${i * 9 + 3} 4V22H${i * 9 + 8}V4Z`).join(' ')}" fill="#fff"/>` });
    carved.push(...lb(`gal-${side}-planter`, wx + win.s / 2, wy - 8, win.s - 10, 14, 14, T.deep, { top: `<rect width="${win.s}" height="14" fill="#3f9a5b"/>${Array.from({ length: 7 }, (_, i) => `<circle cx="${6 + i * 12}" cy="${4 + (i % 2) * 5}" r="4" fill="${['#f5b400', '#fbf8f1', '#e88ab0'][i % 3]}"/>`).join('')}` }));
    out.push(...carved.map(p => ({ ...p, decal: front.id, view: true })));
    // The awning over the gallery, in the deep tone, with the light tone on its scalloped lip.
    const aw = gw + 24, ax = ox + gx0 - 12;
    out.push({ id: `gal-${side}-awning`, stock: 'cover', c: T.deep, w: aw, h: 50, o: [ax, shop.y + shop.h + 2 - 40 * .86 + 40, z + 44], u: [1, 0, 0], v: [0, .66, -.75], edge: 'fold', density: 1.2, print: Array.from({ length: Math.ceil(aw / 36) }, (_, i) => `<rect x="${i * 36}" width="18" height="50" fill="${T.base}"/>`).join('') });
    out.push({ id: `gal-${side}-awning-lip`, stock: 'cover', c: T.light, w: aw, h: 14, o: [ax, shop.y + shop.h + 2 - 40 * .86 + 40 - 14, z + 44], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, mask: `<path d="M0 0H${aw}V6${Array.from({ length: Math.ceil(aw / 18) }, () => 'a9 7 0 0 1 -18 0').join('')}Z" fill="#fff"/>` });
    // Side wall and the two roof slopes.
    if (left) out.push({ id: 'gal-l-side', stock: 'cover', c: '#4251b8', w: d, h: eave, o: [ox, 0, z - d], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: .8,
      print: [0, 1].flatMap(rr => [0, 1, 2].map(i => `<g transform="translate(${34 + i * 62} ${eave - (rr ? 290 : 196)})"><rect width="40" height="44" rx="6" fill="${GLOW}"/><path d="M20 0V44" stroke="#4251b8" stroke-width="4"/></g>`)).join('') });
    const a = Math.atan2(rise, tw / 2), len = Math.hypot(tw / 2, rise) + 5, ridge: V3 = [ox + tw / 2, peak + 1, z + 6];
    for (const s of [-1, 1] as const) {
      const dn: V3 = [s * Math.cos(a), -Math.sin(a), 0];
      const slope: Panel = s < 0 ? { id: `gal-${side}-roof-l`, stock: 'cover', c: T.roof, w: len, h: d + 10, o: add(ridge, dn, len), u: [-dn[0], -dn[1], -dn[2]], v: [0, 0, -1], edge: 'cut', density: .8 } : { id: `gal-${side}-roof-r`, stock: 'cover', c: T.roof, w: len, h: d + 10, o: ridge, u: dn, v: [0, 0, -1], edge: 'cut', density: .8 };
      out.push({ ...slope, print: Array.from({ length: 7 }, (_, i) => `<path d="M${(i + 1) * len / 8} 0V${d + 10}" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`).join('') });
    }
  }
  // The white entrance house in front, with the four-pane window, glass doors that open, and lanterns either side.
  const hz = z + hd, hx = x - hw / 2, hrise = hpeak - heave, door = { w: 72, h: 106 }, w4 = 56;
  const holes = `M${hw / 2 - door.w / 2} ${hpeak}V${hpeak - door.h}H${hw / 2 + door.w / 2}V${hpeak}Z M${hw / 2 - w4 / 2} ${hpeak - 128}V${hpeak - 128 - w4}H${hw / 2 + w4 / 2}V${hpeak - 128}Z`;
  const house: Panel = { id: 'gal-house', stock: 'cover', c: '#fbf8f1', w: hw, h: hpeak, o: [hx, 0, hz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
    mask: `<path fill-rule="evenodd" d="M0 ${hrise}L${hw / 2} 0L${hw} ${hrise}V${hpeak}H0Z ${holes}" fill="#fff"/>`, print: `<rect y="${hpeak - 10}" width="${hw}" height="10" fill="#e4ddd0"/><path d="M8 ${hrise + 4}L${hw / 2} 8L${hw - 8} ${hrise + 4}" stroke="#e4ddd0" stroke-width="3" fill="none"/>` };
  out.push(house);
  out.push({ id: 'gal-house-room', stock: 'cover', c: GLOW, w: w4 + 10, h: w4 + 10, o: [x - w4 / 2 - 5, 123, hz - 12], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: .7, density: 1.2, decal: house.id });
  out.push(on(house, 1.2, hw / 2 - w4 / 2 - 5, 123, w4 + 10, w4 + 10, { id: 'gal-house-frame', stock: 'cover', c: '#e4ddd0', density: 1.6, mask: slot(w4 + 10, w4 + 10, [5, 5, w4 / 2 - 2, w4 / 2 - 2], [w4 / 2 + 7, 5, w4 / 2 - 2, w4 / 2 - 2], [5, w4 / 2 + 7, w4 / 2 - 2, w4 / 2 - 2], [w4 / 2 + 7, w4 / 2 + 7, w4 / 2 - 2, w4 / 2 - 2]) }));
  out.push({ id: 'gal-lobby', stock: 'cover', c: '#ffe2a8', w: door.w + 20, h: door.h + 8, o: [x - door.w / 2 - 10, 0, hz - 26], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: .9, density: 1.2,
    print: `<rect x="10" y="44" width="${door.w}" height="6" fill="${INDIGO}"/>${mark(door.w / 2 - 6, 16, 32 / 394)}<rect x="14" y="${door.h - 30}" width="20" height="38" fill="#e4ddd0"/><path d="M18 ${door.h - 30}L24 ${door.h - 40}L30 ${door.h - 30}Z" fill="${LAVENDER}"/>` });
  const leaf = (id: string, ox: number, edge: 'left' | 'right'): Panel => ({ id, stock: 'cover', c: INDIGO_DARK, w: door.w / 2, h: door.h, o: [ox, 0, hz + .8], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6,
    motion: { when: 'gallery-door', edge, deg: edge === 'left' ? 72 : -72 }, mask: slot(door.w / 2, door.h, [6, 7, door.w / 2 - 12, door.h - 22]), print: `<rect x="${edge === 'left' ? door.w / 2 - 6 : 2}" y="${door.h * .5}" width="4" height="16" fill="${GLOW}"/>` });
  out.push(leaf('gal-door-l', x - door.w / 2, 'left'), leaf('gal-door-r', x, 'right'));
  out.push(...[-1, 1].flatMap(s => box({ id: `gal-lantern-${s < 0 ? 'l' : 'r'}`, x: x + s * (door.w / 2 + 16), z: hz + 6, y: 92, w: 14, h: 22, d: 10, stock: 'vellum', c: '#ffe7a8', front: `<rect width="14" height="3" fill="${INK}"/>` }).filter(p => p.id.endsWith('front')).map(p => ({ ...p, emit: .8, decal: house.id, view: true }))));
  out.push({ id: 'gal-house-l', stock: 'cover', c: '#ece6da', w: hd, h: heave, o: [hx, 0, z], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: 1 });
  const ha = Math.atan2(hrise, hw / 2), hl = Math.hypot(hw / 2, hrise) + 8, hridge: V3 = [x, hpeak + 1, hz + 8];
  for (const s of [-1, 1] as const) {
    const dn: V3 = [s * Math.cos(ha), -Math.sin(ha), 0];
    out.push(s < 0 ? { id: 'gal-house-roof-l', stock: 'cover', c: '#e4ddd0', w: hl, h: hd + 8, o: add(hridge, dn, hl), u: [-dn[0], -dn[1], -dn[2]], v: [0, 0, -1], edge: 'cut', density: 1 }
      : { id: 'gal-house-roof-r', stock: 'cover', c: '#d8d0c2', w: hl, h: hd + 8, o: hridge, u: dn, v: [0, 0, -1], edge: 'cut', density: 1 });
  }
  // The name on a stone plinth at the indigo house's foot, two topiaries in folded pots by the door.
  out.push(...box({ id: 'gal-sign', x: x - 150, z: z + 54, w: 190, h: 46, d: 26, stock: 'cover', c: '#fbf8f1', side: '#e4ddd0', front: `${mark(12, 8, 30 / 394)}${word(50, 34, 28)}`, top: '' }).filter(p => !/rear|under|left/.test(p.id)));
  for (const s of [-1, 1]) {
    const px = x + s * 98, pz = hz + 26;
    out.push(...box({ id: `topi-pot-${s < 0 ? 'l' : 'r'}`, x: px, z: pz, w: 30, h: 26, d: 30, stock: 'cover', c: TONES.l.deep, top: '<rect x="3" y="3" width="24" height="24" fill="#4a3424"/>' }).filter(p => /front|top/.test(p.id)));
    for (const [k, d2] of [['a', 40], ['b', -40]] as const) { const rr = yaw(d2); out.push({ id: `topi-${s < 0 ? 'l' : 'r'}-${k}`, stock: 'sugar', c: '#3f9a5b', w: 34, h: 58, o: add([px, 26, pz], rr([-17, 0, 0])), u: rr([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2, mask: '<circle cx="17" cy="17" r="15" fill="#fff"/><circle cx="17" cy="40" r="11" fill="#fff"/><rect x="15" y="40" width="4" height="18" fill="#fff"/>', print: `<rect width="34" height="58" fill="#3f9a5b"/><rect width="17" height="58" fill="#4fae6c"/><rect x="15" y="50" width="4" height="8" fill="#6d4a33"/>` }); }
  }
  return out;
}

// A new block going up, module by module. The tower crane sets each finished floor on the last; the hoarding hides the base.
const SITE = { x: 760, z: -230, w: 270, d: 150, fh: 92 };
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
  const mx = 580, mz = -300, mh = 480, lattice = (w: number, h: number, along: 'v' | 'h') => along === 'v'
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
  const hx0 = 545, hw = 400, hh = 84, gate = { x: 150, w: 110 };
  const ply = Array.from({ length: Math.ceil(hw / 82) }, (_, i) => `<path d="M${i * 82} 0V${hh}" stroke="#a5824f" stroke-width="2"/>`).join('');
  const stripes = `<g>${Array.from({ length: Math.ceil(hw / 20) + 2 }, (_, i) => `<path d="M${i * 20 - 14} ${hh}L${i * 20} ${hh - 14}H${i * 20 + 10}L${i * 20 - 4} ${hh}Z" fill="${INK}"/>`).join('')}<rect y="${hh - 14}" width="${hw}" height="14" fill="${SUN}" opacity="0"/></g>`;
  const hoard: Panel = { id: 'hoarding', stock: 'kraft', c: '#d4b07c', w: hw, h: hh, o: [hx0, 0, -60], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
    mask: `<path fill-rule="evenodd" d="M0 0H${hw}V${hh}H0Z M${gate.x} ${hh}V8H${gate.x + gate.w}V${hh}Z" fill="#fff"/>`,
    print: `<rect y="${hh - 14}" width="${hw}" height="14" fill="${SUN}"/>${stripes}${ply}<g transform="translate(18 6)">${poster('sale', 96, 64)}</g><g transform="translate(${gate.x + gate.w + 16} 6)"><rect width="122" height="64" fill="${INDIGO}"/>${mark(8, 10, 52 / 394, true)}${word(64, 40, 17, '#fff')}<rect x="64" y="50" width="48" height="5" fill="${LAVENDER}"/></g>` };
  out.push(hoard, backOf(hoard, '#b8945e'));
  out.push({ id: 'site-ground', stock: 'kraft', c: '#9a7a58', w: hw - 10, h: 210, o: [hx0 + 5, 1.4, -62], u: [1, 0, 0], v: [0, 0, -1], edge: 'cut', density: .6, decal: 'pavement', print: specks(hw - 10, 210, '#7a5c3e', 80, 5) });
  return out;
}

// The listings map: a city board on the pavement with the block drawn from above. A switches the filter tab; pins on
// the board and flags on the street mark every listing that matches.
function listingsBoard(): Panel[] {
  const bx = 210, bz = -36, bw = 190, bh = 120, by = 86, out: Panel[] = [];
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
  const kx = -280, kz = -40, kw = 96, kh = 236, sw = 74, sh = 140, out: Panel[] = [];
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
  const ex = 470, ez = 20, cw = 92, ch = 116, out: Panel[] = [];
  out.push(card('easel-legs', ex, ez - 4, 110, 190, '#8a5a3a', { stock: 'kraft', mask: '<path d="M8 190L50 0H60L102 190H92L55 22L18 190Z M24 110H86V118H24Z M50 0H60V190H50Z" fill="#fff"/>' }, -8));
  const wire = `<rect width="${cw}" height="${ch}" fill="#fbf8f1"/><g fill="none" stroke="#8a8f99" stroke-width="1.4"><rect x="14" y="8" width="64" height="100" rx="6"/><rect x="20" y="16" width="52" height="10"/>${Array.from({ length: 3 }, (_, i) => `<rect x="20" y="${32 + i * 24}" width="52" height="20"/><path d="M22 ${34 + i * 24}L38 ${50 + i * 24}M38 ${34 + i * 24}L22 ${50 + i * 24}"/><path d="M42 ${37 + i * 24}H66M42 ${43 + i * 24}H58"/>`).join('')}</g><path d="M4 112L30 106" stroke="#c9bfae" stroke-width="1"/>`;
  const paint = `<rect width="${cw}" height="${ch}" fill="#fbf8f1"/><rect x="14" y="8" width="64" height="100" rx="6" fill="${STEEL}"/><rect x="18" y="12" width="56" height="92" fill="#f7f6fb"/><rect x="18" y="12" width="56" height="12" fill="${INDIGO}"/>${mark(21, 14.4, 7 / 394, true)}<rect x="32" y="16" width="20" height="4" fill="#fff"/>
${Array.from({ length: 3 }, (_, i) => `<g transform="translate(21 ${28 + i * 25})"><rect width="50" height="22" fill="#fff"/><rect x="2" y="2" width="18" height="18" fill="${[LAVENDER, '#9fc7b4', STONE][i]}"/><path d="M6 12L11 7L16 12V18H6Z" fill="#fff"/><rect x="23" y="4" width="20" height="3.4" fill="${INK}" fill-opacity=".7"/><rect x="23" y="13" width="12" height="5" rx="2" fill="${i === 1 ? CORAL : INDIGO}"/></g>`).join('')}`;
  [wire, paint].forEach((p, i) => out.push({ ...card(`canvas-${i}`, ex + 1, ez + 16, cw, ch, '#fbf8f1', { density: 3.4, print: p, mask: `<rect width="${cw}" height="${ch}" fill="#fff"/>` }, -8, 108), v: [0, .985, -.17] as V3, show: { toy: 'paint', at: [i] } }));
  // The painter, palette in hand, and a stool with the paint pots.
  out.push(...person('painter', ex + 82, ez + 30, { coat: '#e9a77b', legs: '#5a4a6a', hair: '#2a1d14', flip: true, carry: 'none' }));
  out.push(...box({ id: 'paint-stool', x: ex - 70, z: ez + 18, w: 38, h: 40, d: 30, stock: 'kraft', c: '#8a5a3a', top: `<circle cx="10" cy="10" r="6" fill="${INDIGO}"/><circle cx="24" cy="12" r="6" fill="${GLOW}"/><circle cx="16" cy="22" r="5" fill="${CORAL}"/>` }).filter(p => /front|top/.test(p.id)));
  return out;
}

// The finger-post on the corner: street arrows stacked on one pole, a magnifier on top. A lifts the Moperty arrow one place up.
function signpost(): Panel[] {
  const px = -425, pz = 0, ph = 300, out: Panel[] = [];
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

const cup = `<rect x="30" y="8" width="18" height="16" rx="3" fill="${CORAL}"/><path d="M48 12Q55 12 55 16Q55 21 48 21" fill="none" stroke="${CORAL}" stroke-width="3"/>`;
const deli = `<circle cx="24" cy="17" r="9" fill="${CORAL}"/><circle cx="44" cy="17" r="9" fill="${SUN}"/><circle cx="64" cy="17" r="9" fill="#57b36f"/>`;
const shelves = (cs: string[]) => cs.map((c, i) => `<rect x="${12 + i * 34}" y="${40 - (i % 2) * 12}" width="24" height="${50 + (i % 2) * 12}" fill="${c}"/>`).join('') + `<rect y="88" width="400" height="10" fill="#8a5a3a"/>`;
// The low block: the tenement on the far corner of the avenue, a café on the near corner, the gallery, a brownstone.
const WEST = { x: -840, z: -150, w: 330, h: 520, rot: 10 };
function neighbours(): Panel[] {
  const r = yaw(WEST.rot), tankAt = add(add([WEST.x, 0, WEST.z], r([-WEST.w / 2 + 240, 0, -50])), [0, WEST.h - 26, 0]);
  return [
    ...building({ ...WEST, id: 'west', c: BRICK, line: BRICK_LINE, trim: STONE, storeys: 4, cols: 4, ground: 'shop', ac: '#2f7d58', icon: cup, goods: shelves(['#8a5a3a', CREAM, '#c98a5f', '#8a5a3a', SUN, CREAM, '#8a5a3a', CORAL]), fire: 1, side: 'right', sideW: 240, seed: 3,
      sidePrint: `<g transform="translate(40 120)"><rect width="160" height="120" fill="${INDIGO}" opacity=".85"/>${mark(14, 20, 56 / 394, true)}${word(80, 66, 24, '#fff', 'middle')}<rect x="20" y="90" width="120" height="8" fill="${LAVENDER}"/></g>`,
      listing: { kind: 'rent', at: [184, 300] } }),
    ...foldedTank('west-tank', tankAt[0], tankAt[2], tankAt[1]),
    ...building({ id: 'cafe', x: -305, z: -130, w: 230, h: 360, rot: 0, c: '#d9a968', line: '#b98a4c', trim: CREAM, storeys: 3, cols: 3, ground: 'shop', ac: CORAL, icon: cup, goods: shelves([CORAL, SUN, '#57b36f', CORAL, SUN, CREAM, '#8a5a3a']), seed: 11, listing: { kind: 'rent', at: [120, 250] } }),
    ...building({ id: 'east', x: 1150, z: -190, w: 330, h: 500, rot: -18, c: '#c98f6c', line: '#a5704f', trim: CREAM, storeys: 4, cols: 4, ground: 'shop', ac: INDIGO, icon: deli, goods: shelves([CORAL, SUN, '#57b36f', CORAL, SUN, '#57b36f', CREAM, CORAL]), fire: 2, seed: 19 }),
    ...building({ id: 'brownstone', x: 395, z: -150, w: 190, h: 380, rot: -4, c: '#9a6b55', line: '#7a4f3c', trim: STONE, storeys: 3, cols: 2, ground: 'stoop', seed: 7, lit: .7, flowers: true, chimney: 40 })
  ];
}
// The backs of the next street's buildings close the block behind the lot and the gallery: brick, tanks, fire stairs.
function rearRow(): Panel[] {
  far = 77; const w = 1800, h = 340; let x = 0, mask = '', print = '';
  while (x < w) {
    const bw = fr(110, 190), bh = fr(200, 320), top = h - bh, c = ['#a8705a', '#b98a6c', '#8f6a5e', '#c9a27e'][Math.floor(fr(0, 4))];
    mask += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="#fff"/>`;
    print += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="${c}"/><rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="8" fill="#000" fill-opacity=".15"/>`;
    for (let wy = top + 22; wy < h - 20; wy += 34) for (let wx = x + 12; wx < x + bw - 20; wx += 26) print += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="12" height="18" fill="${fr(0, 1) > .45 ? '#ffd98a' : '#5a5878'}"/>`;
    if (fr(0, 1) > .5) { const cx = x + bw * .6; mask += `<rect x="${(cx - 14).toFixed(0)}" y="${(top - 34).toFixed(0)}" width="28" height="26" fill="#fff"/><rect x="${(cx - 12).toFixed(0)}" y="${(top - 8).toFixed(0)}" width="24" height="8" fill="#fff"/>`; print += `<rect x="${(cx - 14).toFixed(0)}" y="${(top - 34).toFixed(0)}" width="28" height="26" fill="#7a5e48"/><path d="M${(cx - 14).toFixed(0)} ${(top - 24).toFixed(0)}h28M${(cx - 14).toFixed(0)} ${(top - 16).toFixed(0)}h28" stroke="#4a382e" stroke-width="2"/><rect x="${(cx - 12).toFixed(0)}" y="${(top - 8).toFixed(0)}" width="24" height="8" fill="${STEEL}"/>`; }
    if (fr(0, 1) > .5) for (let fy = top + 40; fy < h - 40; fy += 34) print += `<path d="M${(x + 8).toFixed(0)} ${fy}h${(bw * .4).toFixed(0)}M${(x + 10).toFixed(0)} ${fy}l${(bw * .36).toFixed(0)} 30" stroke="#2c2a30" stroke-width="2.4"/>`;
    x += bw;
  }
  return [{ id: 'rear-row', stock: 'sugar', c: '#a8705a', w, h, o: [-140, 0, -520], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .55, mask, print }];
}
function yardSign(): Panel[] {
  const sx = 340, sz = -46;
  return [card('yard-post', sx, sz, 80, 150, '#fbf8f1', { density: 2, mask: '<path d="M0 0H80V8H12V150H4V8H0Z" fill="#fff"/>' }),
    card('yard-board', sx + 6, sz + 2, 66, 50, '#fffaf0', { stock: 'cover', density: 3, print: poster('sale', 66, 50), mask: '<rect width="66" height="50" fill="#fff"/>' }, 0, 82),
    card('yard-chains', sx + 6, sz + 1, 60, 10, STEEL, { density: 3, stock: 'greyboard', mask: '<path d="M6 0H8V10H6Z M52 0H54V10H52Z" fill="#fff"/>' }, 0, 132)];
}
// A box van, folded: the cargo box and the cab as two boxes, wheels glued on.
function foldedVan(id: string, x: number, z: number): Panel[] {
  const out: Panel[] = [];
  out.push(...box({ id: `${id}-cargo`, x, z, y: 18, w: 190, h: 124, d: 96, stock: 'cover', c: '#fbf8f1', side: '#ece6da', front: `${mark(16, 22, 60 / 394)}${word(84, 64, 34)}<rect x="84" y="74" width="80" height="6" fill="${LAVENDER}"/><rect y="112" width="190" height="12" fill="${INDIGO}"/>`, left: `<rect x="8" y="8" width="80" height="108" fill="#e4ddd0"/><path d="M48 8V116" stroke="#cfc6b4" stroke-width="2"/>` }).filter(p => !/rear|under/.test(p.id)));
  out.push(...box({ id: `${id}-cab`, x: x + 128, z, y: 18, w: 66, h: 92, d: 92, stock: 'cover', c: INDIGO, side: '#4553c0', front: `<path d="M8 8H46L60 44H8Z" fill="${DARK_PANE}"/><rect x="40" y="56" width="10" height="4" fill="${INK}"/>`, right: `<rect x="10" y="10" width="72" height="34" fill="${DARK_PANE}"/><rect x="8" y="60" width="16" height="8" fill="#fff4d0"/><rect x="68" y="60" width="16" height="8" fill="#fff4d0"/>` }).filter(p => !/rear|under|left/.test(p.id)));
  for (const wx of [x - 60, x + 130]) out.push({ id: `${id}-wheel${wx < x ? 'a' : 'b'}`, stock: 'greyboard', c: '#23272d', w: 44, h: 44, o: [wx - 22, 0, z + 49.2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2, mask: '<circle cx="22" cy="22" r="22" fill="#fff"/>', print: '<circle cx="22" cy="22" r="12" fill="#9aa0ab"/><circle cx="22" cy="22" r="5" fill="#5d636e"/>' });
  return out;
}
function dressing(): Panel[] {
  const out: Panel[] = [];
  out.push(...streetLamp('lamp-a', -380, 176, 260, '#ffe7a8'), ...streetLamp('lamp-b', 300, 176, 250, '#ffe7a8'));
  // Traffic lights on both corners of the avenue, facing the road.
  for (const [i, sx] of [[0, AVENUE.x0 - 20], [1, AVENUE.x1 + 20]] as const) {
    out.push(card(`signal-post${i}`, sx, 178, 8, 214, STEEL, { stock: 'greyboard' }));
    out.push(card(`signal${i}`, sx, 183, 30, 76, STEEL, { stock: 'greyboard', density: 2.4, mask: '<rect width="30" height="76" rx="6" fill="#fff"/>', emit: .15, print: `<rect x="15" width="15" height="76" fill="#23272d"/><circle cx="15" cy="14" r="8" fill="#5a2a22"/><circle cx="15" cy="38" r="8" fill="#5a4a22"/><circle cx="15" cy="62" r="8" fill="#5be08a"/>` }, 0, 200));
  }
  out.push(...foldedCar('taxi', 590, 282, TAXI, true, true));
  out.push(...foldedVan('van', -880, 236));
  out.push({ id: 'ramp', stock: 'greyboard', c: '#9aa0ab', w: 60, h: 110, o: [-1010, 0, 196], u: [1, 0, 0], v: [0, .36, -.93], edge: 'cut', density: 1, print: Array.from({ length: 7 }, (_, i) => `<path d="M0 ${i * 15 + 7}H60" stroke="#7d838e" stroke-width="2"/>`).join('') });
  const carton = (id: string, x: number, z: number, y: number, w: number, h: number, rot: number) => box({ id, x, z, y, w, h, d: w * .8, rot, stock: 'kraft', c: '#b98450', front: `<rect x="${w / 2 - 5}" width="10" height="${h * .6}" fill="#d9b781"/><path d="M${w * .2} ${h * .7}h${w * .3}" stroke="${INK}" stroke-width="2"/>`, top: `<rect x="${w / 2 - 5}" width="10" height="${w * .8}" fill="#d9b781"/>` }).filter(p => !/rear|under|right/.test(p.id));
  out.push(...carton('box-a', -760, 110, 0, 56, 44, 6), ...carton('box-b', -754, 110, 44, 44, 34, -8));
  out.push(...person('mover', -810, 130, { coat: '#3a6ea8', legs: '#2f3a4a', carry: 'none' }));
  out.push({ id: 'mover-box', stock: 'kraft', c: '#b98450', w: 50, h: 40, o: [-822, 62, 136], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2, print: `<rect x="20" width="10" height="40" fill="#d9b781"/><rect x="25" width="25" height="40" fill="#000" fill-opacity=".1"/>` });
  // People: a commuter on her phone, a parent and child with shopping, a buyer reading the brownstone's sign, a dog walker.
  out.push(...person('commuter', -110, 120, { coat: '#3d444e', legs: '#2a2f38', hair: '#1d1a17', carry: 'phone' }));
  out.push(...person('parent', 205, 148, { coat: '#57b36f', legs: '#3f4a5c', bag: SUN, flip: true }), ...person('child', 240, 140, { coat: CORAL, legs: '#3f4a5c', bag: LAVENDER, flip: true, kid: true }));
  out.push(...person('buyer', 288, -6, { coat: '#7c6be0', legs: '#2f3a4a', hair: '#6d4a33', carry: 'case' }));
  out.push(...person('walker', -560, 128, { coat: '#e9a77b', legs: '#3f4a5c', bag: INDIGO }));
  out.push(card('dog', -500, 140, 64, 40, '#8a6a50', { density: 2.4, mask: '<path d="M8 40V18Q4 14 4 8L14 12H40Q46 4 54 4Q62 6 62 14L58 18H54V40H48V24H18V40Z" fill="#fff"/>', print: `<rect width="64" height="40" fill="#8a6a50"/><rect y="20" width="64" height="20" fill="#74563f"/><rect x="46" y="2" width="16" height="16" fill="#9a7a5e"/><circle cx="56" cy="10" r="1.8" fill="${INK}"/>` }));
  out.push({ id: 'leash', stock: 'greyboard', c: CORAL, w: 52, h: 60, o: [-552, 30, 136], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2, mask: '<path d="M0 0Q30 40 52 60L50 60Q28 42 0 3Z" fill="#fff"/>' });
  out.push(...slotTree('tree-a', -392, -46, 270, 10), ...slotTree('tree-b', 505, -40, 240, -15));
  out.push(...box({ id: 'hydrant', x: -200, z: 160, w: 22, h: 42, d: 22, stock: 'cover', c: CORAL, front: `<rect y="8" width="22" height="5" fill="${CREAM}"/><rect x="11" width="11" height="42" fill="#000" fill-opacity=".12"/>` }).filter(p => /front|top/.test(p.id)));
  out.push(...box({ id: 'bin', x: 340, z: 150, w: 34, h: 58, d: 34, stock: 'cover', c: '#2f7d58', front: `<rect y="6" width="34" height="5" fill="${CREAM}"/><rect x="17" width="17" height="58" fill="#000" fill-opacity=".1"/>`, top: '<rect x="6" y="6" width="22" height="22" fill="#1d3a28"/>' }).filter(p => /front|top/.test(p.id)));
  out.push(...box({ id: 'news-a', x: -190, z: -36, w: 40, h: 64, d: 34, stock: 'cover', c: INDIGO, front: `<rect x="5" y="6" width="30" height="22" fill="#fbf8f1"/><rect x="8" y="9" width="24" height="3" fill="${INK}"/><rect x="8" y="15" width="18" height="2" fill="${INK}" fill-opacity=".5"/><rect x="20" y="30" width="20" height="34" fill="#4553c0"/>` }).filter(p => /front|top/.test(p.id)));
  const pigeon = (id: string, x: number, z: number, flip: boolean, c = '#8d96a3'): Panel => card(id, x, z, 30, 22, c, { density: 3, mask: `<g ${flip ? 'transform="translate(30 0) scale(-1 1)"' : ''}><path d="M4 12Q4 4 12 6L16 2Q22 0 24 4L29 6L24 8Q24 16 16 18L18 22H15L13 18Q6 18 4 12Z M0 10L6 9L5 13Z" fill="#fff"/></g>`, print: `<g ${flip ? 'transform="translate(30 0) scale(-1 1)"' : ''}><rect width="30" height="22" fill="${c}"/><rect y="12" width="30" height="10" fill="#6b7480"/><circle cx="21" cy="4.6" r="1.4" fill="${INK}"/></g>` });
  out.push(pigeon('pigeon-a', 20, 70, false), pigeon('pigeon-b', 52, 82, true, '#a4acb7'));
  out.push({ ...pigeon('ridge-a', 0, 0, false, '#5b6470'), o: [GALLERY.x - GALLERY.tw / 2 - 15, GALLERY.peak + 1, GALLERY.z - 40] }, { ...pigeon('ridge-b', 0, 0, true, '#5b6470'), o: [GALLERY.x + GALLERY.tw / 2 - 15, GALLERY.peak + 1, GALLERY.z - 90] });
  return out;
}

export function downtown(): Scene {
  const lamps: Lamp[] = [{ at: [-346, 228, 176], color: [1, .83, .58], energy: 60 }, { at: [334, 218, 176], color: [1, .83, .58], energy: 60 }, { at: [GALLERY.x, 90, GALLERY.z + GALLERY.hd + 30], color: [1, .83, .58], energy: 30 }];
  return { id: 'downtown', camera: { zoom: 1, x0: -350, x1: 600 }, light: { sun: 2.1, sky: .55, skyColor: [1, .87, .8] }, lamps,
    panels: [...backdrop(), ...ground(), ...avenueView(), ...rearRow(), ...neighbours(), ...gallery(), ...site(), ...yardSign(), ...listingsBoard(), ...kiosk(), ...easel(), ...signpost(), ...dressing()] };
}
