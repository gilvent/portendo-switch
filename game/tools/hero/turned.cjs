// Run: node tools/hero/turned.cjs docs/hero/main-character-turned.png
// Option A turned three-quarters to his left (screen right), the way he walks: draw34() is the turned figure.
const { chromium } = require('playwright');
const INK = '#1d2228', SKIN = '#f3cfab', SKIN_D = '#e2ae85', HAIR = '#17181c', HAIR_L = '#3d4350', SUIT = '#22242a', SUIT_L = '#3a3d46', SUIT_D = '#131418', M = '#8c4a38';
const capY = x => 30.2 + ((x - 39) / 22) ** 2 * 9;
const tuft = (x, w, h, lean) => { const y0 = capY(x - w / 2) + 2.4, y1 = capY(x + w / 2) + 2.4, tx = x + lean, ty = capY(x) - h; return `M${(x - w / 2).toFixed(1)} ${y0.toFixed(1)}Q${(x - w * .3 + lean * .5).toFixed(1)} ${(ty + h * .45).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(x + w * .42 + lean * .4).toFixed(1)} ${(ty + h * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} ${y1.toFixed(1)}Z`; };
const lock = (x, w, len, lean) => `M${(x - w / 2).toFixed(1)} 40.4Q${(x - w * .2 + lean * .4).toFixed(1)} ${(41 + len * .7).toFixed(1)} ${(x + lean).toFixed(1)} ${(41.6 + len).toFixed(1)}Q${(x + w * .45 + lean * .3).toFixed(1)} ${(41 + len * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} 40.4Z`;
// The tousled crop seen from the side-front: the tufts at the back stand up, the ones toward the brow tip forward.
const TUFTS = [[19.5, 6, 2.4, -1.4], [24.5, 7, 4.6, -.4], [30, 6.4, 3.4, -1.2], [35.5, 7.6, 6.6, 1], [41.5, 6.6, 4.4, .2], [47, 7.6, 6.8, 2.8], [53, 6.6, 4.6, 2.2], [58, 6, 3.4, 3]];
const LOCKS = [[38, 6, 2.6, .8], [44.5, 7, 5.2, 2], [51, 6, 3, 1.6], [56.4, 5.4, 4.4, 2.2]];
// An eye, narrowed under a lid that slants down toward the nose (`inner`); `sxk` squeezes the far eye as it turns away.
const eye = (cx, cy, inner, sxk, lid = 1.8, sq = .6) => { const yo = cy - 4.6 + lid * .3, yi = cy - 4.6 + lid; return `<g transform="translate(${cx} ${cy}) scale(${.86 * sxk} .86) translate(${-cx} ${-cy})"><ellipse cx="${cx}" cy="${cy}" rx="6.4" ry="6.6" fill="#fff"/><ellipse cx="${cx + 1}" cy="${cy + .8}" rx="3.9" ry="4.9" fill="#4a3020"/><ellipse cx="${cx + 1}" cy="${cy + 1}" rx="2.1" ry="2.8" fill="#1f1611"/><circle cx="${cx - .5}" cy="${cy - .6}" r="1.7" fill="#fff"/><circle cx="${cx + 2.5}" cy="${cy + 3}" r=".8" fill="#fff"/><path d="M${cx - 8} ${cy - 9}H${cx + 8}V${inner > 0 ? yi : yo}L${cx - 8} ${inner > 0 ? yo : yi}Z" fill="${SKIN}"/><path d="M${cx - 8} ${cy + 9}H${cx + 8}V${cy + 6.4 - sq}Q${cx} ${cy + 7.6 - sq} ${cx - 8} ${cy + 6.4 - sq}Z" fill="${SKIN}"/><path d="M${cx - 7} ${inner > 0 ? yo : yi}L${cx + 7} ${inner > 0 ? yi : yo}" fill="none" stroke="${INK}" stroke-width="${3 / Math.sqrt(sxk)}" stroke-linecap="round"/><path d="M${cx - 5} ${cy + 6.2 - sq}Q${cx} ${cy + 7.2 - sq} ${cx + 5} ${cy + 6.2 - sq}" fill="none" stroke="${SKIN_D}" stroke-width="1.4" stroke-linecap="round"/></g>`; };
function draw34(o = {}) {
  const tee = o.tee ?? '#f6f4ee', teeD = o.teeD ?? '#d6d2c8', far = o.far ?? .62;
  const shoe = (x, c) => `<path d="M${x} 131Q${x} 127.6 ${x + 4} 127.6H${x + 10}Q${x + 17} 128 ${x + 18} 132.4V135H${x}Z" fill="${c}"/><path d="M${x + 4} 129.8H${x + 13}" stroke="#3a3e46" stroke-width="1.4" stroke-linecap="round"/>`;
  return `<g filter="url(#rim)" transform="rotate(${o.lean ?? 0} 40 134)">
  <rect x="30" y="110" width="10.6" height="20" fill="${SUIT_D}"/>${shoe(29, '#101114')}
  <rect x="41.4" y="110" width="10.6" height="20" fill="${SUIT}"/>${shoe(41, '#17181c')}
  <path d="M54 84Q61 90 60.6 101.6Q59.6 105 56.4 104Z" fill="${SUIT_D}"/><circle cx="59" cy="106.4" r="4.4" fill="${SKIN_D}"/>
  <rect x="38" y="72" width="9.6" height="9" fill="${SKIN_D}"/>
  <path d="M27 108H57V117.4Q52 120.2 46 118.4Q38 116.4 27 120Z" fill="${tee}"/><path d="M27 108H57V114.2H27Z" fill="${teeD}"/>
  <path d="M23 92Q23 81 32 79H49Q57 80 57.6 92V109.6Q57.6 112.6 54.6 112.6H26Q23 112.6 23 109.6Z" fill="${SUIT}"/>
  <path d="M23 93Q23 83 28 80.4V112.6H26Q23 112.6 23 109.6Z" fill="${SUIT_D}"/>
  <path d="M41 79H50.6L55.8 117.8Q51.4 119.8 47.6 118.6Q44.6 117.8 42.4 118.6Z" fill="${tee}"/><path d="M41.6 79Q46.4 85.4 50.2 79L49.4 79Q46.2 83.2 42.6 79Z" fill="${teeD}"/><path d="M51 96Q53.4 104 53.6 113H55.2L52.6 96Z" fill="${teeD}" opacity=".55"/>
  <path d="M41 79L34.6 82.6L42 104.6L45.6 88Z" fill="${SUIT_L}"/><path d="M50.6 79L54.2 82L55.2 99L52.6 88Z" fill="${SUIT_L}"/>
  <path d="M42 104.6L41.6 112.6" stroke="${SUIT_D}" stroke-width="1.2"/><circle cx="43.6" cy="107" r="1.3" fill="${SUIT_L}"/>
  <path d="M30.4 82Q24.6 92 26.6 103.6Q28.6 107 32.8 105.6L37 92Q37.4 84.4 34.4 82Z" fill="${SUIT_L}"/><path d="M26.8 102.6Q30 104.8 33.4 102.8L32.8 105.6Q29.6 107.2 27 105.2Z" fill="${tee}"/>
  <circle cx="30.4" cy="108.4" r="5.2" fill="${SKIN}"/><path d="M28.6 106.8H34M28.8 109.4H33.8" stroke="${SKIN_D}" stroke-width="1" stroke-linecap="round"/>
  <path d="M18 52Q18 34 40 34Q59.6 34 61.4 50Q62.4 56 61 61Q59.6 68.6 53 73.6Q47 77.6 41 77Q30 76 23 68Q18 61 18 52Z" fill="${SKIN}"/>
  <path d="M60.8 55.4Q65.4 58 62.6 61.6Q61.4 62.6 60.2 62Z" fill="${SKIN}"/><path d="M60.6 61.4Q61.8 62.6 63 61.4" fill="none" stroke="${SKIN_D}" stroke-width="1.2" stroke-linecap="round"/>
  <ellipse cx="27.4" cy="58" rx="4.4" ry="6" fill="${SKIN}"/><path d="M28.6 55Q25.8 58 28.6 61" fill="none" stroke="${SKIN_D}" stroke-width="1.3" stroke-linecap="round"/>
  ${eye(40.4, 56.4, 1, 1)}${eye(55.4, 56.4, -1, far)}
  <path d="M32.4 45.2L46.4 48.8M60.4 45.6L52.6 48.4" fill="none" stroke="${HAIR}" stroke-width="2.7" stroke-linecap="round"/>
  <path d="M43.6 68.2Q49.6 72.8 55.8 67.8" fill="none" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/><path d="M42.6 67L43.8 68.6M56.8 66.6L55.6 68.2" fill="none" stroke="${M}" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M16.2 60Q13.4 38 26 31Q41 25 54.4 30.8Q62.8 35.4 62 44.4L58.8 42.4Q50 40.6 40 41.2Q33.6 42 32.2 49.6L31.4 54Q26.4 51.6 23.4 55.6Q22.4 60 23.4 64.6L18.6 64Z" fill="${HAIR}"/>
  <path d="M16.2 60Q15.6 52 17.6 46L21 48.6Q19.6 53 21 60L23.4 64.6L18.6 64Z" fill="#33373f"/><path d="M31.4 54Q30.6 58 31.6 61.6L33.6 54.6Z" fill="#33373f"/>
  <path d="${TUFTS.map(t => tuft(...t)).join('')}" fill="${HAIR}"/><path d="${LOCKS.map(l => lock(...l)).join('')}" fill="${HAIR}"/>
  <path d="${TUFTS.filter((_, i) => i % 3 === 1).map(([x, w, h, l]) => tuft(x + w * .12, w * .34, h * .72, l * .8)).join('')}" fill="${HAIR_L}"/>
  </g>`;
}
module.exports = { draw34 };
if (require.main === module) {
  const V = [{ name: 'Turned, standing', note: 'Three-quarter view, upright.', o: {} }, { name: 'Turned, leaning in', note: 'The same, leaning into his stride.', o: { lean: 4 } }, { name: 'Turned further', note: 'The far eye narrower, closer to profile.', o: { far: .46, lean: 2 } }];
  const fig = (o, w, h, bg, flip) => `<svg viewBox="-8 2 96 140" width="${w}" height="${h}"><rect x="-8" y="2" width="96" height="140" fill="${bg}"/><ellipse cx="44" cy="136" rx="22" ry="4" fill="rgba(10,13,18,.22)"/><g ${flip ? 'transform="translate(80 0) scale(-1 1)"' : ''}>${draw34(o)}</g></svg>`;
  const html = `<body style="margin:0;padding:24px;background:#14181d;color:#fff;font:500 15px/21px Fredoka,system-ui,sans-serif"><svg width="0" height="0" style="position:absolute"><filter id="rim" x="-20%" y="-20%" width="150%" height="150%"><feMorphology operator="dilate" radius="3" in="SourceAlpha" result="d"/><feFlood flood-color="#fffaf0"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter></svg><h1 style="font-size:24px;margin:0 0 16px">Option A, turned three-quarters</h1><div style="display:flex;gap:18px">${V.map((v, i) => `<figure style="margin:0;width:288px">${fig(v.o, 288, 420, '#e9dfcc')}<div style="display:flex;gap:6px;margin-top:6px;align-items:center">${fig(v.o, 62, 90, '#dba38b')}${fig(v.o, 62, 90, '#e9edf1', true)}<div><b style="font-size:17px">${i + 1} · ${v.name}</b><br><span style="color:#aab2bd;font-size:13.5px">${v.note}<br>Small: walking right, walking left.</span></div></div></figure>`).join('')}</div></body>`;
  (async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 3 * 306 + 48, height: 400 }, deviceScaleFactor: 2 }); await p.setContent(html); await p.waitForTimeout(300); await p.screenshot({ path: process.argv[2], fullPage: true }); await b.close(); })();
}
