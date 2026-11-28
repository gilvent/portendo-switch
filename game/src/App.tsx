import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { content } from './content.ts';
import { lineOf, pathOf, parsePath, reduce, rideIn, start, stopOf, toysOf, type Action, type Game, type Spot } from './game.ts';
import { MAX_SPEED, nearest, seek, step, type Walker } from './walker.ts';
import type { Stop, WorldId } from './schema.ts';
import { LIGHT, reducedMotion } from './light.ts';
import type { Fx } from './fx.ts';
import { BENCH_X, GATE_X } from './Platform.tsx';
import Scene from './Scene.tsx';
import Controller from './Controller.tsx';
import LetterView from './LetterView.tsx';
import { hero as live, ride, wind } from './mrt/live.ts';
import { TUNE } from './mrt/sim.ts';
import { isMuted, play, setMuted } from './sfx.ts';
import RouteSheet from './RouteSheet.tsx';

// The arrow keys walk. The letters on the controller's buttons are those buttons: a first-time player presses what he sees.
const KEYS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
const spotOf = (g: Game): Spot => (g.place.k === 'routeSheet' ? g.place.back : g.place);
// How the salaryman moves. He is a card, but he squashes and stretches like a toy: a crouch before he sets off or
// jumps, a stretch as he goes, a squash when he lands or pulls up. `sy` is his height (1 at rest) on a springy return.
const WINDUP = .06, CROUCH = .07, JUMP = 560, FALL = 1900, SPRING = 420, DAMP = 21, DEAD = 16;
const SCRAPS = ['#e8552d', '#fff4e2', '#f6b73c'];
// Changing space: the standing paper folds flat and the page closes (FOLD_OUT), then the next page opens and its
// paper pops up (FOLD_IN).
const FOLD_OUT = 360, FOLD_IN = 620;
type Fold = 'out' | 'in' | null;
// Every letter read and every toy used leaves a stamp: this is how many the line's spaces hold.
const STAMPS = Object.values(content.worlds).filter(w => w.id !== 'intro' && !w.offLine).reduce((n, w) => n + w.stops.filter(s => s.action.kind === 'letter' || s.action.kind === 'toy').length, 0);

export default function App() {
  const [game, setGame] = useState<Game>(() => start(content, location.pathname));
  const gameRef = useRef(game);
  gameRef.current = game;
  // Getting off the train plays out before the scene swaps: the tunnel stops, the doors open, the salaryman walks out.
  // `stage` is 1 once the train has stopped and 2 once the doors are open. Input waits while it plays.
  const [arrival, setArrival] = useState(0);
  const exit = useRef<{ x: number; z: number; then: () => void } | null>(null);
  const busy = useRef(false), stood = useRef<(() => void) | null>(null);
  const turning = useRef(false);
  const trainIn = useRef(false), introGo = useRef<number | null>(null);
  const leaveAsked = useRef(-1e9), [leaving, setLeaving] = useState(0);
  useEffect(() => { if (!leaving) return; const t = window.setTimeout(() => setLeaving(0), 3000); return () => clearTimeout(t); }, [leaving]);
  const fxRef = useRef<Fx | null>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<HTMLDivElement>(null);
  const hero = useRef({ sy: 1, vs: 0, y: 0, vy: 0, air: false, crouch: 0, windup: 0, moved: false, steps: 0, look: 0, jump: false, lean: 0, drift: 0 });
  const [muted, setMute] = useState(isMuted);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const dispatch = useCallback((x: Action) => {
    if (busy.current && x.a !== 'toggleController') return;
    if (turning.current && gameRef.current.place.k === 'walk' && (x.a === 'confirm' || x.a === 'back' || x.a === 'arrive' || x.a === 'line')) return;
    const here = gameRef.current.place;
    // On the platform: the gate opens once and stays open, and the doors take him only when the train is standing.
    // A always answers: with nothing to use (or a gate already open, or a door with no train behind it) it is a jump.
    if (x.a === 'confirm' && here.k === 'walk' && here.world === 'intro' && gameRef.current.controller.mode === 'handheld' && (!here.near || (here.stop === 'gate' ? gameRef.current.toys['intro/gate'] === 1 : here.stop === 'road-end' && !trainIn.current))) { hero.current.jump = true; return; }
    if (x.a === 'confirm' && here.k === 'walk' && here.near) play(here.world === 'intro' && here.stop === 'gate' ? 'beep' : 'use');
    if (x.a === 'confirm' && here.k === 'letter') {
      // A turns the catalog's leaves; on any other letter it puts the letter down, like B.
      const l = stopOf(content, here.world, here.stop)?.action, turns = l?.kind === 'letter' && content.worlds[here.world].letters.find(k => k.id === l.letter)?.blocks.some(k => k.kind === 'specSheet');
      if (turns) { dispatchEvent(new Event('letter-confirm')); return; }
      x = { a: 'back' };
    }
    // B with nothing open leaves the whole space, so it asks first: the second press within three seconds goes.
    if (x.a === 'back' && here.k === 'walk' && content.worlds[here.world].back && !(here.near && stopOf(content, here.world, here.stop)?.action.kind === 'ride')) {
      const now = performance.now();
      if (now - leaveAsked.current > 3000) { leaveAsked.current = now; setLeaving(n => n + 1); return; }
      leaveAsked.current = -1e9; setLeaving(0);
    }
    if (x.a === 'confirm' && here.k === 'walk' && here.world !== 'intro' && gameRef.current.controller.mode === 'docked') {
      // A with nothing in reach is a jump. A at a stop uses it: the paper answers at once, before anything opens.
      if (!here.near) { hero.current.jump = true; return; }
      const s = stopOf(content, here.world, here.stop);
      if (s) { fxRef.current?.scraps(s.look ?? s.x, 96, s.z - 26, [content.worlds[here.world].color, ...SCRAPS]); hero.current.sy = .84; hero.current.vs = 3; }
    }
    if (x.a === 'confirm' && here.k === 'walk' && here.near && gameRef.current.controller.mode === 'docked' && !reducedMotion()) {
      const door = stopOf(content, here.world, here.stop);
      if (door?.action.kind === 'ride') {
        const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)); };
        busy.current = true; held.current.clear(); target.current = null;
        // The train brakes (Car.tsx) and says when it stands: only then do the doors open and he walks out.
        setArrival(1);
        stood.current = () => {
          stood.current = null; setArrival(2);
          later(480, () => { exit.current = { x: door.x, z: -205, then: () => {
            busy.current = false; exit.current = null; timers.current = []; setArrival(0);
            const [next] = reduce(content, gameRef.current, { a: 'confirm' });
            gameRef.current = next; setGame(next);
          } }; });
        };
        later(5000, () => stood.current?.());
        return;
      }
    }
    const [next, effect] = reduce(content, gameRef.current, x);
    gameRef.current = next;
    setGame(next);
    if (effect) window.open(effect.open, '_blank', 'noopener');
  }, []);

  const spot = spotOf(game);
  const mode = game.controller.mode, gateOpen = game.toys['intro/gate'] === 1;
  const world: WorldId | null = spot.k === 'lost' ? null : spot.world === 'intro' ? 'mrt' : spot.world;
  // The space on show lags the game by one page turn: `shown` is what is drawn, `fold` is where the turn has got to.
  const [shown, setShown] = useState(world);
  const [fold, setFold] = useState<Fold>(null);
  // The station the train stands at when the car opens: the one he boarded at. Coming back from a project, that is
  // the project's own stop; from the platform (or a link straight into the car), it is the home station.
  const boardedAt = useRef({ name: 'Alvaro L.', color: '#e8552d' });
  if (shown && shown !== 'mrt' && world === 'mrt') boardedAt.current = { name: content.worlds[shown].title, color: content.worlds[shown].color };
  const shownRef = useRef(shown);
  shownRef.current = shown;
  useEffect(() => {
    if (world === shown) { setFold(null); return; }
    if (reducedMotion() || !world || !shown) { setShown(world); return; }
    turning.current = true; setFold('out');
    const a = window.setTimeout(() => { turning.current = false; setShown(world); setFold('in'); }, FOLD_OUT), b = window.setTimeout(() => setFold(null), FOLD_OUT + FOLD_IN);
    return () => { clearTimeout(a); clearTimeout(b); turning.current = false; };
  }, [world]);
  const reading = game.place.k !== 'walk' || mode !== game.controller.mode;

  const path = pathOf(game.place);
  useEffect(() => {
    if (location.pathname === path) return;
    if (game.place.k === 'walk') history.replaceState(null, '', path);
    else history.pushState(null, '', path);
  }, [path, game.place.k]);
  useEffect(() => {
    const pop = () => {
      const p = parsePath(content, location.pathname);
      if (p.k === 'routeSheet') dispatch({ a: 'map' });
      else dispatch({ a: 'goto', place: p });
    };
    addEventListener('popstate', pop);
    return () => removeEventListener('popstate', pop);
  }, [dispatch]);

  const held = useRef(new Set<string>());
  const stick = useRef({ x: 0, z: 0 });
  const stickSpent = useRef(false);
  const target = useRef<{ stop: Stop; open: boolean } | null>(null);
  const walker = useRef<Walker>({ x: 0, z: 0, vx: 0, vz: 0 });
  const courierRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const rig = useRef({ x: 0, y: 0 });
  const letterRef = useRef<HTMLElement>(null);
  const lastNear = useRef<string | null>(null);
  const cam = useRef({ x: 0, z: 0, scale: 1, lift: 150, focus: 1, tall: false });
  const facing = useRef(1);
  const phase = useRef(0);
  const wasWalking = useRef(false);
  const airborne = useRef(0), wasUnseen = useRef(false);
  const fpsRef = useRef<HTMLElement>(null), meter = useRef({ n: 0, ms: 0, worst: 0 }), [showFps] = useState(() => new URLSearchParams(location.search).has('fps'));
  const framed = useRef<WorldId | null>(null);

  const measure = useCallback(() => { const tall = innerHeight > innerWidth; cam.current.scale = tall ? Math.min(.86, innerWidth / 480) : Math.max(.5, Math.min(innerWidth / 1100, innerHeight / 620, 1.1)); cam.current.lift = tall ? -40 : 150; cam.current.tall = tall; }, []);
  // A world may set its own camera height (the train stands close, so it is framed lower).
  const zoomOf = (w: WorldId) => { const k = content.worlds[w].camera; return (cam.current.tall ? k?.zoom : k?.zoomWide ?? k?.zoom) ?? 1; };
  const liftOf = (w: WorldId) => { const c = cam.current, k = content.worlds[w].camera; return (c.tall ? k?.liftTall : k?.lift) ?? c.lift; };
  useEffect(() => { measure(); addEventListener('resize', measure); return () => removeEventListener('resize', measure); }, [measure]);

  const worldRef = useRef(world);
  worldRef.current = world;
  const spawnKey = world === null ? 'lost' : `${world}:${spot.k === 'lost' ? '' : spot.stop}:${spot.k === 'walk' && spot.near ? 1 : 0}`;
  const prevWorld = useRef<WorldId | null>(null);
  useEffect(() => {
    if (!world || world === prevWorld.current || spot.k === 'lost') return;
    prevWorld.current = world;
    facing.current = 1; wasUnseen.current = false; Object.assign(hero.current, { sy: 1, vs: 0, y: 0, vy: 0, air: false, crouch: 0, windup: 0, look: 0, jump: false, lean: 0, drift: 0 });
    held.current.clear();
    stickSpent.current = true;
    target.current = null;
    const s = stopOf(content, spot.world, spot.stop);
    if (spot.world === 'intro') { walker.current = { x: -380, z: 0, vx: 0, vz: 0 }; lastNear.current = null; return; }
    if (!s) throw new Error(`no stop ${spot.stop} in ${spot.world}`);
    walker.current = { x: s.x, z: s.z, vx: 0, vz: 0 };
    lastNear.current = s.id;
    const k = content.worlds[world].camera; cam.current.x = k ? Math.min(k.x1, Math.max(k.x0, k.ahead === undefined ? 0 : s.x + (cam.current.tall ? 0 : k.ahead))) : s.x; cam.current.z = 0;
  }, [spawnKey]);

  const teleport = useCallback((w: WorldId, s: Stop) => {
    prevWorld.current = w; walker.current = { x: s.x, z: s.z, vx: 0, vz: 0 }; lastNear.current = s.id; cam.current.x = s.x; cam.current.z = s.z;
  }, []);

  const onStop = useCallback((s: Stop) => {
    const p = gameRef.current.place;
    if (p.k !== 'walk') return;
    if (reducedMotion() || p.world === 'intro') {
      if (s.action.kind === 'road') { dispatch({ a: 'arrive', stop: s.id }); return; }
      walker.current = { x: s.x, z: s.z, vx: 0, vz: 0 };
      lastNear.current = s.id;
      dispatch({ a: 'arrive', stop: s.id });
      dispatch({ a: 'confirm' });
      return;
    }
    target.current = { stop: s, open: true };
  }, [dispatch]);

  useEffect(() => {
    const tick = (_t: number, delta: number) => {
      if (fpsRef.current) { const f = meter.current; f.n++; f.ms += delta; f.worst = Math.max(f.worst, delta); if (f.ms >= 500) { fpsRef.current.textContent = `${Math.round(f.n * 1000 / f.ms)} fps · worst ${Math.round(f.worst)}ms`; f.n = 0; f.ms = 0; f.worst = 0; } }
      const g = gameRef.current, p = g.place, dt = Math.min(delta / 1000, .05);
      const ix0 = [...held.current].reduce((n, k) => n + (KEYS[k]?.[0] ?? 0), 0) + (stickSpent.current ? 0 : stick.current.x);
      const iz0 = [...held.current].reduce((n, k) => n + (KEYS[k]?.[1] ?? 0), 0) + (stickSpent.current ? 0 : stick.current.z);
      if (p.k === 'letter' && p.world !== framed.current) {
        framed.current = p.world;
        const c = cam.current, z = c.scale * zoomOf(p.world);
        if (stageRef.current) stageRef.current.style.transform = `translate3d(0,${liftOf(p.world) * c.scale}px,-260px) scale3d(${z},${z},${z}) rotateX(-13deg) translate3d(${(-c.x).toFixed(1)}px,0,0)`;
      }
      if (p.k === 'letter') { if (iz0 && letterRef.current) letterRef.current.scrollTop += iz0 * 900 * dt; return; }
      if (p.k !== 'walk' || g.controller.mode === 'docking') return;
      const w = content.worlds[p.world], c0 = cam.current;
      // Walking out through the open doors: straight to the doorway, past the walkable bounds, then the scene swaps.
      if (exit.current) {
        const e = exit.current, o = walker.current, dx = e.x - o.x, dz = e.z - o.z, d = Math.hypot(dx, dz), go = Math.min(d, 300 * dt);
        if (d < 4) { e.then(); return; }
        walker.current = { x: o.x + dx / d * go, z: o.z + dz / d * go, vx: 0, vz: 0 };
        phase.current += dt * 11;
        if (!wasWalking.current) { wasWalking.current = true; courierRef.current?.toggleAttribute('data-walking', true); }
        if (courierRef.current) courierRef.current.style.transform = `translate3d(${walker.current.x}px,0,${walker.current.z}px)`;
        if (poseRef.current) poseRef.current.style.transform = `translate3d(0,${-Math.abs(Math.sin(phase.current)) * 6}px,0)`;
        return;
      }
      // While the train brakes for his stop he cannot walk, but the brake still has him: he slides and tips with it.
      if (busy.current && p.world === 'mrt' && !reducedMotion()) {
        const o = walker.current, h = hero.current;
        walker.current = { ...o, x: Math.min(w.bounds.x1, Math.max(w.bounds.x0, o.x - ride.a * TUNE.hero.slide * 1.6 * dt)), vx: 0, vz: 0 };
        h.lean += (-ride.a * TUNE.hero.lean * 1.4 - h.lean) * Math.min(1, dt * 12);
        if (courierRef.current) courierRef.current.style.transform = `translate3d(${walker.current.x}px,0,${o.z}px)`;
        if (poseRef.current) poseRef.current.style.transform = `translate3d(0,0,0) rotateZ(${h.lean.toFixed(2)}deg)`;
        if (wasWalking.current) { wasWalking.current = false; courierRef.current?.toggleAttribute('data-walking', false); }
      }
      if (busy.current || turning.current || shownRef.current !== (p.world === 'intro' ? 'mrt' : p.world)) return;
      let ix = ix0, iz = iz0;
      // A tap on the handheld's screen walks him to that spot.
      if (p.world === 'intro' && introGo.current !== null) { const d = introGo.current - walker.current.x; if (ix0 || Math.abs(d) < 10) introGo.current = null; else ix = Math.sign(d) * Math.min(1, Math.abs(d) / 60 + .3); }
      if (ix || iz) target.current = null;
      else if (target.current) [ix, iz] = seek(walker.current, target.current.stop.x, target.current.stop.z);
      const h = hero.current, calm = reducedMotion(), fx = p.world === 'intro' ? null : fxRef.current, o = walker.current, pushing = Math.hypot(ix, iz) > .2;
      // Anticipation: setting off from a stand, he dips for a moment before his feet go.
      if (pushing && !h.moved && !calm && Math.hypot(o.vx, o.vz) < 40 && !h.air) h.windup = WINDUP;
      if (!pushing && h.moved && !calm && !h.air && Math.hypot(o.vx, o.vz) > MAX_SPEED * .6) { h.sy = .9; h.vs = -1.5; fx?.dust(o.x + facing.current * 14, o.z, facing.current, 2); }
      h.moved = pushing;
      // The dip is only a pose: his feet answer the stick at once, so a short tap still moves him.
      const held0 = h.windup > 0;
      if (held0) { h.windup -= dt; h.sy += (.86 - h.sy) * Math.min(1, dt * 40); h.vs = 0; if (h.windup <= 0) { h.vs = 3.4; fx?.dust(o.x, o.z, -Math.sign(ix || facing.current), 2); } }
      let n = step(o, ix, iz, dt, w);
      // In the car the train's own acceleration moves him: a little on his feet, a lot in the air.
      if (p.world === 'mrt' && !calm) {
        h.drift = h.air ? h.drift - ride.a * TUNE.hero.air * dt : 0;
        const dx = (h.air ? h.drift : -ride.a * TUNE.hero.slide) * dt;
        if (dx) n = { ...n, x: Math.min(w.bounds.x1, Math.max(w.bounds.x0, n.x + dx)) };
      }
      // The shut ticket gate stops him.
      live.pushing = false;
      if (p.world === 'intro' && g.toys['intro/gate'] !== 1 && n.x > GATE_X - 30) { n = { ...n, x: GATE_X - 30, vx: 0 }; live.pushing = ix > .3; }
      walker.current = n;
      const near = nearest(w, n.x, n.z)?.id ?? null;
      if (near !== lastNear.current) {
        lastNear.current = near;
        dispatch({ a: 'arrive', stop: near });
      }
      if (target.current && near === target.current.stop.id) {
        const t = target.current; target.current = null;
        // Walking into a door already went through it: A there would only walk him back out.
        if (t.open && t.stop.action.kind !== 'road') dispatch({ a: 'confirm' });
      }
      const speed = Math.hypot(n.vx, n.vz) / MAX_SPEED;
      // The card flip: he turns over like a playing card, in stepped frames, with a little skip as he does.
      const turn = pushing && Math.abs(ix) > .3 ? Math.sign(ix) : Math.abs(n.vx) > 25 ? Math.sign(n.vx) : facing.current;
      if (turn !== facing.current) {
        facing.current = turn;
        // The mirror alone would move his pocketed hand to the other side, so the arms swap with it (Hero.tsx).
        if (flipRef.current) { gsap.to(flipRef.current, { rotationY: turn > 0 ? 0 : 180, duration: calm ? 0 : .2, ease: 'steps(5)', overwrite: true }); flipRef.current.dataset.face = String(turn); }
        if (!calm && !h.air && p.world !== 'intro') { h.air = true; h.vy = 210; h.vs = 2.2; fx?.dust(n.x, n.z, 0, 2); }
      }
      // Jump: a crouch, then up with a stretch; down with a squash and dust.
      if (h.jump) { h.jump = false; if (!h.air && h.crouch <= 0 && !calm) h.crouch = CROUCH; }
      if (h.crouch > 0) { h.crouch -= dt; h.sy += (.76 - h.sy) * Math.min(1, dt * 45); h.vs = 0; if (h.crouch <= 0) { h.air = true; h.vy = JUMP; h.sy = 1.14; h.vs = 2; fx?.dust(n.x, n.z, 0, 2); live.jumps++; play('jump'); } }
      // A bonk: his head met something hard, so his rise ends there.
      if (live.bonk === 1 && h.air) { h.vy = Math.min(h.vy, -60); h.sy = .86; h.vs = 0; }
      live.bonk = 0;
      if (h.air) { h.vy -= FALL * dt; h.y += h.vy * dt; if (h.y <= 0) { const hard = Math.min(1, -h.vy / JUMP); h.y = 0; h.vy = 0; h.air = false; h.sy = 1 - .3 * hard; h.vs = 0; fx?.dust(n.x, n.z, 0, hard > .6 ? 4 : 2); if (hard > .5) { live.landings++; play('land'); } } }
      Object.assign(live, { x: n.x, z: n.z, vx: n.vx, vz: n.vz, y: h.y, vy: h.vy, air: h.air, facing: facing.current });
      h.vs += (-(h.sy - 1) * SPRING - h.vs * DAMP) * dt; h.sy = Math.min(1.3, Math.max(.6, h.sy + h.vs * dt));
      const before = phase.current;
      phase.current += speed * dt * 16;
      // Footsteps: every other stride kicks a dot of dust out behind him.
      if (!h.air && speed > .6 && Math.floor(phase.current / Math.PI) !== Math.floor(before / Math.PI) && ++h.steps % 2 === 0) fx?.dust(n.x - facing.current * 10, n.z, -facing.current, 1);
      fx?.touch(n.x, n.z, speed > .2 || h.air);
      const bob = calm || h.air ? 0 : Math.abs(Math.sin(phase.current)) * 9 * speed;
      const blown = p.world === 'mrt' ? -ride.a * TUNE.hero.lean : p.world === 'intro' ? wind.x * 9 : 0;
      h.lean += ((calm ? 0 : (held0 ? -Math.sign(ix || 1) * 7 : (n.vx / MAX_SPEED) * 6) + blown) - h.lean) * Math.min(1, dt * 18);
      const lean = h.lean, sy = calm ? 1 : h.sy, sx = 1 + (1 - sy) * .55;
      const rx = calm ? 0 : -n.vz / MAX_SPEED * 1.4, ry = calm ? 0 : n.vx / MAX_SPEED * 2.2, rk = 1 - Math.exp(-6 * dt);
      if (Math.abs(rx - rig.current.x) + Math.abs(ry - rig.current.y) > .004) {
        rig.current.x += (rx - rig.current.x) * rk; rig.current.y += (ry - rig.current.y) * rk;
        if (rigRef.current) rigRef.current.style.transform = `rotateX(${rig.current.x.toFixed(3)}deg) rotateY(${rig.current.y.toFixed(3)}deg)`;
      }
      if (p.world === 'intro') {
        const el = introRef.current, screen = el?.parentElement;
        if (el && screen) {
          el.style.transform = `translate3d(${((n.x + 420) / 840 * 100).toFixed(2)}cqw,calc(${(-bob).toFixed(1)}px - ${(h.y / 840 * 92).toFixed(2)}cqw),0) rotate(${lean.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
          // The toy theatre's layers slide against each other as he crosses; he turns over like a card; the sleeper stirs.
          screen.style.setProperty('--par', (n.x / 420).toFixed(3)); el.style.setProperty('--f', String(facing.current)); el.dataset.face = String(facing.current);
          screen.toggleAttribute('data-near-bench', Math.abs(n.x - BENCH_X) < 44);
        }
        return;
      }
      // Soft follow: the camera leads the way he faces (further while he walks), eases after him, and lets him move a
      // little inside a dead zone before it follows at all. His speed is fed forward (vx * .2 cancels the lag of an ease at
      // 5/s), so the view does not trail behind him at a run or slide on after he has stopped.
      h.look += ((c0.tall ? 0 : facing.current * (speed > .2 ? 84 : 26)) - h.look) * (calm ? 1 : 1 - Math.exp(-2.4 * dt));
      const c = c0, k = calm ? 1 : 1 - Math.exp(-5 * dt);
      // A stop with `focus` pulls the camera in on itself while the courier stands there.
      const spotted = p.near ? stopOf(content, p.world, p.stop) : undefined, zoomIn = spotted?.focus ? spotted.focus * (w.camera?.zoom ?? 1) / zoomOf(p.world) : 1;
      const frame = w.camera, leaning = !!spotted && zoomIn !== 1, want = leaning ? (spotted.look ?? spotted.x) * .8 + n.x * .2 : n.x + n.vx * .2 + h.look + (c.tall ? 0 : w.camera?.ahead ?? 0);
      const err = (frame && !leaning ? Math.min(frame.x1, Math.max(frame.x0, want)) : want) - c.x, slack = leaning || calm ? 0 : DEAD;
      if (Math.abs(err) > slack) c.x += (err - Math.sign(err) * slack) * k;
      c.z += ((frame ? n.z * .4 : n.z) - c.z) * k;
      c.focus += (zoomIn - c.focus) * (calm ? 1 : 1 - Math.exp(-3 * dt));
      const walking = speed > .08;
      if (walking !== wasWalking.current) { wasWalking.current = walking; courierRef.current?.toggleAttribute('data-walking', walking); }
      const unseen = !!w.hidden?.some(r => n.x > r.x0 && n.x < r.x1 && n.z > r.z0 && n.z < r.z1);
      if (unseen !== wasUnseen.current) { wasUnseen.current = unseen; courierRef.current?.toggleAttribute('data-unseen', unseen); }
      if (courierRef.current) { courierRef.current.style.transform = `translate3d(${n.x}px,0,${n.z}px)`; if (h.y !== airborne.current) { airborne.current = h.y; const cs = courierRef.current.style; cs.setProperty('--air', (h.y / 90).toFixed(2)); cs.setProperty('--jx', `${(h.y * LIGHT.dx).toFixed(1)}px`); cs.setProperty('--jz', `${(-h.y * LIGHT.dy).toFixed(1)}px`); } }
      if (poseRef.current) poseRef.current.style.transform = `translate3d(0,${(-bob - h.y).toFixed(1)}px,0) rotateZ(${lean.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      // The far backdrop slides a little against the scene: the furthest layer of the parallax.
      if (skyRef.current) skyRef.current.style.transform = `translate3d(${(-c.x * .1 * c.scale).toFixed(1)}px,0,0)`;
      const zs = (c.scale * zoomOf(p.world) * c.focus).toFixed(4);
      if (stageRef.current) stageRef.current.style.transform = `translate3d(0,${(liftOf(p.world) * c.scale * (1 + (c.focus - 1) * 1.6)).toFixed(1)}px,${(-260 - c.z * .5).toFixed(1)}px) scale3d(${zs},${zs},${zs}) rotateX(-13deg) translate3d(${(-c.x).toFixed(1)}px,0,${(-c.z * .35).toFixed(1)}px)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [dispatch]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const place = gameRef.current.place, k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === 'c') { dispatch({ a: 'toggleController' }); return; }
      if (k === 'm' || k === 'x') { dispatch({ a: 'map' }); return; }
      if (k === 'Escape' || k === 'Backspace' || k === 'b') { dispatch({ a: 'back' }); e.preventDefault(); return; }
      if (k === 'a') { dispatch({ a: 'confirm' }); return; }
      if (k === 'Enter' || k === ' ') {
        if (document.activeElement instanceof HTMLButtonElement || document.activeElement instanceof HTMLAnchorElement) return;
        dispatch({ a: 'confirm' }); e.preventDefault(); return;
      }
      if (k in KEYS) {
        if (place.k === 'walk') { if (!e.repeat) held.current.add(k); e.preventDefault(); }
      }
    };
    const up = (e: KeyboardEvent) => { held.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); };
    const blur = () => held.current.clear();
    addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('blur', blur);
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur); };
  }, [dispatch]);

  const onDockDone = useCallback(() => {
    const s = rideIn(content, 'mrt')?.stop;
    if (!s) throw new Error('the MRT has no doors');
    teleport('mrt', s);
    // He has just come in by these doors. The train pulls away under him at once (Car.tsx).
    walker.current = { x: s.x, z: s.z + 12, vx: 0, vz: 0 };
    dispatch({ a: 'dockDone' });
  }, [dispatch, teleport]);

  // Every stamp lands with a thump.
  const stamped = useRef(0);
  useEffect(() => { if (game.stamps.length > stamped.current) play('stamp'); stamped.current = game.stamps.length; }, [game.stamps.length]);
  const openStop = useMemo(() => (spot.k === 'letter' ? stopOf(content, spot.world, spot.stop) : undefined), [spot]);
  const nearStop = spot.k === 'walk' && spot.near ? spot.stop : null;
  const lit = game.place.k === 'letter' ? 'B' : nearStop && spot.k === 'walk' ? 'A' : game.place.k === 'walk' ? 'stick' : null;

  return (
    <div className="app" data-reading={spot.k === 'letter' && game.place.k === 'letter' ? openStop?.action.kind === 'letter' ? 'yes' : undefined : undefined} data-testid="app" data-ctrl={game.controller.visible ? 'shown' : 'hidden'}>
      {shown && <Scene key={shown} world={content.worlds[shown]} nearStop={arrival || shown !== world ? null : nearStop} toys={arrival > 1 ? { ...toysOf(game, shown), doors: 1 } : toysOf(game, shown)} line={lineOf(content, game, shown)} arrival={arrival} fold={fold} open={game.place.k === 'letter' && shown === 'mrt'} from={boardedAt.current} onStood={() => stood.current?.()} onLine={step => dispatch({ a: 'line', step })} stageRef={stageRef} courierRef={courierRef} flipRef={flipRef} poseRef={poseRef} skyRef={skyRef} fxRef={fxRef} onStop={onStop} />}
      <Controller rigRef={rigRef} mode={mode} visible={game.controller.visible} lit={lit} near={spot.k === 'walk' && spot.world === 'intro' && spot.near ? spot.stop === 'gate' ? 'gate' : spot.stop === 'map' ? 'map' : 'door' : null} gate={gateOpen} line={game.toys['intro/map'] ?? 0} trainIn={trainIn} onScreenTap={x => { const g = gameRef.current.place; if (g.k !== 'walk' || g.world !== 'intro') return; if (g.near && Math.abs((stopOf(content, 'intro', g.stop)?.x ?? 1e9) - x) < 120) dispatch({ a: 'confirm' }); else introGo.current = x; }} introRef={introRef} stick={stick} stickSpent={stickSpent} dispatch={dispatch} onDockDone={onDockDone} />
      {leaving > 0 && game.place.k === 'walk' && <p className="leave" key={leaving} data-testid="leave-ask">Press <b>B</b> again to leave {content.worlds[game.place.world].title}</p>}
      {showFps && <b className="fps" ref={fpsRef} data-testid="fps" />}
      <div className="corner">
        <button data-testid="toggle-sound" aria-pressed={!muted} onClick={e => { if (e.detail) e.currentTarget.blur(); setMuted(!muted); setMute(!muted); }}>{muted ? 'Sound off' : 'Sound on'}</button>
        <button data-testid="open-route" onClick={e => { if (e.detail) e.currentTarget.blur(); dispatch({ a: 'map' }); }}>Route sheet</button>
        <button data-testid="toggle-controller" aria-pressed={!game.controller.visible} onClick={e => { if (e.detail) e.currentTarget.blur(); dispatch({ a: 'toggleController' }); }}>{game.controller.visible ? 'Hide controller' : 'Show controller'}</button>
      </div>
      {game.place.k === 'walk' && <p className="keys" data-testid="keys"><b>← ↑ ↓ →</b> walk <b>A</b> or <b>Enter</b> use, jump <b>B</b> or <b>Esc</b> close, leave</p>}
      {/* The commuter pass he tapped at the gate is the stamp card: every letter read and toy used stamps it. */}
      {(mode === 'docked' || gateOpen) && game.place.k !== 'lost' && <div className={`stamps${mode === 'docked' ? '' : ' fresh'}`} key={game.stamps.length} data-testid="stamps"><b>Alvaro L.</b>{game.stamps.length} of {STAMPS} stamps</div>}
      {spot.k === 'letter' && game.place.k === 'letter' && openStop?.action.kind === 'letter' && <LetterView ref={letterRef} toys={toysOf(game, spot.world)} world={spot.world} stop={spot.stop} letterId={openStop.action.letter} onClose={() => dispatch({ a: 'back' })} />}
      {game.place.k === 'routeSheet' && <RouteSheet onGo={p => { const k = p.k === 'walk' ? p : p; if (k.k !== 'lost') { const s = stopOf(content, k.world, k.stop); if (s) { if (k.world !== prevWorld.current) { teleport(k.world, s); } else { walker.current = { x: s.x, z: s.z, vx: 0, vz: 0 }; lastNear.current = s.id; } } } dispatch({ a: 'goto', place: p }); }} onClose={() => dispatch({ a: 'back' })} />}
      {game.place.k === 'lost' && <section className="sheet" data-testid="lost"><h1>Wrong stop</h1><p>No line runs to {game.place.path}.</p><button data-testid="lost-home" onClick={() => dispatch({ a: 'confirm' })}>Back on the train</button></section>}
    </div>
  );
}
