import type { Vec3 } from '../rig/poses';

export const layout = {
  seat: [0, 1.12, 0.72],
  deskTop: 0.74,
  tvScreenCentre: [0, 1.06, -0.42],
  switchRest: [0.34, 0.74, 0.1],
  dock: { position: [-0.4, 0.74, -0.04], yaw: 0.42 },
} as const satisfies {
  seat: Vec3;
  deskTop: number;
  tvScreenCentre: Vec3;
  switchRest: Vec3;
  dock: { position: Vec3; yaw: number };
};
