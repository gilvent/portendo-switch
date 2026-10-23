import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector2, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import type { ClickTarget } from './bindings';
import { findTagged, pickInput, tag } from './picking';

const box = (z: number, target?: ClickTarget) => {
  const mesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.01), new MeshBasicMaterial());
  mesh.position.z = z;
  if (target !== undefined) mesh.userData = tag(target);
  return mesh;
};

const world = () => {
  const scene = new Scene();
  const switchGroup = new Group();
  switchGroup.userData = tag('switch');
  switchGroup.add(box(-1, 'button:a'));
  scene.add(switchGroup);
  const camera = new PerspectiveCamera(50, 1, 0.01, 10);
  scene.add(camera);
  const add = (parent: Object3D, object: Object3D) => {
    parent.add(object);
    scene.updateMatrixWorld(true);
  };
  scene.updateMatrixWorld(true);
  return { scene, camera, switchGroup, add };
};

const centre = new Vector2(0, 0);

describe('pickInput', () => {
  it('acts on the nearest target the state binds, walking out from the hit mesh', () => {
    const { scene, camera } = world();
    expect(pickInput('focused', scene, camera, centre)).toEqual({ type: 'menu', button: 'a' });
    expect(pickInput('onDesk', scene, camera, centre)).toEqual({ type: 'command', command: 'pickUp' });
  });

  it('lets untagged scenery in front block the click', () => {
    const { scene, camera, add } = world();
    add(scene, box(-0.5));
    expect(pickInput('onDesk', scene, camera, centre)).toBeUndefined();
  });

  it('lets a scene object the state does not bind block the click', () => {
    const { scene, camera, add } = world();
    add(scene, box(-0.5, 'dock'));
    expect(pickInput('onDesk', scene, camera, centre)).toBeUndefined();
  });

  it('passes a click through a camera-held part the state binds nothing on', () => {
    const { scene, camera, add } = world();
    const heldJoycon = box(-0.3, 'button:up');
    add(camera, heldJoycon);
    add(scene, box(-0.8, 'dock'));
    expect(pickInput('docked', scene, camera, centre)).toEqual({ type: 'command', command: 'undock' });
  });

  it('passes a click through an untagged camera-held part', () => {
    const { scene, camera, add } = world();
    add(camera, box(-0.3));
    add(scene, box(-0.8, 'dock'));
    expect(pickInput('pickedUp', scene, camera, centre)).toEqual({ type: 'command', command: 'dock' });
  });

  it('acts on a camera-held part when the state binds it', () => {
    const { scene, camera, add } = world();
    add(camera, box(-0.3, 'button:b'));
    add(scene, box(-0.8, 'dock'));
    expect(pickInput('focused', scene, camera, centre)).toEqual({ type: 'menu', button: 'b' });
  });

  it('does nothing when the ray misses', () => {
    const { scene, camera } = world();
    expect(pickInput('onDesk', scene, camera, new Vector2(0.9, 0.9))).toBeUndefined();
  });
});

describe('findTagged', () => {
  it('finds the tagged object and fails by name when none is visible', () => {
    const { scene, switchGroup } = world();
    expect(findTagged(scene, 'switch')).toBe(switchGroup);
    expect(() => findTagged(scene, 'dock')).toThrow('findTagged: no visible object is tagged dock');
  });
});
