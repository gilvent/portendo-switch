import type { Stock } from '../kit.ts';
import { CORAL, CREAM, DEEP, INK, SUN, cloud, reseed, specks } from '../recipes.ts';
import { birds, blocks, houses, treeRow } from './street.ts';
import { STATIONS } from './train.ts';

// Open surroundings of the train: flat paper layers that scroll past the car, far ones slowly, the viaduct at full
// speed. Every strip tiles along x. `y` is the strip's bottom edge in world units, `z` its depth, `flat` lays it on
// the ground (its rows then run from the back, at z, toward the camera). `speed` multiplies the train's speed.
// `every`: a small piece (a mast) repeated at that spacing instead of a sheet tiled edge to edge.
export type Strip = { every?: number; id: string; w: number; h: number; stock: Stock; c: string; mask?: string; print: string; density: number; y: number; z: number; speed: number; flat?: boolean; tile?: boolean; x?: number };

const RAIL = -74;
let s = 1;
const r = (a: number, b: number) => { s = (s * 16807) % 2147483647; return a + (s / 2147483647) * (b - a); };
// Repeat a print at x and x - w so a shape that crosses the right edge comes back in at the left.
const wrap = (w: number, f: (x: number) => string) => f(0) + f(-w);
// Several flat layers printed onto one sheet, front over back, each cut by its own outline: the open view keeps its
// stacked paper layers but costs one scrolling strip. `top` is where the layer's top edge sits on the sheet.
type Layer = { print: string; mask?: string; top: number; h: number };
let maskN = 0;
const compose = (w: number, layers: Layer[]) => layers.map(l => {
  const id = `cm${maskN++}`;
  return `<g transform="translate(0 ${l.top})">${l.mask ? `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${l.h}">${l.mask}</mask><g mask="url(#${id})">${l.print}</g>` : l.print}</g>`;
}).join('');

export function strips(): Strip[] {
  reseed(61);
  const W1 = 3200, W2 = 2800, W3 = 2400, WV = 1600;
  // The far view, one opaque sheet: flat sky in three bands, two cloud tones and birds, snow-capped mountains with a
  // line of hills, then the far and the near city rows. Rows run from world y 1200 (top) down to -300.
  const FW = W1, TOP = 1200, FH = 1500, row = (y: number) => TOP - y;
  s = 3;
  const clouds = Array.from({ length: 8 }, (_, i) => cloud(i * FW / 8 + r(0, 160), row(r(820, 1060)), r(.8, 1.4), i % 2 ? '#d8eef8' : '#fffdf6')).join('');
  const flock = birds([[600, row(900), 1], [640, row(884), .8], [1900, row(940), 1.1], [2600, row(870), .9]]);
  const sky = `<rect width="${FW}" height="${FH}" fill="#8fd3f4"/><rect y="${row(560)}" width="${FW}" height="${FH}" fill="#a7dcf5"/><rect y="${row(380)}" width="${FW}" height="${FH}" fill="#bfe6f8"/>${clouds}${flock}`;
  s = 5;
  let d = `M0 380`, snow = '';
  for (let i = 0; i <= 10; i++) { const x = i * FW / 10, top = r(40, 200), lo = r(170, 260); d += `L${x.toFixed(0)} ${top.toFixed(0)}L${(x + FW / 20).toFixed(0)} ${lo.toFixed(0)}`; snow += `<path d="M${x - 40} ${top + 46}L${x} ${top}L${x + 40} ${top + 46}L${x + 16} ${top + 34}L${x} ${top + 50}L${x - 16} ${top + 34}Z" fill="#f4f1fb"/>`; }
  const hills = Array.from({ length: 16 }, (_, i) => `<ellipse cx="${i * FW / 16 + 100}" cy="400" rx="${r(150, 260)}" ry="${r(90, 150)}" fill="#fff"/>`).join('');
  const mtn: Layer = { top: row(120 + 380), h: 380, mask: `<path d="${d}L${FW} 380Z" fill="#fff"/>${hills}`, print: `<rect width="${FW}" height="380" fill="#c9c3e6"/>${snow}${hills.replace(/fill="#fff"/g, 'fill="#b9dfe3"')}${Array.from({ length: 90 }, () => `<circle cx="${r(0, FW).toFixed(0)}" cy="${r(320, 375).toFixed(0)}" r="${r(5, 10).toFixed(0)}" fill="#8fc4b8"/>`).join('')}` };
  const farCity = blocks(FW, 520, 3, 200, 460, 70, 170, ['#a6cfe0', '#b3d6e5', '#9cc6d9'], '#c6e3ee', false);
  const tower = `<rect x="1300" y="40" width="10" height="480" FILL/><rect x="1278" y="150" width="54" height="36" rx="16" FILL/><rect x="1303" y="0" width="4" height="40" FILL/>`;
  const cityFar: Layer = { top: row(-40 + 520), h: 520, mask: farCity.mask + tower.replaceAll('FILL', 'fill="#fff"'), print: `<rect width="${FW}" height="520" fill="#a6cfe0"/>${farCity.print}${tower.replaceAll('FILL', 'fill="#94c0d4"')}<rect x="1282" y="162" width="46" height="6" fill="#c6e3ee"/>` };
  const midA = blocks(FW, 460, 7, 180, 420, 90, 200, ['#6fa6bf', '#5d93ad', '#7fb2c4', '#86a9c9'], '#f6dfa0', true);
  const cityMid: Layer = { top: row(-80 + 460), h: 460, mask: midA.mask, print: `<rect width="${FW}" height="460" fill="#6fa6bf"/>${midA.print}` };
  const far: Strip = { id: 'far', w: FW, h: FH, stock: 'sugar', c: '#8fd3f4', density: .55, y: -300, z: -1500, speed: .07, print: sky + compose(FW, [mtn, cityFar, cityMid]) };
  // The town right beside the line, one cut sheet: warm blocks, a row of trees, low gabled houses.
  const TW = W3, TT = 260, trow = (y: number) => TT - y;
  const midB = blocks(TW, 380, 19, 150, 320, 80, 160, ['#e3b98f', '#d9a27a', '#efcf9e', '#c9b8d8'], '#fff4e2', true);
  const trees = treeRow(TW, 300, 23), homes = houses(TW, 280, 29);
  const townL: Layer = { top: trow(-150 + 380), h: 380, mask: midB.mask, print: `<rect width="${TW}" height="380" fill="#e3b98f"/>${midB.print}` };
  const treeL: Layer = { top: trow(-120 + 300), h: 300, mask: trees.mask, print: `<rect width="${TW}" height="300" fill="#4f9c82"/>${trees.print}` };
  const homeL: Layer = { top: trow(-190 + 280), h: 280, mask: homes.mask, print: `<rect width="${TW}" height="280" fill="#e7b48a"/>${homes.print}` };
  const unionMask = [townL, treeL, homeL].map(l => `<g transform="translate(0 ${l.top})">${l.mask}</g>`).join('');
  const town: Strip = { id: 'town', w: TW, h: 480, stock: 'sugar', c: '#e3b98f', density: .8, y: -220, z: -800, speed: .3, mask: unionMask, print: compose(TW, [townL, treeL, homeL]) };

  // The viaduct: far parapet with catenary portal masts, the double track bed, and the near parapet and beam.
  const mastAt = [200, 1000];
  const mast = (x: number) => `<rect x="${x}" y="40" width="14" height="430" FILL/><rect x="${x - 6}" y="452" width="26" height="18" FILL/><rect x="${x - 10}" y="70" width="34" height="10" FILL/><rect x="${x - 8}" y="110" width="30" height="8" FILL/>`;
  const parapetH = 40, PH = 470;
  const farParapet: Strip = { id: 'parapet-far', w: WV, h: parapetH, stock: 'greyboard', c: '#c9c3b8', density: 1.1, y: RAIL, z: -330, speed: 1,
    print: `<rect width="${WV}" height="${parapetH}" fill="#c9c3b8"/><rect width="${WV}" height="6" fill="#e2ddd3"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 100} 0V${parapetH}" stroke="#a9a397" stroke-width="2"/>`).join('')}` };
  // Catenary masts on the far parapet, one every 800: a steel post on a footing with two short cantilever arms.
  const MW = 44, MH = PH - parapetH + 18;
  const mastPiece: Strip = { id: 'mast', every: 800, w: MW, h: MH, stock: 'greyboard', c: '#5d6670', density: 2, y: RAIL + parapetH - 18, z: -332, speed: 1,
    mask: mast(15).replaceAll('FILL', 'fill="#fff"').replace(/y="452"/, `y="${MH - 18}"`).replace(/height="430"/, `height="${MH - 58}"`),
    print: `<rect width="${MW}" height="${MH}" fill="#5d6670"/><rect x="15" y="40" width="4" height="${MH - 58}" fill="#7b848e"/>` };
  // The overhead line right above the car: catenary messenger, droppers, and the contact wire the pantograph rides.
  const wire: Strip = { id: 'wire', w: WV, h: 40, stock: 'greyboard', c: '#2b3037', density: 1.4, y: 418, z: -96, speed: 1,
    mask: `<path d="M0 4Q${WV / 4} 16 ${WV / 2} 4T${WV} 4" stroke="#fff" stroke-width="3" fill="none"/><rect y="36" width="${WV}" height="3" fill="#fff"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100 + 48}" y="${6 + 10 * Math.sin(Math.PI * ((i * 100 + 48) % (WV / 2)) / (WV / 2))}" width="2" height="${30 - 10 * Math.sin(Math.PI * ((i * 100 + 48) % (WV / 2)) / (WV / 2))}" fill="#fff"/>`).join('')}`,
    print: `<rect width="${WV}" height="40" fill="#2b3037"/>` };
  // Track bed seen from above: ballast, sleepers and two rails per track. Rows run from the far parapet (top) forward.
  // Stops short of the near beam and the far parapet: sheets that touch edge to edge confuse the browser's 3D sort.
  const DEPTH = 650, tracks = [180, 480];
  const deck: Strip = { id: 'deck', w: WV, h: DEPTH, stock: 'greyboard', c: '#9b968c', density: .9, y: RAIL, z: -325, speed: 1, flat: true,
    print: `<rect width="${WV}" height="${DEPTH}" fill="#9b968c"/>${specks(WV, DEPTH, '#77726a', 900, 3)}${specks(WV, DEPTH, '#bdb7ab', 500, 2.4)}`
      + tracks.map(t => `<rect y="${t - 70}" width="${WV}" height="140" fill="#857f74"/>${Array.from({ length: WV / 40 }, (_, i) => `<rect x="${i * 40 + 8}" y="${t - 56}" width="22" height="112" fill="#6d5a48"/>`).join('')}<rect y="${t - 40}" width="${WV}" height="6" fill="#c9ced3"/><rect y="${t + 34}" width="${WV}" height="6" fill="#c9ced3"/><rect y="${t - 34}" width="${WV}" height="2" fill="#5b636d"/><rect y="${t + 40}" width="${WV}" height="2" fill="#5b636d"/>`).join('')
      + `<rect y="${DEPTH / 2 - 16}" width="${WV}" height="32" fill="#8a857b"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200 + 20}" y="${DEPTH / 2 - 10}" width="120" height="20" fill="#b9b4a9"/>`).join('')}` };
  // The near side of the viaduct, one opaque sheet: parapet, the beam with its coral band, then the view down between
  // the piers to the street far below, with trees and traffic.
  s = 9;
  const BH = 720, GROUND = 330;
  const car = (x: number, c: string) => `<rect x="${x}" y="${GROUND + 136}" width="64" height="22" rx="7" fill="${c}"/><rect x="${x + 12}" y="${GROUND + 122}" width="38" height="18" rx="6" fill="${c}"/><rect x="${x + 16}" y="${GROUND + 125}" width="30" height="10" rx="3" fill="#bfe6f8"/><circle cx="${x + 14}" cy="${GROUND + 158}" r="7" fill="${INK}"/><circle cx="${x + 50}" cy="${GROUND + 158}" r="7" fill="${INK}"/>`;
  const downBelow = `<rect y="110" width="${WV}" height="${BH - 110}" fill="#a7dcf5"/><rect y="${GROUND - 60}" width="${WV}" height="${BH}" fill="#7fbf6a"/>`
    + Array.from({ length: 10 }, (_, i) => `<circle cx="${i * 160 + r(0, 60)}" cy="${GROUND + r(-10, 40)}" r="${r(40, 66)}" fill="${i % 2 ? '#3f9a5b' : '#57b36f'}"/>`).join('')
    + `<rect y="${GROUND + 100}" width="${WV}" height="10" fill="#cdbfa6"/><rect y="${GROUND + 110}" width="${WV}" height="110" fill="#6b6f76"/><path d="M0 ${GROUND + 165}H${WV}" stroke="${CREAM}" stroke-width="4" stroke-dasharray="40 30"/><rect y="${GROUND + 220}" width="${WV}" height="10" fill="#cdbfa6"/><rect y="${GROUND + 230}" width="${WV}" height="${BH}" fill="#e9dcc4"/>`
    + [[120, CORAL], [700, SUN], [1240, '#3f5f7a']].map(([x, c]) => car(x as number, c as string)).join('');
  const beam: Strip = { id: 'beam', w: WV, h: BH, stock: 'greyboard', c: '#d4cec3', density: .8, y: RAIL - BH + parapetH, z: 330, speed: 1,
    print: downBelow + `<rect width="${WV}" height="110" fill="#d4cec3"/><rect width="${WV}" height="${parapetH}" fill="#e2ddd3"/><rect y="${parapetH}" width="${WV}" height="4" fill="#a9a397"/><rect y="${parapetH + 4}" width="${WV}" height="66" fill="#c4bdb0"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 100} 0V${parapetH}" stroke="#a9a397" stroke-width="2"/>`).join('')}<rect y="${parapetH + 20}" width="${WV}" height="8" fill="${CORAL}" fill-opacity=".8"/>`
      + wrap(WV, x => [300, 1100].map(p => `<rect x="${p + x}" y="110" width="120" height="${BH - 110}" fill="#bdb6a9"/><rect x="${p + x + 92}" y="110" width="28" height="${BH - 110}" fill="#a49d90"/>`).join('')) };
  return [far, town, farParapet, mastPiece, deck, beam, wire];
}

// The station the train pulls into: platform deck at floor level, the platform's back wall with pillars, benches,
// people waiting, signs and an exit, and the canopy over it. It does not tile; it slides in and stops.
export function station(): Strip[] {
  reseed(71);
  const W = 2600, H = 520, FLOOR_Y = H - 70;
  const pillar = (x: number) => `<rect x="${x}" y="40" width="44" height="${FLOOR_Y - 40}" fill="#e9e4d8"/><rect x="${x + 30}" y="40" width="14" height="${FLOOR_Y - 40}" fill="#cfc8b9"/><rect x="${x - 6}" y="${FLOOR_Y - 16}" width="56" height="16" fill="#bdb6a9"/>`;
  const bench = (x: number) => `<rect x="${x}" y="${FLOOR_Y - 46}" width="120" height="12" rx="3" fill="${DEEP}"/><rect x="${x}" y="${FLOOR_Y - 78}" width="120" height="26" rx="3" fill="#1f86c4"/><rect x="${x + 8}" y="${FLOOR_Y - 34}" width="8" height="34" fill="#5d6670"/><rect x="${x + 104}" y="${FLOOR_Y - 34}" width="8" height="34" fill="#5d6670"/>`;
  const person = (x: number, top: string, legs: string, skin: string, hair: string, tall = 150) => `<circle cx="${x}" cy="${FLOOR_Y - tall + 12}" r="12" fill="${skin}"/><path d="M${x - 12} ${FLOOR_Y - tall + 10}Q${x - 12} ${FLOOR_Y - tall - 1} ${x} ${FLOOR_Y - tall - 1}Q${x + 12} ${FLOOR_Y - tall - 1} ${x + 12} ${FLOOR_Y - tall + 10}Z" fill="${hair}"/><rect x="${x - 18}" y="${FLOOR_Y - tall + 26}" width="36" height="${tall * .44}" rx="8" fill="${top}"/><rect x="${x - 14}" y="${FLOOR_Y - tall + 26 + tall * .42}" width="12" height="${tall * .5 - 8}" fill="${legs}"/><rect x="${x + 2}" y="${FLOOR_Y - tall + 26 + tall * .42}" width="12" height="${tall * .5 - 8}" fill="${legs}"/>`;
  const exit = (x: number) => `<rect x="${x}" y="150" width="150" height="46" rx="6" fill="${SUN}"/><text x="${x + 58}" y="181" font-family="Fredoka" font-weight="600" font-size="22" fill="${INK}">Exit</text><path d="M${x + 16} 160h22v26h-22z" fill="none" stroke="${INK}" stroke-width="3"/><path d="M${x + 112} 173h22M${x + 126} 165l8 8 -8 8" stroke="${INK}" stroke-width="3.4" fill="none"/>`;
  const stairs = (x: number) => `<rect x="${x}" y="230" width="220" height="${FLOOR_Y - 230}" fill="#6f7882"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${x + 10}" y="${240 + i * 24}" width="200" height="14" fill="#9aa3ad"/>`).join('')}<rect x="${x - 8}" y="220" width="236" height="12" fill="#5d6670"/>`;
  const map = (x: number) => `<rect x="${x}" y="220" width="200" height="120" rx="4" fill="#fbf7ee"/><rect x="${x}" y="220" width="200" height="18" fill="${DEEP}"/><path d="M${x + 20} 290H${x + 180}" stroke="${CORAL}" stroke-width="6" stroke-linecap="round"/>${[0, 1, 2, 3].map(k => `<circle cx="${x + 30 + k * 46}" cy="290" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join('')}`;
  const ad = (x: number, c: string) => `<rect x="${x}" y="210" width="150" height="150" rx="4" fill="${c}"/><rect x="${x + 16}" y="230" width="60" height="10" rx="5" fill="${CREAM}"/><circle cx="${x + 100}" cy="300" r="34" fill="${CREAM}" fill-opacity=".85"/>`;
  const wall = `<rect width="${W}" height="${H}" fill="#f2ede3"/><rect y="0" width="${W}" height="40" fill="#5d6670"/><rect y="40" width="${W}" height="10" fill="${CORAL}"/>`
    + `<rect y="${FLOOR_Y - 60}" width="${W}" height="60" fill="#d9d2c4"/>${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 100} 50V${FLOOR_Y}" stroke="#e2dccf" stroke-width="2"/>`).join('')}`
    + stairs(1560) + exit(1540) + map(700) + ad(1000, '#35b58a') + ad(2050, '#7c6be0') + bench(260) + bench(1250) + bench(2300)
    + [140, 620, 1180, 1480, 1880, 2460].map(pillar).join('')
    + person(330, CORAL, '#3f5f7a', '#f3c9a0', '#1d2228', 120) + person(390, '#3f5f7a', '#2e3440', '#d9a77e', '#4a2c1a', 120) + person(920, SUN, '#3f5f7a', '#b07a52', '#1d2228') + person(1360, '#e9ebee', '#2e3440', '#f6d5b8', '#1d2228', 120) + person(2200, '#35b58a', '#2e3440', '#f3c9a0', '#8a8f98', 140)
    + `<rect x="${W - 140}" y="${FLOOR_Y - 90}" width="40" height="90" rx="5" fill="#2f7d5b"/><rect x="${W - 134}" y="${FLOOR_Y - 80}" width="28" height="8" fill="${CREAM}"/>`;
  const platform = `<rect width="${W}" height="140" fill="#cfc8b9"/>${specks(W, 140, '#a9a397', 260, 3)}<rect y="112" width="${W}" height="28" fill="#e2ddd3"/><rect y="104" width="${W}" height="12" fill="${SUN}"/>${Array.from({ length: W / 14 }, (_, i) => `<circle cx="${i * 14 + 7}" cy="110" r="2.4" fill="#d9952a"/>`).join('')}${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 100} 0V104" stroke="#bdb6a9" stroke-width="2"/>`).join('')}`;
  const canopy = `<rect width="${W}" height="34" fill="#c9d0d6"/><rect y="26" width="${W}" height="8" fill="#8a939c"/>${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 200 + 60}" y="28" width="80" height="6" fill="#fffbea"/>`).join('')}`;
  const boards = STATIONS.map((st, k): Strip => ({ id: `board-${k}`, w: 300, h: 70, stock: 'cover', c: DEEP, density: 2, y: 0, z: -288, speed: 1, tile: false,
    print: `<rect width="300" height="70" rx="8" fill="${DEEP}"/><rect x="6" y="6" width="288" height="58" rx="5" fill="none" stroke="${CREAM}" stroke-width="2"/><rect x="18" y="20" width="30" height="30" rx="6" fill="${st.c}"/><rect x="18" y="20" width="30" height="30" rx="6" fill="none" stroke="${CREAM}" stroke-width="2"/><text x="166" y="46" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="28" fill="#fff">${st.name}</text>` }));
  return [
    { id: 'st-wall', w: W, h: H, stock: 'cover', c: '#f2ede3', density: .8, y: -70, z: -300, speed: 1, tile: false, print: wall },
    { id: 'st-platform', w: W, h: 140, stock: 'greyboard', c: '#cfc8b9', density: .8, y: 0, z: -300, speed: 1, flat: true, tile: false, print: platform },
    { id: 'st-canopy', w: W, h: 34, stock: 'cover', c: '#c9d0d6', density: .8, y: 440, z: -200, speed: 1, tile: false, print: canopy },
    ...boards
  ];
}
