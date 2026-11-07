import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { normal, type Panel, type Scene, type Stock } from '../../src/art/kit.ts';
import { SCENES } from '../../src/art/scenes/index.ts';
import { SUN_TO_LIGHT } from '../../src/light.ts';

const HERE = dirname(fileURLToPath(import.meta.url)), GAME = join(HERE, '../..');
const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender', CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// PAPER_PREVIEW=1 skips Blender and lights every panel evenly: for laying a scene out, never for shipping.
const PREVIEW = !!process.env.PAPER_PREVIEW;
for (const bin of PREVIEW ? [CHROME] : [BLENDER, CHROME]) if (!existsSync(bin)) throw new Error(`missing required tool: ${bin}`);

const DENSITY = 3, PAD = 6, ATLAS_W = 4096;
const STOCK: Record<Stock, { core: string; freq: string; octaves: number; amp: number; transl: number; fleck: number }> = {
  cover: { core: '#fffaf0', freq: '.9 .9', octaves: 3, amp: .05, transl: .08, fleck: 0 },
  kraft: { core: '#e6c9a0', freq: '.8 1.6', octaves: 3, amp: .045, transl: .04, fleck: .05 },
  greyboard: { core: '#b5ada2', freq: '.9 .9', octaves: 3, amp: .06, transl: 0, fleck: .08 },
  bond: { core: '#ffffff', freq: '1.3 1.3', octaves: 2, amp: .03, transl: .3, fleck: 0 },
  vellum: { core: '#fff6e4', freq: '.5 .9', octaves: 3, amp: .06, transl: .62, fleck: 0 },
  sugar: { core: '', freq: '.7 .7', octaves: 4, amp: .07, transl: .16, fleck: .1 }
};

type Slot = { panel: Panel; x: number; y: number; pw: number; ph: number };
// The far backdrop and its layers pack last, so finish.py can crop them off the bottom of the shipped atlas.
function pack(panels: Panel[], DENSITY: number) {
  const far = (p: Panel) => !!(p.backdrop || (p.decal && panels.find(q => q.id === p.decal)?.backdrop));
  // Ghost faces only feed the bake (bounce colour, shadows), so they are packed coarse.
  const sized = panels.map(panel => { const d = (panel.ghost ? Math.min(panel.density ?? DENSITY, .35) : panel.density ?? DENSITY) * +(process.env.DENSITY_SCALE ?? 1); return { panel, far: far(panel), pw: Math.ceil(panel.w * d), ph: Math.ceil(panel.h * d) }; }).sort((a, b) => +a.far - +b.far || b.ph - a.ph);
  const slots: Slot[] = []; let x = PAD, y = PAD, row = 0;
  for (const [i, s] of sized.entries()) {
    if (s.pw + 2 * PAD > ATLAS_W) throw new Error(`panel ${s.panel.id} is wider than the atlas`);
    if (x + s.pw + PAD > ATLAS_W || (s.far && i && !sized[i - 1].far)) { x = PAD; y += row + PAD; row = 0; }
    slots.push({ ...s, x, y }); x += s.pw + PAD; row = Math.max(row, s.ph);
  }
  return { slots, height: y + row + PAD };
}
const svg = ({ panel: p, x, y, pw, ph }: Slot, i: number) => {
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

async function build(scene: Scene, samples: number) {
  const WORK = join(HERE, '.work', scene.id), OUT = join(GAME, 'src/art/baked', scene.id);
  mkdirSync(WORK, { recursive: true }); mkdirSync(OUT, { recursive: true });
  const ids = new Set<string>();
  for (const p of scene.panels) { if (ids.has(p.id)) throw new Error(`${scene.id}: duplicate panel ${p.id}`); ids.add(p.id); if (p.decal && !scene.panels.some(q => q.id === p.decal)) throw new Error(`${p.id}: decal parent ${p.decal} missing`); }
  const { slots, height } = pack(scene.panels, scene.density ?? DENSITY);
  const html = `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Caveat:wght@700&display=swap"><style>html,body{margin:0;background:transparent}svg{overflow:hidden}</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="crease" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="1.2"/></filter></svg>
<div style="position:relative;width:${ATLAS_W}px;height:${height}px">${slots.map(svg).join('\n')}</div></body></html>`;
  writeFileSync(join(WORK, 'albedo.html'), html.replaceAll('/PUBLIC/', `file://${join(GAME, 'public')}/`));
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: ATLAS_W, height } });
  await page.goto(`file://${join(WORK, 'albedo.html')}`);
  await page.evaluate(() => document.fonts.load('600 12px Fredoka'));
  if (!(await page.evaluate(() => document.fonts.check('600 12px Fredoka')))) throw new Error('Fredoka did not load: printed type would use a fallback face');
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(WORK, 'albedo.png'), omitBackground: true });
  await browser.close();
  const layout = {
    id: scene.id, atlas: { w: ATLAS_W, h: height }, sunToLight: SUN_TO_LIGHT, samples, light: scene.light, lamps: scene.lamps ?? [], camera: scene.camera, runs: scene.runs ?? [],
    panels: slots.map(({ panel: p, x, y, pw, ph }) => ({ id: p.id, stock: p.stock, transl: STOCK[p.stock].transl, emit: p.emit ?? 0, c: p.c, solid: !p.mask, o: p.o, u: p.u, v: p.v, w: p.w, h: p.h, ghost: !!p.ghost, backdrop: !!p.backdrop, decal: p.decal ?? null, view: !!p.view, motion: p.motion ?? null, group: p.group ?? null, show: p.show ?? null, split: p.split ?? 1, x, y, pw, ph, n: normal(p) }))
  };
  writeFileSync(join(WORK, 'layout.json'), JSON.stringify(layout));
  if (PREVIEW) execFileSync('python3', ['-c', `import numpy as n;n.save(${JSON.stringify(join(WORK, 'light.npy'))},n.full((${Math.round(height / 2)},${ATLAS_W / 2},3),.82,dtype=n.float32))`]);
  else execFileSync(BLENDER, ['--background', '--factory-startup', '--python-exit-code', '1', '--python', join(HERE, 'bake.py'), '--', WORK], { stdio: 'pipe', maxBuffer: 1 << 28 });
  console.log(execFileSync('python3', [join(HERE, 'finish.py'), WORK, OUT]).toString().trim());
}
const [which = 'all', samples = '1024'] = process.argv.slice(2);
const chosen = which === 'all' ? Object.values(SCENES) : [SCENES[which]];
if (!chosen[0]) throw new Error(`no scene ${which}: choose ${Object.keys(SCENES).join(', ')} or all`);
for (const s of chosen) await build(s, +samples);
