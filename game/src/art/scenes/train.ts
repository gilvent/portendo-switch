import { add, box, carved, on, slot, yaw, type BoxSpec, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, reseed, specks } from '../recipes.ts';
import { SKIN, seated, standing, type Look } from './people.ts';
import { station as buildStation } from './station.ts';

// The home space: one MRT car standing in an underground station, cut open along its near side like a cutaway model.
// The car runs along x. Its far side (the back wall) carries the doors, windows and the long benches;
// the two ends are the gangways to the neighbouring cars. The station around it is built in station.ts.
const MINT = '#35b58a', PLUM = '#7c6be0', STEEL = '#3d444e', SKY = '#8fd3f4';
const SHELL = '#e9edf1', SHELL_DARK = '#c9d1d9', SEAT = '#2f6f9f', SEAT_PRIORITY = '#c84a3a', FLOOR = '#9aa3ad', POLE = '#cfd6dd', LIVERY = '#e8552d';
export const CAR = { W: 1180, D: 300, H: 250, COVE: 336, ROOF: 362, SEAT: 46, WIN: [104, 214] as const };
const { W, D, H } = CAR, BACK = -D / 2, FRONT = D / 2;
// Door openings in the back wall, centre x. The right one (x 330) is the door the player leaves by.
export const DOORS = [-330, 330] as const, DOOR_W = 124, DOOR_H = 206;
// Windows between and beside the doors: [x0, x1] along the car.
const WINDOWS: [number, number][] = [[-560, -420], [-240, -12], [12, 240], [420, 560]];
// The three stations the line map can choose. Same order as the ride's destinations in content.ts.
export const STATIONS = [{ name: 'Blibli.com', c: BLUE }, { name: 'Moperty', c: '#3f51b5' }, { name: 'Radjastone', c: '#9a883f' }] as const;

const bx = (x: number) => x + W / 2;
const backWall = (): Panel => {
  const holes = WINDOWS.map(([a, b]) => `M${bx(a) + 12} ${H - CAR.WIN[1]}h${b - a - 24}a12 12 0 0 1 12 12v${CAR.WIN[1] - CAR.WIN[0] - 24}a12 12 0 0 1 -12 12h${-(b - a - 24)}a12 12 0 0 1 -12 -12v${-(CAR.WIN[1] - CAR.WIN[0] - 24)}a12 12 0 0 1 12 -12Z`).join(' ')
    + DOORS.map(x => ` M${bx(x) - DOOR_W / 2} ${H}V${H - DOOR_H}H${bx(x) + DOOR_W / 2}V${H}Z`).join('');
  // Panel seams, a kick strip along the bottom, and the window band's darker surround.
  const print = `<rect width="${W}" height="${H}" fill="${SHELL}"/><rect y="${H - 34}" width="${W}" height="34" fill="${SHELL_DARK}"/>`
    + `<rect y="${H - CAR.WIN[1] - 10}" width="${W}" height="${CAR.WIN[1] - CAR.WIN[0] + 20}" fill="#dfe5ea"/>`
    + Array.from({ length: 12 }, (_, i) => `<path d="M${(i + 1) * W / 13} 0V${H}" stroke="#b7c0c9" stroke-width="1.2"/>`).join('');
  return { id: 'wall-back', stock: 'cover', c: SHELL, w: W, h: H, o: [-W / 2, 0, BACK], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4, split: 3, mask: `<path fill-rule="evenodd" d="M0 0H${W}V${H}H0Z ${holes}" fill="#fff"/>`, print };
};

// The cove: the curved upper wall, leaning in over the benches, where the ad frames and the light strip sit.
const COVE_IN = 34, COVE_LEN = Math.hypot(CAR.COVE - H, COVE_IN), coveV: V3 = [0, (CAR.COVE - H) / COVE_LEN, COVE_IN / COVE_LEN];
const cove = (): Panel => ({ id: 'cove', stock: 'cover', c: SHELL, w: W, h: COVE_LEN, o: [-W / 2, H, BACK], u: [1, 0, 0], v: coveV, edge: 'fold', density: 1.4, split: 3, print: `<rect width="${W}" height="${COVE_LEN}" fill="${SHELL}"/>` });
const onCove = (x: number, y: number, w: number, h: number, rest: Partial<Panel> & Pick<Panel, 'id' | 'stock' | 'c'>, gap = 1) => on(cove(), gap, bx(x), y, w, h, rest);

// Kneeling on the seat, facing the window: the back of a small passenger, shoes up on the cushion edge.
function kneeling(id: string, x: number): Panel {
  const w = 44, h = 84;
  const mask = `<circle cx="22" cy="14" r="12" fill="#fff"/><path d="M6 34Q6 24 16 24H28Q38 24 38 34V62H6Z" fill="#fff"/><rect x="6" y="58" width="32" height="14" rx="4" fill="#fff"/><rect x="4" y="70" width="16" height="14" rx="3" fill="#fff"/><rect x="24" y="70" width="16" height="14" rx="3" fill="#fff"/>`;
  const print = `<rect width="${w}" height="${h}" fill="${CORAL}"/><circle cx="22" cy="14" r="12" fill="#4a2c1a"/><path d="M12 6Q22 0 32 6" stroke="#3a2010" stroke-width="2" fill="none"/><circle cx="10" cy="16" r="3" fill="#d9a77e"/><circle cx="34" cy="16" r="3" fill="#d9a77e"/>`
    + `<rect x="10" y="28" width="24" height="26" rx="4" fill="${BLUE}"/><rect x="14" y="34" width="16" height="10" rx="2" fill="#0a6aa8"/><rect x="6" y="58" width="32" height="14" rx="4" fill="#3f5f7a"/><rect x="4" y="70" width="16" height="14" rx="3" fill="#f4f6f8"/><rect x="24" y="70" width="16" height="14" rx="3" fill="#f4f6f8"/><rect x="4" y="80" width="16" height="4" fill="${CORAL}"/><rect x="24" y="80" width="16" height="4" fill="${CORAL}"/>`;
  return { id, stock: 'cover', c: CORAL, w, h, o: [x - w / 2, CAR.SEAT - 4, BACK + 34], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.6, mask, print };
}

/* ---------- the car ---------- */
export function train(): Scene {
  reseed(41);
  const back = backWall(), cv = cove();
  // Floor: blue-grey vinyl with fleck, a lighter aisle, yellow threshold plates and tactile strips at both doors.
  const fl: Panel = { id: 'floor', stock: 'greyboard', c: FLOOR, w: W, h: D, o: [-W / 2, 0, FRONT], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.3, split: 8,
    print: `<rect width="${W}" height="${D}" fill="${FLOOR}"/>${specks(W, D, '#6f7882', 420, 2.6)}${specks(W, D, '#e3e8ec', 160, 2)}<rect y="${D - 70}" width="${W}" height="4" fill="#7e8893"/>`
      + DOORS.map(x => `<rect x="${bx(x) - DOOR_W / 2}" y="0" width="${DOOR_W}" height="14" fill="#c9ced3"/><path d="M${bx(x) - DOOR_W / 2} 7H${bx(x) + DOOR_W / 2}" stroke="#8a929b" stroke-width="2" stroke-dasharray="4 3"/><rect x="${bx(x) - DOOR_W / 2}" y="14" width="${DOOR_W}" height="10" fill="${SUN}"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${bx(x) - DOOR_W / 2 + 6 + i * 10}" cy="19" r="2" fill="#d9952a"/>`).join('')}`
        + `<g fill="${SUN}" fill-opacity=".9">${[-1, 1].map(s => `<path transform="translate(${bx(x) + s * 34} 46) scale(${s} 1)" d="M-8 0H8V14H16L0 30L-16 14H-8Z"/>`).join('')}</g>`).join('') };
  // The underframe seen in section along the front: floor slab, skirt in livery, bogies with wheels on the rail.
  const UNDER = 74;
  const wheel = (x: number) => `<circle cx="${x}" cy="${UNDER - 18}" r="15" fill="#23272d"/><circle cx="${x}" cy="${UNDER - 18}" r="9" fill="#5b636d"/><circle cx="${x}" cy="${UNDER - 18}" r="3" fill="#aab2bb"/>`;
  const bogie = (c: number) => `<rect x="${bx(c) - 92}" y="${UNDER - 40}" width="184" height="18" rx="4" fill="#3a4049"/><rect x="${bx(c) - 26}" y="${UNDER - 46}" width="52" height="16" fill="#2b3037"/><path d="M${bx(c) - 60} ${UNDER - 30}h18M${bx(c) + 42} ${UNDER - 30}h18" stroke="${SUN}" stroke-width="5"/>${wheel(bx(c) - 60)}${wheel(bx(c) + 60)}`;
  const section: Panel = { id: 'section', stock: 'greyboard', c: '#2f353d', w: W + 24, h: UNDER, o: [-W / 2 - 12, -UNDER, FRONT + 1.5], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4, split: 3,
    mask: `<path d="M0 0H${W + 24}V30H${bx(440) + 12 + 120}V${UNDER}H${bx(440) + 12 - 120}V30H${bx(-440) + 12 + 120}V${UNDER}H${bx(-440) + 12 - 120}V30H0Z" fill="#fff"/>`,
    print: `<rect width="${W + 24}" height="${UNDER}" fill="#2f353d"/><rect width="${W + 24}" height="7" fill="#7e8893"/><rect y="7" width="${W + 24}" height="4" fill="#1d2228"/><rect y="11" width="${W + 24}" height="19" fill="${SHELL}"/><rect y="17" width="${W + 24}" height="7" fill="${LIVERY}"/><rect y="24" width="${W + 24}" height="3" fill="${DEEP}"/>`
      + `<g transform="translate(12 0)">${bogie(-440)}${bogie(440)}</g>${Array.from({ length: 7 }, (_, i) => `<rect x="${bx(-250) + 12 + i * 80}" y="30" width="54" height="22" rx="3" fill="#3a4049"/><rect x="${bx(-250) + 18 + i * 80}" y="36" width="42" height="3" fill="#5b636d"/>`).join('')}` };

  // Seen through the section between the bogies: the undercar equipment boxes, the cable runs and, below them, the
  // far rail on its sleepers, so the cut never opens onto nothing.
  const under: Panel = { id: 'undercar', stock: 'greyboard', c: '#2b3037', w: W, h: UNDER + 20, o: [-W / 2, -UNDER - 20, FRONT - 40], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1, split: 2,
    print: `<rect width="${W}" height="${UNDER + 20}" fill="#2b3037"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${60 + i * 122}" y="${8 + (i % 3) * 4}" width="${70 + (i * 29) % 40}" height="${30 - (i % 3) * 4}" rx="3" fill="${['#3d444e', '#4a5059', '#353b44'][i % 3]}"/><rect x="${66 + i * 122}" y="${14 + (i % 3) * 4}" width="20" height="4" fill="#6c737a"/>`).join('')}<rect y="44" width="${W}" height="3" fill="#1d2228"/><rect y="${UNDER + 2}" width="${W}" height="18" fill="#6f6a62"/>${Array.from({ length: W / 56 }, (_, i) => `<rect x="${i * 56 + 10}" y="${UNDER + 6}" width="30" height="14" fill="#5a4a3c"/>`).join('')}<rect y="${UNDER - 2}" width="${W}" height="6" fill="#8e959c"/>` };
  // Back wall pieces that are flat: window frames, door frames, the destination LEDs over each door.
  const winFrames = WINDOWS.map(([a, b], i) => on(back, 1.4, bx(a) - 4, H - CAR.WIN[1] - 4, b - a + 8, CAR.WIN[1] - CAR.WIN[0] + 8, { id: `win-frame-${i}`, stock: 'cover', c: '#aeb8c2', density: 1.6,
    mask: `<path fill-rule="evenodd" d="M0 0H${b - a + 8}V${CAR.WIN[1] - CAR.WIN[0] + 8}H0Z M16 4h${b - a - 24}a12 12 0 0 1 12 12v${CAR.WIN[1] - CAR.WIN[0] - 24}a12 12 0 0 1 -12 12h${-(b - a - 24)}a12 12 0 0 1 -12 -12v${-(CAR.WIN[1] - CAR.WIN[0] - 24)}a12 12 0 0 1 12 -12Z" fill="#fff"/>` }));
  const doorFrames = DOORS.map((x, i) => on(back, 1.4, bx(x) - DOOR_W / 2 - 8, 0, DOOR_W + 16, DOOR_H + 8, { id: `door-frame-${i}`, stock: 'cover', c: '#aeb8c2', density: 1.6,
    mask: `<path fill-rule="evenodd" d="M0 0H${DOOR_W + 16}V${DOOR_H + 8}H0Z M8 ${DOOR_H + 8}V8H${DOOR_W + 8}V${DOOR_H + 8}Z" fill="#fff"/>`, print: `<rect width="${DOOR_W + 16}" height="8" fill="#9aa4ae"/>` }));
  // Each door: two leaves with tall windows. They slide apart into the wall pockets when the train stops.
  const leaves = DOORS.flatMap((x, i) => ([-1, 1] as const).map((s): Panel => {
    const lw = DOOR_W / 2, ox = s < 0 ? x - lw : x;
    return { id: `door-${i}-${s < 0 ? 'l' : 'r'}`, stock: 'cover', c: '#d6dde3', w: lw, h: DOOR_H, o: [ox, 0, BACK + 2.5], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2,
      mask: `<path fill-rule="evenodd" d="M0 0H${lw}V${DOOR_H}H0Z M${s < 0 ? 12 : 8} 22h${lw - 20}v${DOOR_H - 112}h${-(lw - 20)}Z" fill="#fff"/>`,
      print: `<rect width="${lw}" height="${DOOR_H}" fill="#d6dde3"/><rect x="${s < 0 ? lw - 4 : 0}" width="4" height="${DOOR_H}" fill="#1d2228"/><rect y="${DOOR_H - 66}" width="${lw}" height="10" fill="${SUN}"/><rect x="${s < 0 ? 12 : 8}" y="${DOOR_H - 40}" width="${lw - 20}" height="22" rx="3" fill="#c3ccd4"/>${i === 1 ? `<g transform="translate(${lw / 2 - 9} ${DOOR_H - 90})"><circle cx="9" cy="9" r="9" fill="${CORAL}"/><path d="M4 9H14" stroke="#fff" stroke-width="3"/></g>` : ''}`,
      motion: { toy: 'doors', at: [1], slide: [s * (lw - 6), 0, 0] } };
  }));
  // Over the exit door the next-stop display: dark panel with the chosen station lit in amber.
  const led = (i: number, k: number): Panel => ({ ...on(cv, 2, bx(DOORS[i]) - 70, 14, 140, 30, { id: `led-${i}-${k}`, stock: 'cover', c: '#14171b', density: 3,
    print: `<rect width="140" height="30" rx="4" fill="#14171b"/><rect x="6" y="5" width="128" height="20" fill="#221a0e"/><text x="70" y="21" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="13" fill="#ffb648">${STATIONS[k].name}</text><path d="M12 15l6 -5v10z" fill="#ffb648"/>` }), decal: undefined, show: { toy: 'line', at: [k] } });

  // Ads along the cove, in a common frame. One is the hello poster, one is the line map.
  const adFrame = (id: string, x: number, w: number, print: string, c = CREAM) => [
    onCove(x - 4, 6, w + 8, COVE_LEN - 14, { id: `${id}-frame`, stock: 'cover', c: '#aeb8c2', density: 1.6 }),
    onCove(x, 10, w, COVE_LEN - 22, { id, stock: 'bond', c, density: 2.4, print }, 2)
  ];
  const ads = [
    ...adFrame('ad-hello', -260, 220, `<rect width="220" height="64" fill="${SUN}"/><circle cx="34" cy="32" r="22" fill="${CREAM}"/><circle cx="34" cy="28" r="9" fill="#f3c9a0"/><path d="M22 26Q24 14 34 14Q44 14 46 24Q38 20 30 22Z" fill="#1d2228"/><path d="M20 50Q20 38 34 38Q48 38 48 50Z" fill="#2b3a55"/><text x="66" y="30" font-family="Fredoka" font-weight="600" font-size="17" fill="${INK}">Hey there!</text><rect x="66" y="38" width="120" height="6" rx="3" fill="${INK}" fill-opacity=".55"/><rect x="66" y="49" width="88" height="6" rx="3" fill="${INK}" fill-opacity=".35"/>`),
  ];
  // The line map: one line, three named stations, the train's position, and a lamp that lights the chosen stop.
  const lmX = 0, lmW = 250;
  const station = (k: number) => 30 + k * 95;
  const lineMap = adFrame('line-map', lmX, lmW, `<rect width="${lmW}" height="64" fill="#fbf7ee"/><rect width="${lmW}" height="12" fill="${DEEP}"/><rect x="6" y="3" width="40" height="6" rx="3" fill="${CREAM}"/><path d="M14 40H${lmW - 14}" stroke="${CORAL}" stroke-width="7" stroke-linecap="round"/>`
    + [0, 1, 2].map(k => `<circle cx="${station(k)}" cy="40" r="7" fill="#fff" stroke="${INK}" stroke-width="2.4"/><text x="${station(k)}" y="60" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="9" fill="${INK}">${STATIONS[k].name}</text>`).join('')
    + `<circle cx="${lmW - 22}" cy="40" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M8 26h10l5 5 -5 5h-10z" fill="${INK}"/>`);
  const lamps = [0, 1, 2].map((k): Panel => ({ ...on(cv, 2.6, bx(lmX) + station(k) - 7, COVE_LEN - 10 - 40 - 7 - 0, 14, 14, { id: `map-lamp-${k}`, stock: 'cover', c: SUN, density: 4, emit: .5, mask: '<circle cx="7" cy="7" r="7" fill="#fff"/>', print: `<circle cx="7" cy="7" r="7" fill="${SUN}"/><circle cx="7" cy="7" r="3" fill="#fff6d8"/>` }), decal: undefined, show: { toy: 'line', at: [k] } }));

  // Light strip where the cove meets the ceiling: diffuser panels that glow.
  const strip: Panel = { ...onCove(-W / 2 + 20, COVE_LEN - 9, W - 40, 7, { id: 'light-strip', stock: 'vellum', c: '#fffbea', emit: 2.2, density: 1.4 }) };

  // Long benches under the windows, carved onto the back wall: seat box with a cushion line, backrest panel.
  const bench = (id: string, x0: number, x1: number, c: string): Panel[] => carved(back, [
    ...box({ id: `${id}-seat`, x: (x0 + x1) / 2, z: BACK + 30, w: x1 - x0, h: CAR.SEAT, d: 56, stock: 'cover', c: '#b7c0c9', front: `<rect width="${x1 - x0}" height="12" fill="${c}"/><rect y="12" width="${x1 - x0}" height="3" fill="#000" fill-opacity=".18"/>${Array.from({ length: Math.round((x1 - x0) / 60) }, (_, i) => `<path d="M${(i + 1) * 60} 0V12" stroke="#000" stroke-opacity=".2" stroke-width="1.6"/>`).join('')}`, top: `<rect width="${x1 - x0}" height="56" fill="${c}"/>${Array.from({ length: Math.round((x1 - x0) / 60) }, (_, i) => `<path d="M${(i + 1) * 60} 0V56" stroke="#000" stroke-opacity=".2" stroke-width="2"/>`).join('')}` }),
    { id: `${id}-backrest`, stock: 'cover', c, w: x1 - x0, h: 58, o: [x0, CAR.SEAT, BACK + 6], u: [1, 0, 0], v: [0, .97, -.24], edge: 'fold', print: `<rect width="${x1 - x0}" height="58" fill="${c}"/>${Array.from({ length: Math.round((x1 - x0) / 60) }, (_, i) => `<path d="M${(i + 1) * 60} 0V58" stroke="#000" stroke-opacity=".2" stroke-width="2"/>`).join('')}` }
  ]);
  const benches = [...bench('bench-mid', -250, 250, SEAT), ...bench('bench-l', -585, -404, SEAT_PRIORITY), ...bench('bench-r', 404, 585, SEAT)];
  const priority = on(back, 1.2, bx(-560), 120, 40, 40, { id: 'priority-sign', stock: 'bond', c: '#fff', density: 3, print: `<rect width="40" height="40" rx="5" fill="${DEEP}"/><circle cx="20" cy="11" r="4" fill="#fff"/><path d="M14 18H26L24 30H16Z" fill="#fff"/><path d="M12 34H28" stroke="#fff" stroke-width="2.4"/>` });

  // Glass draft screens at the bench ends beside each door, edge on to the car, with steel frames.
  const screen = (id: string, x: number): Panel => ({ id, stock: 'vellum', c: '#dff1f8', w: 64, h: 150, o: [x, 0, BACK], u: [0, 0, 1], v: [0, 1, 0], edge: 'cut', density: 2, mask: `<path fill-rule="evenodd" d="M0 0H64V150H0Z M8 8V142H56V8Z" fill="#fff"/>`, print: `<rect width="64" height="150" fill="${POLE}"/>` });
  const screens = [screen('screen-a', -404), screen('screen-b', -252), screen('screen-c', 252), screen('screen-d', 404)];
  // Grab poles at the door edges and the overhead rail with hanging straps. Poles meet the rail.
  // The grab rail runs just under the cove, so it never crosses the signs printed there.
  const RAIL_Y = 240, RAIL_Z = -62;
  const pole = (id: string, x: number, z: number): Panel[] => box({ id, x, z, w: 7, h: RAIL_Y, d: 7, stock: 'greyboard', c: POLE, front: `<rect x="1" width="2" height="${RAIL_Y}" fill="#fff" fill-opacity=".6"/>` }).filter(p => !/-(rear|under|top)$/.test(p.id));
  const poles = [...pole('pole-a', -330, -40), ...pole('pole-b', 330, -40), ...pole('pole-c', -252, BACK + 70), ...pole('pole-d', 252, BACK + 70)];
  // The overhead rail, its hangers and the hand straps, cut as one sheet: the train stands, so nothing swings.
  const strapXs = [-520, -460, -270, -205, -140, -75, 75, 140, 205, 270, 460, 520];
  const SL = 66, RX0 = -W / 2 + 30, RW = W - 60, RT = CAR.COVE, RH = RT - (RAIL_Y - SL + 3), ry = (y: number) => RT - y;
  const strapShape = (x: number) => { const l = x - RX0 - 10, t = ry(RAIL_Y + 3); return `M${l + 7} ${t}H${l + 13}V${t + SL - 34}H${l + 7}Z M${l + 5} ${t + SL - 36}H${l + 15}V${t + SL - 26}H${l + 5}Z M${l + 10} ${t + SL - 28}L${l + 20} ${t + SL - 12}Q${l + 20} ${t + SL} ${l + 10} ${t + SL}Q${l} ${t + SL} ${l} ${t + SL - 12}Z M${l + 10} ${t + SL - 21}L${l + 5} ${t + SL - 12}Q${l + 5} ${t + SL - 5} ${l + 10} ${t + SL - 5}Q${l + 15} ${t + SL - 5} ${l + 15} ${t + SL - 12}Z`; };
  // Hangers only in the gaps between the cove's signs.
  const hangerXs = [-415, -20, 415];
  const overhead: Panel = { id: 'rail', stock: 'cover', c: POLE, w: RW, h: RH, o: [RX0, RT - RH, RAIL_Z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4, split: 2,
    mask: `<rect y="${ry(RAIL_Y + 6)}" width="${RW}" height="6" fill="#fff"/>${hangerXs.map(x => `<rect x="${x - RX0 - 2.5}" y="0" width="5" height="${ry(RAIL_Y)}" fill="#fff"/>`).join('')}<path fill-rule="evenodd" d="${strapXs.map(strapShape).join(' ')}" fill="#fff"/>`,
    print: `<rect width="${RW}" height="${RH}" fill="${POLE}"/><rect y="${ry(RAIL_Y + 6)}" width="${RW}" height="2" fill="#fff" fill-opacity=".6"/>${strapXs.map(x => { const l = x - RX0 - 10, t = ry(RAIL_Y + 3), pri = x < -400; return `<rect x="${l}" y="${t}" width="20" height="${SL}" fill="${pri ? SUN : '#f4f6f8'}"/><rect x="${l + 7}" y="${t}" width="6" height="${SL - 34}" fill="${pri ? '#c9861f' : '#5d6670'}"/><rect x="${l + 5}" y="${t + SL - 36}" width="10" height="10" fill="${pri ? '#c9861f' : '#5d6670'}"/>`; }).join('')}` };

  // End walls: the gangway doors into the neighbouring cars, a fire extinguisher and the intercom at the left.
  const endWall = (side: 1 | -1, id: string): Panel => {
    const gw = 90, gx = D / 2 - gw / 2 + 10;
    return { id, stock: 'cover', c: SHELL, w: D, h: H + 40, o: side < 0 ? [-W / 2, 0, FRONT] : [W / 2, 0, BACK], u: side < 0 ? [0, 0, -1] : [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: 1.3,
      mask: `<path d="M0 ${H + 40}V40Q0 0 40 0H${D}V${H + 40}Z" fill="#fff"/>`,
      print: `<rect width="${D}" height="${H + 40}" fill="${SHELL}"/><rect y="${H + 6}" width="${D}" height="34" fill="${SHELL_DARK}"/><rect x="${gx - 8}" y="${H + 40 - 214}" width="${gw + 16}" height="214" fill="#aeb8c2"/><rect x="${gx}" y="${H + 40 - 206}" width="${gw}" height="206" fill="#d6dde3"/>`
        + `<rect x="${gx + 14}" y="${H + 40 - 190}" width="${gw - 28}" height="96" rx="6" fill="#33404d"/><rect x="${gx + 18}" y="${H + 40 - 186}" width="${gw - 36}" height="88" rx="4" fill="#7d93a6"/>`
        + `<rect x="${gx + 22}" y="${H + 40 - 150}" width="${gw - 44}" height="40" fill="#e9edf1" fill-opacity=".55"/><rect x="${gx + 26}" y="${H + 40 - 180}" width="10" height="30" fill="#2f6f9f" fill-opacity=".7"/><circle cx="${gx + 50}" cy="${H + 40 - 160}" r="7" fill="#f3c9a0" fill-opacity=".8"/><rect x="${gx + 43}" y="${H + 40 - 152}" width="14" height="30" fill="${PLUM}" fill-opacity=".7"/>`
        + `<rect x="${gx + gw - 18}" y="${H + 40 - 96}" width="6" height="22" rx="3" fill="#5b636d"/><rect x="${gx}" y="${H + 40 - 60}" width="${gw}" height="8" fill="${SUN}"/>` };
  };
  const lw = endWall(-1, 'wall-left'), rw = endWall(1, 'wall-right');
  const wallBits = carved(lw, [
    ...box({ id: 'extinguisher', x: -W / 2 + 12, z: 92, y: 60, w: 20, h: 62, d: 20, stock: 'cover', c: CORAL, right: `<rect y="18" width="20" height="22" fill="${CREAM}"/><rect x="4" y="24" width="10" height="3" fill="${INK}"/>`, top: `<circle cx="10" cy="10" r="5" fill="${INK}"/>` })
  ]);
  // The intercom: a help point beside the left door, carved onto the wall with a speaker grille and a call button.
  // Relief on the car's own walls, so the shell reads as a built thing and not a printed sheet: each window gets a sill
  // ledge, a top lip and jambs standing out from the wall; each door a pair of jambs and a header; the end walls a
  // framed gangway door, an emergency handle, a sign plate; the cove CCTV domes and speaker grilles.
  const TRIM = '#c3ccd4';
  const windowTrim = carved(back, WINDOWS.flatMap(([a, b], i) => [
    ...box({ id: `win-sill-${i}`, x: (a + b) / 2, z: BACK + 8, y: CAR.WIN[0] - 12, w: b - a + 16, h: 12, d: 16, stock: 'cover', c: TRIM, front: `<rect width="${b - a + 16}" height="12" fill="${TRIM}"/><rect width="${b - a + 16}" height="2" fill="#fff" fill-opacity=".6"/>` }),
    ...box({ id: `win-lip-${i}`, x: (a + b) / 2, z: BACK + 5, y: CAR.WIN[1], w: b - a + 16, h: 8, d: 10, stock: 'cover', c: TRIM }),
    ...[a - 4, b + 4].map((x, k) => box({ id: `win-jamb-${i}-${k}`, x, z: BACK + 4, y: CAR.WIN[0], w: 8, h: CAR.WIN[1] - CAR.WIN[0], d: 8, stock: 'cover', c: TRIM })).flat()
  ]));
  const doorTrim = carved(back, DOORS.flatMap((x, i) => [
    ...[-1, 1].flatMap(s => box({ id: `door-jamb-${i}-${s}`, x: x + s * (DOOR_W / 2 + 8), z: BACK + 7, w: 14, h: DOOR_H + 4, d: 14, stock: 'cover', c: TRIM, front: `<rect width="14" height="${DOOR_H + 4}" fill="${TRIM}"/><rect x="5" y="40" width="4" height="${DOOR_H - 80}" fill="#9aa4ae"/>` })),
    ...box({ id: `door-head-${i}`, x, z: BACK + 8, y: DOOR_H, w: DOOR_W + 30, h: 16, d: 16, stock: 'cover', c: TRIM, front: `<rect width="${DOOR_W + 30}" height="16" fill="${TRIM}"/><circle cx="${DOOR_W / 2 + 15}" cy="8" r="4" fill="${i === 1 ? CORAL : '#9aa4ae'}"/>` })
  ]));
  // A box facing into the car from an end wall: `side` -1 is the left wall, 1 the right; zc along the wall.
  const endBox = (side: -1 | 1, spec: Omit<BoxSpec, 'x' | 'rot'>) => box({ ...spec, x: side * (W / 2 - spec.d / 2), rot: -side * 90 });
  const gangway = (side: -1 | 1, zc: number, id: string) => [
    ...[-1, 1].flatMap(s => endBox(side, { id: `${id}-jamb-${s}`, z: zc + s * 52, w: 14, h: 214, d: 12, stock: 'cover', c: TRIM })),
    ...endBox(side, { id: `${id}-head`, z: zc, y: 214, w: 118, h: 16, d: 14, stock: 'cover', c: TRIM }),
    ...endBox(side, { id: `${id}-leaf`, z: zc, w: 90, h: 206, d: 4, stock: 'cover', c: '#d6dde3', front: `<rect width="90" height="206" fill="#d6dde3"/><rect x="14" y="16" width="62" height="96" rx="6" fill="#33404d"/><rect x="18" y="20" width="54" height="88" rx="4" fill="#7d93a6"/><rect x="22" y="56" width="46" height="40" fill="#e9edf1" fill-opacity=".55"/><rect x="${side < 0 ? 72 : 12}" y="110" width="6" height="22" rx="3" fill="#5b636d"/><rect y="146" width="90" height="8" fill="${SUN}"/>` }),
    ...endBox(side, { id: `${id}-handle`, z: zc + side * 76, y: 120, w: 26, h: 38, d: 10, stock: 'cover', c: CORAL, front: `<rect width="26" height="38" rx="3" fill="${CORAL}"/><rect x="7" y="8" width="12" height="18" rx="2" fill="#fff"/><rect x="10" y="12" width="6" height="10" fill="${CORAL}"/>` }),
    ...endBox(side, { id: `${id}-plate`, z: zc - side * 92, y: 168, w: 40, h: 40, d: 3, stock: 'cover', c: DEEP, front: `<rect width="40" height="40" rx="5" fill="${DEEP}"/><circle cx="18" cy="11" r="4" fill="#fff"/><path d="M16 16V26H26L30 33" stroke="#fff" stroke-width="3" fill="none"/><circle cx="17" cy="28" r="7" fill="none" stroke="#fff" stroke-width="2.4"/>` })
  ];
  const endTrim = [...carved(lw, gangway(-1, -10, 'gw-l')), ...carved(rw, gangway(1, 10, 'gw-r'))];
  // The cove: two CCTV domes and speaker grilles between the ads.
  const coveAt = (x: number, y: number): [number, number] => [H + y * coveV[1], BACK + y * coveV[2]];
  const coveTrim = carved(cv, [
    ...[-400, 300].flatMap((x, i) => { const [y, z] = coveAt(x, 40); return box({ id: `cctv-${i}`, x, z: z + 8, y: y - 6, w: 22, h: 16, d: 16, stock: 'cover', c: '#f4f6f8', front: `<circle cx="11" cy="8" r="6" fill="${INK}"/><circle cx="9" cy="6" r="2" fill="#fff" fill-opacity=".6"/>` }); }),
    ...[-30, 340, -460].flatMap((x, i) => { const [y, z] = coveAt(x, 30); return box({ id: `speaker-${i}`, x, z: z + 4, y: y - 6, w: 48, h: 14, d: 6, stock: 'cover', c: TRIM, front: `<rect width="48" height="14" rx="3" fill="${TRIM}"/>${Array.from({ length: 7 }, (_, k) => `<rect x="${5 + k * 6}" y="4" width="3" height="6" rx="1" fill="${STEEL}"/>`).join('')}` }); })
  ]);
  const intercom = carved(back, box({ id: 'intercom', x: -404, z: BACK + 6, y: 150, w: 44, h: 64, d: 12, stock: 'cover', c: SUN,
    front: `<rect width="44" height="64" rx="4" fill="${SUN}"/><rect x="6" y="6" width="32" height="10" rx="2" fill="${INK}"/><g fill="${INK}">${Array.from({ length: 12 }, (_, i) => `<circle cx="${12 + (i % 4) * 7}" cy="${24 + Math.floor(i / 4) * 6}" r="1.6"/>`).join('')}</g><circle cx="22" cy="51" r="7" fill="${CORAL}"/><circle cx="22" cy="51" r="3.4" fill="#ff8a64"/>` }));
  const emergency = on(back, 1.2, bx(-404) - 20, 96, 40, 40, { id: 'help-sign', stock: 'bond', c: '#fff', density: 3, print: `<rect width="40" height="40" rx="4" fill="#fff"/><rect x="3" y="3" width="34" height="34" rx="3" fill="none" stroke="${CORAL}" stroke-width="2"/><path d="M14 12H26V18H20V22H26V28H14Z" fill="none"/><path d="M12 28L20 10L28 28Z" fill="none" stroke="${CORAL}" stroke-width="3" stroke-linejoin="round"/><rect x="19" y="17" width="2.4" height="6" fill="${CORAL}"/><circle cx="20.2" cy="25.5" r="1.4" fill="${CORAL}"/>` });

  // The roof seen past the cut: exterior top in the shell colour with the air-con housings and a pantograph.
  const roofTop: Panel = { id: 'roof-top', stock: 'cover', c: '#dfe4e8', w: W, h: 116, o: [-W / 2, CAR.ROOF, -40], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.1, split: 3, print: `<rect width="${W}" height="116" fill="#dfe4e8"/><rect y="104" width="${W}" height="12" fill="#c3cad1"/>${Array.from({ length: 11 }, (_, i) => `<path d="M${(i + 1) * W / 12} 0V116" stroke="#c3cad1" stroke-width="1.4"/>`).join('')}` };
  const roofCut: Panel = { id: 'roof-cut', stock: 'greyboard', c: '#9aa4ae', w: W, h: CAR.ROOF - CAR.COVE, o: [-W / 2, CAR.COVE, -40], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
    print: `<rect width="${W}" height="${CAR.ROOF - CAR.COVE}" fill="#aab3bc"/><rect width="${W}" height="4" fill="#dfe4e8"/><rect y="7" width="${W}" height="10" fill="#c3b79c"/><rect y="${CAR.ROOF - CAR.COVE - 6}" width="${W}" height="6" fill="#f4f6f8"/>${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 50 + 20}" y="4" width="4" height="${CAR.ROOF - CAR.COVE - 10}" fill="#8a939c"/>`).join('')}` };
  const acUnit = (id: string, x: number, w: number) => box({ id, x, z: -100, y: CAR.ROOF, w, h: 26, d: 84, stock: 'cover', c: '#c9d0d6', front: `<g fill="#8a939c">${Array.from({ length: Math.floor(w / 12) }, (_, i) => `<rect x="${6 + i * 12}" y="7" width="6" height="12" rx="1.5"/>`).join('')}</g>`, top: `<circle cx="${w * .3}" cy="42" r="18" fill="#9aa4ae"/><circle cx="${w * .3}" cy="42" r="12" fill="#5b636d"/><circle cx="${w * .7}" cy="42" r="18" fill="#9aa4ae"/><circle cx="${w * .7}" cy="42" r="12" fill="#5b636d"/>` }).filter(p => /front|top|left|right/.test(p.id));
  const acs = [...acUnit('ac-a', -360, 190), ...acUnit('ac-b', 360, 190)];
  // Pantograph: base frame on insulators, a knuckled arm, and the pan head pressing on the contact wire overhead.
  const PH = 56, panto: Panel[] = [{ id: 'panto', stock: 'greyboard', c: '#3a4049', w: 130, h: PH, o: [-40, CAR.ROOF, -96], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4,
    mask: `<path d="M10 ${PH}V${PH - 8}H70V${PH}Z M18 ${PH - 8}L74 ${PH - 30}L78 ${PH - 26}L24 ${PH - 6}Z M74 ${PH - 30}L40 4L45 2L80 ${PH - 28}Z M14 0H86V5H14Z M8 3Q8 0 12 0V5Q8 5 8 3Z M88 3Q92 3 92 0H86V5Z M18 ${PH}V${PH - 10}H26V${PH}Z M54 ${PH}V${PH - 10}H62V${PH}Z" fill="#fff"/>`,
    print: `<rect width="130" height="${PH}" fill="#3a4049"/><rect x="14" width="72" height="5" fill="#c9ced3"/><rect x="18" y="${PH - 10}" width="8" height="10" fill="#b0552e"/><rect x="54" y="${PH - 10}" width="8" height="10" fill="#b0552e"/>` }];

  // Neighbour cars past each gangway, closed, seen from outside: a near shell with cut windows and a door, and behind
  // it the car's interior (floor, far wall with benches and riders in relief, its own windows), so each window shows
  // the inside of that car and, through its far windows, the screen doors and the island beyond.
  const bellows = (id: string, x: number): Panel => ({ id, stock: 'greyboard', c: '#2b3037', w: 30, h: H + 50, o: [x, 0, -60], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4, print: `<rect width="30" height="${H + 50}" fill="#2b3037"/>${Array.from({ length: 5 }, (_, i) => `<rect x="${3 + i * 6}" width="3" height="${H + 50}" fill="#4a5059"/>`).join('')}` });
  const NW = 560, NH = CAR.ROOF + 14, NU = 74;
  const nextCar = (side: -1 | 1): Panel[] => {
    const x0 = side < 0 ? -W / 2 - 30 - NW : W / 2 + 30, inner = side < 0 ? NW : 0, id = side < 0 ? 'car-l' : 'car-r';
    const lx = (ix: number) => (side < 0 ? NW - ix : ix);
    const wins = [[60, 200], [300, 470]].map(([a, b]) => [lx(a), lx(b)].sort((p, q) => p - q) as [number, number]);
    const door = lx(250) - 62;
    const win = ([a, b]: [number, number], y0 = CAR.WIN[0], y1 = CAR.WIN[1]) => `M${a + 10} ${NH - y1}h${b - a - 20}a10 10 0 0 1 10 10v${y1 - y0 - 20}a10 10 0 0 1 -10 10h${-(b - a - 20)}a10 10 0 0 1 -10 -10v${-(y1 - y0 - 20)}a10 10 0 0 1 10 -10Z`;
    const doorWin = `M${door + 18} ${NH - 200}h88v100h-88Z`;
    const corner = inner ? `M0 ${NH + NU}V0H${NW - 40}Q${NW} 0 ${NW} 40V${NH + NU}Z` : `M0 ${NH + NU}V40Q0 0 40 0H${NW}V${NH + NU}Z`;
    const wheel = (x: number) => `<circle cx="${x}" cy="${NH + NU - 18}" r="15" fill="#23272d"/><circle cx="${x}" cy="${NH + NU - 18}" r="5" fill="#aab2bb"/>`;
    const shell: Panel = { id: `${id}-shell`, stock: 'cover', c: SHELL, w: NW, h: NH + NU, o: [x0, -NU, FRONT], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.1, split: 2,
      mask: `<path fill-rule="evenodd" d="${corner} ${wins.map(w => win(w)).join(' ')} ${doorWin}" fill="#fff"/>`,
      print: `<rect width="${NW}" height="${NH + NU}" fill="${SHELL}"/><rect width="${NW}" height="26" fill="#d4dbe1"/><rect y="${NH - CAR.WIN[1] - 12}" width="${NW}" height="${CAR.WIN[1] - CAR.WIN[0] + 24}" fill="#3b4652"/><rect y="${NH - 70}" width="${NW}" height="8" fill="${LIVERY}"/><rect y="${NH - 62}" width="${NW}" height="3" fill="${DEEP}"/>`
        + `<rect x="${door}" y="${NH - 214}" width="124" height="214" fill="#d6dde3"/><rect x="${door + 61}" y="${NH - 214}" width="2" height="214" fill="${INK}"/><rect x="${door + 10}" y="${NH - 214}" width="104" height="6" fill="#9aa4ae"/>`
        + `<rect y="${NH}" width="${NW}" height="${NU}" fill="#2f353d"/><rect y="${NH}" width="${NW}" height="7" fill="#7e8893"/>${[lx(110), lx(230)].map(c => `<rect x="${c - 80}" y="${NH + 30}" width="160" height="18" rx="4" fill="#3a4049"/>${wheel(c - 50)}${wheel(c + 50)}`).join('')}` };
    // Window and door frames stand a little proud of the shell: layered relief.
    const frames = wins.map(([a, b], i) => on(shell, 1.2, a - 2, NU + CAR.WIN[0] - 2, b - a + 4, CAR.WIN[1] - CAR.WIN[0] + 4, { id: `${id}-wf-${i}`, stock: 'cover', c: '#aeb8c2', density: 1.4,
      mask: `<path fill-rule="evenodd" d="M0 0H${b - a + 4}V${CAR.WIN[1] - CAR.WIN[0] + 4}H0Z M12 6h${b - a - 20}a8 8 0 0 1 8 8v${CAR.WIN[1] - CAR.WIN[0] - 24}a8 8 0 0 1 -8 8h${-(b - a - 20)}a8 8 0 0 1 -8 -8v${-(CAR.WIN[1] - CAR.WIN[0] - 24)}a8 8 0 0 1 8 -8Z" fill="#fff"/>` }));
    const floor: Panel = { id: `${id}-floor`, stock: 'greyboard', c: FLOOR, w: NW, h: D - 4, o: [x0, 0, FRONT - 2], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .9, print: `<rect width="${NW}" height="${D}" fill="${FLOOR}"/>${specks(NW, D, '#6f7882', 120, 2.4)}` };
    // The far wall inside, with its windows (holes onto the station) over a bench of riders, all relief.
    const fw: Panel = { id: `${id}-far`, stock: 'cover', c: SHELL, w: NW, h: H, o: [x0, 0, BACK + 4], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1,
      mask: `<path fill-rule="evenodd" d="M0 0H${NW}V${H}H0Z ${wins.map(w => win(w, CAR.WIN[0], CAR.WIN[1]).replace(/M(\S+) (\S+)h/, (_m, x, y) => `M${x} ${+y - (NH - H)}h`)).join(' ')}" fill="#fff"/>`,
      print: `<rect width="${NW}" height="${H}" fill="${SHELL}"/><rect y="${H - 34}" width="${NW}" height="34" fill="${SHELL_DARK}"/>` };
    const riders = carved(fw, [
      ...box({ id: `${id}-bench`, x: x0 + NW / 2, z: BACK + 34, w: NW - 40, h: CAR.SEAT, d: 56, stock: 'cover', c: '#b7c0c9', front: `<rect width="${NW - 40}" height="12" fill="${SEAT}"/>`, top: `<rect width="${NW - 40}" height="56" fill="${SEAT}"/>` }),
      ...[[60, 1, '#e9ebee'], [150, 2, CORAL], [330, 0, MINT], [420, 3, '#2b3a55']].map(([ix, sk, top], i) => seated(`${id}-rider-${i}`, x0 + lx(ix as number), { skin: SKIN[sk as number], hair: i % 2 ? '#4a2c1a' : INK, top: top as string, legs: '#2e3440', hairStyle: (['short', 'long', 'bun', 'short'] as const)[i] }, { z: BACK + 62 })),
      standing(`${id}-stander`, x0 + lx(250), -10, { skin: SKIN[1], hair: INK, top: SUN, legs: '#3f5f7a', hairStyle: 'short' }, { arm: side < 0 ? 'left' : 'right' })
    ]);
    const roof: Panel = { id: `${id}-roof`, stock: 'cover', c: '#dfe4e8', w: NW, h: D, o: [x0, NH, FRONT], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .9,
      print: `<rect width="${NW}" height="${D}" fill="#dfe4e8"/>${Array.from({ length: 5 }, (_, i) => `<path d="M${(i + 1) * NW / 6} 0V${D}" stroke="#c3cad1" stroke-width="1.4"/>`).join('')}<rect x="${lx(160) - 90}" y="${D / 2 - 40}" width="180" height="80" fill="#c9d0d6"/>` };
    // The end facing our car: the neighbour's own end wall with its gangway, closed behind the bellows.
    const ex = side < 0 ? x0 + NW : x0;
    const end: Panel = { id: `${id}-end`, stock: 'cover', c: SHELL_DARK, w: D, h: NH + NU, o: side < 0 ? [ex, -NU, FRONT] : [ex, -NU, BACK], u: side < 0 ? [0, 0, -1] : [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: .8,
      print: `<rect width="${D}" height="${NH + NU}" fill="${SHELL_DARK}"/><rect x="${D / 2 - 60}" y="${NH - 240}" width="120" height="240" fill="#2b3037"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${D / 2 - 56 + i * 15}" y="${NH - 236}" width="6" height="236" fill="#4a5059"/>`).join('')}<rect y="${NH}" width="${D}" height="${NU}" fill="#2f353d"/>` };
    void inner;
    return [shell, ...frames, floor, fw, ...riders, roof, end];
  };
  // This is the last car of its train: past the right end wall is its own driving cab, seen from outside. A short
  // shell with a sloping nose, a cab window onto the desk and the driver, the windscreen sloping down to the
  // headlight and the red tail lamp.
  const cab = (): Panel[] => {
    const x0 = W / 2 + 4, CW = 230, NOSE = 120, id = 'cab';
    const outline = `M0 ${NH + NU}V0H${CW - NOSE}Q${CW - NOSE + 30} 0 ${CW - 40} ${NH - 150}Q${CW} ${NH - 120} ${CW} ${NH - 60}V${NH + NU}Z`;
    const win = `M30 ${NH - CAR.WIN[1]}h${CW - NOSE - 50}v${CAR.WIN[1] - CAR.WIN[0]}h${-(CW - NOSE - 50)}Z`;
    const shell: Panel = { id: `${id}-shell`, stock: 'cover', c: SHELL, w: CW, h: NH + NU, o: [x0, -NU, FRONT], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.2,
      mask: `<path fill-rule="evenodd" d="${outline} ${win}" fill="#fff"/>`,
      print: `<rect width="${CW}" height="${NH + NU}" fill="${SHELL}"/><rect width="${CW}" height="26" fill="#d4dbe1"/><rect y="${NH - 70}" width="${CW}" height="8" fill="${LIVERY}"/><rect y="${NH - 62}" width="${CW}" height="3" fill="${DEEP}"/>`
        + `<path d="M${CW - NOSE} 2Q${CW - NOSE + 30} 2 ${CW - 42} ${NH - 152}L${CW - 64} ${NH - 160}Q${CW - NOSE + 14} 30 ${CW - NOSE - 6} 30Z" fill="#33404d"/>`
        + `<rect x="${CW - 34}" y="${NH - 112}" width="26" height="14" rx="5" fill="#fff6d8"/><rect x="${CW - 34}" y="${NH - 92}" width="26" height="12" rx="5" fill="#d8352a"/>`
        + `<rect x="${CW - NOSE - 2}" y="${NH - 214}" width="4" height="214" fill="#9aa4ae"/><rect y="${NH}" width="${CW}" height="${NU}" fill="#2f353d"/><rect y="${NH}" width="${CW}" height="7" fill="#7e8893"/><rect x="40" y="${NH + 30}" width="140" height="18" rx="4" fill="#3a4049"/><circle cx="70" cy="${NH + NU - 18}" r="15" fill="#23272d"/><circle cx="150" cy="${NH + NU - 18}" r="15" fill="#23272d"/><circle cx="70" cy="${NH + NU - 18}" r="5" fill="#aab2bb"/><circle cx="150" cy="${NH + NU - 18}" r="5" fill="#aab2bb"/><rect x="${CW - 20}" y="${NH + 6}" width="20" height="40" fill="#5b636d"/>` };
    const frame = on(shell, 1.2, 26, NU + CAR.WIN[0] - 4, CW - NOSE - 42, CAR.WIN[1] - CAR.WIN[0] + 8, { id: `${id}-wf`, stock: 'cover', c: '#aeb8c2', density: 1.4,
      mask: `<path fill-rule="evenodd" d="M0 0H${CW - NOSE - 42}V${CAR.WIN[1] - CAR.WIN[0] + 8}H0Z M6 6H${CW - NOSE - 48}V${CAR.WIN[1] - CAR.WIN[0] + 2}H6Z" fill="#fff"/>` });
    // Inside the cab, seen through its window: the far wall with the driver's desk and seat as relief, the driver.
    const inner: Panel = { id: `${id}-far`, stock: 'cover', c: '#d6dde3', w: CW - 30, h: H, o: [x0, 0, BACK + 4], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1, print: `<rect width="${CW - 30}" height="${H}" fill="#d6dde3"/><rect y="${H - 34}" width="${CW - 30}" height="34" fill="${SHELL_DARK}"/>` };
    const desk = carved(inner, [
      ...box({ id: `${id}-desk`, x: x0 + 140, z: BACK + 40, w: 110, h: 100, d: 70, stock: 'cover', c: STEEL, front: `<rect width="110" height="100" fill="${STEEL}"/><rect x="10" y="10" width="40" height="26" rx="3" fill="#14171b"/><rect x="14" y="14" width="32" height="18" fill="#5ec3a6"/><rect x="60" y="14" width="40" height="8" rx="3" fill="${SUN}"/><circle cx="70" cy="34" r="5" fill="${CORAL}"/>`, top: `<rect width="110" height="70" fill="#4a5059"/><rect x="20" y="20" width="16" height="30" rx="4" fill="${INK}"/>` }),
      ...box({ id: `${id}-seat`, x: x0 + 60, z: BACK + 50, w: 50, h: 70, d: 46, stock: 'cover', c: SEAT, front: `<rect width="50" height="70" fill="${SEAT}"/>` }),
      standing(`${id}-driver`, x0 + 80, BACK + 80, { skin: SKIN[2], hair: INK, top: '#2b3a55', legs: '#2b3a55', hairStyle: 'cap', capC: '#2b3a55' }, { print: `<rect x="20" y="96" width="24" height="5" fill="${SUN}"/>` })
    ]);
    const floor: Panel = { id: `${id}-floor`, stock: 'greyboard', c: FLOOR, w: CW - 40, h: D - 4, o: [x0, 0, FRONT - 2], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .9 };
    const roof: Panel = { id: `${id}-roof`, stock: 'cover', c: '#dfe4e8', w: CW - NOSE, h: D, o: [x0, NH, FRONT], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: .9, print: `<rect width="${CW - NOSE}" height="${D}" fill="#dfe4e8"/><rect x="20" y="${D / 2 - 30}" width="60" height="60" rx="6" fill="#c9d0d6"/>` };
    // The sloping windscreen, from the roof edge down the nose: dark glass with a wiper.
    const dx = NOSE - 40, dy = 150, len = Math.hypot(dx, dy);
    const screenTop: Panel = { id: `${id}-windscreen`, stock: 'cover', c: '#33404d', w: len, h: D, o: [x0 + CW - NOSE, NH, FRONT], u: [dx / len, -dy / len, 0], v: [0, 0, -1], edge: 'fold', density: 1,
      print: `<rect width="${len}" height="${D}" fill="#33404d"/><rect x="8" y="12" width="${len - 16}" height="${D - 24}" rx="10" fill="#4f6578"/><path d="M${len * .6} ${D / 2}L${len * .2} ${D / 2 - 60}" stroke="${INK}" stroke-width="4"/><rect x="${len - 10}" width="10" height="${D}" fill="${SHELL}"/>` };
    return [shell, frame, inner, ...desk, floor, roof, screenTop];
  };
  const neighbours = [bellows('bellows-l', -W / 2 - 30), ...nextCar(-1), ...cab()];

  /* ---------- passengers: a morning crowd, each with a small story ---------- */
  const L = (skin: number, hair: string, top: string, legs: string, hairStyle?: Look['hairStyle'], capC?: string): Look => ({ skin: SKIN[skin], hair, top, legs, hairStyle, capC });
  const newspaper = `<rect x="2" y="26" width="56" height="44" fill="#fbf7ee"/><path d="M30 26V70" stroke="#c9bfae" stroke-width="1"/><rect x="6" y="30" width="20" height="6" fill="${INK}"/><g fill="#9a9182">${Array.from({ length: 5 }, (_, i) => `<rect x="6" y="${40 + i * 5}" width="20" height="2"/><rect x="34" y="${30 + i * 7}" width="20" height="3"/>`).join('')}</g><rect x="34" y="62" width="18" height="6" fill="${SKY}"/><circle cx="2" cy="50" r="4" fill="#d9a77e"/><circle cx="58" cy="50" r="4" fill="#d9a77e"/>`;
  const phoneHands = (c: string) => `<rect x="24" y="52" width="12" height="18" rx="2" fill="#1d2228"/><rect x="25.5" y="54" width="9" height="13" fill="${c}"/><circle cx="23" cy="66" r="4" fill="currentColor"/>`;
  const backpackLap = (c: string) => `<rect x="10" y="64" width="40" height="34" rx="8" fill="${c}"/><rect x="16" y="76" width="28" height="14" rx="4" fill="#000" fill-opacity=".18"/><rect x="22" y="60" width="16" height="6" rx="3" fill="${INK}"/>`;
  const phonesOn = (cx: number, cy: number, c = CORAL) => `<path d="M${cx - 13} ${cy + 2}Q${cx - 13} ${cy - 13} ${cx} ${cy - 13}Q${cx + 13} ${cy - 13} ${cx + 13} ${cy + 2}" fill="none" stroke="${INK}" stroke-width="3"/><rect x="${cx - 16}" y="${cy - 2}" width="6" height="10" rx="3" fill="${c}"/><rect x="${cx + 10}" y="${cy - 2}" width="6" height="10" rx="3" fill="${c}"/>`;
  const headphones = phonesOn(30, 16);
  const knit = `<g stroke="${CORAL}" stroke-width="2"><path d="M20 70L36 56M26 70L42 58"/></g><rect x="16" y="66" width="28" height="12" rx="4" fill="${SUN}"/>`;
  const people: Panel[] = [
    seated('p-paper', -205, L(0, '#1d2228', '#e9ebee', '#2e3440'), { print: newspaper, glasses: true }),
    seated('p-phone', -135, L(3, '#4a2c1a', PLUM, '#3f5f7a', 'long'), { print: phoneHands('#bfe6f8').replace('currentColor', SKIN[3]) }),
    seated('p-student', 40, L(2, '#1d2228', MINT, '#2e3440', 'short'), { print: backpackLap(CORAL) + headphones, closed: true }),
    seated('p-grandma', 112, L(1, '#c9ccd1', '#c88a5a', '#6b5a4a', 'bun'), { print: knit, glasses: true }),
    seated('p-mum', -525, L(1, '#1d2228', CORAL, '#3f5f7a', 'long')),
    { ...seated('p-kid', -470, L(0, '#4a2c1a', SUN, '#3f5f7a', 'cap', BLUE)), u: [.72, 0, 0], v: [0, .72, 0], o: [-470 - 30 * .72, CAR.SEAT - 36, BACK + 64] } as Panel,
    seated('p-laptop', 520, L(0, '#1d2228', '#2b3a55', '#2e3440'), { print: `<rect x="8" y="58" width="44" height="28" rx="2" fill="#c9ced3"/><rect x="8" y="80" width="44" height="6" fill="#9aa4ae"/><circle cx="30" cy="70" r="3" fill="#fff"/>`, glasses: true }),
    standing('p-strap', -93.5, -30, L(1, '#1d2228', '#3f5f7a', '#2e3440', 'short'), { arm: 'right', print: `<rect x="8" y="122" width="16" height="22" rx="3" fill="${KRAFT}"/><rect x="11" y="118" width="10" height="5" rx="2" fill="#6d4524"/>` }),
    standing('p-pole', -311.5, -26, L(3, '#8a5a3a', SUN, '#3f5f7a', 'long'), { arm: 'left', rot: -8, print: phonesOn(32, 66, MINT) }),
    // A schoolkid kneels on the bench to watch the city go by, back to the car.
    kneeling('p-window', 452),
    standing('p-reader', 560, -20, L(0, '#4a2c1a', '#c9b8d8', '#2e3440', 'bun'), { rot: -20, print: `<rect x="14" y="100" width="36" height="26" fill="${CORAL}"/><rect x="31" y="100" width="2" height="26" fill="#a33d1f"/><rect x="16" y="102" width="14" height="22" fill="#fbf7ee"/><rect x="34" y="102" width="14" height="22" fill="#fbf7ee"/>` })
  ];
  // Props that tell the morning: a suitcase by the priority seats, a shopping bag at a foot, an umbrella hooked on the screen.
  const suitcase = box({ id: 'suitcase', x: -575, z: BACK + 112, w: 40, h: 58, d: 26, rot: 10, stock: 'cover', c: '#2f6f9f', front: `<rect x="6" y="6" width="28" height="46" rx="4" fill="none" stroke="#1f4d70" stroke-width="2"/><rect x="16" y="2" width="8" height="4" fill="${INK}"/>`, top: `<rect x="14" y="8" width="12" height="10" rx="3" fill="none" stroke="${INK}" stroke-width="2.4"/>` }).filter(p => !/rear|under|left/.test(p.id));
  const bag: Panel = { id: 'shop-bag', stock: 'kraft', c: KRAFT, w: 30, h: 38, o: [-176, 0, BACK + 92], u: yaw(-12)([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 3, mask: '<path d="M0 38V10H8Q8 0 15 0Q22 0 22 10H30V38Z M11 10Q11 4 15 4Q19 4 19 10Z" fill="#fff" fill-rule="evenodd"/>', print: `<rect width="30" height="38" fill="${KRAFT}"/><rect y="20" width="30" height="8" fill="${CORAL}"/>` };
  const umbrella: Panel = { id: 'umbrella', stock: 'cover', c: DEEP, w: 18, h: 92, o: [262, 0, BACK + 60], u: [1, 0, 0], v: [-.18, .98, 0], edge: 'cut', density: 3, mask: '<path d="M9 0V6Q2 30 4 70L9 74L14 70Q16 30 9 6Z M8 74H10V88Q10 92 6 92H4V89H6Q8 89 8 87Z" fill="#fff"/>', print: `<rect width="18" height="92" fill="${DEEP}"/><path d="M9 6V70" stroke="#063f66" stroke-width="1.6"/><rect y="74" width="18" height="18" fill="#6d4524"/>` };

  // A buggy parked by the priority seats, brake on; a coffee cup by the laptop worker's foot.
  const stroller: Panel = { id: 'stroller', stock: 'cover', c: MINT, w: 70, h: 92, o: [-608, 0, -6], u: yaw(24)([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2.6,
    mask: `<path d="M8 50Q8 20 36 18L40 50Z M36 18Q62 22 62 50H40Z M4 50H66V64H4Z M64 40L70 4H66L60 40Z" fill="#fff"/><circle cx="14" cy="80" r="11" fill="#fff"/><circle cx="56" cy="80" r="11" fill="#fff"/><path d="M12 64H18L18 72H12Z M52 64H58V72H52Z" fill="#fff"/>`,
    print: `<rect width="70" height="92" fill="${MINT}"/><path d="M8 50Q8 20 36 18L40 50Z" fill="#2a8d6a"/><rect x="4" y="50" width="62" height="14" fill="#2a8d6a"/><rect x="60" width="10" height="44" fill="${STEEL}"/><circle cx="14" cy="80" r="11" fill="${INK}"/><circle cx="56" cy="80" r="11" fill="${INK}"/><circle cx="14" cy="80" r="4" fill="#aab2bb"/><circle cx="56" cy="80" r="4" fill="#aab2bb"/>` };
  const cup = box({ id: 'cup', x: 478, z: BACK + 98, w: 12, h: 18, d: 12, stock: 'cover', c: CREAM, front: `<rect y="5" width="12" height="7" fill="${MINT}"/>`, top: `<circle cx="6" cy="6" r="5" fill="#6d4524"/>` }).filter(p => /front|top/.test(p.id));
  const panels: Panel[] = [section, under, fl, back, cv, lw, rw, roofTop, roofCut, ...acs, ...panto, ...neighbours,
    ...winFrames, ...doorFrames, ...leaves, ...[0, 1].flatMap(i => [0, 1, 2].map(k => led(i, k))), ...ads, ...lineMap, ...lamps, strip,
    ...benches, priority, ...screens, ...poles, overhead, ...wallBits, ...intercom, emergency, ...windowTrim, ...doorTrim, ...endTrim, ...coveTrim,
    ...people, ...suitcase, bag, umbrella, stroller, ...cup];
  const st = buildStation();
  return {
    id: 'train', camera: { zoom: .96, x0: -150, x1: 260, lift: 250 }, panels: [...panels, ...st.panels],
    light: { sun: 1.4, sky: .4, skyColor: [1, .97, .92] },
    lamps: [...[-420, -140, 140, 420].map(x => ({ at: [x, CAR.COVE - 12, -70] as V3, color: [1, .98, .92] as const, energy: 48 })), ...st.lamps]
  };
}
