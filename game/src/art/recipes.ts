import { add, backOf, box, normal, on, rad, spin, tilted, unit, yaw, type Panel, type Stock, type V3 } from './kit.ts';

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

export const MB = { x: -260, z: -48, post: 84, w: 96, h: 72, d: 64 };

export function mailbox(): Panel[] {
  const { x, z, post, w, h, d } = MB, out: Panel[] = [];
  const wood = `<path d="M3 0C5 20 2 50 4 84M8 0C7 26 11 54 9 84M13 0C12 30 14 50 12.5 84" fill="none" stroke="#2b2622" stroke-opacity=".16" stroke-width=".7"/>`;
  out.push(...box({ id: 'post', x, z, w: 16, h: post, d: 16, stock: 'greyboard', c: '#8f8579', front: wood, left: wood, right: wood }));
  const foot = (id: string, cx: number, cz: number, fw: number, fd: number, rot: number) => {
    const r = yaw(rot);
    out.push({ id, stock: 'greyboard', c: '#8f8579', w: fw, h: fd, o: add([cx, .7, cz], r([-fw / 2, 0, fd / 2])), u: r([1, 0, 0]), v: r([0, 0, -1]), edge: 'cut', mask: `<path d="M0 ${fd}L${fw * .14} 0H${fw * .86}L${fw} ${fd}Z" fill="#fff"/>` });
  };
  foot('foot-front', x, z + 13, 22, 10, 0); foot('foot-left', x - 13, z, 22, 10, 90); foot('foot-right', x + 13, z, 22, 10, -90);

  const bodyPrint = `<path d="M0 ${h - 9}H${w}" stroke="${CREAM}" stroke-opacity=".0"/>`;
  const glueSeam = (fw: number) => `<path d="M0 3H${fw}" stroke="#7d2a12" stroke-opacity=".22" stroke-width="5"/>`;
  const slotX = 24, slotW = 48, slotY = 13, slotH = 7;
  const faceMask = `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0Z M${slotX} ${slotY}V${slotY + slotH}H${slotX + slotW}V${slotY}Z" fill="#fff"/>`;
  const body = box({ id: 'body', x, z, y: post, w, h, d, stock: 'cover', c: CORAL, front: bodyPrint, left: glueSeam(d), right: glueSeam(d), noTop: true });
  const front = { ...body[0], mask: faceMask };
  out.push(front, ...body.slice(1));
  out.push({ id: 'body-inside', stock: 'greyboard', c: '#2c1610', w: w - 4, h: h - 4, o: [x - w / 2 + 2, post + 2, z + d / 2 - 22], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold' });

  const trimMask = `<path fill-rule="evenodd" d="M0 0H${w - 8}V${h - 8}H0Z M5 5V${h - 13}H${w - 13}V5Z" fill="#fff"/>`;
  out.push(on(front, 1, 4, 4, w - 8, h - 8, { id: 'trim', stock: 'cover', c: CREAM, mask: trimMask }));
  const plate = on(front, 1.4, 28, 8, 40, 19, {
    id: 'plate', stock: 'bond', c: CREAM,
    mask: `<rect width="40" height="19" rx="3" fill="#fff"/>`,
    print: `<g fill="none" stroke="${DEEP}" stroke-width="1.4" stroke-linejoin="round"><rect x="12" y="4.5" width="16" height="10.5" rx="1"/><path d="M12 5.5L20 11L28 5.5"/></g><g fill="${SUN}"><circle cx="5" cy="9.5" r="1.5"/><circle cx="35" cy="9.5" r="1.5"/></g>`
  });
  out.push(plate);

  const flapDeg = 34, slotTop = post + h - slotY;
  const flapV: V3 = [0, -Math.cos(rad(flapDeg)), Math.sin(rad(flapDeg))];
  const flapP: Panel = { id: 'slot-flap', stock: 'cover', c: '#f26a3f', w: slotW + 2, h: slotH + 3, o: add([x - w / 2 + slotX - 1, slotTop + 1, z + d / 2 + 1.6], flapV, slotH + 3), u: [1, 0, 0], v: [0, -flapV[1], -flapV[2]], edge: 'cut', print: `<rect x="${(slotW + 2) / 2 - 6}" y="3.2" width="12" height="2.6" rx="1.3" fill="${CREAM}"/>` };
  out.push(flapP, backOf(flapP, '#a53a1b'));

  const letV = unit([.05, -.36, 1]);
  const letter: Panel = {
    id: 'letter', stock: 'bond', c: '#fdf9f0', w: 34, h: 24, o: add([x - 18, slotTop - slotH + 3, z + d / 2 - 8], letV, 0), u: [1, 0, -.04], v: [-letV[0], -letV[1], -letV[2]], edge: 'cut',
    print: `<path d="M0 .8H34" stroke="${CORAL}" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M0 2.6L17 11L34 2.6" fill="none" stroke="#c9bfae" stroke-width=".7"/>`
  };
  const letterFacing: Panel = { ...letter, o: add(letter.o, letV, 24), v: [-letV[0], -letV[1], -letV[2]] };
  out.push(letterFacing);

  const peak = 40, gy = post + h, gableMask = `<path d="M0 ${peak}L${w / 2} 0L${w} ${peak}Z" fill="#fff"/>`;
  const gable: Panel = { id: 'gable', stock: 'cover', c: CORAL, w, h: peak, o: [x - w / 2, gy, z + d / 2], u: [1, 0, 0], v: [0, 1, 0], edge: 'fold', mask: gableMask, print: `<g fill="none" stroke="${CREAM}" stroke-width="1.5"><circle cx="${w / 2}" cy="${peak * .66}" r="5.5"/></g><circle cx="${w / 2}" cy="${peak * .66}" r="1.6" fill="${CREAM}"/>` };
  out.push(gable, { ...gable, id: 'gable-rear', o: [x + w / 2, gy, z - d / 2], u: [-1, 0, 0], ghost: true, density: .1 });

  const over = 9, rl = Math.hypot(w / 2 + over, peak * (w / 2 + over) / (w / 2)), rd = d + 12, a = Math.atan2(peak, w / 2);
  const ridge: V3 = [x, gy + peak + 1, z + d / 2 + 6];
  const slope = (id: string, s: 1 | -1) => {
    const down: V3 = [s * Math.cos(a), -Math.sin(a), 0];
    const roof: Panel = s < 0
      ? { id, stock: 'cover', c: DEEP, w: rl, h: rd, o: add(ridge, down, rl), u: [-down[0], -down[1], -down[2]], v: [0, 0, -1], edge: 'cut' }
      : { id, stock: 'cover', c: DEEP, w: rl, h: rd, o: ridge, u: down, v: [0, 0, -1], edge: 'cut' };
    out.push({ ...roof, print: Array.from({ length: 5 }, (_, i) => `<path d="M${(i + 1) * rl / 6} 0V${rd}" stroke="#063f66" stroke-opacity=".55" stroke-width="1"/>`).join('') }, { ...backOf(roof, '#07456f') });
    const lip: Panel = s < 0
      ? { id: `${id}-edge`, stock: 'cover', c: '#f7ecd8', w: rl, h: 1.8, o: add(ridge, down, rl), u: [-down[0], -down[1], -down[2]], v: [down[1] * -1 * 0, -1, 0], edge: 'fold', ghost: false }
      : { id: `${id}-edge`, stock: 'cover', c: '#f7ecd8', w: rl, h: 1.8, o: ridge, u: down, v: [0, -1, 0], edge: 'fold' };
    out.push({ ...lip, u: s < 0 ? lip.u : lip.u, v: [0, 1, 0], o: add(lip.o, [0, -1.8, 0]) });
    const n = 7, step = (rl - 3) / n, r = step / 2;
    const scallop = `<path d="M0 0H${rl - 3}V${6 - r}${Array.from({ length: n }, () => `a${r} ${r} 0 0 1 ${-step} 0`).join('')}Z" fill="#fff"/>`;
    const barge: Panel = { id: `${id}-barge`, stock: 'cover', c: CREAM, w: rl - 3, h: 7, mask: scallop, edge: 'cut', v: [0, 1, 0],
      ...(s < 0 ? { o: add(add(ridge, down, rl - 3), [0, -8.5, -5]), u: [-down[0], -down[1], -down[2]] as V3 } : { o: add(ridge, [0, -8.5, -5]), u: down }) };
    out.push(barge);
  };
  slope('roof-l', -1); slope('roof-r', 1);

  const fa = 38, fu: V3 = [Math.cos(rad(fa)), Math.sin(rad(fa)), 0], fv: V3 = [-Math.sin(rad(fa)), Math.cos(rad(fa)), 0];
  const pivot: V3 = [x + w / 2 + 2.2, post + h * .34, z + 6];
  const flagMask = `<path d="M0 13.5H42V0H64V18H0Z" fill="#fff"/>`;
  const flag: Panel = { id: 'flag', stock: 'cover', c: SUN, w: 64, h: 18, o: add(add(pivot, fu, -8), fv, -2.25), u: fu, v: fv, edge: 'cut', mask: flagMask, print: `<circle cx="8" cy="15.75" r="1.5" fill="${INK}" fill-opacity=".75"/>` };
  out.push(flag, backOf(flag, '#d9972b'));
  return out;
}

export function tuft(id: string, x: number, z: number, w: number, h: number, c: string, rot = 0): Panel[] {
  const r = yaw(rot), p: Panel = { id, stock: 'sugar', c, w, h, o: add([x, 0, z], r([-w / 2, 0, 0])), u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', mask: `<path d="M0 ${h}L${w * .1} ${h * .34}L${w * .22} ${h * .7}L${w * .36} 0L${w * .48} ${h * .62}L${w * .64} ${h * .18}L${w * .74} ${h * .68}L${w * .92} ${h * .3}L${w} ${h}Z" fill="#fff"/>` };
  return [p, backOf(p)];
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
