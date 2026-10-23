import { MathUtils } from 'three';
import { consoleSize } from '../rig/dimensions';
import type { AnchorId, Vec3 } from '../rig/poses';

export type CameraAnchorId = Extract<AnchorId, 'hand' | 'viewCentre' | 'leftHand' | 'rightHand'>;

const minVerticalFov = 50;
const maxVerticalFov = 90;
const minHorizontalFov = 70;

export function verticalFov(aspect: number): number {
  const fitted = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(minHorizontalFov) / 2) / aspect));
  return MathUtils.clamp(fitted, minVerticalFov, maxVerticalFov);
}

const consoleWidth = consoleSize.body.width + 2 * consoleSize.joycon.width;

// Camera-space anchors sit at fractions of the view, so held parts keep their framing on any screen shape.
export function cameraAnchors(aspect: number): Record<CameraAnchorId, Vec3> {
  const tanV = Math.tan(MathUtils.degToRad(verticalFov(aspect)) / 2);
  const tanH = tanV * aspect;
  const depthToFill = (widthFraction: number, heightFraction: number) =>
    Math.max(consoleWidth / (2 * widthFraction * tanH), consoleSize.body.height / (2 * heightFraction * tanV));

  const centre = depthToFill(0.5, 0.42);
  const hand = Math.max(0.4, depthToFill(0.62, 0.4));
  const hands = 0.42;
  return {
    viewCentre: [0, 0, -centre],
    hand: [0.5 * hand * tanH, -0.52 * hand * tanV, -hand],
    leftHand: [-0.72 * hands * tanH, -0.42 * hands * tanV, -hands],
    rightHand: [0.72 * hands * tanH, -0.42 * hands * tanV, -hands],
  };
}
