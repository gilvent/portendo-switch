import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector2 } from 'three';
import { describe, expect, it } from 'vitest';
import { findTagged, pickTargets, tag } from './picking';

const box = (z: number) => {
  const mesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.01), new MeshBasicMaterial());
  mesh.position.z = z;
  return mesh;
};

const world = () => {
  const scene = new Scene();
  const switchGroup = new Group();
  switchGroup.userData = tag('switch');
  const button = box(-1);
  button.userData = tag('button:a');
  switchGroup.add(button);
  scene.add(switchGroup);
  const camera = new PerspectiveCamera(50, 1, 0.01, 10);
  scene.add(camera);
  scene.updateMatrixWorld(true);
  return { scene, camera, switchGroup };
};

describe('pickTargets', () => {
  it('names every target from the hit mesh up to the root, nearest first', () => {
    const { scene, camera } = world();
    expect(pickTargets(scene, camera, new Vector2(0, 0))).toEqual(['button:a', 'switch']);
  });

  it('lets an untagged mesh in front block the click', () => {
    const { scene, camera } = world();
    scene.add(box(-0.5));
    scene.updateMatrixWorld(true);
    expect(pickTargets(scene, camera, new Vector2(0, 0))).toEqual([]);
  });

  it('hits nothing when the ray misses', () => {
    const { scene, camera } = world();
    expect(pickTargets(scene, camera, new Vector2(0.9, 0.9))).toEqual([]);
  });
});

describe('findTagged', () => {
  it('finds the tagged object and fails by name when none is visible', () => {
    const { scene, switchGroup } = world();
    expect(findTagged(scene, 'switch')).toBe(switchGroup);
    expect(() => findTagged(scene, 'dock')).toThrow('findTagged: no visible object is tagged dock');
  });
});
