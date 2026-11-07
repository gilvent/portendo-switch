import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { normal, type Panel, type Scene } from '../../src/art/kit.ts';
import { CREASE, FONTS, STOCK, svg, type Slot } from './paper.ts';
import { SCENES } from '../../src/art/scenes/index.ts';
import { SUN_TO_LIGHT } from '../../src/light.ts';

const HERE = dirname(fileURLToPath(import.meta.url)), GAME = join(HERE, '../..');
const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender', CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
for (const bin of [BLENDER, CHROME]) if (!existsSync(bin)) throw new Error(`missing required tool: ${bin}`);

const DENSITY = 3, PAD = 6, ATLAS_W = 4096;
// The far backdrop and its layers pack last, so finish.py can crop them off the bottom of the shipped atlas.
function pack(panels: Panel[]) {
  const far = (p: Panel) => !!(p.backdrop || (p.decal && panels.find(q => q.id === p.decal)?.backdrop));
  const sized = panels.map(panel => { const d = panel.density ?? DENSITY; return { panel, far: far(panel), pw: Math.ceil(panel.w * d), ph: Math.ceil(panel.h * d) }; }).sort((a, b) => +a.far - +b.far || b.ph - a.ph);
  const slots: Slot[] = []; let x = PAD, y = PAD, row = 0;
  for (const [i, s] of sized.entries()) {
    if (s.pw + 2 * PAD > ATLAS_W) throw new Error(`panel ${s.panel.id} is wider than the atlas`);
    if (x + s.pw + PAD > ATLAS_W || (s.far && i && !sized[i - 1].far)) { x = PAD; y += row + PAD; row = 0; }
    slots.push({ ...s, x, y }); x += s.pw + PAD; row = Math.max(row, s.ph);
  }
  return { slots, height: y + row + PAD };
}
async function build(scene: Scene, samples: number) {
  const WORK = join(HERE, '.work', scene.id), OUT = join(GAME, 'src/art/baked', scene.id);
  mkdirSync(WORK, { recursive: true }); mkdirSync(OUT, { recursive: true });
  const ids = new Set<string>();
  for (const p of scene.panels) { if (ids.has(p.id)) throw new Error(`${scene.id}: duplicate panel ${p.id}`); ids.add(p.id); if (p.decal && !scene.panels.some(q => q.id === p.decal)) throw new Error(`${p.id}: decal parent ${p.decal} missing`); }
  const { slots, height } = pack(scene.panels);
  const html = `<!doctype html><html><head>${FONTS}<style>html,body{margin:0;background:transparent}svg{overflow:hidden}</style></head><body>
${CREASE}
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
  execFileSync(BLENDER, ['--background', '--factory-startup', '--python-exit-code', '1', '--python', join(HERE, 'bake.py'), '--', WORK], { stdio: 'pipe', maxBuffer: 1 << 28 });
  console.log(execFileSync('python3', [join(HERE, 'finish.py'), WORK, OUT]).toString().trim());
}
const [which = 'all', samples = '1024'] = process.argv.slice(2);
const chosen = which === 'all' ? Object.values(SCENES) : [SCENES[which]];
if (!chosen[0]) throw new Error(`no scene ${which}: choose ${Object.keys(SCENES).join(', ')} or all`);
for (const s of chosen) await build(s, +samples);
