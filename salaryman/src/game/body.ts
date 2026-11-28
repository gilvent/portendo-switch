// The floor plan every scene shares: a walkable rectangle, solid blocks (each with a height he can land on), and the
// rules for a body moving over it. x runs along the scene, z toward the camera, y up.
export type Rect = { x0: number; x1: number; z0: number; z1: number };
export type Solid = Rect & { h: number; id?: string };

export const inside = (r: Rect, x: number, z: number, pad = 0) => x > r.x0 - pad && x < r.x1 + pad && z > r.z0 - pad && z < r.z1 + pad;

export type Body = { x: number; y: number; z: number; vx: number; vy: number; vz: number; r: number; ground: boolean; floor: number };

// Move a body by its velocity, keep it in bounds, push it out of solids it is below the top of, and land it on the
// highest surface under it. Returns what it hit, so the scene can answer the bump.
export function moveBody(b: Body, dt: number, bounds: Rect, solids: Solid[], gravity: number) {
  const hits: { solid: Solid | null; axis: 'x' | 'z' | 'y'; speed: number }[] = [];
  const blocking = (s: Solid) => b.y < s.h - .02;
  b.x += b.vx * dt;
  for (const s of solids) if (blocking(s) && inside(s, b.x, b.z, b.r)) {
    const speed = b.vx; b.x = b.vx > 0 ? s.x0 - b.r : s.x1 + b.r; b.vx = 0; hits.push({ solid: s, axis: 'x', speed });
  }
  b.z += b.vz * dt;
  for (const s of solids) if (blocking(s) && inside(s, b.x, b.z, b.r * .5)) {
    const speed = b.vz; b.z = b.vz > 0 ? s.z0 - b.r * .5 : s.z1 + b.r * .5; b.vz = 0; hits.push({ solid: s, axis: 'z', speed });
  }
  if (b.x < bounds.x0 + b.r) { if (b.vx < -1) hits.push({ solid: null, axis: 'x', speed: b.vx }); b.x = bounds.x0 + b.r; b.vx = Math.max(0, b.vx); }
  if (b.x > bounds.x1 - b.r) { if (b.vx > 1) hits.push({ solid: null, axis: 'x', speed: b.vx }); b.x = bounds.x1 - b.r; b.vx = Math.min(0, b.vx); }
  if (b.z < bounds.z0) { b.z = bounds.z0; b.vz = Math.max(0, b.vz); }
  if (b.z > bounds.z1) { b.z = bounds.z1; b.vz = Math.min(0, b.vz); }
  // The surface under him: the floor, or the top of a block he is over.
  let floor = 0;
  for (const s of solids) if (inside(s, b.x, b.z, b.r * .4) && b.y >= s.h - .3) floor = Math.max(floor, s.h);
  b.floor = floor;
  b.vy -= gravity * dt; b.y += b.vy * dt;
  if (b.y <= floor) {
    if (!b.ground && b.vy < -1) hits.push({ solid: null, axis: 'y', speed: b.vy });
    b.y = floor; b.vy = 0; b.ground = true;
  } else if (b.y > floor + .01) b.ground = false;
  return hits;
}
