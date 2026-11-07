import { add, box, yaw, type Panel, type Stock, type V3 } from '../kit.ts';

// Freestanding pieces in the cut-and-glued manner of a paper diorama kit (the Paper Grove pines and fox): two identical
// die-cut cards slotted at right angles, or a body folded over a ridge with its head and tail cut separately and glued on.

export const tone = (c: string, m: number) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(c.slice(i, i + 2), 16) * m))).toString(16).padStart(2, '0')).join('');

// Two identical cards slotted at right angles and turned 45 degrees to the street, so both read from the pavement.
// `print(k)` paints card k; the slot itself is a short dark line, cut from the top on one card and from the bottom on the other.
export function slotPair(id: string, x: number, z: number, y: number, w: number, h: number, c: string, mask: string, print: (k: number) => string, opts: { rot?: number; stock?: Stock; density?: number } = {}): Panel[] {
  return [45, -45].map((d, k) => {
    const r = yaw((opts.rot ?? 0) + d);
    return { id: `${id}-${k ? 'b' : 'a'}`, stock: opts.stock ?? 'sugar', c, w, h, o: add([x, y, z], r([-w / 2, 0, 0])), u: r([1, 0, 0]), v: [0, 1, 0] as V3, edge: 'cut' as const, density: opts.density ?? 1.6, mask, print: print(k) };
  });
}

// A tiered conifer, the Paper Grove pine: a stepped silhouette on a short trunk, the sunlit half a lighter green, and
// half-dots punched along every tier's lower edge so the trim reads as a scalloped second colour.
export function pineCards(id: string, x: number, z: number, y: number, w: number, h: number, o: { tiers?: number; dark?: string; light?: string; trim?: string; trunk?: string; rot?: number; seed?: number; density?: number } = {}): Panel[] {
  const tiers = o.tiers ?? 3, dark = o.dark ?? '#22704f', light = o.light ?? '#2f8a5f', trim = o.trim ?? '#f3eedb', trunk = o.trunk ?? '#7a5236';
  const tw = w * .13, th = h * .13, step = (h - th) / (tiers + .55);
  const ys: number[] = [], hw: number[] = [];
  for (let k = 0; k < tiers; k++) { ys.push(th + k * step); hw.push(w / 2 * (1 - k * .2)); }
  const right: [number, number][] = [[tw / 2, 0], [tw / 2, th]];
  for (let k = 0; k < tiers; k++) { right.push([hw[k], ys[k]]); if (k < tiers - 1) right.push([hw[k] * .42, ys[k + 1]]); }
  right.push([0, h]);
  const pts = [...right, ...right.slice(0, -1).reverse().map(([a, b]) => [-a, b] as [number, number])];
  const P = ([a, b]: [number, number]) => `${(a + w / 2).toFixed(1)} ${(h - b).toFixed(1)}`;
  const mask = `<path d="M${pts.map(P).join('L')}Z" fill="#fff"/>`;
  let s = o.seed ?? 3; const rr = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const dot = Math.max(2.2, w * .028), gap = dot * 1.65;
  const dots = ys.map((yy, k) => { let out = ''; for (let dx = -hw[k]; dx <= hw[k] + .1; dx += gap) out += `<circle cx="${(dx + w / 2).toFixed(1)}" cy="${(h - yy).toFixed(1)}" r="${dot.toFixed(1)}" fill="${trim}"/>`; return out; }).join('');
  const specks = Array.from({ length: Math.round(w / 6) }, () => `<circle cx="${(w / 2 + (rr() - .5) * w * .8).toFixed(1)}" cy="${(h * .1 + rr() * (h - th) * .8).toFixed(1)}" r="${(dot * (.25 + rr() * .2)).toFixed(1)}" fill="${trim}" fill-opacity=".9"/>`).join('');
  const print = (k: number) => `<rect width="${w}" height="${h}" fill="${dark}"/><rect width="${w / 2}" height="${h - th}" fill="${light}"/><rect y="${h - th - .5}" width="${w}" height="${th + 1}" fill="${trunk}"/><rect x="${w / 2}" y="${h - th - .5}" width="${w / 2}" height="${th + 1}" fill="${tone(trunk, .78)}"/>${dots}${specks}`
    + `<rect x="${w / 2 - .7}" y="${k ? (h - th) * .5 : 0}" width="1.4" height="${(h - th) * .5}" fill="#000" fill-opacity=".28"/>`;
  return slotPair(id, x, z, y, w, h, dark, mask, print, { rot: o.rot, density: o.density });
}

// A square planter folded from one sheet, its soil printed on the top flap. Only the faces the street sees are kept.
export const planter = (id: string, x: number, z: number, s: number, h: number, c: string, soil = '#4a3424', rot = 0) =>
  box({ id, x, z, w: s, h, d: s, rot, stock: 'cover', c, side: tone(c, .86), front: `<rect width="${s}" height="4" fill="${tone(c, 1.15)}"/>`, top: `<rect x="3" y="3" width="${s - 6}" height="${s - 6}" fill="${soil}"/>` }).filter(p => !/rear|under/.test(p.id));

// A tent-fold animal, the Paper Grove fox: the body is one sheet folded over the spine, its legs cut from the lower edge;
// the head is a separate card glued square across the front, the tail another card glued in the body's plane behind.
type Card = { w: number; h: number; mask: string; print: string; c: string };
export function tentAnimal(id: string, x: number, z: number, rot: number, b: { L: number; S: number; deg: number; c: string; print: string; mask: string }, head: Card & { y: number }, tail?: Card & { y: number; over: number }): Panel[] {
  const r = yaw(rot), a = b.deg * Math.PI / 180, R = b.S * Math.cos(a), sp = b.S * Math.sin(a);
  const place = (p: Panel): Panel => ({ ...p, o: add([x, 0, z], r(p.o)), u: r(p.u), v: r(p.v) });
  const out: Panel[] = [
    { id: `${id}-near`, stock: 'cover', c: b.c, w: b.L, h: b.S, o: [-b.L / 2, 0, sp], u: [1, 0, 0], v: [0, Math.cos(a), -Math.sin(a)], edge: 'cut', density: 2.4, mask: b.mask, print: b.print },
    { id: `${id}-far`, stock: 'cover', c: tone(b.c, .8), w: b.L, h: b.S, o: [b.L / 2, 0, -sp], u: [-1, 0, 0], v: [0, Math.cos(a), Math.sin(a)], edge: 'cut', density: 1.2, mask: `<g transform="translate(${b.L} 0) scale(-1 1)">${b.mask}</g>` },
    { id: `${id}-head`, stock: 'cover', c: head.c, w: head.w, h: head.h, o: [b.L / 2 + 1.5, head.y, head.w / 2], u: [0, 0, -1], v: [0, 1, 0], edge: 'cut', density: 2.6, mask: head.mask, print: head.print }];
  if (tail) out.push({ id: `${id}-tail`, stock: 'cover', c: tail.c, w: tail.w, h: tail.h, o: [-b.L / 2 - tail.w + tail.over, tail.y, .8], u: [1, 0, 0], v: [0, 1, 0], edge: 'cut', density: 2.4, mask: tail.mask, print: tail.print });
  void R;
  return out.map(place);
}

// A street dog, folded: tan body over the spine with a cream belly and dark socks, a face card with folded ears, a curled tail.
export function paperDog(id: string, x: number, z: number, rot: number, c = '#b07a4f'): Panel[] {
  const L = 66, S = 40;
  const body = { L, S, deg: 24, c, mask: `<path d="M0 0H${L}V${S}H${L - 12}V${S - 14}Q${L / 2} ${S - 22} 12 ${S - 14}V${S}H0Z" fill="#fff"/>`,
    print: `<rect width="${L}" height="${S}" fill="${c}"/><rect width="${L}" height="9" fill="${tone(c, 1.12)}"/><ellipse cx="${L / 2}" cy="${S - 16}" rx="${L * .3}" ry="7" fill="#f2e2c8"/><rect y="${S - 6}" width="${L}" height="6" fill="#4a2c1a"/><ellipse cx="${L * .7}" cy="13" rx="9" ry="6" fill="${tone(c, .78)}"/>` };
  const head = { c, w: 34, h: 36, y: S * Math.cos(24 * Math.PI / 180) - 10,
    mask: '<path d="M17 36L4 22L2 4L10 10H24L32 4L30 22Z" fill="#fff"/>',
    print: `<rect width="34" height="36" fill="${c}"/><path d="M2 4L10 10L6 20Z M32 4L24 10L28 20Z" fill="#4a2c1a"/><path d="M17 36L9 26L17 22L25 26Z" fill="#f2e2c8"/><ellipse cx="17" cy="27" rx="3.4" ry="2.4" fill="#241510"/><circle cx="12" cy="17" r="1.8" fill="#241510"/><circle cx="22" cy="17" r="1.8" fill="#241510"/>` };
  const tail = { c, w: 26, h: 30, y: 22, over: 6, mask: '<path d="M26 30Q4 26 6 2Q12 0 12 6Q12 20 26 22Z" fill="#fff"/>', print: `<rect width="26" height="30" fill="${tone(c, .92)}"/><path d="M6 2Q12 0 12 6V10H5Z" fill="#f2e2c8"/>` };
  return tentAnimal(id, x, z, rot, body, head, tail);
}

// A pigeon in the same fold: grey body over the spine with a darker wing bar, a head card with an iridescent neck and beak.
export function paperPigeon(id: string, x: number, z: number, rot: number, c = '#8d96a3'): Panel[] {
  const L = 42, S = 24, k = 1.35, g = (svg: string) => `<g transform="scale(${k})">${svg}</g>`;
  const body = { L, S, deg: 34, c, mask: `<path d="M0 0H${L}V${S - 8}L${L * .65} ${S}H${L * .3}L0 ${S - 8}Z" fill="#fff"/>`,
    print: `<rect width="${L}" height="${S}" fill="${c}"/><rect width="${L}" height="5" fill="${tone(c, 1.12)}"/><path d="M${L * .2} 8H${L * .72}" stroke="${tone(c, .62)}" stroke-width="3"/><path d="M${L * .2} 13H${L * .6}" stroke="${tone(c, .62)}" stroke-width="2.6"/><rect x="${L * .3}" y="${S - 3}" width="3" height="3" fill="#d9846a"/><rect x="${L * .62}" y="${S - 3}" width="3" height="3" fill="#d9846a"/>` };
  const head = { c, w: 14 * k, h: 18 * k, y: S * Math.cos(34 * Math.PI / 180) - 8, mask: g('<path d="M7 18L2 12Q1 4 7 2Q13 4 12 12Z M5 6L7 0L9 6Z" fill="#fff"/>'),
    print: g(`<rect width="14" height="18" fill="${c}"/><rect y="10" width="14" height="8" fill="#6f8f8a"/><circle cx="5" cy="6" r="1.2" fill="#f2b23c"/><circle cx="9" cy="6" r="1.2" fill="#f2b23c"/><path d="M6 8L7 12L8 8Z" fill="#e8a080"/>`) };
  const tail = { c: tone(c, .7), w: 14 * k, h: 10 * k, y: 9, over: 4, mask: g('<path d="M0 0L14 4V8L0 10Z" fill="#fff"/>'), print: g(`<rect width="14" height="10" fill="${tone(c, .7)}"/>`) };
  return tentAnimal(id, x, z, rot, body, head, tail);
}
