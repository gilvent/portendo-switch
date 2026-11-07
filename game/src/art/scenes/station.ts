import { add, box, carved, on, type Lamp, type Panel, type V3 } from '../kit.ts';
import { CORAL, CREAM, DEEP, INK, KRAFT, SUN, specks } from '../recipes.ts';
import { SKIN, seated, standing, type Look } from './people.ts';
import { CAR, DOORS, DOOR_W, STATIONS } from './train.ts';

// The underground station the MRT car stands in. The car is a cutaway with its near side off; the station is built
// around it in three bands of distance, each in the technique its distance calls for:
//  - near, enclosing the car: the platform screen doors right behind it, the island's escalator core (a wall carrying
//    carved relief), the overhead conductor rail, the trackbed under the wheels;
//  - the island platform: freestanding folds and cut figures (vending machines, a glass lift, the escalator, columns,
//    benches, people waiting at the doors);
//  - far, open: the far track, the far platform and its wall, and the concourse gallery above it, as flat layers.
// Everything is seen over the car's roof, through its windows and doors, and through the neighbouring cars.
export const ST = {
  RAIL: -74, PSD: -174, EDGE: -165, ISLAND_BACK: -650, FAR_EDGE: -960, FAR_WALL: -1210, GALLERY: -1170, CONCOURSE: -1290,
  SPAN: 3400, TOP: 960, ESC_Z: -372, ESC_D: 100, ESC_X: -420, ESC_K: Math.tan(Math.PI / 6), COL_Z: -560
};
const { RAIL, PSD, EDGE, ISLAND_BACK, FAR_EDGE, FAR_WALL, SPAN, TOP } = ST;
const X0 = -SPAN / 2;
// Station palette: cream tiles and granite, steel and stainless; accents are the line's teal and safety yellow.
const TILE = '#eee8dc', JOINT = '#d8d0c0', GRANITE = '#d3ccbf', STEEL = '#5d6670', STAINLESS = '#c9d0d6', TEAL = '#2a8d6a', TEAL_DEEP = '#1f6b52', GLASS = '#dff1f8';
const L = (skin: number, hair: string, top: string, legs: string, hairStyle?: Look['hairStyle'], capC?: string): Look => ({ skin: SKIN[skin], hair, top, legs, hairStyle, capC });
const tiles = (w: number, h: number, step = 40, c = JOINT) => `<g stroke="${c}" stroke-width="1.4">${Array.from({ length: Math.ceil(w / step) }, (_, i) => `<path d="M${i * step} 0V${h}"/>`).join('')}${Array.from({ length: Math.ceil(h / step) }, (_, i) => `<path d="M0 ${i * step}H${w}"/>`).join('')}</g>`;

/* ---------- under the car: the trackbed and the near rail, seen in section below the wheels ---------- */
function trackbed(): Panel[] {
  const D = 160;
  // Ballast and sleeper ends in front of the car, the drain channel, then the cut edge of the slab.
  const bed: Panel = { id: 'trackbed', stock: 'greyboard', c: '#8f8a80', w: SPAN, h: D, o: [X0, RAIL - 10, 152 + D], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .9, split: 3,
    print: `<rect width="${SPAN}" height="${D}" fill="#8f8a80"/>${specks(SPAN, D, '#6f6a62', 700, 3)}${specks(SPAN, D, '#b5afa3', 400, 2.4)}`
      + `<g fill="#6d5a48">${Array.from({ length: SPAN / 56 }, (_, i) => `<rect x="${i * 56 + 10}" y="0" width="30" height="34"/>`).join('')}</g>`
      + `<rect y="64" width="${SPAN}" height="22" fill="#5f5a52"/><rect y="70" width="${SPAN}" height="10" fill="#3f3b36"/><rect y="86" width="${SPAN}" height="${D - 86}" fill="#a7a195"/><rect y="${D - 6}" width="${SPAN}" height="6" fill="#c4bdb0"/>` };
  const rail: Panel = { id: 'rail-near', stock: 'greyboard', c: '#8e959c', w: SPAN, h: 10, o: [X0, RAIL - 10, 154], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2, split: 3,
    print: `<rect width="${SPAN}" height="10" fill="#6c737a"/><rect width="${SPAN}" height="3" fill="#d6dbe0"/>` };
  return [bed, rail];
}

/* ---------- the overhead conductor rail the pantograph presses on, hung from the vault by droppers ---------- */
function conductor(): Panel {
  const y0 = CAR.ROOF + 56, h = TOP - y0;
  const drops = Array.from({ length: 9 }, (_, i) => i * 420 + 90);
  return { id: 'conductor', stock: 'greyboard', c: '#3a4049', w: SPAN, h, o: [X0, y0, -96], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1, split: 3,
    mask: `<rect y="${h - 14}" width="${SPAN}" height="14" fill="#fff"/>${drops.map(x => `<rect x="${x}" y="0" width="7" height="${h - 14}" fill="#fff"/><rect x="${x - 26}" y="${h - 34}" width="60" height="8" fill="#fff"/><rect x="${x - 4}" y="${h - 60}" width="15" height="26" rx="4" fill="#fff"/>`).join('')}`,
    print: `<rect width="${SPAN}" height="${h}" fill="#3a4049"/><rect y="${h - 14}" width="${SPAN}" height="4" fill="#8e959c"/>${drops.map(x => `<rect x="${x - 4}" y="${h - 60}" width="15" height="26" rx="4" fill="#b0552e"/>`).join('')}` };
}

/* ---------- platform screen doors right behind the car: glass panes in a steel frame, a header, sliding leaves ---------- */
function screenDoors(id: string, z: number, openings: readonly number[], withLeaves: boolean): Panel[] {
  // Print coordinates run from the top: header 0..HEAD_H, glass down to the sill, sill at the bottom.
  const H = 300, HEAD_H = 64, SILL = 12, OW = DOOR_W + 16, GT = HEAD_H, GB = H - SILL;
  const ox = (x: number) => x - X0;
  const inOpening = (x: number) => openings.some(o => Math.abs(x - o) < OW / 2 + 14);
  const posts = Array.from({ length: Math.ceil(SPAN / 170) }, (_, i) => X0 + 40 + i * 170).filter(x => !inOpening(x));
  // Glass runs between the openings; each opening is edged by two stainless jambs.
  const cuts = [...openings].sort((p, q) => p - q).flatMap(o => [ox(o) - OW / 2, ox(o) + OW / 2]);
  const spans: [number, number][] = []; let from = 0;
  for (let i = 0; i < cuts.length; i += 2) { spans.push([from, cuts[i]]); from = cuts[i + 1]; }
  spans.push([from, SPAN]);
  const jambs = openings.flatMap(o => [ox(o) - OW / 2 - 12, ox(o) + OW / 2]);
  const solid = (fill: string, post: string) => `<rect width="${SPAN}" height="${HEAD_H}" fill="${fill}"/><rect y="${GB}" width="${SPAN}" height="${SILL}" fill="${fill}"/>${posts.map(x => `<rect x="${ox(x) - 7}" y="${GT}" width="14" height="${GB - GT}" fill="${post}"/>`).join('')}${jambs.map(x => `<rect x="${x}" y="${GT}" width="12" height="${GB - GT}" fill="${post}"/>`).join('')}`;
  const mask = spans.map(([a, b]) => `<rect x="${a}" y="${GT}" width="${b - a}" height="${GB - GT}" fill="#fff" fill-opacity=".14"/>`).join('') + solid('#fff', '#fff');
  const stickers = posts.filter((_, i) => i % 2).map(x => `<g transform="translate(${ox(x) + 44} ${GB - 150})"><circle r="11" fill="${SUN}"/><path d="M-5 -4L5 6M5 -4L-5 6" stroke="${INK}" stroke-width="2.4"/></g>`).join('');
  const sheet: Panel = { id, stock: 'cover', c: STEEL, w: SPAN, h: H, o: [X0, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.1, split: withLeaves ? 4 : 2, mask,
    print: `<rect width="${SPAN}" height="${H}" fill="${GLASS}"/>${solid(STEEL, STAINLESS)}<rect y="${HEAD_H - 24}" width="${SPAN}" height="8" fill="${TEAL}"/><rect y="${GB}" width="${SPAN}" height="${SILL}" fill="#8e959c"/>${stickers}` };
  if (!withLeaves) return [sheet];
  // Two glass leaves per opening; they slide apart with the car's doors.
  const LH = GB - GT;
  const leaves = openings.flatMap((o, i) => ([-1, 1] as const).map((s): Panel => {
    const lw = OW / 2;
    return { id: `${id}-leaf-${i}-${s < 0 ? 'l' : 'r'}`, stock: 'vellum', c: GLASS, w: lw, h: LH, o: [s < 0 ? o - lw : o, SILL, z - 3], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.6,
      mask: `<path fill-rule="evenodd" d="M0 0H${lw}V${LH}H0Z M8 8H${lw - 8}V${LH - 8}H8Z" fill="#fff"/><rect x="8" y="8" width="${lw - 16}" height="${LH - 16}" fill="#fff" fill-opacity=".16"/>`,
      print: `<rect width="${lw}" height="${LH}" fill="${STAINLESS}"/><rect x="8" y="8" width="${lw - 16}" height="${LH - 16}" fill="${GLASS}"/><rect x="${s < 0 ? lw - 4 : 0}" width="4" height="${LH}" fill="${INK}"/><rect x="8" y="${LH - 100}" width="${lw - 16}" height="8" fill="${SUN}"/>`,
      motion: { toy: 'doors', at: [1], slide: [s * (lw - 8), 0, 0] } };
  }));
  return [sheet, ...leaves];
}

/* ---------- the island platform ---------- */
function island(): Panel[] {
  const D = EDGE - ISLAND_BACK;
  // Granite floor: tactile strip and safety line along both edges, the escalator's landing plate, wear paths.
  const ex = ST.ESC_X - X0;
  const floor: Panel = { id: 'island-floor', stock: 'greyboard', c: GRANITE, w: SPAN, h: D, o: [X0, 0, EDGE], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .8, split: 4,
    print: `<rect width="${SPAN}" height="${D}" fill="${GRANITE}"/>${tiles(SPAN, D, 60, '#c4bcae')}${specks(SPAN, D, '#a9a194', 900, 2.2)}`
      + [D - 40, 12].map(y => `<rect y="${y}" width="${SPAN}" height="28" fill="${SUN}"/>${Array.from({ length: SPAN / 12 }, (_, i) => `<circle cx="${i * 12 + 6}" cy="${y + 14}" r="2.6" fill="#d9952a"/>`).join('')}`).join('')
      + `<rect y="${D - 54}" width="${SPAN}" height="5" fill="#fff" fill-opacity=".7"/><rect x="${ex - 70}" y="${D - (ST.ESC_Z + ST.ESC_D - EDGE) - 0}" width="70" height="${ST.ESC_D}" fill="#9aa3ad"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${ex - 66 + i * 5}" y="${D - (ST.ESC_Z + ST.ESC_D - EDGE)}" width="2" height="${ST.ESC_D}" fill="#6f7882"/>`).join('')}` };
  return [floor];
}

// Square columns clad in teal enamel over a stainless kick band; each carries small relief: a clock, a camera, a plate.
function columns(): Panel[] {
  const W = 58, H = TOP + 40;
  const print = (w: number) => `<rect width="${w}" height="${H}" fill="${TEAL}"/>${Array.from({ length: 7 }, (_, i) => `<rect y="${H - 120 - i * 150}" width="${w}" height="2.4" fill="${TEAL_DEEP}"/>`).join('')}<rect y="${H - 110}" width="${w}" height="110" fill="${STAINLESS}"/><rect y="${H - 112}" width="${w}" height="4" fill="${STEEL}"/>`;
  return [-1260, -300, 660].flatMap((x, i) => {
    const faces = box({ id: `col-${i}`, x, z: ST.COL_Z, w: W, h: H, d: W, stock: 'cover', c: TEAL, front: print(W), right: print(W), left: print(W) }).filter(p => /front|left|right/.test(p.id));
    const front = faces[0];
    const bits = carved(front, [
      ...box({ id: `col-${i}-plate`, x, z: ST.COL_Z + W / 2 + 4, y: 230, w: 44, h: 60, d: 8, stock: 'cover', c: '#fbf7ee', front: `<rect width="44" height="60" fill="#fbf7ee"/><rect width="44" height="12" fill="${TEAL_DEEP}"/><text x="22" y="40" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="20" fill="${INK}">${'ABC'[i]}</text>` }),
      ...(i === 1 ? box({ id: `col-${i}-clock`, x, z: ST.COL_Z + W / 2 + 10, y: 520, w: 50, h: 50, d: 20, stock: 'cover', c: '#fbf7ee', front: `<circle cx="25" cy="25" r="23" fill="${INK}"/><circle cx="25" cy="25" r="19" fill="#fbf7ee"/><path d="M25 25V11M25 25L34 30" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` }) : []),
      ...box({ id: `col-${i}-cam`, x: x + 10, z: ST.COL_Z + W / 2 + 8, y: 700, w: 26, h: 18, d: 16, stock: 'cover', c: '#f4f6f8', front: `<circle cx="13" cy="9" r="6" fill="${INK}"/>` })
    ]);
    return [...faces, ...bits];
  });
}

// The escalator up to the concourse, rising to the right, and the wall that closes the triangle under it: the
// island's one big enclosed surface, carrying carved relief (fire cabinet, staff door, AED, map, lightboxes).
function escalator(): Panel[] {
  const { ESC_X: xs, ESC_K: k, ESC_Z: z, ESC_D: d } = ST;
  const x0 = xs - 70, run = (TOP + 60) / k, x1 = xs + run, w = x1 - x0, H = TOP + 60, LAND = 14;
  const yAt = (x: number) => Math.max(0, (x - xs) * k) + LAND;
  // Print coordinates: x from x0, y from the top of the sheet (world y = H - py).
  const py = (y: number) => H - y;
  const coreMask = `<path d="M0 ${H}V${py(LAND)}H${xs - x0}L${w} 0V${H}Z" fill="#fff"/>`;
  const core: Panel = { id: 'esc-core', stock: 'cover', c: '#e6e0d3', w, h: H, o: [x0, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .9, split: 2, mask: coreMask,
    print: `<rect width="${w}" height="${H}" fill="#e6e0d3"/>${tiles(w, H, 90, '#d2cbbd')}<path d="M0 ${py(LAND)}H${xs - x0}L${w} 0V40L${xs - x0} ${py(LAND) + 40}H0Z" fill="${STAINLESS}"/><path d="M0 ${py(LAND) + 40}H${xs - x0}L${w} 40V52L${xs - x0} ${py(LAND) + 52}H0Z" fill="${TEAL}"/><rect y="${H - 26}" width="${w}" height="26" fill="#b9b2a4"/>` };
  // Glass balustrade on top of the truss, with the black handrail; one near, one far (seen through the near one).
  const balustrade = (id: string, zz: number, near: boolean): Panel => {
    const g = 96, top = (x: number) => py(yAt(x) + g);
    const m = `<path d="M0 ${py(LAND)}H${xs - x0}L${w} ${py(yAt(x1))}V${top(x1)}L${xs - x0} ${top(xs)}H0Z" fill="#fff" fill-opacity="${near ? .3 : .22}"/><path d="M0 ${top(xs)}H${xs - x0}L${w} ${top(x1)}V${top(x1) - 9}L${xs - x0} ${top(xs) - 9}H-6Q-12 ${top(xs) - 4} -6 ${top(xs)}Z" fill="#fff"/>`;
    return { id, stock: 'vellum', c: GLASS, w, h: H, o: [x0, 0, zz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .9, split: near ? 2 : 1, mask: m,
      print: `<rect width="${w}" height="${H}" fill="${GLASS}"/><path d="M0 ${top(xs)}H${xs - x0}L${w} ${top(x1)}V${top(x1) - 9}L${xs - x0} ${top(xs) - 9}H0Z" fill="${INK}"/>` };
  };
  // The steps, seen from above as one inclined sheet: grooved treads with yellow nosings, and a flat landing.
  const len = Math.hypot(run, run * k), c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const steps: Panel = { id: 'esc-steps', stock: 'greyboard', c: '#6f7882', w: len, h: d, o: [xs, LAND - 2, z - 2], u: [c, s, 0], v: [0, 0, -1], edge: 'fold', density: .9, split: 2,
    print: `<rect width="${len}" height="${d}" fill="#6f7882"/>${Array.from({ length: Math.ceil(len / 24) }, (_, i) => `<rect x="${i * 24}" width="3" height="${d}" fill="${SUN}"/><rect x="${i * 24 + 6}" width="1.4" height="${d}" fill="#4d555e"/><rect x="${i * 24 + 12}" width="1.4" height="${d}" fill="#4d555e"/><rect x="${i * 24 + 18}" width="1.4" height="${d}" fill="#4d555e"/>`).join('')}<rect width="${len}" height="6" fill="${SUN}"/><rect y="${d - 6}" width="${len}" height="6" fill="${SUN}"/>` };
  // Riders, standing on the steps on their way up: the base of each sits on the incline.
  const on_ = (x: number) => (x - xs) * k + LAND;
  const riders = [
    standing('esc-rider-a', -230, z - 46, L(0, '#1d2228', '#e9ebee', '#2e3440', 'short'), { y: on_(-230), print: `<rect x="40" y="108" width="20" height="28" rx="3" fill="${INK}"/>` }),
    standing('esc-rider-b', 20, z - 52, L(2, '#4a2c1a', CORAL, '#3f5f7a', 'long'), { y: on_(20), arm: 'right' }),
    standing('esc-rider-c', 300, z - 46, L(1, '#1d2228', '#c9b8d8', '#2e3440', 'bun'), { y: on_(300), print: `<rect x="6" y="110" width="22" height="30" rx="4" fill="${KRAFT}"/>` }),
    standing('esc-rider-d', 560, z - 50, L(3, '#8a5a3a', DEEP, '#2e3440', 'cap', SUN), { y: on_(560) })
  ];
  // Relief on the core wall. Each piece stands proud of the wall; the bake gives it its shadow.
  const wz = z + 1;
  const relief = carved(core, [
    // Station map in a framed board.
    ...box({ id: 'core-map', x: -10, z: wz + 3, y: 40, w: 150, h: 104, d: 6, stock: 'cover', c: '#fbf7ee',
      front: `<rect width="150" height="104" fill="${STEEL}"/><rect x="5" y="5" width="140" height="94" fill="#fbf7ee"/><rect x="5" y="5" width="140" height="16" fill="${TEAL_DEEP}"/><path d="M18 64H132" stroke="${CORAL}" stroke-width="6" stroke-linecap="round"/>${[0, 1, 2, 3].map(i => `<circle cx="${24 + i * 34}" cy="64" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join('')}<rect x="14" y="80" width="60" height="5" rx="2" fill="${INK}" fill-opacity=".4"/>` }),
    // AED box: white cabinet with a green heart.
    ...box({ id: 'core-aed', x: -170, z: wz + 9, y: 60, w: 40, h: 48, d: 18, stock: 'cover', c: '#f4f6f8', front: `<rect width="40" height="48" rx="3" fill="#f4f6f8"/><rect x="4" y="4" width="32" height="40" rx="2" fill="none" stroke="${TEAL}" stroke-width="2"/><path d="M20 32L10 22Q6 16 12 12Q17 10 20 15Q23 10 28 12Q34 16 30 22Z" fill="${TEAL}"/>` }),
    // Fire hose cabinet: red box with a glass door and a reel.
    ...box({ id: 'core-fire', x: 120, z: wz + 12, y: 16, w: 74, h: 140, d: 24, stock: 'cover', c: '#c8392a', front: `<rect width="74" height="140" fill="#c8392a"/><rect x="7" y="9" width="60" height="94" rx="3" fill="#f3d6cf"/><g fill="none" stroke="#a52a1e" stroke-width="3">${[22, 17, 12].map(r => `<ellipse cx="37" cy="54" rx="${r}" ry="${r * .9}"/>`).join('')}</g><path d="M37 76V96H56" stroke="${INK}" stroke-width="4" fill="none"/><rect x="52" y="90" width="10" height="12" rx="2" fill="${INK}"/><rect x="7" y="9" width="60" height="94" rx="3" fill="#fff" fill-opacity=".18"/><rect x="10" y="112" width="54" height="18" rx="2" fill="#fbf7ee"/><path d="M16 121h8M28 121h30" stroke="#c8392a" stroke-width="5"/>` }),
    // Staff door in a stainless frame, with its sign.
    ...box({ id: 'core-door-frame', x: 290, z: wz + 2, y: 0, w: 116, h: 214, d: 4, stock: 'cover', c: STAINLESS, front: `<rect width="116" height="214" fill="${STAINLESS}"/>` }),
    ...box({ id: 'core-door', x: 290, z: wz + 5, y: 0, w: 98, h: 204, d: 3, stock: 'cover', c: '#9aa3ad', front: `<rect width="98" height="204" fill="#9aa3ad"/><rect x="80" y="100" width="8" height="26" rx="3" fill="${STEEL}"/><rect x="20" y="40" width="58" height="22" rx="3" fill="${SUN}"/><rect x="26" y="48" width="46" height="5" fill="${INK}"/>` }),
    // Ticket top-up machine, set into the wall.
    ...box({ id: 'core-topup', x: 680, z: wz + 22, y: 0, w: 92, h: 168, d: 44, stock: 'cover', c: '#e9eef2', front: `<rect width="92" height="168" fill="#e9eef2"/><rect width="92" height="22" fill="${TEAL}"/><rect x="12" y="34" width="68" height="48" rx="4" fill="#14171b"/><rect x="16" y="38" width="60" height="40" fill="#5ec3a6"/><rect x="22" y="44" width="40" height="5" fill="#fff"/><rect x="22" y="56" width="28" height="5" fill="#fff" fill-opacity=".7"/><rect x="18" y="94" width="24" height="16" rx="3" fill="${STEEL}"/><rect x="52" y="96" width="22" height="4" fill="${INK}"/><rect x="26" y="128" width="40" height="12" rx="3" fill="${INK}"/>`, right: `<rect width="44" height="168" fill="#d6dde3"/>`, top: `<rect width="92" height="44" fill="#d6dde3"/>` }),
    // Two lightbox ads, one low (seen through the windows) and one high (seen over the roof).
    ...box({ id: 'core-ad-low', x: 470, z: wz + 6, y: 50, w: 160, h: 110, d: 10, stock: 'cover', c: STEEL, front: `<rect width="160" height="110" fill="${STEEL}"/><rect x="6" y="6" width="148" height="98" fill="${SUN}"/><circle cx="46" cy="56" r="30" fill="${CREAM}"/><path d="M34 46H58V68Q58 74 52 74H40Q34 74 34 68Z" fill="${CORAL}"/><rect x="88" y="34" width="56" height="10" rx="5" fill="${INK}"/><rect x="88" y="52" width="40" height="8" rx="4" fill="${INK}" fill-opacity=".55"/>` }),
    ...box({ id: 'core-ad-high', x: 880, z: wz + 8, y: 420, w: 260, h: 150, d: 12, stock: 'cover', c: STEEL, front: `<rect width="260" height="150" fill="${STEEL}"/><rect x="8" y="8" width="244" height="134" fill="${DEEP}"/><rect x="24" y="30" width="44" height="80" rx="7" fill="#1d2228"/><rect x="28" y="36" width="36" height="66" fill="#bfe6f8"/><rect x="88" y="40" width="140" height="16" rx="8" fill="${CREAM}"/><rect x="88" y="68" width="100" height="10" rx="5" fill="${CREAM}" fill-opacity=".6"/><rect x="88" y="94" width="70" height="22" rx="11" fill="${SUN}"/>` }),
    // A vent grille band and the "up" sign at the foot of the escalator.
    ...box({ id: 'core-vent', x: 560, z: wz + 3, y: 300, w: 240, h: 34, d: 5, stock: 'cover', c: STAINLESS, front: `<rect width="240" height="34" fill="${STAINLESS}"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${6 + i * 12}" y="6" width="6" height="22" rx="2" fill="${STEEL}"/>`).join('')}` }),
    ...box({ id: 'core-up', x: -330, z: wz + 4, y: 70, w: 70, h: 40, d: 6, stock: 'cover', c: TEAL, front: `<rect width="70" height="40" rx="5" fill="${TEAL}"/><path d="M14 30L30 12L46 30" stroke="#fff" stroke-width="5" fill="none"/><rect x="50" y="10" width="10" height="20" fill="#fff"/>` })
  ]);
  // A cut-paper mural fills the core wall's upper triangle, as layers stuck a little apart (a flat artwork: shadow-box
  // relief). The back layer is a pale band following the stair; on it a far skyline, then rolling cloud scrolls, then
  // the near scrolls in deep teal, each layer cut with its own outline.
  const mx0 = 330, mx1 = x1 - 40, mtop = (x: number) => py(yAt(x) - 70), mbot = py(330);
  const band = `M${mx0 - x0} ${mbot}V${mtop(mx0)}L${mx1 - x0} ${mtop(mx1)}V${mbot}Z`;
  const mw = mx1 - mx0, mh = mbot - mtop(mx1);
  const local = (p: string) => `<g transform="translate(${-(mx0 - x0)} ${-mtop(mx1)})">${p}</g>`;
  // Everything outside the band is erased: black in a mask is a hole, and it stays inside the sheet's own mask.
  const erase = local(`<path fill-rule="evenodd" d="M${mx0 - x0 - 50} ${mtop(mx1) - 50}H${mx1 - x0 + 50}V${mbot + 50}H${mx0 - x0 - 50}Z ${band}" fill="#000"/>`);
  const layer = (id: string, gap: number, c: string, shape: string) => on(core, gap, mx0 - x0, H - mbot, mw, mh, { id, stock: 'sugar', c, density: .9, mask: shape + erase, print: `<rect width="${mw}" height="${mh}" fill="${c}"/>` });
  // Layers stand on the band's bottom edge; on the narrow left end only the near ones show.
  let ms = 7; const mr = (lo: number, hi: number) => { ms = (ms * 16807) % 2147483647; return lo + (ms / 2147483647) * (hi - lo); };
  const ridge = (base: number, amp: number, n: number, sharp: boolean) => { let d = `M0 ${mh + 10}V${base}`; for (let i = 0; i <= n; i++) { const xx = i * mw / n, yy = base - mr(.3, 1) * amp; d += sharp ? `L${(xx - mw / n / 2).toFixed(0)} ${(yy).toFixed(0)}L${xx.toFixed(0)} ${(base - amp * .2).toFixed(0)}` : `Q${(xx - mw / n / 2).toFixed(0)} ${(yy - amp * .6).toFixed(0)} ${xx.toFixed(0)} ${(base - amp * mr(0, .3)).toFixed(0)}`; } return `<path d="${d}L${mw} ${mh + 10}Z" fill="#fff"/>`; };
  const pinesAt = (base: number, n: number, k: number) => Array.from({ length: n }, () => { const xx = mr(0, mw), hh = k * mr(.7, 1.2), yy = base + mr(-6, 10); return `<path d="M${xx.toFixed(0)} ${(yy - hh).toFixed(0)}l${(hh * .3).toFixed(0)} ${(hh * .5).toFixed(0)}h${(-hh * .12).toFixed(0)}l${(hh * .22).toFixed(0)} ${(hh * .5).toFixed(0)}h${(-hh * .8).toFixed(0)}l${(hh * .22).toFixed(0)} ${(-hh * .5).toFixed(0)}h${(-hh * .12).toFixed(0)}Z" fill="#fff"/>`; }).join('');
  const scrolls = (base: number, r: number, n: number) => Array.from({ length: n }, (_, i) => { const cx = (i + mr(.2, .8)) * mw / n, cy = base - mr(0, r * .4); return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r}" fill="#fff"/><circle cx="${(cx + r * .95).toFixed(0)}" cy="${(cy + r * .35).toFixed(0)}" r="${(r * .62).toFixed(0)}" fill="#fff"/>`; }).join('') + `<rect y="${base}" width="${mw}" height="${mh}" fill="#fff"/>`;
  const towers = Array.from({ length: 22 }, (_, i) => { const bw = mr(22, 46), bh = mr(50, 170), xx = i * mw / 22 + mr(-6, 6); return `<rect x="${xx.toFixed(0)}" y="${(mh - 210 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${(bh + 220).toFixed(0)}" fill="#fff"/>${i % 5 === 2 ? `<rect x="${(xx + bw / 2 - 2).toFixed(0)}" y="${(mh - 250 - bh).toFixed(0)}" width="4" height="44" fill="#fff"/>` : ''}`; }).join('');
  const birdsAt = [[.3, .18], [.33, .15], [.7, .12], [.74, .16]].map(([fx, fy]) => `<path transform="translate(${(fx * mw).toFixed(0)} ${(fy * mh).toFixed(0)}) scale(1.6)" d="M0 6Q6 0 12 6Q18 0 24 6Q18 3 12 9Q6 3 0 6Z" fill="#fff"/>`).join('');
  const mural = [
    layer('mural-back', 2, '#f4efe4', `<rect width="${mw}" height="${mh}" fill="#fff"/>`),
    layer('mural-sun', 4, SUN, `<circle cx="${mw * .58}" cy="${mh * .3}" r="46" fill="#fff"/>`),
    layer('mural-birds', 5, TEAL_DEEP, birdsAt),
    layer('mural-mtn', 6, '#cfe8de', ridge(mh - 230, 150, 6, true)),
    layer('mural-city', 8, '#9fd4c2', towers),
    layer('mural-hills', 10, '#5fb79a', ridge(mh - 120, 60, 5, false) + pinesAt(mh - 120, 26, 56)),
    layer('mural-pines', 12, '#3f9a7f', ridge(mh - 60, 40, 7, false) + pinesAt(mh - 64, 30, 70)),
    layer('mural-near', 14, TEAL_DEEP, scrolls(mh - 22, 30, 12))
  ];
  return [core, ...relief, ...mural, balustrade('esc-glass-near', z + 1.5, true), balustrade('esc-glass-far', z - d, false), steps, ...riders];
}

// Glass lift between the vending machines and the next car: shaft glass with a landing door, the cabin mid-ride
// with two passengers.
function lift(): Panel[] {
  const x0 = -1030, w = 170, zf = -390, d = 150, H = TOP + 60;
  const transoms = Array.from({ length: 8 }, (_, i) => `<rect y="${i * 130}" width="${w}" height="8" fill="#fff"/>`).join('');
  const frameMask = (ww: number, door: boolean) => `<rect width="${ww}" height="${H}" fill="#fff" fill-opacity=".26"/><rect width="10" height="${H}" fill="#fff"/><rect x="${ww - 10}" width="10" height="${H}" fill="#fff"/>${transoms}${door ? `<rect x="22" y="${H - 220}" width="${ww - 44}" height="220" fill="#fff"/>` : ''}`;
  const shaftPrint = (ww: number, door: boolean) => `<rect width="${ww}" height="${H}" fill="${GLASS}"/><rect width="10" height="${H}" fill="${STEEL}"/><rect x="${ww - 10}" width="10" height="${H}" fill="${STEEL}"/>${Array.from({ length: 8 }, (_, i) => `<rect y="${i * 130}" width="${ww}" height="8" fill="${STEEL}"/>`).join('')}`
    + (door ? `<rect x="22" y="${H - 220}" width="${ww - 44}" height="220" fill="${STAINLESS}"/><rect x="${ww / 2 - 1}" y="${H - 206}" width="2" height="206" fill="${STEEL}"/><rect x="22" y="${H - 220}" width="${ww - 44}" height="14" fill="${STEEL}"/><rect x="${ww / 2 - 18}" y="${H - 248}" width="36" height="22" rx="3" fill="#14171b"/><path d="M${ww / 2 - 8} ${H - 232}l8 -8 8 8" stroke="#ffb648" stroke-width="2.4" fill="none"/>` : '');
  const front: Panel = { id: 'lift-front', stock: 'vellum', c: GLASS, w, h: H, o: [x0, 0, zf], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .9, split: 2, mask: frameMask(w, true), print: shaftPrint(w, true) };
  const side: Panel = { id: 'lift-side', stock: 'vellum', c: GLASS, w: d, h: H, o: [x0 + w, 0, zf], u: [0, 0, -1], v: [0, 1, 0], edge: 'cut', density: .9, mask: frameMask(d, false), print: shaftPrint(d, false) };
  // The cabin, mid-ride: stainless back wall with a handrail, glass front, roof with the hoist, two riders.
  const cy = 300, ch = 210, cx0 = x0 + 16, cw = w - 32, cz = zf - 14, cd = d - 28;
  const back: Panel = { id: 'cab-back', stock: 'cover', c: STAINLESS, w: cw, h: ch, o: [cx0, cy, cz - cd], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4, print: `<rect width="${cw}" height="${ch}" fill="${STAINLESS}"/><rect y="${ch - 90}" width="${cw}" height="6" fill="${STEEL}"/><rect x="10" y="10" width="${cw - 20}" height="${ch - 110}" fill="#e3eaef"/>` };
  const top: Panel = { id: 'cab-top', stock: 'greyboard', c: '#8e959c', w: cw, h: cd, o: [cx0, cy + ch, cz], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.4, print: `<rect width="${cw}" height="${cd}" fill="#8e959c"/><rect x="${cw / 2 - 20}" y="${cd / 2 - 20}" width="40" height="40" rx="6" fill="${STEEL}"/><rect x="${cw / 2 - 2}" y="0" width="4" height="${cd}" fill="${INK}"/>` };
  const glassFront: Panel = { id: 'cab-front', stock: 'vellum', c: GLASS, w: cw, h: ch, o: [cx0, cy, cz], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
    mask: `<rect width="${cw}" height="${ch}" fill="#fff" fill-opacity=".24"/><rect width="${cw}" height="12" fill="#fff"/><rect y="${ch - 14}" width="${cw}" height="14" fill="#fff"/>`, print: `<rect width="${cw}" height="${ch}" fill="${GLASS}"/><rect width="${cw}" height="12" fill="${STEEL}"/><rect y="${ch - 14}" width="${cw}" height="14" fill="${STEEL}"/>` };
  const cable: Panel = { id: 'lift-cable', stock: 'greyboard', c: INK, w: 4, h: H - cy - ch, o: [x0 + w / 2 - 2, cy + ch, cz - cd / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2 };
  const riders = [
    standing('cab-rider-a', cx0 + 40, cz - 50, L(1, '#c9ccd1', '#c88a5a', '#6b5a4a', 'grey'), { y: cy, scale: .9, print: `<rect x="44" y="120" width="6" height="66" fill="${INK}"/>` }),
    standing('cab-rider-b', cx0 + 96, cz - 64, L(3, '#1d2228', TEAL, '#2e3440', 'long'), { y: cy, scale: .9 })
  ];
  return [front, side, back, top, glassFront, cable, ...riders];
}

// Two vending machines back to the escalator, different designs from one box: drinks behind a window in rows, and a
// coffee machine. Their fronts carry layered relief (the window, the bottles, the buttons, the pick-up flap).
function vending(): Panel[] {
  const z = -450, d = 72, h = 196;
  const drinks = box({ id: 'vend-drinks', x: -790, z, w: 120, h, d, stock: 'cover', c: DEEP, front: `<rect width="120" height="${h}" fill="${DEEP}"/><rect width="120" height="22" fill="#0a5a8f"/><rect x="8" y="5" width="60" height="12" rx="6" fill="${CREAM}"/>`, right: `<rect width="${d}" height="${h}" fill="#0a5a8f"/><rect x="10" y="30" width="${d - 20}" height="60" rx="6" fill="${CREAM}" fill-opacity=".85"/>`, top: `<rect width="120" height="${d}" fill="#0a5a8f"/>` }).filter(p => /front|right|top/.test(p.id));
  const coffee = box({ id: 'vend-coffee', x: -660, z: z + 6, w: 104, h: h - 14, d: d - 10, stock: 'cover', c: '#3a2a22', front: `<rect width="104" height="${h - 14}" fill="#3a2a22"/>`, right: `<rect width="${d - 10}" height="${h - 14}" fill="#2a1e18"/>`, top: `<rect width="104" height="${d - 10}" fill="#2a1e18"/>` }).filter(p => /front|right|top/.test(p.id));
  const fz = z + d / 2, cz = z + 6 + (d - 10) / 2;
  // Bottles: three rows of small cut shapes on a lit back, under a glass window: three layers out from the front.
  const bottle = (bx: number, by: number, c: string) => `<path d="M${bx + 3} ${by}h6v6q4 2 4 8v22h-14v-22q0 -6 4 -8z" fill="${c}"/>`;
  const rows = [CORAL, SUN, '#35b58a', '#e9eef2', '#7c6be0'];
  const drinkBits = [
    on(drinks[0], 2, 10, 64, 100, 124, { id: 'vend-drinks-back', stock: 'cover', c: '#e9f4fb', emit: .5, print: `<rect width="100" height="124" fill="#e9f4fb"/>${[0, 1, 2].map(r => `<rect y="${38 + r * 40}" width="100" height="3" fill="#9fb7c6"/>`).join('')}` }),
    on(drinks[0], 5, 12, 66, 96, 120, { id: 'vend-drinks-bottles', stock: 'cover', c: CORAL, mask: [0, 1, 2].map(r => Array.from({ length: 6 }, (_, i) => bottle(4 + i * 15, 4 + r * 40, '#fff')).join('')).join(''), print: [0, 1, 2].map(r => Array.from({ length: 6 }, (_, i) => bottle(4 + i * 15, 4 + r * 40, rows[(i + r * 2) % rows.length])).join('')).join('') }),
    on(drinks[0], 8, 8, 62, 104, 128, { id: 'vend-drinks-frame', stock: 'cover', c: '#0a5a8f', mask: `<path fill-rule="evenodd" d="M0 0H104V128H0Z M6 6H98V122H6Z" fill="#fff"/>`, print: `<rect width="104" height="128" fill="#0a5a8f"/>` }),
    on(drinks[0], 3, 14, 8, 92, 40, { id: 'vend-drinks-pad', stock: 'cover', c: '#0a5a8f', print: `<rect width="92" height="40" fill="#0a5a8f"/><rect x="6" y="8" width="44" height="24" rx="3" fill="#14171b"/><rect x="58" y="8" width="28" height="10" rx="2" fill="${STAINLESS}"/><rect x="58" y="22" width="28" height="10" rx="2" fill="${SUN}"/>` })
  ];
  const coffeeBits = [
    on(coffee[0], 4, 10, 64, 84, 96, { id: 'vend-coffee-panel', stock: 'cover', c: '#f6efe2', print: `<rect width="84" height="96" rx="4" fill="#f6efe2"/><path d="M24 34H58V66Q58 78 46 78H36Q24 78 24 66Z" fill="${CORAL}"/><path d="M58 42Q70 42 70 52Q70 62 58 62" fill="none" stroke="${CORAL}" stroke-width="5"/><path d="M34 14Q40 22 34 28M46 14Q52 22 46 28" stroke="#a5674a" stroke-width="3" fill="none"/>` }),
    on(coffee[0], 7, 30, 20, 44, 36, { id: 'vend-coffee-bay', stock: 'cover', c: '#14171b', mask: `<path fill-rule="evenodd" d="M0 0H44V36H0Z M6 6H38V36H6Z" fill="#fff"/>`, print: `<rect width="44" height="36" fill="${STAINLESS}"/>` }),
    on(coffee[0], 2, 33, 23, 38, 13, { id: 'vend-coffee-slot', stock: 'cover', c: '#14171b', print: `<rect width="38" height="13" fill="#14171b"/>` }),
    on(coffee[0], 3, 10, 162, 84, 14, { id: 'vend-coffee-head', stock: 'cover', c: SUN, print: `<rect width="84" height="14" rx="3" fill="${SUN}"/><rect x="8" y="4" width="40" height="6" rx="3" fill="${INK}"/>` })
  ];
  void fz; void cz;
  return [...drinks, ...drinkBits.map(p => ({ ...p, decal: drinks[0].id })), ...coffee, ...coffeeBits.map(p => ({ ...p, decal: coffee[0].id }))];
}

// A long bench against the escalator core, with two waiting passengers.
function bench(): Panel[] {
  const x0 = 840, x1 = 1060, z = ST.ESC_Z + 40, sh = 44, c = TEAL;
  const seat = box({ id: 'st-bench', x: (x0 + x1) / 2, z, w: x1 - x0, h: sh, d: 46, stock: 'cover', c: STAINLESS, front: `<rect width="${x1 - x0}" height="${sh}" fill="${STEEL}"/><rect width="${x1 - x0}" height="8" fill="${c}"/><rect x="12" y="8" width="10" height="${sh - 8}" fill="${STAINLESS}"/><rect x="${x1 - x0 - 22}" y="8" width="10" height="${sh - 8}" fill="${STAINLESS}"/>`, top: `<rect width="${x1 - x0}" height="46" fill="${c}"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 22 + 4}" width="3" height="46" fill="${TEAL_DEEP}"/>`).join('')}` }).filter(p => /front/.test(p.id));
  return [...seat,
    seated('st-sit-phone', 880, L(2, '#1d2228', SUN, '#2e3440', 'short'), { z: z - 10, y: 0, print: `<rect x="24" y="52" width="12" height="18" rx="2" fill="#1d2228"/><rect x="25.5" y="54" width="9" height="13" fill="#bfe6f8"/>` }),
    seated('st-sit-paper', 1000, L(0, '#c9ccd1', '#e9ebee', '#6b5a4a', 'grey'), { z: z - 10, y: 0, glasses: true, print: `<rect x="2" y="26" width="56" height="44" fill="#fbf7ee"/><path d="M30 26V70" stroke="#c9bfae"/><rect x="6" y="30" width="20" height="6" fill="${INK}"/>` })
  ];
}

// Commuters waiting at the screen doors (seen through the open doors and the windows), and life on the island.
function crowd(): Panel[] {
  const z = PSD - 50;
  return [
    standing('wait-a', DOORS[1] - 96, z, L(1, '#1d2228', '#3f5f7a', '#2e3440', 'short'), { print: `<rect x="40" y="110" width="22" height="30" rx="3" fill="${KRAFT}"/>` }),
    standing('wait-b', DOORS[1] + 92, z - 6, L(3, '#4a2c1a', '#e9ebee', '#3f5f7a', 'long'), { print: `<rect x="24" y="52" width="12" height="18" rx="2" fill="#1d2228"/>` }),
    standing('wait-c', DOORS[0] + 88, z, L(2, '#1d2228', TEAL, '#2e3440', 'bun')),
    standing('wait-kid', DOORS[0] + 136, z + 4, L(0, '#4a2c1a', SUN, '#3f5f7a', 'cap', CORAL), { scale: .66 }),
    // By the vending machine: a student choosing a drink.
    standing('vend-student', -740, -380, L(2, '#1d2228', CORAL, '#2e3440', 'short'), { arm: 'right', print: `<rect x="10" y="70" width="44" height="50" rx="8" fill="${DEEP}"/>` }),
    // A traveller with a suitcase heading for the escalator; a cleaner with her trolley by the lift.
    standing('st-traveller', -500, -320, L(0, '#4a2c1a', '#c9b8d8', '#2e3440', 'bun'), { rot: -10 }),
    ...box({ id: 'st-suitcase', x: -456, z: -312, w: 36, h: 54, d: 22, rot: -8, stock: 'cover', c: SUN, front: `<rect x="5" y="5" width="26" height="44" rx="4" fill="none" stroke="#c9861f" stroke-width="2"/>`, top: `<rect x="12" y="6" width="12" height="9" rx="3" fill="none" stroke="${INK}" stroke-width="2.4"/>` }).filter(p => /front|top/.test(p.id)),
    standing('st-cleaner', -1120, -300, L(1, '#1d2228', '#5d6670', '#3f4650', 'cap', TEAL)),
    { id: 'st-trolley', stock: 'cover', c: SUN, w: 60, h: 92, o: [-1084, 0, -296], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.2,
      mask: `<rect x="4" y="30" width="52" height="46" rx="6" fill="#fff"/><rect x="50" y="0" width="6" height="40" fill="#fff"/><circle cx="14" cy="84" r="8" fill="#fff"/><circle cx="46" cy="84" r="8" fill="#fff"/>`,
      print: `<rect width="60" height="92" fill="${SUN}"/><rect x="4" y="30" width="52" height="10" fill="#c9861f"/><rect x="50" width="6" height="40" fill="${STEEL}"/><circle cx="14" cy="84" r="8" fill="${INK}"/><circle cx="46" cy="84" r="8" fill="${INK}"/>` }
  ];
}

// Hanging signs over the island, seen over the car's roof: the station's name (it follows the line map), the way
// out, and the next-train display.
function signs(): Panel[] {
  const z = -270, y = 430, h = 54, rods = (x: number, w: number): Panel => ({ id: `sign-rods-${x}`, stock: 'greyboard', c: STEEL, w, h: TOP - y - h, o: [x, y + h, z - 10], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
    mask: `<rect x="16" width="6" height="${TOP - y - h}" fill="#fff"/><rect x="${w - 22}" width="6" height="${TOP - y - h}" fill="#fff"/>` });
  const nameW = 420, nx = -330;
  const name = STATIONS.map((st, k): Panel => ({ id: `sign-name-${k}`, stock: 'cover', c: TEAL_DEEP, w: nameW, h, o: [nx, y, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 2.2, show: { toy: 'line', at: [k] },
    print: `<rect width="${nameW}" height="${h}" fill="${TEAL_DEEP}"/><rect x="4" y="4" width="${nameW - 8}" height="${h - 8}" fill="none" stroke="${CREAM}" stroke-width="1.6"/><rect x="14" y="12" width="30" height="30" rx="6" fill="${st.c}" stroke="${CREAM}" stroke-width="2"/><text x="${nameW / 2 + 20}" y="37" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="26" fill="#fff">${st.name}</text>` }));
  const lid: Panel = { id: 'sign-name-top', stock: 'cover', c: STEEL, w: nameW, h: 30, o: [nx, y + h, z], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1 };
  const exitW = 260, exx = 180;
  const exit: Panel[] = box({ id: 'sign-exit', x: exx + exitW / 2, z: z - 15, y, w: exitW, h, d: 30, stock: 'cover', c: SUN,
    front: `<rect width="${exitW}" height="${h}" fill="${SUN}"/><path d="M18 27H50M38 15L50 27L38 39" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-35 34 27)"/><text x="72" y="36" font-family="Fredoka" font-weight="600" font-size="24" fill="${INK}">Exit &#183; Keluar</text>` }).filter(p => /front/.test(p.id)).map(p => ({ ...p, density: 2.2 }));
  const ledW = 230, lx = 640;
  const led: Panel[] = box({ id: 'sign-led', x: lx + ledW / 2, z: z - 15, y: y + 4, w: ledW, h: h - 8, d: 26, stock: 'cover', c: '#14171b',
    front: `<rect width="${ledW}" height="${h - 8}" rx="4" fill="#14171b"/><rect x="6" y="6" width="${ledW - 12}" height="${h - 20}" fill="#221a0e"/><rect x="14" y="14" width="26" height="18" rx="3" fill="#ffb648"/><rect x="50" y="15" width="100" height="6" rx="3" fill="#ffb648"/><rect x="50" y="26" width="70" height="5" rx="2" fill="#ffb648" fill-opacity=".6"/><rect x="${ledW - 50}" y="13" width="34" height="20" rx="3" fill="none" stroke="#ffb648" stroke-width="2"/>` }).filter(p => /front|top/.test(p.id));
  const rodW = lx + ledW - nx, rodH = TOP - y - h + 6;
  const rodSheet: Panel = { id: 'sign-rods', stock: 'greyboard', c: STEEL, w: rodW, h: rodH, o: [nx, y + h - 6, z - 12], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1,
    mask: [nx + 16, nx + nameW - 22, exx + 16, exx + exitW - 22, lx + 16, lx + ledW - 22].map(x => `<rect x="${x - nx}" width="6" height="${rodH}" fill="#fff"/>`).join('') };
  void rods;
  return [...name, lid, rodSheet, ...exit, ...led];
}

/* ---------- far: the far track, the far platform, its wall and the concourse gallery: flat layers ---------- */
function far(): Panel[] {
  const FW = SPAN + 600, FX = -FW / 2;
  const trackD = ISLAND_BACK - FAR_EDGE;
  const ftrack: Panel = { id: 'far-track', stock: 'greyboard', c: '#8a857b', w: FW, h: trackD, o: [FX, RAIL, ISLAND_BACK - 4], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .55, split: 2,
    print: `<rect width="${FW}" height="${trackD}" fill="#8a857b"/>${specks(FW, trackD, '#6a655d', 700, 3)}<rect y="${trackD / 2 - 70}" width="${FW}" height="140" fill="#77726a"/>${Array.from({ length: FW / 46 }, (_, i) => `<rect x="${i * 46 + 8}" y="${trackD / 2 - 56}" width="24" height="112" fill="#6d5a48"/>`).join('')}<rect y="${trackD / 2 - 40}" width="${FW}" height="6" fill="#c9ced3"/><rect y="${trackD / 2 + 34}" width="${FW}" height="6" fill="#c9ced3"/>` };
  // The far platform's front edge: concrete face with the yellow edge on top, then its floor.
  const edgeFace: Panel = { id: 'far-edge', stock: 'greyboard', c: '#bdb6a9', w: FW, h: -RAIL, o: [FX, RAIL, FAR_EDGE], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: .6, split: 1,
    print: `<rect width="${FW}" height="${-RAIL}" fill="#a9a397"/><rect width="${FW}" height="10" fill="${SUN}"/><rect y="10" width="${FW}" height="6" fill="#857f74"/>` };
  const PD = FAR_EDGE - FAR_WALL;
  const ffloor: Panel = { id: 'far-floor', stock: 'greyboard', c: GRANITE, w: FW, h: PD, o: [FX, 0, FAR_EDGE], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .55, split: 1,
    print: `<rect width="${FW}" height="${PD}" fill="${GRANITE}"/>${tiles(FW, PD, 60, '#c4bcae')}<rect y="${PD - 34}" width="${FW}" height="22" fill="${SUN}"/>` };
  // Far platform life on one cut sheet: benches, a vending pair, people waiting, a totem with the line's colour.
  const ppl = (x: number, top: string, legs: string, skin: string, hair: string, t = 160) => `<circle cx="${x}" cy="${200 - t + 13}" r="13" fill="${skin}"/><path d="M${x - 13} ${200 - t + 11}Q${x - 13} ${200 - t - 1} ${x} ${200 - t - 1}Q${x + 13} ${200 - t - 1} ${x + 13} ${200 - t + 11}Z" fill="${hair}"/><rect x="${x - 19}" y="${200 - t + 28}" width="38" height="${t * .44}" rx="8" fill="${top}"/><rect x="${x - 15}" y="${200 - t + 26 + t * .42}" width="13" height="${t * .5 - 6}" fill="${legs}"/><rect x="${x + 2}" y="${200 - t + 26 + t * .42}" width="13" height="${t * .5 - 6}" fill="${legs}"/>`;
  const fb = (x: number) => `<rect x="${x}" y="152" width="140" height="12" rx="3" fill="${TEAL_DEEP}"/><rect x="${x}" y="122" width="140" height="26" rx="3" fill="${TEAL}"/><rect x="${x + 10}" y="164" width="8" height="36" fill="${STEEL}"/><rect x="${x + 122}" y="164" width="8" height="36" fill="${STEEL}"/>`;
  const fv = (x: number, c: string) => `<rect x="${x}" y="10" width="90" height="190" fill="${c}"/><rect x="${x + 10}" y="40" width="70" height="90" fill="#e9f4fb"/><rect x="${x + 10}" y="150" width="70" height="20" fill="#14171b"/>`;
  const totem = (x: number) => `<rect x="${x}" y="0" width="56" height="200" rx="4" fill="${STEEL}"/><rect x="${x + 6}" y="8" width="44" height="44" rx="6" fill="${TEAL}"/><rect x="${x + 6}" y="62" width="44" height="120" fill="#fbf7ee"/>`;
  const lifeShapes = [fb(-1500 - FX), fb(-180 - FX), fb(980 - FX), fv(-900 - FX, DEEP), fv(-800 - FX, '#3a2a22'), totem(400 - FX), totem(1700 - FX),
    ppl(-1420 - FX, CORAL, '#3f5f7a', SKIN[0], INK, 120), ppl(-1360 - FX, '#3f5f7a', '#2e3440', SKIN[1], '#4a2c1a', 120), ppl(-620 - FX, SUN, '#2e3440', SKIN[2], INK), ppl(-560 - FX, '#e9ebee', '#2e3440', SKIN[3], INK),
    ppl(-80 - FX, '#c9b8d8', '#2e3440', SKIN[0], '#4a2c1a', 120), ppl(250 - FX, TEAL, '#3f5f7a', SKIN[1], INK), ppl(700 - FX, '#2b3a55', '#2e3440', SKIN[3], '#8a5a3a'), ppl(760 - FX, CORAL, '#3f5f7a', SKIN[2], INK, 110), ppl(1080 - FX, '#e9ebee', '#2e3440', SKIN[0], '#c9ccd1', 120), ppl(1320 - FX, SUN, '#2e3440', SKIN[1], INK)].join('');
  const toWhite = (s: string) => s.replace(/fill="[^"]+"/g, 'fill="#fff"');
  const life: Panel = { id: 'far-life', stock: 'cover', c: '#cfc8b9', w: FW, h: 200, o: [FX, 0, FAR_EDGE - 110], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .7, split: 1, mask: toWhite(lifeShapes), print: lifeShapes };
  // The far wall: cream tiles, the station name band (it follows the line map), ad frames and a clock, a stair up.
  const WH = 470;
  const wall: Panel = { id: 'far-wall', stock: 'cover', c: TILE, w: FW, h: WH, o: [FX, 0, FAR_WALL], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: .55, split: 1,
    print: `<rect width="${FW}" height="${WH}" fill="${TILE}"/>${tiles(FW, WH, 34)}<rect y="${WH - 40}" width="${FW}" height="40" fill="#b9b2a4"/><rect y="${WH - 330}" width="${FW}" height="70" fill="${TEAL_DEEP}"/><rect y="${WH - 262}" width="${FW}" height="6" fill="${SUN}"/>`
      + [-1700, -1000, -300, 400, 1100, 1800].map(x => `<rect x="${x - FX - 90}" y="${WH - 230}" width="180" height="130" rx="4" fill="${STEEL}"/><rect x="${x - FX - 84}" y="${WH - 224}" width="168" height="118" fill="${[CORAL, SUN, '#7c6be0', DEEP, '#35b58a', CORAL][(x + 1700) / 700]}"/><circle cx="${x - FX - 30}" cy="${WH - 165}" r="30" fill="${CREAM}" fill-opacity=".85"/><rect x="${x - FX + 10}" y="${WH - 200}" width="60" height="10" rx="5" fill="${CREAM}"/>`).join('')
      + `<rect x="${60 - FX}" y="${WH - 300}" width="300" height="300" fill="#6f7882"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${60 - FX + 10}" y="${WH - 290 + i * 26}" width="280" height="14" fill="#9aa3ad"/>`).join('')}` };
  const nameBand = STATIONS.map((st, k): Panel => on(wall, 1.5, 0, WH - 330, FW, 70, { id: `far-name-${k}`, stock: 'cover', c: TEAL_DEEP, density: .8, show: { toy: 'line', at: [k] }, decal: undefined,
    mask: Array.from({ length: 6 }, (_, i) => `<rect x="${i * 760 + 40}" y="8" width="360" height="54" rx="6" fill="#fff"/>`).join(''),
    print: Array.from({ length: 6 }, (_, i) => `<rect x="${i * 760 + 40}" y="8" width="360" height="54" rx="6" fill="${TEAL_DEEP}"/><rect x="${i * 760 + 52}" y="18" width="34" height="34" rx="6" fill="${st.c}" stroke="${CREAM}" stroke-width="2"/><text x="${i * 760 + 240}" y="46" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="30" fill="#fff">${st.name}</text>`).join('') }));
  // The concourse gallery over the far platform: slab fascia, glass balustrade, people walking along it.
  const GY = WH, GH = 260;
  const walker = (x: number, top: string, skin: string, hair: string) => `<circle cx="${x}" cy="${GH - 166}" r="13" fill="${skin}"/><path d="M${x - 13} ${GH - 168}Q${x - 13} ${GH - 180} ${x} ${GH - 180}Q${x + 13} ${GH - 180} ${x + 13} ${GH - 168}Z" fill="${hair}"/><rect x="${x - 19}" y="${GH - 150}" width="38" height="62" rx="8" fill="${top}"/><rect x="${x - 15}" y="${GH - 92}" width="13" height="32" fill="#2e3440"/><rect x="${x + 2}" y="${GH - 92}" width="13" height="32" fill="#2e3440"/>`;
  const gallerySolid = `<rect y="${GH - 60}" width="${FW}" height="60" fill="#fff"/><rect y="${GH - 160}" width="${FW}" height="8" fill="#fff"/>${Array.from({ length: Math.ceil(FW / 220) }, (_, i) => `<rect x="${i * 220}" y="${GH - 160}" width="6" height="100" fill="#fff"/>`).join('')}`;
  const people = [-1600, -1540, -820, -260, 300, 360, 980, 1500].map((x, i) => walker(x - FX, [CORAL, '#3f5f7a', SUN, '#e9ebee', TEAL, '#c9b8d8', '#2b3a55', CORAL][i], SKIN[i % 4], i % 3 ? INK : '#4a2c1a')).join('');
  const gallery: Panel = { id: 'far-gallery', stock: 'cover', c: '#e6e0d3', w: FW, h: GH, o: [FX, GY - 60, ST.GALLERY], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .55, split: 1,
    mask: `<rect y="${GH - 152}" width="${FW}" height="92" fill="#fff" fill-opacity=".25"/>${toWhite(people)}${gallerySolid}`,
    print: `<rect width="${FW}" height="${GH}" fill="${GLASS}"/>${people}<rect y="${GH - 60}" width="${FW}" height="60" fill="#e6e0d3"/><rect y="${GH - 60}" width="${FW}" height="10" fill="${STAINLESS}"/>${Array.from({ length: Math.ceil(FW / 330) }, (_, i) => `<rect x="${i * 330 + 20}" y="${GH - 44}" width="290" height="36" rx="4" fill="${[TEAL, SUN, CORAL, DEEP][i % 4]}"/><rect x="${i * 330 + 40}" y="${GH - 34}" width="${120 + (i * 37) % 80}" height="8" rx="4" fill="${CREAM}"/><rect x="${i * 330 + 40}" y="${GH - 22}" width="${70 + (i * 23) % 60}" height="6" rx="3" fill="${CREAM}" fill-opacity=".7"/>`).join('')}${Array.from({ length: Math.ceil(FW / 220) }, (_, i) => `<rect x="${i * 220}" y="${GH - 160}" width="6" height="100" fill="${STEEL}"/>`).join('')}<rect y="${GH - 160}" width="${FW}" height="8" fill="${STEEL}"/>` };
  // The concourse behind the gallery: shopfronts, the fare gates, wayfinding, and the ceiling's light lines on top.
  const CH = TOP + 160 - (GY - 60), CY = GY - 60;
  const shop = (x: number, w: number, c: string, awn: string) => `<rect x="${x}" y="${CH - 230}" width="${w}" height="230" fill="${c}"/><rect x="${x + 14}" y="${CH - 180}" width="${w - 28}" height="140" fill="#fff4dc"/><rect x="${x}" y="${CH - 250}" width="${w}" height="34" fill="${awn}"/><rect x="${x + 20}" y="${CH - 242}" width="${w * .5}" height="16" rx="8" fill="${CREAM}"/>${Array.from({ length: 4 }, (_, i) => `<rect x="${x + 24 + i * (w - 48) / 4}" y="${CH - 150}" width="${(w - 48) / 4 - 10}" height="70" fill="${[CORAL, SUN, DEEP, '#35b58a'][i]}" fill-opacity=".55"/>`).join('')}`;
  const gates = (x: number) => Array.from({ length: 6 }, (_, i) => `<rect x="${x + i * 60}" y="${CH - 120}" width="18" height="96" rx="4" fill="${STAINLESS}"/><rect x="${x + i * 60 + 3}" y="${CH - 112}" width="12" height="10" fill="${TEAL}"/>`).join('');
  const concourse: Panel = { id: 'far-concourse', stock: 'cover', c: '#f2ede3', w: FW, h: CH, o: [FX, CY, ST.CONCOURSE], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: .5, split: 1, emit: .3,
    print: `<rect width="${FW}" height="${CH}" fill="#e9e2d4"/>${tiles(FW, CH, 48, '#d9d1c1')}<rect width="${FW}" height="${CH - 200}" fill="#a7adb4"/>${Array.from({ length: Math.floor((CH - 200) / 46) }, (_, r) => `<rect y="${CH - 200 - r * 46 - 30}" width="${FW}" height="4" fill="#8a9098"/>${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 260 + 40 + (r % 2) * 130}" y="${CH - 200 - r * 46 - 20}" width="150" height="9" rx="4.5" fill="#fffbea"/>`).join('')}`).join('')}<rect y="${CH - 206}" width="${FW}" height="10" fill="${TEAL}"/>`
      + shop(-1400 - FX, 420, '#d9a27a', CORAL) + shop(700 - FX, 380, '#9cc6d9', DEEP) + gates(-500 - FX) + gates(1300 - FX)
      + `<rect x="${-200 - FX}" y="${CH - 330}" width="300" height="56" rx="6" fill="${SUN}"/><text x="${-50 - FX}" y="${CH - 292}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="28" fill="${INK}">Exit &#183; Keluar</text>` };
  return [ftrack, edgeFace, ffloor, life, wall, ...nameBand, gallery, concourse];
}

export function station(): { panels: Panel[]; lamps: Lamp[] } {
  const panels = [...trackbed(), conductor(), ...screenDoors('psd', PSD, DOORS, true), ...island(), ...columns(), ...escalator(), ...lift(), ...vending(), ...bench(), ...crowd(), ...signs(),
    ...screenDoors('psd-far', ISLAND_BACK + 6, [], false), ...far()];
  const lamps: Lamp[] = [
    ...[-1200, -600, 0, 600, 1200].map(x => ({ at: [x, 760, -420] as V3, color: [1, .97, .9] as const, energy: 900 })),
    ...[-1400, -500, 400, 1300].map(x => ({ at: [x, 640, -980] as V3, color: [1, .97, .9] as const, energy: 260 }))
  ];
  void add;
  return { panels, lamps };
}
