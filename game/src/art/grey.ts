// A scene drawn straight from its data, with no bake: every sheet is a flat colour (or its own cut shape and print as
// a small picture), shaded by which way it faces. This is the greybox a space is played in before it has any art, and
// a quick look at a scene that is about to be baked. It costs far more to draw than a baked scene: never ship it.
import { normal, unit, type Panel, type Scene } from './kit.ts';
import { SUN_TO_LIGHT } from '../light.ts';
import type { Manifest, Quad } from './fold.tsx';

const SUN = unit(SUN_TO_LIGHT);
const shade = (p: Panel) => { const n = normal(p); return +(0.74 + 0.3 * Math.max(0, n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2]) + (n[1] > .9 ? .04 : 0)).toFixed(3); };
function picture(p: Panel, k: number) {
  const shape = p.mask ?? `<rect width="${p.w}" height="${p.h}" fill="#fff"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="none"><defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${p.w}" height="${p.h}">${shape}</mask></defs><g mask="url(#m)"><rect width="${p.w}" height="${p.h}" fill="${p.c}"/>${p.print ?? ''}<rect width="${p.w}" height="${p.h}" fill="#000" opacity="${Math.max(0, 1 - k).toFixed(3)}"/>${shape.replace(/fill="#fff"/g, 'fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"')}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
export function greyManifest(scene: Scene): Manifest {
  const far = new Set(scene.panels.filter(p => p.backdrop).map(p => p.id));
  const quads: Quad[] = scene.panels.filter(p => !p.ghost && !far.has(p.id) && !(p.decal && far.has(p.decal))).map(p => {
    const k = shade(p), plain = !p.mask && !p.print;
    return { id: p.id, o: [...p.o], u: [...p.u], v: [...p.v], w: p.w, h: p.h, x: 0, y: 0, pw: p.w, ph: p.h, c: p.c, solid: !p.mask, motion: p.motion ?? null, group: p.group ?? null, show: p.show ?? null, actor: p.actor ?? null, tint: p.tint ?? null, shade: k, img: plain || p.tint ? undefined : picture(p, k) };
  });
  return { atlas: { w: 1, h: 1 }, runs: scene.runs ?? [], quads, actors: scene.actors };
}
