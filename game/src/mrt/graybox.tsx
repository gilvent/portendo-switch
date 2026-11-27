// The greybox: any baked space drawn straight from its recipe, with no bake and no print. Every sheet is a plain
// rectangle in a grey that only says which way it faces. `?graybox` in the address shows it. It is how the dynamics
// were tuned before any paper was cut (docs/MRT_DESIGN.md), and it stays, so a change to how something plays can be
// judged without the art in the way. The recipes load only when it is asked for.
import { useEffect, useState } from 'react';
import { PaperScene, type Manifest, type Toys } from '../art/fold.tsx';

export const GRAYBOX = typeof location !== 'undefined' && new URLSearchParams(location.search).has('graybox');
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const LIGHT = [-.35, .8, .5];

export function GrayScene({ art, near, toys }: { art: string; near: string | null; toys: Toys }) {
  const [m, setM] = useState<Manifest | null>(null);
  useEffect(() => {
    let live = true;
    void Promise.all([import('../art/scenes/index.ts'), import('../art/kit.ts')]).then(([{ SCENES }, { normal }]) => {
      const scene = SCENES[art];
      if (!live || !scene) return;
      const quads = scene.panels.filter(p => !p.ghost && !p.backdrop && !(p.decal && !p.view && !p.motion && !p.show)).map(p => {
        const n = normal(p), lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]), dark = /^#[0-3]/.test(p.c) ? .55 : 1;
        const g = Math.round((118 + lit * 112) * dark), c = p.motion?.live || p.show || p.motion ? `rgb(${g + 20},${Math.round(g * .78)},${Math.round(g * .62)})` : `rgb(${g},${g + 2},${g + 6})`;
        const cut = p.mask ? `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="none">${p.mask}</svg>`)}")` : undefined;
        return { cut, id: p.id, o: [...p.o], u: [...p.u], v: [...p.v], w: p.w, h: p.h, x: 0, y: 0, pw: p.w, ph: p.h, c, solid: true, motion: p.motion ?? null, group: p.group ?? null, show: p.show ?? null };
      });
      setM({ atlas: { w: 1, h: 1 }, runs: scene.runs ?? [], quads });
    });
    return () => { live = false; };
  }, [art]);
  return m ? <PaperScene manifest={m} url={BLANK} near={near} toys={toys} art={art} /> : null;
}
