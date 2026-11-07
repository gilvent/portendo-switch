export type V3 = readonly [number, number, number];
export type Stock = 'cover' | 'kraft' | 'greyboard' | 'bond' | 'vellum' | 'sugar';
export type Panel = {
  id: string; stock: Stock; c: string; o: V3; u: V3; v: V3; w: number; h: number;
  mask?: string; print?: string; edge?: 'cut' | 'fold'; ghost?: boolean; density?: number; decal?: string;
  emit?: number; motion?: Motion; group?: string; backdrop?: boolean; show?: Show;
  // Ship this sheet as `split` side-by-side tiles: browsers stop drawing one very wide plane seen edge-on.
  split?: number;
  // With `decal`: painted onto the parent as the game camera sees it, not straight along the parent's normal.
  view?: boolean;
};
// A panel with `show` exists only while its toy is in one of the listed states. Such panels are baked as phantoms:
// lit like everything else, but they cast no shadow, so the variants that share one spot never shade each other.
export type Show = { toy: string; at: number[] };
// A motion plays while the courier stands at stop `when`, or while toy `toy` is in one of the states `at`.
// `roll` turns the piece in its own plane about the middle of its top edge, like a strap swinging from a rail.
export type Motion = { when?: string; toy?: string; at?: number[]; edge?: 'top' | 'bottom' | 'left' | 'right'; deg?: number; slide?: V3; roll?: number };
export type Lamp = { at: V3; color: readonly [number, number, number]; energy: number };
export type Run = { group: string; from: V3; to: V3; count: number; seconds: number };
export type Scene = {
  id: string; panels: Panel[]; runs?: Run[]; lamps?: Lamp[];
  light: { sun: number; sky: number; skyColor: readonly [number, number, number] };
  camera: { zoom: number; x0: number; x1: number; lift?: number };
};

export const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const unit = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
export const rad = (d: number) => d * Math.PI / 180;
export const normal = (p: Pick<Panel, 'u' | 'v'>) => unit(cross(p.u, p.v));
export const yaw = (d: number) => (a: V3): V3 => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [a[0] * c + a[2] * s, a[1], -a[0] * s + a[2] * c]; };
export const spin = (a: V3, axis: V3, d: number): V3 => {
  const c = Math.cos(rad(d)), s = Math.sin(rad(d)), n = unit(axis), m = cross(n, a), k = (n[0] * a[0] + n[1] * a[1] + n[2] * a[2]) * (1 - c);
  return [a[0] * c + m[0] * s + n[0] * k, a[1] * c + m[1] * s + n[1] * k, a[2] * c + m[2] * s + n[2] * k];
};
export const backOf = (p: Panel, c = p.c): Panel => ({
  ...p, id: `${p.id}-back`, c, print: undefined, o: add(add(p.o, p.u, p.w), normal(p), -.5), u: [-p.u[0], -p.u[1], -p.u[2]],
  mask: p.mask ? `<g transform="translate(${p.w} 0) scale(-1 1)">${p.mask}</g>` : undefined
});

export type BoxSpec = { id: string; x: number; z: number; y?: number; w: number; h: number; d: number; rot?: number; stock: Stock; c: string; side?: string; front?: string; left?: string; right?: string; top?: string; noTop?: boolean };
export function box({ id, x, z, y = 0, w, h, d, rot = 0, stock, c, side, front, left, right, top, noTop }: BoxSpec): Panel[] {
  const r = yaw(rot), at = (lx: number, ly: number, lz: number) => add([x, y, z], r([lx, ly, lz])), up: V3 = [0, 1, 0], s = side ?? c;
  const faces: Panel[] = [
    { id: `${id}-front`, stock, c, w, h, o: at(-w / 2, 0, d / 2), u: r([1, 0, 0]), v: up, print: front, edge: 'fold' },
    { id: `${id}-right`, stock, c: s, w: d, h, o: at(w / 2, 0, d / 2), u: r([0, 0, -1]), v: up, print: right, edge: 'fold' },
    { id: `${id}-left`, stock, c: s, w: d, h, o: at(-w / 2, 0, -d / 2), u: r([0, 0, 1]), v: up, print: left, edge: 'fold' },
    { id: `${id}-rear`, stock, c: s, w, h, o: at(w / 2, 0, -d / 2), u: r([-1, 0, 0]), v: up, ghost: true, density: .1 },
    { id: `${id}-under`, stock, c: s, w, h: d, o: at(-w / 2, 0, -d / 2), u: r([1, 0, 0]), v: r([0, 0, 1]), ghost: true, density: .1 }
  ];
  if (!noTop) faces.push({ id: `${id}-top`, stock, c, w, h: d, o: at(-w / 2, h, d / 2), u: r([1, 0, 0]), v: r([0, 0, -1]), print: top, edge: 'fold' });
  return faces;
}
export const on = (p: Panel, gap: number, x: number, y: number, w: number, h: number, rest: Partial<Panel> & Pick<Panel, 'id' | 'stock' | 'c'>): Panel => ({
  o: add(add(add(p.o, p.u, x / Math.hypot(...p.u)), p.v, y / Math.hypot(...p.v)), normal(p), gap), u: p.u, v: p.v, w, h, edge: 'cut', decal: p.id, ...rest
});
export const tilted = (p: Panel, deg: number): Panel => {
  const c: V3 = add(add(p.o, p.u, p.w / 2), p.v, p.h / 2), n = normal(p), u = spin(p.u, n, deg), v = spin(p.v, n, deg);
  return { ...p, u, v, o: add(add(c, u, -p.w / 2), v, -p.h / 2) };
};

const CORNER = { top: (p: Panel) => add(p.o, p.v, p.h), bottom: (p: Panel) => p.o, left: (p: Panel) => p.o, right: (p: Panel) => add(p.o, p.u, p.w) };

export function hinged(p: Panel, edge: keyof typeof CORNER, deg: number): Panel {
  const axis = edge === 'top' || edge === 'bottom' ? p.u : p.v, pivot = CORNER[edge](p), u = spin(p.u, axis, deg), v = spin(p.v, axis, deg);
  const o = add(pivot, spin([p.o[0] - pivot[0], p.o[1] - pivot[1], p.o[2] - pivot[2]], axis, deg));
  return { ...p, o, u, v };
}
export const slot = (w: number, h: number, ...holes: [number, number, number, number][]) => `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0Z ${holes.map(([x, y, hw, hh]) => `M${x} ${y}V${y + hh}H${x + hw}V${y}Z`).join(' ')}" fill="#fff"/>`;
export const tab = (p: Panel, edge: 'left' | 'right', w: number, id: string, c: string): Panel => on(p, .6, edge === 'left' ? 0 : p.w - w, 0, w, p.h, { id, stock: p.stock, c, edge: 'fold' });
export const layers = (...prints: string[]) => prints.join('');

export function relief(parent: Panel, panels: Panel[]): Panel[] {
  const n = normal(parent);
  return panels.map(p => (normal(p)[0] * n[0] + normal(p)[1] * n[1] + normal(p)[2] * n[2] > .5 ? { ...p, decal: parent.id } : { ...p, ghost: true }));
}

// Relief that keeps its volume: every piece is real in the bake (it lights and shades the wall), then each face that turns
// toward the camera is painted onto the wall where the camera sees it. Boxes keep their ends and tops; no quad is added.
export const carved = (parent: Panel, panels: Panel[]): Panel[] => panels.map(p => ({ ...p, decal: parent.id, view: true }));
