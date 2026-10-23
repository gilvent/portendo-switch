import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector2, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import type { ConsoleState } from '../console/model';
import type { ClickTarget } from './bindings';
import { findTagged, pickInput, tag } from './picking';

const centre = new Vector2(0, 0);

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
  const parts = { console: switchGroup, leftJoycon: new Group(), rightJoycon: new Group() };
  const camera = new PerspectiveCamera(50, 1, 0.01, 10);
  scene.add(camera);
  const add = (parent: Object3D, object: Object3D) => {
    parent.add(object);
    scene.updateMatrixWorld(true);
  };
  scene.updateMatrixWorld(true);
  const pick = (state: ConsoleState, ndc = centre) => pickInput(state, scene, camera, ndc, parts);
  return { scene, camera, switchGroup, parts, add, pick };
};

const holdConsole = () => {
  const w = world();
  w.add(w.camera, w.switchGroup);
  w.switchGroup.position.z = 0.7;
  w.add(w.scene, box(-0.8, 'dock'));
  w.switchGroup.clear();
  return w;
};

describe('pickInput', () => {
  it('acts on the nearest target the state binds, walking out from the hit mesh', () => {
    const { pick } = world();
    expect(pick('focused')).toEqual({ type: 'menu', button: 'a' });
    expect(pick('onDesk')).toEqual({ type: 'command', command: 'pickUp' });
  });

  it('lets untagged scenery in front block the click', () => {
    const { scene, add, pick } = world();
    add(scene, box(-0.5));
    expect(pick('onDesk')).toBeUndefined();
  });

  it('lets a scene object the state does not bind block the click', () => {
    const { scene, add, pick } = world();
    add(scene, box(-0.5, 'dock'));
    expect(pick('onDesk')).toBeUndefined();
  });

  it('passes a click through a docked Joy-Con to the dock behind it', () => {
    const { scene, camera, parts, add, pick } = world();
    parts.leftJoycon.add(box(-0.3, 'button:up'));
    add(camera, parts.leftJoycon);
    add(scene, box(-0.8, 'dock'));
    expect(pick('docked')).toEqual({ type: 'command', command: 'undock' });
  });

  it('lets the held console block the dock behind it', () => {
    const { switchGroup, add, pick } = holdConsole();
    add(switchGroup, box(-1));
    expect(pick('pickedUp')).toBeUndefined();
    expect(pick('focused')).toBeUndefined();
  });

  it('lets the held console screen block the dock behind it', () => {
    const { switchGroup, add, pick } = holdConsole();
    add(switchGroup, box(-1, 'switchScreen'));
    expect(pick('pickedUp')).toEqual({ type: 'command', command: 'focus' });
    expect(pick('focused')).toBeUndefined();
  });

  it('lets a Joy-Con attached to the held console block the dock behind it', () => {
    const { switchGroup, parts, add, pick } = holdConsole();
    parts.leftJoycon.add(box(-1, 'button:up'));
    add(switchGroup, parts.leftJoycon);
    expect(pick('pickedUp')).toBeUndefined();
    expect(pick('focused')).toEqual({ type: 'menu', button: 'up' });
  });

  it('lets an untagged camera-held object block the click', () => {
    const { scene, camera, add, pick } = world();
    add(camera, box(-0.3));
    add(scene, box(-0.8, 'dock'));
    expect(pick('pickedUp')).toBeUndefined();
  });

  it('acts on a camera-held part when the state binds it', () => {
    const { scene, camera, add, pick } = world();
    add(camera, box(-0.3, 'button:b'));
    add(scene, box(-0.8, 'dock'));
    expect(pick('focused')).toEqual({ type: 'menu', button: 'b' });
  });

  it('does nothing when the ray misses', () => {
    const { pick } = world();
    expect(pick('onDesk', new Vector2(0.9, 0.9))).toBeUndefined();
  });
});

describe('findTagged', () => {
  it('finds the tagged object and fails by name when none is visible', () => {
    const { scene, switchGroup } = world();
    expect(findTagged(scene, 'switch')).toBe(switchGroup);
    expect(() => findTagged(scene, 'dock')).toThrow('findTagged: no visible object is tagged dock');
  });
});
