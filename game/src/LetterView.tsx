import { forwardRef, useEffect, useLayoutEffect, useRef, type ForwardedRef } from 'react';
import gsap from 'gsap';
import { reducedMotion } from './light.ts';
import { content } from './content.ts';
import type { Block, Rich, WorldId } from './schema.ts';

const img = (a: string) => `/img/${a}`;
const R = ({ text }: { text: Rich }) => <>{text.map((s, i) => { const n = s.em ? <i>{s.t}</i> : s.t; return s.strong ? <strong key={i}>{n}</strong> : <span key={i}>{n}</span>; })}</>;

function B({ b }: { b: Block }) {
  switch (b.kind) {
    case 'heading': return <h3>{b.text}</h3>;
    case 'paragraph': return <p><R text={b.text} /></p>;
    case 'list': return <div>{b.title && <strong>{b.title}</strong>}<ul>{b.items.map((t, i) => <li key={i}><R text={t} /></li>)}</ul></div>;
    case 'tech': return <ul className="tech">{b.items.map(t => <li key={t.name}><img src={img(t.logo)} alt="" width="28" height="28" />{t.name}</li>)}</ul>;
    case 'links': return <ul className="links">{b.items.map(l => <li key={l.href}><a href={l.href} target="_blank" rel="noopener"><img src={img(l.icon)} alt="" width="28" height="28" />{l.label}</a></li>)}</ul>;
  }
}
type P = { world: WorldId; stop: string; letterId: string; onClose: () => void };
const PULL = { note: { y: 220, rotation: -3 }, label: { y: 160, rotation: 3 } } as const;
export default forwardRef(function LetterView({ world, stop, letterId, onClose }: P, ref: ForwardedRef<HTMLElement>) {
  const w = content.worlds[world], l = w.letters.find(x => x.id === letterId);
  if (!l) throw new Error(`no letter ${letterId} in ${world}`);
  const inner = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (reducedMotion() || !inner.current) return;
    const t = gsap.from(inner.current, { ...PULL[l.surface], opacity: 0, duration: .36, ease: 'back.out(1.3)', clearProps: 'transform,opacity' });
    return () => { t.kill(); };
  }, []);
  // Putting the letter down leaves nothing focused: A (Enter) then belongs to the game again, not to whichever stop was tapped.
  useEffect(() => { inner.current?.focus(); return () => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }; }, [world, stop]);
  return (
    <article className={`letter surface-${l.surface}`} tabIndex={-1} data-testid={`letter-${world}-${stop}`} ref={el => { inner.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}>
      <h2>{l.title}</h2>
      {l.blocks.map((b, i) => <B key={i} b={b} />)}
      <button data-testid="letter-close" onClick={onClose}>Put it down</button>
    </article>
  );
});
