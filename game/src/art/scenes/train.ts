import { add, box, carved, on, slot, yaw, type Panel, type Scene, type V3 } from '../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, reseed, specks } from '../recipes.ts';

// The home space: one MRT car on an elevated line, cut open along its near side like a cutaway model.
// The car runs along x. Its far side (the back wall) carries the doors, windows and the long benches;
// the two ends are the gangways to the neighbouring cars. Everything outside moves past (src/art/Outside.tsx).
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
  return { id: 'wall-back', stock: 'cover', c: SHELL, w: W, h: H, o: [-W / 2, 0, BACK], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4, split: 2, mask: `<path fill-rule="evenodd" d="M0 0H${W}V${H}H0Z ${holes}" fill="#fff"/>`, print };
};

// The cove: the curved upper wall, leaning in over the benches, where the ad frames and the light strip sit.
const COVE_IN = 34, COVE_LEN = Math.hypot(CAR.COVE - H, COVE_IN), coveV: V3 = [0, (CAR.COVE - H) / COVE_LEN, COVE_IN / COVE_LEN];
const cove = (): Panel => ({ id: 'cove', stock: 'cover', c: SHELL, w: W, h: COVE_LEN, o: [-W / 2, H, BACK], u: [1, 0, 0], v: coveV, edge: 'fold', density: 1.4, split: 2, print: `<rect width="${W}" height="${COVE_LEN}" fill="${SHELL}"/>` });
const onCove = (x: number, y: number, w: number, h: number, rest: Partial<Panel> & Pick<Panel, 'id' | 'stock' | 'c'>) => on(cove(), 1, bx(x), y, w, h, rest);

/* ---------- people: one cut figure, seated or standing, recoloured and given small props ---------- */
type Look = { skin: string; hair: string; top: string; legs: string; shoes?: string; hairStyle?: 'short' | 'long' | 'bun' | 'cap' | 'grey'; capC?: string };
const SKIN = ['#f3c9a0', '#d9a77e', '#b07a52', '#f6d5b8'];
const hairPath = (cx: number, top: number, style: Look['hairStyle'], c: string, capC = CORAL) => {
  const r = 12, cy = top + r;
  if (style === 'long') return `<path d="M${cx - r - 1} ${cy + 16}V${cy}Q${cx - r} ${top - 1} ${cx} ${top - 1}Q${cx + r} ${top - 1} ${cx + r + 1} ${cy}V${cy + 16}H${cx + r - 4}V${cy - 2}Q${cx} ${cy - 6} ${cx - r + 4} ${cy - 2}V${cy + 16}Z" fill="${c}"/>`;
  if (style === 'bun') return `<circle cx="${cx}" cy="${top - 3}" r="6" fill="${c}"/><path d="M${cx - r} ${cy}Q${cx - r} ${top - 1} ${cx} ${top - 1}Q${cx + r} ${top - 1} ${cx + r} ${cy}Q${cx} ${cy - 7} ${cx - r} ${cy}Z" fill="${c}"/>`;
  if (style === 'cap') return `<path d="M${cx - r} ${cy - 1}Q${cx - r} ${top - 2} ${cx} ${top - 2}Q${cx + r} ${top - 2} ${cx + r} ${cy - 1}Z" fill="${capC}"/><rect x="${cx - r - 2}" y="${cy - 3}" width="${2 * r + 4}" height="4" rx="2" fill="${capC}"/>`;
  return `<path d="M${cx - r} ${cy + 1}Q${cx - r} ${top - 1} ${cx} ${top - 1}Q${cx + r} ${top - 1} ${cx + r} ${cy + 1}Q${cx + 3} ${cy - 6} ${cx - r} ${cy + 1}Z" fill="${c}"/>`;
};
const face = (cx: number, cy: number, closed = false, glasses = false) => (closed
  ? `<path d="M${cx - 6} ${cy}q2 2 4 0M${cx + 2} ${cy}q2 2 4 0" stroke="${INK}" stroke-width="1.2" fill="none"/>`
  : `<circle cx="${cx - 4}" cy="${cy}" r="1.5" fill="${INK}"/><circle cx="${cx + 4}" cy="${cy}" r="1.5" fill="${INK}"/>`)
  + (glasses ? `<g fill="none" stroke="${INK}" stroke-width="1"><rect x="${cx - 8}" y="${cy - 3}" width="7" height="6" rx="2"/><rect x="${cx + 1}" y="${cy - 3}" width="7" height="6" rx="2"/></g>` : '')
  + `<path d="M${cx - 3} ${cy + 6}q3 2 6 0" stroke="#a5674a" stroke-width="1.1" fill="none"/>`;

// Seated, facing the camera: head, torso, a short lap band, shins to the floor. 56 wide, 128 tall from the floor.
function seated(id: string, x: number, look: Look, extra: { print?: string; mask?: string; closed?: boolean; glasses?: boolean; tilt?: number } = {}): Panel {
  const w = 60, h = 130, cx = 30, top = 4;
  const mask = `<circle cx="${cx}" cy="${top + 12}" r="12.5" fill="#fff"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="#fff"/>`
    + `<path d="M${cx - 21} ${top + 36}Q${cx - 21} ${top + 28} ${cx - 12} ${top + 28}H${cx + 12}Q${cx + 21} ${top + 28} ${cx + 21} ${top + 36}V${top + 82}H${cx - 21}Z" fill="#fff"/>`
    + `<rect x="${cx - 22}" y="${top + 76}" width="44" height="16" rx="5" fill="#fff"/><rect x="${cx - 17}" y="${top + 90}" width="13" height="${h - top - 98}" fill="#fff"/><rect x="${cx + 4}" y="${top + 90}" width="13" height="${h - top - 98}" fill="#fff"/>`
    + `<rect x="${cx - 21}" y="${h - 9}" width="18" height="9" rx="3" fill="#fff"/><rect x="${cx + 3}" y="${h - 9}" width="18" height="9" rx="3" fill="#fff"/>` + (extra.mask ?? '');
  const print = `<rect width="${w}" height="${h}" fill="${look.top}"/><circle cx="${cx}" cy="${top + 12}" r="12.5" fill="${look.skin}"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="${look.skin}"/>`
    + hairPath(cx, top, look.hairStyle, look.hair, look.capC) + face(cx, top + 14, extra.closed, extra.glasses)
    + `<path d="M${cx - 21} ${top + 40}V${top + 78}M${cx + 21} ${top + 40}V${top + 78}" stroke="#000" stroke-opacity=".14" stroke-width="5"/>`
    + `<rect x="${cx - 22}" y="${top + 76}" width="44" height="16" rx="5" fill="${look.legs}"/><rect x="${cx - 17}" y="${top + 90}" width="13" height="${h - top - 98}" fill="${look.legs}"/><rect x="${cx + 4}" y="${top + 90}" width="13" height="${h - top - 98}" fill="${look.legs}"/>`
    + `<rect x="${cx - 22}" y="${h - 9}" width="20" height="9" rx="3" fill="${look.shoes ?? INK}"/><rect x="${cx + 2}" y="${h - 9}" width="20" height="9" rx="3" fill="${look.shoes ?? INK}"/>` + (extra.print ?? '');
  const r = yaw(extra.tilt ?? 0);
  return { id, stock: 'cover', c: look.top, w, h, o: add([x, 0, BACK + 64], r([-w / 2, 0, 0])), u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2.4, mask, print };
}
// Standing: 54 wide, 164 tall. `arm` raises one hand to a strap or pole above the head.
function standing(id: string, x: number, z: number, look: Look, extra: { print?: string; mask?: string; arm?: 'left' | 'right'; rot?: number; scale?: number } = {}): Panel {
  const k = extra.scale ?? 1, w = 64, h = 168, cx = 32, top = 22;
  const armL = extra.arm === 'left', armR = extra.arm === 'right';
  const mask = `<circle cx="${cx}" cy="${top + 12}" r="12.5" fill="#fff"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="#fff"/>`
    + `<path d="M${cx - 20} ${top + 38}Q${cx - 20} ${top + 28} ${cx - 11} ${top + 28}H${cx + 11}Q${cx + 20} ${top + 28} ${cx + 20} ${top + 38}V${top + 92}H${cx - 20}Z" fill="#fff"/>`
    + `<rect x="${cx - 17}" y="${top + 88}" width="15" height="${h - top - 96}" fill="#fff"/><rect x="${cx + 2}" y="${top + 88}" width="15" height="${h - top - 96}" fill="#fff"/>`
    + `<rect x="${cx - 21}" y="${h - 9}" width="19" height="9" rx="3" fill="#fff"/><rect x="${cx + 2}" y="${h - 9}" width="19" height="9" rx="3" fill="#fff"/>`
    + (armL ? `<path d="M${cx - 20} ${top + 40}L${cx - 26} ${top - 8}L${cx - 18} ${top - 22}L${cx - 12} ${top - 8}L${cx - 12} ${top + 34}Z" fill="#fff"/>` : '')
    + (armR ? `<path d="M${cx + 20} ${top + 40}L${cx + 26} ${top - 8}L${cx + 18} ${top - 22}L${cx + 12} ${top - 8}L${cx + 12} ${top + 34}Z" fill="#fff"/>` : '') + (extra.mask ?? '');
  const print = `<rect width="${w}" height="${h}" fill="${look.top}"/><circle cx="${cx}" cy="${top + 12}" r="12.5" fill="${look.skin}"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="${look.skin}"/>`
    + hairPath(cx, top, look.hairStyle, look.hair, look.capC) + face(cx, top + 14)
    + (armL ? `<path d="M${cx - 20} ${top + 38}L${cx - 25} ${top - 4}L${cx - 13} ${top - 4}L${cx - 12} ${top + 32}Z" fill="${look.top}"/><circle cx="${cx - 19}" cy="${top - 12}" r="7" fill="${look.skin}"/>` : '')
    + (armR ? `<path d="M${cx + 20} ${top + 38}L${cx + 25} ${top - 4}L${cx + 13} ${top - 4}L${cx + 12} ${top + 32}Z" fill="${look.top}"/><circle cx="${cx + 19}" cy="${top - 12}" r="7" fill="${look.skin}"/>` : '')
    + `<path d="M${cx - 20} ${top + 40}V${top + 88}M${cx + 20} ${top + 40}V${top + 88}" stroke="#000" stroke-opacity=".14" stroke-width="5"/>`
    + `<rect x="${cx - 17}" y="${top + 88}" width="15" height="${h - top - 96}" fill="${look.legs}"/><rect x="${cx + 2}" y="${top + 88}" width="15" height="${h - top - 96}" fill="${look.legs}"/>`
    + `<rect x="${cx - 21}" y="${h - 9}" width="19" height="9" rx="3" fill="${look.shoes ?? INK}"/><rect x="${cx + 2}" y="${h - 9}" width="19" height="9" rx="3" fill="${look.shoes ?? INK}"/>` + (extra.print ?? '');
  const r = yaw(extra.rot ?? 0), u = r([k, 0, 0]);
  return { id, stock: 'cover', c: look.top, w, h, o: add([x, 0, z], r([-w * k / 2, 0, 0])), u, v: [0, k, 0], edge: 'cut', density: 2.4, mask, print };
}

/* ---------- the car ---------- */
export function train(): Scene {
  reseed(41);
  const back = backWall(), cv = cove();
  // Floor: blue-grey vinyl with fleck, a lighter aisle, yellow threshold plates and tactile strips at both doors.
  const fl: Panel = { id: 'floor', stock: 'greyboard', c: FLOOR, w: W, h: D, o: [-W / 2, 0, FRONT], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.3, split: 2,
    print: `<rect width="${W}" height="${D}" fill="${FLOOR}"/>${specks(W, D, '#6f7882', 420, 2.6)}${specks(W, D, '#e3e8ec', 160, 2)}<rect y="${D - 70}" width="${W}" height="4" fill="#7e8893"/>`
      + DOORS.map(x => `<rect x="${bx(x) - DOOR_W / 2}" y="0" width="${DOOR_W}" height="14" fill="#c9ced3"/><path d="M${bx(x) - DOOR_W / 2} 7H${bx(x) + DOOR_W / 2}" stroke="#8a929b" stroke-width="2" stroke-dasharray="4 3"/><rect x="${bx(x) - DOOR_W / 2}" y="14" width="${DOOR_W}" height="10" fill="${SUN}"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${bx(x) - DOOR_W / 2 + 6 + i * 10}" cy="19" r="2" fill="#d9952a"/>`).join('')}`
        + `<g fill="${SUN}" fill-opacity=".9">${[-1, 1].map(s => `<path transform="translate(${bx(x) + s * 34} 46) scale(${s} 1)" d="M-8 0H8V14H16L0 30L-16 14H-8Z"/>`).join('')}</g>`).join('') };
  // The underframe seen in section along the front: floor slab, skirt in livery, bogies with wheels on the rail.
  const UNDER = 74;
  const wheel = (x: number) => `<circle cx="${x}" cy="${UNDER - 18}" r="15" fill="#23272d"/><circle cx="${x}" cy="${UNDER - 18}" r="9" fill="#5b636d"/><circle cx="${x}" cy="${UNDER - 18}" r="3" fill="#aab2bb"/>`;
  const bogie = (c: number) => `<rect x="${bx(c) - 92}" y="${UNDER - 40}" width="184" height="18" rx="4" fill="#3a4049"/><rect x="${bx(c) - 26}" y="${UNDER - 46}" width="52" height="16" fill="#2b3037"/><path d="M${bx(c) - 60} ${UNDER - 30}h18M${bx(c) + 42} ${UNDER - 30}h18" stroke="${SUN}" stroke-width="5"/>${wheel(bx(c) - 60)}${wheel(bx(c) + 60)}`;
  const section: Panel = { id: 'section', stock: 'greyboard', c: '#2f353d', w: W + 24, h: UNDER, o: [-W / 2 - 12, -UNDER, FRONT], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
    mask: `<path d="M0 0H${W + 24}V30H${bx(440) + 12 + 120}V${UNDER}H${bx(440) + 12 - 120}V30H${bx(-440) + 12 + 120}V${UNDER}H${bx(-440) + 12 - 120}V30H0Z" fill="#fff"/>`,
    print: `<rect width="${W + 24}" height="${UNDER}" fill="#2f353d"/><rect width="${W + 24}" height="7" fill="#7e8893"/><rect y="7" width="${W + 24}" height="4" fill="#1d2228"/><rect y="11" width="${W + 24}" height="19" fill="${SHELL}"/><rect y="17" width="${W + 24}" height="7" fill="${LIVERY}"/><rect y="24" width="${W + 24}" height="3" fill="${DEEP}"/>`
      + `<g transform="translate(12 0)">${bogie(-440)}${bogie(440)}</g>${Array.from({ length: 7 }, (_, i) => `<rect x="${bx(-250) + 12 + i * 80}" y="30" width="54" height="22" rx="3" fill="#3a4049"/><rect x="${bx(-250) + 18 + i * 80}" y="36" width="42" height="3" fill="#5b636d"/>`).join('')}` };

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
    { ...onCove(x, 10, w, COVE_LEN - 22, { id, stock: 'bond', c, density: 2.4, print }), decal: `${id}-frame` } as Panel
  ];
  const ads = [
    ...adFrame('ad-hello', -260, 220, `<rect width="220" height="64" fill="${SUN}"/><circle cx="34" cy="32" r="22" fill="${CREAM}"/><circle cx="34" cy="28" r="9" fill="#f3c9a0"/><path d="M22 26Q24 14 34 14Q44 14 46 24Q38 20 30 22Z" fill="#1d2228"/><path d="M20 50Q20 38 34 38Q48 38 48 50Z" fill="#2b3a55"/><text x="66" y="30" font-family="Fredoka" font-weight="600" font-size="17" fill="${INK}">Hey there!</text><rect x="66" y="38" width="120" height="6" rx="3" fill="${INK}" fill-opacity=".55"/><rect x="66" y="49" width="88" height="6" rx="3" fill="${INK}" fill-opacity=".35"/>`),
    ...adFrame('ad-phone', -560, 130, `<rect width="130" height="64" fill="${BLUE}"/><rect x="14" y="10" width="26" height="46" rx="4" fill="#1d2228"/><rect x="17" y="14" width="20" height="36" fill="#bfe6f8"/><rect x="52" y="16" width="64" height="9" rx="4" fill="${CREAM}"/><rect x="52" y="32" width="44" height="7" rx="3" fill="${CREAM}" fill-opacity=".6"/>`),
    ...adFrame('ad-coffee', 430, 130, `<rect width="130" height="64" fill="${MINT}"/><path d="M18 22H44V48Q44 56 36 56H26Q18 56 18 48Z" fill="${CREAM}"/><path d="M44 28Q54 28 54 36Q54 44 44 44" fill="none" stroke="${CREAM}" stroke-width="4"/><path d="M24 12Q28 16 24 20M34 12Q38 16 34 20" stroke="${CREAM}" stroke-width="2.4" fill="none"/><rect x="66" y="20" width="50" height="8" rx="4" fill="${CREAM}"/><rect x="66" y="34" width="36" height="7" rx="3" fill="${CREAM}" fill-opacity=".6"/>`),
  ];
  // The line map: one line, three named stations, the train's position, and a lamp that lights the chosen stop.
  const lmX = 30, lmW = 250;
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
  const RAIL_Y = 296, RAIL_Z = -62;
  const pole = (id: string, x: number, z: number): Panel[] => box({ id, x, z, w: 7, h: RAIL_Y, d: 7, stock: 'greyboard', c: POLE, front: `<rect x="1" width="2" height="${RAIL_Y}" fill="#fff" fill-opacity=".6"/>` }).filter(p => !/-(rear|under|top)$/.test(p.id));
  const poles = [...pole('pole-a', -330, -40), ...pole('pole-b', 330, -40), ...pole('pole-c', -252, BACK + 70), ...pole('pole-d', 252, BACK + 70)];
  const rail: Panel = { id: 'rail', stock: 'greyboard', c: POLE, w: W - 60, h: 6, o: [-W / 2 + 30, RAIL_Y, RAIL_Z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 2, print: `<rect width="${W - 60}" height="2" fill="#fff" fill-opacity=".6"/>` };
  const hangers = [-480, -160, 160, 480].map((x, i): Panel => ({ id: `hanger-${i}`, stock: 'greyboard', c: POLE, w: 5, h: CAR.COVE - RAIL_Y, o: [x - 2.5, RAIL_Y, RAIL_Z], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 2 }));
  const strapXs = [-520, -460, -270, -205, -140, -75, 75, 140, 205, 270, 460, 520];
  const straps = strapXs.map((x, i): Panel => ({ id: `strap-${i}`, stock: 'cover', c: i % 4 === 1 ? SUN : '#f4f6f8', w: 18, h: 64, o: [x - 9, RAIL_Y - 64 + 3, RAIL_Z + 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3,
    mask: `<path fill-rule="evenodd" d="M6 0H12V34H6Z M9 34L18 50Q18 64 9 64Q0 64 0 50Z M9 40L4 50Q4 59 9 59Q14 59 14 50Z" fill="#fff"/>`, print: `<rect width="18" height="64" fill="${i % 4 === 1 ? SUN : '#f4f6f8'}"/><rect x="6" width="6" height="34" fill="${i % 4 === 1 ? '#e2a32c' : '#9aa4ae'}"/>`, group: undefined }));

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
  const intercom = carved(back, box({ id: 'intercom', x: -404, z: BACK + 6, y: 150, w: 44, h: 64, d: 12, stock: 'cover', c: SUN,
    front: `<rect width="44" height="64" rx="4" fill="${SUN}"/><rect x="6" y="6" width="32" height="10" rx="2" fill="${INK}"/><g fill="${INK}">${Array.from({ length: 12 }, (_, i) => `<circle cx="${12 + (i % 4) * 7}" cy="${24 + Math.floor(i / 4) * 6}" r="1.6"/>`).join('')}</g><circle cx="22" cy="51" r="7" fill="${CORAL}"/><circle cx="22" cy="51" r="3.4" fill="#ff8a64"/>` }));
  const emergency = on(back, 1.2, bx(-404) - 20, 96, 40, 40, { id: 'help-sign', stock: 'bond', c: '#fff', density: 3, print: `<rect width="40" height="40" rx="4" fill="#fff"/><rect x="3" y="3" width="34" height="34" rx="3" fill="none" stroke="${CORAL}" stroke-width="2"/><path d="M14 12H26V18H20V22H26V28H14Z" fill="none"/><path d="M12 28L20 10L28 28Z" fill="none" stroke="${CORAL}" stroke-width="3" stroke-linejoin="round"/><rect x="19" y="17" width="2.4" height="6" fill="${CORAL}"/><circle cx="20.2" cy="25.5" r="1.4" fill="${CORAL}"/>` });

  // The roof seen past the cut: exterior top in the shell colour with the air-con housings and a pantograph.
  const roofTop: Panel = { id: 'roof-top', stock: 'cover', c: '#dfe4e8', w: W, h: 116, o: [-W / 2, CAR.ROOF, -40], u: [1, 0, 0], v: [0, 0, -1], edge: 'fold', density: 1.1, split: 2, print: `<rect width="${W}" height="116" fill="#dfe4e8"/><rect y="104" width="${W}" height="12" fill="#c3cad1"/>${Array.from({ length: 11 }, (_, i) => `<path d="M${(i + 1) * W / 12} 0V116" stroke="#c3cad1" stroke-width="1.4"/>`).join('')}` };
  const roofCut: Panel = { id: 'roof-cut', stock: 'greyboard', c: '#9aa4ae', w: W, h: CAR.ROOF - CAR.COVE, o: [-W / 2, CAR.COVE, -40], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1.4,
    print: `<rect width="${W}" height="${CAR.ROOF - CAR.COVE}" fill="#9aa4ae"/><rect width="${W}" height="5" fill="#dfe4e8"/><rect y="5" width="${W}" height="14" fill="#e8c86a"/>${Array.from({ length: 58 }, (_, i) => `<path d="M${i * 20 + 4} 6l6 12" stroke="#c9a24a" stroke-width="2"/>`).join('')}<rect y="${CAR.ROOF - CAR.COVE - 7}" width="${W}" height="7" fill="#f4f6f8"/>` };
  const acUnit = (id: string, x: number, w: number) => box({ id, x, z: -100, y: CAR.ROOF, w, h: 26, d: 84, stock: 'cover', c: '#c9d0d6', front: `<g fill="#8a939c">${Array.from({ length: Math.floor(w / 12) }, (_, i) => `<rect x="${6 + i * 12}" y="7" width="6" height="12" rx="1.5"/>`).join('')}</g>`, top: `<circle cx="${w * .3}" cy="42" r="18" fill="#9aa4ae"/><circle cx="${w * .3}" cy="42" r="12" fill="#5b636d"/><circle cx="${w * .7}" cy="42" r="18" fill="#9aa4ae"/><circle cx="${w * .7}" cy="42" r="12" fill="#5b636d"/>` }).filter(p => /front|top|left|right/.test(p.id));
  const acs = [...acUnit('ac-a', -360, 190), ...acUnit('ac-b', 360, 190)];
  // Pantograph: base frame on insulators, a knuckled arm, and the pan head pressing on the contact wire overhead.
  const PH = 56, panto: Panel[] = [{ id: 'panto', stock: 'greyboard', c: '#3a4049', w: 130, h: PH, o: [-40, CAR.ROOF, -96], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4,
    mask: `<path d="M10 ${PH}V${PH - 8}H70V${PH}Z M18 ${PH - 8}L74 ${PH - 30}L78 ${PH - 26}L24 ${PH - 6}Z M74 ${PH - 30}L40 4L45 2L80 ${PH - 28}Z M14 0H86V5H14Z M8 3Q8 0 12 0V5Q8 5 8 3Z M88 3Q92 3 92 0H86V5Z M18 ${PH}V${PH - 10}H26V${PH}Z M54 ${PH}V${PH - 10}H62V${PH}Z" fill="#fff"/>`,
    print: `<rect width="130" height="${PH}" fill="#3a4049"/><rect x="14" width="72" height="5" fill="#c9ced3"/><rect x="18" y="${PH - 10}" width="8" height="10" fill="#b0552e"/><rect x="54" y="${PH - 10}" width="8" height="10" fill="#b0552e"/>` }];

  // Neighbour cars past each end: the gangway bellows and a slice of the next car, closed, seen from outside.
  const bellows = (id: string, x: number): Panel => ({ id, stock: 'greyboard', c: '#2b3037', w: 30, h: H + 50, o: [x, 0, -60], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', density: 1.4, print: `<rect width="30" height="${H + 50}" fill="#2b3037"/>${Array.from({ length: 5 }, (_, i) => `<rect x="${3 + i * 6}" width="3" height="${H + 50}" fill="#4a5059"/>`).join('')}` });
  const nextCar = (id: string, x: number, flip: boolean): Panel => {
    const w = 360, h = CAR.ROOF + 14;
    const print = `<rect width="${w}" height="${h}" fill="${SHELL}"/><rect y="${h - 70}" width="${w}" height="8" fill="${LIVERY}"/><rect y="${h - 62}" width="${w}" height="3" fill="${DEEP}"/><rect y="0" width="${w}" height="26" fill="#d4dbe1"/>`
      + Array.from({ length: 3 }, (_, i) => `<rect x="${40 + i * 110}" y="${h - CAR.WIN[1] - 14}" width="80" height="${CAR.WIN[1] - CAR.WIN[0]}" rx="12" fill="#3b5266"/><rect x="${46 + i * 110}" y="${h - CAR.WIN[1] - 8}" width="68" height="40" rx="8" fill="#5f7a91"/>${i === 1 ? `<circle cx="${70 + i * 110}" cy="${h - CAR.WIN[1] + 40}" r="9" fill="#d9a77e"/><rect x="${60 + i * 110}" y="${h - CAR.WIN[1] + 50}" width="20" height="30" fill="${MINT}"/>` : ''}`).join('');
    const full = h + UNDER - 30;
    return { id, stock: 'cover', c: SHELL, w, h: full, o: [x, -UNDER, -150], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 1, mask: `<path d="${flip ? `M0 ${h}V0H${w - 40}Q${w} 0 ${w} 40V${h}Z` : `M0 ${h}V40Q0 0 40 0H${w}V${h}Z`}" fill="#fff"/><g transform="translate(${flip ? 40 : 136} ${h})"><rect width="184" height="${UNDER - 30}" fill="#fff"/></g>`, print: print + `<g transform="translate(${flip ? 40 : 136} ${h})"><rect width="184" height="${UNDER - 30}" fill="#2f353d"/><circle cx="32" cy="${UNDER - 48}" r="15" fill="#23272d"/><circle cx="152" cy="${UNDER - 48}" r="15" fill="#23272d"/><circle cx="32" cy="${UNDER - 48}" r="5" fill="#aab2bb"/><circle cx="152" cy="${UNDER - 48}" r="5" fill="#aab2bb"/></g>` };
  };
  const neighbours = [bellows('bellows-l', -W / 2 - 30), bellows('bellows-r', W / 2), nextCar('car-l', -W / 2 - 30 - 360, true), nextCar('car-r', W / 2 + 30, false)];

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
    seated('p-laptop', 500, L(0, '#1d2228', '#2b3a55', '#2e3440'), { print: `<rect x="8" y="58" width="44" height="28" rx="2" fill="#c9ced3"/><rect x="8" y="80" width="44" height="6" fill="#9aa4ae"/><circle cx="30" cy="70" r="3" fill="#fff"/>`, glasses: true }),
    standing('p-strap', -20, 6, L(1, '#1d2228', '#3f5f7a', '#2e3440', 'short'), { arm: 'right', print: `<rect x="40" y="88" width="20" height="26" rx="3" fill="${KRAFT}"/>` }),
    standing('p-pole', 384, -20, L(3, '#8a5a3a', SUN, '#3f5f7a', 'long'), { arm: 'left', rot: -14, print: phonesOn(32, 34, MINT) })
  ];
  // Props that tell the morning: a suitcase by the priority seats, a shopping bag at a foot, an umbrella hooked on the screen.
  const suitcase = box({ id: 'suitcase', x: -575, z: BACK + 112, w: 40, h: 58, d: 26, rot: 10, stock: 'cover', c: '#2f6f9f', front: `<rect x="6" y="6" width="28" height="46" rx="4" fill="none" stroke="#1f4d70" stroke-width="2"/><rect x="16" y="2" width="8" height="4" fill="${INK}"/>`, top: `<rect x="14" y="8" width="12" height="10" rx="3" fill="none" stroke="${INK}" stroke-width="2.4"/>` }).filter(p => !/rear|under|left/.test(p.id));
  const bag: Panel = { id: 'shop-bag', stock: 'kraft', c: KRAFT, w: 30, h: 38, o: [-176, 0, BACK + 92], u: yaw(-12)([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 3, mask: '<path d="M0 38V10H8Q8 0 15 0Q22 0 22 10H30V38Z M11 10Q11 4 15 4Q19 4 19 10Z" fill="#fff" fill-rule="evenodd"/>', print: `<rect width="30" height="38" fill="${KRAFT}"/><rect y="20" width="30" height="8" fill="${CORAL}"/>` };
  const umbrella: Panel = { id: 'umbrella', stock: 'cover', c: DEEP, w: 18, h: 92, o: [262, 0, BACK + 60], u: [1, 0, 0], v: [-.18, .98, 0], edge: 'cut', density: 3, mask: '<path d="M9 0V6Q2 30 4 70L9 74L14 70Q16 30 9 6Z M8 74H10V88Q10 92 6 92H4V89H6Q8 89 8 87Z" fill="#fff"/>', print: `<rect width="18" height="92" fill="${DEEP}"/><path d="M9 6V70" stroke="#063f66" stroke-width="1.6"/><rect y="74" width="18" height="18" fill="#6d4524"/>` };

  const panels: Panel[] = [section, fl, back, cv, lw, rw, roofTop, roofCut, ...acs, ...panto, ...neighbours,
    ...winFrames, ...doorFrames, ...leaves, ...[0, 1].flatMap(i => [0, 1, 2].map(k => led(i, k))), ...ads, ...lineMap, ...lamps, strip,
    ...benches, priority, ...screens, ...poles, rail, ...hangers, ...straps, ...wallBits, ...intercom, emergency,
    ...people, ...suitcase, bag, umbrella];
  return {
    id: 'train', camera: { zoom: .96, x0: -150, x1: 150 }, panels,
    light: { sun: 1.6, sky: .5, skyColor: [.86, .92, 1] },
    lamps: [-420, -140, 140, 420].map(x => ({ at: [x, CAR.COVE - 12, -70] as V3, color: [1, .98, .92] as const, energy: 38 }))
  };
}
