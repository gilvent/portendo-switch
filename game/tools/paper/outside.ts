// Renders the train's outside layers (src/art/scenes/outside.ts) to paper strips: same stocks, grain and cut edges as
// the baked panels, lit evenly like any far backdrop. They are DOM layers, not quads, so they can scroll.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { strips, station } from '../../src/art/scenes/outside.ts';
import { CREASE, FONTS, svg } from './paper.ts';

const HERE = dirname(fileURLToPath(import.meta.url)), OUT = join(HERE, '../../src/art/baked/outside'), WORK = join(HERE, '.work', 'outside');
mkdirSync(OUT, { recursive: true }); mkdirSync(WORK, { recursive: true });
const all = [...strips(), ...station()];
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
const manifest: Record<string, unknown>[] = [];
for (const [i, st] of all.entries()) {
  const pw = Math.ceil(st.w * st.density), ph = Math.ceil(st.h * st.density);
  const panel = { id: st.id, stock: st.stock, c: st.c, w: st.w, h: st.h, o: [0, 0, 0] as const, u: [1, 0, 0] as const, v: [0, 1, 0] as const, mask: st.mask, print: st.print, edge: st.flat ? 'fold' as const : 'cut' as const };
  await page.setViewportSize({ width: pw, height: ph });
  await page.setContent(`<!doctype html><html><head>${FONTS}<style>html,body{margin:0;background:transparent}svg{overflow:hidden}</style></head><body>${CREASE}<div style="position:relative;width:${pw}px;height:${ph}px">${svg({ panel, x: 0, y: 0, pw, ph }, i)}</div></body></html>`);
  await page.evaluate(() => document.fonts.load('600 12px Fredoka'));
  await page.waitForTimeout(150);
  const png = join(WORK, `${st.id}.png`);
  await page.screenshot({ path: png, omitBackground: true });
  execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(png)}).save(${JSON.stringify(join(OUT, `${st.id}.webp`))}, quality=86, method=6)`]);
  manifest.push({ id: st.id, w: st.w, h: st.h, y: st.y, z: st.z, speed: st.speed, flat: !!st.flat, tile: st.tile !== false, ...(st.every ? { every: st.every } : {}) });
}
await browser.close();
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log(`outside: ${manifest.length} strips`);
