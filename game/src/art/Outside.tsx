import { useEffect, useRef, type CSSProperties } from 'react';
import { reducedMotion } from '../light.ts';
import manifest from './baked/outside/manifest.json';

type Strip = { id: string; w: number; h: number; y: number; z: number; speed: number; flat: boolean; tile: boolean };
const STRIPS = manifest as Strip[];
const urls = import.meta.glob('./baked/outside/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
const url = (id: string) => urls[`./baked/outside/${id}.webp`];

// World units per second at the viaduct, and how long the train takes to brake to a stand or pull away.
export const CRUISE = 1150, BRAKE_S = 2.8, DEPART_S = 3.2;
// Where each station name board hangs on the platform wall, x from the station's centre.
const BOARDS = [-1180, -530, 120, 770];

// How wide a strip must be at its depth to fill the view behind the car, in world units.
const span = (s: Strip) => s.flat || s.z > -400 ? 6400 : s.z > -1000 ? 7600 : 10400;

function place(s: Strip, x = 0): CSSProperties {
  const w = s.tile ? span(s) : s.w;
  return { width: w, height: s.h, transform: s.flat ? `translate3d(${x - w / 2}px,${-s.y}px,${s.z}px) rotateX(90deg)` : `translate3d(${x - w / 2}px,${-(s.y + s.h)}px,${s.z}px)` };
}

// ride: 0 while cruising, k + 1 while braking into station k. dwell: k + 1 while standing at station k; when it
// drops back to 0 the train pulls away. The station sits at `anchor` along the line; it is drawn at anchor - s.
type Run = { s: number; v: number; phase: 'cruise' | 'brake' | 'stand' | 'depart'; t: number; s0: number; v0: number; anchor: number | null };
export default function Outside({ ride, dwell }: { ride: number; dwell: number }) {
  const tiles = useRef<(HTMLElement | null)[]>([]), stationRef = useRef<HTMLDivElement>(null);
  const run = useRef<Run>({ s: 0, v: dwell ? 0 : CRUISE, phase: dwell ? 'stand' : 'cruise', t: 0, s0: 0, v0: 0, anchor: dwell ? 0 : null });
  useEffect(() => {
    const r = run.current, calm = reducedMotion();
    if (ride && r.phase !== 'brake' && r.phase !== 'stand') {
      Object.assign(r, { phase: calm ? 'stand' : 'brake', t: 0, s0: r.s, v0: r.v, anchor: r.s + r.v * BRAKE_S / 2 });
      if (calm) { r.s = r.anchor!; r.v = 0; }
    }
    if (!ride && !dwell && r.phase === 'stand') Object.assign(r, { phase: calm ? 'cruise' : 'depart', t: 0, v: calm ? 0 : r.v, anchor: calm ? null : r.anchor });
  }, [ride, dwell]);
  useEffect(() => {
    let raf = 0, last = performance.now();
    const calm = reducedMotion();
    const frame = (now: number) => {
      const r = run.current, dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!calm) {
        r.t += dt;
        if (r.phase === 'brake') { const k = Math.min(1, r.t / BRAKE_S); r.v = r.v0 * (1 - k); r.s = r.s0 + r.v0 * BRAKE_S * (k - k * k / 2); if (k >= 1) r.phase = 'stand'; }
        else if (r.phase === 'depart') { const k = Math.min(1, r.t / DEPART_S); r.v = CRUISE * k; r.s += r.v * dt; if (k >= 1) r.phase = 'cruise'; }
        else if (r.phase === 'cruise') r.s += r.v * dt;
      }
      STRIPS.forEach((s, i) => { const el = tiles.current[i]; if (el) el.style.transform = `translate3d(${-((r.s * s.speed) % s.w).toFixed(1)}px,0,0)`; });
      if (r.anchor !== null && r.anchor - r.s < -9000) r.anchor = null;
      if (stationRef.current) stationRef.current.style.transform = `translate3d(${r.anchor === null ? 99999 : (r.anchor - r.s).toFixed(1)}px,0,0)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  const board = Math.max(ride, dwell) - 1;
  return (
    <div className="outside" aria-hidden="true">
      {STRIPS.map((s, i) => s.tile && (
        <div key={s.id} className={`strip strip-${s.id}`} style={place(s)}>
          <i ref={e => { tiles.current[i] = e; }} style={{ width: span(s) + s.w, backgroundImage: `url(${url(s.id)})`, backgroundSize: `${s.w}px ${s.h}px` }} />
        </div>
      ))}
      <div className="station" ref={stationRef}>
        {STRIPS.filter(s => !s.tile && !s.id.startsWith('board-')).map(s => <div key={s.id} className="strip" style={{ ...place(s), backgroundImage: `url(${url(s.id)})`, backgroundSize: `${s.w}px ${s.h}px` }} />)}
        {board >= 0 && BOARDS.map((x, i) => { const s = STRIPS.find(q => q.id === `board-${board}`)!; return <div key={i} className="strip" style={{ ...place({ ...s, y: 128, z: -296 }, x), backgroundImage: `url(${url(s.id)})`, backgroundSize: `${s.w}px ${s.h}px` }} />; })}
      </div>
    </div>
  );
}
