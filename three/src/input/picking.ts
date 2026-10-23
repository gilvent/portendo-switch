import { Box3, Raycaster, Vector2, Vector3, type Camera, type Object3D } from 'three';
import type { ConsoleState, UserInput } from '../console/model';
import { parts, poses, type Part } from '../rig/poses';
import { clickInput, type ClickTarget } from './bindings';

export function tag(target: ClickTarget): { clickTarget: ClickTarget } {
  return { clickTarget: target };
}

function targetOf(object: Object3D): ClickTarget | undefined {
  return (object.userData as { clickTarget?: ClickTarget }).clickTarget;
}

function targetsAlong(object: Object3D): ClickTarget[] {
  const targets: ClickTarget[] = [];
  for (let current: Object3D | null = object; current !== null; current = current.parent) {
    const target = targetOf(current);
    if (target !== undefined) targets.push(target);
  }
  return targets;
}

const raycaster = new Raycaster();

function partOf(object: Object3D, rigParts: Readonly<Record<Part, Object3D>>): Part | undefined {
  for (let current: Object3D | null = object; current !== null; current = current.parent) {
    const part = parts.find((id) => rigParts[id] === current);
    if (part !== undefined) return part;
  }
  return undefined;
}

export function pickInput(
  state: ConsoleState,
  scene: Object3D,
  camera: Camera,
  ndc: Vector2,
  rigParts: Readonly<Record<Part, Object3D>>,
): UserInput | undefined {
  raycaster.setFromCamera(ndc, camera);
  for (const hit of raycaster.intersectObject(scene, true)) {
    const input = clickInput(state, targetsAlong(hit.object));
    if (input !== undefined) return input;
    const part = partOf(hit.object, rigParts);
    if (part === undefined || !poses[state][part].clickThrough) return undefined;
  }
  return undefined;
}

export function findTagged(scene: Object3D, target: ClickTarget): Object3D {
  let found: Object3D | undefined;
  scene.traverseVisible((object) => {
    if (found === undefined && targetOf(object) === target) found = object;
  });
  if (found === undefined) throw new Error(`findTagged: no visible object is tagged ${target}`);
  return found;
}

export function worldCentre(object: Object3D): Vector3 {
  return new Box3().setFromObject(object).getCenter(new Vector3());
}
