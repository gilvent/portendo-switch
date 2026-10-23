import { MathUtils } from 'three';

export type Look = { yaw: number; pitch: number };

export const neutralLook: Look = { yaw: 0, pitch: 0 };

export const lookLimits = { yaw: MathUtils.degToRad(75), pitch: MathUtils.degToRad(30) } as const;

export function clampLook(look: Look): Look {
  return {
    yaw: MathUtils.clamp(look.yaw, -lookLimits.yaw, lookLimits.yaw),
    pitch: MathUtils.clamp(look.pitch, -lookLimits.pitch, lookLimits.pitch),
  };
}

// Dragging grabs the world: moving the pointer right turns the view left (positive yaw), down turns it up.
export function dragLook(look: Look, dx: number, dy: number, radiansPerPixel: number): Look {
  return clampLook({ yaw: look.yaw + dx * radiansPerPixel, pitch: look.pitch + dy * radiansPerPixel });
}

const lookDamping = 10;

export function dampLook(current: Look, target: Look, deltaSeconds: number): Look {
  return {
    yaw: MathUtils.damp(current.yaw, target.yaw, lookDamping, deltaSeconds),
    pitch: MathUtils.damp(current.pitch, target.pitch, lookDamping, deltaSeconds),
  };
}
