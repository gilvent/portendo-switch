import { box, carved, on, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, reseed, specks } from '../recipes.ts';
import { MINT, PLUM, shopper, type Look } from './promenade.ts';
import { CAB, CAR, DOOR, SIGN, UNDER } from './car.ts';

// The home space: the inside of one MRT car, running underground. The near side is cut away and the camera stands
// close, so the car fills the view: nothing of its outside is modelled. Past the windows there is only the dark of the
// tunnel, which Scene.tsx draws and moves (see TUNNEL), and past the cut there is only black.
// The car runs along x. Its far side (the back wall) carries the door, the windows and the long benches; the two ends
// are the gangway doors to the neighbouring cars.
const LIVERY = '#e8552d', STEEL = '#3d444e', SHELL = '#e9edf1', SHELL_DARK = '#c9d1d9', TRIM = '#c3ccd4', SEAT = '#2f6f9f', SEAT_PRIORITY = '#c84a3a', FLOOR = '#9aa3ad', POLE = '#cfd6dd', GLASS = '#0b0e12';
const { W, D, H } = CAR, BACK = -D / 2, FRONT = D / 2;
const WINDOWS: [number, number][] = [[-400, -125], [125, 400]];
// The two stops the sign can choose, in the order of the ride's destinations in content.ts.
export const STATIONS = [{ name: 'Blibli.com', c: BLUE }, { name: 'Moperty', c: '#3f51b5' }] as const;

const bx = (x: number) => x + W / 2;
const rounded = (x: number, y: number, w: number, h: number, r: number) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
const WIN_H = CAR.WIN[1] - CAR.WIN[0];
// A window seen from outside: dark glass in a rubber seal, with a slanting glint. Nothing shows through it.
const glass = (x: number, y: number, w: number, h: number, r: number) => `<path d="${rounded(x, y, w, h, r)}" fill="#26303a"/><path d="${rounded(x + 4, y + 4, w - 8, h - 8, Math.max(2, r - 3))}" fill="#44586a"/><path d="M${x + w * .22} ${y + h - 6}L${x + w * .22 + h * .42} ${y + 6}h${Math.min(18, w * .16)}L${x + w * .22 + Math.min(18, w * .16)} ${y + h - 6}Z" fill="#fff" fill-opacity=".16"/><path d="M${x + w * .22 + 30} ${y + h - 6}L${x + w * .22 + 30 + h * .42} ${y + 6}h6L${x + w * .22 + 36} ${y + h - 6}Z" fill="#fff" fill-opacity=".1"/>`;

const backWall = (): Panel => {
  const holes = WINDOWS.map(([a, b]) => rounded(bx(a), H - CAR.WIN[1], b - a, WIN_H, 14)).join(' ') + ` M${bx(DOOR.x) - DOOR.w / 2} ${H}V${H - DOOR.h}H${bx(DOOR.x) + DOOR.w / 2}V${H}Z`;
  // Panel seams, a kick strip along the bottom, and the window band's darker surround.
  const print = `<rect width="${W}" height="${H}" fill="${SHELL}"/><rect y="${H - 30}" width="${W}" height="30" fill="${SHELL_DARK}"/>`
    + `<rect y="${H - CAR.WIN[1] - 10}" width="${W}" height="${WIN_H + 20}" fill="#dfe5ea"/>`
    + Array.from({ length: 8 }, (_, i) => `<path d="M${(i + 1) * W / 9} 0V${H}" stroke="#b7c0c9" stroke-width="1.2"/>`).join('');
  return { id: 'wall-back', stock: 'cover', c: SHELL, w: W, h: H, o: [-W / 2, 0, BACK], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.6, split: 4, mask: `<path fill-rule="evenodd" d="M0 0H${W}V${H}H0Z ${holes}" fill="#fff"/>`, print };
};

// The cove: the upper wall, leaning in over the benches, where the posters and the light strip sit.
const COVE_IN = 34, COVE_LEN = Math.hypot(CAR.CEIL - H, COVE_IN), coveV: V3 = [0, (CAR.CEIL - H) / COVE_LEN, COVE_IN / COVE_LEN];
const cove = (): Panel => ({ id: 'cove', stock: 'cover', c: SHELL, w: W, h: COVE_LEN, o: [-W / 2, H, BACK], u: [1, 0, 0], v: coveV, edge: 'fold', density: 1.6, split: 4, print: `<rect width="${W}" height="${COVE_LEN}" fill="${SHELL}"/>` });

/* ---------- the car ---------- */
export function train(): Scene {
  reseed(41);
  const back = backWall(), cv = cove();
  const onCove = (x: number, y: number, w: number, h: number, rest: Partial<Panel> & Pick<Panel, 'id' | 'stock' | 'c'>, gap = 1) => on(cv, gap, bx(x), y, w, h, rest);
  // Floor: blue-grey vinyl with fleck, a darker line along the benches, a yellow threshold and arrows at the door.
  const dx = bx(DOOR.x) - DOOR.w / 2;
  // The sheet's top edge lies along the back wall, so the threshold is drawn at the top.
  const fl: Panel = { id: 'floor', stock: 'greyboard', c: FLOOR, w: W, h: D, o: [-W / 2, 0, FRONT], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.5, split: 14,
    print: `<rect width="${W}" height="${D}" fill="${FLOOR}"/>${specks(W, D, '#6f7882', 420, 2.6)}${specks(W, D, '#e3e8ec', 160, 2)}<rect y="64" width="${W}" height="4" fill="#7e8893"/>`
      + `<rect x="${dx}" width="${DOOR.w}" height="14" fill="#c9ced3"/><rect x="${dx}" y="14" width="${DOOR.w}" height="12" fill="${SUN}"/>${Array.from({ length: 13 }, (_, i) => `<circle cx="${dx + 5 + i * 10}" cy="20" r="2.2" fill="#d9952a"/>`).join('')}`
      + `<g fill="${SUN}" fill-opacity=".9">${[-1, 1].map(s => `<path transform="translate(${bx(DOOR.x) + s * 36} 76) scale(${s} -1)" d="M-8 0H8V14H16L0 30L-16 14H-8Z"/>`).join('')}</g>` };
  // The cut: along the near side the car is sawn through, so its underframe shows in section under the floor: the
  // floor slab, the skirt in the line's livery, and the two bogies. The wheels are their own sheets, so they can turn.
  const BOGIES = [-310, 310], sx = (x: number) => x + W / 2 + 4;
  const bogie = (c: number, y = 0) => `<rect x="${c - 96}" y="${y + UNDER - 42}" width="192" height="20" rx="4" fill="#3a4049"/><rect x="${c - 28}" y="${y + UNDER - 50}" width="56" height="18" fill="#2b3037"/><path d="M${c - 22} ${y + UNDER - 41}v12M${c - 11} ${y + UNDER - 41}v12M${c} ${y + UNDER - 41}v12M${c + 11} ${y + UNDER - 41}v12M${c + 22} ${y + UNDER - 41}v12" stroke="#6c737a" stroke-width="3"/><path d="M${c - 96} ${y + UNDER - 32}h14M${c + 82} ${y + UNDER - 32}h14" stroke="${SUN}" stroke-width="5"/>`;
  const section: Panel = { id: 'section', stock: 'greyboard', c: '#2f353d', w: W + 8, h: UNDER, o: [-W / 2 - 4, -UNDER, FRONT + 1.5], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5, split: 10,
    mask: `<path d="M0 0H${W + 8}V30H0Z ${BOGIES.map(b => `M${sx(b) - 104} 28H${sx(b) + 104}V${UNDER - 16}H${sx(b) - 104}Z`).join(' ')}" fill="#fff"/>`,
    print: `<rect width="${W + 8}" height="${UNDER}" fill="#2f353d"/><rect width="${W + 8}" height="6" fill="#7e8893"/><rect y="6" width="${W + 8}" height="4" fill="#1d2228"/><rect y="10" width="${W + 8}" height="20" fill="${SHELL}"/><rect y="16" width="${W + 8}" height="7" fill="${LIVERY}"/><rect y="23" width="${W + 8}" height="3" fill="${DEEP}"/>${BOGIES.map(b => bogie(sx(b))).join('')}` };
  // Seen past the section between the bogies: the equipment boxes slung under the floor.
  const undercar: Panel = { id: 'undercar', stock: 'greyboard', c: '#2b3037', w: W - 40, h: 52, o: [-W / 2 + 20, -52, FRONT - 46], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1, split: 4,
    mask: `<rect width="${W - 40}" height="14" fill="#fff"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${190 + i * 92}" y="10" width="${66 + (i * 29) % 22}" height="${40 - (i % 3) * 6}" rx="3" fill="#fff"/>`).join('')}`,
    print: `<rect width="${W - 40}" height="52" fill="#2b3037"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${190 + i * 92}" y="10" width="${66 + (i * 29) % 22}" height="${40 - (i % 3) * 6}" rx="3" fill="${['#3d444e', '#4a5059', '#353b44'][i % 3]}"/><rect x="${196 + i * 92}" y="18" width="22" height="4" fill="#6c737a"/>`).join('')}` };
  // A wheel: tyre, web and hub, with two lightening holes and a paint mark so its turning shows.
  const WR = 17;
  const wheel = (id: string, x: number): Panel => ({ id, stock: 'greyboard', c: '#23272d', w: WR * 2, h: WR * 2, o: [x - WR, -UNDER, FRONT + 3.5], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3,
    mask: `<circle cx="${WR}" cy="${WR}" r="${WR}" fill="#fff"/>`,
    print: `<circle cx="${WR}" cy="${WR}" r="${WR}" fill="#23272d"/><circle cx="${WR}" cy="${WR}" r="${WR - 4}" fill="#5b636d"/><circle cx="${WR}" cy="${WR - 7.5}" r="3.2" fill="#23272d"/><circle cx="${WR}" cy="${WR + 7.5}" r="3.2" fill="#23272d"/><path d="M${WR + 5} ${WR - 3}H${WR + 12}V${WR + 3}H${WR + 5}Z" fill="${SUN}"/><circle cx="${WR}" cy="${WR}" r="4" fill="#aab2bb"/>`,
    motion: { spin: .34 } });
  const wheels = [...BOGIES.flatMap((b, i) => [wheel(`wheel-${i}a`, b - 58), wheel(`wheel-${i}b`, b + 58)]), wheel('wheel-cab-a', CAB.x + 82), wheel('wheel-cab-b', CAB.x + 198)];

  // A roof line seen side on, the way a 2.5D model shows it: the rounded edge of the roof standing along the top of a
  // shell, with the air-conditioning housings (each [x, width]) rising from it. The camera stands level with the
  // roofs, so this card is what says the car is closed on top.
  const roofCap = (id: string, x0: number, w: number, units: [number, number][]): Panel => ({ id, stock: 'cover', c: '#c9d0d6', w, h: 26, o: [x0, CAB.h, FRONT], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5, split: w > 400 ? Math.ceil(w / 160) : 1,
    mask: `<path d="M0 26V22Q0 18 6 18H${w - 6}Q${w} 18 ${w} 22V26Z" fill="#fff"/>${units.map(([x, uw]) => `<rect x="${x}" width="${uw}" height="20" rx="4" fill="#fff"/>`).join('')}`,
    print: `<rect width="${w}" height="26" fill="#c9d0d6"/><rect y="18" width="${w}" height="8" fill="#b3bcc5"/>${units.map(([x, uw]) => `<g fill="#8a939c">${Array.from({ length: Math.floor((uw - 12) / 12) }, (_, k) => `<rect x="${x + 9 + k * 12}" y="5" width="6" height="9" rx="1.5"/>`).join('')}</g>`).join('')}` });

  // The front of the train: past the right end wall is the driving cab, closed, seen from outside the way a model
  // shows it. A short shell with a nose sloping down to the headlight, a side window onto the desk and the driver,
  // the windscreen, and its own bogie.
  const cab = (): Panel[] => {
    const { x: x0, w: CW, nose: NOSE, h: NH } = CAB, T = NH + UNDER;
    const outline = `M0 ${T}V0H${CW - NOSE}Q${CW - NOSE + 36} 0 ${CW - 44} ${NH - 152}Q${CW} ${NH - 122} ${CW} ${NH - 62}V${NH + 26}H${CW - 26}V${T - 22}H26V${NH + 26}H0Z`;
    // Closed and seen from outside, so its window is glass: a dark pane with the tunnel lamps' glint, nothing behind it.
    const pane = glass(26, NH - CAR.WIN[1], CW - NOSE - 44, WIN_H, 10);
    const shell: Panel = { id: 'cab-shell', stock: 'cover', c: SHELL, w: CW, h: T, o: [x0, -UNDER, FRONT], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5,
      mask: `<path d="${outline}" fill="#fff"/>`,
      print: `<rect width="${CW}" height="${T}" fill="${SHELL}"/><rect width="${CW}" height="26" fill="#d4dbe1"/>${pane}<rect y="${NH - 70}" width="${CW}" height="9" fill="${LIVERY}"/><rect y="${NH - 61}" width="${CW}" height="3" fill="${DEEP}"/>`
        + `<path d="M${CW - NOSE} 3Q${CW - NOSE + 34} 3 ${CW - 46} ${NH - 154}L${CW - 70} ${NH - 162}Q${CW - NOSE + 14} 32 ${CW - NOSE - 8} 32Z" fill="#33404d"/><path d="M${CW - NOSE + 8} 28Q${CW - NOSE + 30} 40 ${CW - 80} ${NH - 176}" stroke="#7d93a6" stroke-width="3" fill="none"/>`
        + `<rect x="${CW - 40}" y="${NH - CAB.light - 9}" width="30" height="18" rx="7" fill="#b7c0c9"/><rect x="${CW - 36}" y="${NH - CAB.light + 14}" width="24" height="10" rx="5" fill="#d8352a"/>`
        + `<rect x="${CW - NOSE - 3}" y="26" width="4" height="${NH - 26}" fill="#9aa4ae"/><rect x="8" y="${NH - 190}" width="5" height="60" rx="2.5" fill="#9aa4ae"/>`
        + `<rect y="${NH}" width="${CW}" height="${UNDER}" fill="#2f353d"/><rect y="${NH}" width="${CW}" height="6" fill="#7e8893"/>${bogie(140, NH)}<path d="M${CW - 30} ${NH + 6}H${CW}V${NH + 34}L${CW - 16} ${NH + 44}H${CW - 30}Z" fill="#5b636d"/>` };
    const frame = on(shell, 1.2, 22, UNDER + CAR.WIN[0] - 4, CW - NOSE - 36, WIN_H + 8, { id: 'cab-wf', stock: 'cover', c: '#aeb8c2', density: 1.6,
      mask: `<path fill-rule="evenodd" d="M0 0H${CW - NOSE - 36}V${WIN_H + 8}H0Z ${rounded(4, 4, CW - NOSE - 44, WIN_H, 10)}" fill="#fff"/>` });
    // The headlight: a lit lens on the nose. Its beam is drawn live by Scene.tsx.
    const lamp = on(shell, 1.6, CW - 37, UNDER + CAB.light - 6, 24, 12, { id: 'cab-headlight', stock: 'vellum', c: '#fff6d8', emit: 3, density: 3, mask: '<rect width="24" height="12" rx="6" fill="#fff"/>' });
    // Its roof, and the roof line seen side on with the radio housing on it.
    const roof: Panel = { id: 'cab-roof', stock: 'cover', c: '#dfe4e8', w: CW - NOSE, h: D, o: [x0, NH, FRONT], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1, print: `<rect width="${CW - NOSE}" height="${D}" fill="#dfe4e8"/><rect x="24" y="${D / 2 - 34}" width="68" height="68" rx="6" fill="#c9d0d6"/><circle cx="58" cy="${D / 2}" r="22" fill="#9aa4ae"/>` };
    const cap = roofCap('cab-cap', x0, CW - NOSE + 6, [[18, 96]]);
    // The sloping windscreen, from the roof edge down the nose: dark glass with a wiper.
    const dx = NOSE - 44, dy = 152, len = Math.hypot(dx, dy);
    const screenTop: Panel = { id: 'cab-windscreen', stock: 'cover', c: '#33404d', w: len, h: D, o: [x0 + CW - NOSE, NH, FRONT], u: [dx / len, -dy / len, 0], v: [0, 0, -1], edge: 'fold', density: 1,
      print: `<rect width="${len}" height="${D}" fill="${SHELL}"/><rect x="8" y="14" width="${len - 18}" height="${D - 28}" rx="12" fill="#33404d"/><rect x="14" y="20" width="${len - 30}" height="${D - 40}" rx="9" fill="#4f6578"/><path d="M${len * .62} ${D / 2}L${len * .2} ${D / 2 - 64}" stroke="${INK}" stroke-width="4"/>` };
    // The nose below the windscreen, front on: where the coupler sits.
    const noseFace: Panel = { id: 'cab-nose', stock: 'cover', c: SHELL_DARK, w: D, h: NH - 62 + 0, o: [x0 + CW, 0, FRONT], u: [0, 0, -1], v: [0, 1, 0], edge: 'fold', density: .9, ghost: true };
    return [shell, frame, lamp, roof, cap, screenTop, noseFace];
  };
  // The car behind, past the left end wall: closed too, the same shell with glass windows, a door, its roof and the
  // bogie at its near end. Between the two cars hangs the gangway bellows.
  const NH = CAB.h, REAR = { w: 560, x: -W / 2 - 34 - 560 };
  const rearCar = (): Panel[] => {
    const { w: NW, x: x0 } = REAR, T = NH + UNDER, bog = NW - 150;
    const shell: Panel = { id: 'rear-shell', stock: 'cover', c: SHELL, w: NW, h: T, o: [x0, -UNDER, FRONT], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.3, split: 7,
      mask: `<path d="M0 0H${NW}V${NH + 26}H${bog + 104}V${T - 16}H${bog - 104}V${NH + 26}H0Z" fill="#fff"/>`,
      print: `<rect width="${NW}" height="${T}" fill="${SHELL}"/><rect width="${NW}" height="26" fill="#d4dbe1"/>${glass(40, NH - CAR.WIN[1], 170, WIN_H, 12)}${glass(396, NH - CAR.WIN[1], 140, WIN_H, 12)}`
        + `<rect x="238" y="${NH - 212}" width="130" height="212" fill="#d6dde3"/><rect x="232" y="${NH - 218}" width="142" height="8" fill="#9aa4ae"/><rect x="302" y="${NH - 212}" width="2" height="212" fill="${INK}"/>${glass(248, NH - 196, 46, 100, 7)}${glass(312, NH - 196, 46, 100, 7)}<rect x="238" y="${NH - 64}" width="130" height="8" fill="${SUN}"/>`
        + `<rect y="${NH - 70}" width="232" height="9" fill="${LIVERY}"/><rect y="${NH - 61}" width="232" height="3" fill="${DEEP}"/><rect x="374" y="${NH - 70}" width="${NW - 374}" height="9" fill="${LIVERY}"/><rect x="374" y="${NH - 61}" width="${NW - 374}" height="3" fill="${DEEP}"/>`
        + Array.from({ length: 4 }, (_, k) => `<path d="M${(k + 1) * NW / 5} 26V${NH}" stroke="#c3cad1" stroke-width="1.2"/>`).join('')
        + `<rect y="${NH}" width="${NW}" height="${UNDER}" fill="#2f353d"/><rect y="${NH}" width="${NW}" height="6" fill="#7e8893"/>${bogie(bog, NH)}` };
    const roof: Panel = { id: 'rear-roof', stock: 'cover', c: '#dfe4e8', w: NW, h: D, o: [x0, NH, FRONT], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1, split: 2,
      print: `<rect width="${NW}" height="${D}" fill="#dfe4e8"/>${Array.from({ length: 5 }, (_, k) => `<path d="M${(k + 1) * NW / 6} 0V${D}" stroke="#c3cad1" stroke-width="1.4"/>`).join('')}` };
    const cap = roofCap('rear-cap', x0, NW, [[60, 190], [NW - 290, 200]]);
    const bellows: Panel = { id: 'bellows', stock: 'greyboard', c: '#2b3037', w: 38, h: NH + 8, o: [-W / 2 - 36, -14, FRONT - 6], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4, print: `<rect width="38" height="${NH + 8}" fill="#2b3037"/>${Array.from({ length: 6 }, (_, k) => `<rect x="${3 + k * 6}" width="3" height="${NH + 8}" fill="#4a5059"/>`).join('')}` };
    return [shell, roof, cap, bellows, wheel('wheel-rear-a', x0 + bog - 58), wheel('wheel-rear-b', x0 + bog + 58)];
  };
  // Our own car is cut open along its near side, but it has its roof: it shows in section over the cove, and on it
  // the air-conditioning housings, so the three pieces of the train stand at one height.
  const ROOF_Z = BACK + COVE_IN;
  const roofCut: Panel = { id: 'roof-cut', stock: 'greyboard', c: '#9aa4ae', w: W, h: NH - CAR.CEIL, o: [-W / 2, CAR.CEIL, ROOF_Z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.5, split: 4,
    print: `<rect width="${W}" height="${NH - CAR.CEIL}" fill="#aab3bc"/><rect width="${W}" height="5" fill="#dfe4e8"/><rect y="8" width="${W}" height="9" fill="#c3b79c"/><rect y="${NH - CAR.CEIL - 6}" width="${W}" height="6" fill="#f4f6f8"/>${Array.from({ length: Math.floor(W / 50) }, (_, k) => `<rect x="${k * 50 + 20}" y="5" width="4" height="${NH - CAR.CEIL - 11}" fill="#8a939c"/>`).join('')}` };
  const roofTop: Panel = { id: 'roof-top', stock: 'cover', c: '#dfe4e8', w: W, h: COVE_IN + 8, o: [-W / 2, NH, ROOF_Z], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.1, split: 4, print: `<rect width="${W}" height="${COVE_IN + 8}" fill="#dfe4e8"/>${Array.from({ length: 8 }, (_, k) => `<path d="M${(k + 1) * W / 9} 0V${COVE_IN + 8}" stroke="#c3cad1" stroke-width="1.4"/>`).join('')}` };
  const ownCap = { ...roofCap('roof-cap', -W / 2, W, [[W / 2 - 345, 190], [W / 2 + 155, 190]]), o: [-W / 2, NH, ROOF_Z] as V3 };
  const ownRoof = [roofCut, roofTop, ownCap];

  // The ceiling, facing down: plain panels and two recessed grilles. The light strip sits where it meets the cove.
  const CEIL_D = D - COVE_IN;
  const ceiling: Panel = { id: 'ceiling', stock: 'cover', c: '#f1f4f6', w: W, h: CEIL_D, o: [-W / 2, CAR.CEIL, BACK + COVE_IN], u: [1, 0, 0], v: [0, 0, 1], edge: 'fold', density: 1, split: 4,
    print: `<rect width="${W}" height="${CEIL_D}" fill="#f1f4f6"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${(i + 1) * W / 11} 0V${CEIL_D}" stroke="#cfd6dd" stroke-width="1.4"/>`).join('')}`
      + [-262, 262].map(x => `<rect x="${bx(x) - 80}" y="${CEIL_D / 2 - 26}" width="160" height="52" rx="6" fill="#dfe5ea"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${bx(x) - 70 + i * 12}" y="${CEIL_D / 2 - 18}" width="5" height="36" rx="2" fill="#9aa4ae"/>`).join('')}`).join('') };
  const strip = onCove(-W / 2 + 20, COVE_LEN - 9, W - 40, 7, { id: 'light-strip', stock: 'vellum', c: '#fffbea', emit: 2.4, density: 1.4 });

  // Window and door frames, flat on the back wall.
  const winFrames = WINDOWS.map(([a, b], i) => on(back, 1.4, bx(a) - 6, CAR.WIN[0] - 6, b - a + 12, WIN_H + 12, { id: `win-frame-${i}`, stock: 'cover', c: '#aeb8c2', density: 1.6,
    mask: `<path fill-rule="evenodd" d="M0 0H${b - a + 12}V${WIN_H + 12}H0Z ${rounded(6, 6, b - a, WIN_H, 14)}" fill="#fff"/>` }));
  const doorFrame = on(back, 1.4, bx(DOOR.x) - DOOR.w / 2 - 8, 0, DOOR.w + 16, DOOR.h, { id: 'door-frame', stock: 'cover', c: '#aeb8c2', density: 1.6,
    mask: `<path fill-rule="evenodd" d="M0 0H${DOOR.w + 16}V${DOOR.h}H0Z M8 ${DOOR.h}V0H${DOOR.w + 8}V${DOOR.h}Z" fill="#fff"/>` });
  // The door: two leaves with tall windows onto the tunnel. They slide apart when the train reaches the chosen stop.
  const leaves = ([-1, 1] as const).map((s): Panel => {
    const lw = DOOR.w / 2, ox = s < 0 ? DOOR.x - lw : DOOR.x;
    return { id: `door-${s < 0 ? 'l' : 'r'}`, stock: 'cover', c: '#d6dde3', w: lw, h: DOOR.h, o: [ox, 0, BACK + 2.5], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2,
      mask: `<path fill-rule="evenodd" d="M0 0H${lw}V${DOOR.h}H0Z ${rounded(s < 0 ? 12 : 9, 22, lw - 21, DOOR.h - 110, 8)}" fill="#fff"/>`,
      print: `<rect width="${lw}" height="${DOOR.h}" fill="#d6dde3"/><rect x="${s < 0 ? lw - 4 : 0}" width="4" height="${DOOR.h}" fill="#1d2228"/><rect y="${DOOR.h - 66}" width="${lw}" height="10" fill="${SUN}"/><rect x="${s < 0 ? 12 : 9}" y="${DOOR.h - 40}" width="${lw - 21}" height="22" rx="3" fill="#c3ccd4"/>`,
      motion: { toy: 'doors', at: [1], slide: [s * (lw - 6), 0, 0] } };
  });
  // Relief on the back wall: sills and lips at the windows, jambs at the door, and the dark casing of the destination
  // sign over it, with a speaker grille at each end.
  const wallTrim = carved(back, [
    ...WINDOWS.flatMap(([a, b], i) => [
      ...box({ id: `win-sill-${i}`, x: (a + b) / 2, z: BACK + 8, y: CAR.WIN[0] - 12, w: b - a + 16, h: 12, d: 16, stock: 'cover', c: TRIM, front: `<rect width="${b - a + 16}" height="12" fill="${TRIM}"/><rect width="${b - a + 16}" height="2" fill="#fff" fill-opacity=".6"/>` }),
      ...box({ id: `win-lip-${i}`, x: (a + b) / 2, z: BACK + 5, y: CAR.WIN[1], w: b - a + 16, h: 8, d: 10, stock: 'cover', c: TRIM })
    ]),
    ...[-1, 1].flatMap(s => box({ id: `door-jamb-${s}`, x: DOOR.x + s * (DOOR.w / 2 + 8), z: BACK + 7, w: 14, h: DOOR.h, d: 14, stock: 'cover', c: TRIM, front: `<rect width="14" height="${DOOR.h}" fill="${TRIM}"/><rect x="5" y="40" width="4" height="${DOOR.h - 80}" fill="#9aa4ae"/>` })),
    ...box({ id: 'sign-case', x: DOOR.x, z: BACK + 7, y: SIGN.y - 4, w: SIGN.w + 12, h: SIGN.h + 6, d: 14, stock: 'cover', c: '#23282e',
      front: `<rect width="${SIGN.w + 12}" height="${SIGN.h + 6}" rx="5" fill="#23282e"/><rect x="6" y="2" width="${SIGN.w}" height="${SIGN.h}" rx="3" fill="#0d0f12"/>` }),
    ...box({ id: 'intercom', x: -438, z: BACK + 6, y: 126, w: 44, h: 64, d: 12, stock: 'cover', c: SUN,
      front: `<rect width="44" height="64" rx="4" fill="${SUN}"/><rect x="6" y="6" width="32" height="10" rx="2" fill="${INK}"/><g fill="${INK}">${Array.from({ length: 12 }, (_, i) => `<circle cx="${12 + (i % 4) * 7}" cy="${24 + Math.floor(i / 4) * 6}" r="1.6"/>`).join('')}</g><circle cx="22" cy="51" r="7" fill="${CORAL}"/><circle cx="22" cy="51" r="3.4" fill="#ff8a64"/>` }),
    ...box({ id: 'extinguisher', x: 438, z: BACK + 12, y: 44, w: 22, h: 64, d: 22, stock: 'cover', c: CORAL, front: `<rect width="22" height="64" rx="5" fill="${CORAL}"/><rect y="20" width="22" height="22" fill="${CREAM}"/><rect x="5" y="27" width="12" height="3" fill="${INK}"/><rect x="7" width="8" height="6" fill="${INK}"/>` })
  ]);
  const helpSign = on(back, 1.2, bx(-438) - 20, 198, 40, 40, { id: 'help-sign', stock: 'bond', c: '#fff', density: 3, print: `<rect width="40" height="40" rx="5" fill="${DEEP}"/><path d="M10 14Q10 8 20 8Q30 8 30 14V22Q30 27 24 27L18 33V27H16Q10 27 10 22Z" fill="#fff"/><g fill="${DEEP}"><circle cx="15" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><circle cx="25" cy="18" r="2"/></g>` });
  const priority = on(back, 1.2, bx(-400), 222, 22, 22, { id: 'priority-sign', stock: 'bond', c: '#fff', density: 3, print: `<rect width="22" height="22" rx="3" fill="${DEEP}"/><circle cx="11" cy="6" r="2.4" fill="#fff"/><path d="M8 10H14L13 17H9Z" fill="#fff"/>` });

  // Posters along the cove, in a common frame: the hello poster to the left of the door, the line map to its right.
  const adFrame = (id: string, x: number, w: number, print: string, c = CREAM) => [
    onCove(x - 4, 8, w + 8, COVE_LEN - 24, { id: `${id}-frame`, stock: 'cover', c: '#aeb8c2', density: 1.6 }),
    onCove(x, 12, w, COVE_LEN - 32, { id, stock: 'bond', c, density: 2.6, print }, 2)
  ];
  const AD_H = COVE_LEN - 32;
  const hello = adFrame('ad-hello', -380, 240, `<rect width="240" height="${AD_H}" fill="${SUN}"/><circle cx="34" cy="${AD_H / 2}" r="22" fill="${CREAM}"/><circle cx="34" cy="${AD_H / 2 - 3}" r="9" fill="#f3cfab"/><path d="M23 ${AD_H / 2 - 5}Q24 ${AD_H / 2 - 17} 34 ${AD_H / 2 - 17}Q44 ${AD_H / 2 - 17} 45 ${AD_H / 2 - 6}Q38 ${AD_H / 2 - 10} 30 ${AD_H / 2 - 9}Z" fill="#1b1e24"/><path d="M20 ${AD_H / 2 + 19}Q20 ${AD_H / 2 + 8} 34 ${AD_H / 2 + 8}Q48 ${AD_H / 2 + 8} 48 ${AD_H / 2 + 19}Z" fill="#2f3e5c"/><text x="68" y="${AD_H / 2 - 1}" font-family="Fredoka" font-weight="600" font-size="19" fill="${INK}">Hey there!</text><rect x="68" y="${AD_H / 2 + 8}" width="130" height="6" rx="3" fill="${INK}" fill-opacity=".55"/><rect x="68" y="${AD_H / 2 + 19}" width="92" height="6" rx="3" fill="${INK}" fill-opacity=".35"/>`);
  // The line map: one line, the two named stops and the train between them. A lamp lights the stop the sign shows.
  const LM = { x: 140, w: 270 }, stationX = (k: number) => 72 + k * 126, lineY = AD_H / 2 - 2;
  const lineMap = adFrame('line-map', LM.x, LM.w, `<rect width="${LM.w}" height="${AD_H}" fill="#fbf7ee"/><rect width="${LM.w}" height="10" fill="${DEEP}"/><path d="M18 ${lineY}H${LM.w - 18}" stroke="${CORAL}" stroke-width="7" stroke-linecap="round"/>`
    + STATIONS.map((s, k) => `<circle cx="${stationX(k)}" cy="${lineY}" r="8" fill="#fff" stroke="${INK}" stroke-width="2.4"/><text x="${stationX(k)}" y="${lineY + 24}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="12" fill="${INK}">${s.name}</text>`).join('')
    + `<g transform="translate(${(stationX(0) + stationX(1)) / 2 - 15} ${lineY - 9})"><rect width="30" height="18" rx="5" fill="${INK}"/><rect x="4" y="4" width="9" height="7" rx="1.5" fill="#bfe6f8"/><rect x="17" y="4" width="9" height="7" rx="1.5" fill="#bfe6f8"/></g>`);
  const lamps = STATIONS.map((s, k): Panel => ({ ...onCove(LM.x + stationX(k) - 6, 12 + AD_H - lineY - 6, 12, 12, { id: `map-lamp-${k}`, stock: 'cover', c: s.c, density: 4, emit: .6, mask: '<circle cx="6" cy="6" r="6" fill="#fff"/>', print: `<circle cx="6" cy="6" r="6" fill="${s.c}"/><circle cx="6" cy="6" r="2.4" fill="#fff"/>` }, 2.8), decal: undefined, show: { toy: 'line', at: [k] } }));
  const coveTrim = carved(cv, [-90, 90].flatMap((x, i) => box({ id: `speaker-${i}`, x, z: BACK + 14 + 4, y: H + 26, w: 48, h: 14, d: 6, stock: 'cover', c: TRIM, front: `<rect width="48" height="14" rx="3" fill="${TRIM}"/>${Array.from({ length: 7 }, (_, k) => `<rect x="${5 + k * 6}" y="4" width="3" height="6" rx="1" fill="${STEEL}"/>`).join('')}` })));

  // Long benches under the windows, carved onto the back wall: seat box with a cushion line, backrest panel.
  const bench = (id: string, x0: number, x1: number, c: string): Panel[] => carved(back, [
    ...box({ id: `${id}-seat`, x: (x0 + x1) / 2, z: BACK + 30, w: x1 - x0, h: CAR.SEAT, d: 56, stock: 'cover', c: '#b7c0c9', front: `<rect width="${x1 - x0}" height="12" fill="${c}"/><rect y="12" width="${x1 - x0}" height="3" fill="#000" fill-opacity=".18"/>${Array.from({ length: Math.round((x1 - x0) / 60) }, (_, i) => `<path d="M${(i + 1) * 60} 0V12" stroke="#000" stroke-opacity=".2" stroke-width="1.6"/>`).join('')}`, top: `<rect width="${x1 - x0}" height="56" fill="${c}"/>${Array.from({ length: Math.round((x1 - x0) / 60) }, (_, i) => `<path d="M${(i + 1) * 60} 0V56" stroke="#000" stroke-opacity=".2" stroke-width="2"/>`).join('')}` }),
    { id: `${id}-backrest`, stock: 'cover', c, w: x1 - x0, h: 58, o: [x0, CAR.SEAT, BACK + 6], u: [1, 0, 0], v: [0, .97, -.24], edge: 'fold', print: `<rect width="${x1 - x0}" height="58" fill="${c}"/>${Array.from({ length: Math.round((x1 - x0) / 60) }, (_, i) => `<path d="M${(i + 1) * 60} 0V58" stroke="#000" stroke-opacity=".2" stroke-width="2"/>`).join('')}` }
  ]);
  const benches = [...bench('bench-l', -410, -300, SEAT_PRIORITY), ...bench('bench-lm', -300, -112, SEAT), ...bench('bench-r', 112, 410, SEAT)];

  // Grab poles at the door, floor to ceiling, and the overhead rail on its hangers. Each a strip of card.
  const RAIL_Y = 232, RAIL_Z = -64;
  const pole = (id: string, x: number): Panel => ({ id, stock: 'greyboard', c: POLE, w: 8, h: CAR.CEIL, o: [x - 4, 0, RAIL_Z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 2, print: `<rect width="8" height="${CAR.CEIL}" fill="${POLE}"/><rect x="1.5" width="2" height="${CAR.CEIL}" fill="#fff" fill-opacity=".6"/>` });
  const poles = [pole('pole-a', -108), pole('pole-b', 108)];
  const rail = (id: string, x0: number, x1: number): Panel => {
    const rw = x1 - x0, rh = CAR.CEIL - RAIL_Y, hangers = [4, rw - 4];
    return { id, stock: 'cover', c: POLE, w: rw, h: rh, o: [x0, RAIL_Y, RAIL_Z], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.2, split: 2,
      mask: `<rect y="${rh - 7}" width="${rw}" height="7" rx="3" fill="#fff"/>${hangers.map(x => `<rect x="${x - 2.5}" width="5" height="${rh}" fill="#fff"/>`).join('')}`,
      print: `<rect width="${rw}" height="${rh}" fill="${POLE}"/><rect y="${rh - 6}" width="${rw}" height="2" fill="#fff" fill-opacity=".6"/>` };
  };
  // Hand straps hang from the rail and swing with the car: each is its own small sheet.
  const SL = 62;
  const strap = (x: number, i: number): Panel => {
    const pri = x < -300, band = pri ? '#c9861f' : '#5d6670';
    return { id: `strap-${i}`, stock: 'cover', c: pri ? SUN : '#f4f6f8', w: 20, h: SL, o: [x - 10, RAIL_Y + 4 - SL, RAIL_Z + 1.5], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3,
      mask: `<path fill-rule="evenodd" d="M7 0H13V${SL - 34}H7Z M5 ${SL - 36}H15V${SL - 26}H5Z M10 ${SL - 28}L20 ${SL - 12}Q20 ${SL} 10 ${SL}Q0 ${SL} 0 ${SL - 12}Z M10 ${SL - 21}L5 ${SL - 12}Q5 ${SL - 5} 10 ${SL - 5}Q15 ${SL - 5} 15 ${SL - 12}Z" fill="#fff"/>`,
      print: `<rect width="20" height="${SL}" fill="${pri ? SUN : '#f4f6f8'}"/><rect x="7" width="6" height="${SL - 34}" fill="${band}"/><rect x="5" y="${SL - 36}" width="10" height="10" fill="${band}"/>`,
      motion: { swing: 5 } };
  };
  const straps = [-385, -330, -270, -215, -165, 165, 215, 270, 330, 385].map(strap);

  // End walls: on the left the gangway door into the next car, its window dark; on the right the door to the driving cab.
  const WALL_H = CAR.CEIL;
  const endWall = (side: 1 | -1, id: string): Panel => {
    const gw = 96, gx = D / 2 - gw / 2, t = WALL_H - 212;
    return { id, stock: 'cover', c: SHELL, w: D, h: WALL_H, o: side < 0 ? [-W / 2, 0, FRONT] : [W / 2, 0, BACK], u: side < 0 ? [0, 0, -1] : [0, 0, 1], v: [0, 1, 0], edge: 'fold', density: 1.4,
      print: `<rect width="${D}" height="${WALL_H}" fill="${SHELL}"/><rect y="${WALL_H - 30}" width="${D}" height="30" fill="${SHELL_DARK}"/><rect x="${gx - 9}" y="${t - 8}" width="${gw + 18}" height="220" fill="#aeb8c2"/><rect x="${gx}" y="${t}" width="${gw}" height="212" fill="#d6dde3"/>`
        + `<rect x="${gx + 14}" y="${t + 16}" width="${gw - 28}" height="100" rx="8" fill="#33404d"/><rect x="${gx + 18}" y="${t + 20}" width="${gw - 36}" height="92" rx="5" fill="${GLASS}"/><path d="M${gx + 24} ${t + 96}L${gx + 44} ${t + 26}H${gx + 54}L${gx + 34} ${t + 96}Z" fill="#fff" fill-opacity=".07"/>`
        + `<rect x="${side < 0 ? gx + gw - 16 : gx + 10}" y="${t + 122}" width="6" height="24" rx="3" fill="#5b636d"/><rect x="${gx}" y="${t + 156}" width="${gw}" height="8" fill="${SUN}"/>`
        + `<rect x="${gx + gw / 2 - 26}" y="${t - 44}" width="52" height="22" rx="4" fill="${DEEP}"/><path d="M${gx + gw / 2 - 12} ${t - 33}H${gx + gw / 2 + 8}M${gx + gw / 2 + 3} ${t - 39}L${gx + gw / 2 + 10} ${t - 33}L${gx + gw / 2 + 3} ${t - 27}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="${side < 0 ? `translate(${2 * (gx + gw / 2)} 0) scale(-1 1)` : ''}"/>` };
  };

  /* ---------- passengers: a commuting crowd in the street's own cut, each with their own face ---------- */
  // Sitting: the figure stands at the bench's front edge, lifted so the hips meet the cushion and the feet hang.
  const sit = (id: string, x: number, look: Look, flip = false, k = 1) => { const leg = look.build === 'big' ? 29 : look.build === 'average' ? 27 : 20; return shopper(id, x, BACK + 60, { ...look, lift: CAR.SEAT - leg * k + 5 }, flip, k, 0, false); };
  const people: Panel[] = [
    ...sit('p-mum', -382, { coat: CORAL, legs: '#3f5f7a', skin: '#f3c9a0', hair: '#4a2c1a', style: 'dress', face: 'cheerful' }),
    ...sit('p-kid', -334, { coat: SUN, legs: '#3f5f7a', skin: '#f3c9a0', hair: '#4a2c1a', style: 'shorts', hat: BLUE, face: 'surprised' }, true, .72),
    ...sit('p-sleeper', -252, { coat: '#e9ebee', legs: '#2e3440', skin: '#c99a7a', hair: '#2b2622', build: 'average', face: 'sleepy' }),
    ...sit('p-student', -164, { coat: MINT, legs: '#22324a', skin: '#a8714f', hair: '#1d1a17', style: 'shorts', pack: CORAL, face: 'cool' }, true),
    ...sit('p-grandpa', 176, { coat: '#c88a5a', legs: '#6b5a4a', skin: '#f3c9a0', hair: '#c9ccd1', hat: '#6b5a4a', face: 'grumpy', tache: '#c9ccd1' }),
    ...sit('p-office', 290, { coat: PLUM, legs: '#2e3440', skin: '#c99a7a', hair: '#8a5a3a', style: 'dress', build: 'average', face: 'determined' }, true),
    ...sit('p-big', 372, { coat: '#2bb5b8', legs: '#22324a', skin: '#a8714f', hair: '#1d1a17', build: 'big', face: 'cheerful' }),
    ...shopper('p-strap', 436, -62, { coat: '#3f5f7a', legs: '#2e3440', skin: '#f3c9a0', hair: '#2b2622', carry: KRAFT, build: 'average', face: 'sleepy' }, false),
    ...shopper('p-pole', 232, -74, { coat: '#e88ab0', legs: '#f4f1ea', skin: '#f3c9a0', hair: '#1d1a17', style: 'dress', carry: BLUE, hat: '#f4e3c3', face: 'cheerful' }, true)
  ];
  // Props that tell the commute: a suitcase by the priority seats and a shopping bag at a foot.
  const suitcase = box({ id: 'suitcase', x: -444, z: BACK + 96, w: 40, h: 58, d: 26, rot: 10, stock: 'cover', c: '#2f6f9f', front: `<rect x="6" y="6" width="28" height="46" rx="4" fill="none" stroke="#1f4d70" stroke-width="2"/><rect x="16" y="2" width="8" height="4" fill="${INK}"/>`, top: `<rect x="14" y="8" width="12" height="10" rx="3" fill="none" stroke="${INK}" stroke-width="2.4"/>` }).filter(p => !/rear|under|left/.test(p.id));
  const bag: Panel = { id: 'shop-bag', stock: 'kraft', c: KRAFT, w: 30, h: 38, o: [196, 0, BACK + 78], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3, mask: '<path d="M0 38V10H8Q8 0 15 0Q22 0 22 10H30V38Z M11 10Q11 4 15 4Q19 4 19 10Z" fill="#fff" fill-rule="evenodd"/>', print: `<rect width="30" height="38" fill="${KRAFT}"/><rect y="20" width="30" height="8" fill="${BLUE}"/>` };

  const panels: Panel[] = [fl, section, undercar, ...wheels, ...cab(), ...rearCar(), ...ownRoof, back, cv, ceiling, endWall(-1, 'wall-left'), endWall(1, 'wall-right'), strip,
    ...winFrames, doorFrame, ...leaves, ...wallTrim, helpSign, priority, ...hello, ...lineMap, ...lamps, ...coveTrim,
    ...benches, ...poles, rail('rail-l', -420, -130), rail('rail-r', 130, 420), ...straps, ...people, ...suitcase, bag];
  return {
    id: 'train', camera: { zoom: 1.12, x0: -320, x1: 480 }, panels,
    // No sun underground: the car is lit by its own ceiling strips, with a little fill through the cut.
    light: { sun: .5, sky: .5, skyColor: [1, .97, .92] },
    lamps: [-370, -185, 0, 185, 370].flatMap(x => [{ at: [x, CAR.CEIL - 14, -80] as V3, color: [1, .98, .92] as const, energy: 30 }, { at: [x, CAR.CEIL - 14, 70] as V3, color: [1, .98, .92] as const, energy: 22 }])
  };
}
