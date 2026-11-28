import type { StationId } from '../game/content.ts';

// The station pop-up: two cut sheets that stand up over the car's roofline as the train stops, a picture of the place
// he is about to walk into (the car's own sign under it is its caption, so it carries no name). Two tones a shape, no
// gradients, no logo, no coral. Each painter gets the canvas, its size, and m = pixels per metre; the bottom .3 m is a
// plain base strip, hidden by the roofline.
type Paint = (g: CanvasRenderingContext2D, W: number, H: number, m: number) => void;
const BLUE = '#0092da', CREAM = '#fffaf0', SUN = '#f6b73c', INK = '#23262b', MINT = '#35b58a', BASE = '#e9e2d2';
const base = (g: CanvasRenderingContext2D, W: number, H: number, m: number, c = BASE) => { g.fillStyle = c; g.fillRect(.1 * m, H - .32 * m, W - .2 * m, .32 * m); };

const blibliBack: Paint = (g, W, H, m) => {
  base(g, W, H, m);
  g.fillStyle = CREAM; g.beginPath(); g.roundRect(.5 * m, .1 * m, 6.6 * m, .95 * m, .14 * m); g.fill();
  g.fillStyle = '#efe6d2'; g.fillRect(.5 * m, .82 * m, 6.6 * m, .23 * m);
  g.fillStyle = BLUE; g.beginPath(); g.roundRect(2.6 * m, .28 * m, 2.4 * m, .46 * m, .08 * m); g.fill();
  g.fillStyle = CREAM; for (let i = 0; i < 3; i++) g.fillRect((3.0 + i * .62) * m, .46 * m, .42 * m, .1 * m);
  const ax = .15 * m, aw = 7.3 * m, ay = 1.0 * m, ah = .82 * m, n = 9;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? CREAM : BLUE; const x = ax + i * aw / n; g.beginPath(); g.moveTo(x, ay); g.lineTo(x + aw / n, ay); g.lineTo(x + aw / n, ay + ah * .62); g.arc(x + aw / n / 2, ay + ah * .62, aw / n / 2, 0, Math.PI); g.closePath(); g.fill(); }
  g.fillStyle = '#0a6fa8'; g.fillRect(ax, ay, aw, .1 * m);
  g.fillStyle = '#3a4048'; g.fillRect(.7 * m, 1.75 * m, 6.2 * m, .25 * m);
};
const blibliFront: Paint = (g, W, H, m) => {
  const yb = H - .3 * m;
  const bag = (x: number, w: number, h: number, col: string) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(x, yb); g.lineTo(x + w * .06, yb - h); g.lineTo(x + w * .94, yb - h); g.lineTo(x + w, yb); g.closePath(); g.fill();
    g.fillStyle = '#0002'; g.beginPath(); g.moveTo(x + w * .7, yb); g.lineTo(x + w * .74, yb - h); g.lineTo(x + w * .94, yb - h); g.lineTo(x + w, yb); g.closePath(); g.fill();
    g.strokeStyle = INK; g.lineWidth = .055 * m; g.beginPath(); g.arc(x + w / 2, yb - h, w * .24, Math.PI, 0); g.stroke();
    g.fillStyle = CREAM; g.beginPath(); g.arc(x + w * .42, yb - h * .45, w * .16, 0, 7); g.fill();
  };
  bag(.3 * m, 1.3 * m, 1.35 * m, BLUE); bag(1.25 * m, .85 * m, .85 * m, SUN); bag(2.0 * m, .6 * m, .55 * m, MINT);
  const bx = (x: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, yb - h, w, h); g.fillStyle = '#0002'; g.fillRect(x + w * .8, yb - h, w * .2, h); g.fillStyle = CREAM; g.fillRect(x + w * .36, yb - h, w * .14, h); };
  bx(7.9 * m, 1.5 * m, .7 * m, '#c9a56b'); bx(8.1 * m, 1.0 * m, 1.2 * m, '#b98f55'); bx(8.9 * m, .95 * m, .95 * m, '#d6b57e');
  g.fillStyle = SUN; g.fillRect(9.25 * m, yb - 1.3 * m, .7 * m, .28 * m);
  g.fillStyle = BASE; g.fillRect(.1 * m, yb, W - .2 * m, .3 * m);
};
// Houses for sale and for rent, three roofs.
const homesBack: Paint = (g, W, H, m) => {
  base(g, W, H, m);
  const yb = H - .3 * m;
  const house = (x: number, w: number, h: number, roof: 'gable' | 'hip' | 'flat') => {
    g.fillStyle = '#f1e8d6'; g.fillRect(x, yb - h, w, h);
    g.fillStyle = '#b5532f'; g.beginPath();
    if (roof === 'gable') { g.moveTo(x - .15 * m, yb - h); g.lineTo(x + w / 2, yb - h - .75 * m); g.lineTo(x + w + .15 * m, yb - h); }
    else if (roof === 'hip') { g.moveTo(x - .15 * m, yb - h); g.lineTo(x + w * .25, yb - h - .5 * m); g.lineTo(x + w * .75, yb - h - .5 * m); g.lineTo(x + w + .15 * m, yb - h); }
    else { g.rect(x - .1 * m, yb - h - .15 * m, w + .2 * m, .15 * m); g.fill(); g.fillStyle = '#8a9aa8'; g.fillRect(x + w * .6, yb - h - .5 * m, .4 * m, .35 * m); }
    g.fill();
    g.fillStyle = '#3f51b5'; g.fillRect(x + w * .4, yb - .7 * m, w * .2, .7 * m);
    g.fillStyle = '#9fc3d9'; g.fillRect(x + w * .12, yb - h + .25 * m, w * .2, .3 * m); g.fillRect(x + w * .68, yb - h + .25 * m, w * .2, .3 * m);
  };
  house(.4 * m, 2 * m, 1.1 * m, 'gable'); house(2.9 * m, 2.2 * m, 1.2 * m, 'hip'); house(5.4 * m, 1.9 * m, 1.0 * m, 'flat');
};
const homesFront: Paint = (g, W, H, m) => {
  const yb = H - .3 * m;
  g.fillStyle = CREAM; for (let x = .2; x < 10; x += .32) { g.fillRect(x * m, yb - .5 * m, .16 * m, .5 * m); } g.fillRect(.2 * m, yb - .38 * m, 9.8 * m, .08 * m);
  const board = (x: number, col: string) => { g.fillStyle = '#7d8a96'; g.fillRect(x + .32 * m, yb - 1.2 * m, .06 * m, 1.2 * m); g.fillStyle = CREAM; g.fillRect(x, yb - 1.2 * m, .7 * m, .45 * m); g.fillStyle = col; g.fillRect(x, yb - .85 * m, .7 * m, .1 * m); };
  board(1 * m, '#b3263a'); board(8.4 * m, MINT);
  g.fillStyle = '#5a4030'; g.fillRect(5 * m, yb - .7 * m, .12 * m, .7 * m); g.fillStyle = '#4f8a4f'; g.beginPath(); g.arc(5.06 * m, yb - 1.05 * m, .48 * m, 0, 7); g.fill(); g.fillStyle = '#3f7a3f'; g.beginPath(); g.arc(5.2 * m, yb - 1.0 * m, .3 * m, 0, 7); g.fill();
  g.fillStyle = BASE; g.fillRect(.1 * m, yb, W - .2 * m, .3 * m);
};
// A stone yard: a stepped wall of slabs with one arch; leaning samples.
const stoneBack: Paint = (g, W, H, m) => {
  base(g, W, H, m);
  const yb = H - .3 * m, tones = ['#d8c390', '#c2b28a', '#a89a7a', '#e2d6b6'];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9 - r; c++) { g.fillStyle = tones[(r + c) % 4]; g.fillRect((.4 + r * .3 + c * .76) * m, yb - (r + 1) * .45 * m, .72 * m, .41 * m); }
  g.fillStyle = '#3a3430'; g.beginPath(); g.moveTo(3.2 * m, yb); g.lineTo(3.2 * m, yb - .8 * m); g.arc(3.65 * m, yb - .8 * m, .45 * m, Math.PI, 0); g.lineTo(4.1 * m, yb); g.fill();
};
const stoneFront: Paint = (g, W, H, m) => {
  const yb = H - .3 * m;
  ['#d8c390', '#a89a7a', '#e2d6b6'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); const x = (.6 + i * .7) * m; g.moveTo(x, yb); g.lineTo(x + .25 * m, yb - 1.2 * m); g.lineTo(x + .75 * m, yb - 1.15 * m); g.lineTo(x + .55 * m, yb); g.fill(); });
  g.fillStyle = '#9a8e78'; g.beginPath(); g.moveTo(7.8 * m, yb); g.lineTo(7.9 * m, yb - .9 * m); g.lineTo(9.2 * m, yb - 1 * m); g.lineTo(9.5 * m, yb); g.fill();
  g.strokeStyle = '#6f6656'; g.lineWidth = .04 * m; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo((8.1 + i * .3) * m, yb - .8 * m); g.lineTo((8.2 + i * .3) * m, yb - .5 * m); g.stroke(); }
  g.fillStyle = BASE; g.fillRect(.1 * m, yb, W - .2 * m, .3 * m);
};
// Home, at night: town blocks, lit windows, his one warm window, a moon.
const nightBack: Paint = (g, W, H, m) => {
  base(g, W, H, m, '#1c2647');
  const yb = H - .3 * m;
  g.fillStyle = '#f4efd8'; g.beginPath(); g.arc(6.6 * m, .4 * m, .25 * m, 0, 7); g.fill();
  [[.3, 1.2, 1.5], [1.6, 1.0, 1.1], [2.7, 1.4, 1.8], [4.2, 1.1, 1.3], [5.4, 1.5, 1.0]].forEach(([x, w, h], b) => {
    g.fillStyle = b % 2 ? '#243055' : '#1c2647'; g.fillRect(x * m, yb - h * m, w * m, h * m);
    for (let r = 0; r < Math.floor(h / .35); r++) for (let c = 0; c < Math.floor(w / .3); c++) if ((r * 5 + c * 3 + b) % 3 === 0 || (b === 2 && r === 1 && c === 2)) { g.fillStyle = b === 2 && r === 1 && c === 2 ? '#ff9a5c' : '#ffd48a'; g.fillRect((x + .08 + c * .3) * m, yb - h * m + (.12 + r * .35) * m, .14 * m, .18 * m); }
  });
};
const nightFront: Paint = (g, W, H, m) => {
  const yb = H - .3 * m;
  g.fillStyle = '#141a2c'; [[.2, 1.6, .7], [2.0, 2.2, .55], [6.6, 3.4, .65]].forEach(([x, w, h]) => g.fillRect(x * m, yb - h * m, w * m, h * m));
  g.fillStyle = '#3a3f47'; g.fillRect(4.6 * m, yb - 1.3 * m, .06 * m, 1.3 * m); g.fillStyle = '#ffd9a0'; g.beginPath(); g.arc(4.63 * m, yb - 1.32 * m, .12 * m, 0, 7); g.fill();
  g.fillStyle = '#ffb469'; g.fillRect(8.2 * m, yb - .5 * m, .3 * m, .45 * m);
  g.fillStyle = '#1c2647'; g.fillRect(.1 * m, yb, W - .2 * m, .3 * m);
};
export const CREST: Record<StationId, { back: Paint; front: Paint; night?: boolean }> = {
  blibli: { back: blibliBack, front: blibliFront },
  moperty: { back: homesBack, front: homesFront },
  radjastone: { back: stoneBack, front: stoneFront },
  home: { back: nightBack, front: nightFront, night: true }
};
