// The handheld's screen: the MRT platform the salaryman waits on before the game goes to the big screen. It is the
// first thing a visitor sees, so each piece does a job. The station's name board says whose site this is. The ticket
// gate teaches A. The line map shows what is inside: the Work line and the Side projects line, meeting at this
// station. When the gate opens the train comes in, and boarding it is docking the console: the big screen then wakes
// inside that train, already pulling away.
//
// It is a paper toy theatre, not a diorama: flat cut layers in one SVG box of 840 x 472 (the walk's own x, shifted by
// 420), drawn live. Layers slide a little against each other as he walks (--par, set by App), which is all the depth
// a toy theatre has. Nothing here is baked, and nothing is printed that content.ts does not state.
import { useEffect, useState, type CSSProperties } from 'react';
import { content } from './content.ts';
import { reducedMotion } from './light.ts';
import { SalarymanArt, SEAT } from './art/Salaryman.tsx';

export const GATE_X = -170, DOOR_X = 310, BENCH_X = -75;
// How long the train takes from the gate opening to standing with its doors open.
export const TRAIN_MS = 2300;
const SHELL = '#e9edf1', SHELL_DARK = '#c9d1d9', STEEL = '#3d444e', GLASS = '#26313d', CORAL = '#e8552d', MINT = '#35b58a', SUN = '#f6b73c', CREAM = '#fffaf0', INK = '#23272d';
const sx = (x: number) => x + 420;

// The hour decides the sky in the station's high windows, and a wash over the whole platform.
function daylight(h: number) {
  if (h >= 5 && h < 9) return { sky: ['#ffd9a8', '#ffeed6'], wash: 'rgba(255,196,120,.10)', orb: '#fff4d6', orbY: 118 };
  if (h >= 9 && h < 17) return { sky: ['#8fd3f4', '#d8f0fb'], wash: 'rgba(255,255,255,0)', orb: '#fffbe8', orbY: 106 };
  if (h >= 17 && h < 20) return { sky: ['#f59a5b', '#ffd3a8'], wash: 'rgba(255,128,60,.13)', orb: '#ffe2b0', orbY: 120 };
  return { sky: ['#1c2a4a', '#35466e'], wash: 'rgba(24,34,78,.26)', orb: '#f4f1e4', orbY: 108 };
}
const two = (n: number) => String(n).padStart(2, '0');

// The lines the map draws, from content: each world on the line belongs to the Work line or the Side projects line.
const WORK = ['blibli'] as const, SIDE = ['moperty'] as const;

type Props = { gate: boolean; arrived: boolean; near: 'gate' | 'door' | null };
export default function Platform({ gate, arrived, near }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = window.setInterval(() => setNow(new Date()), 20000); return () => clearInterval(t); }, []);
  const light = daylight(now.getHours()), calm = reducedMotion();
  const status = !gate ? (near === 'gate' ? 'Press A · tap your pass' : 'Tap your pass at the gate') : !arrived ? 'Train arriving' : near === 'door' ? 'Press A · board' : 'Now boarding';
  const tile = (x: number, y: number, w: number, h: number, step: number) => Array.from({ length: Math.ceil(w / step) }, (_, i) => <path key={i} d={`M${x + i * step} ${y}V${y + h}`} />);
  return (
    <svg className="platform" viewBox="0 0 840 472" preserveAspectRatio="none" aria-hidden="true" data-gate={gate ? 'open' : 'shut'} data-train={arrived ? 'in' : gate ? 'coming' : 'away'} style={{ '--calm': calm ? 1 : 0 } as CSSProperties}>
      <defs>
        <linearGradient id="pf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={light.sky[0]} /><stop offset="1" stopColor={light.sky[1]} /></linearGradient>
        <filter id="pf-shadow" x="-20%" y="-20%" width="150%" height="160%"><feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#0a0d12" floodOpacity=".3" /></filter>
      </defs>
      {/* Back layer: the station's far wall, its high windows on the day outside, and the two line colours along it. */}
      <g className="pf-back">
        <rect x="-30" y="0" width="900" height="320" fill="#dfe5ea" />
        <g stroke="#c9d2da" strokeWidth="2">{tile(-30, 140, 900, 180, 46)}<path d="M-30 196H870M-30 252H870" /></g>
        <rect x="-30" y="92" width="900" height="46" fill="url(#pf-sky)" />
        <circle cx="610" cy={light.orbY} r="11" fill={light.orb} />
        <g fill={STEEL}>{Array.from({ length: 11 }, (_, i) => <rect key={i} x={-30 + i * 90} y="92" width="8" height="46" />)}<rect x="-30" y="88" width="900" height="6" /><rect x="-30" y="136" width="900" height="6" /></g>
        <rect x="-30" y="212" width="900" height="9" fill={CORAL} /><rect x="-30" y="225" width="900" height="9" fill={MINT} />
      </g>
      {/* The train: it comes in from the left behind the platform edge, the way it will run on the big screen, and stands
          with the door of its front car on the mark. Its cab is at the right, mostly past the edge of the screen. */}
      <g className="pf-train">
        <path d="M-900 138H820Q862 138 882 176L904 236V300H-900Z" fill={SHELL} stroke={CREAM} strokeWidth="5" strokeLinejoin="round" />
        <path d="M-900 138H820Q862 138 882 176L888 192H-900Z" fill={SHELL_DARK} />
        <path d="M806 166H838Q866 200 870 226H806Z" fill={GLASS} />
        <rect x="-900" y="256" width="1804" height="12" fill={CORAL} /><rect x="-900" y="270" width="1804" height="5" fill={MINT} />
        {[560, 410, 260, 110, -40, -190, -340, -490, -640].map((x, i) => <g key={x}>
          <rect x={x} y="166" width="112" height="62" rx="4" fill={GLASS} />
          {i % 3 !== 1 && <><g fill={i % 2 ? '#e2ae85' : '#f3cfab'}><circle cx={x + 30} cy="214" r="13" />{i % 2 === 0 && <circle cx={x + 76} cy="210" r="13" />}</g><path d={`M${x + 17} 210Q${x + 30} 192 ${x + 43} 210Z${i % 2 === 0 ? ` M${x + 63} 206Q${x + 76} 188 ${x + 89} 206Z` : ''}`} fill="#1b1e24" /></>}
          <rect x={x} y="222" width="112" height="6" fill={GLASS} />
        </g>)}
        {/* The door: a lit doorway, and two leaves that slide apart once the train stands. */}
        <rect x="696" y="158" width="68" height="142" fill="#fff3d6" />
        <g className="pf-leaf pf-leaf-l"><rect x="696" y="158" width="34" height="142" fill={SHELL} stroke={SHELL_DARK} strokeWidth="2" /><rect x="703" y="170" width="20" height="52" rx="3" fill={GLASS} /></g>
        <g className="pf-leaf pf-leaf-r"><rect x="730" y="158" width="34" height="142" fill={SHELL} stroke={SHELL_DARK} strokeWidth="2" /><rect x="737" y="170" width="20" height="52" rx="3" fill={GLASS} /></g>
        <rect x="692" y="150" width="76" height="9" fill={STEEL} />
      </g>
      {/* The platform: its floor, the yellow line at the edge, and the mark where the door stops. */}
      <rect x="-30" y="300" width="900" height="180" fill="#b4bcc5" />
      <g stroke="#a3acb6" strokeWidth="2">{tile(-30, 314, 900, 160, 70)}<path d="M-30 392H870" /></g>
      <rect x="-30" y="300" width="900" height="14" fill={SUN} /><g fill="#d9992a">{Array.from({ length: 44 }, (_, i) => <circle key={i} cx={-20 + i * 20} cy="307" r="2.6" />)}</g>
      <path d={`M${sx(DOOR_X) - 22} 334H${sx(DOOR_X) + 22}L${sx(DOOR_X)} 318Z`} fill={CREAM} opacity=".9" />
      {/* Middle layer: what stands on the platform behind him. */}
      <g className="pf-mid" filter="url(#pf-shadow)">
        {/* The stairs he came down. */}
        <path d="M-30 150H40L118 338H-30Z" fill="#cbd3db" stroke={CREAM} strokeWidth="4" strokeLinejoin="round" />
        <g stroke="#aab4be" strokeWidth="3">{Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-30 ${176 + i * 24}H${52 + i * 10}`} />)}</g>
        <path d="M36 128L122 322" stroke={STEEL} strokeWidth="7" strokeLinecap="round" /><path d="M122 322V340" stroke={STEEL} strokeWidth="6" strokeLinecap="round" />
        {/* The gate's far cabinet, with its reader. */}
        <rect x={sx(GATE_X) - 26} y="268" width="34" height="74" rx="5" fill="#f1f4f7" stroke={CREAM} strokeWidth="4" /><rect x={sx(GATE_X) - 26} y="268" width="34" height="14" rx="5" fill={STEEL} />
        <circle className="pf-reader" cx={sx(GATE_X) - 9} cy="298" r="7" />
        {/* A bench. */}
        <rect x={sx(BENCH_X) - 46} y="318" width="92" height="9" rx="3" fill="#2f6f9f" stroke={CREAM} strokeWidth="3" /><path d={`M${sx(BENCH_X) - 36} 327V344M${sx(BENCH_X) + 36} 327V344`} stroke={STEEL} strokeWidth="5" strokeLinecap="round" />
        {/* The bored salaryman who used to be the player, dozing where he sits. */}
        <g transform={`translate(${sx(BENCH_X) - 31} ${320 - SEAT * .78}) scale(.78)`}><g className="pf-sleeper"><SalarymanArt seated /></g>
          <g className="pf-zz"><path d="M70 14H100Q106 14 106 20V38Q106 44 100 44H82L72 54V44H70Q64 44 64 38V20Q64 14 70 14Z" fill={CREAM} /><text x="85" y="37" textAnchor="middle" fontSize="20" fontWeight="600" fill={INK}>z</text></g>
        </g>
        {/* The line map: two lines that meet here. Work runs across, Side projects runs down from the interchange. */}
        <g transform="translate(424 150)">
          <path d="M20 132V176M196 132V176" stroke={STEEL} strokeWidth="7" strokeLinecap="round" />
          <rect x="0" y="0" width="216" height="136" rx="6" fill={CREAM} stroke="#fff" strokeWidth="5" /><rect x="0" y="0" width="216" height="24" rx="6" fill={STEEL} /><rect x="0" y="14" width="216" height="10" fill={STEEL} />
          <text x="12" y="17" fontSize="12" fontWeight="600" letterSpacing="1.6" fill={CREAM}>LINE MAP</text>
          {/* Work line */}
          <path d="M22 58H196" stroke={CORAL} strokeWidth="8" strokeLinecap="round" /><path d="M196 58H208" stroke={CORAL} strokeWidth="8" strokeDasharray="2 5" />
          <text x="22" y="44" fontSize="11" fontWeight="600" fill={CORAL}>WORK LINE</text>
          {WORK.map((w, i) => <g key={w}><circle cx={150 + i * 40} cy="58" r="8" fill={CREAM} stroke={CORAL} strokeWidth="4" /><text x={150 + i * 40} y="82" textAnchor="middle" fontSize="12" fontWeight="600" fill={INK}>{content.worlds[w].title}</text></g>)}
          {/* Side projects line, leaving the interchange and turning along the bottom */}
          <path d="M58 58V104Q58 116 70 116H196" fill="none" stroke={MINT} strokeWidth="8" strokeLinecap="round" /><path d="M196 116H208" stroke={MINT} strokeWidth="8" strokeDasharray="2 5" />
          <text x="76" y="106" fontSize="11" fontWeight="600" fill="#1f8a66">SIDE PROJECTS LINE</text>
          {SIDE.map((w, i) => <g key={w}><circle cx={150 + i * 40} cy="116" r="8" fill={CREAM} stroke={MINT} strokeWidth="4" /><text x={150 + i * 40} y="132" textAnchor="middle" fontSize="12" fontWeight="600" fill={INK}>{content.worlds[w].title}</text></g>)}
          {/* The interchange: this station */}
          <rect x="44" y="46" width="28" height="24" rx="12" fill={CREAM} stroke={INK} strokeWidth="4" /><circle className="pf-here" cx="58" cy="58" r="5" fill={INK} />
          <text x="12" y="92" fontSize="10" fontWeight="600" fill={INK}>You are</text><text x="12" y="104" fontSize="10" fontWeight="600" fill={INK}>here</text>
        </g>
      </g>
      {/* Front layer: the gate's near cabinet and its paddles, and what hangs from the roof. */}
      <g className="pf-front">
        <g filter="url(#pf-shadow)">
          <g className="pf-paddle"><path d={`M${sx(GATE_X) - 6} 352H${sx(GATE_X) + 30}L${sx(GATE_X) + 22} 368H${sx(GATE_X) - 6}Z`} fill={CORAL} stroke={CREAM} strokeWidth="3" strokeLinejoin="round" /></g>
          <rect x={sx(GATE_X) - 30} y="372" width="38" height="62" rx="5" fill="#f1f4f7" stroke={CREAM} strokeWidth="4" /><rect x={sx(GATE_X) - 30} y="372" width="38" height="14" rx="5" fill={STEEL} />
        </g>
        <rect x="-30" y="0" width="900" height="16" fill={STEEL} /><rect x="-30" y="16" width="900" height="5" fill="#2c3138" />
        {/* The station's name board: whose station this is. */}
        <g filter="url(#pf-shadow)">
          <path d="M182 16V34M418 16V34" stroke={STEEL} strokeWidth="5" />
          <rect x="150" y="32" width="300" height="72" rx="7" fill={CREAM} stroke="#fff" strokeWidth="5" />
          <rect x="150" y="88" width="300" height="8" fill={CORAL} /><rect x="150" y="96" width="300" height="8" fill={MINT} /><path d="M150 96H450V98Q450 104 443 104H157Q150 104 150 98Z" fill={MINT} />
          <text x="300" y="76" textAnchor="middle" fontSize="40" fontWeight="600" fill={INK} data-testid="station-name">Alvaro L.</text>
        </g>
        {/* The departure board: the time where the visitor is, and what to do next. */}
        <g filter="url(#pf-shadow)">
          <path d="M618 16V30M800 16V30" stroke={STEEL} strokeWidth="5" />
          <rect x="590" y="28" width="238" height="60" rx="5" fill="#1b1408" stroke={STEEL} strokeWidth="5" />
          <text x="604" y="52" fontSize="18" fontWeight="600" fill="#ffb648">{two(now.getHours())}:{two(now.getMinutes())}</text>
          <text x="814" y="52" textAnchor="end" fontSize="12" fontWeight="600" letterSpacing="1.4" fill="#ffb648" opacity=".75">MRT</text>
          <text key={status} className="pf-status" x="604" y="76" fontSize="15" fontWeight="600" fill="#ffd89a" data-testid="platform-status">{status}</text>
        </g>
      </g>
      <rect className="pf-wash" x="-30" y="0" width="900" height="480" fill={light.wash} />
    </svg>
  );
}
