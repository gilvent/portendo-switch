// The MRT car's measurements that both the paper build (train.ts) and the live scene (Scene.tsx) need. Numbers only,
// so the game never bundles the paper recipes.
export const CAR = { W: 940, D: 300, H: 250, CEIL: 336, SEAT: 34, WIN: [100, 214] as const, COVE_IN: 34 };
const BACK = -CAR.D / 2;
// The one door, in the middle of the back wall, and the destination sign over it. The sign's text is live (Scene.tsx
// stands it on the housing), so the bake only carries its dark casing.
export const DOOR = { x: 0, w: 130, h: 204 }, SIGN = { w: 210, h: 40, y: 208, z: BACK + 15 };
// Under the floor: the underframe hangs UNDER below it, its wheels standing on the rail; the track bed lies a little lower.
export const UNDER = 74, BED = UNDER + 20;
// The front of the train: the driving cab past the right end wall, CAB.w long, its nose sloping down over the last
// CAB.nose of it. The headlight sits at CAB.light above the floor.
export const CAB = { x: CAR.W / 2 + 4, w: 290, nose: 130, h: CAR.CEIL + 26, light: 104 };
// The back wall's own sheet: where the platform's light shows through the windows once the train has stopped.
export const TUNNEL = { x: -CAR.W / 2, y: 0, z: BACK - 24, w: CAR.W, h: CAR.H };
// The tunnel the train runs through, as Scene.tsx draws it: its far wall, a sheet standing behind the whole train from
// the track bed up, and the track bed, a sheet lying under it from that wall to past the near rail.
export const BORE = { x: -1900, w: 4400, top: 600, z: BACK - 26, near: CAR.D / 2 + 150 };
// The live things (src/mrt/Car.tsx moves them; train.ts cuts them). The hand straps hang from the rail at RAIL, over the aisle
// (clear of the back wall's stops, so a jump under one is a jump and not a use), each
// STRAP.len long. The drinks can lies on the floor with its axis across the car. The help point's handset hangs on its cord.
export const RAIL = { y: 232, z: 12 }, STRAP = { len: 62, xs: [-385, -330, -270, -215, -165, 165, 215, 270, 330, 385] };
export const CAN = { x: -150, z: 34, r: 9, len: 30 };
export const HANDSET = { x: -416, y: 176, z: BACK + 14, len: 46 };
// The poster roll's window on the cove, and the line map's, as [x of the left edge, width].
export const ROLL = { x: -380, w: 240 }, MAP = { x: 140, w: 270 };
