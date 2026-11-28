// The shopfront on the promenade: product reviews. The promenade around it is street.ts' and promenade.ts'; here are
// the Blibli shop's front and the four toys, every moving piece its own actor (toys/front.ts poses them).
// Plans and positions: plan.ts. What each toy stands for: docs/BLIBLI_DESIGN.md.
import { box, card as sheet, carved, cast, on, slot, type Actor, type Panel, type Scene, type Tint, type V3 } from '../../kit.ts';
import { BLUE, CORAL, CREAM, DEEP, INK, KRAFT, SUN, openFlaps, parcel, planks, specks } from '../../recipes.ts';
import { fawning, fblade, fflowers, flamp, frame, pigeon, plaza, scooter, shopper, tone } from '../promenade.ts';
import { MINT, PLUM, WARM, backdrop, dressing, surroundings, windowBox } from '../street.ts';
import { FRONT as F, SHOP, VARIANT } from './plan.ts';

const WHITE = '#ffffff', STEEL = '#3d444e', WOOD = '#a8693a', PAPER = '#fbf7ee';
// The colour chosen inside the shop: a sheet out here follows it by its full name.
const BY_COLOUR: Tint = { toy: 'blibli-shop/variant', colors: VARIANT };
const dyed = { stock: 'sugar' as const, c: WHITE, tint: BY_COLOUR };
const done = (stop: string, on: boolean) => ({ toy: `done:${stop}`, at: [on ? 1 : 0] });
// A station's trim: one strip that is plain kraft until the station is first used, then the new look.
const trim = (stop: string, x: number, y: number, z: number, w: number, h = 10): Panel[] => [
  sheet(x, y, z, w, h, { id: `trim-${stop}-old`, stock: 'kraft', c: KRAFT, density: 2, show: done(stop, false) }),
  sheet(x, y, z, w, h, { id: `trim-${stop}-new`, c: BLUE, density: 2, print: Array.from({ length: Math.floor(w / 14) }, (_, i) => `<circle cx="${7 + i * 14}" cy="${h / 2}" r="2.2" fill="${CREAM}"/>`).join(''), show: done(stop, true) })
];
const seen = (ps: Panel[], x: number) => ps.filter(p => p.ghost || p.decal || /-(front|top)$/.test(p.id) || p.id.endsWith(x < 0 ? '-right' : '-left'));
const starPath = (cx: number, cy: number, R: number) => `M${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5, q = i % 2 ? R * .45 : R; return `${(cx + Math.sin(a) * q).toFixed(1)} ${(cy - Math.cos(a) * q).toFixed(1)}`; }).join('L')}Z`;
const stars = (n: number, x: number, y: number, R: number, gap: number) => Array.from({ length: 5 }, (_, i) => `<path d="${starPath(x + i * gap, y, R)}" fill="${i < n ? SUN : '#d9d2c2'}"/>`).join('');
const lines = (x: number, y: number, w: number, n: number, gap = 7) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${(w * [1, .8, .9, .6][i % 4]).toFixed(1)}" height="3" rx="1.5" fill="#c9ccd1"/>`).join('');
// A customer's snapshot: a white-bordered print of whatever they bought, at the shape they took it.
const snap = (w: number, h: number, c: string, k: number) => `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="${c}"/>${k % 2 ? `<rect x="${w * .36}" y="${h * .22}" width="${w * .28}" height="${h * .56}" rx="2" fill="#1d2228"/>` : `<rect x="${w * .24}" y="${h * .34}" width="${w * .52}" height="${h * .4}" rx="2" fill="${tone(c, -.3)}"/><rect x="${w * .24}" y="${h * .34}" width="${w * .52}" height="${h * .12}" fill="${tone(c, .4)}"/>`}`;
const phonePrint = (w: number, h: number) => `<rect x="${w * .1}" y="${h * .08}" width="${w * .8}" height="${h * .8}" rx="2" fill="#1d2228"/><rect x="${w * .17}" y="${h * .14}" width="${w * .3}" height="${h * .2}" fill="#fff" fill-opacity=".22"/>`;

// The Blibli shop's front: a clapboard building under a gabled roof. Its ground storey is two tall bays either side of
// the door, so the review wall and the photo string are read over a walker's head: the left bay is a window, the
// right one carries the wall. A striped canopy over the door, the sign above it, a low attic under the roof.
function shopFront(actors: Record<string, Actor>): Panel[] {
  const { x, z, w, d, ground: g, upper, peak } = SHOP, h = g + upper, H = h + peak, density = 1.25, x0 = x - w / 2;
  const door = { x: w / 2 - F.door.w / 2, w: F.door.w, h: F.door.h }, S = F.string, B = F.board;
  const bay = [S.x - 108 - x0, 110, 216, 184] as const, up = [[64, 320, 84, 44], [176, 320, 84, 44], [460, 320, 84, 44], [572, 320, 84, 44]] as const;
  const hole = ([a, b, c, e]: readonly number[]) => `M${a} ${H - b}V${H - b - e}H${a + c}V${H - b}Z`;
  const shape = `<path fill-rule="evenodd" d="M0 ${H}V${peak}L${w / 2} 0L${w} ${peak}V${H}Z ${[bay, ...up].map(hole).join(' ')} M${door.x} ${H}V${H - door.h}H${door.x + door.w}V${H}Z" fill="#fff"/>`;
  const clap = Array.from({ length: 22 }, (_, i) => `<path d="M0 ${peak + (i + 1) * 17}H${w}" stroke="#0577b4" stroke-width="2"/>`).join('');
  const front: Panel = { id: 'shop-front', stock: 'cover', c: BLUE, w, h: H, o: [x0, 0, z], u: [1, 0, 0], v: [0, 1, 0], density, edge: 'cut', mask: shape, print: clap + `<rect y="${H - g - 5}" width="${w}" height="12" fill="${CREAM}"/><rect y="${H - 16}" width="${w}" height="16" fill="${DEEP}"/>` };
  // Behind the photo string the shop is only a warm wall and the top of a shelf: nothing that competes with the prints.
  const inside = `<rect width="226" height="194" fill="#f1cf95"/><rect y="168" width="226" height="26" fill="#c9955c"/><rect y="164" width="226" height="6" fill="#a8693a"/>`;
  const attic = (i: number) => `<rect width="94" height="54" fill="#f4cf8c"/><rect x="${10 + i * 6}" y="22" width="30" height="32" fill="${[KRAFT, CORAL, KRAFT, MINT][i]}"/><rect x="${52 - i * 4}" y="30" width="26" height="24" fill="${KRAFT}"/>`;
  const windows = [...windowBox('win-string', front, bay[0], bay[1], bay[2], bay[3], inside, 1, 1), ...up.flatMap(([a, b, c, e], i) => windowBox(`win-up${i}`, front, a, b, c, e, attic(i), 2, 1, 10))];

  // The photo string: two strings across the window, five customers' prints pegged to them at their own shapes, and
  // one empty peg, his. These never move, so they are printed flat onto the front.
  const lx = (wx: number) => wx - x0, hung = S.prints.flatMap(([px, py, pw, ph], i) => [
    on(front, 3.4, lx(px) - 3, py + ph / 2 - 3, 6, 11, { id: `peg-${i}`, stock: 'greyboard', c: i ? WOOD : CORAL }),
    ...(i ? [on(front, 3, lx(px) - pw / 2, py - ph / 2, pw, ph, { id: `print-${i}`, stock: 'bond', c: '#fdfaf2', density: 2.4, print: snap(pw, ph, [CORAL, MINT, BLUE, PLUM, SUN][i - 1], i) })] : [])]);
  const strings = [S.prints[0], S.prints[3]].map(([, py], i) => on(front, 2.6, bay[0] - 2, py + 30, bay[2] + 4, 2.4, { id: `string-${i}`, stock: 'greyboard', c: '#5d4a3c' }));
  // The blind: a sheet with six square windows that runs down over the prints, and the cord that works it.
  const top = bay[1] + bay[3] - 8, bw = bay[2] - 8, bh = 2 * S.cell + 44, bx = S.x - bw / 2, cell = S.cell - 14;
  const holes = S.prints.map(([px, py]) => `M${px - bx - cell / 2} ${top - py - cell / 2}v${cell}h${cell}v${-cell}Z`).join(' ');
  const blind = sheet(bx, top - bh, S.z + 5, bw, bh, { id: 'blind', c: '#fff4e2', density: 2, mask: `<path fill-rule="evenodd" d="M0 0H${bw}V${bh}H0Z ${holes}" fill="#fff"/>`, print: `<rect y="${bh - 12}" width="${bw}" height="12" fill="${BLUE}"/>${Array.from({ length: 7 }, (_, i) => `<path d="M0 ${12 + i * 22}H${bw}" stroke="#e9dcc4" stroke-width="2"/>`).join('')}` });
  actors.blind = { pivot: [S.x, top, S.z + 5] };
  const cx = bay[0] + bay[2] + x0 - 14, cord = sheet(cx - 8, top - 104, S.z + 6, 16, 104, { id: 'cord', c: CORAL, density: 3, mask: '<rect x="6.6" width="2.8" height="90" fill="#fff"/><circle cx="8" cy="96" r="8" fill="#fff"/>', print: `<rect x="6.6" width="2.8" height="90" fill="#5d4a3c"/>` });
  actors.cord = { pivot: [cx, top, S.z + 6] };
  const roll = on(front, 5, bay[0] - 4, top - 5, bay[2] + 8, 13, { id: 'blind-roll', stock: 'greyboard', c: STEEL });

  // The review wall: a cork board in the right bay. Its cards are actors (below); the board itself is printed flat.
  const cork = on(front, 2, lx(B.x), B.y, B.w, B.h, { id: 'board', stock: 'greyboard', c: '#c89a62', density: 1.6, print: `${specks(B.w, B.h, '#a8693a', 90, 3)}<rect x="3" y="3" width="${B.w - 6}" height="${B.h - 6}" fill="none" stroke="${CREAM}" stroke-width="6"/>${B.cols.flatMap(c => B.rows.map(r => `<circle cx="${c - B.x}" cy="${B.y + B.h - r - B.card.h / 2 + 6}" r="3.4" fill="${CORAL}"/>`)).join('')}` });

  // The door: lit from inside, two leaves on their hinges, a brass bell on a bracket over it.
  const doorRoom: Panel = { id: 'door-room', stock: 'cover', c: '#ffdf9e', w: door.w + 16, h: door.h + 8, o: [x - door.w / 2 - 8, 0, z - 22], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', emit: 1, density };
  const leaves = (['l', 'r'] as const).flatMap(side => {
    const ox = side === 'l' ? x - door.w / 2 : x;
    actors[`door-${side}`] = { pivot: [side === 'l' ? ox : ox + door.w / 2, 0, z + .8] };
    return cast(`door-${side}`, [sheet(ox, 0, z + .8, door.w / 2, door.h, { id: `door-${side}`, c: DEEP, density, mask: slot(door.w / 2, door.h, [12, 14, door.w / 2 - 24, 150]), print: `<rect x="${side === 'l' ? door.w / 2 - 13 : 6}" y="${door.h - 96}" width="7" height="30" rx="3.5" fill="${CREAM}"/>` })]);
  });
  const bell = cast('bell', [sheet(x - 13, door.h + 8, z + 16, 26, 28, { id: 'bell', c: SUN, density: 3, mask: '<path d="M13 0C24 0 22 17 26 23H0C4 17 2 0 13 0ZM9 23H17Q17 28 13 28Q9 28 9 23Z" fill="#fff"/>', print: `<path d="M5 20H21" stroke="${tone(SUN, -.3)}" stroke-width="2"/>` })]);
  actors.bell = { pivot: [x, door.h + 36, z + 16] };

  const walls = box({ id: 'shop-body', x, z: z - d / 2, w, h, d, stock: 'cover', c: BLUE, noTop: true, right: clap, left: clap }).filter(p => !p.id.endsWith('front')).map(p => ({ ...p, density: 1 }));
  const rise = Math.hypot(w / 2 + 26, peak * (w / 2 + 26) / (w / 2)), a = Math.atan2(peak, w / 2), ridge: V3 = [x, H + 2, z + 18], rd = d + 40;
  const roof = (id: string, s: 1 | -1): Panel[] => {
    const dn: V3 = [s * Math.cos(a), -Math.sin(a), 0], up2: V3 = [-dn[0], -dn[1], -dn[2]];
    const base: Panel = s < 0 ? { id, stock: 'cover', c: DEEP, w: rise, h: rd, o: [ridge[0] + dn[0] * rise, ridge[1] + dn[1] * rise, ridge[2]], u: up2, v: [0, 0, -1], edge: 'cut', density: 1 } : { id, stock: 'cover', c: DEEP, w: rise, h: rd, o: ridge, u: dn, v: [0, 0, -1], edge: 'cut', density: 1 };
    const lip: Panel = { id: `${id}-lip`, stock: 'cover', c: CREAM, w: rise, h: 8, o: [base.o[0], base.o[1] - 8, base.o[2]], u: base.u, v: [0, 1, 0], edge: 'fold', density: 1.4 };
    return [{ ...base, print: Array.from({ length: 13 }, (_, i) => `<path d="M${(i + 1) * rise / 14} 0V${rd}" stroke="${tone(DEEP, -.3)}" stroke-width="3"/>`).join('') }, lip];
  };
  // The sign over the door: the one place the logo stands.
  const sign: Panel = { id: 'shop-sign', stock: 'cover', c: CREAM, w: 200, h: 54, o: [x - 100, g + 10, z + 8], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 3, mask: '<rect width="200" height="54" rx="8" fill="#fff"/>', print: '<image href="/PUBLIC/img/brand/blibli-logo.png" x="25" y="4" width="150" height="46" preserveAspectRatio="xMidYMid meet"/>' };
  const roundel = on(front, 1, w / 2 - 22, H - 66 - 22, 44, 44, { id: 'gable-roundel', stock: 'cover', c: CREAM, mask: '<circle cx="22" cy="22" r="22" fill="#fff"/>', print: `<circle cx="22" cy="22" r="14" fill="${WARM}"/><path d="M22 8V36M8 22H36" stroke="${CREAM}" stroke-width="4"/>` });
  // Relief on the front: the door's canopy, window boxes under the attic windows, lanterns, a blade sign on the corner.
  const Fr = frame(x0, z, 0);
  const dress = carved(front, [...fawning(Fr, 'shop-canopy', door.x - 18, door.h + 66, door.w + 36, 56, 28, CORAL), ...up.flatMap(([a2], i) => fflowers(Fr, `shop-flowers${i}`, a2 - 4, 300, 92)), ...flamp(Fr, 'shop-lamp-l', door.x - 32, 150), ...flamp(Fr, 'shop-lamp-r', door.x + door.w + 14, 150),
    ...fblade(Fr, 'shop-blade', w - 22, g + 14, 58, 58, CREAM, `<circle cx="29" cy="29" r="25" fill="${BLUE}"/><path d="M18 22h22l-3 18h-16Z" fill="${CREAM}"/><path d="M23 22q6 -10 12 0" stroke="${CREAM}" stroke-width="3" fill="none"/>`, '<circle cx="29" cy="29" r="29" fill="#fff"/>')]);
  return [front, ...dress, ...walls, ...windows, ...strings, ...hung, roll, cork, doorRoom, ...leaves, ...bell, ...roof('shop-roof-l', -1), ...roof('shop-roof-r', 1), sign, roundel, ...cast('blind', [blind]), ...cast('cord', [cord]),
    ...trim('gallery', bay[0] + x0, bay[1] - 12, z + 3, bay[2], 10), ...trim('wall', B.x, B.y - 14, z + 3, B.w, 10)];
}

export function front(): Scene {
  const z = F.wall.z, actors: Record<string, Actor> = {}, panels: Panel[] = [];

  // Review wall: six cards, each folding up about its top edge when the filter drops it.
  const b = F.board, cw = b.card.w, ch = b.card.h, cz = z + 5;
  F.reviews.forEach((rv, i) => {
    const cx = b.cols[i % 3], cy = b.rows[Math.floor(i / 3)], x = cx - cw / 2, y = cy - ch / 2, name = `card-${i}`;
    const body = i ? stars(rv.stars, 9, 11, 5, 12.4) + (rv.photo ? `<g transform="translate(6 22)">${snap(26, 28, [BLUE, CORAL, MINT][i % 3], i)}</g>${lines(38, 28, 24, 4, 8)}` : lines(8, 26, cw - 16, 5, 8)) : lines(38, 28, 24, 4, 8);
    const sheets: Panel[] = [sheet(x, y, cz, cw, ch, { id: name, c: PAPER, stock: 'bond', density: 3, print: body })];
    if (!i) {
      // His own card: the stars he stamped and the print he took, each a sheet that follows its toy.
      for (let n = 0; n <= 5; n++) sheets.push(sheet(x + 3, y + ch - 20, cz + .6, cw - 6, 17, { id: `mine-stars-${n}`, c: PAPER, stock: 'bond', density: 3, print: stars(n, 8, 8.5, 5, 12.4), show: { toy: 'rating', at: [n] } }));
      sheets.push(sheet(x + 8, y + 7, cz + .6, 22, 30, { id: 'mine-photo', ...dyed, round: 2, density: 3, print: phonePrint(22, 30), show: { toy: 'photo', at: [2, 3] } }));
    }
    panels.push(...cast(name, sheets));
    actors[name] = { pivot: [cx, cy + ch / 2, cz] };
  });
  // The tab strip standing on the board's top edge: one sheet per filter, the chosen tab standing proud.
  const icons = ['<circle cx="-8" cy="0" r="3.4"/><circle cx="2" cy="0" r="3.4"/><circle cx="12" cy="0" r="3.4"/>', '<rect x="-9" y="-8" width="22" height="16" rx="2"/><circle cx="2" cy="0" r="4.4" fill="#1d2228" fill-opacity=".45"/>', `<path d="${starPath(2, 0, 9)}"/>`];
  const tabs = (k: number) => sheet(b.x + 14, b.y + b.h - 6, cz + 1, 200, 34, { id: `tabs-${k}`, c: PAPER, density: 3, mask: [0, 1, 2].map(i => `<rect x="${6 + i * 64}" y="${i === k ? 0 : 9}" width="58" height="${i === k ? 34 : 25}" rx="6" fill="#fff"/>`).join(''), print: [0, 1, 2].map(i => `<g transform="translate(${6 + i * 64} ${i === k ? 0 : 9})"><rect width="58" height="34" fill="${i === k ? BLUE : '#e9dcc4'}"/><g transform="translate(27 ${i === k ? 16 : 12})" fill="${i === k ? CREAM : '#8b929c'}">${icons[i]}</g></g>`).join(''), show: { toy: 'filter', at: [k] } });
  panels.push(...cast('tabs', [0, 1, 2].map(tabs)));
  actors.tabs = { pivot: [b.x + 114, b.y + b.h - 6, cz + 1] };

  // Photo spot by the river gate: the phone he bought stands by its opened parcel on a folding table, and the instant
  // camera on its tripod is turned to it.
  const t = F.table, c = F.camera;
  panels.push(...seen(box({ id: 'table', x: t.x, z: t.z, w: 124, h: t.top, d: 66, stock: 'cover', c: CREAM, front: `<rect width="124" height="${t.top}" fill="${BLUE}"/><rect width="124" height="7" fill="${CREAM}"/>${Array.from({ length: 5 }, (_, i) => `<path d="M${12 + i * 25} 7V${t.top}" stroke="${DEEP}" stroke-width="2"/>`).join('')}`, right: `<rect width="66" height="${t.top}" fill="${DEEP}"/><rect width="66" height="7" fill="${CREAM}"/>` }), t.x), ...trim('camera', t.x - 62, t.top - 16, t.z + 33.8, 124, 9));
  panels.push(...seen(parcel({ id: 'unbox', label: 'PHONE', color: BLUE, x: t.x + 26, z: t.z - 6, y: t.top, w: 62, h: 38, d: 48, rot: -8, open: true }), t.x), ...openFlaps({ id: 'unbox', x: t.x + 26, z: t.z - 6, y: t.top + 38, w: 62, d: 48, rot: -8 }).filter(p => !/tissue-1|rib/.test(p.id)));
  panels.push(sheet(t.x - 50, t.top, t.z + 12, 32, 60, { id: 'spot-phone', ...dyed, round: 5, density: 3, print: phonePrint(32, 60) }));
  panels.push(sheet(c.x - 34, 0, c.z - 3, 68, c.y, { id: 'tripod', c: STEEL, stock: 'greyboard', density: 2, mask: `<path d="M29 0H39L42 12L68 ${c.y}H60L34 26L8 ${c.y}H0L26 12Z" fill="#fff"/>`, print: `<rect x="26" width="16" height="12" fill="#23272d"/>` }));
  const body = box({ id: 'camera', x: c.x, z: c.z, y: c.y, w: 62, h: 44, d: 36, stock: 'cover', c: CREAM, front: `<rect y="30" width="62" height="6" fill="${CORAL}"/><circle cx="36" cy="22" r="15" fill="#23272d"/><circle cx="36" cy="22" r="9" fill="#4f6a86"/><circle cx="32" cy="18" r="3" fill="#fff" fill-opacity=".5"/><rect x="5" y="6" width="15" height="10" rx="2" fill="${SUN}"/><rect x="8" y="36" width="46" height="4" rx="2" fill="#23272d"/>`, right: `<rect y="30" width="36" height="6" fill="${CORAL}"/>`, top: `<circle cx="14" cy="14" r="7" fill="${CORAL}"/>` });
  panels.push(...cast('camera', seen(body, c.x)));
  actors.camera = { pivot: [c.x, c.y, c.z] };
  // The print: a white card with the phone on it, in the phone's colour. It hangs from the camera's slot by its top.
  // There are two: the one on his peg, and a fresh one when he shoots again while the first hangs there.
  for (const [n, at] of [['print', [1, 2, 3]], ['print-new', [3]]] as const) {
    panels.push(...cast(n, [sheet(c.x - 20, c.y - 52, c.z + 19, 40, 52, { id: `${n}-paper`, c: '#fdfaf2', stock: 'bond', density: 3, show: { toy: 'photo', at: [...at] } }), sheet(c.x - 10, c.y - 43, c.z + 19.6, 20, 32, { id: `${n}-pic`, ...dyed, round: 2, density: 3, print: phonePrint(20, 32), show: { toy: 'photo', at: [...at] } })]));
    actors[n] = { pivot: [c.x, c.y, c.z + 19] };
  }

  // Writing stand: his review card on a sloping top, the rubber stamp over it, the paint for the new look beside it.
  const st = F.stand, tilt: V3 = [0, .55, -.835];
  panels.push(...seen(box({ id: 'stand', x: st.x, z: st.z, w: 74, h: st.top, d: 46, stock: 'greyboard', c: WOOD, front: planks(74, st.top, WOOD, '#6d4524', 28), noTop: true }), st.x), ...trim('stars', st.x - 37, st.top - 14, st.z + 23.8, 74, 9));
  const slope = (id: string, y: number, hgt: number, rest: Partial<Panel>): Panel => ({ id, stock: 'bond', c: PAPER, o: [st.x - 38, st.top + .5 + y * tilt[1], st.z + 23 + y * tilt[2]], u: [1, 0, 0], v: tilt, w: 76, h: hgt, edge: 'cut', density: 3, ...rest });
  panels.push(slope('my-card', 0, 55, { print: `${lines(8, 30, 60, 3, 8)}<rect width="76" height="5" fill="${BLUE}"/>` }));
  for (let n = 0; n <= 5; n++) panels.push({ ...slope(`stars-${n}`, 33, 19, { print: stars(n, 10, 9.5, 5.6, 13.6), show: { toy: 'rating', at: [n] } }), o: [st.x - 38, st.top + 1 + 33 * tilt[1], st.z + 23 + 33 * tilt[2]] });
  const [sx2, sy2, sz2] = [st.x + st.pad[0], st.top + st.pad[1], st.z + st.pad[2]];
  panels.push(slope('ink-pad', 4, 22, { stock: 'cover', c: '#23272d', w: 26, o: [st.x + 13, st.top + .8 + 4 * tilt[1], st.z + 23 + 4 * tilt[2]], print: `<rect x="3" y="3" width="20" height="16" fill="${DEEP}"/>` }));
  const stamp = box({ id: 'stamp', x: sx2, z: sz2, y: sy2, w: 22, h: 16, d: 20, stock: 'cover', c: CORAL, front: `<rect y="11" width="22" height="5" fill="#23272d"/>` });
  panels.push(...cast('stamp', [...seen(stamp, st.x), sheet(sx2 - 5, sy2 + 16, sz2, 10, 18, { id: 'stamp-grip', stock: 'greyboard', c: WOOD, density: 3, mask: '<path d="M3 18V8Q0 6 0 4Q0 0 5 0Q10 0 10 4Q10 6 7 8V18Z" fill="#fff"/>' })]));
  actors.stamp = { pivot: [sx2, sy2, sz2], shadow: [24, 12] };
  panels.push(sheet(st.x + 44, 0, st.z + 14, 58, 40, { id: 'cans', c: CREAM, density: 2.4, mask: '<rect y="12" width="27" height="28" rx="2" fill="#fff"/><rect x="31" y="6" width="27" height="34" rx="2" fill="#fff"/><path d="M2 12Q13 -6 25 12" stroke="#fff" stroke-width="2.4" fill="none"/>', print: `<rect y="12" width="27" height="28" fill="${KRAFT}"/><rect x="31" y="6" width="27" height="34" fill="${BLUE}"/><rect y="12" width="27" height="5" fill="#e9dcc4"/><rect x="31" y="6" width="27" height="5" fill="#e9dcc4"/><path d="M2 12Q13 -6 25 12" stroke="${STEEL}" stroke-width="2.4" fill="none"/>`, show: done('stars', false) }));

  // The courier's scooter at the kerb: its box carries as many parcels as the basket inside holds.
  const sc = F.scooter;
  panels.push(...scooter('scooter', sc.x, sc.z, -38));
  for (let n = 1; n <= 3; n++) panels.push(sheet(sc.x - 82, 108, sc.z + 30, 70, 62, { id: `parcels-${n}`, stock: 'kraft', c: KRAFT, density: 2.4, mask: [[2, 30, 32, 32], [36, 30, 32, 32], [18, 0, 34, 30]].slice(0, n).map(([px, py, pw, ph]) => `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#fff"/>`).join(''), print: [[2, 30, 32, 32], [36, 30, 32, 32], [18, 0, 34, 30]].map(([px, py, pw, ph]) => `<rect x="${px + pw / 2 - 4}" y="${py}" width="8" height="${ph}" fill="#d9b781"/><rect x="${px + 4}" y="${py + ph - 12}" width="12" height="8" fill="#fbf7ee"/><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="#94633a" stroke-width="1.4"/>`).join(''), show: { toy: 'blibli-shop/cart', at: [n] } }));

  // Who is here: a father and his child reading the wall, a backpacker at the photos, a woman strolling by.
  const [dad, kid, pack, lady] = F.shoppers;
  panels.push(
    ...shopper('shopper-b', dad.x, dad.z, { coat: SUN, legs: STEEL, skin: '#c99a7a', hair: '#2b2622', carry: '#2bb5b8', build: 'big', face: 'determined' }, true),
    ...shopper('shopper-c', kid.x, kid.z, { coat: '#57b36f', legs: '#22324a', skin: '#c99a7a', hair: '#2b2622', style: 'shorts', hat: CORAL, face: 'surprised' }, false, .7, 0, false),
    ...shopper('shopper-e', pack.x, pack.z, { coat: '#2bb5b8', legs: '#c8915a', skin: '#a8714f', hair: '#1d1a17', style: 'shorts', pack: CORAL, hat: '#f4f1ea', build: 'average', face: 'cool' }, false, .95, 0, false),
    ...shopper('shopper-a', lady.x, lady.z, { coat: PLUM, legs: '#22324a', skin: '#f3c9a0', hair: '#4a2c1a', carry: BLUE, style: 'dress', hat: '#f4e3c3', face: 'grumpy' }));
  F.pigeons.forEach((p, i) => { const n = `pigeon-${'ab'[i]}`; panels.push(...cast(n, pigeon(n, p.x, p.z, i ? 16 : -20, i ? '#b3bac3' : '#9aa3ad', !!i))); actors[n] = { pivot: [p.x, 0, p.z], shadow: [30, 13] }; });
  // The way back to the train, at the plaza's right end.
  panels.push({ id: 'out-arrow', stock: 'cover', c: SUN, w: 150, h: 126, density: 1.6, o: [F.out.x - 40, 0, 56], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', mask: '<g transform="translate(150 0) scale(-1 1)"><path d="M66 126V74H44V74L4 40L44 8V24H146V58H82V126Z" fill="#fff"/></g>', print: `<rect x="68" y="66" width="16" height="60" fill="${STEEL}"/><text x="58" y="48" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="15" fill="${INK}">TRAIN</text>` });

  // The promenade around the shop. What made way for the toys: the mailbox, the tech parcels, the bench, the plant,
  // the parcel by the door and the sandwich board; the shoppers stand where the loop wants them.
  const around = [...surroundings().filter(p => !/^shopper-[abce]/.test(p.id)), ...dressing().filter(p => !/^(trunk|crown|lamp-|hydrant|bin|walker-|shrub-e|out-arrow|pigeon-|pot|plant-a|door-box|bench|aboard|scooter)/.test(p.id))];
  return { id: 'street', density: 2.1, camera: { zoom: 1, x0: -340, x1: 340 }, light: { sun: 2.6, sky: .62, skyColor: [.86, .92, 1] }, actors, panels: [...backdrop(), ...plaza(), ...around, ...shopFront(actors), ...panels] };
}
