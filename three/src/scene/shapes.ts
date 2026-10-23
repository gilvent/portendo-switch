import { ExtrudeGeometry, LatheGeometry, Quaternion, Shape, Vector2, Vector3, type BufferGeometry } from 'three';
import type { Vec3 } from '../rig/poses';

export type Corners = { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };

export function roundedRect(width: number, height: number, corners: Corners | number, centre: readonly [number, number] = [0, 0]): Shape {
  const r = typeof corners === 'number' ? { topLeft: corners, topRight: corners, bottomRight: corners, bottomLeft: corners } : corners;
  const x = centre[0] - width / 2;
  const y = centre[1] - height / 2;
  const shape = new Shape();
  shape.moveTo(x + r.bottomLeft, y);
  shape.lineTo(x + width - r.bottomRight, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r.bottomRight);
  shape.lineTo(x + width, y + height - r.topRight);
  shape.quadraticCurveTo(x + width, y + height, x + width - r.topRight, y + height);
  shape.lineTo(x + r.topLeft, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r.topLeft);
  shape.lineTo(x, y + r.bottomLeft);
  shape.quadraticCurveTo(x, y, x + r.bottomLeft, y);
  return shape;
}

// Bevels grow the outline, so the shape is shrunk by the bevel to keep the requested outer size.
export function beveledSlab(width: number, height: number, depth: number, corners: Corners | number, bevel: number): BufferGeometry {
  const inset = (radius: number) => Math.max(radius - bevel, 0.0005);
  const r = typeof corners === 'number' ? { topLeft: corners, topRight: corners, bottomRight: corners, bottomLeft: corners } : corners;
  const shape = roundedRect(width - 2 * bevel, height - 2 * bevel, {
    topLeft: inset(r.topLeft),
    topRight: inset(r.topRight),
    bottomRight: inset(r.bottomRight),
    bottomLeft: inset(r.bottomLeft),
  });
  const geometry = new ExtrudeGeometry(shape, {
    depth: depth - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 14,
  });
  geometry.translate(0, 0, -(depth - 2 * bevel) / 2);
  return geometry;
}

export function lathe(profile: readonly (readonly [number, number])[], segments = 40): LatheGeometry {
  return new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), segments);
}

export function roundedDisc(radius: number, height: number, bevel: number, segments = 40): LatheGeometry {
  const steps = 5;
  const arc = (cx: number, cy: number, from: number) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const angle = from + (i / steps) * (Math.PI / 2);
      return [cx + bevel * Math.cos(angle), cy + bevel * Math.sin(angle)] as const;
    });
  return lathe(
    [[0, 0], ...arc(radius - bevel, bevel, -Math.PI / 2), ...arc(radius - bevel, height - bevel, 0), [0, height]],
    segments,
  );
}

const up = new Vector3(0, 1, 0);

export function between(from: Vec3, to: Vec3): { position: Vec3; quaternion: Quaternion; length: number } {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const direction = b.clone().sub(a);
  const middle = a.add(b).multiplyScalar(0.5);
  return {
    position: [middle.x, middle.y, middle.z],
    quaternion: new Quaternion().setFromUnitVectors(up, direction.clone().normalize()),
    length: direction.length(),
  };
}
