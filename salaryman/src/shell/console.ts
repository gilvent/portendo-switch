import { input } from '../core/input.ts';
import { isMuted, setMuted } from '../core/audio.ts';
import { reducedMotion } from '../core/stage.ts';
import './console.css';

// The handheld, the dock, and the screen between them. The game draws into `screen`; in handheld mode the screen sits
// in the console's face, and docking carries it out to fill the window. The console's buttons are real: they press
// the game's verbs, and they go down when the keyboard or a pad presses the same verb.
export type Mode = 'handheld' | 'docking' | 'docked';

export class Shell {
  root: HTMLElement;
  screen: HTMLElement;      // the game's canvas host
  overlay: HTMLElement;     // DOM drawn over the game (prompts, labels, cards)
  mode: Mode = 'handheld';
  private btn: Record<'A' | 'B' | 'X', HTMLElement>;
  private stickKnob: HTMLElement;

  constructor(host: HTMLElement) {
    host.innerHTML = `
      <div class="shell" data-mode="handheld" data-testid="shell">
        <div class="dock" aria-hidden="true"><i class="dock-led"></i><span>DOCK</span></div>
        <div class="console" data-testid="console">
          <div class="joy joy-l"><i class="joy-minus">−</i><div class="stick" data-testid="stick"><i class="knob"></i></div></div>
          <div class="bezel"><div class="slot"></div><button class="vol" data-testid="mute" aria-label="Sound"></button></div>
          <div class="joy joy-r"><i class="joy-plus">+</i>
            <button class="pad-btn pad-x" data-btn="X" data-testid="btn-x" aria-label="X: ticket">X</button>
            <button class="pad-btn pad-a" data-btn="A" data-testid="btn-a" aria-label="A: use / jump">A</button>
            <button class="pad-btn pad-b" data-btn="B" data-testid="btn-b" aria-label="B: back">B</button>
          </div>
        </div>
        <div class="screen" data-testid="screen"><div class="overlay"></div></div>
        <a class="hurry" href="./one-page.html" data-testid="one-page">In a hurry? One-page version</a>
        <button class="mute-docked" data-testid="mute-docked" aria-label="Sound (M)">♪</button>
      </div>`;
    this.root = host.querySelector('.shell')!;
    this.screen = host.querySelector('.screen')!;
    this.overlay = host.querySelector('.overlay')!;
    this.stickKnob = host.querySelector('.knob')!;
    this.btn = { A: host.querySelector('[data-btn=A]')!, B: host.querySelector('[data-btn=B]')!, X: host.querySelector('[data-btn=X]')! };
    for (const b of ['A', 'B', 'X'] as const) {
      const el = this.btn[b];
      el.addEventListener('pointerdown', e => { e.preventDefault(); input.source = 'touch'; input.press(b); });
      const up = () => input.release(b);
      el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up); el.addEventListener('pointercancel', up);
    }
    this.bindStick(host.querySelector('.stick')!);
    // The volume key on the console; once docked, a small key at the screen's corner; M anywhere.
    const vol = host.querySelector<HTMLElement>('.vol')!, vol2 = host.querySelector<HTMLElement>('.mute-docked')!;
    const showVol = () => { for (const v of [vol, vol2]) { v.dataset.muted = String(isMuted()); v.title = isMuted() ? 'Sound off (M)' : 'Sound on (M)'; } };
    const toggle = () => { setMuted(!isMuted()); showVol(); };
    vol.addEventListener('click', toggle); vol2.addEventListener('click', toggle);
    addEventListener('keydown', e => { if (e.code === 'KeyM' && !e.repeat && !e.metaKey && !e.ctrlKey) toggle(); });
    showVol();
    this.place();
    addEventListener('resize', () => { this.measure(); this.place(); });
  }
  private bindStick(el: HTMLElement) {
    let id = -1, cx = 0, cy = 0;
    const R = 34;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - cx, dy = e.clientY - cy; const l = Math.hypot(dx, dy);
      if (l > R) { dx *= R / l; dy *= R / l; }
      input.setStick(Math.abs(dx) > 6 ? dx / R : 0, Math.abs(dy) > 6 ? dy / R : 0);
    };
    el.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; el.setPointerCapture(id); move(e); });
    el.addEventListener('pointermove', move);
    const end = (e: PointerEvent) => { if (e.pointerId === id) { id = -1; input.setStick(0, 0); } };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  // Mirror the verbs onto the console every frame.
  sync() {
    this.btn.A.classList.toggle('down', input.held.A);
    this.btn.B.classList.toggle('down', input.held.B);
    this.btn.X.classList.toggle('down', input.held.X);
    this.stickKnob.style.transform = `translate(${input.move.x * 12}px, ${input.move.z * 12}px)`;
  }
  // The screen's box: inside the bezel in handheld mode, the whole window once docked.
  // Where the slot is when the console rests in the hands, whatever it is doing now (it may be sliding into the dock).
  private slot = { left: 0, top: 0, width: 0, height: 0 };
  private measure() {
    const c = this.root.querySelector<HTMLElement>('.console')!, anim = this.root.classList.contains('undocking');
    if (!anim) { c.style.transition = 'none'; c.style.transform = 'none'; }
    const r = this.root.querySelector('.slot')!.getBoundingClientRect(), o = this.root.getBoundingClientRect();
    if (!anim) { c.style.transform = ''; void c.offsetWidth; c.style.transition = ''; }
    if (!anim) this.slot = { left: r.left - o.left, top: r.top - o.top, width: r.width, height: r.height };
  }
  place() {
    if (this.mode === 'handheld') {
      if (!this.slot.width) this.measure();
      const r = this.slot;
      Object.assign(this.screen.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    } else if (this.mode === 'docked') {
      Object.assign(this.screen.style, { left: '0px', top: '0px', width: '100%', height: '100%' });
    }
  }
  // Boarding: the console drops into the dock, the screen leaves it and opens out to fill the window.
  async dock(mid?: () => Promise<void> | void) {
    if (this.mode !== 'handheld') return;
    this.mode = 'docking';
    this.root.dataset.mode = 'docking';
    const wait = (ms: number) => new Promise(r => setTimeout(r, reducedMotion ? Math.min(ms, 300) : ms));
    await wait(650);
    await mid?.();
    this.mode = 'docked';
    this.root.dataset.mode = 'docked';
    this.place();
    await wait(900);
  }
  // The end: the screen folds back into the dock and the console lifts out with it, in the hand again.
  async undock(mid?: () => Promise<void> | void) {
    if (this.mode !== 'docked') return;
    const wait = (ms: number) => new Promise(r => setTimeout(r, reducedMotion ? Math.min(ms, 300) : ms));
    this.root.classList.add('undocking');
    this.mode = 'docking'; this.root.dataset.mode = 'docking';
    await wait(600);
    await mid?.();
    this.mode = 'handheld'; this.root.dataset.mode = 'handheld';
    this.place();
    await wait(900);
    this.root.classList.remove('undocking');
  }
  setDocked() { this.mode = 'docked'; this.root.dataset.mode = 'docked'; this.place(); }
}
