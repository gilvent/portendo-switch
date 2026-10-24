import type { Vec3 } from '../rig/poses';

export const layout = {
  seat: [0, 1.18, 0.7],
  deskTop: 0.74,
  tvScreenCentre: [0, 1.0, -0.43],
  switchRest: [0.3, 0.741, -0.14],
  dock: { position: [-0.33, 0.74, -0.17], yaw: 0.42, slotHeight: 0.04 },
  lamp: { base: [0.68, 0.74, -0.44], elbow: [0.74, 1.0, -0.5], head: [0.56, 1.12, -0.34], aim: [-0.05, 0.74, -0.3] },
  room: { left: -1.3, right: 1.3, back: -0.62, front: 2.0, ceiling: 2.45 },
} as const satisfies {
  seat: Vec3;
  deskTop: number;
  tvScreenCentre: Vec3;
  switchRest: Vec3;
  dock: { position: Vec3; yaw: number; slotHeight: number };
  lamp: { base: Vec3; elbow: Vec3; head: Vec3; aim: Vec3 };
  room: { left: number; right: number; back: number; front: number; ceiling: number };
};
