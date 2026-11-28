import { card } from './paper.ts';

// Passers-by, greybox: one cut sheet each at paper-toy proportions (a big head, a short body), varied by colours,
// build and a face. Art comes later; this is enough to read as people and to be pushed about.
export type Look = { shirt: string; skin?: string; hair?: string; h?: number; face?: 'smile' | 'flat' | 'o' | 'shut'; arm?: boolean };
export function person(l: Look) {
  const h = l.h ?? 1.25, w = h * .68;
  return card(w, h, (g, W, H) => {
    const s = W / 85;
    g.fillStyle = '#2b2f36'; g.fillRect(28 * s, H - 22 * s, 11 * s, 20 * s); g.fillRect(46 * s, H - 22 * s, 11 * s, 20 * s);
    g.fillStyle = l.shirt; g.beginPath(); g.roundRect(17 * s, H - 74 * s, 51 * s, 56 * s, 12 * s); g.fill();
    if (l.arm) g.fillRect(58 * s, H - 118 * s, 9 * s, 50 * s);
    g.fillStyle = l.skin ?? '#f0c8a0'; g.beginPath(); g.ellipse(42 * s, H - 96 * s, 25 * s, 24 * s, 0, 0, 7); g.fill();
    g.fillStyle = l.hair ?? '#2a2a2a'; g.beginPath(); g.ellipse(42 * s, H - 106 * s, 26 * s, 14 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#23262b';
    if (l.face === 'shut') { g.fillRect(32 * s, H - 97 * s, 6 * s, 2 * s); g.fillRect(47 * s, H - 97 * s, 6 * s, 2 * s); }
    else { g.beginPath(); g.ellipse(35 * s, H - 97 * s, 2.4 * s, 3.4 * s, 0, 0, 7); g.ellipse(50 * s, H - 97 * s, 2.4 * s, 3.4 * s, 0, 0, 7); g.fill(); }
    g.strokeStyle = '#7a3b2a'; g.lineWidth = 2 * s; g.lineCap = 'round'; g.beginPath();
    if (l.face === 'o') g.arc(42 * s, H - 86 * s, 3 * s, 0, 7); else if (l.face === 'flat') { g.moveTo(38 * s, H - 86 * s); g.lineTo(46 * s, H - 86 * s); } else g.arc(42 * s, H - 89 * s, 5 * s, .3, Math.PI - .3);
    g.stroke();
  });
}
export const CROWD: Look[] = [
  { shirt: '#7b4b8f' }, { shirt: '#3f7a5b', skin: '#c68e63' }, { shirt: '#a0522d', hair: '#5a3a22', face: 'o' }, { shirt: '#35577f', skin: '#8d5b3c' },
  { shirt: '#8f6b3f', h: 1.05, face: 'o' }, { shirt: '#c0392b', skin: '#e9bf98', hair: '#3b2a1a' }, { shirt: '#2e86ab', face: 'flat' }, { shirt: '#6d8b3a', skin: '#c68e63', h: 1.4 }
];
