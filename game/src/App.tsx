import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { content } from './content.ts';
import { lineOf, pathOf, parsePath, reduce, rideIn, start, stopOf, toysOf, type Action, type Game, type Spot } from './game.ts';
import { MAX_SPEED, nearest, seek, step, type Walker } from './walker.ts';
import type { Stop, WorldId } from './schema.ts';
import { reducedMotion } from './light.ts';
import Scene from './Scene.tsx';
import Controller from './Controller.tsx';
import LetterView from './LetterView.tsx';
import RouteSheet from './RouteSheet.tsx';

const KEYS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] };
const spotOf = (g: Game): Spot => (g.place.k === 'routeSheet' ? g.place.back : g.place);

export default function App() {
  const [game, setGame] = useState<Game>(() => start(content, location.pathname));
  const gameRef = useRef(game);
  gameRef.current = game;
  // Getting off the train plays out before the scene swaps: the tunnel stops, the doors open, the salaryman walks out.
  // `stage` is 1 once the train has stopped and 2 once the doors are open. Input waits while it plays.
  const [arrival, setArrival] = useState(0);
  const exit = useRef<{ x: number; z: number; then: () => void } | null>(null);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const dispatch = useCallback((x: Action) => {
    if (busy.current && x.a !== 'toggleController') return;
    if (x.a === 'confirm' && gameRef.current.place.k === 'letter') { dispatchEvent(new Event('letter-confirm')); return; }
    const here = gameRef.current.place;
    if (x.a === 'confirm' && here.k === 'walk' && here.near && gameRef.current.controller.mode === 'docked' && !reducedMotion()) {
      const door = stopOf(content, here.world, here.stop);
      if (door?.action.kind === 'ride') {
        const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)); };
        busy.current = true; held.current.clear(); target.current = null;
        setArrival(1);
        later(450, () => setArrival(2));
        later(950, () => { exit.current = { x: door.x, z: -205, then: () => {
          busy.current = false; exit.current = null; timers.current = []; setArrival(0);
          const [next] = reduce(content, gameRef.current, { a: 'confirm' });
          gameRef.current = next; setGame(next);
        } }; });
        return;
      }
    }
    const [next, effect] = reduce(content, gameRef.current, x);
    gameRef.current = next;
    setGame(next);
    if (effect) window.open(effect.open, '_blank', 'noopener');
  }, []);

  const spot = spotOf(game);
  const mode = game.controller.mode;
  const world: WorldId | null = spot.k === 'lost' ? null : spot.world === 'intro' ? 'mrt' : spot.world;
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
  const framed = useRef<WorldId | null>(null);

  const measure = useCallback(() => { const tall = innerHeight > innerWidth; cam.current.scale = tall ? Math.min(.86, innerWidth / 480) : Math.max(.5, Math.min(innerWidth / 1100, innerHeight / 620, 1.1)); cam.current.lift = tall ? -40 : 150; cam.current.tall = tall; }, []);
  // A world may set its own camera height (the train stands close, so it is framed lower).
  const liftOf = (w: WorldId) => { const c = cam.current, k = content.worlds[w].camera; return (c.tall ? k?.liftTall : k?.lift) ?? c.lift; };
  useEffect(() => { measure(); addEventListener('resize', measure); return () => removeEventListener('resize', measure); }, [measure]);

  const worldRef = useRef(world);
  worldRef.current = world;
  const spawnKey = world === null ? 'lost' : `${world}:${spot.k === 'lost' ? '' : spot.stop}:${spot.k === 'walk' && spot.near ? 1 : 0}`;
  const prevWorld = useRef<WorldId | null>(null);
  useEffect(() => {
    if (!world || world === prevWorld.current || spot.k === 'lost') return;
    prevWorld.current = world;
    held.current.clear();
    stickSpent.current = true;
    target.current = null;
    const s = stopOf(content, spot.world, spot.stop);
    if (spot.world === 'intro') { walker.current = { x: -380, z: 0, vx: 0, vz: 0 }; lastNear.current = null; return; }
    if (!s) throw new Error(`no stop ${spot.stop} in ${spot.world}`);
    walker.current = { x: s.x, z: s.z, vx: 0, vz: 0 };
    lastNear.current = s.id;
    cam.current.x = content.worlds[world].camera ? 0 : s.x; cam.current.z = 0;
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
      const g = gameRef.current, p = g.place, dt = Math.min(delta / 1000, .05);
      const ix0 = [...held.current].reduce((n, k) => n + (KEYS[k]?.[0] ?? 0), 0) + (stickSpent.current ? 0 : stick.current.x);
      const iz0 = [...held.current].reduce((n, k) => n + (KEYS[k]?.[1] ?? 0), 0) + (stickSpent.current ? 0 : stick.current.z);
      if (p.k === 'letter' && p.world !== framed.current) {
        framed.current = p.world;
        const c = cam.current, z = c.scale * (content.worlds[p.world].camera?.zoom ?? 1);
        if (stageRef.current) stageRef.current.style.transform = `translate3d(0,${liftOf(p.world) * c.scale}px,-260px) scale3d(${z},${z},${z}) rotateX(-13deg) translate3d(${(-c.x).toFixed(1)}px,0,0)`;
      }
      if (p.k === 'letter') { if (iz0 && letterRef.current) letterRef.current.scrollTop += iz0 * 900 * dt; return; }
      if (p.k !== 'walk' || g.controller.mode === 'docking') return;
      const w = content.worlds[p.world];
      // Walking out through the open doors: straight to the doorway, past the walkable bounds, then the scene swaps.
      if (exit.current) {
        const e = exit.current, o = walker.current, dx = e.x - o.x, dz = e.z - o.z, d = Math.hypot(dx, dz), go = Math.min(d, 300 * dt);
        if (d < 4) { e.then(); return; }
        walker.current = { x: o.x + dx / d * go, z: o.z + dz / d * go, vx: 0, vz: 0 };
        phase.current += dt * 11;
        if (!wasWalking.current) { wasWalking.current = true; courierRef.current?.toggleAttribute('data-walking', true); }
        if (courierRef.current) courierRef.current.style.transform = `translate3d(${walker.current.x}px,${-Math.abs(Math.sin(phase.current)) * 6}px,${walker.current.z}px)`;
        return;
      }
      if (busy.current) return;
      let ix = ix0, iz = iz0;
      if (ix || iz) target.current = null;
      else if (target.current) [ix, iz] = seek(walker.current, target.current.stop.x, target.current.stop.z);
      const n = step(walker.current, ix, iz, dt, w);
      walker.current = n;
      const near = nearest(w, n.x, n.z)?.id ?? null;
      if (near !== lastNear.current) {
        lastNear.current = near;
        dispatch({ a: 'arrive', stop: near });
      }
      if (target.current && near === target.current.stop.id) {
        const t = target.current; target.current = null;
        if (t.open) dispatch({ a: 'confirm' });
      }
      const speed = Math.hypot(n.vx, n.vz) / MAX_SPEED, calm = reducedMotion();
      if (Math.abs(n.vx) > 25 && Math.sign(n.vx) !== facing.current) {
        facing.current = Math.sign(n.vx);
        if (flipRef.current) gsap.to(flipRef.current, { rotationY: facing.current > 0 ? 0 : 180, duration: calm ? 0 : .16, ease: 'power2.out', overwrite: true });
      }
      phase.current += speed * dt * 16;
      const bob = calm ? 0 : Math.abs(Math.sin(phase.current)) * 9 * speed, lean = calm ? 0 : (n.vx / MAX_SPEED) * 5;
      const rx = calm ? 0 : -n.vz / MAX_SPEED * 1.4, ry = calm ? 0 : n.vx / MAX_SPEED * 2.2, rk = 1 - Math.exp(-6 * dt);
      if (Math.abs(rx - rig.current.x) + Math.abs(ry - rig.current.y) > .004) {
        rig.current.x += (rx - rig.current.x) * rk; rig.current.y += (ry - rig.current.y) * rk;
        if (rigRef.current) rigRef.current.style.transform = `rotateX(${rig.current.x.toFixed(3)}deg) rotateY(${rig.current.y.toFixed(3)}deg)`;
      }
      if (p.world === 'intro') {
        if (introRef.current) introRef.current.style.transform = `translate3d(${(n.x + 420) / 840 * 100}cqw,${-bob}px,0)`;
        return;
      }
      const c = cam.current, k = calm ? 1 : 1 - Math.exp(-4.5 * dt);
      // A stop with `focus` pulls the camera in on itself while the courier stands there.
      const spotted = p.near ? stopOf(content, p.world, p.stop) : undefined, zoomIn = spotted?.focus ?? 1;
      const frame = w.camera, want = spotted && zoomIn !== 1 ? (spotted.look ?? spotted.x) * .8 + n.x * .2 : n.x + n.vx * .22;
      c.x += ((frame && zoomIn === 1 ? Math.min(frame.x1, Math.max(frame.x0, want)) : want) - c.x) * k; c.z += ((frame ? n.z * .4 : n.z) - c.z) * k;
      c.focus += (zoomIn - c.focus) * (calm ? 1 : 1 - Math.exp(-3 * dt));
      const walking = speed > .08;
      if (walking !== wasWalking.current) { wasWalking.current = walking; courierRef.current?.toggleAttribute('data-walking', walking); }
      if (courierRef.current) courierRef.current.style.transform = `translate3d(${n.x}px,${-bob}px,${n.z}px) rotateZ(${lean}deg)`;
      const zs = (c.scale * (w.camera?.zoom ?? 1) * c.focus).toFixed(4);
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
      if (k === 'm') { dispatch({ a: 'map' }); return; }
      if (k === 'Escape' || k === 'Backspace') { dispatch({ a: 'back' }); e.preventDefault(); return; }
      if (k === 'Enter' || k === ' ') {
        if (document.activeElement instanceof HTMLButtonElement || document.activeElement instanceof HTMLAnchorElement) return;
        if (place.k === 'letter') return;
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
    // He comes up the aisle from the left and stops at the doors.
    walker.current = reducedMotion() ? { x: s.x, z: s.z, vx: 0, vz: 0 } : { x: s.x - 260, z: 50, vx: 0, vz: 0 };
    dispatch({ a: 'dockDone' });
    if (!reducedMotion()) target.current = { stop: s, open: false };
  }, [dispatch, teleport]);

  const openStop = useMemo(() => (spot.k === 'letter' ? stopOf(content, spot.world, spot.stop) : undefined), [spot]);
  const nearStop = spot.k === 'walk' && spot.near ? spot.stop : null;
  const lit = game.place.k === 'letter' ? 'B' : nearStop && spot.k === 'walk' && stopOf(content, spot.world, nearStop)?.action.kind !== 'road' ? 'A' : game.place.k === 'walk' ? 'stick' : null;

  return (
    <div className="app" data-reading={spot.k === 'letter' && game.place.k === 'letter' ? openStop?.action.kind === 'letter' ? 'yes' : undefined : undefined} data-testid="app" data-ctrl={game.controller.visible ? 'shown' : 'hidden'}>
      {world && <Scene key={world} world={content.worlds[world]} nearStop={arrival ? null : nearStop} toys={arrival > 1 ? { ...toysOf(game, world), doors: 1 } : toysOf(game, world)} line={lineOf(content, game, world)} arrival={arrival} onLine={step => dispatch({ a: 'line', step })} stageRef={stageRef} courierRef={courierRef} flipRef={flipRef} onStop={onStop} />}
      <Controller rigRef={rigRef} mode={mode} visible={game.controller.visible} lit={lit} atDock={spot.k === 'walk' && spot.world === 'intro' && spot.near} introRef={introRef} stick={stick} stickSpent={stickSpent} dispatch={dispatch} onDockDone={onDockDone} />
      <div className="corner">
        <button data-testid="open-route" onClick={e => { if (e.detail) e.currentTarget.blur(); dispatch({ a: 'map' }); }}>Route sheet</button>
        <button data-testid="toggle-controller" aria-pressed={!game.controller.visible} onClick={e => { if (e.detail) e.currentTarget.blur(); dispatch({ a: 'toggleController' }); }}>{game.controller.visible ? 'Hide controller' : 'Show controller'}</button>
      </div>
      {game.stamps.length > 0 && <div className="stamps" key={game.stamps.length} data-testid="stamps">{game.stamps.length} {game.stamps.length === 1 ? 'stamp' : 'stamps'}</div>}
      {spot.k === 'letter' && game.place.k === 'letter' && openStop?.action.kind === 'letter' && <LetterView ref={letterRef} toys={toysOf(game, spot.world)} world={spot.world} stop={spot.stop} letterId={openStop.action.letter} onClose={() => dispatch({ a: 'back' })} />}
      {game.place.k === 'routeSheet' && <RouteSheet onGo={p => { const k = p.k === 'walk' ? p : p; if (k.k !== 'lost') { const s = stopOf(content, k.world, k.stop); if (s) { if (k.world !== prevWorld.current) { teleport(k.world, s); } else { walker.current = { x: s.x, z: s.z, vx: 0, vz: 0 }; lastNear.current = s.id; } } } dispatch({ a: 'goto', place: p }); }} onClose={() => dispatch({ a: 'back' })} />}
      {game.place.k === 'lost' && <section className="sheet" data-testid="lost"><h1>Wrong stop</h1><p>No line runs to {game.place.path}.</p><button data-testid="lost-home" onClick={() => dispatch({ a: 'confirm' })}>Back on the train</button></section>}
    </div>
  );
}
