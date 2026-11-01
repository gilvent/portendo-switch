import type { Stop, World } from './schema.ts';

export type Walker = { x: number; z: number; vx: number; vz: number };
export const MAX_SPEED = 430, GRIP = 11, REACH = 92, RADIUS = 22, Z_SCALE = 1.5, STOP_DRAG = .42;

export function step(w: Walker, ix: number, iz: number, dt: number, world: World): Walker {
  const m = Math.hypot(ix, iz), k = 1 - Math.exp(-GRIP * dt);
  const stop = nearest(world, w.x, w.z), inbound = stop && stop.action.kind !== 'road' && (stop.x - w.x) * ix + (stop.z - w.z) * iz > 0;
  const n = (m > 1 ? 1 / m : 1) * (inbound ? STOP_DRAG : 1);
  const vx = w.vx + (ix * n * MAX_SPEED - w.vx) * k, vz = w.vz + (iz * n * MAX_SPEED - w.vz) * k;
  const b = world.bounds, hit = (x: number, z: number) => world.solid.some(r => x > r.x0 - RADIUS && x < r.x1 + RADIUS && z > r.z0 - RADIUS && z < r.z1 + RADIUS);
  let x = Math.min(b.x1, Math.max(b.x0, w.x + vx * dt)), z = Math.min(b.z1, Math.max(b.z0, w.z + vz * dt));
  if (hit(x, w.z)) x = w.x;
  if (hit(x, z)) z = w.z;
  return { x, z, vx: x === w.x ? 0 : vx, vz: z === w.z ? 0 : vz };
}
export function nearest(world: World, x: number, z: number): Stop | null {
  let best: Stop | null = null, bd = 1;
  for (const s of world.stops) { const r = s.reach ?? REACH, d = ((s.x - x) ** 2 + ((s.z - z) * Z_SCALE) ** 2) / (r * r); if (d < bd) { bd = d; best = s; } }
  return best;
}
export function seek(w: Walker, tx: number, tz: number): [number, number] {
  const dx = tx - w.x, dz = tz - w.z, d = Math.hypot(dx, dz);
  if (d < 6) return [0, 0];
  const pull = Math.min(1, d / 70);
  return [dx / d * pull, dz / d * pull];
}
