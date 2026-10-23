import { Box3, Raycaster, Vector2, Vector3, type Camera, type Object3D } from 'three';
import type { ConsoleState, UserInput } from '../console/model';
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

function heldBy(camera: Camera, object: Object3D): boolean {
  for (let current: Object3D | null = object; current !== null; current = current.parent) {
    if (current === camera) return true;
  }
  return false;
}

export function pickInput(state: ConsoleState, scene: Object3D, camera: Camera, ndc: Vector2): UserInput | undefined {
  raycaster.setFromCamera(ndc, camera);
  for (const hit of raycaster.intersectObject(scene, true)) {
    const input = clickInput(state, targetsAlong(hit.object));
    if (input !== undefined) return input;
    if (!heldBy(camera, hit.object)) return undefined;
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
