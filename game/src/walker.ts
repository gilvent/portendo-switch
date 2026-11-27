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
  // A stop is in reach from where the salaryman is meant to stand, and also from in front of the thing itself (`look`):
  // a first-time player walks up to the object, not to a spot beside it.
  for (const s of world.stops) { const r = s.reach ?? REACH, dx = Math.min(Math.abs(s.x - x), Math.abs((s.look ?? s.x) - x) * .7), d = (dx ** 2 + ((s.z - z) * Z_SCALE) ** 2) / (r * r); if (d < bd) { bd = d; best = s; } }
  return best;
}
export function seek(w: Walker, tx: number, tz: number): [number, number] {
  const dx = tx - w.x, dz = tz - w.z, d = Math.hypot(dx, dz);
  if (d < 6) return [0, 0];
  const pull = Math.min(1, d / 70);
  return [dx / d * pull, dz / d * pull];
}

// The way from where he is to a tapped spot, as points to walk to in turn. A straight line is enough everywhere but
// across a yard's fence, where he goes round by the gate.
export function route(world: World, from: { x: number; z: number }, to: { x: number; z: number }): [number, number][] {
  const inside = (y: NonNullable<World['yards']>[number], p: { x: number; z: number }) => p.x > y.x0 && p.x < y.x1 && p.z > y.z0 && p.z < y.z1, path: [number, number][] = [];
  for (const y of world.yards ?? []) { const a = inside(y, from), b = inside(y, to); if (a === b) continue; if (a) path.push([y.gate.x, y.gate.in], [y.gate.x, y.gate.out]); else path.push([y.gate.x, y.gate.out], [y.gate.x, y.gate.in]); }
  return [...path, [to.x, to.z]];
}
