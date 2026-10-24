import { describe, expect, it } from 'vitest';
import { poses, type Part } from '../rig/poses';
import { idlePlacement } from './useIdles';

const parts: Part[] = ['console', 'leftJoycon', 'rightJoycon'];
const millimetres = (n: number) => Math.round(n * 1e4) / 10;

describe('idlePlacement', () => {
  it('idles the held console and the docked Joy-Cons only', () => {
    const idling = (state: keyof typeof poses) => parts.filter((part) => idlePlacement(state, part, 2) !== null);
    expect({ onDesk: idling('onDesk'), pickedUp: idling('pickedUp'), focused: idling('focused'), docked: idling('docked') }).toEqual({
      onDesk: [],
      pickedUp: ['console'],
      focused: [],
      docked: ['leftJoycon', 'rightJoycon'],
    });
  });

  it('starts exactly on the pose at the moment of settling, so nothing jumps when a timeline hands over', () => {
    const { anchor, position, rotation } = poses.pickedUp.console;
    expect(idlePlacement('pickedUp', 'console', 0)).toEqual({ anchor, position, rotation });
    expect(idlePlacement('docked', 'leftJoycon', 0)).toEqual({ anchor: 'leftHand', position: [0, 0, 0], rotation: [0.2, 0.25, 0.26] });
  });

  it('bobs the held console by a few millimetres once the amplitude has eased in', () => {
    const heights = Array.from({ length: 64 }, (_, i) => idlePlacement('pickedUp', 'console', 1 + i * 0.05)?.position[1] ?? NaN);
    expect({ highest: millimetres(Math.max(...heights)), lowest: millimetres(Math.min(...heights)) }).toEqual({ highest: 3, lowest: -3 });
  });

  it('breathes the left and right Joy-Cons out of phase', () => {
    const rise = (part: Part) => millimetres(idlePlacement('docked', part, 4.5)?.position[1] ?? NaN);
    expect({ left: rise('leftJoycon'), right: rise('rightJoycon') }).toEqual({ left: 4, right: -4 });
  });
});
