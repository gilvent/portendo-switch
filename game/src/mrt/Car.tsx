// The MRT car's live layer: everything in the car that moves by physics rather than by a baked loop, and the station
// that slides up to the windows. docs/MRT_DESIGN.md says what each thing is for; sim.ts is the physics; this file
// connects the two to the sheets fold.tsx draws (`[data-live]`) and to what the salaryman is doing (live.ts).
import { useEffect, useRef, type CSSProperties, type MutableRefObject, type RefObject } from 'react';
import gsap from 'gsap';
import { reducedMotion } from '../light.ts';
import type { Fx } from '../fx.ts';
import { play } from '../sfx.ts';
import { BED, BORE, CAN, CAR, HANDSET, RAIL, ROLL, STRAP } from '../art/scenes/car.ts';
import { matrix } from '../art/fold.tsx';
import { HERO_HEIGHT } from '../art/Hero.tsx';
import { brake, depart, newTrain, pend, resting, stepCan, stepPend, stepTrain, TUNE, type Can, type Pend, type Train } from './sim.ts';
import { hero, ride } from './live.ts';

// The looping animations that are the train's motion (styles.css): they all play at its speed.
const RUNS = new Set(['bore-rush', 'wheel-spin', 'car-sway', 'car-jolt', 'beam-flicker']);
// How fast the station passes the windows at line speed, units/s, and how far its sheet reaches either side of the door.
const PASS = 4200, STN = { x: -1400, w: 4160, tile: 160 };
const DEG = 180 / Math.PI, FLOOR = { x0: -414, x1: 408, z0: -34, z1: 104 };
const SPLASH = ['#e8552d', '#fff4e2', '#d9dee3'];
// Who looks up when the can hits the wall at their end of the car.
const WITNESS = { left: 'kid', right: 'strap' };

export type Station = { name: string; color: string };
// arrival: 0 while the train runs, 1 once a stop is asked for, 2 once the doors are open. station: the stop the sign
// shows. home: the station he boarded at. open: the help point's card is up. roll: which poster the roll shows.
type Props = { root: RefObject<HTMLDivElement>; fx: MutableRefObject<Fx | null>; arrival: number; station: Station; home: Station; open: boolean; roll: number; posters: string[]; onStood: () => void };

// A live sheet lying on the cove, the leaning upper wall: [x, y] from the cove's lower left, as train.ts places prints.
const COVE_LEN = Math.hypot(CAR.CEIL - CAR.H, CAR.COVE_IN), COVE_V = [0, (CAR.CEIL - CAR.H) / COVE_LEN, CAR.COVE_IN / COVE_LEN], COVE_N = [0, -COVE_V[2], COVE_V[1]];
const onCove = (x: number, y: number, w: number, h: number, gap: number): CSSProperties => ({ width: w, height: h, transform: matrix({ o: [x, CAR.H + COVE_V[1] * y + COVE_N[1] * gap, -CAR.D / 2 + COVE_V[2] * y + COVE_N[2] * gap], u: [1, 0, 0], v: COVE_V, h }) });
const ROLL_H = COVE_LEN - 32;

export default function Car({ root, fx, arrival, station, home, open, roll, posters, onStood }: Props) {
  const stood = useRef(onStood); stood.current = onStood;
  const sim = useRef<{ train: Train; straps: Pend[]; bonked: number[]; handset: Pend; can: Can; kicked: number; landings: number; s: number; shown: number; popped: number } | null>(null);
  const stationRef = useRef<HTMLDivElement>(null), arriving = useRef(arrival);
  arriving.current = arrival;
  if (!sim.current) sim.current = {
    train: newTrain(), bonked: STRAP.xs.map(() => -1e9), kicked: -1e9, landings: hero.landings, s: 0, shown: -1, popped: 0,
    // No two straps are quite alike: a little longer, a little stiffer.
    straps: STRAP.xs.map((_, i) => pend(STRAP.len * (.94 + ((i * 37) % 11) / 90), 1.25 + ((i * 53) % 7) / 14)),
    handset: pend(HANDSET.len, 1.1), can: { x: CAN.x, z: CAN.z, vx: 0, vz: 0, turn: 0, flat: 0 }
  };
  // Lifting the handset sets it swinging.
  useEffect(() => { if (open && sim.current && !reducedMotion()) { sim.current.handset.om += 5; play('pickup'); } }, [open]);
  useEffect(() => { if (arrival === 2) play('doors'); }, [arrival]);

  useEffect(() => {
    const el = root.current, S = sim.current;
    if (!el || !S) return;
    // For the journey test, which reads the physics rather than guessing it from the picture.
    (window as unknown as { __mrt: unknown }).__mrt = S;
    const calm = reducedMotion();
    let lives = new Map<string, HTMLElement>(), looked = 0, rate = -1, phase: Train['mode'] = 'stand', seed = 29;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const find = () => { lives = new Map([...el.querySelectorAll<HTMLElement>('[data-live]')].map(e => [e.dataset.live!, e])); };
    const setRate = (v: number) => {
      rate = v;
      for (const a of el.getAnimations({ subtree: true })) if (a instanceof CSSAnimation && RUNS.has(a.animationName)) a.playbackRate = Math.max(.001, v);
      el.style.setProperty('--speed', v.toFixed(3));
    };
    const put = (name: string, vars: Record<string, string>) => { const e = lives.get(name); if (e) for (const k in vars) e.style.setProperty(k, vars[k]); };
    // How far the train will still travel before it stands: the station starts exactly that far up the line.
    const stoppingDistance = () => { const t = { ...S.train }; let d = 0; for (let i = 0; i < 600 && t.mode !== 'stand'; i++) { stepTrain(t, 1 / 120, () => .5); d += t.v / 120; } return d; };
    const showStation = (which: number) => {
      const e = stationRef.current; if (!e || S.shown === which) return;
      S.shown = which; e.dataset.which = String(which); e.style.visibility = which < 0 ? 'hidden' : 'visible';
    };
    if (calm) { ride.a = 0; ride.v = 0; return; }
    // The car opens standing at the station he boarded from, and pulls away at once.
    showStation(0); depart(S.train); play('leave');
    // A slow frame is stepped in several short ones, so the car keeps real time on a slow device.
    const tick = (_t: number, delta: number) => { let left = Math.min(delta / 1000, .25); while (left > 1e-4) { const dt = Math.min(left, 1 / 50); left -= dt; frame(dt, left <= 1e-4); } };
    const frame = (dt: number, draw: boolean) => {
      const now = performance.now(), T = S.train;
      if (lives.size < STRAP.xs.length && now - looked > 400) { looked = now; find(); }
      if (arriving.current && T.mode !== 'brake' && T.mode !== 'stand') { brake(T); S.s = stoppingDistance() * PASS; showStation(1); play('chime'); play('brake'); }
      stepTrain(T, dt, rand);
      ride.a = T.a; ride.v = T.v;
      if (Math.abs(T.v - rate) > .012 || (T.v === 0) !== (rate === 0) || (T.v === 1) !== (rate === 1)) setRate(T.v);
      // The station: ahead of the train while it brakes, falling behind as it pulls away.
      if (S.shown >= 0) {
        S.s -= T.v * PASS * dt;
        if (T.mode === 'stand') S.s = 0;
        if (S.s < -STN.w - 300) showStation(-1);
        else if (draw && stationRef.current) stationRef.current.style.transform = `translate3d(${(STN.x + S.s).toFixed(1)}px,${-BORE.top}px,${BORE.z + 14}px)`;
      }
      // The moment it stands, everybody jolts, one after another down the car.
      if (phase === 'brake' && T.mode === 'stand') stood.current();
      if (phase === 'brake' && T.mode === 'stand') ['strap', 'office', 'grandpa', 'student', 'sleeper', 'kid'].forEach((n, i) => window.setTimeout(() => fx.current?.nudge(n, n === 'sleeper' ? '!' : undefined), i * 55));
      phase = T.mode;

      const ax = T.a * TUNE.push, head = hero.y + HERO_HEIGHT, ring = RAIL.y + 4 - STRAP.len;
      // A jump anywhere under a rail finds a strap: the nearest one.
      const under = STRAP.xs.reduce((best, x, i) => (Math.abs(hero.x - x) < Math.abs(hero.x - STRAP.xs[best]) ? i : best), 0);
      S.straps.forEach((p, i) => {
        const x = STRAP.xs[i];
        // A bonk: his head, on the way up, under this strap.
        if (hero.air && hero.vy > 0 && Math.abs(hero.z - RAIL.z) < 62 && head > ring && Math.abs(hero.x - x) < 30 && i === under && now - S.bonked[i] > 350) {
          S.bonked[i] = now; p.om += (hero.vx < -30 ? -1 : hero.vx > 30 ? 1 : i % 2 ? 1 : -1) * (5.5 + Math.abs(hero.vx) / 110); hero.bonk = 2; play('ting', 0);
          fx.current?.scraps(x, ring + 8, RAIL.z + 8, SPLASH, 3);
        }
        if (ax || !resting(p)) { stepPend(p, ax, dt); if (draw) put(`strap-${i}`, { '--lr': `${(-p.th * DEG).toFixed(2)}deg` }); }
      });
      if (ax || !resting(S.handset)) { stepPend(S.handset, ax, dt); if (draw) put('handset', { '--lr': `${(-S.handset.th * DEG).toFixed(2)}deg` }); }

      // The can.
      const c = S.can, was = c.flat, dx = c.x - hero.x, dz = c.z - hero.z, close = Math.abs(dx) < 27 && Math.abs(dz) < 24;
      if (hero.landings !== S.landings) {
        S.landings = hero.landings;
        if (close && Math.abs(dx) < 20 && c.flat <= 0) { c.flat = TUNE.can.flat; play('crunch'); fx.current?.scraps(c.x, 6, c.z + 6, SPLASH, 6); }
      }
      if (close && c.flat <= 0 && hero.y < 12 && now - S.kicked > 140) {
        if (hero.vx * dx > 0 && Math.abs(hero.vx) > 40 && Math.abs(hero.vx) > Math.abs(c.vx) * .9) { c.vx = hero.vx * TUNE.can.kick + Math.sign(dx) * 30; c.vz += hero.vz * .35; S.kicked = now; play('clink'); }
        else if (c.vx * dx < 0 && Math.abs(c.vx) > 30) { c.vx *= -.4; S.kicked = now; play('clink'); }
        else if (hero.vz * dz > 0 && Math.abs(hero.vz) > 60) { c.vz = hero.vz * .9; c.vx += dx * 2; S.kicked = now; play('clink'); }
      }
      const moving = c.vx || c.vz || c.flat > 0 || was > 0 || Math.abs(ax * TUNE.can.share) > TUNE.can.still;
      const hit = stepCan(c, -ax, dt, FLOOR);
      if (hit) { play('clank'); fx.current?.dust(c.x, c.z, c.x < 0 ? 1 : -1, 3); if (hit > 180) fx.current?.nudge(c.x < 0 ? WITNESS.left : WITNESS.right, '!'); }
      if (was > 0 && c.flat <= 0) { S.popped = now; play('pop'); }
      if (draw && (moving || now - S.popped < 400)) {
        // Flattened, it lies wide and low; springing back it overshoots once.
        const pop = now - S.popped < 320 ? 1 + Math.sin((now - S.popped) / 320 * Math.PI) * .3 : 1, sy = c.flat > 0 ? .24 : pop, sx = c.flat > 0 ? 1.3 : 1;
        const at = { '--lx': `${(c.x - CAN.x).toFixed(1)}px`, '--lz': `${(c.z - CAN.z).toFixed(1)}px`, '--lsx': String(sx), '--lsy': sy.toFixed(2) };
        put('can', at); put('can-end', { ...at, '--ly': `${(CAN.r * (1 - sy)).toFixed(1)}px`, '--lr': `${(c.turn * DEG % 360).toFixed(1)}deg` });
      }
    };
    // A finger on a live thing: straps and the handset swing, the can is flicked along the car.
    const tapped = (e: Event) => {
      const name = (e as CustomEvent<string>).detail, i = +name.slice(6);
      if (name.startsWith('strap-')) { S.straps[i].om += i % 2 ? 6 : -6; play('ting', 0); }
      else if (name === 'handset') { S.handset.om += 6; play('ting', 0); }
      else if (name.startsWith('can') && S.can.flat <= 0) { S.can.vx = (S.can.x > hero.x ? 1 : -1) * 300; play('clink', 0); }
    };
    el.addEventListener('live-tap', tapped);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); el.removeEventListener('live-tap', tapped); ride.a = 0; ride.v = 0; };
  }, [root, fx]);

  useEffect(() => { if (roll) play('flap'); }, [roll]);
  const board = (s: Station, which: number) => <div className="st-board" data-which={which} style={{ '--c': s.color } as CSSProperties}><b>{s.name}</b></div>;
  return (<>
    {/* The station: its wall, the platform's edge, and its name boards where the windows will stand. */}
    <div className="station" ref={stationRef} aria-hidden="true" data-testid="station" style={{ visibility: 'hidden', transform: `translate3d(${STN.x}px,${-BORE.top}px,${BORE.z + 14}px)` }}>
      {/* Cut into narrow tiles: a browser drops part of any wide sheet that crosses the edge of the screen. */}
      {Array.from({ length: Math.ceil(STN.w / STN.tile) }, (_, k) => <i key={k} className="st-tile" style={{ width: STN.tile, height: BORE.top + BED - 8, backgroundPositionX: -k * STN.tile, transform: `translate3d(${k * STN.tile}px,0,0)` }} />)}
      {[-262, 262, 900, 1500].map(x => <div key={x} className="st-at" style={{ transform: `translate3d(${x - STN.x}px,${BORE.top - 206}px,1px)` }}>{board(home, 0)}{board(station, 1)}</div>)}
    </div>
    {/* The poster roll: one long strip behind its window, wound on a poster at a time. */}
    <div className="roll" data-testid="poster-roll" data-roll={roll} style={onCove(ROLL.x, 12, ROLL.w, ROLL_H, 2.4)}>
      <div className="roll-strip" style={{ transform: `translate3d(0,${-roll * ROLL_H}px,0)` }}>{posters.map((t, i) => <p key={t} className={`roll-face roll-${i}`} style={{ height: ROLL_H }}>{t}</p>)}</div>
    </div>
  </>);
}
