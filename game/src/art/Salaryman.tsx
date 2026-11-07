// The player: a bored salaryman on his rounds, cut from one sheet of card like a paper toy. Anime avatar face (big eyes
// with a coloured iris, a heavy upper lid, a highlight), drawn crisp at paper-toy proportions: a big head on a short
// slumped suit and stubby legs. The sheet is cut a little wider than the print so the white core rims the silhouette;
// inside it, detail is tones of the same colours. Seen nearly front on, turned a touch to the right; the legs are
// separate strips (styles.css) so they can stride.
const SUIT = '#2f3e5c', SUIT_DARK = '#243049', SUIT_LIGHT = '#3d4f73', SHIRT = '#f4f2ec', SKIN = '#f3cfab', SKIN_DARK = '#e2ae85', HAIR = '#1b1e24', HAIR_LIGHT = '#454e5e', INK = '#1d2228';
const face = 'M19 52Q19 34 40 34Q61 34 61 52Q61 66 52 73Q46 77 40 77Q34 77 28 73Q19 66 19 52Z';
// Clean, short Japanese cut: close at the sides, a neat part on his right, the fringe combed across to the left.
const hair = 'M16 55Q13 29 40 27Q67 29 64 55H61Q61 45 57 41Q47 45 33 40Q29 46 21 47L20 55Z';
const body = 'M20 89Q20 79 30 78H50Q60 79 60 89V104Q60 107 57 107H23Q20 107 20 104Z';
const armL = 'M22 81Q15 87 15 98Q16 102 20 101L24 89Z', armR = 'M58 81Q65 87 65 97Q64 101 60 101L56 89Z';
const caseBody = 'M55 104H76Q78 104 78 106V117Q78 119 76 119H55Q53 119 53 117V106Q53 104 55 104Z', caseHandle = 'M60 104V101Q60 99 62 99H67Q69 99 69 101V104';
// One eye, looking `k` and with its lash flick on the `out` side: white, a tall iris, and a heavy lid lowered over the top of it, its lash line nearly flat — bored, not cute.
const eye = (cx: number, cy: number, k: 1 | -1, out: 1 | -1) => <>
  <ellipse cx={cx} cy={cy} rx="6.2" ry="6.8" fill="#fff" />
  <ellipse cx={cx + k * .6} cy={cy + 1} rx="4.1" ry="5.5" fill="#4a3426" /><ellipse cx={cx + k * .6} cy={cy + 2} rx="2.2" ry="3.1" fill="#1f1611" />
  <path d={`M${cx + k * .6 - 3.4} ${cy + 3.6}Q${cx + k * .6} ${cy + 6.2} ${cx + k * .6 + 3.4} ${cy + 3.6}`} fill="none" stroke="#7a5a44" strokeWidth="1.1" />
  <circle cx={cx + k * .6 - 1.5} cy={cy + .3} r="1.2" fill="#fff" />
  <path d={`M${cx - 7.4} ${cy - 8}H${cx + 7.4}V${cy - 1.4}Q${cx} ${cy - 2.8} ${cx - 7.4} ${cy - .8}Z`} fill={SKIN} />
  <path d={out > 0 ? `M${cx - 7} ${cy - .6}Q${cx} ${cy - 3} ${cx + 7} ${cy - 1.6}L${cx + 8.4} ${cy - 3}` : `M${cx + 7} ${cy - 1.6}Q${cx} ${cy - 3} ${cx - 7} ${cy - .6}L${cx - 8.4} ${cy - 2}`} fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  <path d={`M${cx - 3.8} ${cy + 7.1}Q${cx} ${cy + 8.3} ${cx + 3.8} ${cy + 7.1}`} fill="none" stroke={INK} strokeWidth=".9" strokeLinecap="round" />
  <path d={`M${cx - 4.2} ${cy + 9.8}Q${cx} ${cy + 11.2} ${cx + 4.2} ${cy + 9.8}`} fill="none" stroke={SKIN_DARK} strokeWidth="1.2" strokeLinecap="round" />
</>;
const silhouette = <>
  <path d={armL} /><circle cx="17" cy="101" r="4.6" /><path d={armR} /><path d={body} /><path d={caseBody} /><path d={caseHandle} fill="none" /><circle cx="63" cy="101" r="5" />
  <ellipse cx="18" cy="57" rx="4.4" ry="6" /><ellipse cx="62" cy="57" rx="4.4" ry="6" /><path d={face} /><path d={hair} />
</>;
export default function Salaryman() {
  return (
    <>
    <i className="leg leg-b" /><i className="leg leg-f" />
    <svg className="courier-art" viewBox="0 0 80 124" width="80" height="124" overflow="visible" aria-hidden="true"><g filter="url(#paper-sm)">
      {/* The cut sheet: every part's outline, grown so its white core rims the figure. */}
      <g fill="#fff" stroke="#fff" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">{silhouette}</g>
      {/* Slumped suit: arms hanging, the tie pulled loose and crooked. */}
      <path d={armL} fill={SUIT_DARK} /><path d="M15.4 97Q17 99.5 20.6 99L20 101Q16 102 15 98Z" fill="#d9d5cb" /><circle cx="17" cy="101.5" r="4.6" fill={SKIN_DARK} />
      <path d={body} fill={SUIT} /><path d="M20 90Q20 82 25 79V106H23Q20 106 20 103Z" fill={SUIT_DARK} />
      <rect x="35" y="72" width="10" height="9" fill={SKIN_DARK} />
      <path d="M33 78H47L40 95Z" fill={SHIRT} /><path d="M36 78L40 83L37 79Z" fill="#dcd8ce" />
      <path d="M32 78L40 96L35.5 79Z M48 78L40 96L44.5 79Z" fill={SUIT_LIGHT} />
      <path d="M39.6 81.5H43.2L44 84.5L46.6 98L42.6 102L39.4 98.4L40.6 84.5Z" fill="#b8312c" /><path d="M39.6 81.5H43.2L42.9 84H40Z" fill="#8f2420" />
      <circle cx="40" cy="100" r="1.4" fill={SUIT_DARK} />
      <path d={caseHandle} fill="none" stroke="#3a2414" strokeWidth="2.6" />
      <path d={caseBody} fill="#6b4428" /><path d="M53 106Q53 104 55 104H76Q78 104 78 106V108H53Z" fill="#87583a" /><rect x="63" y="108" width="5" height="4" rx="1" fill="#d9a441" />
      <path d={armR} fill={SUIT_LIGHT} /><path d="M58.6 84Q62.6 90 62 99" fill="none" stroke={SUIT} strokeWidth="1.4" strokeLinecap="round" /><path d="M56.4 97.4Q60 100 64.8 98.2L65 97Q64 101 60 101Z" fill={SHIRT} />
      <circle cx="63" cy="101" r="5" fill={SKIN} />
      {/* Head: ears, face, the anime eyes under heavy lids, a flat mouth, and the neat glossy hair. */}
      <ellipse cx="18" cy="57" rx="4.4" ry="6" fill={SKIN} /><ellipse cx="62" cy="57" rx="4.4" ry="6" fill={SKIN} />
      <path d="M19 54Q16.5 57 19 60M61 54Q63.5 57 61 60" fill="none" stroke={SKIN_DARK} strokeWidth="1.3" strokeLinecap="round" />
      <path d={face} fill={SKIN} />
      {eye(31, 56, 1, -1)}{eye(50, 56, 1, 1)}
      <path d="M25 46.5Q30.5 45.5 36 46.6M45 46.6Q50.5 45.4 56 46.4" fill="none" stroke={HAIR} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M42.5 61.5Q43.6 64 42 65" fill="none" stroke={SKIN_DARK} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M37 70.2Q41 69.4 45.5 70.6" fill="none" stroke="#8c4a38" strokeWidth="1.6" strokeLinecap="round" />
      <path d={hair} fill={HAIR} />
      <path d="M22 37Q37 29 56 34Q40 33.5 25 40.5Z" fill={HAIR_LIGHT} />
      <path d="M17 49Q18 52 20.5 54V47Z M63 49Q62 52 59.5 54V47Z" fill="#2c313a" />
    </g></svg>
    </>
  );
}
