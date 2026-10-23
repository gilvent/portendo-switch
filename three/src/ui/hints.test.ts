import { describe, expect, it } from 'vitest';
import { available, type ConsoleState } from '../console/model';
import { hintsFor } from './hints';

const labelsIn = (state: ConsoleState) =>
  hintsFor(available({ phase: { kind: 'settled', state }, menu: 'home', joycons: 'grey' })).map((hint) => ({
    label: hint.label,
    count: hint.inputs.length,
  }));

describe('hintsFor', () => {
  it.each([
    ['onDesk', [{ label: 'Pick up', count: 1 }]],
    [
      'pickedUp',
      [
        { label: 'Focus screen', count: 1 },
        { label: 'Dock', count: 1 },
      ],
    ],
    [
      'focused',
      [
        { label: 'Menu', count: 2 },
        { label: 'Colours', count: 1 },
        { label: 'Put down', count: 1 },
        { label: 'Dock', count: 1 },
      ],
    ],
    ['docked', [{ label: 'Undock', count: 1 }]],
  ] as const)('labels the inputs offered in %s, up and down sharing one Menu entry', (state, expected) => {
    expect(labelsIn(state)).toEqual(expected);
  });

  it('refuses to label B, which phase 1 never offers', () => {
    expect(() => hintsFor([{ type: 'menu', button: 'b' }])).toThrow('hints: B is never offered in phase 1');
  });
});
