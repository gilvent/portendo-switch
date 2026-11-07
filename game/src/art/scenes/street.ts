import { add, backOf, box, hinged, normal, on, slot, yaw, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, FOLIAGE, INK, SUN, cloud, parcel, reseed, scallopTop, specks } from '../recipes.ts';
import { heroPanels } from './_hero.ts';
import { bench, bin, bush, carved, clothesStall, fat, fawning, fbalcony, fblade, fbox, festoon, fflat, fflowers, flagPole, flamp, frame, FROND, farBank, palm, parasolTable, planter, plaza, riverGate, scallopBlob, shadeTree, shopper, ticketKiosk } from './promenade.ts';

const MINT = '#35b58a', PLUM = '#7c6be0', WARM = '#ffe7a8', LEAF = '#57b36f';
const SHOP = { x: 150, z: -80, w: 720, d: 300, ground: 230, upper: 150, peak: 120 };

// Seeded noise for the far layers, so each rebuild cuts the same city.
let far = 1;
const fr = (a: number, b: number) => { far = (far * 16807) % 2147483647; return a + (far / 2147483647) * (b - a); };
// A row of separate blocks printed on one sheet: each its own colour, with windows, and a roof detail on some
// (water tank, antenna, billboard, stepped top). The sheet is cut along the blocks' outline.
function blocks(w: number, h: number, seed: number, lo: number, hi: number, minW: number, maxW: number, cols: string[], lit: string, roofs: boolean) {
  far = seed;
  let x = -fr(0, minW), mask = '', print = '';
  while (x < w) {
    const bw = fr(minW, maxW), bh = fr(lo, hi), top = h - bh, c = cols[Math.floor(fr(0, cols.length))];
    mask += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="#fff"/>`;
    print += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${(bw + 1).toFixed(0)}" height="${bh.toFixed(0)}" fill="${c}"/><rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${bw.toFixed(0)}" height="6" fill="#000" fill-opacity=".12"/>`;
    const step = bw > 90 ? 22 : 18;
    for (let wx = x + 10; wx < x + bw - 14; wx += step) for (let wy = top + 18; wy < h - 16; wy += 26) if (fr(0, 1) > .3) print += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="12" fill="${fr(0, 1) > .8 ? '#fff4e2' : lit}"/>`;
    if (roofs) {
      const kind = Math.floor(fr(0, 5)), cx = x + bw * fr(.25, .7);
      if (kind === 0) { mask += `<rect x="${(cx - 14).toFixed(0)}" y="${(top - 30).toFixed(0)}" width="28" height="22" fill="#fff"/><rect x="${(cx - 12).toFixed(0)}" y="${(top - 10).toFixed(0)}" width="3" height="10" fill="#fff"/><rect x="${(cx + 9).toFixed(0)}" y="${(top - 10).toFixed(0)}" width="3" height="10" fill="#fff"/>`; print += `<rect x="${(cx - 14).toFixed(0)}" y="${(top - 30).toFixed(0)}" width="28" height="22" fill="#9b7a5c"/><path d="M${(cx - 14).toFixed(0)} ${(top - 22).toFixed(0)}h28M${(cx - 14).toFixed(0)} ${(top - 15).toFixed(0)}h28" stroke="#7a5c42" stroke-width="2"/><rect x="${(cx - 12).toFixed(0)}" y="${(top - 10).toFixed(0)}" width="24" height="10" fill="#5c4a3c"/>`; }
      if (kind === 1) { mask += `<rect x="${(cx - 1.5).toFixed(0)}" y="${(top - 54).toFixed(0)}" width="3" height="54" fill="#fff"/><rect x="${(cx - 10).toFixed(0)}" y="${(top - 40).toFixed(0)}" width="20" height="3" fill="#fff"/>`; print += `<rect x="${(cx - 10).toFixed(0)}" y="${(top - 54).toFixed(0)}" width="20" height="54" fill="#5d6670"/><circle cx="${cx.toFixed(0)}" cy="${(top - 54).toFixed(0)}" r="3" fill="${CORAL}"/>`; mask += `<circle cx="${cx.toFixed(0)}" cy="${(top - 54).toFixed(0)}" r="3" fill="#fff"/>`; }
      if (kind === 2 && bw > 70) { const bwid = Math.min(bw - 16, 70); mask += `<rect x="${(cx - bwid / 2).toFixed(0)}" y="${(top - 40).toFixed(0)}" width="${bwid.toFixed(0)}" height="32" fill="#fff"/><rect x="${(cx - bwid / 2 + 6).toFixed(0)}" y="${(top - 8).toFixed(0)}" width="3" height="8" fill="#fff"/><rect x="${(cx + bwid / 2 - 9).toFixed(0)}" y="${(top - 8).toFixed(0)}" width="3" height="8" fill="#fff"/>`; print += `<rect x="${(cx - bwid / 2).toFixed(0)}" y="${(top - 40).toFixed(0)}" width="${bwid.toFixed(0)}" height="32" fill="${CREAM}"/><rect x="${(cx - bwid / 2 + 4).toFixed(0)}" y="${(top - 36).toFixed(0)}" width="${(bwid - 8).toFixed(0)}" height="24" fill="${[CORAL, BLUE, MINT, SUN][Math.floor(fr(0, 4))]}"/><rect x="${(cx - bwid / 2 + 10).toFixed(0)}" y="${(top - 30).toFixed(0)}" width="${(bwid * .4).toFixed(0)}" height="5" fill="${CREAM}"/><rect x="${(cx - bwid / 2).toFixed(0)}" y="${(top - 8).toFixed(0)}" width="${bwid.toFixed(0)}" height="8" fill="#5d6670"/>`; }
      if (kind === 3) { mask += `<rect x="${(x + bw * .2).toFixed(0)}" y="${(top - 24).toFixed(0)}" width="${(bw * .6).toFixed(0)}" height="24" fill="#fff"/>`; print += `<rect x="${(x + bw * .2).toFixed(0)}" y="${(top - 24).toFixed(0)}" width="${(bw * .6).toFixed(0)}" height="24" fill="${c}"/><rect x="${(x + bw * .2).toFixed(0)}" y="${(top - 24).toFixed(0)}" width="${(bw * .6).toFixed(0)}" height="5" fill="#000" fill-opacity=".12"/>`; }
    }
    x += bw;
  }
  return { mask, print };
}
// Gulls over the river.
const birds = (pts: [number, number, number][]) => pts.map(([x, y, k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 6Q6 0 12 6Q18 0 24 6Q18 3 12 9Q6 3 0 6Z" fill="#fdfcf8"/><path transform="translate(${x} ${y}) scale(${k})" d="M0 6Q6 0 12 6Q18 0 24 6" stroke="#5d6670" stroke-width="1.2" fill="none"/>`).join('');
// Open surroundings: sky, clouds and gulls, then the city's offices and malls beyond the far bank, pale to deep.
function backdrop(): Panel[] {
  reseed(11);
  const FAR = .72;
  const card = (id: string, z: number, y: number, w: number, h: number, c: string, mask: string, print = ''): Panel => ({ id, stock: 'sugar', c, w, h, o: [-w / 2 + 120, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: FAR, mask, print });
  const farCity = blocks(4200, 640, 3, 200, 520, 70, 170, ['#a6cfe0', '#b3d6e5', '#9cc6d9'], '#c6e3ee', true);
  const midCity = blocks(3900, 520, 7, 160, 380, 90, 200, ['#7fb2c4', '#8fbccc', '#9cb4d4', '#86a9c9'], '#f6dfa0', true);
  return [
    // Only world heights of about 400 to 780 show above the street (sheet rows 560 to 940), so the sky's detail lives there.
    { id: 'sky', backdrop: true, stock: 'cover', c: '#7cc6ea', w: 5200, h: 1500, o: [-2480, -160, -780], u: [1, 0, 0], v: [0, 1, 0], density: FAR,
      print: `${cloud(700, 640, 1.1, '#d8eef8')}${cloud(2650, 600, 1.2, '#d8eef8')}${cloud(4200, 700, 1, '#d8eef8')}${cloud(1050, 590, 1.6)}${cloud(1900, 660, 1.2)}${cloud(3150, 610, 1.5)}${cloud(2350, 760, .8)}${cloud(4500, 600, 1.1)}${cloud(1500, 780, .7)}${birds([[2180, 640, 1.2], [2215, 622, 1], [2245, 650, .9], [3420, 700, 1], [3450, 686, .8], [1650, 720, .9]])}` },
    ...[card('city-far', -650, 0, 4200, 640, '#a6cfe0', farCity.mask, farCity.print), card('city-mid', -600, 0, 3900, 520, '#7fb2c4', midCity.mask, midCity.print)].map(p => ({ ...p, decal: 'sky' }))
  ];
}
function windowBox(id: string, parent: Panel, x: number, y: number, w: number, h: number, goods: string, cols: number, rows: number, gap = 18): Panel[] {
  const inner: Panel = { id: `${id}-room`, stock: 'cover', c: '#f4cf8c', w: w + 10, h: h + 10, o: add(add(add(parent.o, parent.u, x - 5), parent.v, y - 5), [0, 0, -gap]), u: parent.u, v: parent.v, edge: 'fold', emit: .34, print: goods, density: 1.5, decal: parent.id };
  const bar = 5, pw = (w - bar * (cols - 1)) / cols, ph = (h - bar * (rows - 1)) / rows, panes: [number, number, number, number][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) panes.push([7 + c * (pw + bar), 7 + r * (ph + bar), pw, ph]);
  return [inner, on(parent, 1.2, x - 7, y - 7, w + 14, h + 14, { id: `${id}-frame`, stock: 'cover', c: CREAM, density: 1.5, mask: slot(w + 14, h + 14, ...panes) })];
}
// Upstairs is the store-room: through its windows, plank walls, stacked parcels and the review board.
const upstairs = (i: number) => `<rect width="106" height="72" fill="#a0805f"/><path d="M26 0V72M54 0V72M82 0V72" stroke="#7a5e44" stroke-width="2"/>` + [
  `<rect x="8" y="40" width="34" height="32" fill="${'#b98450'}"/><rect x="22" y="40" width="6" height="32" fill="#d9b781"/><rect x="40" y="50" width="28" height="22" fill="${CORAL}"/><rect x="14" y="20" width="26" height="20" fill="#b98450"/>`,
  `<rect x="14" y="10" width="78" height="44" fill="#c89a62"/><g fill="#fbf7ee"><rect x="20" y="15" width="20" height="16"/><rect x="44" y="15" width="20" height="16"/><rect x="68" y="15" width="20" height="16"/><rect x="20" y="35" width="20" height="16"/><rect x="44" y="35" width="20" height="16"/></g>`,
  `<rect x="60" y="34" width="38" height="38" fill="#b98450"/><rect x="76" y="34" width="6" height="38" fill="#d9b781"/><rect x="12" y="12" width="40" height="30" fill="#e9dcc4"/><g fill="#7fbf6a"><rect x="16" y="16" width="14" height="10"/><rect x="34" y="16" width="14" height="10"/></g>`][i];
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
    ...up.flatMap(([a, b, c, e], i) => windowBox(`win-up${i}`, front, a, b, c, e, upstairs(i), 2, 1, 10))];
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
  // Relief on the front: window boxes under the upstairs windows, lanterns by the door, a blade sign on the corner.
  const F = frame(x - w / 2, z, 0);
  const dress = carved(front, [...up.flatMap(([a], i) => fflowers(F, `shop-flowers${i}`, a - 4, g + 56, 104)), ...flamp(F, 'shop-lamp-l', door.x - 30, 120), ...flamp(F, 'shop-lamp-r', door.x + door.w + 14, 120),
    ...fblade(F, 'shop-blade', w - 24, g + 60, 64, 64, CREAM, `<circle cx="32" cy="32" r="28" fill="${BLUE}"/><path d="M20 24h24l-3 20h-18Z" fill="${CREAM}"/><path d="M26 24q6 -10 12 0" stroke="${CREAM}" stroke-width="3" fill="none"/>`, '<circle cx="32" cy="32" r="32" fill="#fff"/>')]);
  return [front, ...dress, ...walls, ...windows, doorRoom, leaf('door-l', x - door.w / 2, 'left', 0), leaf('door-r', x, 'right', 0), ...roof('shop-roof-l', -1), ...roof('shop-roof-r', 1), awningTop, awningLip, signBoard, roundel];
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
  const arrow: Panel = { id: 'out-arrow', stock: 'cover', c: SUN, w: 150, h: 126, density: 1.6, o: [-715, 0, 60], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', mask: `<path d="M66 126V74H44V74L4 40L44 8V24H146V58H82V126Z" fill="#fff"/>`, print: `<rect x="66" y="66" width="16" height="60" fill="${postFace}"/><text x="92" y="48" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="15" fill="${INK}">BACK</text>` };
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
  // Pigeons pecking on the pavement and two birds on the Blibli roof ridge.
  const bird = (id: string, x: number, z: number, y: number, flip: boolean, rot = 0, c = '#8d96a3'): Panel => card(id, x, z, 30, 22, c, { density: 3, mask: `<g ${flip ? 'transform="translate(30 0) scale(-1 1)"' : ''}><path d="M4 12Q4 4 12 6L16 2Q22 0 24 4L29 6L24 8Q24 16 16 18L18 22H15L13 18Q6 18 4 12Z M0 10L6 9L5 13Z" fill="#fff"/></g>`, print: `<g ${flip ? 'transform="translate(30 0) scale(-1 1)"' : ''}><rect width="30" height="22" fill="${c}"/><circle cx="21" cy="4.6" r="1.4" fill="${INK}"/><rect x="24" y="5" width="6" height="2" fill="${SUN}"/><path d="M9 10Q14 8 18 12" stroke="#6b7480" stroke-width="2" fill="none"/></g>` }, rot, y);
  const birds = [bird('pigeon-a', 60, 120, 0, false, 10), bird('pigeon-b', 104, 132, 0, true, -14, '#a4acb7'), bird('ridge-a', 70, -84, 470, false, 0, '#5b6470'), bird('ridge-b', 300, -84, 448, true, 0, '#5b6470')];
  return [...board, arrow, ...birds, ...pot, ...leaves('plant-a', 0), ...shrub('shrub-d', 600, -130, 180, 92, FOLIAGE, '#2f7d48'), ...shrub('shrub-e', -330, -150, 150, 70, '#57b36f', '#3f9a5b'), ...tree, ...cart,
    ...streetLamp('lamp-a', -600, 176, 250, '#ffe7a8'), ...streetLamp('lamp-b', 720, 176, 230, '#fff4e2'), ...bench, ...aboard, bike, ...bin, ...hydrant, ...people, scooter];
}
/* ---------- the promenade around the shop ---------- */
// Enclosed surroundings: the buildings closing the plaza on the left, right and back right, each a flat facade dressed
// in carved relief (stalls, awnings, balconies, signs, lamps, window boxes). Open surroundings: the river gate.
function surroundings(): Panel[] {
  // Left: a white two-storey waterfront building with a souvenir stall, a boat-tour office and a balcony restaurant.
  const L = frame(-940, 270, 78), LW = 550, LH = 430;
  const lFront: Panel = { id: 'left-front', stock: 'cover', c: '#f4ece0', w: LW, h: LH, o: L.o, u: L.u, v: [0, 1, 0], edge: 'cut', density: .9,
    mask: `<path d="M0 ${LH}V40H${LW * .45}V0H${LW * .7}V40H${LW}V${LH}Z" fill="#fff"/>`,
    print: `<rect width="${LW}" height="${LH}" fill="#f4ece0"/><rect y="${LH - 214}" width="${LW}" height="10" fill="#e2d6c4"/><rect y="${LH - 14}" width="${LW}" height="14" fill="#c9bba6"/>` +
      [40, 190, 340, 490].map(x => `<rect x="${x}" y="${LH - 380}" width="90" height="110" fill="#3f5f7a"/><rect x="${x + 6}" y="${LH - 374}" width="78" height="98" fill="#7fa6c0"/><path d="M${x + 45} ${LH - 374}v98M${x + 6} ${LH - 325}h78" stroke="#f4ece0" stroke-width="4"/>`).join('') +
      `<rect x="30" y="${LH - 196}" width="250" height="182" fill="#ffdf9e"/><rect x="330" y="${LH - 196}" width="120" height="182" fill="#ffdf9e"/><rect x="480" y="${LH - 196}" width="130" height="182" fill="#8fbfd9"/>` +
      `<g fill="#c8915a">${[0, 1, 2, 3, 4].map(i => `<rect x="${44 + i * 46}" y="${LH - 120}" width="30" height="${40 + (i % 2) * 20}"/>`).join('')}</g><path d="M480 ${LH - 110}q30 -20 65 0t65 0" stroke="#4fa9d6" stroke-width="6" fill="none"/>` };
  const lEnd: Panel = { id: 'left-end', stock: 'cover', c: '#e8dfd1', w: 160, h: LH - 40, o: add(L.o, L.n, -160), u: L.n, v: [0, 1, 0], edge: 'fold', density: 1, print: `<rect x="40" y="70" width="70" height="90" fill="#7fa6c0"/><rect y="${LH - 254}" width="160" height="10" fill="#e2d6c4"/>` };
  const lRelief = carved(lFront, [
    ...fawning(L, 'left-awning-a', 24, 214, 270, 74, 40, '#e8752d'), ...fawning(L, 'left-awning-b', 320, 214, 300, 74, 40, DEEP, false),
    ...fbox(L, 'left-counter', 34, 0, 0, 240, 74, 52, { c: '#f4f1ea', front: `<rect y="12" width="240" height="62" fill="#c8915a"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${10 + i * 46} 20v50" stroke="#a8693a" stroke-width="2"/>`).join('')}`, top: '<rect width="240" height="52" fill="#fff"/>' }),
    ...[0, 1, 2, 3, 4, 5].flatMap(i => fbox(L, `left-goods${i}`, 44 + i * 38, 74, 12, 28, 18 + (i % 3) * 8, 26, { c: [CORAL, SUN, MINT, BLUE, '#e88ab0', PLUM][i] })),
    fflat(L, 'left-scarves', 40, 120, 60, 230, 80, { c: CORAL, mask: Array.from({ length: 8 }, (_, i) => `<path d="M${i * 29 + 4} 0h18l-2 ${60 + (i % 3) * 10}h-14Z" fill="#fff"/>`).join(''), print: Array.from({ length: 8 }, (_, i) => `<rect x="${i * 29}" width="29" height="80" fill="${[CORAL, '#2bb5b8', SUN, PLUM, MINT, '#e88ab0', BLUE, '#f4e3c3'][i]}"/>`).join('') + '<rect width="230" height="4" fill="#3d444e"/>' }),
    ...fblade(L, 'left-roundel', 312, 250, 70, 70, '#d8322f', `<circle cx="35" cy="35" r="26" fill="${CREAM}"/><path d="M18 40h34l-6 8h-22Z" fill="${DEEP}"/><path d="M30 28h12v12h-12Z" fill="#d8322f"/>`, '<circle cx="35" cy="35" r="35" fill="#fff"/>'),
    ...fbalcony(L, 'left-balcony', 330, 236, 290, 52), ...fflowers(L, 'left-flowers-a', 40, 236, 90), ...fflowers(L, 'left-flowers-b', 190, 236, 90),
    ...flamp(L, 'left-lamp-a', 300, 150), ...flamp(L, 'left-lamp-b', 630, 150),
    ...fbox(L, 'left-cornice', 0, LH - 34, 0, LW, 14, 20, { c: '#e8dfd1' }), ...fbox(L, 'left-sill', 0, LH - 214, 0, LW, 8, 14, { c: '#e2d6c4' })
  ]);

  // Right: a red café, its terrace spilling out under parasols.
  const R = frame(940, -290, -72), RW = 600, RH = 400;
  const rFront: Panel = { id: 'right-front', stock: 'cover', c: '#d8322f', w: RW, h: RH, o: R.o, u: R.u, v: [0, 1, 0], edge: 'cut', density: .9,
    print: `<rect width="${RW}" height="${RH}" fill="#f6efe4"/><rect y="${RH - 210}" width="${RW}" height="210" fill="#d8322f"/><rect y="${RH - 216}" width="${RW}" height="8" fill="#a82420"/>` +
      [40, 200, 360].map(x => `<rect x="${x}" y="${RH - 190}" width="140" height="150" fill="#ffdf9e"/><path d="M${x} ${RH - 120}h140" stroke="#d8322f" stroke-width="4"/>${[0, 1, 2].map(k => `<circle cx="${x + 30 + k * 40}" cy="${RH - 92}" r="10" fill="#5d4a3c"/><rect x="${x + 22 + k * 40}" y="${RH - 82}" width="16" height="30" fill="${[MINT, SUN, BLUE][k]}"/>`).join('')}`).join('') +
      `<rect x="520" y="${RH - 190}" width="60" height="190" fill="#7a2a20"/>` + [40, 200, 360, 500].map(x => `<rect x="${x}" y="${RH - 360}" width="70" height="96" fill="#5d7f95"/><rect x="${x + 6}" y="${RH - 354}" width="58" height="84" fill="#8fbfd9"/>`).join('') };
  const rRelief = carved(rFront, [
    ...[40, 200, 360].flatMap((x, i) => fawning(R, `right-awning-${i}`, x - 10, 230, 160, 70, 34, '#d8322f')),
    ...fblade(R, 'right-cup', 504, 240, 66, 66, CREAM, `<circle cx="33" cy="33" r="30" fill="${CREAM}"/><rect x="20" y="22" width="22" height="22" rx="4" fill="#d8322f"/><path d="M42 27q8 0 8 6t-8 6" stroke="#d8322f" stroke-width="4" fill="none"/>`, '<circle cx="33" cy="33" r="33" fill="#fff"/>'),
    ...[40, 200, 360, 500].flatMap((x, i) => [fflat(R, `right-shutter-l${i}`, x - 22, 136, 2, 20, 100, { c: '#2f7d5b', print: Array.from({ length: 9 }, (_, k) => `<rect y="${6 + k * 10}" width="20" height="3" fill="#000" fill-opacity=".2"/>`).join('') }), fflat(R, `right-shutter-r${i}`, x + 72, 136, 2, 20, 100, { c: '#2f7d5b', print: Array.from({ length: 9 }, (_, k) => `<rect y="${6 + k * 10}" width="20" height="3" fill="#000" fill-opacity=".2"/>`).join('') }), ...fflowers(R, `right-flowers${i}`, x - 4, 118, 78)]),
    ...fbox(R, 'right-menu', 446, 0, 30, 50, 90, 8, { c: INK, front: `<rect x="5" y="8" width="40" height="60" fill="#3d444e"/>${[0, 1, 2, 3, 4].map(k => `<rect x="10" y="${14 + k * 10}" width="${20 + (k % 2) * 8}" height="3" fill="${CREAM}"/>`).join('')}` }),
    ...[0, 1].flatMap(k => fbox(R, `right-planter${k}`, 20 + k * 470, 0, 4, 60, 44, 40, { c: '#3d4a5a' })), ...[0, 1].map(k => fflat(R, `right-shrub${k}`, 16 + k * 470, 40, 26, 68, 50, { stock: 'sugar', c: FROND, mask: `<path d="${scallopBlob(68, 70, 8)}" fill="#fff"/>` })),
    ...flamp(R, 'right-lamp', 190, 250), ...fbox(R, 'right-cornice', 0, RH - 20, 0, RW, 20, 20, { c: '#efe6d8' })
  ]);

  // Back right: a fashion boutique between the Blibli shop and the café.
  const B = frame(520, -300, 0), BW = 380, BH = 360;
  const bFront: Panel = { id: 'boutique-front', stock: 'cover', c: '#9fc7b4', w: BW, h: BH, o: B.o, u: B.u, v: [0, 1, 0], edge: 'cut', density: .9,
    mask: `<path d="M0 ${BH}V30H${BW * .2}L${BW / 2} 0L${BW * .8} 30H${BW}V${BH}Z" fill="#fff"/>`,
    print: `<rect width="${BW}" height="${BH}" fill="#9fc7b4"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${60 + i * 24}H${BW}" stroke="#7fae99" stroke-width="2"/>`).join('')}<rect x="30" y="${BH - 180}" width="200" height="170" fill="#ffe9c9"/>${[0, 1, 2].map(k => `<path d="M${70 + k * 60} ${BH - 150}h24l6 14l8 100h-52l8 -100Z" fill="${['#e88ab0', SUN, '#2bb5b8'][k]}"/><circle cx="${82 + k * 60}" cy="${BH - 160}" r="9" fill="#f4e3c3"/>`).join('')}<rect x="260" y="${BH - 170}" width="80" height="170" fill="#5d7f95"/>${[0, 1].map(k => `<rect x="${60 + k * 180}" y="80" width="90" height="80" fill="#5d7f95"/><rect x="${66 + k * 180}" y="86" width="78" height="68" fill="#bfe6f8"/>`).join('')}` };
  const bRelief = carved(bFront, [
    ...fawning(B, 'boutique-awning', 20, 200, 220, 60, 30, '#e88ab0'), ...fblade(B, 'boutique-sign', 344, 220, 56, 56, CREAM, `<circle cx="28" cy="28" r="24" fill="#e88ab0"/><path d="M18 20h20l4 6l-4 2v14h-20v-14l-4 -2Z" fill="${CREAM}"/>`, '<circle cx="28" cy="28" r="28" fill="#fff"/>'),
    ...fflowers(B, 'boutique-flowers-a', 56, 210, 100), ...fflowers(B, 'boutique-flowers-b', 236, 210, 100), ...flamp(B, 'boutique-lamp', 250, 120)
  ]);

  // The river gate at the back left, with palms either side and the river beyond.
  const gate = riverGate(-790, -470, -300);
  const palms = [...palm('palm-a', -760, 200, 380, 24, 10), ...planter('palm-a-bed', -760, 200, 96), ...palm('palm-b', -400, -230, 420, -26, 40), ...planter('palm-b-bed', -400, -230, 96),
    ...palm('palm-c', 880, -170, 400, -20, 70), ...planter('palm-c-bed', 880, -170, 96)];
  // String lights from the white building to the café, over the walk.
  const la = fat(L, 140, 360, 4), lb = fat(L, 470, 380, 4), ra = fat(R, 470, 360, 4), rb = fat(R, 150, 380, 4);
  const lights = [festoon('lights-a', la, [ra[0], la[1], ra[2]], 70), festoon('lights-b', lb, [rb[0], lb[1], rb[2]], 60), festoon('lights-c', [430, 400, -60], [fat(R, 330, 400, 4)[0], 400, fat(R, 330, 400, 4)[2]], 40)];
  return [lFront, lEnd, ...lRelief, rFront, ...rRelief, bFront, ...bRelief, ...gate, ...palms, ...lights, farBank(),
    ...ticketKiosk('ticket', -800, -60, 62), ...clothesStall('clothes', 720, -190),
    ...parasolTable('cafe-a', 790, 150, '#d8322f'), ...parasolTable('cafe-b', 930, 20, CREAM),
    ...shadeTree('tree-l', 1080, 260, 330), ...planter('tree-l-bed', 1080, 260, 110),
    ...flagPole('flag-l', -790, 230, 300, '#8e5bd6'), ...flagPole('flag-r', 690, 240, 300, '#e8752d'),
    ...bin('bin-b', 560, 190), ...bush('bush-a', -330, -170, 140, 64),
    // The front edge of the plaza: low planters with bushes, and a bench facing the shops.
    ...planter('front-bed-a', -380, 286, 80, 34), ...bush('front-bush-a', -380, 280, 92, 56, 30),
    ...bench('front-bench', -560, 280, 150, 0),
    // Shoppers in small groups: a woman in a sun hat with a bag, a father and child, a backpacker, a couple at the café.
    ...shopper('shopper-a', -60, 150, { coat: PLUM, legs: '#22324a', skin: '#f3c9a0', hair: '#4a2c1a', carry: BLUE, style: 'dress', hat: '#f4e3c3' }),
    ...shopper('shopper-b', 420, 150, { coat: SUN, legs: '#3d444e', skin: '#c99a7a', hair: '#2b2622', carry: '#2bb5b8' }, true),
    ...shopper('shopper-c', 462, 140, { coat: '#57b36f', legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', style: 'shorts', hat: CORAL }, true, .7, 0, false),
    ...shopper('shopper-d', 860, 110, { coat: '#e88ab0', legs: '#f4f1ea', skin: '#f3c9a0', hair: '#8a5a3a', style: 'dress' }, false, 1, -20, false),
    ...shopper('shopper-e', -180, 40, { coat: '#2bb5b8', legs: '#c8915a', skin: '#a8714f', hair: '#1d1a17', style: 'shorts', pack: CORAL, hat: '#f4f1ea' }, true, .95, 0, false)];
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
  return { id: 'street', density: 2.1, camera: { zoom: 1, x0: -300, x1: 300 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] }, panels: [...backdrop(), ...plaza(), ...surroundings(), ...shop(), ...dressing().filter(p => !/^(trunk|crown|lamp-|hydrant|bin-|walker-|shrub-e)/.test(p.id) && !/^bin$/.test(p.id)), ...panels] };
}
