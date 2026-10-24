import type { ConsoleState } from '../console/model';
import { consoleSize } from './dimensions';

export type Vec3 = readonly [number, number, number];
export type AnchorId = 'desk' | 'dockSlot' | 'hand' | 'viewCentre' | 'leftHand' | 'rightHand' | 'rails';
export const parts = ['console', 'leftJoycon', 'rightJoycon'] as const;
export type Part = (typeof parts)[number];
export type CameraMode = 'free' | 'neutral' | 'locked';
export type Placement = { anchor: AnchorId; position: Vec3; rotation: Vec3 };
export type Pose = Placement & { clickThrough: boolean };
export type Level = 0 | 1;
export type TvInput = 'home' | 'console';
export type Signals = { screenPower: Level; ledPower: Level; tvInput: TvInput };
export type StatePose = { readonly [P in Part]: Pose } & { camera: CameraMode; signals: Signals };

const handheld = { screenPower: 1, ledPower: 0, tvInput: 'home' } as const satisfies Signals;

const railOffset = (consoleSize.body.width + consoleSize.joycon.width) / 2;
const onRails = {
  leftJoycon: { anchor: 'rails', position: [-railOffset, 0, 0], rotation: [0, 0, 0], clickThrough: false },
  rightJoycon: { anchor: 'rails', position: [railOffset, 0, 0], rotation: [0, 0, 0], clickThrough: false },
} as const satisfies Pick<StatePose, 'leftJoycon' | 'rightJoycon'>;

export const poses = {
  onDesk: {
    console: { anchor: 'desk', position: [0, consoleSize.body.depth / 2, 0], rotation: [-Math.PI / 2, 0, 0.18], clickThrough: false },
    ...onRails,
    camera: 'neutral',
    signals: handheld,
  },
  pickedUp: {
    console: { anchor: 'hand', position: [0, 0, 0], rotation: [0.32, -0.28, 0.06], clickThrough: false },
    ...onRails,
    camera: 'free',
    signals: handheld,
  },
  focused: {
    console: { anchor: 'viewCentre', position: [0, 0, 0], rotation: [0, 0, 0], clickThrough: false },
    ...onRails,
    camera: 'locked',
    signals: handheld,
  },
  docked: {
    console: { anchor: 'dockSlot', position: [0, consoleSize.body.height / 2, 0], rotation: [0, 0, 0], clickThrough: false },
    leftJoycon: { anchor: 'leftHand', position: [0, 0, 0], rotation: [0.2, 0.25, 0.26], clickThrough: true },
    rightJoycon: { anchor: 'rightHand', position: [0, 0, 0], rotation: [0.2, -0.25, -0.26], clickThrough: true },
    camera: 'neutral',
    signals: { screenPower: 0, ledPower: 1, tvInput: 'console' },
  },
} as const satisfies Record<ConsoleState, StatePose>;

export const tvMix = { home: 0, console: 1 } as const satisfies Record<TvInput, Level>;

export function lookMode(state: ConsoleState): 'free' | 'locked' {
  return poses[state].camera === 'locked' ? 'locked' : 'free';
}
