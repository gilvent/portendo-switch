import { Group, Object3D } from 'three';
import type { ConsoleState } from '../console/model';
import { neutralLook, type Look } from '../camera/look';
import { tag } from '../input/picking';
import { parts, poses, type AnchorId, type StatePose } from './poses';

export type ConsoleRig = {
  console: Group;
  body: Group;
  screen: Group;
  leftJoycon: Group;
  rightJoycon: Group;
  dockFront: Group;
  dockBack: Group;
  led: Group;
  anchors: Record<AnchorId, Object3D>;
  look: { target: Look; current: Look };
};

const named = <T extends Object3D>(object: T, name: string): T => {
  object.name = name;
  return object;
};

const anchorIds = ['desk', 'dockSlot', 'hand', 'viewCentre', 'leftHand', 'rightHand', 'rails'] as const satisfies readonly AnchorId[];

export function createRig(): ConsoleRig {
  const anchors = Object.fromEntries(anchorIds.map((id) => [id, named(new Object3D(), `anchor:${id}`)])) as Record<AnchorId, Object3D>;
  const consoleGroup = named(new Group(), 'console');
  consoleGroup.userData = tag('switch');
  consoleGroup.add(anchors.rails);
  return {
    console: consoleGroup,
    body: named(new Group(), 'body'),
    screen: named(new Group(), 'screen'),
    leftJoycon: named(new Group(), 'leftJoycon'),
    rightJoycon: named(new Group(), 'rightJoycon'),
    dockFront: named(new Group(), 'dockFront'),
    dockBack: named(new Group(), 'dockBack'),
    led: named(new Group(), 'led'),
    anchors,
    look: { target: { ...neutralLook }, current: { ...neutralLook } },
  };
}

export function applyPose(rig: ConsoleRig, state: ConsoleState): void {
  const statePose: StatePose = poses[state];
  for (const part of parts) {
    const { anchor, position, rotation } = statePose[part];
    const object = rig[part];
    rig.anchors[anchor].add(object);
    object.position.set(...position);
    object.rotation.set(...rotation);
  }
  if (statePose.camera === 'neutral') {
    Object.assign(rig.look.target, neutralLook);
    Object.assign(rig.look.current, neutralLook);
  }
}
