import { MathUtils } from 'three';
import type { Vec3 } from '../rig/poses';
import { layout } from '../scene/layout';

export type Look = { yaw: number; pitch: number };

export const neutralLook: Look = { yaw: 0, pitch: 0 };

function aimFromSeat([x, y, z]: Vec3): Look {
  const [seatX, seatY, seatZ] = layout.seat;
  const [dx, dy, dz] = [x - seatX, y - seatY, z - seatZ];
  return { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
}

export const neutralAim: Look = aimFromSeat(layout.tvScreenCentre);

export function lookToward(point: Vec3): Look {
  const aim = aimFromSeat(point);
  return { yaw: aim.yaw - neutralAim.yaw, pitch: aim.pitch - neutralAim.pitch };
}

const dockLookHeight = 0.09;
const [dockX, dockY, dockZ] = layout.dock.position;

export const dockLook: Look = lookToward([dockX, dockY + layout.dock.slotHeight + dockLookHeight, dockZ]);

export const lookLimits = { yaw: MathUtils.degToRad(75), pitch: MathUtils.degToRad(30) } as const;

export function clampLook(look: Look): Look {
  return {
    yaw: MathUtils.clamp(look.yaw, -lookLimits.yaw, lookLimits.yaw),
    pitch: MathUtils.clamp(look.pitch, -lookLimits.pitch, lookLimits.pitch),
  };
}

export function dragLook(look: Look, dx: number, dy: number, radiansPerPixel: number): Look {
  return clampLook({ yaw: look.yaw + dx * radiansPerPixel, pitch: look.pitch + dy * radiansPerPixel });
}

const lookDamping = 10;
const restRadians = 1e-4;

function dampAngle(current: number, target: number, deltaSeconds: number): number {
  const next = MathUtils.damp(current, target, lookDamping, deltaSeconds);
  return Math.abs(target - next) < restRadians ? target : next;
}

export function dampLook(current: Look, target: Look, deltaSeconds: number): Look {
  return {
    yaw: dampAngle(current.yaw, target.yaw, deltaSeconds),
    pitch: dampAngle(current.pitch, target.pitch, deltaSeconds),
  };
}
