// Run: node tools/hero/options.cjs tools/hero/options.json docs/hero/main-character-options.png
// Character option sheet: each option is data; draw() turns it into SVG in the game's 80 x 137 figure box.
const { chromium } = require('playwright'); const fs = require('fs');
const INK = '#1d2228', SKIN = '#f3cfab', SKIN_D = '#e2ae85', HAIR = '#17181c', HAIR_L = '#3d4350', SUIT = '#22242a', SUIT_L = '#3a3d46', SUIT_D = '#131418';
// A textured crop: the cap sits close to the skull, tapered paler at the sides, and the top is cut into many short
// uneven spikes. Each spike is [x, height above the cap, lean]; the cap's own curve gives the base.
const capY = x => 30.4 + ((x - 40) / 21) ** 2 * 9;
const spikes = list => { let d = `M${list[0][0] - 2.6} ${capY(list[0][0] - 2.6) + 3}`; list.forEach(([x, h, lean = 0], i) => { const w = i < list.length - 1 ? (list[i + 1][0] - x) / 2 : 2.6; d += `L${x + lean} ${(capY(x) - h).toFixed(1)}L${x + w} ${(capY(x + w) + 1.2).toFixed(1)}`; }); return d + `L${list[list.length - 1][0] + 3} ${capY(list[list.length - 1][0] + 3) + 4}Z`; };
const lights = list => list.filter((_, i) => i % 2 === 1).map(([x, h, lean = 0]) => `M${x + lean} ${(capY(x) - h + 1.6).toFixed(1)}L${x + 2.2} ${(capY(x) + 2.4).toFixed(1)}L${x - .6} ${(capY(x) + 2.6).toFixed(1)}Z`).join('');
const mk = (list, fringe) => ({ top: spikes(list), lights: lights(list), fringe });
const HAIRS = {
  // even, short, straight up
  crop: mk([[20, 3, 0], [25.7, 6, -0.6], [31.4, 7.6, 0.5], [37.1, 9, -0.4], [42.9, 8.2, 0.6], [48.6, 9.2, -0.5], [54.3, 6.6, 0.5], [60, 3.4, 0]], 'M22.4 42L25.6 44.6L29 41.6L33 45L37 41.6L41 44.8L45 41.6L49 44.6L53 41.6L56 44L57.6 42Z'),
  // lifted at the front right, falling away to the back: a textured quiff
  quiff: mk([[20, 2.6, 1], [25.7, 4.6, 1.4], [31.4, 6.4, 1.7], [37.1, 8.4, 2], [42.9, 10.6, 2.3], [48.6, 12.4, 2.6], [54.3, 10, 2.6], [60, 4.6, 1.6]], 'M22 42Q30 38.6 42 38.4Q52 38.4 58 42Q50 40.4 42 40.6Q31 40.8 22 42Z'),
  // short all over with a choppy fringe pushed forward onto the forehead
  fringe: mk([[20, 3, 0], [25.7, 5.4, -0.9], [31.4, 6.8, 0.6], [37.1, 5.8, -0.6], [42.9, 7.6, 0.8], [48.6, 6, -0.5], [54.3, 6.6, 0.7], [60, 3, 0]], 'M21.6 42L24 47.6L27.4 43L30.6 48.6L34.4 43.4L38 48L41.6 43.2L45 47L48.6 42.8L52 45.6L55.4 42.6L58.4 42Z'),
  // every spike leaning the same way, as if brushed across and up
  brushed: mk([[20, 3, 1.6], [25.7, 6, 2.2], [31.4, 8, 2.6], [37.1, 9.2, 3], [42.9, 9.6, 3.2], [48.6, 9, 3.2], [54.3, 7.2, 2.8], [60, 3.6, 1.6]], 'M22 42L27 40L33 43.4L39 40.2L45 43L51 40.4L58 42Q40 38.6 22 42Z'),
};
const eye = (cx, cy, look = 0) => `<g transform="translate(${cx} ${cy}) scale(.84) translate(${-cx} ${-cy})"><ellipse cx="${cx}" cy="${cy}" rx="6.2" ry="7.2" fill="#fff"/><ellipse cx="${cx + look}" cy="${cy + .6}" rx="4.3" ry="5.6" fill="#5a3a24"/><ellipse cx="${cx + look}" cy="${cy + 1}" rx="2.4" ry="3.3" fill="#1f1611"/><circle cx="${cx + look - 1.6}" cy="${cy - 2}" r="1.9" fill="#fff"/><circle cx="${cx + look + 1.7}" cy="${cy + 2.6}" r=".9" fill="#fff"/><path d="M${cx - 7} ${cy - 3.4}Q${cx} ${cy - 9.6} ${cx + 7} ${cy - 3.4}" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/></g>`;
const BROWS = { up: 'M24.5 45.4Q30.5 41.6 36.5 44.6M43.5 44.6Q49.5 41.6 55.5 45.4', keen: 'M24.5 43.2Q31 43 36.8 46M43.2 46Q49 43 55.5 43.2', cocked: 'M24.5 45.6Q30.5 42.4 36.5 45M43.5 43.6Q50 40 55.8 43.6' };
const MOUTHS = {
  grin: '<path d="M32.5 66Q40 68 47.5 66Q46.4 75.4 40 75.4Q33.6 75.4 32.5 66Z" fill="#7a2b22"/><path d="M33.6 66.5Q40 68.2 46.4 66.5L45.9 69.2Q40 70.4 34.1 69.2Z" fill="#fff"/><ellipse cx="40" cy="73.4" rx="3.3" ry="1.6" fill="#e2776a"/>',
  smile: '<path d="M33 66.6Q40 73.6 47 66.6" fill="none" stroke="#8c4a38" stroke-width="2" stroke-linecap="round"/><path d="M33.6 67.2Q40 72.4 46.4 67.2Q40 69.6 33.6 67.2Z" fill="#fff"/>',
  smirk: '<path d="M34 68.4Q41.5 72.4 47.4 65.6" fill="none" stroke="#8c4a38" stroke-width="2.1" stroke-linecap="round"/><path d="M46.4 64.2Q48.6 65.2 48 67.4" fill="none" stroke="#8c4a38" stroke-width="1.4" stroke-linecap="round"/>',
  cheer: '<path d="M33 65.4Q40 66.4 47 65.4Q47 76.6 40 76.6Q33 76.6 33 65.4Z" fill="#7a2b22"/><path d="M34 65.9Q40 66.8 46 65.9L45.8 68.4Q40 69.2 34.2 68.4Z" fill="#fff"/><ellipse cx="40" cy="74.2" rx="3.6" ry="1.9" fill="#e2776a"/>',
};
function draw(o) {
  const h = HAIRS[o.hair], tee = o.tee, teeD = o.teeD;
  const armDown = (m) => `<path d="${m ? 'M59 82Q67 89 67 102Q66 106 62 105L56 92Z' : 'M21 82Q13 89 13 102Q14 106 18 105L24 92Z'}" fill="${m ? SUIT_L : SUIT_D}"/><path d="${m ? 'M57.6 101.6Q62 104.6 66.6 102.6L66.2 105Q62.4 107 58 104.6Z' : 'M13.4 102.6Q18 104.6 22.4 101.6L22 104.6Q17.6 107 13.8 105Z'}" fill="${tee}"/><circle cx="${m ? 63.6 : 16.4}" cy="107.6" r="4.7" fill="${m ? SKIN : SKIN_D}"/>`;
  const armUp = `<path d="M55.5 84L65 64.5Q69.4 62.4 71.4 66.6L63 92Z" fill="${SUIT_L}"/><path d="M64 66.2Q67.6 63.4 71.6 65.6L71.4 68Q68 66.4 65 68.4Z" fill="${tee}"/>${o.pose === 'fist' ? `<circle cx="69" cy="60.6" r="5.4" fill="${SKIN}"/><path d="M65.6 58.6H72.4M65.4 61H72.6" stroke="${SKIN_D}" stroke-width="1" stroke-linecap="round"/>` : `<circle cx="69.4" cy="60.4" r="5" fill="${SKIN}"/><path d="M66 57L64.8 51.6M68.6 55.8L68.6 50M71.4 56.2L72.6 50.8M73.6 58.6L76.4 54.6" stroke="${SKIN}" stroke-width="2.6" stroke-linecap="round"/>`}`;
  const shoe = (x) => o.shoes === 'sneaker' ? `<path d="M${x} 131Q${x} 127.6 ${x + 4} 127.6H${x + 11}Q${x + 15} 127.6 ${x + 15} 131V134H${x}Z" fill="#f6f4ee"/><rect x="${x}" y="133" width="15" height="2.6" rx="1.2" fill="#c9c5ba"/><path d="M${x + 4} 129.6H${x + 10}" stroke="#c9c5ba" stroke-width="1.2"/>` : `<path d="M${x} 131Q${x} 127.6 ${x + 4} 127.6H${x + 11}Q${x + 15} 127.6 ${x + 15} 131V135H${x}Z" fill="#17181c"/><path d="M${x + 2} 129.6H${x + 12}" stroke="#3a3e46" stroke-width="1.4" stroke-linecap="round"/>`;
  return `<g filter="url(#rim)">
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
  ${eye(31, 56, o.look ?? .5)}${eye(49.6, 56, o.look ?? .5)}
  <path d="${BROWS[o.brows]}" fill="none" stroke="${HAIR}" stroke-width="2.3" stroke-linecap="round"/>
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
