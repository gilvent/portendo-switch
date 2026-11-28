// Walk a station's scene left to right, working every mechanism (some twice), jumping at the end; a screenshot after
// each. `node tests/scene.mjs blibli [outdir]`
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); const fs = require('fs');
const AT = process.argv[2] ?? 'blibli', OUT = process.argv[3] ?? 'shots/' + AT, URL = process.argv[4] ?? 'http://localhost:5180/';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
const g = () => p.evaluate(() => { const G = window.__game; return { x: +G.hero.body.x.toFixed(2), near: G.near?.id ?? null, holes: G.save.holes.length, place: G.place.id, lane: G.place.lane }; });
await p.goto(URL + '?at=' + AT); await p.waitForTimeout(1500); await p.screenshot({ path: `${OUT}/00.png` });
const seen = new Set(); let n = 1;
for (let k = 0; k < 40; k++) {
  await p.keyboard.down('ArrowRight');
  let s; const t = Date.now();
  while (Date.now() - t < 5000) { s = await g(); if (s.near && !seen.has(s.near) && s.near !== 'back' && s.near !== 'visit') break; if (s.x > s.lane.x1 - 1.5) break; await p.waitForTimeout(25); }
  await p.keyboard.up('ArrowRight');
  if (!s.near || seen.has(s.near) || s.near === 'back' || s.near === 'visit') { await p.waitForTimeout(1600); await p.screenshot({ path: `${OUT}/${String(n++).padStart(2, '0')}-walk.png` }); if (s.x > s.lane.x1 - 1.5) break; continue; }
  seen.add(s.near);
  const times = ['lamp', 'camera', 'pedestal', 'panel', 'reviews', 'checkout'].includes(s.near) ? (s.near === 'panel' ? 3 : 2) : 1;
  const wait = { cans: 2600, fitting: 1500, till: 2600, box: 1400 }[s.near] ?? 700;
  for (let r = 0; r < times; r++) { await p.keyboard.press('Space'); await p.waitForTimeout(r === times - 1 ? Math.max(650, wait) : 700); }
  await p.screenshot({ path: `${OUT}/${String(n++).padStart(2, '0')}-${s.near}.png` });
  console.log(s.near, 'holes', (await g()).holes);
}
// The secret: jump under the bell near the way out (Blibli), wherever the scene keeps it.
const bellX = await p.evaluate(() => window.__bell ?? null);
if (bellX != null) {
  for (let k = 0; k < 200; k++) { const { x } = await g(); if (Math.abs(x - bellX) < .2) break; const key = x > bellX ? 'ArrowLeft' : 'ArrowRight'; await p.keyboard.down(key); await p.waitForTimeout(Math.min(200, Math.abs(x - bellX) / 4.4 * 1000 * .6 + 15)); await p.keyboard.up(key); await p.waitForTimeout(120); }
}
for (let j = 0; j < 3; j++) { await p.keyboard.down('Space'); await p.waitForTimeout(350); await p.keyboard.up('Space'); await p.waitForTimeout(600); }
await p.waitForTimeout(1500); await p.screenshot({ path: `${OUT}/${String(n++).padStart(2, '0')}-sale.png` });
await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/${String(n++).padStart(2, '0')}-secret.png` });
console.log('final', await g(), 'bell', bellX, 'errors', errs);
await b.close();
