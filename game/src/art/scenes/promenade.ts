import { add, box, carved, cross, normal, unit, yaw, type Panel, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, SUN } from '../recipes.ts';

// The Blibli street is a riverside shopping promenade: a brick plaza closed by shops on three sides, with the river
// seen through a gateway at the back. Everything here is the plaza's furniture and its bounding facades.
export const MINT = '#35b58a', PLUM = '#7c6be0', LEAF = '#57b36f', FROND = '#3f9a5b', FROND_DARK = '#2f7d48', BARK = '#9a7b5c';
const PAVER = ['#dba38b', '#e5b8a0', '#cf927a', '#e9c5ae'], BORDER = '#9c6d5c', TILE = '#3d4a5a';
// The game camera for this scene (zoom 1): pieces turn their printed side toward it.
const CAM: V3 = [0, 261, 1130];
export const PLAZA = { x0: -1500, x1: 1500, z0: -330, z1: 330 };

let s = 1;
const r = (a: number, b: number) => { s = (s * 16807) % 2147483647; return a + (s / 2147483647) * (b - a); };
const f = (n: number) => n.toFixed(1);

// A panel whose printed side faces away from the camera is turned over (mirrored), so single-sided quads always show.
export function toCamera(p: Panel): Panel {
  const c = add(add(p.o, p.u, p.w / 2 / Math.hypot(...p.u)), p.v, p.h / 2 / Math.hypot(...p.v)), n = normal(p);
  if (n[0] * (CAM[0] - c[0]) + n[1] * (CAM[1] - c[1]) + n[2] * (CAM[2] - c[2]) >= 0) return p;
  const flip = (svg?: string) => svg && `<g transform="translate(0 ${p.h}) scale(1 -1)">${svg}</g>`;
  const v = unit(p.v);
  return { ...p, o: add(p.o, v, p.h), v: [-v[0], -v[1], -v[2]], mask: flip(p.mask), print: flip(p.print) };
}

/* ---------- ground: the brick plaza, the quay, the river and its far bank ---------- */
export function plaza(): Panel[] {
  s = 3;
  const W = PLAZA.x1 - PLAZA.x0, D = PLAZA.z1 - PLAZA.z0, bw = 46, bh = 22;
  let bricks = '';
  for (let row = 0, y = 0; y < D; row++, y += bh) for (let x = row % 2 ? -bw / 2 : 0; x < W; x += bw) { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; bricks += `<rect x="${f(x + 1)}" y="${f(y + 1)}" width="${bw - 2}" height="${bh - 2}" fill="${PAVER[Math.floor((h - Math.floor(h)) * 4)]}"/>`; }
  // Darker brick bands run across the plaza and frame the walk, like a laid pattern. The sheet ships as eight tiles:
  // with fewer, wider tiles Chrome's 3D sorting tore holes in it where standing pieces' planes cut across.
  const bands = [160, 420, 560].map(y => `<rect y="${y}" width="${W}" height="${bh}" fill="${BORDER}" fill-opacity=".55"/>`).join('');
  const base: Panel = { id: 'lawn', stock: 'greyboard', c: '#c98f78', w: W, h: D, o: [PLAZA.x0, 0, PLAZA.z1], u: [1, 0, 0], v: [0, 0, -1], density: .42, edge: 'fold', split: 8, print: `<rect width="${W}" height="${D}" fill="#b98270"/>${bricks}${bands}` };
  const skirt: Panel = { id: 'lawn-skirt', stock: 'greyboard', c: '#7a5546', w: W, h: 50, o: [PLAZA.x0, -50, PLAZA.z1 + 1], u: [1, 0, 0], v: [0, 1, 0], density: .6, edge: 'cut', split: 2, print: `<rect width="${W}" height="8" fill="#a8786a"/>` };
  // The river runs behind the quay, a little below the plaza.
  const quay: Panel = { id: 'quay-edge', stock: 'greyboard', c: '#b7a99a', w: W, h: 14, o: [PLAZA.x0, 0, PLAZA.z0 - .5], u: [1, 0, 0], v: [0, 0, -1], density: .6, edge: 'cut', print: `<rect width="${W}" height="4" fill="#d9cbbb"/>` };
  // Inlaid brick medallions, laid flat in the paving: a sun-and-waves rosette before the shop door, and a wave band
  // along the quay that leads the eye to the river gate.
  // The rosette is its own sheet so it stays crisp; the long wave band is flattened into the paving.
  const inlay = (id: string, x: number, z: number, w: number, h: number, print: string, mask: string, own = false): Panel => ({ id, stock: 'greyboard', c: BORDER, w, h, o: [x - w / 2, .6, z + h / 2], u: [1, 0, 0], v: [0, 0, -1], edge: 'cut', density: own ? 1.1 : .7, decal: own ? undefined : 'lawn', print, mask });
  const rays = Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<path d="M120 120L${f(120 + Math.cos(a - .1) * 112)} ${f(120 + Math.sin(a - .1) * 112)}L${f(120 + Math.cos(a + .1) * 112)} ${f(120 + Math.sin(a + .1) * 112)}Z" fill="${i % 2 ? '#e9c5ae' : '#cf927a'}"/>`; }).join('');
  const rosette = inlay('inlay-rosette', 150, 110, 240, 240, `<circle cx="120" cy="120" r="120" fill="${BORDER}"/><circle cx="120" cy="120" r="112" fill="#e5b8a0"/>${rays}<circle cx="120" cy="120" r="46" fill="${BORDER}"/><circle cx="120" cy="120" r="38" fill="#f6b73c"/>${[0, 1].map(k => `<path d="M${88 + k * 0} ${112 + k * 16}q8 -8 16 0t16 0t16 0t16 0" stroke="#0a6aa8" stroke-width="5" fill="none"/>`).join('')}`, '<circle cx="120" cy="120" r="120" fill="#fff"/>', true);
  const waveBand = inlay('inlay-waves', -300, -270, 1400, 40, `<rect width="1400" height="40" fill="#b98270"/>${Array.from({ length: 35 }, (_, i) => `<path d="M${i * 40} 26q10 -16 20 0t20 0" stroke="#0a6aa8" stroke-width="6" fill="none"/>`).join('')}`, '<rect width="1400" height="40" fill="#fff"/>');
  return [base, skirt, quay, rosette, waveBand];
}

/* ---------- the open view across the river: a shadow box ---------- */
// What the eye travels into through the gate is built the way a paper shadow box is: thin cut layers stood a little
// apart, one behind another, alternating pale and deep, each throwing its shadow and sky occlusion on the next.
// The layers are real in the bake, then flattened into two cards, so the whole view costs four quads.
// Card one stands just behind the quay railing and holds the near water and the boats. Card two stands further
// back and holds the far bank, so the two slide past each other as the camera walks.
type Card = { id: string; x0: number; z: number; w: number; density: number };
const NEAR: Card = { id: 'river-near', x0: -1320, z: -480, w: 1300, density: .95 };
const FAR: Card = { id: 'far-bank', x0: -1560, z: -740, w: 1620, density: .7 };
// One cut layer of a card: drawn in the card's own coordinates (x across, y up from the card's foot at y0), standing
// `gap` units in front of it.
const sheet = (card: Card, id: string, gap: number, y0: number, h: number, c: string, mask: string, print = '', stock: Panel['stock'] = 'sugar', x = 0, w = card.w): Panel =>
  ({ id, stock, c, w, h, o: [card.x0 + x, y0, card.z + gap], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: card.density, decal: card.id, mask, print });
// A band of water whose top is cut as a soft run of swells; y is measured down the sheet from its top.
function swell(w: number, h: number, top: number, amp: number, len: number, phase: number) {
  let d = `M0 ${h}V${f(top + amp * Math.sin(phase))}`;
  for (let x = 0; x < w; x += len) d += `Q${f(x + len / 4)} ${f(top - amp)} ${f(x + len / 2)} ${f(top)}T${f(x + len)} ${f(top)}`;
  return `<path d="${d}V${h}Z" fill="#fff"/>`;
}
const ripples = (w: number, h: number, top: number, n: number, c: string, len: [number, number]) => Array.from({ length: n }, () => {
  const x = r(0, w), y = r(top + 4, h - 2), l = r(...len);
  return `<path d="M${f(x)} ${f(y)}q${f(l / 4)} -3 ${f(l / 2)} 0t${f(l / 2)} 0" stroke="${c}" stroke-width="${f(r(1.6, 2.6))}" fill="none" stroke-opacity="${f(r(.5, .85))}"/>`;
}).join('');
// The near water: five bands from the deep one at the railing to the pale one meeting the far bank.
const WATERS = ['#b4e0f3', '#6dbbe3', '#9ad2ee', '#4aa3d3', '#2f7fb3'];
function nearWater(): Panel[] {
  s = 41;
  const H = 130, y0 = -50, tops = [122, 102, 88, 74, 58], gaps = [0, 34, 68, 100, 124];
  // Card coordinates: the card's foot is at y0, and a band whose top is t sits t units above it.
  return tops.map((t, i) => {
    const h = t + 6, top = 6, mask = swell(NEAR.w, h, top, 2.4 + i * .5, 90 + i * 26, i);
    const print = ripples(NEAR.w, h, top, 26 + i * 8, i % 2 ? '#d3eefa' : '#bfe6f8', [14 + i * 6, 34 + i * 10]);
    const base: Panel = { id: i ? `river-band${i}` : NEAR.id, stock: 'sugar', c: WATERS[i], w: NEAR.w, h, o: [NEAR.x0, y0, NEAR.z + gaps[i]], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: NEAR.density, mask, print, split: i ? undefined : 2 };
    return i ? { ...base, decal: NEAR.id } : base;
  });
}
// The boats ride between bands: each is two cut layers, the hull standing proud of the cabin or sail.
function boats(): Panel[] {
  const y0 = -50;
  // A tour boat between the fourth and fifth bands, its waterline hidden behind the deep band.
  const bx = 470, by = 50;
  const cabin = sheet(NEAR, 'boat-tour-cabin', 104, y0 + by + 22, 74, CREAM,
    '<path d="M30 74V30H196V74Z M48 30V0H128V30Z M140 30V8H146V30Z" fill="#fff"/>',
    `${Array.from({ length: 6 }, (_, i) => `<rect x="${40 + i * 26}" y="40" width="17" height="15" fill="#5d7f95"/>`).join('')}<rect x="48" width="80" height="30" fill="${CORAL}"/><rect x="58" y="7" width="60" height="11" fill="#5d7f95"/><rect x="140" y="8" width="6" height="22" fill="#3d444e"/><rect x="30" y="64" width="166" height="10" fill="#e9dcc4"/>`, 'cover', bx, 230);
  const hull = sheet(NEAR, 'boat-tour-hull', 116, y0 + by, 34, BLUE, '<path d="M0 0H230L206 34H22Z" fill="#fff"/>',
    `<rect width="230" height="7" fill="${CREAM}"/>${[0, 1, 2, 3].map(k => `<circle cx="${50 + k * 40}" cy="18" r="5" fill="${CREAM}" fill-opacity=".9"/>`).join('')}`, 'cover', bx, 230);
  // A sailboat further out, between the pale band and the next.
  const sx = 830, sy = 96;
  const sails = sheet(NEAR, 'sailboat-sails', 12, y0 + sy + 12, 116, '#fffdf6',
    '<path d="M48 0V116H51V0Z M53 6L96 108H53Z M46 22L8 108H46Z" fill="#fff"/>', `<rect x="48" width="3" height="116" fill="${BARK}"/><path d="M46 22L8 108H46Z" fill="#f4e3c3"/><path d="M53 70H96" stroke="${CORAL}" stroke-width="5"/>`, 'cover', sx, 100);
  const shull = sheet(NEAR, 'sailboat-hull', 22, y0 + sy, 16, CORAL, '<path d="M0 0H100L86 16H12Z" fill="#fff"/>', `<rect width="100" height="4" fill="${CREAM}"/>`, 'cover', sx, 100);
  return [cabin, hull, sails, shull];
}
// The far bank, back to front: the palest row of towers, a middle row, trees, the waterfront shops, the quay wall with
// a footbridge and a moored ferry, and the water lapping in front.
function farLayers(): Panel[] {
  s = 17;
  const W = FAR.w, y0 = -40, quay = 64; // the far quay's top sits quay units above the card's foot
  const row = (id: string, gap: number, lo: number, hi: number, minW: number, maxW: number, cols: string[], win: string, roofC: string, breaks: number, extra: (x: number, top: number, bw: number, H: number) => { m: string; p: string }) => {
    const H = quay + hi + 50; let mask = '', print = '';
    for (let x = r(-20, 0); x < W;) {
      const bw = r(minW, maxW), bh = r(lo, hi), top = H - quay - bh, c = cols[Math.floor(r(0, cols.length))];
      mask += `<rect x="${f(x)}" y="${f(top)}" width="${f(bw + 1)}" height="${f(H - top)}" fill="#fff"/>`;
      print += `<rect x="${f(x)}" y="${f(top)}" width="${f(bw + 1)}" height="${f(H - top)}" fill="${c}"/><rect x="${f(x)}" y="${f(top)}" width="${f(bw)}" height="4" fill="${roofC}"/>`;
      for (let wx = x + 8; wx < x + bw - 12; wx += 16) for (let wy = top + 12; wy < H - quay - 10; wy += 20) if (r(0, 1) > .35) print += `<rect x="${f(wx)}" y="${f(wy)}" width="7" height="10" fill="${win}"/>`;
      const e = extra(x, top, bw, H); mask += e.m; print += e.p;
      x += bw + (r(0, 1) < breaks ? r(36, 90) : r(-2, 6));
    }
    return { mask, print, H };
  };
  // Back row: tall pale towers with masts and tanks, barely tinted.
  const back = row('far-back', 0, 90, 150, 60, 120, ['#d6e6ea', '#dfe9e3', '#e6e2ec', '#d2e2ec'], '#eef6f8', '#c3d6dd', 0, (x, top, bw) => {
    const k = r(0, 1), cx = x + bw * r(.3, .7);
    if (k < .3) return { m: `<rect x="${f(cx - 1)}" y="${f(top - 34)}" width="2.5" height="34" fill="#fff"/>`, p: `<rect x="${f(cx - 1)}" y="${f(top - 34)}" width="2.5" height="34" fill="#b3c8d0"/>` };
    if (k < .55) return { m: `<rect x="${f(cx - 9)}" y="${f(top - 16)}" width="18" height="16" fill="#fff"/>`, p: `<rect x="${f(cx - 9)}" y="${f(top - 16)}" width="18" height="16" fill="#c9d9de"/>` };
    return { m: '', p: '' };
  });
  // The card itself is the back row, with pale water below the far quay.
  const backWater = `<rect y="${back.H - quay}" width="${W}" height="${quay}" fill="#fff"/>`;
  const card: Panel = { id: FAR.id, stock: 'sugar', c: '#d6e6ea', w: W, h: back.H, o: [FAR.x0, y0, FAR.z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FAR.density, split: 2, mask: back.mask + backWater, print: back.print + `<rect y="${back.H - quay}" width="${W}" height="${quay}" fill="#b9e0f2"/>` };
  // Middle row: offices and flats in soft mid tones, some with stepped tops.
  const mid = row('far-mid', 44, 58, 104, 70, 150, ['#a9c3cf', '#b8c9b4', '#cdbba8', '#adbdd6'], '#f1e6c9', '#98aeb9', .25, (x, top, bw) => {
    if (r(0, 1) > .4) return { m: '', p: '' };
    const sw = bw * .5, sx = x + bw * .25; return { m: `<rect x="${f(sx)}" y="${f(top - 20)}" width="${f(sw)}" height="20" fill="#fff"/>`, p: `<rect x="${f(sx)}" y="${f(top - 20)}" width="${f(sw)}" height="20" fill="#c3d2da"/>` };
  });
  // Trees along the far promenade: scalloped crowns, a few palms rising out of them.
  let tm = '', tp = '';
  const TH = quay + 120;
  for (let x = r(0, 30); x < W; x += r(46, 80)) {
    const cr = r(20, 34), cy = TH - quay - cr * .9 - r(0, 10);
    tm += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="#fff"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 6)}" r="${f(cr * .75)}" fill="#fff"/><rect x="${f(x - cr)}" y="${f(cy)}" width="${f(cr * 2.6)}" height="${f(TH - cy)}" fill="#fff"/>`;
    tp += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(cr)}" fill="${r(0, 1) > .5 ? '#4f9e66' : '#5aab70'}"/><circle cx="${f(x + cr * .8)}" cy="${f(cy + 6)}" r="${f(cr * .75)}" fill="#438c59"/>`;
    if (r(0, 1) < .22) { // a palm
      const px = x + cr * 1.6, top = TH - quay - r(96, 116);
      tm += `<rect x="${f(px - 2)}" y="${f(top)}" width="4" height="${f(TH - top)}" fill="#fff"/>` + [-50, -15, 20, 160, 200].map(a => `<path transform="translate(${f(px)} ${f(top)}) rotate(${a})" d="M0 -3Q14 -8 30 2Q14 0 0 3Z" fill="#fff"/>`).join('');
      tp += `<rect x="${f(px - 2)}" y="${f(top)}" width="4" height="${f(TH - top)}" fill="${BARK}"/>` + [-50, -15, 20, 160, 200].map(a => `<path transform="translate(${f(px)} ${f(top)}) rotate(${a})" d="M0 -3Q14 -8 30 2Q14 0 0 3Z" fill="${FROND}"/>`).join('');
    }
  }
  const trees = sheet(FAR, 'far-trees', 96, y0, TH, '#4f9e66', tm + `<rect y="${TH - quay}" width="${W}" height="${quay}" fill="#fff"/>`, tp + `<rect y="${TH - quay}" width="${W}" height="${quay}" fill="#4f9e66"/>`);
  // The waterfront: low warm shops and cafés with awnings and a flag or two.
  const front = row('far-front', 156, 40, 78, 60, 120, ['#f2cf8a', '#e9a77b', '#f4e3c3', '#e3b9a8', '#d8322f', '#9fc7b4', '#f6efe4'], '#5d7f95', '#8f5a4a', .45, (x, top, bw, H) => {
    const aw = [CORAL, BLUE, MINT, SUN][Math.floor(r(0, 4))];
    let m = `<path d="M${f(x + 4)} ${f(H - quay - 30)}h${f(bw - 8)}l4 10h${f(-bw)}Z" fill="#fff"/>`, p = `<path d="M${f(x + 4)} ${f(H - quay - 30)}h${f(bw - 8)}l4 10h${f(-bw)}Z" fill="${aw}"/><rect x="${f(x + 8)}" y="${f(H - quay - 20)}" width="${f(bw - 16)}" height="20" fill="#fff4e2"/>`;
    if (r(0, 1) > .5) { const roof = `M${f(x - 4)} ${f(top)}L${f(x + bw / 2)} ${f(top - 22)}L${f(x + bw + 4)} ${f(top)}Z`; m += `<path d="${roof}" fill="#fff"/>`; p += `<path d="${roof}" fill="#a8634e"/>`; }
    else if (r(0, 1) > .6) { m += `<rect x="${f(x + 10)}" y="${f(top - 26)}" width="2" height="26" fill="#fff"/><path d="M${f(x + 12)} ${f(top - 26)}l14 5l-14 5Z" fill="#fff"/>`; p += `<rect x="${f(x + 10)}" y="${f(top - 26)}" width="2" height="26" fill="#3d444e"/><path d="M${f(x + 12)} ${f(top - 26)}l14 5l-14 5Z" fill="${[CORAL, SUN, MINT][Math.floor(r(0, 3))]}"/>`; }
    return { m, p };
  });
  const frontSheet = sheet(FAR, 'far-front', 156, y0, front.H, '#f2cf8a', front.mask + `<rect y="${front.H - quay}" width="${W}" height="${quay}" fill="#fff"/>`, front.print + `<rect y="${front.H - quay}" width="${W}" height="${quay}" fill="#f2cf8a"/>`);
  // The quay wall with lamp posts and bollards, and a footbridge arching across from it toward the near bank.
  const QH = quay + 40;
  let qm = `<rect y="40" width="${W}" height="${quay}" fill="#fff"/>`, qp = `<rect y="40" width="${W}" height="${quay}" fill="#a99a8a"/><rect y="40" width="${W}" height="6" fill="#e2d6c4"/>${Array.from({ length: Math.floor(W / 34) }, (_, i) => `<path d="M${i * 34 + 10} 52v${quay - 14}" stroke="#93857a" stroke-width="1.4"/>`).join('')}`;
  for (let x = 30; x < W; x += r(110, 170)) { qm += `<rect x="${f(x)}" y="6" width="3" height="34" fill="#fff"/><circle cx="${f(x + 1.5)}" cy="6" r="5" fill="#fff"/>`; qp += `<rect x="${f(x)}" y="6" width="3" height="34" fill="#3d444e"/><circle cx="${f(x + 1.5)}" cy="6" r="5" fill="#fff4e2"/>`; }
  const quaySheet = sheet(FAR, 'far-quay', 196, y0, QH, '#a99a8a', qm, qp, 'greyboard');
  // The footbridge: a white arch on two piers, rising from the far quay at the right of the view.
  const bw = 300, bh = 70, bx = 1110;
  const arch = `M0 ${bh}V30Q${bw / 2} -6 ${bw} 30V${bh}H${bw - 22}V48Q${bw / 2} 22 22 48V${bh}Z`;
  const bridge = sheet(FAR, 'far-bridge', 210, y0 + quay - 26, bh, '#f4f1ea', `<path d="${arch}" fill="#fff"/><path d="M0 22Q${bw / 2} -14 ${bw} 22V26Q${bw / 2} -10 0 26Z" fill="#fff"/>${Array.from({ length: 15 }, (_, i) => `<rect x="${f(12 + i * 21)}" y="${f(18 - 18 * Math.sin(Math.PI * (12 + i * 21) / bw))}" width="2" height="14" fill="#fff"/>`).join('')}`,
    `<path d="M0 30Q${bw / 2} -6 ${bw} 30" stroke="#d9d2c4" stroke-width="3" fill="none"/><rect y="${bh - 8}" width="${bw}" height="8" fill="#d9d2c4"/>`, 'cover', bx, bw);
  // Two small yachts moored at the far quay, masts up.
  const yacht = (id: string, x: number, hull: string, k: number) => sheet(FAR, id, 222, y0 + quay - 30, 96 * k, '#fffdf6',
    `<g transform="scale(${k})"><path d="M0 76H110L96 96H12Z M30 58H80V76H30Z M54 0V58H57V0Z M59 6L92 56H59Z M52 16L24 56H52Z" fill="#fff"/></g>`,
    `<g transform="scale(${k})"><path d="M0 76H110L96 96H12Z" fill="${hull}"/><rect y="76" width="110" height="4" fill="${CREAM}"/><rect x="30" y="58" width="50" height="18" fill="#f4f1ea"/><rect x="38" y="63" width="9" height="7" fill="#5d7f95"/><rect x="52" y="63" width="9" height="7" fill="#5d7f95"/><rect x="54" width="3" height="58" fill="${BARK}"/><path d="M52 16L24 56H52Z" fill="#f4e3c3"/></g>`, 'cover', x, 110 * k);
  const ferry = [yacht('far-yacht-a', 600, CORAL, .62), yacht('far-yacht-b', 690, '#2f7d5b', .52)];
  // Water lapping along the foot of the far quay, hiding the ferry's waterline.
  const lap = sheet(FAR, 'far-water', 236, y0, quay - 22, '#9ad3ee', swell(W, quay - 22, 4, 2, 70, 0), ripples(W, quay - 22, 4, 40, '#d3eefa', [10, 26]));
  return [card, sheet(FAR, 'far-mid', 44, y0, mid.H, '#c6d3c4', mid.mask, mid.print), trees, frontSheet, quaySheet, bridge, ...ferry, lap];
}
export const riverView = (): Panel[] => [...nearWater(), ...boats(), ...farLayers()];

/* ---------- the river gate: columns, a slatted pergola, a sign, a railing, boats beyond ---------- */
export function riverGate(x0: number, x1: number, z: number): Panel[] {
  const mid = (x0 + x1) / 2, span = x1 - x0, H = 300;
  const col = (id: string, x: number) => box({ id, x, z, w: 34, h: H, d: 34, stock: 'cover', c: '#f4f1ea', front: `<rect x="4" width="3" height="${H}" fill="#000" fill-opacity=".08"/><rect y="${H - 30}" width="34" height="30" fill="#e2ddd2"/>`, left: `<rect y="${H - 30}" width="34" height="30" fill="#e2ddd2"/>`, right: `<rect y="${H - 30}" width="34" height="30" fill="#e2ddd2"/>`, noTop: true });
  const beam = box({ id: 'gate-beam', x: mid, z, y: H, w: span + 60, h: 30, d: 44, stock: 'cover', c: '#f4f1ea', front: `<rect y="24" width="${span + 60}" height="6" fill="#e2ddd2"/>` });
  // Seen from below: the pergola's slats over the gateway, and a glass canopy tinted aqua above them.
  const slats = Array.from({ length: Math.floor(span / 26) }, (_, i) => `<rect x="${i * 26 + 4}" width="12" height="150" fill="#fff"/>`).join('');
  const pergola: Panel = { id: 'gate-slats', stock: 'cover', c: '#8fdad0', w: span, h: 150, o: [x0, H + 2, z - 150], u: [1, 0, 0], v: [0, 0, 1], edge: 'fold', density: .8, print: `<rect width="${span}" height="150" fill="#8fdad0"/>${slats.replaceAll('#fff', '#f4f1ea')}<rect width="${span}" height="10" fill="#f4f1ea"/><rect y="140" width="${span}" height="10" fill="#f4f1ea"/>` };
  // The sign carries a pictogram, never words: waves under a shopping bag.
  const sign: Panel = { id: 'gate-sign', stock: 'cover', c: CREAM, w: 220, h: 56, o: [mid - 110, H - 64, z + 24], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4, mask: '<rect width="220" height="56" rx="8" fill="#fff"/>',
    print: `<rect x="6" y="6" width="208" height="44" rx="5" fill="${DEEP}"/><path d="M92 18h36l-4 22h-28Z" fill="${CREAM}"/><path d="M100 18q10 -12 20 0" stroke="${CREAM}" stroke-width="3" fill="none"/>${[0, 1].map(k => `<path d="M${30 + k * 130} 32q8 -8 16 0t16 0t16 0t16 0" stroke="#8fd3f4" stroke-width="4" fill="none"/>`).join('')}` };
  const flag = (x: number, c: string) => ({ m: `<rect x="${x}" width="3" height="60" fill="#fff"/><path d="M${x + 3} 2L${x + 40} 14L${x + 3} 26Z" fill="#fff"/>`, p: `<rect x="${x}" width="3" height="60" fill="#3d444e"/><path d="M${x + 3} 2L${x + 40} 14L${x + 3} 26Z" fill="${c}"/>` });
  const fl = [flag(8, CORAL), flag(span / 2 + 28, SUN), flag(span + 48, MINT)];
  const flagsOnTop = [{ id: 'gate-flags', stock: 'cover', c: CORAL, w: span + 92, h: 60, o: [x0 - 30, H + 30, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4, mask: fl.map(q => q.m).join(''), print: fl.map(q => q.p).join('') } as Panel];
  // The quay railing across the opening.
  const posts = Array.from({ length: 24 }, (_, i) => `<rect x="${i * ((span + 200) / 23)}" y="6" width="4" height="50" fill="#fff"/>`).join('');
  const railing: Panel = { id: 'quay-rail', stock: 'greyboard', c: '#e8e4dc', w: span + 200, h: 56, o: [x0 - 100, 0, -326], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4, mask: `<rect width="${span + 200}" height="6" fill="#fff"/><rect y="26" width="${span + 200}" height="3" fill="#fff"/>${posts}` };
  return [...col('gate-col-l', x0), ...col('gate-col-r', x1), ...beam, pergola, sign, ...flagsOnTop, railing];
}

/* ---------- trees ---------- */
// A palm: a ringed, gently curved trunk cut twice and crossed, and a crown of cut fronds, each fanned at its own angle
// and droop, in two greens, with a cluster of coconuts.
const frondMask = (L: number, W: number, seed: number) => {
  // Broad blade leaflets swept toward the tip, the way a frond is cut from one folded sheet.
  s = seed; const n = 10, half = W / 2; let top = `M0 ${half - 3}`, bot = '';
  for (let i = 0; i < n; i++) {
    const x0 = i * L / n, x1 = (i + 1) * L / n, dx = x1 - x0, k = Math.sin(Math.PI * (i + 1.2) / (n + 1)) ** .6, l = half * (.35 + .65 * k) * r(.9, 1.05);
    top += `L${f(x0 + dx * .1)} ${f(half - 3)}L${f(x0 + dx * 1.7)} ${f(half - l)}L${f(x1 + dx * .05)} ${f(half - 3)}`;
    bot = `L${f(x1 + dx * .05)} ${f(half + 3)}L${f(x0 + dx * 1.6)} ${f(half + l)}L${f(x0 + dx * .1)} ${f(half + 3)}` + bot;
  }
  return `<path d="${top}L${L} ${half}${bot}L0 ${half + 3}Z" fill="#fff"/>`;
};
// One sheet cut as a fan of three fronds from a common base, set at its own heading and droop.
function frondFan(id: string, top: V3, deg: number, droop: number, L: number, W: number, spread: number, c: string, vein: string, seed: number): Panel {
  const a = deg * Math.PI / 180, dir = unit([Math.cos(a), -droop, Math.sin(a)]), side = unit(cross([0, 1, 0], dir));
  const H = 2 * L * Math.sin(spread * Math.PI / 180) + W, mid = H / 2;
  const one = (ang: number, len: number, k: number) => `<g transform="translate(0 ${f(mid)}) rotate(${ang}) translate(0 ${f(-W / 2)})">${frondMask(len, W, seed + k).replace('fill="#fff"', 'FILL')}</g>`;
  const fronds = [[-spread, L * .86], [0, L], [spread, L * .8]].map(([ang, len], k) => one(ang, len, k));
  const ribs = [[-spread, L * .86], [0, L], [spread, L * .8]].map(([ang, len]) => `<g transform="translate(0 ${f(mid)}) rotate(${ang})"><path d="M0 0H${f(len)}" stroke="${vein}" stroke-width="2.6"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${f(i * len / 12 + 6)} 0l${f(len / 14)} ${f(-W * .32)}M${f(i * len / 12 + 6)} 0l${f(len / 14)} ${f(W * .32)}" stroke="#000" stroke-opacity=".1" stroke-width="1.4"/>`).join('')}</g>`).join('');
  return toCamera({ id, stock: 'sugar', c, w: L, h: H, o: add(top, side, -mid), u: dir, v: side, edge: 'cut', density: .9, mask: fronds.map(m => m.replace('FILL', 'fill="#fff"')).join(''), print: `${fronds.map((m, k) => m.replace('FILL', `fill="${k === 1 ? c : k ? LEAF : FROND_DARK}"`)).join('')}${ribs}` });
}
export function palm(id: string, x: number, z: number, h: number, lean: number, spin = 0): Panel[] {
  const top: V3 = [x + lean, h, z];
  const trunkMask = `<path d="M${8} ${h}C${10} ${h * .6} ${16 + lean * .4} ${h * .3} ${20 + lean} 0H${36 + lean}C${32 + lean * .4} ${h * .3} ${30} ${h * .6} ${34} ${h}Z" fill="#fff"/>`;
  const rings = Array.from({ length: Math.floor(h / 13) }, (_, i) => { const y = h - i * 13, t = i * 13 / h, cx = 21 + lean * t * t; return `<path d="M${f(cx - 14)} ${y}q14 7 28 0" stroke="#7a5f45" stroke-width="2.6" fill="none"/><path d="M${f(cx - 10)} ${y - 5}l4 -3" stroke="#c4a27c" stroke-width="2"/>`; }).join('');
  const trunk = [0].map((d, i): Panel => { const R = yaw(d); return { id: `${id}-trunk${i}`, stock: 'sugar', c: BARK, w: 44 + lean, h, o: add([x, 0, z], R([-21, 0, 0])), u: R([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: .9, mask: trunkMask, print: `<rect width="${44 + lean}" height="${h}" fill="${BARK}"/>${rings}` }; });
  // Six fans: two lifted toward the sky, four arching down and out.
  const fans = [[15, -.4, 150], [175, -.3, 145], [80, .3, 175], [250, .3, 175], [320, .4, 165]]
    .map(([deg, droop, L], i) => frondFan(`${id}-fan${i}`, top, deg + spin, droop, L, 74, 20, i % 2 ? FROND : '#4aa865', '#2b5e3a', i * 17 + 3));
  return [...trunk, ...fans];
}
// A broadleaf shade tree like a cut-paper canopy: a forked trunk, then scalloped leaf clusters layered at different
// depths, each printed with smaller scallops in a lighter and a darker green.
export const scallopBlob = (w: number, h: number, n: number) => {
  const cx = w / 2, cy = h / 2, rx = w / 2 - 8, ry = h / 2 - 8; let d = '';
  for (let i = 0; i <= n; i++) { const t = i / n * Math.PI * 2, x = cx + Math.cos(t) * rx, y = cy + Math.sin(t) * ry; d += i ? `A${f(rx * .32)} ${f(ry * .32)} 0 0 1 ${f(x)} ${f(y)}` : `M${f(x)} ${f(y)}`; }
  return `${d}Z`;
};
export function shadeTree(id: string, x: number, z: number, h: number): Panel[] {
  const tw = 200, trunkMask = `<path d="M90 ${h}C94 ${h * .7} 96 ${h * .5} 92 ${h * .38}L40 ${h * .12}L48 ${h * .08}L98 ${h * .32}L104 ${h * .05}L114 ${h * .05}L110 ${h * .33}L158 ${h * .1}L166 ${h * .15}L114 ${h * .42}C112 ${h * .55} 114 ${h * .75} 120 ${h}Z" fill="#fff"/>`;
  const trunk: Panel = { id: `${id}-trunk`, stock: 'sugar', c: '#8b6a4c', w: tw, h, o: [x - tw / 2, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, mask: trunkMask, print: `<path d="M100 ${h}C102 ${h * .7} 104 ${h * .5} 100 ${h * .4}" stroke="#6e523a" stroke-width="3" fill="none"/>` };
  const shades = [['#3f9a5b', '#57b36f', '#2f7d48'], ['#57b36f', '#7fc49a', '#3f9a5b'], ['#2f7d48', '#3f9a5b', '#24633a']];
  const clusters = [[-70, h * .8, -30, 190, 130, 0], [80, h * .82, -20, 190, 140, 1], [0, h * 1.02, -40, 220, 150, 2], [-100, h * .98, 12, 140, 100, 1], [40, h * .66, 26, 160, 100, 0]];
  const leaves = clusters.map(([dx, y, dz, w, ch, k], i): Panel => {
    const [c, light, dark] = shades[k], blob = scallopBlob(w, ch, 11), inner = (sc: number, col: string, oy: number) => `<path transform="translate(${f(w * (1 - sc) / 2)} ${f(ch * (1 - sc) / 2 + oy)}) scale(${sc})" d="${scallopBlob(w, ch, 9)}" fill="${col}"/>`;
    return { id: `${id}-leaves${i}`, stock: 'sugar', c, w, h: ch, o: [x + dx - w / 2, y - ch / 2, z + dz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1, mask: `<path d="${blob}" fill="#fff"/>`,
      print: `${inner(.82, dark, 10)}${inner(.62, c, 4)}${inner(.4, light, -8)}${Array.from({ length: 10 }, (_, j) => `<path d="M${f(w * (.2 + j * .065))} ${f(ch * (.3 + (j % 3) * .15))}q4 -6 8 0" stroke="${light}" stroke-width="2" fill="none"/>`).join('')}` };
  });
  return [trunk, ...leaves];
}

/* ---------- plaza furniture ---------- */
// A raised square planter with a tiled rim.
export function planter(id: string, x: number, z: number, w: number, h = 40): Panel[] {
  const tiles = (len: number) => `<rect width="${len}" height="${h}" fill="${TILE}"/>${Array.from({ length: Math.ceil(len / 20) }, (_, i) => `<rect x="${i * 20 + 1}" y="1" width="18" height="${h / 2 - 2}" fill="#4f5e70"/><rect x="${i * 20 + 11}" y="${h / 2 + 1}" width="18" height="${h / 2 - 2}" fill="#4f5e70"/>`).join('')}<rect width="${len}" height="5" fill="#c9ccd1"/>`;
  return box({ id, x, z, w, h, d: w, stock: 'cover', c: TILE, front: tiles(w), left: tiles(w), right: tiles(w), top: `<rect width="${w}" height="${w}" fill="#c9ccd1"/><rect x="7" y="7" width="${w - 14}" height="${w - 14}" fill="#6b4a33"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${12 + (i * 37) % (w - 24)}" cy="${12 + (i * 23) % (w - 24)}" r="2.5" fill="#d9cbbb"/>`).join('')}` });
}
// A low bush cut from two scalloped sheets, one in front of the other.
export function bush(id: string, x: number, z: number, w: number, h: number, y = 0): Panel[] {
  return [0].map((k): Panel => ({ id: `${id}-${k}`, stock: 'sugar', c: k ? LEAF : FROND, w: w * (k ? .8 : 1), h: h * (k ? .75 : 1), o: [x - w * (k ? .32 : .5), y, z + k * 10], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
    mask: `<path d="${scallopBlob(w * (k ? .8 : 1), h * (k ? .75 : 1) * 1.6, 9)}" fill="#fff"/>`, print: `<path transform="translate(0 6)" d="${scallopBlob(w * (k ? .8 : 1), h * (k ? .75 : 1) * 1.6, 7)}" fill="${FROND_DARK}" fill-opacity=".6"/><path transform="translate(${f(w * .15)} ${f(h * .3)}) scale(.7)" d="${scallopBlob(w, h * 1.6, 7)}" fill="${LEAF}"/>` }));
}
// A string of festoon lights between two anchors at the same height.
export function festoon(id: string, a: V3, b: V3, sag: number, every = 46): Panel {
  const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz), H = sag + 26, rope = (t: number) => 4 + sag * 4 * t * (1 - t);
  const pts = Array.from({ length: 41 }, (_, i) => `${i ? 'L' : 'M'}${f(i / 40 * L)} ${f(rope(i / 40))}`).join('');
  const bulbs = Array.from({ length: Math.floor(L / every) }, (_, i) => { const t = (i + .5) * every / L, x = t * L, y = rope(t); return `<rect x="${f(x - 1)}" y="${f(y)}" width="2" height="6" fill="#fff"/><circle cx="${f(x)}" cy="${f(y + 10)}" r="5" fill="#fff"/>`; }).join('');
  const glow = bulbs.replace(/fill="#fff"\/><circle/g, 'fill="#3d444e"/><circle').replace(/r="5" fill="#fff"/g, 'r="5" fill="#ffe7a8"');
  return { id, stock: 'vellum', c: '#ffe7a8', w: L, h: H, o: [a[0], a[1] - H + 4, a[2]], u: [dx / L, 0, dz / L], v: [0, 1, 0], edge: 'cut', density: .8, emit: .5, mask: `<path d="${pts}" stroke="#fff" stroke-width="2.4" fill="none"/>${bulbs}`, print: `<path d="${pts}" stroke="#3d444e" stroke-width="2.4" fill="none"/>${glow}` };
}
// A flag pole with a lantern and a long pennant, like the ones that mark the promenade.
export function flagPole(id: string, x: number, z: number, h: number, flag: string): Panel[] {
  return [{ id: `${id}-pole`, stock: 'greyboard', c: '#f4f1ea', w: 10, h, o: [x - 5, 0, z + 5], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1 } as Panel,
    { id: `${id}-lamp`, stock: 'vellum', c: '#fff4e2', w: 46, h: 30, o: [x - 23, h + 2, z + 6], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', emit: .5, density: 2, mask: '<path d="M8 30H38L46 10H40V0H6V10H0Z" fill="#fff"/>', print: '<rect width="46" height="10" fill="#3d444e"/><rect x="20" y="10" width="6" height="20" fill="#3d444e" fill-opacity=".4"/>' },
    { id: `${id}-flag`, stock: 'cover', c: flag, w: 40, h: 110, o: [x + 5, h - 140, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6, mask: '<path d="M0 0H36L40 50L30 110L18 92L0 106Z" fill="#fff"/>', print: '<rect width="40" height="6" fill="#000" fill-opacity=".15"/><path d="M8 30h20M8 40h14" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>' }];
}
// A slatted round-ish bin.
export const bin = (id: string, x: number, z: number) => box({ id, x, z, w: 36, h: 58, d: 36, stock: 'greyboard', c: '#6b7480', front: Array.from({ length: 6 }, (_, i) => `<rect x="${2 + i * 6}" width="3" height="58" fill="#4d5560"/>`).join('') + '<rect width="36" height="6" fill="#3d444e"/>', top: '<rect x="5" y="5" width="26" height="26" fill="#2b2f36"/>' });
// A person cut from card in two layers: the figure, and an arm with whatever it carries standing a little proud of it.
// One design, varied by build (trousers, shorts, dress, child), hat, backpack and colours.
export type Look = { coat: string; legs: string; skin: string; hair: string; carry?: string; style?: 'trousers' | 'shorts' | 'dress'; hat?: string; pack?: string; shoes?: string };
export function shopper(id: string, x: number, z: number, look: Look, flip = false, k = 1, rot = 0, arm = true): Panel[] {
  const { coat, legs, skin, hair, carry, style = 'trousers', hat, pack, shoes = '#2b2622' } = look;
  const w = 74 * k, h = 176 * k, R = yaw(rot), fl = flip ? 'translate(74 0) scale(-1 1)' : '';
  const head = 'M23 22Q25 5 37 5Q49 5 50 22Q51 37 43 43H31Q21 37 23 22Z';
  const body = style === 'dress' ? 'M31 43H43Q57 46 57 64V100L64 140H10L17 100V64Q17 46 31 43Z M24 140H32V172H24Z M42 140H50V172H42Z'
    : style === 'shorts' ? 'M31 43H43Q57 46 57 64V116H50V128H48V170H40V128H34V170H26V128H24V116H17V64Q17 46 31 43Z'
    : 'M31 43H43Q57 46 57 64V118H50V172H40V126H34V172H24V118H17V64Q17 46 31 43Z';
  const feet = '<rect x="21" y="168" width="13" height="8" rx="3"/><rect x="38" y="168" width="14" height="8" rx="3"/>';
  const hatShape = hat ? '<ellipse cx="37" cy="12" rx="22" ry="5"/><path d="M27 12Q27 0 37 0Q47 0 47 12Z"/>' : '';
  const packShape = pack ? '<rect x="52" y="52" width="16" height="44" rx="5"/>' : '';
  const g = (inner: string) => `<g transform="scale(${k}) ${fl}">${inner}</g>`;
  const legsPrint = style === 'dress' ? `<rect y="140" width="74" height="36" fill="${skin}"/>` : style === 'shorts' ? `<rect y="116" width="74" height="14" fill="${legs}"/><rect y="130" width="74" height="40" fill="${skin}"/>` : `<rect y="116" width="74" height="56" fill="${legs}"/>`;
  const print = `<rect width="74" height="176" fill="${coat}"/>${legsPrint}<rect width="74" height="44" fill="${skin}"/><path d="M23 22Q22 4 37 4Q52 4 51 22Q46 11 33 13Q27 15 23 22Z" fill="${hair}"/>` +
    `<circle cx="42" cy="25" r="2" fill="${INK}"/><path d="M40 33q3 2 6 0" stroke="${INK}" stroke-width="1.4" fill="none"/>` +
    `<path d="M31 43L37 52L43 43" fill="#fff" fill-opacity=".55"/><path d="M17 64V96M57 64V96" stroke="#000" stroke-opacity=".14" stroke-width="3"/>` +
    (style === 'dress' ? `<path d="M17 100H57" stroke="#000" stroke-opacity=".15" stroke-width="3"/>${[0, 1, 2].map(i => `<circle cx="${26 + i * 11}" cy="${112 + (i % 2) * 12}" r="3" fill="#fff" fill-opacity=".5"/>`).join('')}` : `<rect x="17" y="112" width="40" height="5" fill="#000" fill-opacity=".25"/>`) +
    `<g fill="${shoes}">${feet}</g>` + (hat ? `<g fill="${hat}">${hatShape}</g><rect x="27" y="7" width="20" height="3" fill="#000" fill-opacity=".2"/>` : '') + (pack ? `<rect x="52" y="52" width="16" height="44" rx="5" fill="${pack}"/><rect x="54" y="72" width="12" height="10" fill="#000" fill-opacity=".15"/>` : '');
  const base = (cid: string, ww: number, hh: number, dx: number, dz: number): Panel => ({ id: cid, stock: 'cover', c: coat, w: ww, h: hh, o: add([x, 0, z], R([-w / 2 + dx, 0, dz])), u: R([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1.7 });
  const parts: Panel[] = [{ ...base(id, w, h, 0, 0), mask: g(`<path d="${head}" fill="#fff"/><path d="${body}" fill="#fff"/><g fill="#fff">${feet}${hatShape}${packShape}</g>`), print: g(print) }];
  if (arm && carry) parts.push({ ...base(`${id}-arm`, 34 * k, 96 * k, flip ? 6 * k : 42 * k, 5), mask: `<g transform="scale(${k})"><path d="M10 0H22V52H28V96H4V52H10Z" fill="#fff"/></g>`, print: `<g transform="scale(${k})"><rect width="34" height="52" fill="${coat}"/><rect y="46" width="34" height="6" fill="${skin}"/><rect y="52" width="34" height="44" fill="${carry}"/><rect x="8" y="58" width="16" height="4" fill="#fff" fill-opacity=".5"/><path d="M10 52q6 -10 12 0" stroke="#000" stroke-opacity=".3" stroke-width="2" fill="none"/></g>` });
  return parts;
}

/* ---------- stalls ---------- */
// A boat-tour ticket kiosk: slatted counter, dark frame, flat roof, a poster wall of boats and a seller behind.
export function ticketKiosk(id: string, x: number, z: number, rot: number): Panel[] {
  const R = yaw(rot), at = (lx: number, ly: number, lz: number): V3 => add([x, ly, z], R([lx, 0, lz]));
  const slats = (w: number) => `<rect width="${w}" height="76" fill="#f4f1ea"/>${Array.from({ length: Math.floor(w / 46) }, (_, i) => `<rect x="${8 + i * 46}" y="16" width="40" height="52" fill="#c8915a"/><path d="M${8 + i * 46} ${30}h40M${8 + i * 46} 44h40M${8 + i * 46} 58h40" stroke="#a8693a" stroke-width="1.6"/>`).join('')}<rect width="${w}" height="8" fill="#fff"/>`;
  const counter = box({ id: `${id}-counter`, x, z, w: 190, h: 76, d: 70, rot, stock: 'cover', c: '#f4f1ea', density: 1.4, front: slats(190), left: slats(70), right: slats(70), top: '<rect width="190" height="70" fill="#fff"/>' });
  const posts: Panel = { id: `${id}-posts`, stock: 'greyboard', c: '#2b2f36', w: 184, h: 150, o: at(-92, 76, 34), u: R([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1, mask: '<rect width="8" height="150" fill="#fff"/><rect x="176" width="8" height="150" fill="#fff"/>' };
  const roof = box({ id: `${id}-roof`, x, z: z, y: 226, w: 230, h: 14, d: 104, rot, stock: 'greyboard', c: '#2b2f36', density: 1, front: '<rect y="9" width="230" height="5" fill="#f4f1ea"/>', top: '<rect width="230" height="104" fill="#3d444e"/>' });
  const poster: Panel = { id: `${id}-poster`, stock: 'bond', c: BLUE, w: 170, h: 140, o: at(-85, 80, -30), u: R([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1.3,
    print: `<rect width="170" height="140" fill="${DEEP}"/><rect x="8" y="8" width="72" height="56" fill="#8fd3f4"/><path d="M14 46h56l-6 10h-44Z" fill="${CORAL}"/><rect x="24" y="34" width="34" height="12" fill="${CREAM}"/><rect x="88" y="8" width="74" height="56" fill="#8fd3f4"/><path d="M96 50h58l-6 8h-46Z" fill="#d8322f"/><rect x="104" y="38" width="22" height="12" fill="${CREAM}"/><rect x="8" y="72" width="154" height="60" fill="#8fd3f4"/><path d="M8 110Q60 90 100 112T162 104V132H8Z" fill="#4fa9d6"/><path d="M40 84h20v16h-20Z M110 90h16v10h-16Z" fill="${CREAM}"/>` };
  const seller = shopper(`${id}-seller`, 0, 0, { coat: '#22324a', legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', hat: '#22324a' }, false, .9, 0, false).map((p): Panel => ({ ...p, o: at(-60, 0, -12), u: R([1, 0, 0]) }));
  const rack: Panel = { id: `${id}-brochures`, stock: 'bond', c: '#fff', w: 50, h: 34, o: at(40, 76, 20), u: R([1, 0, 0]), v: unit([0, 1, .35]), edge: 'cut', density: 2.2, print: `<rect width="50" height="34" fill="#fff"/>${[0, 1, 2].map(i => `<rect x="${3 + i * 16}" y="4" width="13" height="26" fill="${[CORAL, BLUE, SUN][i]}"/>`).join('')}` };
  const sign: Panel = { id: `${id}-sign`, stock: 'cover', c: SUN, w: 70, h: 52, o: at(-110, 170, 52), u: R([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2.2, mask: '<circle cx="35" cy="26" r="26" fill="#fff"/>', print: `<circle cx="35" cy="26" r="20" fill="${CREAM}"/><path d="M20 30h30l-4 7h-22Z" fill="${BLUE}"/><path d="M30 20h10v10h-10Z" fill="${CORAL}"/>` };
  return [...counter, posts, ...roof, poster, ...seller, sign];
}
// A clothing stall under a striped tent: a rail of dresses and shirts, a table of folded goods.
export function clothesStall(id: string, x: number, z: number): Panel[] {
  const colours = ['#e8552d', '#35b58a', '#7c6be0', '#f6b73c', '#0092da', '#e88ab0', '#2bb5b8'];
  let mask = '<rect x="0" y="0" width="200" height="6" fill="#fff"/><rect x="0" width="6" height="190" fill="#fff"/><rect x="194" width="6" height="190" fill="#fff"/>', print = '<rect width="200" height="6" fill="#3d444e"/><rect width="6" height="190" fill="#3d444e"/><rect x="194" width="6" height="190" fill="#3d444e"/>';
  for (let i = 0; i < 7; i++) {
    const cx = 18 + i * 27, dress = i % 3 !== 1, len = dress ? 120 + (i % 2) * 20 : 70;
    const shape = dress ? `M${cx - 6} 6h12l4 14l10 ${len - 20}h-40l10 ${-(len - 20)}Z` : `M${cx - 8} 6h16l12 14l-6 6l-4 -4v${len - 26}h-20v${-(len - 26)}l-4 4l-6 -6Z`;
    mask += `<path d="${shape}" fill="#fff"/>`; print += `<path d="${shape}" fill="${colours[i]}"/><path d="${shape}" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2"/>`;
  }
  const rail: Panel = { id: `${id}-rail`, stock: 'cover', c: '#3d444e', w: 200, h: 190, o: [x - 100, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.8, mask, print };
  const stripe = (w: number) => Array.from({ length: Math.ceil(w / 40) }, (_, i) => `<rect x="${i * 40}" width="20" height="200" fill="${CREAM}"/>`).join('');
  const tent = [-1, 1].map((k): Panel => ({ id: `${id}-tent-${k < 0 ? 'f' : 'b'}`, stock: 'cover', c: '#e8552d', w: 260, h: 80, o: [x - 130, 210, z + (k < 0 ? 70 : -70)], u: [1, 0, 0], v: unit([0, 40, k < 0 ? -70 : 70]), edge: 'fold', density: 1.4, print: stripe(260) }));
  const legs = [-1, 1].map((k): Panel => ({ id: `${id}-tentpost-${k}`, stock: 'greyboard', c: '#3d444e', w: 6, h: 210, o: [x + k * 126 - 3, 0, z + 70], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4 }));
  const table = box({ id: `${id}-table`, x: x + 10, z: z + 60, w: 150, h: 64, d: 50, stock: 'cover', c: '#f4f1ea', front: `<rect y="8" width="150" height="56" fill="#c8915a"/>`, top: [0, 1, 2, 3, 4].map(i => `<rect x="${8 + i * 28}" y="10" width="24" height="30" fill="${colours[(i + 2) % 7]}"/>`).join('') });
  return [rail, ...tent.map(toCamera), ...legs, ...table];
}
// A café table with a square parasol.
export function parasolTable(id: string, x: number, z: number, c: string): Panel[] {
  const y0 = 170, R = 80, apex: V3 = [x, y0 + 46, z];
  const corner = (k: number): V3 => [x + R * Math.cos((45 + 90 * k) * Math.PI / 180), y0, z + R * Math.sin((45 + 90 * k) * Math.PI / 180)];
  const canopy = [0, 1, 2, 3].map((k): Panel => {
    const a = corner(k), b = corner(k + 1), w = Math.hypot(b[0] - a[0], b[2] - a[2]), mid: V3 = [(a[0] + b[0]) / 2, y0, (a[2] + b[2]) / 2], up: V3 = [apex[0] - mid[0], apex[1] - mid[1], apex[2] - mid[2]], h = Math.hypot(...up);
    return { id: `${id}-canopy${k}`, stock: 'cover', c, w, h, o: a, u: [(b[0] - a[0]) / w, 0, (b[2] - a[2]) / w], v: unit(up), edge: 'fold', density: 1.4, mask: `<path d="M0 ${f(h)}H${f(w)}L${f(w / 2)} 0Z" fill="#fff"/>`, print: `<path d="M${f(w * .25)} ${f(h * .5)}L${f(w / 2)} 0L${f(w * .75)} ${f(h * .5)}" fill="#fff" fill-opacity=".25"/><rect y="${f(h - 6)}" width="${f(w)}" height="6" fill="#fff" fill-opacity=".6"/>` };
  });
  const pole: Panel = { id: `${id}-pole`, stock: 'greyboard', c: '#f4f1ea', w: 5, h: y0, o: [x - 2.5, 0, z + 1], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4 };
  const table = [{ id: `${id}-table`, stock: 'cover', c: '#f4f1ea', w: 70, h: 70, o: [x - 35, 62, z + 35], u: [1, 0, 0], v: [0, 0, -1], edge: 'cut', density: 1.4, mask: '<circle cx="35" cy="35" r="35" fill="#fff"/>', print: '<circle cx="35" cy="35" r="10" fill="#e88ab0"/><rect x="48" y="20" width="10" height="14" fill="#fff"/>' } as Panel];
  const chair = (dx: number) => `<path transform="translate(${dx} 0)" d="M4 0H36V8H32V40H40V46H36V80H30V52H10V80H4V46H0V40H8V8H4Z" fill="#fff"/>`;
  const chairs = [{ id: `${id}-chairs`, stock: 'cover', c: '#3d444e', w: 156, h: 80, o: [x - 78, 0, z + 20], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, mask: chair(0) + chair(116) } as Panel];
  return [...canopy, pole, ...table, ...chairs];
}

/* ---------- facades: the bounding buildings, built flat and dressed in carved relief ---------- */
export type Frame = { o: V3; u: V3; n: V3; rot: number };
export const frame = (x: number, z: number, rot: number): Frame => ({ o: [x, 0, z], u: yaw(rot)([1, 0, 0]), n: yaw(rot)([0, 0, 1]), rot });
export const fat = (fr: Frame, along: number, y: number, out: number): V3 => add(add(add(fr.o, fr.u, along), [0, y, 0]), fr.n, out);
// A flat piece on the facade, `out` units proud of it.
export const fflat = (fr: Frame, id: string, along: number, y: number, out: number, w: number, h: number, rest: Partial<Panel>): Panel => ({ id, stock: 'cover', c: CREAM, o: fat(fr, along, y, out), u: fr.u, v: [0, 1, 0], w, h, edge: 'cut', ...rest });
// A box standing off the facade: `w` along it, `d` out from it.
export const fbox = (fr: Frame, id: string, along: number, y: number, out: number, w: number, h: number, d: number, rest: Partial<Parameters<typeof box>[0]> = {}) => { const c = fat(fr, along + w / 2, 0, out + d / 2); return box({ id, x: c[0], z: c[2], y, w, h, d, rot: fr.rot, stock: 'cover', c: CREAM, ...rest }); };
// A sloped awning running out from the wall at `y` and dropping by `drop` over `depth`.
export const fawning = (fr: Frame, id: string, along: number, y: number, w: number, depth: number, drop: number, c: string, stripes = true): Panel[] => {
  const v = unit(add([0, drop, 0], fr.n, -depth)), h = Math.hypot(depth, drop);
  const stripe = stripes ? Array.from({ length: Math.ceil(w / 36) }, (_, i) => `<rect x="${i * 36}" width="18" height="${f(h)}" fill="${CREAM}"/>`).join('') : '';
  return [{ id, stock: 'cover', c, w, h, o: fat(fr, along, y - drop, depth), u: fr.u, v, edge: 'fold', density: 1.4, print: stripe },
    { id: `${id}-lip`, stock: 'cover', c, w, h: 16, o: fat(fr, along, y - drop - 16, depth), u: fr.u, v: [0, 1, 0], edge: 'cut', density: 1.4, print: stripe, mask: `<path d="M0 0H${w}V6${Array.from({ length: Math.ceil(w / 24) }, () => 'a12 10 0 0 1 -24 0').join('')}Z" fill="#fff"/>` }];
};
// A balcony: slab, railing with balusters, and the pots that live on it.
export const fbalcony = (fr: Frame, id: string, along: number, y: number, w: number, depth: number): Panel[] => [
  ...fbox(fr, `${id}-slab`, along, y - 10, 0, w, 10, depth, { c: '#f4f1ea' }),
  fflat(fr, `${id}-rail`, along, y, depth, w, 46, { c: '#f4f1ea', mask: `<rect width="${w}" height="6" fill="#fff"/>${Array.from({ length: Math.floor(w / 14) + 1 }, (_, i) => `<rect x="${Math.min(i * 14, w - 4)}" width="4" height="46" fill="#fff"/>`).join('')}` }),
  ...[0, 1, 2].flatMap(k => fbox(fr, `${id}-pot${k}`, along + 16 + k * (w - 50) / 2, y, 8, 22, 20, 22, { c: [CORAL, '#c8915a', SUN][k] })),
  ...[0, 1, 2].map(k => fflat(fr, `${id}-plant${k}`, along + 8 + k * (w - 50) / 2, y + 18, 19, 38, 34, { stock: 'sugar', c: LEAF, mask: `<path d="${scallopBlob(38, 40, 7)}" fill="#fff"/>` }))
];
// A window box of flowers under a window.
export const fflowers = (fr: Frame, id: string, along: number, y: number, w: number): Panel[] => [
  ...fbox(fr, `${id}-box`, along, y, 0, w, 16, 18, { c: '#c8915a' }),
  fflat(fr, `${id}-bloom`, along + 2, y + 12, 10, w - 4, 26, { stock: 'sugar', c: LEAF, mask: `<path d="${scallopBlob(w - 4, 40, 9)}" fill="#fff"/>`, print: Array.from({ length: Math.floor(w / 12) }, (_, i) => `<circle cx="${8 + i * 12}" cy="${8 + (i % 2) * 6}" r="4.5" fill="${[CORAL, '#e88ab0', SUN, CREAM][i % 4]}"/>`).join('') })
];
// A blade sign standing out from the wall on a bracket, its face turned to the camera.
export const fblade = (fr: Frame, id: string, along: number, y: number, w: number, h: number, c: string, print: string, mask?: string): Panel[] => [
  ...fbox(fr, `${id}-bracket`, along - 2, y + h, 0, 4, 4, w + 10, { c: '#3d444e', stock: 'greyboard' }),
  toCamera({ id, stock: 'cover', c, w, h, o: fat(fr, along, y, 8), u: fr.n, v: [0, 1, 0], edge: 'cut', density: 2, print, mask })
];
// A wall lantern.
export const flamp = (fr: Frame, id: string, along: number, y: number): Panel[] => [
  ...fbox(fr, `${id}-arm`, along + 4, y + 30, 0, 4, 4, 18, { c: '#3d444e', stock: 'greyboard' }),
  fflat(fr, id, along - 6, y, 18, 20, 32, { stock: 'vellum', c: '#ffe7a8', emit: .6, density: 2, mask: '<path d="M4 0H16L20 6V28L16 32H4L0 28V6Z" fill="#fff"/>', print: '<rect width="20" height="5" fill="#3d444e"/><rect y="27" width="20" height="5" fill="#3d444e"/>' })
];
export { carved };
// A park bench: slatted seat and back on cast legs.
export function bench(id: string, x: number, z: number, w = 160, rot = 0): Panel[] {
  const R = yaw(rot), at = (lx: number, ly: number, lz: number): V3 => add([x, ly, z], R([lx, 0, lz]));
  const slats = (n: number, hh: number) => Array.from({ length: n }, (_, i) => `<rect y="${i * hh / n + 1}" width="${w}" height="${hh / n - 3}" fill="#b5773f"/>`).join('');
  return [
    ...box({ id: `${id}-seat`, x, z, y: 36, w, h: 6, d: 40, rot, stock: 'greyboard', c: '#8a5530', top: `<rect width="${w}" height="40" fill="#8a5530"/>${Array.from({ length: 4 }, (_, i) => `<rect y="${i * 10 + 1}" width="${w}" height="7" fill="#b5773f"/>`).join('')}` }),
    { id: `${id}-back`, stock: 'greyboard', c: '#8a5530', w, h: 40, o: at(-w / 2, 50, -20), u: R([1, 0, 0]), v: unit([0, 1, -.2]), edge: 'fold', density: 1.6, print: slats(3, 40) },
    ...[-1, 1].map((k): Panel => ({ id: `${id}-leg${k}`, stock: 'greyboard', c: '#2b2f36', w: 30, h: 70, o: at(k * (w / 2 - 20) - 15, 0, 18), u: R([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 1.8, mask: '<path d="M2 70V44H0V36H30V44H28V70H22V44H8V70Z M4 36V0H10V36Z" fill="#fff"/>' }))
  ];
}
