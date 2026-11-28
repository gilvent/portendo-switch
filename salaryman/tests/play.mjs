// A scripted first-time playthrough: screenshots at each beat and the numbers that matter (time to board, how far the
// pull-away throws him, whether a held strap holds). `node tests/play.mjs [url] [outdir]`
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const URL = process.argv[2] ?? 'http://localhost:5180/', OUT = process.argv[3] ?? 'shots';
const fs = require('fs'); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
const t0 = Date.now(), T = () => ((Date.now() - t0) / 1000).toFixed(1);
const g = () => p.evaluate(() => { const G = window.__game; return { place: G.place?.id, x: +G.hero.body.x.toFixed(2), y: +G.hero.body.y.toFixed(2), vx: +G.hero.body.vx.toFixed(2), near: G.near?.id ?? null, busy: G.busy, holes: G.save.holes, phase: G.place?.sim?.phase, mode: document.querySelector('.shell').dataset.mode, hang: !!G.hero.hang }; });
const shot = n => p.screenshot({ path: `${OUT}/${n}.png` });
const holdUntil = async (key, f, ms = 8000) => { await p.keyboard.down(key); const s = Date.now(); while (Date.now() - s < ms) { if (f(await g())) break; await p.waitForTimeout(30); } await p.keyboard.up(key); };
const waitFor = async (f, ms = 15000) => { const s = Date.now(); while (Date.now() - s < ms) { const v = await g(); if (f(v)) return v; await p.waitForTimeout(40); } throw new Error('timeout ' + f); };
await p.goto(URL); await p.waitForTimeout(1200); await shot('01-platform');
await holdUntil('ArrowRight', s => s.x > -1.5 || s.near === 'gate', 6000);
console.log(T(), 'at gate', await g()); await shot('02-gate-bump');
await p.keyboard.press('Space'); await p.waitForTimeout(700); await shot('03-ticket-print');
await waitFor(s => true); await p.waitForTimeout(2600); await shot('04-train-in');
await holdUntil('ArrowRight', s => s.near === 'door', 6000); console.log(T(), 'at door', await g());
await p.keyboard.press('Space');
await waitFor(s => s.place === 'car' && s.mode === 'docked'); console.log(T(), 'docked in car');
await p.waitForTimeout(400); await shot('05-car-docked');
// Ride 1: do nothing; measure the throw.
let minX = 0; const s1 = Date.now();
while (Date.now() - s1 < 4500) { const v = await g(); minX = Math.min(minX, v.x); if (v.phase === 'cruise') break; await p.waitForTimeout(40); }
console.log(T(), 'ride 1 throw (min x)', minX); await shot('06-thrown');
await waitFor(s => s.phase === 'stand', 12000); console.log(T(), 'stand'); await p.waitForTimeout(500); await shot('07-stand');
await holdUntil(((await g()).x < 0) ? 'ArrowRight' : 'ArrowLeft', s => s.near === 'doors', 6000);
await p.keyboard.press('Space');
await waitFor(s => s.place?.startsWith('stop-'), 6000); console.log(T(), 'first stop', (await g()).place); await p.waitForTimeout(900); await shot('08-stop');
for (let k = 0; k < 8; k++) { const v = await g(); if (v.place?.startsWith('stop-') === false) break; await holdUntil('ArrowRight', s => s.near && s.near !== 'visit', 6000); const n = await g(); if (!n.near || n.near === 'back') break; await p.keyboard.press('Space'); await p.waitForTimeout(500); if (k === 0) await shot('09-mech'); await holdUntil('ArrowRight', s => !s.near, 2000); }
console.log(T(), 'holes', (await g()).holes);
await holdUntil('ArrowRight', s => s.near === 'back', 8000); await shot('10-end'); await p.keyboard.press('Space');
await waitFor(s => s.place === 'car' && !s.busy, 6000); console.log(T(), 'reboarded');
// Ride 2: hold on during the chime.
await waitFor(s => s.phase === 'chime', 4000); await p.waitForTimeout(300);
await p.keyboard.press('Space'); await p.waitForTimeout(500); console.log(T(), 'holding?', (await g()).hang); await shot('11-hold');
await waitFor(s => s.phase === 'cruise', 4000); await p.waitForTimeout(300); console.log(T(), 'after accel', await g());
await waitFor(s => s.phase === 'stand', 12000); console.log(T(), 'stand 2');
// Miss the stop on purpose: the doors should close and go on.
await waitFor(s => s.phase === 'closing' || s.phase === 'chime', 12000); console.log(T(), 'missed stop -> train goes on');
console.log('errors', errs);
await b.close();
