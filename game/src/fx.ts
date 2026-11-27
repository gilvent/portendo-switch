// Live paper bits, drawn by the game rather than baked: dust under the salaryman's shoes, scraps thrown up when
// something is used, a tag that pops over a passer-by's head, and the hop of anything he brushes past. Like every
// other moving sheet they move in stepped frames, and under reduced motion none of them appear.
import { reducedMotion } from './light.ts';
import type { Ambient, Touchable } from './art/ambient.ts';

const POOL = 40, GRAVITY = 1100;
export type Fx = {
  // A puff of cut-paper dots at ground level, drifting toward `dir` (-1 left, 1 right, 0 both ways).
  dust(x: number, z: number, dir: number, n?: number): void;
  // Paper scraps bursting up from a point `y` above the ground.
  scraps(x: number, y: number, z: number, colors: readonly string[], n?: number): void;
  // A small paper tag with one glyph, rising over a point and gone again.
  say(x: number, y: number, z: number, glyph: string): void;
  // Called every frame with the salaryman's place: anything he comes close to while moving hops.
  touch(x: number, z: number, moving: boolean): void;
  // A tap or click on the scene at screen point [cx, cy]: whatever paper is under it answers. A touchable hops as it
  // does for the salaryman; any other small object hops with the sheets it is built from; a big sheet knocks.
  tap(cx: number, cy: number): void;
  // A camera flash: the whole view whites out and clears in a few stepped frames.
  flash(): void;
  // A knock felt through the whole scene: the view jumps `px` and settles.
  shake(px: number): void;
  // Every sheet whose id starts with `prefix` hops `lift` units together.
  jolt(prefix: string, lift?: number): void;
  // Set by the scene: called every frame with where he is, for the toys that work on presence (toys/box.ts).
  frame?: (x: number, z: number, y: number, speed: number, dt: number) => void;
};

let seed = 7;
const rnd = (a: number, b: number) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };
export const DUST = ['#f4e9d8', '#e9d9c2', '#fff8ec'] as const;

export function makeFx(layer: HTMLElement, scene: HTMLElement, amb: Ambient): Fx {
  const bits: HTMLElement[] = []; let next = 0;
  const take = (cls: string) => {
    let el = bits[next];
    if (!el) { el = document.createElement('i'); layer.appendChild(el); bits[next] = el; }
    next = (next + 1) % POOL;
    for (const a of el.getAnimations()) a.cancel();
    el.className = cls; el.textContent = '';
    return el;
  };
  // One bit thrown from [x, y, z] at [vx, vy, vz] under gravity `g`, turning `turn` degrees on the way.
  const fly = (cls: string, x: number, y: number, z: number, vx: number, vy: number, vz: number, size: number, color: string, ms: number, turn: number, g = GRAVITY) => {
    const el = take(cls), t = ms / 1000;
    el.style.cssText = `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;background:${color}`;
    const at = (k: number) => { const s = t * k; return `translate3d(${(x + vx * s).toFixed(1)}px,${(-Math.max(1, y + vy * s - g * s * s / 2)).toFixed(1)}px,${(z + vz * s).toFixed(1)}px) rotate(${(turn * k).toFixed(0)}deg)`; };
    el.animate([0, .2, .4, .6, .8, 1].map(k => ({ transform: at(k), opacity: k < .8 ? 1 : k < 1 ? .7 : 0 })), { duration: ms, easing: 'steps(7,end)', fill: 'forwards' });
  };
  const last = new Map<string, number>();
  const hop = (t: Touchable) => {
    const L = t.lift ?? 9;
    for (const el of scene.querySelectorAll<HTMLElement>(`[data-g="${t.name}"]`)) el.animate({ translate: ['0 0', `0 ${-L}px`, '0 0', `0 ${(-L * .35).toFixed(1)}px`, '0 0'] }, { duration: 460, easing: 'steps(9,end)' });
  };
  const jump = (els: Iterable<HTMLElement>, L: number) => { for (const el of els) el.animate({ translate: ['0 0', `0 ${-L}px`, '0 0', `0 ${(-L * .35).toFixed(1)}px`, '0 0'] }, { duration: 460, easing: 'steps(9,end)' }); };
  let tapped = -1e9;
  const white = document.createElement('i'); white.className = 'flash'; scene.appendChild(white);
  const stage = scene.querySelector<HTMLElement>('.stage');
  const fx: Fx = {
    flash() { if (!reducedMotion()) white.animate({ opacity: [.92, .7, .3, 0] }, { duration: 300, easing: 'steps(4,end)' }); },
    shake(px) { if (!reducedMotion()) stage?.animate({ translate: ['0 0', `${px}px ${-px}px`, `${-px * .6}px ${px * .5}px`, `${px * .3}px 0`, '0 0'] }, { duration: 220, easing: 'steps(5,end)' }); },
    jolt(prefix, lift = 7) { if (!reducedMotion()) jump(scene.querySelectorAll<HTMLElement>(`.pp[data-q^="${prefix}"]`), lift); },
    dust(x, z, dir, n = 2) {
      if (reducedMotion()) return;
      for (let i = 0; i < n; i++) { const d = dir || (i % 2 ? 1 : -1); fly('bit dust', x + rnd(-8, 8), rnd(3, 7), z + rnd(2, 10), d * rnd(40, 110), rnd(50, 120), rnd(-10, 20), rnd(6, 10), DUST[i % DUST.length], rnd(340, 460), 0, 420); }
    },
    scraps(x, y, z, colors, n = 9) {
      if (reducedMotion()) return;
      for (let i = 0; i < n; i++) { const a = rnd(-1, 1); fly(`bit scrap${i % 3 === 0 ? ' tri' : ''}`, x + a * 14, y + rnd(-6, 10), z + rnd(4, 16), a * rnd(120, 260), rnd(260, 430), rnd(0, 50), rnd(7, 12), colors[i % colors.length], rnd(520, 700), rnd(-300, 300)); }
    },
    say(x, y, z, glyph) {
      if (reducedMotion()) return;
      const el = take('bit say'); el.textContent = glyph; el.style.cssText = '';
      const at = (dy: number, s: number, r: number) => `translate3d(${x}px,${-(y + dy)}px,${z + 6}px) scale(${s}) rotate(${r}deg)`;
      el.animate([{ transform: at(0, .2, -14), opacity: 1 }, { transform: at(20, 1.15, 5), opacity: 1, offset: .22 }, { transform: at(17, 1, 0), opacity: 1, offset: .34 }, { transform: at(17, 1, 0), opacity: 1, offset: .82 }, { transform: at(26, .6, 8), opacity: 0 }], { duration: 1100, easing: 'steps(12,end)', fill: 'forwards' });
    },
    tap(cx, cy) {
      const now = performance.now();
      if (reducedMotion() || now - tapped < 250) return;
      // Sheets ignore the pointer so they never block a stop; for this one look they answer it.
      scene.classList.add('probing'); const el = document.elementFromPoint(cx, cy); scene.classList.remove('probing');
      if (!(el instanceof HTMLElement) || !el.classList.contains('pp')) return;
      tapped = now;
      const t = amb.touch.find(k => k.name === el.dataset.g), x = +(el.dataset.x ?? 0), z = +(el.dataset.z ?? 0);
      if (t) { last.set(t.name, now); hop(t); if (t.says) fx.say(t.x, t.top ?? 120, t.z, t.says); else fx.dust(t.x, t.z + 8, 0, 2); return; }
      if (el.dataset.big !== undefined) { jump([el], 2.5); return; }
      jump([...scene.querySelectorAll<HTMLElement>('.pp:not([data-big])')].filter(e => e === el || Math.hypot(+(e.dataset.x ?? 0) - x, +(e.dataset.z ?? 0) - z) < 64), 7);
      fx.dust(x, z + 10, 0, 2);
    },
    touch(x, z, moving) {
      if (!moving || reducedMotion()) return;
      const now = performance.now();
      for (const t of amb.touch) {
        const r = t.r ?? 62;
        if (Math.abs(t.x - x) > r || Math.hypot(t.x - x, t.z - z) > r || now - (last.get(t.name) ?? -1e9) < 1500) continue;
        last.set(t.name, now); hop(t);
        if (t.says) fx.say(t.x, t.top ?? 120, t.z, t.says);
        else fx.dust(t.x, t.z + 8, 0, 2);
      }
    }
  };
  return fx;
}
