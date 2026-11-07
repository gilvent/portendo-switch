import type { Panel, Stock } from '../../src/art/kit.ts';

export const STOCK: Record<Stock, { core: string; freq: string; octaves: number; amp: number; transl: number; fleck: number }> = {
  cover: { core: '#fffaf0', freq: '.9 .9', octaves: 3, amp: .05, transl: .08, fleck: 0 },
  kraft: { core: '#e6c9a0', freq: '.8 1.6', octaves: 3, amp: .045, transl: .04, fleck: .05 },
  greyboard: { core: '#b5ada2', freq: '.9 .9', octaves: 3, amp: .06, transl: 0, fleck: .08 },
  bond: { core: '#ffffff', freq: '1.3 1.3', octaves: 2, amp: .03, transl: .3, fleck: 0 },
  vellum: { core: '#fff6e4', freq: '.5 .9', octaves: 3, amp: .06, transl: .62, fleck: 0 },
  sugar: { core: '', freq: '.7 .7', octaves: 4, amp: .07, transl: .16, fleck: .1 }
};

export type Slot = { panel: Panel; x: number; y: number; pw: number; ph: number };
// One sheet's albedo: its stock colour, print, grain, fibre flecks and cut or creased edge, as an SVG at slot size.
export const svg = ({ panel: p, x, y, pw, ph }: Slot, i: number) => {
  const stock = STOCK[p.stock], s = { ...stock, core: stock.core || p.c }, m = `m${i}`, rectMask = `<rect width="${p.w}" height="${p.h}" fill="#fff"/>`;
  const shape = p.mask ?? rectMask, n = Math.max(p.w, p.h);
  const edge = p.edge === 'cut'
    ? `<g>${shape.replace(/fill="#fff"/g, `fill="none" stroke="${s.core}" stroke-width="1.1"`)}</g>`
    : `<rect width="${p.w}" height="${p.h}" fill="none" stroke="${s.core}" stroke-opacity=".62" stroke-width="1.1" filter="url(#crease)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;left:${x}px;top:${y}px" width="${pw}" height="${ph}" viewBox="0 0 ${p.w} ${p.h}">
<defs><mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="${p.w}" height="${p.h}">${shape}</mask>
<filter id="g${i}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${s.freq}" numOctaves="${s.octaves}" seed="${i * 7 + 3}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -.62"/></filter>
<filter id="f${i}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".5 .09" numOctaves="2" seed="${i * 11 + 5}"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  0 3.4 0 0 -1.95"/></filter></defs>
<g mask="url(#${m})"><rect width="${n}" height="${n}" fill="${p.c}"/>${p.print ?? ''}
<rect width="${p.w}" height="${p.h}" fill="#1a1006" filter="url(#g${i})" style="opacity:${s.amp * 2.4}"/>
${s.fleck ? `<rect width="${p.w}" height="${p.h}" filter="url(#f${i})" opacity="${s.fleck}"/>` : ''}
${edge}</g></svg>`;
};
export const CREASE = '<svg width="0" height="0" style="position:absolute"><filter id="crease" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="1.2"/></filter></svg>';
export const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Caveat:wght@700&display=swap">';
