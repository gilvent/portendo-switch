import { useEffect, useMemo, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import type { Stop, World } from './schema.ts';
import { reducedMotion, shadowFilter } from './light.ts';
import Salaryman from './art/Salaryman.tsx';
import { WORLD_ART, WORLD_BACKDROP } from './art/blibli.tsx';
import { at } from './art/fold.tsx';
import { BED, BORE, CAB, CAR, DOOR, SIGN, TUNNEL } from './art/scenes/car.ts';

// The looping animations that are the train's motion (styles.css): they all follow its speed.
const RUNS = new Set(['bore-rush', 'wheel-spin', 'car-sway', 'car-jolt', 'strap-swing', 'beam-flicker']);
let seed = 11;
const rnd = (a: number, b: number) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };
type Card = { x: number; z: number; w: number; h: number; g: number };
function scenery(w: World): Card[] {
  seed = 11 + w.title.length * 37;
  return Array.from({ length: 34 }, (_, i) => {
    const row = i % 3, h = rnd(110, 300) - row * 30;
    return { x: rnd(w.bounds.x0 - 300, w.bounds.x1 + 300), z: w.bounds.z0 - 150 + row * 56 - 60, w: rnd(90, 240), h, g: Math.round(150 + row * 18 + rnd(-8, 8)) };
  });
}

// line: which destination the sign over the train doors shows. arrival: 0 while the train runs, 1 once it has stopped
// at the chosen stop, 2 once its doors are open.
type Props = { world: World; nearStop: string | null; toys: Record<string, number>; line: number; arrival: number; onLine: (step: 1 | -1) => void; stageRef: RefObject<HTMLDivElement>; courierRef: RefObject<HTMLDivElement>; flipRef: RefObject<HTMLDivElement>; onStop: (s: Stop) => void };

export default function Scene({ world, nearStop, toys, line, arrival, onLine, stageRef, courierRef, flipRef, onStop }: Props) {
  const drawn = world.art !== 'blockout';
  const Art = drawn ? WORLD_ART[world.art] : null;
  if (drawn && !Art) throw new Error(`no art for ${world.art}`);
  const cards = useMemo(() => (drawn ? [] : scenery(world)), [world, drawn]);
  const doors = world.stops.find(s => s.action.kind === 'ride'), ride = doors?.action.kind === 'ride' ? doors.action : null, dest = ride?.to[line % ride.to.length];
  const train = world.art === 'train', root = useRef<HTMLDivElement>(null);
  // The train's speed: every looping motion in the scene (tunnel, sleepers, wheels, sway, straps) plays at one rate.
  // It pulls away as the scene opens, and brakes to a stand when it reaches the chosen stop.
  const speed = useRef({ v: 0 });
  useEffect(() => {
    if (!train || !root.current || reducedMotion()) return;
    const el = root.current, apply = () => { for (const a of el.getAnimations({ subtree: true })) if (a instanceof CSSAnimation && RUNS.has(a.animationName)) a.playbackRate = Math.max(.001, speed.current.v); el.style.setProperty('--speed', speed.current.v.toFixed(3)); };
    const t = gsap.to(speed.current, arrival ? { v: 0, duration: .55, ease: 'power2.out', onUpdate: apply } : { v: 1, duration: 2.2, ease: 'power1.inOut', onUpdate: apply });
    apply();
    return () => { t.kill(); };
  }, [train, arrival > 0]);
  const b = world.bounds, wipe = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !wipe.current) return;
    const t = gsap.fromTo(wipe.current.children, { scaleX: 1 }, { scaleX: 0, duration: .55, ease: 'power3.inOut', stagger: .04 });
    return () => { t.kill(); };
  }, []);
  return (
    <div ref={root} className={`tv art-${world.art}`} data-testid={`world-${world.id}`} data-arrival={arrival || undefined} style={WORLD_BACKDROP[world.art] ? { backgroundImage: `url(${WORLD_BACKDROP[world.art]})` } : undefined}>
      <svg width="0" height="0" className="defs" aria-hidden="true"><defs>
        {(['sm', 'md'] as const).map(n => <filter key={n} id={`paper-${n}`} x="-20%" y="-20%" width="150%" height="150%"><feDropShadow {...shadowFilter(n)} /></filter>)}
      </defs></svg>
      <div className="stage" ref={stageRef}><div className="car">
        {/* Underground. Behind the whole train stands the tunnel's far wall, its ribs, cable runs and work lamps rushing
            back past the windows; under it lies the track bed, its sleepers streaking by between the rails. The
            headlight throws its beam down the tunnel ahead, and the lamps' light sweeps across the car floor. When
            the train stops, the platform's light comes up behind the windows. */}
        {train && <>
          <div className="bore" aria-hidden="true" style={{ width: BORE.w, height: BORE.top + BED, transform: `translate3d(${BORE.x}px,${-BORE.top}px,${BORE.z}px)` }}><i className="rush bore-ribs" /><i className="bore-cables" /><i className="rush bore-lamps" /><i className="rush bore-signs" /></div>
          <div className="bed" aria-hidden="true" style={{ width: BORE.w, height: BORE.near - BORE.z, transform: `translate3d(${BORE.x}px,${BED}px,${BORE.z}px) rotateX(90deg)` }}><i className="rush bed-sleepers" /><i className="bed-rails" /></div>
          <div className="platform-light" aria-hidden="true" style={{ width: TUNNEL.w, height: TUNNEL.h, transform: `translate3d(${TUNNEL.x}px,${-(TUNNEL.y + TUNNEL.h)}px,${TUNNEL.z}px)` }} />
          <div className="floor-light" aria-hidden="true" style={{ width: CAR.W, height: CAR.D - 60, transform: `translate3d(${-CAR.W / 2}px,-1px,${-CAR.D / 2 + 60}px) rotateX(90deg)` }}><i className="rush" /></div>
          <div className="beam" aria-hidden="true" style={{ width: 1100, height: 340, transform: `translate3d(${CAB.x + CAB.w - 6}px,${-(CAB.light + 170)}px,${CAR.D / 2 - 20}px)` }} />
        </>}
        {!drawn && <div className="floor" style={{ width: b.x1 - b.x0 + 2400, height: 3000, left: b.x0 - 1200, top: -1500, transform: `translateZ(${b.z0 + 1300}px) rotateX(90deg)` }} />}
        {cards.map((c, i) => <div key={i} className="prop" style={at(c.x, c.z)}><div className="card" style={{ width: c.w, height: c.h, marginLeft: -c.w / 2, background: `rgb(${c.g},${c.g + 3},${c.g + 8})` }} /></div>)}
        {Art && <Art near={nearStop} toys={toys} />}
        {!drawn && world.solid.map((r, i) => <div key={i} className="prop" style={at((r.x0 + r.x1) / 2, r.z0)}><div className="card" style={{ width: r.x1 - r.x0, height: 150, marginLeft: -(r.x1 - r.x0) / 2, background: '#7f8792' }} /></div>)}
        {world.stops.map(s => (
          <div key={s.id} className="prop" style={at(s.x, s.z)}>
            {!drawn && <i className="ground-shadow" />}
            <button className={`sign${drawn ? ' hit' : ''}${s.action.kind === 'road' ? ' road' : ''}${nearStop === s.id ? ' near' : ''}`} data-testid={`stop-${world.id}-${s.id}`} onClick={() => onStop(s)}>
              <span>{s.action.kind === 'ride' ? <>Get off at {dest?.label} <em>B</em> change stop</> : s.label}</span>
              {nearStop === s.id && s.action.kind !== 'road' && <b className="prompt" data-testid="prompt-a">A</b>}
            </button>
          </div>
        ))}
        {/* The destination sign over the train doors. Its arrows turn it to the other stop; pressing the name walks the
            salaryman to the doors and gets off there. */}
        {doors && ride && dest && <div className="dest" data-testid="dest-sign" style={{ width: SIGN.w, height: SIGN.h, transform: `translate3d(${DOOR.x - SIGN.w / 2}px,${-(SIGN.y + SIGN.h)}px,${SIGN.z}px)` }}>
          <button className="dest-turn" data-testid="dest-prev" aria-label="Previous destination" onClick={e => { if (e.detail) e.currentTarget.blur(); onLine(-1); }}>‹</button>
          <button className="dest-go" data-testid="dest-go" data-line={line} aria-label={`Next stop: ${dest.label}. Get off here`} onClick={e => { if (e.detail) e.currentTarget.blur(); onStop(doors); }}><small>Next stop</small><b key={dest.label}>{dest.label}</b></button>
          <button className="dest-turn" data-testid="dest-next" aria-label="Next destination" onClick={e => { if (e.detail) e.currentTarget.blur(); onLine(1); }}>›</button>
        </div>}
        <div className="courier" ref={courierRef} data-testid="courier">
          <i className="ground-shadow small" />
          <div className="flip" ref={flipRef}><Salaryman /></div>
        </div>
      </div></div>
      <div className="wipe" ref={wipe} aria-hidden="true"><i /><i /></div>
    </div>
  );
}
