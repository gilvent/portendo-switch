import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ForwardedRef } from 'react';
import gsap from 'gsap';
import { reducedMotion } from './light.ts';
import { content } from './content.ts';
import type { Block, Rich, WorldId } from './schema.ts';

const img = (a: string) => `/img/${a}`;
const R = ({ text }: { text: Rich }) => <>{text.map((s, i) => { const n = s.em ? <i>{s.t}</i> : s.t; return s.strong ? <strong key={i}>{n}</strong> : <span key={i}>{n}</span>; })}</>;

const REVIEWS = [{ stars: 5, photo: 'tall' }, { stars: 4, photo: null }, { stars: 5, photo: 'wide' }, { stars: 3, photo: 'square' }];
function ReviewDesk() {
  const [filter, setFilter] = useState<'all' | 'photo' | 'five'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [turns, setTurns] = useState(1);
  const upright = turns % 4 === 0;
  useEffect(() => {
    const turn = () => setTurns(t => (t % 4 === 0 ? t : t + 1));
    addEventListener('letter-confirm', turn);
    return () => removeEventListener('letter-confirm', turn);
  }, []);
  const shown = REVIEWS.filter(r => filter === 'all' || (filter === 'photo' ? r.photo : r.stars === 5));
  return (
    <div className="desk" data-testid="review-desk">
      <div className="desk-tools">
        {(['all', 'photo', 'five'] as const).map(f => <button key={f} aria-pressed={filter === f} data-testid={`filter-${f}`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'photo' ? 'With photo' : '★★★★★'}</button>)}
        <button data-testid="view-toggle" onClick={() => setView(v => (v === 'grid' ? 'list' : 'grid'))}>{view === 'grid' ? 'List view' : 'Grid view'}</button>
      </div>
      <div className={`desk-reviews ${view}`} data-testid="review-list">
        {shown.map((r, i) => (
          <div className="review" key={i} data-testid="review-card">
            <span aria-label={`${r.stars} stars`}>{'★'.repeat(r.stars)}<em>{'★'.repeat(5 - r.stars)}</em></span>
            {r.photo && <i className={`shot ${r.photo}`} />}
          </div>
        ))}
      </div>
      <button className="rotated" data-testid="toy-rotate" data-upright={upright} aria-label={upright ? 'Photo is upright' : 'Rotate the uploaded photo'} onClick={() => setTurns(t => (t % 4 === 0 ? t : t + 1))}>
        <i style={{ transform: `rotate(${turns * 90}deg)` }}><b /></i>
      </button>
    </div>
  );
}
function Pages({ pages }: { pages: Extract<Block, { kind: 'pages' }>['pages'] }) {
  const [at, setAt] = useState(0);
  useEffect(() => {
    const next = () => setAt(p => (p + 1) % pages.length);
    addEventListener('letter-confirm', next);
    return () => removeEventListener('letter-confirm', next);
  }, [pages.length]);
  return (
    <>
      <div className="tabs" role="tablist">{pages.map((p, i) => <button key={p.tab} role="tab" aria-selected={i === at} data-testid={`page-${p.tab.toLowerCase()}`} onClick={() => setAt(i)}>{p.tab}</button>)}</div>
      <div className="page" data-testid="catalog-page" key={at}>{pages[at].blocks.map((b, i) => <B key={i} b={b} />)}</div>
    </>
  );
}
function B({ b }: { b: Block }) {
  switch (b.kind) {
    case 'heading': return <h3>{b.text}</h3>;
    case 'paragraph': return <p><R text={b.text} /></p>;
    case 'list': return <div>{b.title && <strong>{b.title}</strong>}<ul>{b.items.map((t, i) => <li key={i}><R text={t} /></li>)}</ul></div>;
    case 'pages': return <Pages pages={b.pages} />;
    case 'reviewDesk': return <ReviewDesk />;
    case 'tech': return <ul className="tech">{b.items.map(t => <li key={t.name}><img src={img(t.logo)} alt="" width="28" height="28" />{t.name}</li>)}</ul>;
    case 'links': return <ul className="links">{b.items.map(l => <li key={l.href}><a href={l.href} target="_blank" rel="noopener"><img src={img(l.icon)} alt="" width="28" height="28" />{l.label}</a></li>)}</ul>;
  }
}
type P = { world: WorldId; stop: string; letterId: string; onClose: () => void };
const PULL = { note: { y: 220, rotation: -3 }, label: { y: 160, rotation: 3 }, catalog: { scale: .7, y: 60 }, monitor: { scale: .8 } } as const;
export default forwardRef(function LetterView({ world, stop, letterId, onClose }: P, ref: ForwardedRef<HTMLElement>) {
  const w = content.worlds[world], l = w.letters.find(x => x.id === letterId);
  if (!l) throw new Error(`no letter ${letterId} in ${world}`);
  const inner = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (reducedMotion() || !inner.current) return;
    const t = gsap.from(inner.current, { ...PULL[l.surface], opacity: 0, duration: .36, ease: 'back.out(1.3)', clearProps: 'transform,opacity' });
    return () => { t.kill(); };
  }, []);
  useEffect(() => { inner.current?.focus(); return () => { document.querySelector<HTMLElement>(`[data-testid="stop-${world}-${stop}"]`)?.focus({ preventScroll: true }); }; }, [world, stop]);
  return (
    <article className={`letter surface-${l.surface}`} tabIndex={-1} data-testid={`letter-${world}-${stop}`} ref={el => { inner.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}>
      <h2>{l.title}</h2>
      {l.blocks.map((b, i) => <B key={i} b={b} />)}
      <button data-testid="letter-close" onClick={onClose}>Put it down</button>
    </article>
  );
});
