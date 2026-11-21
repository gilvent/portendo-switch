// Run: node tools/hero/turned.cjs docs/hero/main-character-turned.png
// Option A turned three-quarters to his left (screen right), the way he walks: draw34() is the turned figure.
const { chromium } = require('playwright');
const INK = '#1d2228', SKIN = '#f3cfab', SKIN_D = '#e2ae85', HAIR = '#17181c', HAIR_L = '#3d4350', SUIT = '#22242a', SUIT_L = '#3a3d46', SUIT_D = '#131418', M = '#8c4a38';
const capY = x => 30.2 + ((x - 39) / 22) ** 2 * 9;
const tuft = (x, w, h, lean) => { const y0 = capY(x - w / 2) + 2.4, y1 = capY(x + w / 2) + 2.4, tx = x + lean, ty = capY(x) - h; return `M${(x - w / 2).toFixed(1)} ${y0.toFixed(1)}Q${(x - w * .3 + lean * .5).toFixed(1)} ${(ty + h * .45).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(x + w * .42 + lean * .4).toFixed(1)} ${(ty + h * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} ${y1.toFixed(1)}Z`; };
const lock = (x, w, len, lean) => `M${(x - w / 2).toFixed(1)} 40.4Q${(x - w * .2 + lean * .4).toFixed(1)} ${(41 + len * .7).toFixed(1)} ${(x + lean).toFixed(1)} ${(41.6 + len).toFixed(1)}Q${(x + w * .45 + lean * .3).toFixed(1)} ${(41 + len * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} 40.4Z`;
// Three cuts of the same tousled crop, seen from the side-front. Tufts are [x, width, height, lean]; locks fall over
// the brow as [x, width, length, lean]. Toward the back they stand up; toward the brow they tip forward.
const HAIRS = {
  tousle: { tufts: [[18.5, 6, 2.2, -1.6], [23.5, 7, 4.4, -.8], [29, 6.4, 3.2, -1.4], [34.5, 7.6, 6.4, .6], [40.5, 6.6, 4.2, -.2], [46, 7.6, 6.8, 2.6], [52, 6.6, 4.8, 2.2], [57.4, 6, 3.6, 3]], locks: [[39, 6, 2.4, .8], [45, 7, 5, 2], [51.4, 6, 3, 1.6], [56.6, 5.4, 4.2, 2.2]] },
  forward: { tufts: [[18.5, 6, 2, -1.2], [23.5, 6.6, 3.4, -.4], [29, 6.6, 4.4, .8], [34.5, 7, 5.2, 1.8], [40.5, 7, 6.2, 2.6], [46.5, 7.6, 7.2, 3.6], [52.6, 7, 6, 4], [58, 6, 4.4, 4.2]], locks: [[36.6, 6, 3, 1.6], [42.6, 7, 5.6, 2.8], [49, 7, 7, 3.4], [55.4, 6, 5, 3]] },
  crown: { tufts: [[19, 5.6, 1.6, -1], [24, 6.4, 3.4, -1.2], [29.6, 6.6, 5.6, -.4], [35.4, 7.4, 7.6, .6], [41.6, 7, 8.2, 1.2], [47.6, 7, 6.4, 2.4], [53, 6.4, 4.4, 2.6], [58, 5.6, 2.8, 2.6]], locks: [[42, 6, 2.2, 1], [48.4, 6.4, 3.6, 2], [54.6, 5.6, 2.6, 1.8]], fade: true },
};
// The same sure smile, carried further toward the middle of the face, in three cuts.
const tick = (x0, y0, x1, y1) => `<path d="M${x0 - 1} ${y0 - 1.4}L${x0 + .2} ${y0 + .4}M${x1 + 1} ${y1 - 1.4}L${x1 - .2} ${y1 + .2}" fill="none" stroke="${M}" stroke-width="1.3" stroke-linecap="round"/>`;
const smile = d => `<path d="${d}" fill="none" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/>`;
// The original smile was 12 wide (43.6 to 55.8). These keep that width, give or take two units, moved toward the
// middle of the face, with the curve reshaped for the turn: the half nearer the camera is longer and fuller, the far
// half is foreshortened.
const MOUTHS = {
  // even: a plain arc, shifted in
  even: smile('M41.4 68Q48.2 73 55.2 67.8') + tick(41.4, 68, 55.2, 67.8),
  // near-heavy: deepest under the near eye, flattening as it turns away
  near: smile('M40.8 67.8C43.6 72.6 50.4 72.6 55 68.2') + tick(40.8, 67.8, 55, 68.2),
  // lifted: the same, with the far corner a touch higher
  lifted: smile('M41.6 68.4C44.6 72.8 51 72.2 55.6 67') + tick(41.6, 68.4, 55.6, 67),
  original: smile('M43.6 68.2Q49.6 72.8 55.8 67.8') + tick(43.6, 68.2, 55.8, 67.8),
};
// An eye, narrowed under a lid that slants down toward the nose (`inner`); `sxk` squeezes the far eye as it turns away.
const eye = (cx, cy, inner, sxk, lid = 1.8, sq = .6) => { const yo = cy - 4.6 + lid * .3, yi = cy - 4.6 + lid; return `<g transform="translate(${cx} ${cy}) scale(${.86 * sxk} .86) translate(${-cx} ${-cy})"><ellipse cx="${cx}" cy="${cy}" rx="6.4" ry="6.6" fill="#fff"/><ellipse cx="${cx + 1}" cy="${cy + .8}" rx="3.9" ry="4.9" fill="#4a3020"/><ellipse cx="${cx + 1}" cy="${cy + 1}" rx="2.1" ry="2.8" fill="#1f1611"/><circle cx="${cx - .5}" cy="${cy - .6}" r="1.7" fill="#fff"/><circle cx="${cx + 2.5}" cy="${cy + 3}" r=".8" fill="#fff"/><path d="M${cx - 8} ${cy - 9}H${cx + 8}V${inner > 0 ? yi : yo}L${cx - 8} ${inner > 0 ? yo : yi}Z" fill="${SKIN}"/><path d="M${cx - 8} ${cy + 9}H${cx + 8}V${cy + 6.4 - sq}Q${cx} ${cy + 7.6 - sq} ${cx - 8} ${cy + 6.4 - sq}Z" fill="${SKIN}"/><path d="M${cx - 7} ${inner > 0 ? yo : yi}L${cx + 7} ${inner > 0 ? yi : yo}" fill="none" stroke="${INK}" stroke-width="${3 / Math.sqrt(sxk)}" stroke-linecap="round"/><path d="M${cx - 5} ${cy + 6.2 - sq}Q${cx} ${cy + 7.2 - sq} ${cx + 5} ${cy + 6.2 - sq}" fill="none" stroke="${SKIN_D}" stroke-width="1.4" stroke-linecap="round"/></g>`; };
// `pocket` says which arm has its hand in the trouser pocket: 'near' (the arm toward the camera) or 'far'. The other
// hangs with a closed fist. It is always his RIGHT hand: facing right that is the near arm, and facing left (the same
// drawing mirrored) it is the far one, so figure() swaps the arms rather than only flipping the sheet.
function draw34(o = {}) {
  const tee = o.tee ?? '#f6f4ee', teeD = o.teeD ?? '#d6d2c8', far = o.far ?? .62, h = HAIRS[o.hair ?? 'tousle'], pocket = o.pocket ?? 'near';
  const shoe = (x, c) => `<path d="M${x} 131Q${x} 127.6 ${x + 4} 127.6H${x + 10}Q${x + 17} 128 ${x + 18} 132.4V135H${x}Z" fill="${c}"/><path d="M${x + 4} 129.8H${x + 13}" stroke="#3a3e46" stroke-width="1.4" stroke-linecap="round"/>`;
  const farArm = pocket === 'far'
    ? `<path d="M53.6 84Q62.8 89.6 61 99.6L56 104.6L54.6 96Z" fill="${SUIT_D}"/>`
    : `<path d="M54 84Q61 90 60.6 101.6Q59.6 105 56.4 104Z" fill="${SUIT_D}"/><circle cx="59" cy="106.4" r="4.4" fill="${SKIN_D}"/>`;
  const nearArm = pocket === 'near'
    // elbow out behind him, forearm running forward to the hip, the hand gone under the shirt's hem
    ? `<path d="M30.6 82Q22.4 89.6 23.6 99Q25 103.4 29.6 103.6L39.4 107.4L41.2 102.4L33.4 97.6Q37.2 90.4 36.6 84.4Q34.8 81.6 30.6 82Z" fill="${SUIT_L}"/><path d="M24.4 96.4Q28 99.6 32.6 98" fill="none" stroke="${SUIT}" stroke-width="1.3" stroke-linecap="round"/><path d="M34.6 105.6L45.6 103.6L46.4 116.6L35.4 117.4Z" fill="${SUIT}"/><path d="M37.4 107.6Q41.6 106.2 45 108.6" fill="none" stroke="${SUIT_L}" stroke-width="1.5" stroke-linecap="round"/><path d="M36.2 103.4L41 105.8L39.6 108.6L35 106.6Z" fill="${SKIN}"/><path d="M33.6 104.4Q38.6 100.6 45.8 103.2L46 105.4Q39.6 103.6 34.4 107Z" fill="${tee}"/>`
    : `<path d="M30.4 82Q24.6 92 26.6 103.6Q28.6 107 32.8 105.6L37 92Q37.4 84.4 34.4 82Z" fill="${SUIT_L}"/><path d="M26.8 102.6Q30 104.8 33.4 102.8L32.8 105.6Q29.6 107.2 27 105.2Z" fill="${tee}"/><circle cx="30.4" cy="108.4" r="5.2" fill="${SKIN}"/><path d="M28.6 106.8H34M28.8 109.4H33.8" stroke="${SKIN_D}" stroke-width="1" stroke-linecap="round"/>`;
  return `<g filter="url(#rim)" transform="rotate(${o.lean ?? 4} 40 134)">
  <rect x="29" y="110" width="10.6" height="20" fill="${SUIT_D}"/>${shoe(27.6, '#101114')}
  <rect x="42" y="110" width="10.6" height="20" fill="${SUIT}"/>${shoe(42, '#17181c')}
  ${farArm}
  <path d="M38.6 71Q39 77 37.6 81H48.6Q47.4 77 48 71Z" fill="${SKIN_D}"/>
  <path d="M26.4 108H57.4V117.4Q52 120.2 46 118.4Q38 116.4 26.4 120.2Z" fill="${tee}"/><path d="M26.4 108H57.4V114.2H26.4Z" fill="${teeD}"/>
  <path d="M22 93Q21.6 81.6 31.6 79.4H49.6Q56.8 80.4 57.8 91.6L58.2 109.6Q58.2 112.6 55.2 112.6H25.6Q22.6 112.6 22.4 109.6Z" fill="${SUIT}"/>
  <path d="M22 93Q21.8 83.6 27.4 80.6L27.8 112.6H25.6Q22.6 112.6 22.4 109.6Z" fill="${SUIT_D}"/>
  <path d="M41 79.4H50.8L56.2 117.8Q51.6 119.8 47.8 118.6Q44.8 117.8 42.4 118.6Z" fill="${tee}"/><path d="M41.6 79.4Q46.4 85.6 50.4 79.4L49.6 79.4Q46.2 83.4 42.6 79.4Z" fill="${teeD}"/><path d="M51.2 96Q53.6 104 53.8 113H55.4L52.8 96Z" fill="${teeD}" opacity=".55"/>
  <path d="M41 79.4L34.2 83L41.8 105L45.6 88.4Z" fill="${SUIT_L}"/><path d="M50.8 79.4L54.6 82.4L55.6 99.4L52.8 88.4Z" fill="${SUIT_L}"/>
  <path d="M41.8 105L41.6 112.6" stroke="${SUIT_D}" stroke-width="1.2"/><circle cx="43.4" cy="107.4" r="1.3" fill="${SUIT_L}"/>
  ${nearArm}
  <path d="M17.6 52Q17.6 34 40 34Q59.6 34 61.4 50Q62.4 56 61 61Q59.6 68.6 53.4 73.8Q47.6 77.8 41.4 77.2Q30 76.2 22.8 68Q17.6 61 17.6 52Z" fill="${SKIN}"/>
  <path d="M60.8 55.2Q65.6 57.8 62.8 61.6Q61.6 62.8 60.2 62.2Z" fill="${SKIN}"/><path d="M60.6 61.6Q61.8 62.8 63 61.6" fill="none" stroke="${SKIN_D}" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M52.6 74.2Q47.4 77.6 41.6 77.2" fill="none" stroke="${SKIN_D}" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="27" cy="58.4" rx="4.4" ry="6" fill="${SKIN}"/><path d="M28.4 55.4Q25.6 58.4 28.4 61.4" fill="none" stroke="${SKIN_D}" stroke-width="1.3" stroke-linecap="round"/>
  ${eye(40.6, 56.4, 1, 1)}${eye(55.6, 56.4, -1, far)}
  <path d="M32.4 45.2L46.6 48.8M60.6 45.6L52.8 48.4" fill="none" stroke="${HAIR}" stroke-width="2.7" stroke-linecap="round"/>
  ${MOUTHS[o.mouth ?? 'near']}
  <path d="M17 59.6Q13.6 39 25.8 31.4Q41 25 54.6 30.8Q63 35.4 62.2 44.6L59 42.2Q50.6 39.8 41 40.6Q34 41.4 32.6 48.2L32 52.6Q27 50.4 24 53.6Q22.6 57.6 22.8 62L18.6 62.4Z" fill="${HAIR}"/>
  <path d="M17 59.6Q16 53 17.8 48L${h.fade ? 24 : 20.8} ${h.fade ? 48.6 : 50.4}Q${h.fade ? 22.4 : 20.4} 54 22.8 62L18.6 62.4Z" fill="#33373f"/><path d="M32 52.6Q31.4 56.4 32.2 59.6L33.8 53.4Z" fill="${HAIR}"/>
  <path d="${h.tufts.map(t => tuft(...t)).join('')}" fill="${HAIR}"/><path d="${h.locks.map(l => lock(...l)).join('')}" fill="${HAIR}"/>
  <path d="${h.tufts.filter((_, i) => i % 3 === 1).map(([x, w, hh, l]) => tuft(x + w * .12, w * .34, hh * .72, l * .8)).join('')}" fill="${HAIR_L}"/>
  </g>`;
}
// The figure as the game shows it: facing right as drawn, or facing left as the mirror with the arms swapped, so the
// hand in the pocket stays his right hand.
const figure = (o, facing = 1) => facing > 0 ? draw34({ ...o, pocket: 'near' }) : `<g transform="translate(80 0) scale(-1 1)">${draw34({ ...o, pocket: 'far' })}</g>`;
module.exports = { draw34, figure };
if (require.main === module) {
  const V = [{ name: 'Before', note: 'The original mouth, for comparison: 12 wide, at the leading edge.', o: { mouth: 'original' } }, { name: 'Even', note: '14 wide, moved 2 toward the middle, plain arc.', o: { mouth: 'even' } }, { name: 'Near-heavy', note: '14 wide, moved 3 in. Fullest under the near eye, flattening as it turns away.', o: { mouth: 'near' } }, { name: 'Lifted', note: '14 wide, moved 2 in. The far corner a touch higher.', o: { mouth: 'lifted' } }];
  const fig = (o, w, h, bg, facing, vb = '-10 2 100 140') => `<svg viewBox="${vb}" width="${w}" height="${h}"><rect x="-10" y="2" width="100" height="140" fill="${bg}"/><ellipse cx="${facing > 0 ? 44 : 36}" cy="136" rx="22" ry="4" fill="rgba(10,13,18,.22)"/>${figure({ hair: 'tousle', ...o }, facing)}</svg>`;
  const html = `<body style="margin:0;padding:24px;background:#14181d;color:#fff;font:500 15px/21px Fredoka,system-ui,sans-serif"><svg width="0" height="0" style="position:absolute"><filter id="rim" x="-20%" y="-20%" width="150%" height="150%"><feMorphology operator="dilate" radius="3" in="SourceAlpha" result="d"/><feFlood flood-color="#fffaf0"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter></svg><h1 style="font-size:24px;margin:0 0 16px">${process.argv[3] ?? 'The smile: original width, moved in, curve reshaped'}</h1><div style="display:flex;gap:20px">${V.map((v, i) => `<figure style="margin:0;width:330px">${fig(v.o, 330, 300, '#e9dfcc', 1, '12 18 62 56')}<div style="display:flex;gap:4px;margin-top:4px">${fig(v.o, 200, 280, '#e9dfcc', 1)}<div style="display:grid;gap:4px">${fig(v.o, 98, 138, '#dba38b', 1)}${fig(v.o, 98, 138, '#dba38b', -1)}</div></div><div style="margin-top:8px"><b style="font-size:17px">${i ? i + ' · ' : ''}${v.name}</b><br><span style="color:#aab2bd;font-size:13.5px;line-height:18px;display:block">${v.note}</span></div></figure>`).join('')}</div></body>`;
  (async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 4 * 350 + 48, height: 400 }, deviceScaleFactor: 2 }); await p.setContent(html); await p.waitForTimeout(300); await p.screenshot({ path: process.argv[2], fullPage: true }); await b.close(); })();
}
