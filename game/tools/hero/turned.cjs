// Run: node tools/hero/turned.cjs docs/hero/main-character-turned.png
// Option A turned three-quarters to his left (screen right), the way he walks: draw34() is the turned figure.
const { chromium } = require('playwright');
const INK = '#1d2228', SKIN = '#f3cfab', SKIN_D = '#e2ae85', HAIR = '#17181c', HAIR_L = '#3d4350', SUIT = '#22242a', SUIT_L = '#3a3d46', SUIT_D = '#131418', M = '#8c4a38';
const capY = x => 30.2 + ((x - 39) / 22) ** 2 * 9;
const tuft = (x, w, h, lean) => { const y0 = capY(x - w / 2) + 2.4, y1 = capY(x + w / 2) + 2.4, tx = x + lean, ty = capY(x) - h; return `M${(x - w / 2).toFixed(1)} ${y0.toFixed(1)}Q${(x - w * .3 + lean * .5).toFixed(1)} ${(ty + h * .45).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(x + w * .42 + lean * .4).toFixed(1)} ${(ty + h * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} ${y1.toFixed(1)}Z`; };
const lock = (x, w, len, lean, up = 0) => `M${(x - w / 2).toFixed(1)} ${40.2 - up}Q${(x - w * .2 + lean * .4).toFixed(1)} ${(41 - up + len * .7).toFixed(1)} ${(x + lean).toFixed(1)} ${(41.6 - up + len).toFixed(1)}Q${(x + w * .45 + lean * .3).toFixed(1)} ${(41 - up + len * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} ${40.2 - up}Z`;
// Six cuts in one style: the same black paper, the same soft-wedge tufts, the same paler taper at the side. What
// changes is the outline. Tufts are [x, width, height, lean] standing on the skull's cap; locks are
// [x, width, length, lean] falling over the brow. `fade` is how high the pale taper climbs the side of the head (a
// smaller number is higher), `brow` lifts the hairline off the forehead, and `extra` is anything only that cut has.
const HAIRS = {
  // medium all over, a mix of up and forward
  tousle: { tufts: [[18.5, 6, 2.2, -1.6], [23.5, 7, 4.4, -.8], [29, 6.4, 3.2, -1.4], [34.5, 7.6, 6.4, .6], [40.5, 6.6, 4.2, -.2], [46, 7.6, 6.8, 2.6], [52, 6.6, 4.8, 2.2], [57.4, 6, 3.6, 3]], locks: [[39, 6, 2.4, .8], [45, 7, 5, 2], [51.4, 6, 3, 1.6], [56.6, 5.4, 4.2, 2.2]], fade: 50 },
  // a quiff: low at the back, climbing to a tall front that stands off a bare forehead
  quiff: { tufts: [[19, 7, 1.2, -.6], [25, 8, 2.2, .2], [31.6, 9, 4, 1.2], [38.6, 10, 6.6, 2.2], [46, 11, 9.4, 3], [53.4, 11, 11, 3.2], [59, 8, 8.4, 2.4]], locks: [], fade: 46, brow: 2.4 },
  // The quiff with strands at the sides of the forehead falling forward and down: at the near temple, in front of the
  // ear, and at the far edge of the brow. Three weights of the same idea; the middle of the forehead stays bare.
  quiffA: { tufts: [[19, 7, 1.2, -.6], [25, 8, 2.2, .2], [31.6, 9, 4, 1.2], [38.6, 10, 6.6, 2.2], [46, 11, 9.4, 3], [53.4, 11, 11, 3.2], [59, 8, 8.4, 2.4]], locks: [], fade: 46, brow: 2.4, extra: 'M32.6 44.4Q35.6 45.8 36.8 50Q33.8 49.4 32.2 47Z M59.6 38.6Q62 41.4 61.8 45.4Q59.8 43.6 58.6 40Z' },
  quiffB: { tufts: [[19, 7, 1.2, -.6], [25, 8, 2.2, .2], [31.6, 9, 4, 1.2], [38.6, 10, 6.6, 2.2], [46, 11, 9.4, 3], [53.4, 11, 11, 3.2], [59, 8, 8.4, 2.4]], locks: [], fade: 46, brow: 2.4, extra: 'M32.6 43.6Q36.2 45.2 37.6 51Q34 50 32 46.8Z M36 39.8Q39.8 41.6 41.2 46.4Q37.6 45.2 35 41.4Z M59.4 38Q62.4 41.4 62 47Q59.6 44.6 58.2 39.8Z M55.6 37.6Q58 39.6 58.4 43.2Q56 41.8 54.6 38.6Z' },
  quiffC: { tufts: [[19, 7, 1.2, -.6], [25, 8, 2.2, .2], [31.6, 9, 4, 1.2], [38.6, 10, 6.6, 2.2], [46, 11, 9.4, 3], [53.4, 11, 11, 3.2], [59, 8, 8.4, 2.4]], locks: [], fade: 46, brow: 2.4, extra: 'M32.4 43Q36.8 45 38.4 52.6Q34.2 51.2 31.8 46.8Z M35.6 39.6Q40.4 41.6 42.2 48.2Q37.8 46.6 34.6 41.6Z M40.4 38.2Q44 39.6 45.6 43.6Q42.2 42.8 39.6 39.6Z M59.2 37.8Q62.8 41.6 62.2 48.8Q59.4 45.6 58 39.8Z M55 37.4Q58.2 39.8 58.6 45Q55.6 43 54 38.6Z M31.4 53Q33.4 56.6 32.6 61L30.4 55.6Z' },
  // The chosen cut, drawn by hand: a quiff with light strands at the sides of the forehead. `shape` is the whole head of
  // hair in one outline: nape, back of the skull, the top in broad clumps that climb toward the front, the face of the
  // quiff, the hairline across a bare forehead, the temple, a short sideburn in front of the ear, and round the ear.
  // `taper` and `taper2` are the two paler steps of the clipped side. `comb` is the grain: slim paler slivers that
  // follow the way it is brushed. `wisps` are the light strands falling forward and down at each side of the forehead.
  quiffL: { bespoke: true,
    shape: 'M20.6 62.6Q19 62.6 17.8 60.4Q15.4 55 15.2 48Q15.4 37.6 22.6 32.6Q28 28.8 34.4 28.8Q35.2 27 36.6 26Q37.4 27.8 39.2 28.8Q42.4 25.6 46.6 23.6Q45.6 25.4 45.6 27.4Q47.4 22.8 50.4 19.6Q50.8 22.4 52.4 24.6Q53.4 23.2 55 22.6Q55.4 24.4 56.6 25.6Q59.6 23.4 63.4 22.8Q61.4 24.6 60.8 26.6Q63.6 28 65.2 31Q63.2 31.2 61.6 32.6Q62 35.6 61.4 38.2L60.8 42.8L57.6 39.2Q54 36.6 49 36.4Q41.6 36.2 36 39.2Q32.6 41.2 31.8 45.6L31.8 53Q30.4 52 29.8 50.6Q27.4 49.6 25 50.6Q22.6 52.4 22.2 55.6Q21.8 58.6 22.4 60.6Z',
    taper: 'M20.6 62.6Q19 62.6 17.8 60.4Q15.4 55 15.4 49.6Q20 46.4 25.6 45.6Q29.6 45.4 31.8 46.6L31.8 53Q30.4 52 29.8 50.6Q27.4 49.6 25 50.6Q22.6 52.4 22.2 55.6Q21.8 58.6 22.4 60.6Z',
    taper2: 'M20.6 62.6Q19 62.6 17.8 60.4Q16.2 57.6 15.8 54.6Q18.8 53.4 21.8 54Q22.2 55 22.2 55.6Q21.8 58.6 22.4 60.6Z',
    comb: 'M38.6 36.2Q41.6 31.6 45.4 25.6Q44.4 31.4 41 36.8Z M47 35Q49.4 29.6 50.4 22.4Q51.4 29.4 49.2 35.4Z M55.4 34.2Q58.2 30 61.8 24.6Q60.8 30.2 57.6 34.6Z',
    wisps: 'M32.6 41.4Q34.8 43.4 34.2 47.4Q32.4 45.6 31.8 43Z M37.6 37.4Q40.4 39.4 40.4 44Q38 42.4 36.2 38.6Z M56.4 37Q59 39.4 58.8 43.8Q56.6 42 55.2 38Z' },
  // An Asian textured spiky crop, drawn by hand. Short faded sides; the top cropped short and worked into piecey tufts
  // that cover the whole head, crown and back included, each a different size and pointing its own way: back ones up
  // and a little backward, middle ones up, front ones forward and over the brow. The fringe is short and piecey, a
  // little longer toward each side of the forehead. `comb` is the grain: short paler slivers, each following its tuft.
  crop: { bespoke: true,
    shape: 'M20.6 62.6Q19 62.6 17.8 60.4Q15.4 55 15.2 48Q15.2 43 16.4 39.6Q15.2 38 15 36Q16.8 36.6 18.4 35.8Q18.6 33 19.8 31Q20.8 32.4 22.6 32.6Q23.2 28.8 25.4 26.2Q26.6 28.4 29 29.2Q29.4 27 30.6 25.4Q31 27 31.8 28.2Q32.6 24.4 35 21.4Q36 24.4 38.6 26.2Q40 24 42.8 22.6Q41.8 24.2 41.8 25.8Q44.2 21 48 17.2Q48.6 20.8 50.4 23.4Q51.2 22.2 52.6 21.6Q53 23.2 54 24.4Q56.8 21.6 61.2 19.8Q59 22.4 58.4 25Q62.2 25.8 65 28Q63 28.4 61.6 29.6Q63.2 31.4 64.2 33.8Q62.8 33.2 61.6 33.6Q62 36 61.4 38.2L60.8 42.8L57.6 39.2L55.8 37.4Q56 40.2 54.4 42.6Q53 39.8 52.6 36.8Q50.8 36.4 49.2 36.4Q48.6 37.4 47.6 38.2Q46.6 37.4 46 36.4Q43.8 36.4 41.8 36.8Q41.6 39 40.2 41Q39 39.6 38.4 37.8Q37.4 38.4 36.6 39Q36.6 42 35.2 44.6Q34.2 42.6 34 40.6Q32.2 42.6 31.8 45.6L31.8 53Q30.4 52 29.8 50.6Q27.4 49.6 25 50.6Q22.6 52.4 22.2 55.6Q21.8 58.6 22.4 60.6Z',
    taper: 'M20.6 62.6Q19 62.6 17.8 60.4Q15.4 55 15.4 49.6Q20 46.4 25.6 45.6Q29.6 45.4 31.8 46.6L31.8 53Q30.4 52 29.8 50.6Q27.4 49.6 25 50.6Q22.6 52.4 22.2 55.6Q21.8 58.6 22.4 60.6Z',
    taper2: 'M20.6 62.6Q19 62.6 17.8 60.4Q16.2 57.6 15.8 54.6Q18.8 53.4 21.8 54Q22.2 55 22.2 55.6Q21.8 58.6 22.4 60.6Z',
    comb: 'M20 42.2Q19.8 38.6 21 35.2Q22.2 39 21.6 42.6Z M27 38.6Q27.6 32.6 26.4 28.8Q30 33 29 39Z M34.6 36Q35.4 29 35 24.6Q38.4 30 36.8 36.4Z M45.4 34.4Q47.4 27.6 47.8 21Q49.8 28 47.6 34.8Z M56 33Q59 29 60.4 24.2Q61 29.6 58.2 33.4Z',
    wisps: '' },
  // a faux hawk: clipped pale sides and one tall ridge of tufts along the middle
  hawk: { tufts: [[19, 5.6, .8, 0], [24, 7, 2.2, .4], [30, 9, 5.6, .8], [37, 10.6, 9.4, 1], [44.4, 10.6, 10.4, 1.6], [51, 9, 6.6, 2], [56.8, 6.6, 2.8, 1.6]], locks: [[50, 5, 1.6, 1]], fade: 40, brow: 1.6 },
  // a clipped crop: barely off the skull, the taper high, the edge over the brow cut ragged
  clipped: { tufts: [[19, 5, .6, 0], [23.4, 5.4, 1.2, .4], [28, 5.4, .8, -.4], [32.8, 5.6, 1.6, .5], [37.8, 5.6, 1, -.3], [42.8, 5.6, 1.8, .6], [47.8, 5.6, 1.2, .4], [52.8, 5.4, 1.6, .8], [57.6, 5, .8, .6]], locks: [[38, 4, 1.4, 0], [42.6, 4, .8, .4], [47, 4, 1.6, .4], [51.4, 4, 1, .6], [55.6, 4, 1.4, .6]], fade: 42 },
  // a heavy fringe: flat on top, long locks down to the brows
  fringe: { tufts: [[19, 6, 1.6, -.8], [24.4, 7, 2.6, -.4], [30.6, 7.6, 3, .4], [37, 7.6, 2.6, 1], [43.4, 7.6, 3.2, 1.6], [49.6, 7.4, 2.6, 2], [55.4, 6.6, 2, 2.2]], locks: [[34.6, 6.4, 4.6, .6], [40.4, 7.4, 6.6, 1.6], [47.2, 7.6, 5.6, 2.2], [53.6, 6.6, 6.8, 2], [58.4, 4.6, 4.4, 1.2]], fade: 52 },
  // brushed back: the forehead bare, every tuft raked toward the back, flicking out behind his head
  back: { tufts: [[19.4, 6.6, 6, -4.4], [25, 7.4, 6.6, -4], [31, 7.6, 6, -3.8], [37, 7.6, 5.2, -3.6], [43, 7.4, 4.6, -3.4], [49, 7, 3.8, -3], [54.6, 6.4, 2.8, -2.6], [59, 5, 1.6, -1.6]], locks: [], fade: 48, brow: 2.8, extra: 'M17.4 49L10.6 46.4L16.4 43.6Z M17.2 55.6L11 55.2L16.2 50.6Z' },
};
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
  const tee = o.tee ?? '#f6f4ee', teeD = o.teeD ?? '#d6d2c8', far = o.far ?? .62, h = HAIRS[o.hair ?? 'tousle'], up = h.brow ?? 0, pocket = o.pocket ?? 'near';
  const shoe = (x, c) => `<path d="M${x} 131Q${x} 127.6 ${x + 4} 127.6H${x + 10}Q${x + 17} 128 ${x + 18} 132.4V135H${x}Z" fill="${c}"/><path d="M${x + 4} 129.8H${x + 13}" stroke="#3a3e46" stroke-width="1.4" stroke-linecap="round"/>`;
  const farArm = pocket === 'far'
    ? `<path d="M53.6 84Q62.8 89.6 61 99.6L56 104.6L54.6 96Z" fill="${SUIT_D}"/>`
    : `<path d="M54 84Q61 90 60.6 101.6Q59.6 105 56.4 104Z" fill="${SUIT_D}"/><circle cx="59" cy="106.4" r="4.4" fill="${SKIN_D}"/>`;
  const nearArm = pocket === 'near'
    // elbow out behind him, forearm running forward to the hip, the hand gone under the shirt's hem
    ? `<path d="M30.6 82Q22.4 89.6 23.6 99Q25 103.4 29.6 103.6L39.4 107.4L41.2 102.4L33.4 97.6Q37.2 90.4 36.6 84.4Q34.8 81.6 30.6 82Z" fill="${SUIT_L}"/><path d="M24.4 96.4Q28 99.6 32.6 98" fill="none" stroke="${SUIT}" stroke-width="1.3" stroke-linecap="round"/><path d="M34.6 105.6L45.6 103.6L46.4 116.6L35.4 117.4Z" fill="${SUIT}"/><path d="M37.4 107.6Q41.6 106.2 45 108.6" fill="none" stroke="${SUIT_L}" stroke-width="1.5" stroke-linecap="round"/><path d="M36.2 103.4L41 105.8L39.6 108.6L35 106.6Z" fill="${SKIN}"/><path d="M33.6 104.4Q38.6 100.6 45.8 103.2L46 105.4Q39.6 103.6 34.4 107Z" fill="${tee}"/>`
    : `<path d="M30.4 82Q24.6 92 26.6 103.6Q28.6 107 32.8 105.6L37 92Q37.4 84.4 34.4 82Z" fill="${SUIT_L}"/><path d="M26.8 102.6Q30 104.8 33.4 102.8L32.8 105.6Q29.6 107.2 27 105.2Z" fill="${tee}"/><circle cx="30.4" cy="108.4" r="5.2" fill="${SKIN}"/><path d="M28.6 106.8H34M28.8 109.4H33.8" stroke="${SKIN_D}" stroke-width="1" stroke-linecap="round"/>`;
  // In the game his legs are separate strips so they can stride, the lean is applied to legs and body together, and
  // the rim and shadow come from the scene's own filter: `game` leaves all three out.
  return `<g ${o.game ? 'filter="url(#hero-rim)"' : `filter="url(#rim)" transform="rotate(${o.lean ?? 4} 40 134)"`}>
  ${o.game ? '' : `<rect x="29" y="110" width="10.6" height="20" fill="${SUIT_D}"/>${shoe(27.6, '#101114')}
  <rect x="42" y="110" width="10.6" height="20" fill="${SUIT}"/>${shoe(42, '#17181c')}`}
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
  <ellipse cx="${h.bespoke ? 26 : 27}" cy="58.4" rx="4.4" ry="6" fill="${SKIN}"/><path d="M${h.bespoke ? 27.4 : 28.4} 55.4Q${h.bespoke ? 24.6 : 25.6} 58.4 ${h.bespoke ? 27.4 : 28.4} 61.4" fill="none" stroke="${SKIN_D}" stroke-width="1.3" stroke-linecap="round"/>
  ${eye(40.6, 56.4, 1, 1)}${eye(55.6, 56.4, -1, far)}
  <path d="M${h.bespoke ? 36.4 : 32.4} ${h.bespoke ? 46.2 : 45.2}L46.6 48.8M60.6 45.6L52.8 48.4" fill="none" stroke="${HAIR}" stroke-width="2.7" stroke-linecap="round"/>
  ${MOUTHS[o.mouth ?? 'near']}
  ${h.bespoke ? `<path d="${h.shape}" fill="${HAIR}"/><path d="${h.taper}" fill="#33373f"/><path d="${h.taper2}" fill="#454a54"/><path d="${h.comb}" fill="${HAIR_L}"/><path d="${h.wisps}" fill="${HAIR}"/>` : `  <path d="M17 59.6Q13.6 39 25.8 31.4Q41 25 54.6 30.8Q63 35.4 62.2 ${44.6 - up}L59 ${42.2 - up}Q50.6 ${39.8 - up} 41 ${40.6 - up}Q34 ${41.4 - up} 32.6 48.2L32 52.6Q27 50.4 24 53.6Q22.6 57.6 22.8 62L18.6 62.4Z" fill="${HAIR}"/>
  <path d="M17 59.6Q15.4 ${h.fade + 4} ${h.fade < 46 ? 19.6 : 17.8} ${h.fade}L${h.fade < 46 ? 31 : 21.4} ${h.fade + (h.fade < 46 ? 2 : 2.4)}Q${h.fade < 46 ? 31.6 : 20.6} 50 32 52.6Q27 50.4 24 53.6Q22.6 57.6 22.8 62L18.6 62.4Z" fill="#33373f"/><path d="M32 52.6Q31.4 56.4 32.2 59.6L33.8 53.4Z" fill="${h.fade < 46 ? '#33373f' : HAIR}"/>
  <path d="${h.tufts.map(t => tuft(...t)).join('')}${h.extra ?? ''}" fill="${HAIR}"/><path d="${h.locks.map(l => lock(...l, up)).join('')}" fill="${HAIR}"/>
  <path d="${h.tufts.filter((t, i) => i % 3 === 1 && t[2] > 1.4).map(([x, w, hh, l]) => tuft(x + w * .12, w * .34, hh * .72, l * .8)).join('')}" fill="${HAIR_L}"/>`}
  </g>`;
}
// The figure as the game shows it: facing right as drawn, or facing left as the mirror with the arms swapped, so the
// hand in the pocket stays his right hand.
const figure = (o, facing = 1) => facing > 0 ? draw34({ ...o, pocket: 'near' }) : `<g transform="translate(80 0) scale(-1 1)">${draw34({ ...o, pocket: 'far' })}</g>`;
// The figure the game draws (src/art/heroArt.ts): both arm sets, one shown at a time by which way he faces.
const gameArt = () => `<g class="h-r">${draw34({ hair: 'crop', mouth: 'near', pocket: 'near', game: true })}</g><g class="h-l">${draw34({ hair: 'crop', mouth: 'near', pocket: 'far', game: true })}</g>`.replace(/\n\s*/g, '');
module.exports = { draw34, figure, gameArt };
if (require.main === module && process.argv[2] === '--game') {
  require('fs').writeFileSync(process.argv[3], `// Generated by tools/hero/turned.cjs --game. The main character, turned three-quarters toward the way he walks.\n// Edit the drawing there, not here.\nexport const HERO_ART = ${JSON.stringify(gameArt())};\n`);
} else if (require.main === module) {
  const V = [{ name: 'Textured spiky crop', note: 'Faded sides. Piecey tufts over the whole top, crown and back included, each its own size and direction. A short, broken fringe, a little longer toward each side of the forehead.', o: { hair: 'crop' } }];
  const fig = (o, w, h, bg, facing, vb = '-10 2 100 140') => `<svg viewBox="${vb}" width="${w}" height="${h}"><rect x="-10" y="2" width="100" height="140" fill="${bg}"/><ellipse cx="${facing > 0 ? 44 : 36}" cy="136" rx="22" ry="4" fill="rgba(10,13,18,.22)"/>${figure({ mouth: 'near', ...o }, facing)}</svg>`;
  const html = `<body style="margin:0;padding:24px;background:#14181d;color:#fff;font:500 15px/21px Fredoka,system-ui,sans-serif"><svg width="0" height="0" style="position:absolute"><filter id="rim" x="-20%" y="-20%" width="150%" height="150%"><feMorphology operator="dilate" radius="3" in="SourceAlpha" result="d"/><feFlood flood-color="#fffaf0"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter></svg><h1 style="font-size:24px;margin:0 0 16px">${process.argv[3] ?? 'The quiff, refined'}</h1><div style="display:flex;gap:22px">${V.map(v => `<figure style="margin:0;width:620px">${fig(v.o, 620, 520, '#e9dfcc', 1, '4 6 72 60')}<div style="display:flex;gap:4px;margin-top:4px">${fig(v.o, 200, 280, '#e9dfcc', 1)}${fig(v.o, 200, 280, '#e9dfcc', -1)}${fig(v.o, 100, 140, '#dba38b', 1)}${fig(v.o, 100, 140, '#e9edf1', -1)}</div><div style="margin-top:8px"><b style="font-size:17px">${v.name}</b><br><span style="color:#aab2bd;font-size:13.5px;line-height:18px;display:block">${v.note}</span></div></figure>`).join('')}</div></body>`;
  (async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1 * 642 + 48, height: 400 }, deviceScaleFactor: 2 }); await p.setContent(html); await p.waitForTimeout(300); await p.screenshot({ path: process.argv[2], fullPage: true }); await b.close(); })();
}
