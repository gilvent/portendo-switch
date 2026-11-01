import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const shots = process.argv.slice(2).map(a => a.split('='));
const srv = spawn('npx', ['vite', '--port', '4620', '--strictPort'], { stdio: 'ignore', detached: true }); await new Promise(r => setTimeout(r, 2200));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
page.on('pageerror', e => console.log('pageerror', e.message));
for (const [out, url] of shots) { await page.goto(`http://localhost:4620${url}`); await page.waitForSelector('[data-testid="paper-scene"]', { state: 'attached', timeout: 15000 }); await page.waitForTimeout(1500); await page.screenshot({ path: out }); }
await browser.close(); process.kill(-srv.pid!); process.exit(0);
