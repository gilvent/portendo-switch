import { useEffect, useMemo, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import type { Stop, World } from './schema.ts';
import { reducedMotion, shadowFilter } from './light.ts';
import Courier from './art/Courier.tsx';
import { WORLD_ART, WORLD_BACKDROP } from './art/blibli.tsx';
import { at } from './art/fold.tsx';

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

type Props = { world: World; nearStop: string | null; stageRef: RefObject<HTMLDivElement>; courierRef: RefObject<HTMLDivElement>; flipRef: RefObject<HTMLDivElement>; onStop: (s: Stop) => void };

export default function Scene({ world, nearStop, stageRef, courierRef, flipRef, onStop }: Props) {
  const drawn = world.art !== 'blockout';
  const Art = drawn ? WORLD_ART[world.art] : null;
  if (drawn && !Art) throw new Error(`no art for ${world.art}`);
  const cards = useMemo(() => (drawn ? [] : scenery(world)), [world, drawn]);
  const b = world.bounds, wipe = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !wipe.current) return;
    const t = gsap.fromTo(wipe.current.children, { scaleX: 1 }, { scaleX: 0, duration: .55, ease: 'power3.inOut', stagger: .04 });
    return () => { t.kill(); };
  }, []);
  return (
    <div className={`tv art-${world.art}`} data-testid={`world-${world.id}`} style={WORLD_BACKDROP[world.art] ? { backgroundImage: `url(${WORLD_BACKDROP[world.art]})` } : undefined}>
      <svg width="0" height="0" className="defs" aria-hidden="true"><defs>
        {(['sm', 'md'] as const).map(n => <filter key={n} id={`paper-${n}`} x="-20%" y="-20%" width="150%" height="150%"><feDropShadow {...shadowFilter(n)} /></filter>)}
      </defs></svg>
      <div className="stage" ref={stageRef}>
        {!drawn && <div className="floor" style={{ width: b.x1 - b.x0 + 2400, height: 3000, left: b.x0 - 1200, top: -1500, transform: `translateZ(${b.z0 + 1300}px) rotateX(90deg)` }} />}
        {cards.map((c, i) => <div key={i} className="prop" style={at(c.x, c.z)}><div className="card" style={{ width: c.w, height: c.h, marginLeft: -c.w / 2, background: `rgb(${c.g},${c.g + 3},${c.g + 8})` }} /></div>)}
        {Art && <Art near={nearStop} />}
        {!drawn && world.solid.map((r, i) => <div key={i} className="prop" style={at((r.x0 + r.x1) / 2, r.z0)}><div className="card" style={{ width: r.x1 - r.x0, height: 150, marginLeft: -(r.x1 - r.x0) / 2, background: '#7f8792' }} /></div>)}
        {world.stops.map(s => (
          <div key={s.id} className="prop" style={at(s.x, s.z)}>
            {!drawn && <i className="ground-shadow" />}
            <button className={`sign${drawn ? ' hit' : ''}${s.action.kind === 'road' ? ' road' : ''}${nearStop === s.id ? ' near' : ''}`} data-testid={`stop-${world.id}-${s.id}`} onClick={() => onStop(s)}>
              <span>{s.label}</span>
              {nearStop === s.id && s.action.kind !== 'road' && <b className="prompt" data-testid="prompt-a">A</b>}
            </button>
          </div>
        ))}
        <div className="courier" ref={courierRef} data-testid="courier">
          <i className="ground-shadow small" />
          <div className="flip" ref={flipRef}><Courier /></div>
        </div>
      </div>
      <div className="wipe" ref={wipe} aria-hidden="true"><i /><i /></div>
    </div>
  );
}
