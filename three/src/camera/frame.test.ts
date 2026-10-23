import { MathUtils } from 'three';
import { describe, expect, it } from 'vitest';
import { cameraAnchors, verticalFov } from './frame';

const heldRightEdge = (aspect: number) => {
  const [x, , z] = cameraAnchors(aspect).hand;
  const halfWidth = -z * Math.tan(MathUtils.degToRad(verticalFov(aspect)) / 2) * aspect;
  return Number(((x + 0.11) / halfWidth).toFixed(2));
};

describe('camera framing', () => {
  it('keeps 50 degrees vertical on desktop and widens to 90 on a phone', () => {
    expect(verticalFov(1440 / 900)).toBe(50);
    expect(verticalFov(390 / 844)).toBe(90);
  });

  it('keeps the held console inside the right edge of the view on desktop and phone', () => {
    expect(heldRightEdge(1440 / 900)).toBe(0.86);
    expect(heldRightEdge(390 / 844)).toBe(0.85);
  });
});
