import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ForwardedRef } from 'react';
import gsap from 'gsap';
import { reducedMotion } from './light.ts';
import { content } from './content.ts';
import type { Block, Rich, WorldId } from './schema.ts';

const img = (a: string) => `/img/${a}`;
const R = ({ text }: { text: Rich }) => <>{text.map((s, i) => { const n = s.em ? <i>{s.t}</i> : s.t; return s.strong ? <strong key={i}>{n}</strong> : <span key={i}>{n}</span>; })}</>;

export const VARIANTS = [{ name: 'Blue', c: '#0092da' }, { name: 'Coral', c: '#e8552d' }, { name: 'Mint', c: '#35b58a' }] as const;
const LEAVES = ['Specs', 'Promo', 'Shipping', 'Discussion', 'Description'] as const;
const Phone = ({ c }: { c: string }) => (
  <svg viewBox="0 0 60 110" width="60" height="110" aria-hidden="true"><rect x="2" y="2" width="56" height="106" rx="9" fill={c} /><rect x="7" y="10" width="46" height="86" rx="2" fill="#1d2228" /><rect x="10" y="14" width="40" height="78" fill="#bfe6f8" /><circle cx="30" cy="102" r="2.6" fill="#fff4e2" /></svg>
);
const Bars = ({ n, w = [90, 72, 84, 60] }: { n: number; w?: number[] }) => <span className="bars" aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i} style={{ width: `${w[i % w.length]}%` }} />)}</span>;
// The catalog paper beside the showcased phone: one leaf per secondary page, drawn rather than written.
function SpecSheet({ toys }: { toys: Record<string, number> }) {
  const [at, setAt] = useState(0);
  const v = VARIANTS[toys.variant ?? 0], promo = (toys.promo ?? 0) === 1;
  useEffect(() => {
    const next = () => setAt(p => (p + 1) % LEAVES.length);
    addEventListener('letter-confirm', next);
    return () => removeEventListener('letter-confirm', next);
  }, []);
  return (
    <div className="leaflet" data-testid="spec-sheet" data-variant={v.name}>
      <div className="tabs" role="tablist">{LEAVES.map((t, i) => <button key={t} role="tab" aria-selected={i === at} data-testid={`leaf-${t.toLowerCase()}`} onClick={() => setAt(i)}>{t}</button>)}</div>
      <div className="leaf" key={at} data-testid="leaf">
        {LEAVES[at] === 'Specs' && <div className="leaf-specs">
          <Phone c={v.c} />
          <dl>
            <dt>Colour</dt><dd><i className="dot" style={{ background: v.c }} />{v.name}</dd>
            <dt>Screen</dt><dd>6.5 in</dd>
            <dt>Storage</dt><dd>128 GB</dd>
            <dt>Camera</dt><dd>50 MP</dd>
            <dt>Battery</dt><dd>5000 mAh</dd>
          </dl>
          <div className="swatches">{VARIANTS.map(x => <i key={x.name} className={x === v ? 'on' : ''} style={{ background: x.c }} />)}</div>
        </div>}
        {LEAVES[at] === 'Promo' && <div className="leaf-promo">
          <div className={`price${promo ? ' cut' : ''}`}><s>Rp 3.299.000</s>{promo && <b>Rp 2.999.000</b>}</div>
          <div className="coupon" data-torn={promo}><span>%</span><Bars n={2} /></div>
          <div className="coupon"><span>✦</span><Bars n={2} w={[70, 50]} /></div>
        </div>}
        {LEAVES[at] === 'Shipping' && <div className="leaf-ship"><svg viewBox="0 0 64 36" width="64" height="36" aria-hidden="true"><rect x="2" y="6" width="36" height="20" fill="#0092da" /><path d="M38 12H52L60 20V26H38Z" fill="#0a6aa8" /><circle cx="14" cy="28" r="5" fill="#23272d" /><circle cx="50" cy="28" r="5" fill="#23272d" /></svg><i className="route" /><svg viewBox="0 0 36 32" width="36" height="32" aria-hidden="true"><path d="M2 8L18 2L34 8V26L18 31L2 26Z" fill="#b98450" /><path d="M2 8L18 14L34 8M18 14V31" fill="none" stroke="#7a5237" strokeWidth="1.5" /></svg><Bars n={3} /></div>}
        {LEAVES[at] === 'Discussion' && <div className="leaf-talk">{[0, 1, 2].map(i => <div key={i} className={`bubble${i % 2 ? ' me' : ''}`}><Bars n={i === 1 ? 1 : 2} /></div>)}</div>}
        {LEAVES[at] === 'Description' && <div className="leaf-desc"><Phone c={v.c} /><Bars n={7} /></div>}
      </div>
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
      <div className="page" data-testid="catalog-page" key={at}>{pages[at].blocks.map((b, i) => <B key={i} b={b} toys={{}} />)}</div>
    </>
  );
}
function B({ b, toys }: { b: Block; toys: Record<string, number> }) {
  switch (b.kind) {
    case 'heading': return <h3>{b.text}</h3>;
    case 'paragraph': return <p><R text={b.text} /></p>;
    case 'list': return <div>{b.title && <strong>{b.title}</strong>}<ul>{b.items.map((t, i) => <li key={i}><R text={t} /></li>)}</ul></div>;
    case 'pages': return <Pages pages={b.pages} />;
    case 'specSheet': return <SpecSheet toys={toys} />;
    case 'reviewDesk': return null;
    case 'tech': return <ul className="tech">{b.items.map(t => <li key={t.name}><img src={img(t.logo)} alt="" width="28" height="28" />{t.name}</li>)}</ul>;
    case 'links': return <ul className="links">{b.items.map(l => <li key={l.href}><a href={l.href} target="_blank" rel="noopener"><img src={img(l.icon)} alt="" width="28" height="28" />{l.label}</a></li>)}</ul>;
  }
}
type P = { world: WorldId; stop: string; letterId: string; toys: Record<string, number>; onClose: () => void };
const PULL = { note: { y: 220, rotation: -3 }, label: { y: 160, rotation: 3 }, catalog: { scale: .7, y: 60 }, monitor: { scale: .8 } } as const;
export default forwardRef(function LetterView({ world, stop, letterId, toys, onClose }: P, ref: ForwardedRef<HTMLElement>) {
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
      {l.blocks.map((b, i) => <B key={i} b={b} toys={toys} />)}
      <button data-testid="letter-close" onClick={onClose}>Put it down</button>
    </article>
  );
});
