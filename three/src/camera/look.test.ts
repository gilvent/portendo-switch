import { describe, expect, it } from 'vitest';
import { clampLook, dampLook, dragLook } from './look';

const degrees = (look: { yaw: number; pitch: number }) => ({
  yaw: Math.round((look.yaw * 180) / Math.PI),
  pitch: Math.round((look.pitch * 180) / Math.PI),
});

describe('look', () => {
  it('clamps yaw to 75 degrees and pitch to 30 degrees either side of neutral', () => {
    expect(degrees(clampLook({ yaw: 2, pitch: -1 }))).toEqual({ yaw: 75, pitch: -30 });
    expect(degrees(clampLook({ yaw: -2, pitch: 1 }))).toEqual({ yaw: -75, pitch: 30 });
    expect(clampLook({ yaw: 0.1, pitch: -0.2 })).toEqual({ yaw: 0.1, pitch: -0.2 });
  });

  it('turns left when dragged right and up when dragged down, then stops at the cone', () => {
    const perPixel = Math.PI / 180;
    expect(degrees(dragLook({ yaw: 0, pitch: 0 }, 10, 20, perPixel))).toEqual({ yaw: 10, pitch: 20 });
    expect(degrees(dragLook({ yaw: 0, pitch: 0 }, 500, -500, perPixel))).toEqual({ yaw: 75, pitch: -30 });
  });

  it('eases toward the target and lands on it', () => {
    const halfway = dampLook({ yaw: 0, pitch: 0 }, { yaw: 1, pitch: -1 }, 0.05);
    expect(halfway.yaw).toBeCloseTo(0.393, 3);
    expect(halfway.pitch).toBeCloseTo(-0.393, 3);
    expect(dampLook({ yaw: 0, pitch: 0 }, { yaw: 1, pitch: -1 }, 5)).toEqual({ yaw: 1, pitch: -1 });
  });

  it('snaps onto the target once it is within a ten-thousandth of a radian, so the view comes to rest', () => {
    expect(dampLook({ yaw: 0.99995, pitch: -0.99995 }, { yaw: 1, pitch: -1 }, 1 / 60)).toEqual({ yaw: 1, pitch: -1 });
    expect(dampLook({ yaw: 0.999, pitch: 0 }, { yaw: 1, pitch: 0 }, 1 / 60).yaw).toBeCloseTo(0.999154, 6);
  });
});
