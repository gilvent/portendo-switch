// The handheld's screen: the MRT platform he waits on before the game goes to the big screen. It is the first thing a
// visitor sees, and a funnel of four beats (docs/MRT_DESIGN.md): walk, tap the pass at the gate, pick a line on the map
// while the train comes in, board. Boarding is docking the console: the big screen then wakes inside that train.
//
// It is a paper toy theatre, not a diorama: flat cut layers in one SVG box of 840 x 472 (the walk's own x, shifted by
// 420), drawn live. Layers slide a little against each other as he walks (--par, set by App). What hangs from the roof
// hangs on real pendulums (sim.ts): the wind of the train swings it, and so does his head.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { content } from './content.ts';
import { reducedMotion } from './light.ts';
import { SalarymanArt, SEAT } from './art/Salaryman.tsx';
import { pend, resting, stepPend, type Pend } from './mrt/sim.ts';
import { hero, wind } from './mrt/live.ts';
import { play } from './sfx.ts';

export const GATE_X = -170, DOOR_X = 310, BENCH_X = -75, MAP_X = 112;
// How long the train takes from the gate opening to standing with its doors open.
export const TRAIN_MS = 2300;
const SHELL = '#e9edf1', SHELL_DARK = '#c9d1d9', STEEL = '#3d444e', GLASS = '#26313d', CORAL = '#e8552d', MINT = '#35b58a', SUN = '#f6b73c', CREAM = '#fffaf0', INK = '#23272d';
const sx = (x: number) => x + 420;
const two = (n: number) => String(n).padStart(2, '0');
// The floor line he stands on, and how tall he is drawn, in the box's units (styles.css: .mini-courier).
const FEET = 349, TALL = 126;
// What hangs from the roof: [left, top, width, height] of the board, hung from the roof beam at y 16.
const NAME = { x: 112, y: 88, w: 296, h: 74 }, BOARD = { x: 590, y: 36, w: 238, h: 60 }, ROOF = 16;

// The two lines the map draws, in the order the train's sign turns through them (content.ts: the MRT doors' `to`).
const LINES = [{ world: 'blibli', name: 'WORK LINE', c: CORAL, ink: CORAL }, { world: 'moperty', name: 'SIDE PROJECTS LINE', c: MINT, ink: '#1f8a66' }] as const;

type Props = { gate: boolean; arrived: boolean; near: 'gate' | 'map' | 'door' | null; line: number; leaving: boolean };
// A gate cabinet: a folded box seen from the front and a little above, so its lid and one return show.
const cabinet = (x: number, y: number, h: number, w = 34) => <>
  <path d={`M${x + w} ${y}l8 -9v${h}l-8 9Z`} fill="#c3ccd4" stroke={CREAM} strokeWidth="3" strokeLinejoin="round" />
  <path d={`M${x} ${y}l8 -9h${w}l-8 9Z`} fill="#fff" stroke={CREAM} strokeWidth="3" strokeLinejoin="round" />
  <rect x={x} y={y} width={w} height={h} rx="3" fill="#eef1f4" stroke={CREAM} strokeWidth="3" /><rect x={x} y={y} width={w} height="12" rx="3" fill={STEEL} />
</>;

// A tap on the screen at [x, y] in the box's units: true if something on the platform took it for itself.
let onTap: ((x: number, y: number) => boolean) | null = null;
export const platformTap = (x: number, y: number) => onTap?.(x, y) ?? false;

export default function Platform({ gate, arrived, near, line, leaving }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = window.setInterval(() => setNow(new Date()), 20000); return () => clearInterval(t); }, []);
  const calm = reducedMotion(), to = content.worlds[LINES[line % LINES.length].world].title;
  const status = !gate ? (near === 'gate' ? 'Press A · tap your pass' : 'Tap your pass at the gate') : !arrived ? `To ${to} · arriving` : near === 'door' ? 'Press A · board' : `To ${to} · now boarding`;
  const tile = (x: number, y: number, w: number, h: number, step: number) => Array.from({ length: Math.ceil(w / step) }, (_, i) => <path key={i} d={`M${x + i * step} ${y}V${y + h}`} />);
  const root = useRef<SVGSVGElement>(null), nameRef = useRef<SVGGElement>(null), boardRef = useRef<SVGGElement>(null), fxRef = useRef<SVGGElement>(null);
  const gust = useRef({ t0: -1e9, dir: 1 }), firstStatus = useRef(true);

  // The train's wind: once as it comes in, once as it leaves.
  const blow = (dir: number) => {
    if (calm) return;
    gust.current = { t0: performance.now(), dir }; play('wind');
    const g = fxRef.current; if (!g) return;
    [...g.children].forEach((e, i) => {
      const y = 322 + (i * 53) % 120, d = 700 + (i * 137) % 500, from = dir > 0 ? -60 : 900, to = dir > 0 ? 900 : -60, hop = 14 + (i * 31) % 30;
      e.animate([{ transform: `translate(${from}px,${y}px) rotate(0deg)`, opacity: 1 }, { transform: `translate(${(from + to) / 2}px,${y - hop}px) rotate(${dir * 300}deg)`, opacity: 1 }, { transform: `translate(${to}px,${y}px) rotate(${dir * 640}deg)`, opacity: 1 }], { duration: d, delay: 500 + i * 110, easing: 'steps(14,end)' });
    });
  };
  useEffect(() => { if (!gate) return; play('arrive'); const t = window.setTimeout(() => blow(1), 500); return () => clearTimeout(t); }, [gate]);
  useEffect(() => { if (arrived && gate) { play('doors'); } }, [arrived]);
  useEffect(() => { if (!leaving) return; play('chime'); const a = window.setTimeout(() => play('doors'), 300), b = window.setTimeout(() => { play('leave'); blow(1); }, 600); return () => { clearTimeout(a); clearTimeout(b); }; }, [leaving]);
  useEffect(() => { if (firstStatus.current) { firstStatus.current = false; return; } play('flap'); }, [status]);
  useEffect(() => { if (gate) play('tick'); }, [line]);

  useEffect(() => {
    if (calm) return;
    const P: { p: Pend; el: () => SVGGElement | null; cx: number }[] = [
      { p: pend(NAME.y + NAME.h - ROOF, 1.5, .12), el: () => nameRef.current, cx: NAME.x + NAME.w / 2 },
      { p: pend(BOARD.y + BOARD.h - ROOF, 1.9, .09), el: () => boardRef.current, cx: BOARD.x + BOARD.w / 2 }
    ];
    let bonked = -1e9, pushed = false, jumps = hero.jumps, startled = 0;
    const tick = (_t: number, delta: number) => {
      const dt = Math.min(delta / 1000, .05), t = performance.now(), el = root.current;
      // A gust rises fast and dies slowly.
      const g = (t - gust.current.t0) / 1000, w = g < 0 || g > 2.4 ? 0 : gust.current.dir * (g < .5 ? g / .5 : Math.max(0, 1 - (g - .5) / 1.9));
      wind.x = w;
      // His head, on the way up, under the name board.
      const head = FEET - TALL - hero.y * .92, hx = sx(hero.x);
      if (hero.air && hero.vy > 0 && head < NAME.y + NAME.h + 3 && hx > NAME.x - 6 && hx < NAME.x + NAME.w + 6 && t - bonked > 400) {
        bonked = t; hero.bonk = 1; play('bonk', 0);
        // Hit off-centre, it swings away from him; dead centre, the way he was going.
        P[0].p.om += ((hx - P[0].cx) / (NAME.w / 2) * -1.6 + (hero.vx > 20 ? .9 : hero.vx < -20 ? -.9 : .5));
        const s = fxRef.current?.children[0]; if (s) for (let i = 0; i < 3; i++) (fxRef.current!.children[i] as SVGElement).animate([{ transform: `translate(${hx}px,${NAME.y + NAME.h}px)`, opacity: 1 }, { transform: `translate(${hx + (i - 1) * 46}px,${NAME.y + NAME.h + 40 - i * 9}px) rotate(${(i - 1) * 200}deg)`, opacity: 0 }], { duration: 420, easing: 'steps(6,end)' });
      }
      for (const { p, el: get, cx } of P) {
        if (!w && resting(p)) continue;
        stepPend(p, -w * 620, dt);
        get()?.setAttribute('transform', `rotate(${(-p.th * 57.3).toFixed(2)} ${cx} ${ROOF})`);
      }
      if (!el) return;
      // Walking into the shut gate: its paddles rattle and the reader says no.
      const pushing = el.dataset.gate === 'shut' && hero.x > GATE_X - 34 && hero.vx === 0 && hero.facing > 0 && hero.pushing;
      if (pushing && !pushed) { play('rattle'); play('deny', 400); el.toggleAttribute('data-denied', true); window.setTimeout(() => el.toggleAttribute('data-denied', false), 420); }
      pushed = pushing;
      // A jump beside the sleeper starts him awake.
      if (hero.jumps !== jumps) { jumps = hero.jumps; if (Math.abs(hero.x - BENCH_X) < 80 && t - startled > 1600) { startled = t; play('pop'); el.toggleAttribute('data-startled', true); window.setTimeout(() => el.toggleAttribute('data-startled', false), 1500); } }
    };
    // A finger does what his head does: it knocks the boards, and it wakes the sleeper.
    onTap = (x, y) => {
      const hit = (b: typeof NAME) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h, el = root.current;
      if (hit(NAME) || hit(BOARD)) { const k = hit(NAME) ? P[0] : P[1]; k.p.om += x < k.cx ? 1.4 : -1.4; play('bonk', 0); return true; }
      if (el && Math.abs(x - sx(BENCH_X)) < 40 && y > 270 && y < 350) { startled = performance.now(); play('pop'); el.toggleAttribute('data-startled', true); window.setTimeout(() => el.toggleAttribute('data-startled', false), 1500); return true; }
      return false;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); wind.x = 0; onTap = null; };
  }, [calm]);

  return (
    <svg ref={root} className="platform" viewBox="0 0 840 472" preserveAspectRatio="none" aria-hidden="true" data-gate={gate ? 'open' : 'shut'} data-train={arrived ? 'in' : gate ? 'coming' : 'away'} data-line={line} style={{ '--calm': calm ? 1 : 0 } as CSSProperties}>
      <defs>
        <filter id="pf-shadow" x="-20%" y="-20%" width="150%" height="160%"><feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#0a0d12" floodOpacity=".3" /></filter>
      </defs>
      {/* Back layer: the far wall across the track, tiled, with the two line colours along it. Underground: no sky. */}
      <g className="pf-back">
        <rect x="-30" y="0" width="900" height="320" fill="#e3e8ec" />
        <g stroke="#cdd5dc" strokeWidth="2">{tile(-30, 20, 900, 300, 46)}<path d="M-30 84H870M-30 140H870M-30 196H870M-30 252H870" /></g>
        {/* Pilasters, each a folded strip: a lit face and a shaded return. */}
        {[40, 340, 640].map(x => <g key={x}><rect x={x} y="16" width="26" height="284" fill="#eef1f4" /><rect x={x + 26} y="16" width="7" height="284" fill="#bcc5cd" /><path d={`M${x} 16V300`} stroke={CREAM} strokeWidth="2" /></g>)}
        <rect x="-30" y="212" width="900" height="9" fill={CORAL} /><rect x="-30" y="225" width="900" height="9" fill={MINT} />
        <rect x="-30" y="16" width="900" height="26" fill="#0a0d12" opacity=".12" />
        {/* The track pit, and the far rail in it. */}
        <rect x="-30" y="282" width="900" height="20" fill="#2c3138" /><rect x="-30" y="291" width="900" height="3" fill="#8a939d" />
      </g>
      {/* The train: it comes in from the left behind the platform edge, the way it will run on the big screen, and stands
          with the door of its front car on the mark. Its cab is at the right, mostly past the edge of the screen. */}
      <g className="pf-train">
        <path d="M-900 138H820Q862 138 882 176L904 236V300H-900Z" fill={SHELL} stroke={CREAM} strokeWidth="5" strokeLinejoin="round" />
        <path d="M-900 138H820Q862 138 882 176L888 192H-900Z" fill={SHELL_DARK} />
        <path d="M-900 144H818Q854 144 872 176" fill="none" stroke="#fff" strokeWidth="3" opacity=".8" />
        <path d="M806 166H838Q866 200 870 226H806Z" fill={GLASS} /><path d="M816 172H834Q846 186 852 200Z" fill="#7d93a6" opacity=".5" />
        <rect x="-900" y="282" width="1804" height="18" fill="#3a4049" />
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
      <rect x="-30" y="300" width="900" height="180" fill="#bcc4cc" />
      <g stroke="#a9b2bb" strokeWidth="2">{tile(-30, 314, 900, 160, 70)}<path d="M-30 392H870" /></g>
      <rect x="-30" y="314" width="900" height="10" fill="#0a0d12" opacity=".07" />
      {/* The front lip of the stage: the platform slab's cut edge. */}
      <rect x="-30" y="456" width="900" height="16" fill="#8f98a2" /><path d="M-30 456H870" stroke={CREAM} strokeWidth="2.5" />
      <rect x="-30" y="300" width="900" height="14" fill={SUN} /><g fill="#d9992a">{Array.from({ length: 44 }, (_, i) => <circle key={i} cx={-20 + i * 20} cy="307" r="2.6" />)}</g>
      <path d={`M${sx(DOOR_X) - 22} 334H${sx(DOOR_X) + 22}L${sx(DOOR_X)} 318Z`} fill={CREAM} opacity=".9" />
      {/* Middle layer: what stands on the platform behind him. */}
      <g className="pf-mid" filter="url(#pf-shadow)">
        {/* The stairs he came down: a folded flight, each tread lit and each riser in shade, a stringer down its side. */}
        <path d="M-30 136H46L126 338H-30Z" fill="#aeb8c2" stroke={CREAM} strokeWidth="4" strokeLinejoin="round" />
        {Array.from({ length: 8 }, (_, i) => { const y = 146 + i * 24, x = 42 + (y - 136) * .4; return <g key={i}><rect x="-30" y={y} width={x + 30} height="10" fill="#f1f4f7" /><rect x="-30" y={y + 10} width={x + 34} height="14" fill="#cbd3db" /><path d={`M-30 ${y}H${x}`} stroke="#fff" strokeWidth="1.6" /></g>; })}
        <path d="M38 104L128 322" stroke={STEEL} strokeWidth="7" strokeLinecap="round" /><path d="M128 322V342M83 213V236M38 104V128" stroke={STEEL} strokeWidth="5" strokeLinecap="round" />
        {/* The gate's far cabinet, with its reader. */}
        {cabinet(sx(GATE_X) - 26, 268, 74)}
        <circle cx={sx(GATE_X) - 9} cy="298" r="10" fill={STEEL} /><circle className="pf-reader" cx={sx(GATE_X) - 9} cy="298" r="6.5" />
        <g className="pf-paddle pf-paddle-far"><path d={`M${sx(GATE_X) + 2} 300H${sx(GATE_X) + 30}L${sx(GATE_X) + 24} 312H${sx(GATE_X) + 2}Z`} fill="#c8431f" stroke={CREAM} strokeWidth="2.5" strokeLinejoin="round" /></g>
        {/* A bench. */}
        <path d={`M${sx(BENCH_X) - 36} 327V344M${sx(BENCH_X) + 36} 327V344`} stroke={STEEL} strokeWidth="5" strokeLinecap="round" />
        <path d={`M${sx(BENCH_X) - 46} 318L${sx(BENCH_X) - 38} 308H${sx(BENCH_X) + 54}L${sx(BENCH_X) + 46} 318Z`} fill="#4a8dbd" stroke={CREAM} strokeWidth="3" strokeLinejoin="round" /><rect x={sx(BENCH_X) - 46} y="318" width="92" height="9" rx="2" fill="#2f6f9f" stroke={CREAM} strokeWidth="3" />
        {/* The bored salaryman who used to be the player, dozing where he sits. */}
        <g transform={`translate(${sx(BENCH_X) - 31} ${320 - SEAT * .78}) scale(.78)`}><g className="pf-sleeper"><SalarymanArt seated /></g>
          <g className="pf-zz"><path d="M70 14H100Q106 14 106 20V38Q106 44 100 44H82L72 54V44H70Q64 44 64 38V20Q64 14 70 14Z" fill={CREAM} /><text className="pf-z" x="85" y="37" textAnchor="middle" fontSize="20" fontWeight="600" fill={INK}>z</text><text className="pf-bang" x="85" y="38" textAnchor="middle" fontSize="24" fontWeight="600" fill={CORAL}>!</text></g>
        </g>
        {/* The line map: two lines that meet here. A turns its lamp to the other line, and the train takes it. */}
        <g transform="translate(424 150)" data-testid="platform-map">
          <path d="M20 132V176M196 132V176" stroke={STEEL} strokeWidth="7" strokeLinecap="round" />
          <rect x="0" y="0" width="216" height="136" rx="6" fill={CREAM} stroke="#fff" strokeWidth="5" /><rect x="0" y="0" width="216" height="24" rx="6" fill={STEEL} /><rect x="0" y="14" width="216" height="10" fill={STEEL} />
          <text x="12" y="17" fontSize="12" fontWeight="600" letterSpacing="1.6" fill={CREAM}>LINE MAP</text>
          <g className="pf-line" data-on={line === 0 || undefined}>
            <path d="M22 58H196" stroke={CORAL} strokeWidth="8" strokeLinecap="round" /><path d="M196 58H208" stroke={CORAL} strokeWidth="8" strokeDasharray="2 5" />
            <text x="22" y="44" fontSize="11" fontWeight="600" fill={CORAL}>{LINES[0].name}</text>
            <g className="pf-stop"><circle cx="150" cy="58" r="8" fill={CREAM} stroke={CORAL} strokeWidth="4" /><text x="150" y="82" textAnchor="middle" fontSize="12" fontWeight="600" fill={INK}>{content.worlds[LINES[0].world].title}</text></g>
          </g>
          <g className="pf-line" data-on={line === 1 || undefined}>
            <path d="M58 58V104Q58 116 70 116H196" fill="none" stroke={MINT} strokeWidth="8" strokeLinecap="round" /><path d="M196 116H208" stroke={MINT} strokeWidth="8" strokeDasharray="2 5" />
            <text x="76" y="106" fontSize="11" fontWeight="600" fill={LINES[1].ink}>{LINES[1].name}</text>
            <g className="pf-stop"><circle cx="150" cy="116" r="8" fill={CREAM} stroke={MINT} strokeWidth="4" /><text x="150" y="132" textAnchor="middle" fontSize="12" fontWeight="600" fill={INK}>{content.worlds[LINES[1].world].title}</text></g>
          </g>
          {/* The interchange: this station. The lamp leaves it along the chosen line and stops at that line's stop. */}
          <rect x="44" y="46" width="28" height="24" rx="12" fill={CREAM} stroke={INK} strokeWidth="4" />
          <text x="12" y="92" fontSize="10" fontWeight="600" fill={INK}>You are</text><text x="12" y="104" fontSize="10" fontWeight="600" fill={INK}>here</text>
          <circle key={line} className={`pf-lamp pf-lamp-${line}`} cx="58" cy="58" r="6" fill={INK} data-testid="platform-lamp" />
        </g>
      </g>
      {/* Front layer: the gate's near cabinet and its paddles, and what hangs from the roof. */}
      <g className="pf-front">
        <g filter="url(#pf-shadow)">
          <g className="pf-paddle"><path d={`M${sx(GATE_X) - 6} 352H${sx(GATE_X) + 30}L${sx(GATE_X) + 22} 368H${sx(GATE_X) - 6}Z`} fill={CORAL} stroke={CREAM} strokeWidth="3" strokeLinejoin="round" /></g>
          {cabinet(sx(GATE_X) - 30, 372, 62, 38)}<path d={`M${sx(GATE_X) - 18} 414h14l-7 -10z`} fill={MINT} />
        </g>
        <rect x="-30" y="0" width="900" height="16" fill={STEEL} /><rect x="-30" y="16" width="900" height="5" fill="#2c3138" />
        {[20, 470].map(x => <g key={x}><rect x={x} y="21" width="96" height="6" rx="2" fill="#fff4d6" /><path d={`M${x - 6} 27H${x + 102}L${x + 124} 60H${x - 28}Z`} fill="#fff4d6" opacity=".16" /></g>)}
        {/* The station's name board: whose station this is. It hangs low enough for a jump to reach. */}
        <g ref={nameRef} filter="url(#pf-shadow)" data-testid="name-board">
          <path d={`M${NAME.x + 32} ${ROOF}V${NAME.y + 2}M${NAME.x + NAME.w - 32} ${ROOF}V${NAME.y + 2}`} stroke={STEEL} strokeWidth="5" />
          <rect x={NAME.x} y={NAME.y} width={NAME.w} height={NAME.h} rx="7" fill={CREAM} stroke="#fff" strokeWidth="5" />
          <rect x={NAME.x} y={NAME.y + NAME.h - 16} width={NAME.w} height="8" fill={CORAL} /><path d={`M${NAME.x} ${NAME.y + NAME.h - 8}H${NAME.x + NAME.w}V${NAME.y + NAME.h - 6}Q${NAME.x + NAME.w} ${NAME.y + NAME.h} ${NAME.x + NAME.w - 7} ${NAME.y + NAME.h}H${NAME.x + 7}Q${NAME.x} ${NAME.y + NAME.h} ${NAME.x} ${NAME.y + NAME.h - 6}Z`} fill={MINT} />
          <text x={NAME.x + NAME.w / 2} y={NAME.y + 45} textAnchor="middle" fontSize="40" fontWeight="600" fill={INK} data-testid="station-name">Alvaro L.</text>
        </g>
        {/* The departure board: the time where the visitor is, and what to do next. */}
        <g ref={boardRef} filter="url(#pf-shadow)">
          <path d={`M${BOARD.x + 28} ${ROOF}V${BOARD.y + 2}M${BOARD.x + BOARD.w - 28} ${ROOF}V${BOARD.y + 2}`} stroke={STEEL} strokeWidth="5" />
          <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx="5" fill="#1b1408" stroke={STEEL} strokeWidth="5" />
          <text x={BOARD.x + 14} y={BOARD.y + 24} fontSize="18" fontWeight="600" fill="#ffb648">{two(now.getHours())}:{two(now.getMinutes())}</text>
          <text x={BOARD.x + BOARD.w - 14} y={BOARD.y + 24} textAnchor="end" fontSize="12" fontWeight="600" letterSpacing="1.4" fill="#ffb648" opacity=".75">MRT</text>
          <text key={status} className="pf-status" x={BOARD.x + 14} y={BOARD.y + 48} fontSize="15" fontWeight="600" fill="#ffd89a" data-testid="platform-status">{status}</text>
        </g>
      </g>
      {/* Scraps of paper the train's wind blows along the platform, and the chips a bonk knocks off. */}
      <g ref={fxRef} className="pf-fx">{Array.from({ length: 7 }, (_, i) => <path key={i} d={i % 2 ? 'M-5 -4H5L3 4H-4Z' : 'M-4 -5L5 -2L2 5L-5 3Z'} fill={[CREAM, CORAL, '#fff', SUN, CREAM, MINT, '#fff'][i]} />)}</g>
    </svg>
  );
}
