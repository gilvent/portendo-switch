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
    const vol = host.querySelector<HTMLElement>('.vol')!;
    const showVol = () => { vol.dataset.muted = String(isMuted()); vol.title = isMuted() ? 'Sound off' : 'Sound on'; };
    vol.addEventListener('click', () => { setMuted(!isMuted()); showVol(); }); showVol();
    this.place();
    addEventListener('resize', () => this.place());
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
  place() {
    if (this.mode === 'handheld') {
      const r = this.root.querySelector('.slot')!.getBoundingClientRect(), o = this.root.getBoundingClientRect();
      Object.assign(this.screen.style, { left: `${r.left - o.left}px`, top: `${r.top - o.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    } else if (this.mode === 'docked') {
      Object.assign(this.screen.style, { left: '0px', top: '0px', width: '100%', height: '100%' });
    }
  }
  // Boarding: the console drops into the dock, the screen leaves it and opens out to fill the window.
  async dock(mid?: () => Promise<void> | void) {
    if (this.mode !== 'handheld') return;
    this.mode = 'docking';
    this.root.dataset.mode = 'docking';
    const wait = (ms: number) => new Promise(r => setTimeout(r, reducedMotion ? 0 : ms));
    await wait(650);
    await mid?.();
    this.mode = 'docked';
    this.root.dataset.mode = 'docked';
    this.place();
    await wait(900);
  }
  setDocked() { this.mode = 'docked'; this.root.dataset.mode = 'docked'; this.place(); }
}
