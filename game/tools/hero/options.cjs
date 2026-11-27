// Run: node tools/hero/options.cjs tools/hero/options.json docs/hero/main-character-options.png
// Character option sheet: each option is data; draw() turns it into SVG in the game's 80 x 137 figure box.
const { chromium } = require('playwright'); const fs = require('fs');
const INK = '#1d2228', SKIN = '#f3cfab', SKIN_D = '#e2ae85', HAIR = '#17181c', HAIR_L = '#3d4350', SUIT = '#22242a', SUIT_L = '#3a3d46', SUIT_D = '#131418';
// A textured crop: the cap sits close to the skull, tapered paler at the sides, and the top is cut into many short
// uneven spikes. Each spike is [x, height above the cap, lean]; the cap's own curve gives the base.
const capY = x => 30.4 + ((x - 40) / 21) ** 2 * 9;
// A textured crop cut into uneven tufts. Each tuft is a soft wedge: [x, width, height, lean]. Top tufts stand on the
// cap and go up or tip forward and sideways by different amounts; fringe tufts fall forward over the hairline, each a
// different length. No two neighbours match, so it reads as texture and not as a row of spikes.
const tuft = (x, w, h, lean) => { const y0 = capY(x - w / 2) + 2.4, y1 = capY(x + w / 2) + 2.4, tx = x + lean, ty = capY(x) - h; return `M${(x - w / 2).toFixed(1)} ${y0.toFixed(1)}Q${(x - w * .3 + lean * .5).toFixed(1)} ${(ty + h * .45).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(x + w * .42 + lean * .4).toFixed(1)} ${(ty + h * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} ${y1.toFixed(1)}Z`; };
const lock = (x, w, len, lean) => `M${(x - w / 2).toFixed(1)} 40.6Q${(x - w * .2 + lean * .4).toFixed(1)} ${(41 + len * .7).toFixed(1)} ${(x + lean).toFixed(1)} ${(41.6 + len).toFixed(1)}Q${(x + w * .45 + lean * .3).toFixed(1)} ${(41 + len * .5).toFixed(1)} ${(x + w / 2).toFixed(1)} 40.6Z`;
const mk = (tufts, locks) => ({ top: tufts.map(t => tuft(...t)).join(''), fringe: locks.map(l => lock(...l)).join(''), lights: tufts.filter((_, i) => i % 3 === 1).map(([x, w, h, lean]) => tuft(x + w * .12, w * .34, h * .72, lean * .8)).join('') });
const HAIRS = {
  // mostly up, a couple tipping forward-right
  tousle: mk([[21, 6, 2.6, -1], [26, 7, 5.4, .6], [31.5, 6, 3.6, -1.4], [36, 8, 7, 1.2], [42, 6.4, 4.6, -.6], [47, 8, 6.6, 2.6], [53, 6.4, 3.8, .4], [58.5, 6, 3, 1.8]], [[27, 6, 2.6, -.8], [34, 7, 5.6, 1.4], [41, 5.6, 2.2, -.4], [47, 7, 4.4, 1.8], [54, 5.4, 2, .6]]),
  // the front pushed forward and to one side, the crown left to stand
  forward: mk([[21, 6, 2.4, .8], [26.5, 7.4, 4.2, 2.2], [32.5, 7, 6.4, 3], [38.5, 7, 4.4, 1.4], [44, 7.6, 7.2, 3.4], [50, 6.6, 4.8, 2.4], [55.5, 6.4, 5.6, 3.2], [60, 5, 2.6, 1.6]], [[26, 6.4, 3.4, 1.6], [32.5, 7, 6.6, 2.6], [39.5, 6.6, 4.2, 2], [46, 7, 7, 3], [52.5, 6, 3.4, 1.8]]),
  // short and choppy: low tufts every which way
  choppy: mk([[21, 5.6, 2.2, -1.2], [25.5, 6, 4, 1], [30.5, 6.4, 3, -1.6], [35.5, 6.6, 5, .4], [40.5, 6, 3.2, 1.8], [45.5, 6.6, 5.2, -1], [50.5, 6, 3.4, 2.2], [55.5, 6, 4.4, -.6], [60, 5, 2.4, 1.4]], [[25.5, 5.4, 3.6, -1], [31, 6, 2, .8], [37, 6, 4.8, -.6], [43.5, 6, 2.6, 1.2], [49.5, 6, 4.2, .4], [55, 5, 2.2, -.8]]),
  // one bold forward sweep across the brow, a few strays standing behind it
  sweep: mk([[21.5, 6.4, 2.6, 1], [27, 7, 3.6, -1], [33, 7.6, 5.8, 1.6], [39.5, 6.4, 3.4, -1.2], [45, 7.4, 6.2, 1], [51.5, 7, 4, 2.4], [57.5, 6.4, 3.2, .6]], [[28, 8, 4.4, 3.4], [36, 9, 6.8, 4.2], [45, 8, 5, 3.4], [53, 6, 2.6, 2]]),
};
// A narrowed eye: `inner` is the side the nose is on (1 or -1). The upper lid slants down toward the nose, heavier by
// `lid`; the lower lid rises by `squint`. `look` slides the iris sideways for a glance.
const eye = (cx, cy, inner, o) => { const lid = o.lid ?? 3, sq = o.squint ?? 1.2, look = o.look ?? 0, yo = cy - 4.6 + lid * .3, yi = cy - 4.6 + lid; return `<g transform="translate(${cx} ${cy}) scale(${o.eye ?? .86}) translate(${-cx} ${-cy})"><ellipse cx="${cx}" cy="${cy}" rx="6.4" ry="6.6" fill="#fff"/><ellipse cx="${cx + look}" cy="${cy + .8}" rx="3.9" ry="4.9" fill="#4a3020"/><ellipse cx="${cx + look}" cy="${cy + 1}" rx="2.1" ry="2.8" fill="#1f1611"/><circle cx="${cx + look - 1.5}" cy="${cy - .6}" r="1.7" fill="#fff"/><circle cx="${cx + look + 1.5}" cy="${cy + 3}" r=".8" fill="#fff"/><path d="M${cx - 8} ${cy - 9}H${cx + 8}V${inner > 0 ? yi : yo}L${cx - 8} ${inner > 0 ? yo : yi}Z" fill="${SKIN}"/><path d="M${cx - 8} ${cy + 9}H${cx + 8}V${cy + 6.4 - sq}Q${cx} ${cy + 7.6 - sq} ${cx - 8} ${cy + 6.4 - sq}Z" fill="${SKIN}"/><path d="M${cx - 7} ${inner > 0 ? yo : yi}L${cx + 7} ${inner > 0 ? yi : yo}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M${cx - 5} ${cy + 6.2 - sq}Q${cx} ${cy + 7.2 - sq} ${cx + 5} ${cy + 6.2 - sq}" fill="none" stroke="${SKIN_D}" stroke-width="1.4" stroke-linecap="round"/></g>`; };
// Brows drawn low and heavy, driving toward the nose: a man with a plan.
const BROWS = { set: 'M23.6 45.2L36.6 48.8M56.4 45.2L43.4 48.8', cocked: 'M23.6 46.2L36.6 49M56.6 42.6Q50 42.4 43.6 46.6', hard: 'M24.4 44.6L36.8 49.2M55.6 44.6L43.2 49.2', sly: 'M23.6 46.4L36.6 48.4M56.4 44L43.4 48.6' };
const M = '#8c4a38';
const MOUTHS = {
  flat: `<path d="M35 69.6H45.4" fill="none" stroke="${M}" stroke-width="2.1" stroke-linecap="round"/>`,
  smirk: `<path d="M35 69.8Q41 70.8 46.4 67.6" fill="none" stroke="${M}" stroke-width="2.1" stroke-linecap="round"/><path d="M45.6 66.2Q47.8 67 47.4 69" fill="none" stroke="${M}" stroke-width="1.3" stroke-linecap="round"/>`,
  purse: `<path d="M39 69.4Q42.6 70.6 46.4 68.8" fill="none" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/><path d="M36.4 70.2L38 69.2" fill="none" stroke="${M}" stroke-width="1.3" stroke-linecap="round"/>`,
  // a closed, sure smile: both corners up, pressed firm
  sure: `<path d="M34.4 68Q40 72.8 45.6 68" fill="none" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/><path d="M33.4 66.8L34.6 68.4M46.6 66.8L45.4 68.4" fill="none" stroke="${M}" stroke-width="1.3" stroke-linecap="round"/>`,
  // teeth clenched in a grin: ready for anything
  grit: `<path d="M33.2 66.6Q40 68 46.8 66.6Q46.4 73.4 40 73.4Q33.6 73.4 33.2 66.6Z" fill="#fff" stroke="${M}" stroke-width="1.7" stroke-linejoin="round"/><path d="M33.8 70H46.2M37 67.6V72.8M40 67.8V73.2M43 67.6V72.8" fill="none" stroke="#d9cfc4" stroke-width="1"/>`,
  // a tiny pressed pout and a puff of breath from the nose: taking it very seriously
  hmph: `<path d="M36.6 69.2Q40 70 43.4 69.2" fill="none" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/><path d="M38.4 72.6H41.6" fill="none" stroke="${SKIN_D}" stroke-width="1.2" stroke-linecap="round"/><path d="M46.4 63.4Q49.6 62.6 50.6 65M47 65.6Q49.4 65.6 49.8 67.4" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`,
  // half a smile: one corner up, sure of the plan
  half: `<path d="M35 69.6Q40.6 71.4 46 67.2" fill="none" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/><path d="M45.4 65.8Q47.4 66.6 47 68.6" fill="none" stroke="${M}" stroke-width="1.3" stroke-linecap="round"/>`,
  // lips pressed together, one corner just lifting: he knows something you do not
  set: `<path d="M35.6 69.8Q40 68.8 44.4 69.6Q45.8 69.4 46.8 68.2" fill="none" stroke="${M}" stroke-width="2.1" stroke-linecap="round"/><path d="M38 72.4H42.4" fill="none" stroke="${SKIN_D}" stroke-width="1.2" stroke-linecap="round"/>`,
};
function draw(o) {
  const h = HAIRS[o.hair], tee = o.tee, teeD = o.teeD;
  const armDown = (m) => `<path d="${m ? 'M59 82Q67 89 67 102Q66 106 62 105L56 92Z' : 'M21 82Q13 89 13 102Q14 106 18 105L24 92Z'}" fill="${m ? SUIT_L : SUIT_D}"/><path d="${m ? 'M57.6 101.6Q62 104.6 66.6 102.6L66.2 105Q62.4 107 58 104.6Z' : 'M13.4 102.6Q18 104.6 22.4 101.6L22 104.6Q17.6 107 13.8 105Z'}" fill="${tee}"/><circle cx="${m ? 63.6 : 16.4}" cy="107.6" r="${o.fists ? 5.2 : 4.7}" fill="${m ? SKIN : SKIN_D}"/>${o.fists ? `<path d="M${m ? 60.6 : 13.4} 106.6H${m ? 66.6 : 19.4}M${m ? 60.8 : 13.6} 109H${m ? 66.4 : 19.2}" stroke="${m ? SKIN_D : '#c9966f'}" stroke-width="1" stroke-linecap="round"/>` : ''}`;
  const armUp = `<path d="M55.5 84L65 64.5Q69.4 62.4 71.4 66.6L63 92Z" fill="${SUIT_L}"/><path d="M64 66.2Q67.6 63.4 71.6 65.6L71.4 68Q68 66.4 65 68.4Z" fill="${tee}"/>${o.pose === 'point' ? `<circle cx="69" cy="61" r="5" fill="${SKIN}"/><path d="M70 58L72.4 49.6" stroke="${SKIN}" stroke-width="3.2" stroke-linecap="round"/><path d="M66 59.6H71.6" stroke="${SKIN_D}" stroke-width="1" stroke-linecap="round"/>` : o.pose === 'fist' ? `<circle cx="69" cy="60.6" r="5.4" fill="${SKIN}"/><path d="M65.6 58.6H72.4M65.4 61H72.6" stroke="${SKIN_D}" stroke-width="1" stroke-linecap="round"/>` : `<circle cx="69.4" cy="60.4" r="5" fill="${SKIN}"/><path d="M66 57L64.8 51.6M68.6 55.8L68.6 50M71.4 56.2L72.6 50.8M73.6 58.6L76.4 54.6" stroke="${SKIN}" stroke-width="2.6" stroke-linecap="round"/>`}`;
  const shoe = (x) => o.shoes === 'sneaker' ? `<path d="M${x} 131Q${x} 127.6 ${x + 4} 127.6H${x + 11}Q${x + 15} 127.6 ${x + 15} 131V134H${x}Z" fill="#f6f4ee"/><rect x="${x}" y="133" width="15" height="2.6" rx="1.2" fill="#c9c5ba"/><path d="M${x + 4} 129.6H${x + 10}" stroke="#c9c5ba" stroke-width="1.2"/>` : `<path d="M${x} 131Q${x} 127.6 ${x + 4} 127.6H${x + 11}Q${x + 15} 127.6 ${x + 15} 131V135H${x}Z" fill="#17181c"/><path d="M${x + 2} 129.6H${x + 12}" stroke="#3a3e46" stroke-width="1.4" stroke-linecap="round"/>`;
  return `<g filter="url(#rim)" transform="rotate(${o.lean ?? 0} 40 134)">
  <rect x="29.5" y="110" width="10.5" height="20" fill="${SUIT_D}"/><rect x="40.5" y="110" width="10.5" height="20" fill="${SUIT}"/>${shoe(26)}${shoe(40)}
  ${armDown(false)}
  <rect x="35" y="72" width="10" height="9" fill="${SKIN_D}"/>
  <path d="M27.4 108H52.6V118.2Q47 121.2 41 119Q34 116.6 27.4 120.4Z" fill="${tee}"/><path d="M27.4 108H52.6V114.4H27.4Z" fill="${teeD}"/>
  <path d="M19 92Q19 80 30 79H50Q61 80 61 92V109.6Q61 112.6 58 112.6H22Q19 112.6 19 109.6Z" fill="${SUIT}"/>
  <path d="M19 93Q19 82 25 80V112.6H22Q19 112.6 19 109.6Z" fill="${SUIT_D}"/>
  <path d="M32.6 79H47.4L49.4 118.6Q45 120.4 41 119Q35.6 117.2 30.6 119Z" fill="${tee}"/><path d="M33.6 79Q40 86.4 46.4 79L45.4 79Q40 84 34.6 79Z" fill="${teeD}"/><path d="M44 96Q46.6 104 46.6 113H49.2L48.4 96Z" fill="${teeD}" opacity=".55"/>
  ${o.print ? `<path d="M36.4 94H43.6M36.4 97H41.6" stroke="${o.print}" stroke-width="1.7" stroke-linecap="round"/>` : ''}
  <path d="M32.6 79L27 82.4L33.6 104L37.4 88Z" fill="${SUIT_L}"/><path d="M47.4 79L53 82.4L46.4 104L42.6 88Z" fill="${SUIT_L}"/>
  <path d="M33.6 104L31 112.6M46.4 104L49 112.6" stroke="${SUIT_D}" stroke-width="1.2"/><circle cx="32.4" cy="106" r="1.3" fill="${SUIT_L}"/><path d="M51.6 92.6H57" stroke="${SUIT_L}" stroke-width="1.3" stroke-linecap="round"/>
  ${o.pose === 'down' ? armDown(true) : armUp}
  ${o.bag === 'brief' ? `<path d="M11 107V104Q11 102 13 102H18Q20 102 20 104V107" fill="none" stroke="#3a2414" stroke-width="2.4"/><path d="M6 107H26Q28 107 28 109V120Q28 122 26 122H6Q4 122 4 120V109Q4 107 6 107Z" fill="#6b4428"/><path d="M4 109Q4 107 6 107H26Q28 107 28 109V111H4Z" fill="#87583a"/><rect x="13.6" y="111" width="5" height="4" rx="1" fill="#d9a441"/>` : ''}
  ${o.bag === 'sling' ? `<path d="M52 81L27 113" stroke="#8a5a36" stroke-width="3.2" stroke-linecap="round"/><path d="M14 108H30Q32 108 32 110V121Q32 123 30 123H14Q12 123 12 121V110Q12 108 14 108Z" fill="#8a5a36"/><path d="M12 110Q12 108 14 108H30Q32 108 32 110V114H12Z" fill="#a8734a"/><rect x="20" y="113" width="4" height="3.4" rx="1" fill="#d9a441"/>` : ''}
  <ellipse cx="18" cy="57" rx="4.4" ry="6" fill="${SKIN}"/><ellipse cx="62" cy="57" rx="4.4" ry="6" fill="${SKIN}"/><path d="M19 54Q16.5 57 19 60M61 54Q63.5 57 61 60" fill="none" stroke="${SKIN_D}" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M19 52Q19 34 40 34Q61 34 61 52Q61 66 52 73Q46 77 40 77Q34 77 28 73Q19 66 19 52Z" fill="${SKIN}"/>
  ${o.blush ? '<ellipse cx="25.4" cy="64" rx="3.6" ry="2.2" fill="#f19a86" opacity=".7"/><ellipse cx="54.6" cy="64" rx="3.6" ry="2.2" fill="#f19a86" opacity=".7"/>' : ''}
  ${eye(31, 56.4, 1, o)}${eye(49.6, 56.4, -1, o)}
  <path d="${BROWS[o.brows]}" fill="none" stroke="${HAIR}" stroke-width="2.7" stroke-linecap="round"/>
  <path d="M42.4 61.6Q43.5 63.8 42 64.8" fill="none" stroke="${SKIN_D}" stroke-width="1.3" stroke-linecap="round"/>
  ${MOUTHS[o.mouth]}
  <path d="M16.8 55Q14.8 38 25 32.4Q40 26.6 55 32.4Q65.2 38 63.2 55L60.4 55Q60.8 47 57.6 42L22.4 42Q19.2 47 19.6 55Z" fill="${HAIR}"/><path d="M16.8 55Q16 47 18.4 42L21.4 44Q19.4 48 19.6 55Z M63.2 55Q64 47 61.6 42L58.6 44Q60.6 48 60.4 55Z" fill="#33373f"/>
  <path d="${h.top}" fill="${HAIR}"/><path d="${h.fringe}" fill="${HAIR}"/><path d="${h.lights}" fill="${HAIR_L}"/>
  </g>`;
}
const OPTIONS = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const card = (o, i) => `<figure><svg viewBox="-8 2 96 140" width="288" height="420"><rect x="-8" y="2" width="96" height="140" fill="${o.bg ?? '#e9dfcc'}"/><ellipse cx="46" cy="136" rx="22" ry="4" fill="rgba(10,13,18,.22)"/>${draw(o)}</svg><svg class="small" viewBox="-8 2 96 140" width="62" height="90"><rect x="-8" y="2" width="96" height="140" fill="#dba38b"/>${draw(o)}</svg><svg class="small" viewBox="-8 2 96 140" width="62" height="90"><rect x="-8" y="2" width="96" height="140" fill="#e9edf1"/>${draw(o)}</svg><figcaption><b>${String.fromCharCode(65 + i)} · ${o.name}</b><span>${o.note}</span></figcaption></figure>`;
const html = `<body style="margin:0;padding:24px;background:#14181d;color:#fff;font:500 15px/21px Fredoka,system-ui,sans-serif"><svg width="0" height="0" style="position:absolute"><filter id="rim" x="-20%" y="-20%" width="150%" height="150%"><feMorphology operator="dilate" radius="3" in="SourceAlpha" result="d"/><feFlood flood-color="#fffaf0"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter></svg><h1 style="font-size:24px;margin:0 0 16px">${process.argv[4] ?? 'Main character options'}</h1><div style="display:flex;flex-wrap:wrap;gap:18px">${OPTIONS.map(card).join('')}</div><style>figure{margin:0;width:288px;display:grid;grid-template-columns:288px;gap:6px}figure .small{position:relative;display:inline-block}figure>svg:nth-child(2){grid-row:2;grid-column:1}figure>svg:nth-child(3){grid-row:2;grid-column:1;margin-left:68px}figcaption{grid-row:2;grid-column:1;margin-left:140px;align-self:center}figcaption{display:grid}figcaption b{font-size:17px}figcaption span{color:#aab2bd;font-size:13.5px;line-height:18px}</style></body>`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 4 * 306 + 48, height: 400 }, deviceScaleFactor: 2 }); await p.setContent(html); await p.waitForTimeout(300); await p.screenshot({ path: process.argv[3], fullPage: true }); await b.close(); })();
