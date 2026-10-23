import { describe, expect, it } from 'vitest';
import { lookMode, poses } from './poses';

const anchorsOf = (state: keyof typeof poses) => {
  const { console, leftJoycon, rightJoycon, camera } = poses[state];
  return { console: console.anchor, leftJoycon: leftJoycon.anchor, rightJoycon: rightJoycon.anchor, camera };
};

describe('poses', () => {
  it('places every part of every state on its anchor, with the camera mode', () => {
    expect(Object.keys(poses).sort()).toEqual(['docked', 'focused', 'onDesk', 'pickedUp']);
    expect(anchorsOf('onDesk')).toEqual({ console: 'desk', leftJoycon: 'rails', rightJoycon: 'rails', camera: 'neutral' });
    expect(anchorsOf('pickedUp')).toEqual({ console: 'hand', leftJoycon: 'rails', rightJoycon: 'rails', camera: 'free' });
    expect(anchorsOf('focused')).toEqual({ console: 'viewCentre', leftJoycon: 'rails', rightJoycon: 'rails', camera: 'locked' });
    expect(anchorsOf('docked')).toEqual({ console: 'dockSlot', leftJoycon: 'leftHand', rightJoycon: 'rightHand', camera: 'neutral' });
  });

  it('mounts the Joy-Cons on opposite sides of the rails', () => {
    expect(poses.onDesk.leftJoycon.position).toEqual([-0.0865, 0, 0]);
    expect(poses.onDesk.rightJoycon.position).toEqual([0.0865, 0, 0]);
  });
});

describe('signals', () => {
  it('keeps the Switch screen on, the LED off and the TV on its home screen until the console docks', () => {
    expect(Object.fromEntries(Object.entries(poses).map(([state, pose]) => [state, pose.signals]))).toEqual({
      onDesk: { screenPower: 1, ledPower: 0, tvInput: 'home' },
      pickedUp: { screenPower: 1, ledPower: 0, tvInput: 'home' },
      focused: { screenPower: 1, ledPower: 0, tvInput: 'home' },
      docked: { screenPower: 0, ledPower: 1, tvInput: 'console' },
    });
  });
});

describe('lookMode', () => {
  it('locks the look only while focused', () => {
    expect(lookMode('onDesk')).toBe('free');
    expect(lookMode('pickedUp')).toBe('free');
    expect(lookMode('focused')).toBe('locked');
    expect(lookMode('docked')).toBe('free');
  });
});
