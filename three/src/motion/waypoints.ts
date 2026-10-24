import { MathUtils } from 'three';
import { consoleSize } from '../rig/dimensions';
import { poses, type Placement } from '../rig/poses';

export type JoyconPart = 'leftJoycon' | 'rightJoycon';

const { body } = consoleSize;
const docked = poses.docked.console.position;
const leftRail = poses.onDesk.leftJoycon.position;
const rightRail = poses.onDesk.rightJoycon.position;
const ejectRise = 0.02;
const swingOut = 0.025;
const swingTilt = MathUtils.degToRad(15);
const dockLiftTilt = MathUtils.degToRad(15);

export const waypoints = {
  deskLift: { anchor: 'desk', position: [0, body.depth / 2 + 0.035, 0.01], rotation: [-Math.PI / 2 + 0.35, 0, 0.18] },
  leaveCentre: { anchor: 'viewCentre', position: [0.05, -0.035, -0.02], rotation: [0.12, -0.12, 0.03] },
  dockHover: { anchor: 'dockSlot', position: [docked[0], docked[1] + 0.08, docked[2]], rotation: [0, 0, 0] },
  dockLift: { anchor: 'dockSlot', position: [docked[0] + 0.01, docked[1] + 0.06, docked[2]], rotation: [0, 0, -dockLiftTilt] },
} as const satisfies Record<string, Placement>;

export const joyconWaypoints = {
  hop: {
    leftJoycon: { anchor: 'rails', position: [leftRail[0], ejectRise, 0], rotation: [0, 0, 0] },
    rightJoycon: { anchor: 'rails', position: [rightRail[0], -ejectRise, 0], rotation: [0, 0, 0] },
  },
  swing: {
    leftJoycon: { anchor: 'rails', position: [leftRail[0] - swingOut, ejectRise, 0], rotation: [0, 0, swingTilt] },
    rightJoycon: { anchor: 'rails', position: [rightRail[0] + swingOut, -ejectRise, 0], rotation: [0, 0, -swingTilt] },
  },
  preTilt: {
    leftJoycon: { anchor: 'leftHand', position: [0, 0, 0], rotation: [0, 0, 0] },
    rightJoycon: { anchor: 'rightHand', position: [0, 0, 0], rotation: [0, 0, 0] },
  },
} as const satisfies Record<string, Record<JoyconPart, Placement>>;
