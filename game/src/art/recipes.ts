import { add, backOf, box, normal, on, rad, tilted, unit, yaw, type Panel, type V3 } from './kit.ts';

export const KRAFT = '#b98450', KRAFT_DARK = '#94633a', TAPE = '#d9b781', INK = '#2b2622';
export const CORAL = '#e8552d', CREAM = '#fff4e2', SUN = '#f6b73c', DEEP = '#0a6aa8', BLUE = '#0092da', GRASS = '#7fbf6a', FOLIAGE = '#3f9a5b';

export const flutes = (w: number, h: number) => `<path d="${Array.from({ length: Math.floor(w / 5) }, (_, i) => `M${(i + .5) * 5} 0V${h}`).join('')}" stroke="#5f3a1c" stroke-opacity=".04" stroke-width="1.6"/>`;
export const upArrows = (x: number, y: number) => `<g fill="${INK}" fill-opacity=".72" transform="translate(${x} ${y})"><path d="M0 18V6H-3L2 0 7 6H4V18Z"/><path d="M11 18V6H8L13 0 18 6H15V18Z"/><rect x="-3" y="20" width="21" height="1.6"/></g>`;
export const scuff = (x: number, y: number, r: number) => `<path d="M${x} ${y}l${r} ${r * .3}l${r * .4} ${r * .9}" fill="none" stroke="#f0d9b6" stroke-opacity=".2" stroke-width=".8" stroke-linecap="round"/>`;
export const bars = (x: number, y: number, h: number, n: number) => { let cx = x, s = 0; const out: string[] = []; for (let i = 0; i < n; i++) { s = (s * 31 + 7 + i) % 17; const w = .6 + (s % 3) * .45; out.push(`<rect x="${cx.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}"/>`); cx += w + .7 + (s % 2) * .5; } return `<g fill="${INK}">${out.join('')}</g>`; };

export type ParcelSpec = { id: string; label: string; color: string; x: number; z: number; y?: number; w: number; h: number; d: number; rot?: number; labelTilt?: number; scuffs?: string; open?: boolean };
export function parcel({ id, label, color, x, z, y = 0, w, h, d, rot = 0, labelTilt = 0, scuffs = '', open }: ParcelSpec): Panel[] {
  const seam = `<path d="M0 ${d / 2}H${w}" stroke="#4a2c14" stroke-opacity=".55" stroke-width=".9"/>`;
  const printFront = flutes(w, h) + scuffs + `<path d="M0 .8H${w}" stroke="#f3dcb8" stroke-opacity=".6" stroke-width="1"/>`;
  const faces = box({
    id, x, z, y, w, h, d, rot, stock: 'kraft', c: KRAFT, side: KRAFT, front: printFront, noTop: open,
    top: flutes(w, d) + seam + scuff(w * .16, d * .22, 5),
    left: flutes(d, h) + upArrows(d * .34, h * .22), right: flutes(d, h) + upArrows(d * .3, h * .22)
  });
  const front = faces[0], tapeW = Math.min(16, w * .16), tx = w / 2 - tapeW / 2 + 1.5;
  const tapeMask = (l: number) => `<path d="M0 0H${tapeW}V${l - 1}l-1.6 1l-1.6 -1l-1.6 1l-1.6 -1l-1.6 1l-1.6 -1l-1.6 1l-1.6 -1l-1.6 1L0 ${l - 1}Z" fill="#fff"/>`;
  const tapeLen = Math.round(h * .62);
  const labelW = Math.min(w * .58, 66), labelH = labelW * .52;
  const fs = Math.min(9, labelW * 1.45 / label.length), lx = w * .08, ly = h * .12;
  const labelPanel = tilted(on(front, 1.1, lx, ly, labelW, labelH, {
    id: `${id}-label`, stock: 'bond', c: '#fbf7ee',
    print: `<rect x="0" y="0" width="${labelW}" height="3.4" fill="${color}"/><text x="3" y="${labelH * .58}" font-family="Fredoka" font-weight="600" font-size="${fs}" fill="${INK}">${label}</text>${bars(3, labelH - 8.5, 6, Math.round(labelW / 2.1))}`
  }), labelTilt);
  const tapeFront = on(front, .7, tx, h - tapeLen, tapeW, tapeLen, { id: `${id}-tape`, stock: 'vellum', c: TAPE, mask: tapeMask(tapeLen) });
  const joint = on(faces[1], .6, 0, 0, 9, h, { id: `${id}-joint`, stock: 'kraft', c: '#c4915c', edge: 'fold', print: `<path d="M8.4 0V${h}" stroke="#4a2c14" stroke-opacity=".4" stroke-width=".8"/>` });
  const parts = [...faces, tapeFront, labelPanel, joint];
  if (!open) {
    const top = faces[faces.length - 1];
    parts.push(on(top, .7, tx, 0, tapeW, d, { id: `${id}-tape-top`, stock: 'vellum', c: TAPE, edge: 'fold', mask: `<rect width="${tapeW}" height="${d}" fill="#fff"/>` }));
  }
  return parts;
}

export function openFlaps({ id, x, z, y, w, d, rot }: { id: string; x: number; z: number; y: number; w: number; d: number; rot: number }): Panel[] {
  const r = yaw(rot), at = (lx: number, lz: number) => add([x, y, z], r([lx, 0, lz]));
  const out: Panel[] = [];
  const flap = (name: string, sign: 1 | -1, deg: number, fw: number) => {
    const u = sign < 0 ? r([1, 0, 0]) : r([-1, 0, 0]), lift: V3 = [0, Math.sin(rad(deg)), 0], along = r([0, 0, -1]);
    const uu = add([u[0] * Math.cos(rad(deg)), 0, u[2] * Math.cos(rad(deg))], lift);
    const o = at(sign * w / 2, d / 2);
    const p: Panel = { id: `${id}-${name}`, stock: 'kraft', c: KRAFT, w: fw, h: d, o, u: uu, v: along, edge: 'fold', print: flutes(fw, d) + `<path d="M${fw - .7} 0V${d}" stroke="#f3dcb8" stroke-width="1.2" stroke-opacity=".8"/>` };
    const facing = normal(p)[1] > 0 ? p : { ...p, u: [-uu[0], -uu[1], -uu[2]] as V3, o: add(o, uu, fw) };
    out.push(facing, backOf(facing, KRAFT_DARK));
    out.push({ id: `${id}-${name}-rib`, stock: 'kraft', c: '#d9b98c', w: fw, h: 3, o, u: uu, v: [0, 1, 0], edge: 'fold', print: `<path d="M0 1.5${Array.from({ length: Math.ceil(fw / 2.4) }, (_, i) => `q1.2 ${i % 2 ? 2.2 : -2.2} 2.4 0`).join('')}" fill="none" stroke="#6d4524" stroke-width=".7"/>` });
  };
  flap('flap-l', -1, 44, w * .46);
  flap('flap-r', 1, 26, w * .46);
  out.push({ id: `${id}-inside`, stock: 'kraft', c: '#5a3a20', w: w - 3, h: d - 3, o: add(at(-w / 2 + 1.5, d / 2 - 1.5), [0, -12, 0]), u: r([1, 0, 0]), v: r([0, 0, -1]), edge: 'fold' });
  const tissue = (i: number, lx: number, wd: number, ht: number, tilt: number, c: string) => out.push({
    id: `${id}-tissue-${i}`, stock: 'bond', c, w: wd, h: ht, o: add(at(lx, -d * .1 + i * 6), [0, -6, 0]), u: r([1, 0, 0]), v: unit([Math.sin(rad(tilt)), 1, -.25]), edge: 'cut',
    mask: `<path d="M0 ${ht}L${wd * .05} ${ht * .5}L${wd * .2} ${ht * .62}L${wd * .32} ${ht * .1}L${wd * .48} ${ht * .46}L${wd * .66} 0L${wd * .8} ${ht * .5}L${wd * .96} ${ht * .34}L${wd} ${ht}Z" fill="#fff"/>`
  });
  tissue(0, -w * .3, w * .6, 30, -6, '#ffffff');
  tissue(1, -w * .22, w * .5, 24, 8, '#fff1dc');
  return out;
}

let seed = 7;
const rnd = (a: number, b: number) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };
export const reseed = (n: number) => { seed = n; };

export const bricks = (w: number, h: number, c: string, mortar: string) => {
  const out: string[] = [`<rect width="${w}" height="${h}" fill="${mortar}"/>`];
  for (let r = 0, y = 0; y < h; r++, y += 26) for (let x = r % 2 ? -36 : 0; x < w; x += 72) out.push(`<rect x="${x + 1.5}" y="${y + 1.5}" width="69" height="23" fill="${c}" fill-opacity="${rnd(.55, 1).toFixed(2)}"/>`);
  return out.join('');
};
export const planks = (w: number, h: number, c: string, line: string, gap = 58, along: 'x' | 'y' = 'x') => {
  const out: string[] = [`<rect width="${w}" height="${h}" fill="${c}"/>`], n = Math.ceil((along === 'x' ? h : w) / gap), l = along === 'x' ? w : h;
  for (let i = 0; i < n; i++) {
    const a = i * gap, shade = rnd(-.09, .09);
    out.push(along === 'x' ? `<rect y="${a}" width="${w}" height="${gap}" fill="${shade > 0 ? '#fff' : '#000'}" opacity="${Math.abs(shade).toFixed(3)}"/><path d="M0 ${a}H${w}" stroke="${line}" stroke-width="2"/>` : `<rect x="${a}" width="${gap}" height="${h}" fill="${shade > 0 ? '#fff' : '#000'}" opacity="${Math.abs(shade).toFixed(3)}"/><path d="M${a} 0V${h}" stroke="${line}" stroke-width="2"/>`);
    for (let k = rnd(90, 260); k < l; k += rnd(220, 420)) out.push(along === 'x' ? `<path d="M${k} ${a}V${a + gap}" stroke="${line}" stroke-width="1.6"/>` : `<path d="M${a} ${k}H${a + gap}" stroke="${line}" stroke-width="1.6"/>`);
  }
  return out.join('');
};
export const specks = (w: number, h: number, c: string, n: number, r = 2.4) => Array.from({ length: n }, () => `<circle cx="${rnd(0, w).toFixed(0)}" cy="${rnd(0, h).toFixed(0)}" r="${rnd(r * .4, r).toFixed(1)}" fill="${c}" fill-opacity="${rnd(.2, .55).toFixed(2)}"/>`).join('');
export const scallopTop = (w: number, h: number, n: number, rise: number) => {
  let d = `M0 ${h}V${h * .5}`; const step = w / n;
  for (let i = 0; i < n; i++) d += `Q${(i + .25) * step} ${(h * .5 - rise * rnd(.5, 1)).toFixed(0)} ${(i + .5) * step} ${(h * rnd(.26, .6)).toFixed(0)}T${(i + 1) * step} ${(h * .5).toFixed(0)}`;
  return `<path d="${d}V${h}Z" fill="#fff"/>`;
};
export const pines = (w: number, y: number, c: string, n: number, s: number) => Array.from({ length: n }, () => { const x = rnd(0, w), k = rnd(.7, 1.2) * s, yy = y + rnd(-14, 14); return `<path d="M${x.toFixed(0)} ${(yy - k).toFixed(0)}l${(k * .34).toFixed(0)} ${(k * .6).toFixed(0)}h${(-k * .14).toFixed(0)}l${(k * .2).toFixed(0)} ${(k * .4).toFixed(0)}h${(-k * .8).toFixed(0)}l${(k * .2).toFixed(0)} ${(-k * .4).toFixed(0)}h${(-k * .14).toFixed(0)}Z" fill="${c}"/>`; }).join('');
export const cloud = (x: number, y: number, k: number, c = '#fffdf6') => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 60Q-6 34 26 34Q30 4 66 12Q90 -10 118 16Q150 8 156 36Q186 38 180 60Z" fill="${c}"/>`;
