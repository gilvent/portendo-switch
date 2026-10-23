import type { ConsoleState } from '../console/model';
import { consoleSize } from './dimensions';

export type Vec3 = readonly [number, number, number];
export type AnchorId = 'desk' | 'dockSlot' | 'hand' | 'viewCentre' | 'leftHand' | 'rightHand' | 'rails';
export type Part = 'console' | 'leftJoycon' | 'rightJoycon';
export type CameraMode = 'free' | 'neutral' | 'locked';
export type Pose = { anchor: AnchorId; position: Vec3; rotation: Vec3 };
export type StatePose = { readonly [P in Part]: Pose } & { camera: CameraMode };

const railOffset = (consoleSize.body.width + consoleSize.joycon.width) / 2;
const onRails = {
  leftJoycon: { anchor: 'rails', position: [-railOffset, 0, 0], rotation: [0, 0, 0] },
  rightJoycon: { anchor: 'rails', position: [railOffset, 0, 0], rotation: [0, 0, 0] },
} as const satisfies Pick<StatePose, 'leftJoycon' | 'rightJoycon'>;

export const poses = {
  onDesk: {
    console: { anchor: 'desk', position: [0, consoleSize.body.depth / 2, 0], rotation: [-Math.PI / 2, 0, 0.18] },
    ...onRails,
    camera: 'neutral',
  },
  pickedUp: {
    console: { anchor: 'hand', position: [0, 0, 0], rotation: [0.32, -0.28, 0.06] },
    ...onRails,
    camera: 'free',
  },
  focused: {
    console: { anchor: 'viewCentre', position: [0, 0, 0], rotation: [0, 0, 0] },
    ...onRails,
    camera: 'locked',
  },
  docked: {
    console: { anchor: 'dockSlot', position: [0, consoleSize.body.height / 2, 0], rotation: [0, 0, 0] },
    leftJoycon: { anchor: 'leftHand', position: [0, 0, 0], rotation: [0.2, 0.25, 0.26] },
    rightJoycon: { anchor: 'rightHand', position: [0, 0, 0], rotation: [0.2, -0.25, -0.26] },
    camera: 'neutral',
  },
} as const satisfies Record<ConsoleState, StatePose>;

export function lookMode(state: ConsoleState): 'free' | 'locked' {
  return poses[state].camera === 'locked' ? 'locked' : 'free';
}
