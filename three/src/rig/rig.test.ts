import { describe, expect, it } from 'vitest';
import { applyPose, createRig, type ConsoleRig } from './rig';

const placement = (rig: ConsoleRig) => {
  const of = (part: 'console' | 'leftJoycon' | 'rightJoycon') => ({
    parent: rig[part].parent?.name,
    position: rig[part].position.toArray().map((n) => Number(n.toFixed(4))),
    rotation: rig[part].rotation.toArray().slice(0, 3).map((n) => Number((n as number).toFixed(2))),
  });
  return { console: of('console'), leftJoycon: of('leftJoycon'), rightJoycon: of('rightJoycon') };
};

describe('applyPose', () => {
  it('lays the Switch flat on the desk with the Joy-Cons on its rails', () => {
    const rig = createRig();
    applyPose(rig, 'onDesk');
    expect(placement(rig)).toEqual({
      console: { parent: 'anchor:desk', position: [0, 0.008, 0], rotation: [-1.57, 0, 0.18] },
      leftJoycon: { parent: 'anchor:rails', position: [-0.0865, 0, 0], rotation: [0, 0, 0] },
      rightJoycon: { parent: 'anchor:rails', position: [0.0865, 0, 0], rotation: [0, 0, 0] },
    });
  });

  it('seats the body in the dock and sends the Joy-Cons to the hands', () => {
    const rig = createRig();
    applyPose(rig, 'docked');
    expect(placement(rig)).toEqual({
      console: { parent: 'anchor:dockSlot', position: [0, 0.0535, 0], rotation: [0, 0, 0] },
      leftJoycon: { parent: 'anchor:leftHand', position: [0, 0, 0], rotation: [0.2, 0.25, 0.26] },
      rightJoycon: { parent: 'anchor:rightHand', position: [0, 0, 0], rotation: [0.2, -0.25, -0.26] },
    });
  });

  it('converges to the same placement however often and from wherever it runs', () => {
    const fresh = createRig();
    applyPose(fresh, 'focused');
    const travelled = createRig();
    applyPose(travelled, 'docked');
    applyPose(travelled, 'focused');
    applyPose(travelled, 'focused');
    expect(placement(travelled)).toEqual(placement(fresh));
    expect(travelled.anchors.leftHand.children).toEqual([]);
    expect(travelled.console.parent?.name).toBe('anchor:viewCentre');
  });

  it('returns the camera to neutral on the desk and in the dock, and keeps the look while held', () => {
    const rig = createRig();
    rig.look.target.yaw = 0.5;
    rig.look.current.yaw = 0.4;
    applyPose(rig, 'pickedUp');
    expect(rig.look).toEqual({ target: { yaw: 0.5, pitch: 0 }, current: { yaw: 0.4, pitch: 0 } });
    applyPose(rig, 'docked');
    expect(rig.look).toEqual({ target: { yaw: 0, pitch: 0 }, current: { yaw: 0, pitch: 0 } });
  });
});
