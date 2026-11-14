import { useEffect, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import gsap from 'gsap';
import type { Action, ControllerMode } from './game.ts';
import { reducedMotion } from './light.ts';
import Courier from './art/Courier.tsx';

type Props = { rigRef: RefObject<HTMLDivElement>; mode: ControllerMode; visible: boolean; lit: string | null; atDock: boolean; introRef: RefObject<HTMLDivElement>; stick: MutableRefObject<{ x: number; z: number }>; stickSpent: MutableRefObject<boolean>; dispatch: (a: Action) => void; onDockDone: () => void };

export default function Controller({ rigRef, mode, visible, lit, atDock, introRef, stick, stickSpent, dispatch, onDockDone }: Props) {
  const body = useRef<HTMLDivElement>(null), left = useRef<HTMLDivElement>(null), right = useRef<HTMLDivElement>(null), off = useRef<HTMLDivElement>(null);
  const nub = useRef<HTMLDivElement>(null), slotC = useRef<HTMLDivElement>(null), slotL = useRef<HTMLDivElement>(null), slotR = useRef<HTMLDivElement>(null), holdL = useRef<HTMLDivElement>(null), holdR = useRef<HTMLDivElement>(null);
  const slotUp = useRef<HTMLDivElement>(null), dockBack = useRef<HTMLDivElement>(null), dockFront = useRef<HTMLDivElement>(null), led = useRef<HTMLDivElement>(null);
  const toSlot = (el: HTMLElement, slot: HTMLElement) => {
    const prev = el.style.transform, cam = rigRef.current?.style.transform ?? ''; el.style.transform = 'none';
    if (rigRef.current) rigRef.current.style.transform = 'none';
    const a = el.getBoundingClientRect(), b = slot.getBoundingClientRect(); el.style.transform = prev;
    if (rigRef.current) rigRef.current.style.transform = cam;
    return { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: Math.min(b.width / a.width, b.height / a.height) };
  };
  const snap = () => { if (body.current && left.current && right.current && slotC.current && slotL.current && slotR.current) { gsap.set(body.current, toSlot(body.current, slotC.current)); gsap.set(left.current, toSlot(left.current, slotL.current)); gsap.set(right.current, toSlot(right.current, slotR.current)); } };
  const snapHandheld = () => { if (left.current && right.current && holdL.current && holdR.current) { gsap.set(left.current, toSlot(left.current, holdL.current)); gsap.set(right.current, toSlot(right.current, holdR.current)); } };
  useLayoutEffect(() => {
    const fit = mode === 'docked' ? snap : snapHandheld;
    fit();
    if (mode === 'docked' && off.current) off.current.style.visibility = 'hidden';
    addEventListener('resize', fit);
    return () => removeEventListener('resize', fit);
  }, [mode]);
  useEffect(() => {
    if (mode !== 'docking') return;
    const finished = () => onDockDone();
    if (reducedMotion()) { finished(); return; }
    if (!body.current || !left.current || !right.current || !slotC.current || !slotUp.current || !slotL.current || !slotR.current || !off.current || !dockBack.current || !dockFront.current || !led.current) throw new Error('controller parts missing at docking');
    // Like the real thing: the side controllers slide up off their rails, the console is carried over the dock and lowered into the slot, then the TV wakes.
    const tl = gsap.timeline({ onComplete: finished });
    tl.to([left.current, right.current], { y: '-=46', duration: .22, ease: 'power2.out' })
      .to(left.current, { ...toSlot(left.current, slotL.current), duration: .55, ease: 'power3.inOut' }, .2)
      .to(right.current, { ...toSlot(right.current, slotR.current), duration: .55, ease: 'power3.inOut' }, .2)
      .to(body.current, { ...toSlot(body.current, slotUp.current), duration: .6, ease: 'power3.inOut' }, .2)
      .to(body.current, { ...toSlot(body.current, slotC.current), duration: .28, ease: 'power2.in' }, .86)
      .call(() => body.current?.setAttribute('data-seated', ''), [], 1.14)
      .to([dockBack.current, dockFront.current], { y: 3, duration: .07, ease: 'power1.out', yoyo: true, repeat: 1 }, 1.14)
      .to(led.current, { backgroundColor: '#58e08a', boxShadow: '0 0 6px #58e08a', duration: .12 }, 1.16)
      .to(off.current, { autoAlpha: 0, duration: .6, ease: 'none' }, 1.05);
    return () => { tl.kill(); };
  }, [mode]);

  const stickMove = (e: React.PointerEvent) => {
    if (!e.buttons) return;
    const r = e.currentTarget.getBoundingClientRect(), R = r.width / 2;
    let x = (e.clientX - r.left - R) / R, z = (e.clientY - r.top - R) / R; const m = Math.hypot(x, z);
    if (m > 1) { x /= m; z /= m; }
    if (m < .14) { x = 0; z = 0; }
    stick.current = { x, z };
    if (nub.current) nub.current.style.transform = `translate3d(${x * 30}px,${z * 30}px,0)`;
  };
  const stickEnd = () => { stickSpent.current = false; stick.current = { x: 0, z: 0 }; if (nub.current) nub.current.style.transform = 'none'; };
  const btn = (k: 'A' | 'B' | 'X', a: Action) => <button className={`pad pad-${k}${lit === k ? ' lit' : ''}`} data-testid={`btn-${k.toLowerCase()}`} aria-label={`Button ${k}`} onClick={() => dispatch(a)}>{k}</button>;

  return (
    <div className="controller" data-testid={`controller-${mode}`} data-mode={mode} data-visible={visible}>
      <div className="tv-off" ref={off} aria-hidden="true" />
      <div className="rig" ref={rigRef} data-testid="controller-camera">
      <i className="slot slot-c" ref={slotC} /><i className="slot slot-up" ref={slotUp} /><i className="slot slot-l" ref={slotL} /><i className="slot slot-r" ref={slotR} /><i className="slot hold-l" ref={holdL} /><i className="slot hold-r" ref={holdR} />
      <div className="dock-back" ref={dockBack} aria-hidden="true" />
      <div className="console" ref={body}>
        <div className="screen" data-testid="handheld-screen">
          <div className="mini-road" />
          <div className="mini-courier" ref={introRef}><Courier /></div>
          {atDock && <b className="prompt end" data-testid="prompt-a">A</b>}
        </div>
      </div>
      <div className={`dock${atDock && mode === 'handheld' ? ' lit' : ''}`} ref={dockFront} data-testid="dock" onClick={() => dispatch({ a: 'confirm' })}><i className="dock-led" ref={led} /><i className="dock-logo" /><span className="dock-label">DOCK</span></div>
      <div className="joy joy-l" ref={left}>
        <div className={`stick${lit === 'stick' ? ' lit' : ''}`} data-testid="btn-stick" onPointerDown={e => { stickSpent.current = false; e.currentTarget.setPointerCapture(e.pointerId); stickMove(e); }} onPointerMove={stickMove} onPointerUp={stickEnd} onPointerCancel={stickEnd}><div className="nub" ref={nub} /></div>
      </div>
      <div className="joy joy-r" ref={right}>{btn('X', { a: 'map' })}{btn('A', { a: 'confirm' })}{btn('B', { a: 'back' })}</div>
      </div>
    </div>
  );
}
