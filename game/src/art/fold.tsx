import { memo, useEffect, type CSSProperties } from 'react';
import type { Motion, Run, Show, V3 } from './kit.ts';
import { ambientOf, hash, type Ambient, type Loop } from './ambient.ts';

export const at = (x: number, z: number, y = 0, rot = 0) => ({ transform: `translate3d(${x}px,${-y}px,${z}px)${rot ? ` rotateY(${rot}deg)` : ''}` });

export type Quad = { id: string; o: number[]; u: number[]; v: number[]; w: number; h: number; x: number; y: number; pw: number; ph: number; c: string; solid: boolean; motion: Motion | null; group: string | null; show?: Show | null };
export type Toys = Record<string, number>;
const shown = (q: Quad, toys: Toys) => !q.show || q.show.at.includes(toys[q.show.toy] ?? 0);
const playing = (m: Motion, near: string | null, toys: Toys) => (m.when !== undefined && near === m.when) || (m.toy !== undefined && (m.at ?? [1]).includes(toys[m.toy] ?? 0));
export type Manifest = { atlas: { w: number; h: number }; runs: Run[]; quads: Quad[] };

const css = ([x, y, z]: readonly number[]): V3 => [x, -y, z];
const len = (a: readonly number[]) => Math.hypot(a[0], a[1], a[2]);
const scale = (a: readonly number[], k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function matrix({ o, u, v, h }: Quad, origin: number[] = [0, 0, 0]) {
  const ux = css(scale(u, 1 / len(u))), vy = css(scale(v, -1 / len(v))), n = cross(ux, vy);
  const t = css([o[0] + v[0] / len(v) * h - origin[0], o[1] + v[1] / len(v) * h - origin[1], o[2] + v[2] / len(v) * h - origin[2]]);
  return `matrix3d(${[...ux, 0, ...vy, 0, ...n, 0, ...t, 1].map(q => +q.toFixed(4)).join(',')})`;
}
function moved(q: Quad, m: Motion) {
  const k = q.pw / q.w, slide = m.slide ? `translate3d(${(m.slide[0]) * k}px,${(-m.slide[1]) * k}px,${(m.slide[2]) * k}px)` : '';
  if (!m.edge || !m.deg) return slide;
  const px = m.edge === 'right' ? q.pw : 0, py = m.edge === 'bottom' ? q.ph : 0, axis = m.edge === 'top' || m.edge === 'bottom' ? 'rotateX' : 'rotateY';
  return `${slide} translate(${px}px,${py}px) ${axis}(${m.deg}deg) translate(${-px}px,${-py}px)`;
}
const spun = (q: Quad, deg: number) => `translate(${q.pw / 2}px,${q.ph / 2}px) rotate(${deg}deg) translate(${-q.pw / 2}px,${-q.ph / 2}px)`;
const swung = (q: Quad, deg: number) => `translate(${q.pw / 2}px,0) rotate(${deg}deg) translate(${-q.pw / 2}px,0)`;
function quadStyle(q: Quad, url: string, atlas: Manifest['atlas'], origin?: number[]): CSSProperties {
  const k = (q.w / q.pw).toFixed(5), rest = `${matrix(q, origin)} scale(${k})`;
  return {
    width: q.pw, height: q.ph, backgroundImage: `url(${url})`, backgroundPosition: `${-q.x}px ${-q.y}px`, backgroundSize: `${atlas.w}px ${atlas.h}px`, backgroundColor: q.solid ? q.c : undefined,
    ...(q.motion?.spin ? { transform: rest, '--a': `${rest} ${spun(q, 0)}`, '--b': `${rest} ${spun(q, -360)}`, animationDuration: `${q.motion.spin}s` } as CSSProperties : q.motion?.swing ? { transform: rest, '--a': `${rest} ${swung(q, -q.motion.swing)}`, '--b': `${rest} ${swung(q, q.motion.swing)}` } as CSSProperties : q.motion ? { '--rest': rest, '--on': `${rest} ${moved(q, q.motion)}` } as CSSProperties : { transform: rest })
  };
}

// An ambient loop (ambient.ts): the two poses the sheet rocks between, and its own period and start offset.
function looped(q: Quad, l: Loop, rest: string): CSSProperties {
  const about = (x: number, y: number, t: string) => `translate(${x}px,${y}px) ${t} translate(${-x}px,${-y}px)`, py = l.pivot === 'top' ? 0 : q.ph, k = q.pw / q.w;
  const [a, b] = l.kind === 'sway' ? [about(q.pw / 2, py, `rotate(${-l.amp}deg)`), about(q.pw / 2, py, `rotate(${l.amp}deg)`)]
    : l.kind === 'skew' ? [`skewX(${-l.amp}deg)`, `skewX(${l.amp}deg)`]
    : l.kind === 'rustle' ? [spun(q, -l.amp), spun(q, l.amp)]
    : l.kind === 'breathe' ? ['', about(q.pw / 2, q.ph, `scale(${1 - l.amp * .5},${1 + l.amp})`)]
    : l.kind === 'bob' ? [`translate(0,${-l.amp * k}px)`, `translate(0,${l.amp * k}px)`]
    : ['', about(q.pw / 2, q.ph, `rotate(${l.amp}deg)`)];
  // Sheets of one object (the river's two halves) must move as one, so they share the object's name, not their own id.
  const key = l.kind === 'bob' ? 'bob' : q.id, secs = l.secs * (.82 + hash(key) * .4);
  return { '--a': `${rest} ${a}`, '--b': `${rest} ${b}`, '--t': `${secs.toFixed(2)}s`, '--d': `${(-hash(key, 7) * secs * 2).toFixed(2)}s` } as CSSProperties;
}
const loopOf = (q: Quad, amb: Ambient) => amb.loops.find(([m]) => m.test(q.id))?.[1];
const groupOf = (q: Quad, amb: Ambient) => amb.touch.find(t => t.match.test(q.id))?.name;

const StaticQuads = memo(function StaticQuads({ m, url, amb }: { m: Manifest; url: string; amb: Ambient }) {
  return <>{m.quads.filter(q => !q.motion && !q.group && !q.show).map(q => {
    const l = loopOf(q, amb), base = quadStyle(q, url, m.atlas);
    return <i key={q.id} className={l ? `pp amb${l.kind === 'peck' ? ' amb-peck' : ''}` : 'pp'} data-g={groupOf(q, amb)} style={l ? { ...base, ...looped(q, l, base.transform as string) } : base} />;
  })}</>;
});
const Runs = memo(function Runs({ m, url }: { m: Manifest; url: string }) {
  return <>{m.runs.flatMap(r => {
    const parts = m.quads.filter(q => q.group === r.group);
    return Array.from({ length: r.count }, (_, i) => (
      <div key={`${r.group}-${i}`} className="belt" style={{ '--from': `${r.from[0]}px,${-r.from[1]}px,${r.from[2]}px`, '--to': `${r.to[0]}px,${-r.to[1]}px,${r.to[2]}px`, animationDuration: `${r.seconds}s`, animationDelay: `${-i * r.seconds / r.count}s` } as CSSProperties}>
        {parts.map(q => <i key={q.id} className="pp" style={quadStyle(q, url, m.atlas, [...r.from])} />)}
      </div>
    ));
  })}</>;
});

export function PaperScene({ manifest, url, near, toys, art }: { manifest: Manifest; url: string; near: string | null; toys: Toys; art: string }) {
  const amb = ambientOf(art);
  useEffect(() => { const i = new Image(); i.src = url; }, [url]);
  return (
    <div className="prop" data-testid="paper-scene">
      <StaticQuads m={manifest} url={url} amb={amb} />
      {manifest.quads.filter(q => !q.motion && !q.group && q.show && shown(q, toys)).map(q => <i key={q.id} className="pp pop" data-g={groupOf(q, amb)} style={quadStyle(q, url, manifest.atlas)} data-testid={`show-${q.id}`} />)}
      {manifest.quads.filter(q => q.motion?.swing).map((q, i) => <i key={q.id} className="pp swings" style={{ ...quadStyle(q, url, manifest.atlas), animationDelay: `${-(i * 0.37 % 1.4).toFixed(2)}s` }} />)}
      {manifest.quads.filter(q => q.motion?.spin).map(q => <i key={q.id} className="pp spins" style={quadStyle(q, url, manifest.atlas)} />)}
      {manifest.quads.filter(q => q.motion && !q.motion.swing && !q.motion.spin && shown(q, toys)).map(q => <i key={q.id} className={`pp moves${playing(q.motion!, near, toys) ? ' on' : ''}`} data-g={groupOf(q, amb)} style={quadStyle(q, url, manifest.atlas)} data-testid={`move-${q.id}`} />)}
      <Runs m={manifest} url={url} />
    </div>
  );
}
