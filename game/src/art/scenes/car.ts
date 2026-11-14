// The MRT car's measurements that both the paper build (train.ts) and the live scene (Scene.tsx) need. Numbers only,
// so the game never bundles the paper recipes.
export const CAR = { W: 1100, D: 300, H: 250, CEIL: 336, SEAT: 34, WIN: [100, 214] as const };
const BACK = -CAR.D / 2;
// The one door, in the middle of the back wall, and the destination sign over it. The sign's text is live (Scene.tsx
// stands it on the housing), so the bake only carries its dark casing.
export const DOOR = { x: 0, w: 130, h: 204 }, SIGN = { w: 210, h: 40, y: 208, z: BACK + 15 };
// What Scene.tsx stands behind the back wall: a sheet the size of the wall, a little behind it, showing the tunnel.
export const TUNNEL = { x: -CAR.W / 2, y: 0, z: BACK - 24, w: CAR.W, h: CAR.H };
