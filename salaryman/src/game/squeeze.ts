import type { Game } from './game.ts';
import { sfx } from './sfx.ts';

// Through a door. With time to spare he half-turns and walks in (380 ms). With the doors closing he turns fully
// edge-on: six stop-motion frames of 83 ms in which he becomes the white line of his own card, the doors pinch on
// it, and he is through. `pinch` drives the scene's door opening while it runs (null hands it back).
const THIN = [0, .45, .8, .8, .8];
const SQUEEZE: [number, number, number][] = [[.5, .55, 0], [.91, .35, 0], [1, .18, .33], [1, .08, .66], [1, .04, 1]]; // thin, pinch, depth
export async function slipThrough(g: Game, o: { x: number; z1: number; last: boolean; pinch: (v: number | null) => void; seam: { x: number; y: number; z: number } }) {
  const h = g.hero, x0 = h.body.x, z0 = h.body.z;
  sfx.fwip();
  if (!o.last) {
    await g.anims.play(380, k => { h.body.x = x0 + (o.x - x0) * k; h.body.z = z0 + (o.z1 - z0) * k; h.thin = THIN[Math.min(4, Math.floor(k * 5))]; });
    sfx.doors(); return;
  }
  h.squash.x = .85;
  for (let i = 0; i < SQUEEZE.length; i++) {
    const [thin, pinch, depth] = SQUEEZE[i];
    h.thin = thin; o.pinch(pinch);
    // Hold the pose every frame of its 83 ms (the lane would pull him back otherwise).
    const x = i === 0 ? x0 + (o.x - x0) * .5 : o.x, z = z0 + (o.z1 - z0) * depth;
    h.body.x = x; h.body.z = z;
    await g.anims.play(83, () => { h.body.x = x; h.body.z = z; });
  }
  h.group.visible = false; o.pinch(0);
  sfx.doors(); g.fx.burst(o.seam.x, o.seam.y, o.seam.z, ['#fffaf0', '#e9e4d8'], 3, .4); g.fx.puff(o.seam.x, .2, o.seam.z, 3, .3); g.stage.nudge(.06, 0);
  await g.anims.wait(83);
}
