import { describe, expect, it } from 'vitest';
import { toScreen } from './homeLayout';

describe('toScreen', () => {
  it('keeps left-anchored points their reference distance from the left edge', () => {
    expect(toScreen('left', [142, 462], 1600)).toEqual([-658, -12]);
  });

  it('keeps right-anchored points their reference distance from the right edge', () => {
    expect(toScreen('right', [1288, 452], 1600)).toEqual([648, -2]);
  });

  it('keeps centred points their reference offset from the centre', () => {
    expect(toScreen('centre', [720, 262], 1600)).toEqual([0, 188]);
  });

  it('spreads points in proportion to the wider screen', () => {
    expect(toScreen('spread', [1080, 900], 1600)).toEqual([400, -450]);
  });
});
