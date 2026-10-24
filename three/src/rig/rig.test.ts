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

  it('powers the screen down, lights the LED and switches the TV to the console in the dock, and back on undock', () => {
    const rig = createRig();
    const signals = () => ({ screen: rig.screenPower.value, led: rig.ledPower.value, tvMix: rig.tvInput.mix });
    applyPose(rig, 'focused');
    expect(signals()).toEqual({ screen: 1, led: 0, tvMix: 0 });
    applyPose(rig, 'docked');
    expect(signals()).toEqual({ screen: 0, led: 1, tvMix: 1 });
    applyPose(rig, 'onDesk');
    expect(signals()).toEqual({ screen: 1, led: 0, tvMix: 0 });
  });

  it('snaps every scale, fixture transform and signal back to the destination after a tween left them anywhere', () => {
    const rig = createRig();
    applyPose(rig, 'focused');
    for (const object of [rig.console, rig.leftJoycon, rig.rightJoycon, rig.body, rig.screen, rig.dockFront, rig.dockBack, rig.led]) {
      object.position.set(0.3, -0.2, 0.1);
      object.rotation.set(0.4, 0.5, 0.6);
      object.scale.set(0.8, 1.3, 0.9);
    }
    rig.screenPower.value = 0.37;
    rig.ledPower.value = 0.61;
    rig.tvInput.mix = 0.52;
    applyPose(rig, 'docked');
    const transform = (object: ConsoleRig['body']) => ({
      position: object.position.toArray().map((n) => Number(n.toFixed(4))),
      rotation: object.rotation.toArray().slice(0, 3).map((n) => Number((n as number).toFixed(2))),
      scale: object.scale.toArray(),
    });
    const rest = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
    expect({
      console: transform(rig.console),
      leftJoycon: transform(rig.leftJoycon),
      body: transform(rig.body),
      screen: transform(rig.screen),
      dockFront: transform(rig.dockFront),
      dockBack: transform(rig.dockBack),
      led: transform(rig.led),
      signals: { screen: rig.screenPower.value, led: rig.ledPower.value, tvMix: rig.tvInput.mix },
    }).toEqual({
      console: { position: [0, 0.0535, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      leftJoycon: { position: [0, 0, 0], rotation: [0.2, 0.25, 0.26], scale: [1, 1, 1] },
      body: rest,
      screen: rest,
      dockFront: rest,
      dockBack: rest,
      led: rest,
      signals: { screen: 0, led: 1, tvMix: 1 },
    });
  });
});
