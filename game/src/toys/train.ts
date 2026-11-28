// The train car's own life (docs/GAME_DESIGN.md, the hub): the run is heard and felt, everything loose follows the
// train's speed, straps can be knocked, and the passengers notice what he does. Nothing here is baked or saved: it
// reads the train's speed off the scene (Scene.tsx sets --speed) and moves the sheets that are already there.
import { ambientOf } from '../art/ambient.ts';
import { hum } from '../sfx.ts';
import { HEAD, type Ctx, type Toybox } from './box.ts';

// The hand straps (art/scenes/train.ts): where each hangs along the rail, how low its loop comes, how far back.
const STRAPS = [-385, -330, -270, -215, -165, 165, 215, 270, 330, 385], LOOP = 176, RAIL_Z = -64;
// One strap thrown `deg` toward the front (or back) and left to settle. The strap is a baked sheet that already rocks
// on a loop between two poses; this plays over that loop for a moment, about the same fixing.
function throwStrap(root: HTMLElement, i: number, deg: number, delay = 0) {
  const el = root.querySelector<HTMLElement>(`[data-q="strap-${i}"]`), a = el?.style.getPropertyValue('--a');
  if (!el || !a) return;
  const at = (d: number) => a.replace(/rotate\(-?[\d.]+deg\)/, `rotate(${d.toFixed(1)}deg)`);
  el.animate({ transform: [0, deg, -deg * .62, deg * .36, -deg * .16, 0].map(at) }, { duration: 1050, delay, easing: 'ease-in-out' });
}

export function train(): Toybox {
  const people = ambientOf('train').touch.filter(t => t.says), calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hit = new Map<number, number>();
  let line = -1, arrival = 0, joint = 0, was = 0;
  const all = (c: Ctx, glyph: (says: string) => string, every = 1) => people.forEach((t, i) => { if (i % every === 0) window.setTimeout(() => c.say(t.x, t.top ?? 120, t.z, glyph(t.says ?? '…')), i * 60); });
  return {
    sync(c, first) {
      const l = c.toys.line ?? 0, a = c.toys.arrival ?? 0;
      // The sign turns: it clicks over, and the passengers look up.
      if (!first && l !== line) { c.sfx('flip'); c.sfx('tap', .12); if (!calm) all(c, () => '?', 2); }
      line = l;
      if (!first && a !== arrival && !calm) {
        if (a === 1) {
          // The brakes: everything loose is thrown toward the front of the train and swings back.
          c.sfx('squeal');
          STRAPS.forEach((_, i) => throwStrap(c.root, i, 24, i * 22));
          for (const p of ['p-', 'suitcase', 'shop-bag']) c.fx.shove(p, 9);
          all(c, () => '!', 2);
        }
        if (a === 2) { c.sfx('slide'); c.sfx('chime', .1); }
      }
      arrival = a;
    },
    frame(c, dt) {
      const v = +c.root.style.getPropertyValue('--speed') || 0;
      hum(v);
      // Pulling away: loose things hang back as the car gathers speed.
      if (was < .05 && v >= .05 && !calm) { STRAPS.forEach((_, i) => throwStrap(c.root, i, -16, i * 18)); for (const p of ['p-', 'suitcase', 'shop-bag']) c.fx.shove(p, -6); }
      was = v;
      // The rail joints: a double knock each time the car jolts over one (the jolt loops every .92s at full speed).
      joint += dt * v / .92;
      if (joint >= 1) { joint -= 1; if (v > .25) c.sfx('clack', .38 * .92); }
      // A hop under a strap knocks it, and whoever sits beneath looks up.
      if (c.hero.y > 0 && c.hero.y + HEAD >= LOOP && c.hero.z < RAIL_Z + 70) {
        const now = performance.now();
        STRAPS.forEach((x, i) => {
          if (Math.abs(c.hero.x - x) > 30 || now - (hit.get(i) ?? -1e9) < 800) return;
          hit.set(i, now); throwStrap(c.root, i, c.hero.x <= x ? 30 : -30); c.sfx('tap');
          const under = people.find(t => Math.abs(t.x - x) < 60); if (under) c.say(under.x, under.top ?? 120, under.z, '!');
        });
      }
    },
    end() { hum(0); }
  };
}
