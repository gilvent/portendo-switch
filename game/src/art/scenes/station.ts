import { add, box, carved, on, type Lamp, type Panel, type V3 } from '../kit.ts';
import { CORAL, CREAM, DEEP, INK, KRAFT, SUN, specks } from '../recipes.ts';
import { SKIN, seated, standing, type Look } from './people.ts';
import { CAR, DOORS, DOOR_W, STATIONS } from './train.ts';

// The underground station the MRT car stands in: one side platform behind the car, closed by a concrete wall, and the
// station's end wall with the tunnel mouth past the car's cab (the car is the last one of its train). The car is a
// cutaway with its near side off; the station shows over its roof, through its windows and doors, through the
// neighbouring car and past the cab. It is all near and enclosing, so it is built in relief:
//  - the platform screen doors right behind the car, the overhead conductor rail, the trackbed under the wheels;
//  - the concrete back wall, carrying carved relief: vending machines, a bench, cabinets, a staff door, lightboxes,
//    wall lights, a cable tray, the station's name boards;
//  - on the platform, freestanding cut figures: people waiting at the doors and along the wall; hanging signs.
// The station runs from off the left of the frame to its end wall at X1, just past the cab.
export const ST = { RAIL: -74, PSD: -174, EDGE: -165, WALL: -560, X0: -1700, X1: 900, TOP: 960 };
const { RAIL, PSD, EDGE, WALL, X0, X1, TOP } = ST;
const SPAN = X1 - X0;
// Station palette: cream tiles and granite, steel and stainless; accents are the line's teal and safety yellow.
const CONCRETE = '#a8a39a', JOINT = '#d8d0c0', GRANITE = '#d3ccbf', STEEL = '#5d6670', STAINLESS = '#c9d0d6', TEAL = '#2a8d6a', TEAL_DEEP = '#1f6b52', GLASS = '#dff1f8';
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
  return { id: 'conductor', stock: 'greyboard', c: '#3a4049', w: SPAN, h, o: [X0, y0, -96], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .6, split: 2,
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
  const sheet: Panel = { id, stock: 'cover', c: STEEL, w: SPAN, h: H, o: [X0, 0, z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: withLeaves ? .9 : .6, split: withLeaves ? 4 : 2, mask,
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

/* ---------- the platform and its concrete wall ---------- */
function platform(): Panel[] {
  const D = EDGE - WALL;
  // Granite floor: tactile strip and the safety line along the edge, wear along the doors.
  const floor: Panel = { id: 'platform-floor', stock: 'greyboard', c: GRANITE, w: SPAN, h: D, o: [X0, 0, EDGE], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .8, split: 4,
    print: `<rect width="${SPAN}" height="${D}" fill="${GRANITE}"/>${tiles(SPAN, D, 60, '#c4bcae')}${specks(SPAN, D, '#a9a194', 800, 2.2)}<rect y="${D - 40}" width="${SPAN}" height="28" fill="${SUN}"/>${Array.from({ length: SPAN / 12 }, (_, i) => `<circle cx="${i * 12 + 6}" cy="${D - 26}" r="2.6" fill="#d9952a"/>`).join('')}<rect y="${D - 54}" width="${SPAN}" height="5" fill="#fff" fill-opacity=".7"/><rect y="0" width="${SPAN}" height="16" fill="#9a958c"/>` };
  // The platform's edge face, seen past the cab: concrete under the yellow lip.
  const edge: Panel = { id: 'platform-edge', stock: 'greyboard', c: '#a9a397', w: SPAN, h: -RAIL, o: [X0, RAIL, EDGE + 1], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: .8, split: 2,
    print: `<rect width="${SPAN}" height="${-RAIL}" fill="#a9a397"/><rect width="${SPAN}" height="8" fill="${SUN}"/><rect y="8" width="${SPAN}" height="6" fill="#857f74"/>${Array.from({ length: SPAN / 90 }, (_, i) => `<rect x="${i * 90 + 30}" y="30" width="26" height="20" fill="#5d646d"/>`).join('')}` };
  // The track past the cab, from above: ballast, sleepers and the two rails running into the tunnel.
  const TD = EDGE - 1 - 170, tx0 = 560;
  const track: Panel = { id: 'track-end', stock: 'greyboard', c: '#8f8a80', w: X1 - tx0, h: 170 - (EDGE - 1), o: [tx0, RAIL - 12, 170], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1,
    print: `<rect width="${X1 - tx0}" height="${-TD}" fill="#8f8a80"/>${specks(X1 - tx0, -TD, '#6f6a62', 160, 3)}${Array.from({ length: Math.ceil((X1 - tx0) / 46) }, (_, i) => `<rect x="${i * 46 + 8}" y="${170 - 150}" width="24" height="300" fill="#6d5a48"/>`).join('')}${[170 - 120, 170 + 110].map(y => `<rect y="${y}" width="${X1 - tx0}" height="8" fill="#c9ced3"/><rect y="${y + 8}" width="${X1 - tx0}" height="3" fill="#5b636d"/>`).join('')}` };
  void TD;
  return [floor, edge, track];
}

// The concrete wall closing the platform: board-marked concrete with tie holes, a teal band with the station's name
// boards, and everything a platform wall carries, as carved relief. Drawn behind the stage (it is the backmost thing).
function backWall(): Panel[] {
  const H = TOP + 40;
  const formwork = `${Array.from({ length: Math.ceil(H / 60) }, (_, r) => `<rect y="${r * 60}" width="${SPAN}" height="1.6" fill="#a29d93"/>`).join('')}${Array.from({ length: Math.ceil(SPAN / 240) * Math.ceil(H / 120) }, (_, i) => { const c = i % Math.ceil(SPAN / 240), r = Math.floor(i / Math.ceil(SPAN / 240)); return `<circle cx="${c * 240 + 40}" cy="${r * 120 + 30}" r="3.4" fill="#8f8a80"/><circle cx="${c * 240 + 200}" cy="${r * 120 + 30}" r="3.4" fill="#8f8a80"/><rect x="${c * 240}" y="${r * 120}" width="1.6" height="120" fill="#a9a49a"/>`; }).join('')}`;
  const wall: Panel = { id: 'wall-concrete', stock: 'greyboard', c: CONCRETE, w: SPAN, h: H, o: [X0, 0, WALL], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: .7, split: 3, behind: true,
    print: `<rect width="${SPAN}" height="${H}" fill="${CONCRETE}"/>${specks(SPAN, H, '#9d988e', 900, 2.6)}${formwork}<rect y="${H - 414}" width="${SPAN}" height="34" fill="${TEAL}"/><rect y="${H - 380}" width="${SPAN}" height="5" fill="${SUN}"/><rect y="${H - 26}" width="${SPAN}" height="26" fill="#8f8a80"/>` };
  const z = WALL + 1, B = (spec: Parameters<typeof box>[0]) => box(spec);
  const lightbox = (id: string, x: number, y: number, w: number, h: number, art: string) => B({ id, x, z: z + 7, y, w, h, d: 12, stock: 'cover', c: STEEL, front: `<rect width="${w}" height="${h}" fill="${STEEL}"/><g transform="translate(8 8)">${art}</g>` });
  const adArt = (w: number, h: number, c: string, k: number) => `<rect width="${w - 16}" height="${h - 16}" fill="${c}"/><circle cx="${(w - 16) * .28}" cy="${(h - 16) / 2}" r="${(h - 16) * .3}" fill="${CREAM}" fill-opacity=".9"/>${k ? `<rect x="${(w - 16) * .2}" y="${(h - 16) * .3}" width="${(w - 16) * .16}" height="${(h - 16) * .4}" rx="6" fill="#1d2228"/>` : `<path d="M${(w - 16) * .2} ${(h - 16) * .4}h${(w - 16) * .16}v${(h - 16) * .22}q0 ${(h - 16) * .1} -10 ${(h - 16) * .1}h${-(w - 16) * .16 + 20}q-10 0 -10 -10z" fill="${CORAL}"/>`}<rect x="${(w - 16) * .5}" y="${(h - 16) * .3}" width="${(w - 16) * .4}" height="12" rx="6" fill="${CREAM}"/><rect x="${(w - 16) * .5}" y="${(h - 16) * .3 + 22}" width="${(w - 16) * .28}" height="9" rx="4.5" fill="${CREAM}" fill-opacity=".6"/><rect x="${(w - 16) * .5}" y="${(h - 16) * .62}" width="${(w - 16) * .22}" height="20" rx="10" fill="${SUN}"/>`;
  // Vending: a drinks machine (bottle rows on a lit back, behind a framed window) and a coffee machine, standing
  // against the wall; each layer of their fronts is its own thin piece so the window and pads keep their depth.
  const bottle = (bx: number, by: number, c: string) => `<path d="M${bx + 3} ${by}h6v6q4 2 4 8v22h-14v-22q0 -6 4 -8z" fill="${c}"/>`;
  const rows = [CORAL, SUN, '#35b58a', '#e9eef2', '#7c6be0'];
  const vx = -860, vz = z + 36, vh = 196;
  const vending = [
    ...B({ id: 'vend-drinks', x: vx, z: vz, w: 120, h: vh, d: 72, stock: 'cover', c: DEEP, front: `<rect width="120" height="${vh}" fill="${DEEP}"/><rect width="120" height="22" fill="#0a5a8f"/><rect x="8" y="5" width="60" height="12" rx="6" fill="${CREAM}"/>`, right: `<rect width="72" height="${vh}" fill="#0a5a8f"/><rect x="10" y="30" width="52" height="60" rx="6" fill="${CREAM}" fill-opacity=".85"/>`, left: `<rect width="72" height="${vh}" fill="#0a5a8f"/>`, top: `<rect width="120" height="72" fill="#0a5a8f"/>` }),
    ...B({ id: 'vend-drinks-back', x: vx, z: vz + 37, y: 64, w: 100, h: 124, d: 1, stock: 'cover', c: '#e9f4fb', front: `<rect width="100" height="124" fill="#e9f4fb"/>${[0, 1, 2].map(r => `<rect y="${38 + r * 40}" width="100" height="3" fill="#9fb7c6"/>`).join('')}${[0, 1, 2].map(r => Array.from({ length: 6 }, (_, i) => bottle(6 + i * 15, 6 + r * 40, rows[(i + r * 2) % rows.length])).join('')).join('')}` }),
    ...B({ id: 'vend-drinks-frame', x: vx, z: vz + 42, y: 60, w: 108, h: 132, d: 5, stock: 'cover', c: '#0a5a8f', front: `<path fill-rule="evenodd" d="M0 0H108V132H0Z M7 7H101V125H7Z" fill="#0a5a8f"/>` }).filter(p => !p.id.endsWith('front')),
    ...B({ id: 'vend-drinks-pad', x: vx, z: vz + 39, y: 8, w: 92, h: 40, d: 3, stock: 'cover', c: '#0a5a8f', front: `<rect width="92" height="40" fill="#0a5a8f"/><rect x="6" y="8" width="44" height="24" rx="3" fill="#14171b"/><rect x="58" y="8" width="28" height="10" rx="2" fill="${STAINLESS}"/><rect x="58" y="22" width="28" height="10" rx="2" fill="${SUN}"/>` }),
    ...B({ id: 'vend-coffee', x: vx + 124, z: vz - 4, w: 104, h: vh - 14, d: 62, stock: 'cover', c: '#3a2a22', front: `<rect width="104" height="${vh - 14}" fill="#3a2a22"/><rect x="10" y="${vh - 14 - 160}" width="84" height="96" rx="4" fill="#f6efe2"/><path d="M34 ${vh - 14 - 126}H68V${vh - 14 - 94}Q68 ${vh - 14 - 82} 56 ${vh - 14 - 82}H46Q34 ${vh - 14 - 82} 34 ${vh - 14 - 94}Z" fill="${CORAL}"/><rect x="10" y="${vh - 14 - 176}" width="84" height="12" rx="3" fill="${SUN}"/><rect x="30" y="${vh - 14 - 56}" width="44" height="36" fill="${STAINLESS}"/><rect x="36" y="${vh - 14 - 50}" width="32" height="30" fill="#14171b"/>`, right: `<rect width="62" height="${vh - 14}" fill="#2a1e18"/>`, top: `<rect width="104" height="62" fill="#2a1e18"/>` })
  ];
  const relief = carved(wall, [
    ...vending,
    // A long bench on two steel legs, fixed to the wall, and a bin beside it.
    ...B({ id: 'wall-bench', x: -250, z: z + 26, y: 40, w: 260, h: 10, d: 50, stock: 'cover', c: TEAL, front: `<rect width="260" height="10" fill="${TEAL_DEEP}"/>`, top: `<rect width="260" height="50" fill="${TEAL}"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 22 + 4}" width="3" height="50" fill="${TEAL_DEEP}"/>`).join('')}` }),
    ...[-360, -140].flatMap(x => B({ id: `wall-bench-leg-${x}`, x, z: z + 26, w: 10, h: 40, d: 40, stock: 'cover', c: STEEL })),
    ...B({ id: 'wall-bench-back', x: -250, z: z + 4, y: 60, w: 260, h: 40, d: 6, stock: 'cover', c: TEAL, front: `<rect width="260" height="40" fill="${TEAL}"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 22 + 4}" width="3" height="40" fill="${TEAL_DEEP}"/>`).join('')}` }),
    ...B({ id: 'wall-bin', x: -80, z: z + 18, w: 40, h: 70, d: 34, stock: 'cover', c: STAINLESS, front: `<rect width="40" height="70" fill="${STAINLESS}"/><rect x="6" y="8" width="28" height="8" rx="3" fill="${INK}"/><rect x="12" y="30" width="16" height="16" rx="8" fill="${TEAL}"/>`, top: `<rect width="40" height="34" fill="#9aa3ad"/>` }),
    // The station map, the AED, the fire hose cabinet, the staff door and the top-up machine.
    ...B({ id: 'wall-map', x: 60, z: z + 3, y: 60, w: 150, h: 104, d: 6, stock: 'cover', c: '#fbf7ee',
      front: `<rect width="150" height="104" fill="${STEEL}"/><rect x="5" y="5" width="140" height="94" fill="#fbf7ee"/><rect x="5" y="5" width="140" height="16" fill="${TEAL_DEEP}"/><path d="M18 64H132" stroke="${CORAL}" stroke-width="6" stroke-linecap="round"/>${[0, 1, 2, 3].map(i => `<circle cx="${24 + i * 34}" cy="64" r="6" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join('')}<rect x="14" y="80" width="60" height="5" rx="2" fill="${INK}" fill-opacity=".4"/>` }),
    ...B({ id: 'wall-aed', x: -470, z: z + 9, y: 80, w: 40, h: 48, d: 18, stock: 'cover', c: '#f4f6f8', front: `<rect width="40" height="48" rx="3" fill="#f4f6f8"/><rect x="4" y="4" width="32" height="40" rx="2" fill="none" stroke="${TEAL}" stroke-width="2"/><path d="M20 32L10 22Q6 16 12 12Q17 10 20 15Q23 10 28 12Q34 16 30 22Z" fill="${TEAL}"/>` }),
    ...B({ id: 'wall-fire', x: 230, z: z + 12, y: 16, w: 74, h: 140, d: 24, stock: 'cover', c: '#c8392a', front: `<rect width="74" height="140" fill="#c8392a"/><rect x="7" y="9" width="60" height="94" rx="3" fill="#f3d6cf"/><g fill="none" stroke="#a52a1e" stroke-width="3">${[22, 17, 12].map(r => `<ellipse cx="37" cy="54" rx="${r}" ry="${r * .9}"/>`).join('')}</g><path d="M37 76V96H56" stroke="${INK}" stroke-width="4" fill="none"/><rect x="52" y="90" width="10" height="12" rx="2" fill="${INK}"/><rect x="10" y="112" width="54" height="18" rx="2" fill="#fbf7ee"/><path d="M16 121h8M28 121h30" stroke="#c8392a" stroke-width="5"/>` }),
    ...B({ id: 'wall-door-frame', x: 400, z: z + 2, y: 0, w: 116, h: 214, d: 4, stock: 'cover', c: STAINLESS, front: `<rect width="116" height="214" fill="${STAINLESS}"/>` }),
    ...B({ id: 'wall-door', x: 400, z: z + 5, y: 0, w: 98, h: 204, d: 3, stock: 'cover', c: '#9aa3ad', front: `<rect width="98" height="204" fill="#9aa3ad"/><rect x="80" y="100" width="8" height="26" rx="3" fill="${STEEL}"/><rect x="20" y="40" width="58" height="22" rx="3" fill="${SUN}"/><rect x="26" y="48" width="46" height="5" fill="${INK}"/>` }),
    ...B({ id: 'wall-topup', x: 600, z: z + 22, y: 0, w: 92, h: 168, d: 44, stock: 'cover', c: '#e9eef2', front: `<rect width="92" height="168" fill="#e9eef2"/><rect width="92" height="22" fill="${TEAL}"/><rect x="12" y="34" width="68" height="48" rx="4" fill="#14171b"/><rect x="16" y="38" width="60" height="40" fill="#5ec3a6"/><rect x="22" y="44" width="40" height="5" fill="#fff"/><rect x="22" y="56" width="28" height="5" fill="#fff" fill-opacity=".7"/><rect x="18" y="94" width="24" height="16" rx="3" fill="${STEEL}"/><rect x="26" y="128" width="40" height="12" rx="3" fill="${INK}"/>`, left: `<rect width="44" height="168" fill="#d6dde3"/>`, right: `<rect width="44" height="168" fill="#d6dde3"/>`, top: `<rect width="92" height="44" fill="#d6dde3"/>` }),
    // Past the cab, at the platform's end: a lightbox and the emergency exit with its green sign.
    ...lightbox('wall-ad-end', 790, 50, 150, 120, adArt(150, 120, '#35b58a', 0)),
    ...B({ id: 'wall-exit-sign', x: 820, z: z + 6, y: 230, w: 120, h: 40, d: 8, stock: 'cover', c: '#2a8d4a', front: `<rect width="120" height="40" rx="4" fill="#2a8d4a"/><circle cx="20" cy="12" r="5" fill="#fff"/><path d="M14 34L20 22L28 28M20 22L18 16L28 18" stroke="#fff" stroke-width="3.4" fill="none"/><path d="M46 20H92M82 12L92 20L82 28" stroke="#fff" stroke-width="4" fill="none"/>` }),
    // Over the roof: big lightboxes, a vent band, wall lights and the cable tray that runs the length of the wall.
    ...lightbox('wall-ad-a', -980, 430, 260, 150, adArt(260, 150, CORAL, 0)),
    ...lightbox('wall-ad-b', -260, 470, 300, 160, adArt(300, 160, DEEP, 1)),
    ...lightbox('wall-ad-c', 520, 430, 260, 150, adArt(260, 150, SUN, 1)),
    ...B({ id: 'wall-vent', x: 160, z: z + 3, y: 420, w: 240, h: 60, d: 5, stock: 'cover', c: STAINLESS, front: `<rect width="240" height="60" fill="${STAINLESS}"/>${Array.from({ length: 5 }, (_, r) => `<rect x="8" y="${8 + r * 10}" width="224" height="5" rx="2" fill="${STEEL}"/>`).join('')}` }),
    ...[-1300, -620, 120, 760].flatMap((x, i) => B({ id: `wall-light-${i}`, x, z: z + 10, y: 640, w: 120, h: 16, d: 20, stock: 'cover', c: '#fffbea', front: `<rect width="120" height="16" rx="3" fill="#fffbea"/>` })),
    ...B({ id: 'wall-tray', x: (X0 + X1) / 2, z: z + 14, y: 720, w: SPAN, h: 14, d: 28, stock: 'cover', c: '#8e959c', front: `<rect width="${SPAN}" height="14" fill="#8e959c"/>${Array.from({ length: SPAN / 30 }, (_, i) => `<rect x="${i * 30}" width="3" height="14" fill="#6c737a"/>`).join('')}`, top: `<rect width="${SPAN}" height="28" fill="#6c737a"/>${Array.from({ length: SPAN / 60 }, (_, i) => `<rect x="${i * 60}" y="${6 + (i % 3) * 5}" width="60" height="4" fill="${['#2b3037', '#c8392a', SUN][i % 3]}"/>`).join('')}` }),
    ...[-700, 300].flatMap((x, i) => B({ id: `wall-cam-${i}`, x, z: z + 10, y: 680, w: 26, h: 18, d: 20, stock: 'cover', c: '#f4f6f8', front: `<circle cx="13" cy="9" r="6" fill="${INK}"/>` }))
  ]).map(p => ({ ...p, behind: true, ...(p.id.startsWith('wall-tray') && !p.ghost ? { density: .6 } : {}) }));
  // The station's name, repeated along the band: it follows the line map.
  const names = STATIONS.map((st, k): Panel => on(wall, 1.5, 0, 380, SPAN, 34, { id: `wall-name-${k}`, stock: 'cover', c: TEAL_DEEP, density: 1, show: { toy: 'line', at: [k] }, decal: undefined, behind: true,
    mask: Array.from({ length: Math.ceil(SPAN / 700) }, (_, i) => `<rect x="${i * 700 + 120}" y="0" width="300" height="34" rx="4" fill="#fff"/>`).join(''),
    print: Array.from({ length: Math.ceil(SPAN / 700) }, (_, i) => `<rect x="${i * 700 + 120}" width="300" height="34" rx="4" fill="${TEAL_DEEP}"/><rect x="${i * 700 + 128}" y="6" width="22" height="22" rx="4" fill="${st.c}" stroke="${CREAM}" stroke-width="1.6"/><text x="${i * 700 + 280}" y="25" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="20" fill="#fff">${st.name}</text>`).join('') }));
  return [wall, ...relief, ...names];
}

// The station's end, past the cab: a concrete wall across the platform and the track, with the tunnel mouth over
// the rails. The tunnel goes dark a little way in, with a row of small lamps on its wall.
function stationEnd(): Panel[] {
  const D = 170 - WALL, H = TOP + 40 - RAIL, AZ0 = -190, AZ1 = 150, AH = 470;
  const ax = (z: number) => z - WALL, ay = (y: number) => H - (y - RAIL);
  const arch = `M${ax(AZ0)} ${ay(RAIL)}V${ay(AH - 80)}Q${ax(AZ0)} ${ay(AH)} ${ax((AZ0 + AZ1) / 2)} ${ay(AH)}Q${ax(AZ1)} ${ay(AH)} ${ax(AZ1)} ${ay(AH - 80)}V${ay(RAIL)}Z`;
  const end: Panel = { id: 'station-end', stock: 'greyboard', c: CONCRETE, w: D, h: H, o: [X1, RAIL, WALL], u: [0, 0, 1], v: [0, 1, 0], edge: 'cut', density: .7, behind: true,
    mask: `<path fill-rule="evenodd" d="M0 0H${D}V${H}H0Z ${arch}" fill="#fff"/>`,
    print: `<rect width="${D}" height="${H}" fill="${CONCRETE}"/>${specks(D, H, '#9d988e', 300, 2.6)}${Array.from({ length: Math.ceil(H / 60) }, (_, r) => `<rect y="${r * 60}" width="${D}" height="1.6" fill="#a29d93"/>`).join('')}<path d="${arch}" fill="none" stroke="#8f8a80" stroke-width="22"/><rect x="${ax(AZ0) - 40}" y="${ay(AH + 60)}" width="${AZ1 - AZ0 + 80}" height="30" rx="4" fill="${STEEL}"/><rect x="${ax(AZ0) - 30}" y="${ay(AH + 54)}" width="40" height="18" rx="3" fill="#c8392a"/><rect y="${ay(0)}" width="${ax(EDGE)}" height="${-RAIL}" fill="#a9a397"/>` };
  // Inside the tunnel: its far lining, dark, with lamps and the conductor rail going on.
  const tunnel: Panel = { id: 'tunnel', stock: 'greyboard', c: '#2b2a28', w: D, h: H, o: [X1 + 420, RAIL, WALL], u: [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: .4, behind: true,
    print: `<rect width="${D}" height="${H}" fill="#3a3834"/><rect x="${ax(AZ0)}" y="${ay(AH)}" width="${AZ1 - AZ0}" height="${AH - RAIL}" fill="#24221f"/>${[0, 1, 2].map(i => `<circle cx="${ax(AZ0) + 30 + i * 4}" cy="${ay(260 - i * 12)}" r="${7 - i * 2}" fill="#ffe6a8"/>`).join('')}<rect x="${ax(-96) - 3}" y="${ay(424)}" width="6" height="6" fill="#5d646d"/>` };
  // The platform ends in a gate: a steel rail and a "no entry" plate.
  const gate: Panel = { id: 'platform-gate', stock: 'greyboard', c: STEEL, w: EDGE - WALL - 10, h: 110, o: [X1 - 6, 0, WALL], u: [0, 0, 1], v: [0, 1, 0], edge: 'cut', density: 1.6,
    mask: `<rect width="${EDGE - WALL - 10}" height="8" fill="#fff"/><rect y="50" width="${EDGE - WALL - 10}" height="6" fill="#fff"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 80}" width="8" height="110" fill="#fff"/>`).join('')}<rect x="150" y="14" width="60" height="60" rx="30" fill="#fff"/>`,
    print: `<rect width="${EDGE - WALL - 10}" height="110" fill="${STEEL}"/><circle cx="180" cy="44" r="30" fill="#c8392a"/><rect x="160" y="40" width="40" height="8" fill="#fff"/>` };
  return [end, tunnel, gate];
}

// Commuters: waiting at the screen doors (seen through the open doors and the windows), and along the wall.
function crowd(): Panel[] {
  const z = PSD - 50;
  return [
    standing('wait-a', DOORS[1] - 96, z, L(1, '#1d2228', '#3f5f7a', '#2e3440', 'short'), { print: `<rect x="40" y="110" width="22" height="30" rx="3" fill="${KRAFT}"/>` }),
    standing('wait-b', DOORS[1] + 92, z - 6, L(3, '#4a2c1a', '#e9ebee', '#3f5f7a', 'long'), { print: `<rect x="24" y="52" width="12" height="18" rx="2" fill="#1d2228"/>` }),
    standing('wait-c', DOORS[0] + 88, z, L(2, '#1d2228', TEAL, '#2e3440', 'bun')),
    standing('wait-kid', DOORS[0] + 136, z + 4, L(0, '#4a2c1a', SUN, '#3f5f7a', 'cap', CORAL), { scale: .66 }),
    // By the vending machine: a student choosing a drink. On the bench: two waiting, one reading.
    standing('vend-student', -830, WALL + 120, L(2, '#1d2228', CORAL, '#2e3440', 'short'), { arm: 'right', print: `<rect x="10" y="70" width="44" height="50" rx="8" fill="${DEEP}"/>` }),
    seated('st-sit-phone', -320, L(2, '#1d2228', SUN, '#2e3440', 'short'), { z: WALL + 40, y: 0, print: `<rect x="24" y="52" width="12" height="18" rx="2" fill="#1d2228"/><rect x="25.5" y="54" width="9" height="13" fill="#bfe6f8"/>` }),
    seated('st-sit-paper', -190, L(0, '#c9ccd1', '#e9ebee', '#6b5a4a', 'grey'), { z: WALL + 40, y: 0, glasses: true, print: `<rect x="2" y="26" width="56" height="44" fill="#fbf7ee"/><path d="M30 26V70" stroke="#c9bfae"/><rect x="6" y="30" width="20" height="6" fill="${INK}"/>` }),
    // A traveller with a suitcase walking along the platform; a cleaner with her trolley at its end, past the cab.
    standing('st-traveller', 120, -360, L(0, '#4a2c1a', '#c9b8d8', '#2e3440', 'bun'), { rot: -10 }),
    ...box({ id: 'st-suitcase', x: 164, z: -352, w: 36, h: 54, d: 22, rot: -8, stock: 'cover', c: SUN, front: `<rect x="5" y="5" width="26" height="44" rx="4" fill="none" stroke="#c9861f" stroke-width="2"/>`, top: `<rect x="12" y="6" width="12" height="9" rx="3" fill="none" stroke="${INK}" stroke-width="2.4"/>` }).filter(p => /front|top/.test(p.id)),
    standing('st-cleaner', 800, -300, L(1, '#1d2228', '#5d6670', '#3f4650', 'cap', TEAL)),
    { id: 'st-trolley', stock: 'cover', c: SUN, w: 60, h: 92, o: [746, 0, -292], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.2,
      mask: `<rect x="4" y="30" width="52" height="46" rx="6" fill="#fff"/><rect x="50" y="0" width="6" height="40" fill="#fff"/><circle cx="14" cy="84" r="8" fill="#fff"/><circle cx="46" cy="84" r="8" fill="#fff"/>`,
      print: `<rect width="60" height="92" fill="${SUN}"/><rect x="4" y="30" width="52" height="10" fill="#c9861f"/><rect x="50" width="6" height="40" fill="${STEEL}"/><circle cx="14" cy="84" r="8" fill="${INK}"/><circle cx="46" cy="84" r="8" fill="${INK}"/>` }
  ];
}

// Hanging signs over the platform, seen over the car's roof: the station's name (it follows the line map), the way
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
  const rodSheet: Panel = { id: 'sign-rods', stock: 'greyboard', c: STEEL, w: rodW, h: rodH, o: [nx, y + h - 6, z - 12], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: .6,
    mask: [nx + 16, nx + nameW - 22, exx + 16, exx + exitW - 22, lx + 16, lx + ledW - 22].map(x => `<rect x="${x - nx}" width="6" height="${rodH}" fill="#fff"/>`).join('') };
  void rods;
  return [...name, lid, rodSheet, ...exit, ...led];
}

export function station(): { panels: Panel[]; lamps: Lamp[] } {
  const panels = [...trackbed(), conductor(), ...screenDoors('psd', PSD, DOORS, true), ...platform(), ...backWall(), ...stationEnd(), ...crowd(), ...signs()];
  const lamps: Lamp[] = [-1200, -600, 0, 600].map(x => ({ at: [x, 760, -380] as V3, color: [1, .97, .9] as const, energy: 420 }));
  void add;
  return { panels, lamps };
}
