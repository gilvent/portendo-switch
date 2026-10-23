import { describe, expect, it } from 'vitest';
import { idleGesture, stepGesture, type Gesture, type GestureEffect, type PointerSample } from './gesture';

const run = (samples: PointerSample[]) => {
  let gesture: Gesture = idleGesture;
  const effects: GestureEffect[] = [];
  for (const sample of samples) {
    const step = stepGesture(gesture, sample);
    gesture = step.gesture;
    if (step.effect) effects.push(step.effect);
  }
  return { gesture, effects };
};

const down = (x: number, y: number, pointerId = 1): PointerSample => ({ type: 'down', pointerId, x, y });
const move = (x: number, y: number, pointerId = 1): PointerSample => ({ type: 'move', pointerId, x, y });
const up = (x: number, y: number, pointerId = 1): PointerSample => ({ type: 'up', pointerId, x, y });

describe('stepGesture', () => {
  it('turns a press that never moves into a click at the release point', () => {
    expect(run([down(100, 100), up(100, 100)])).toEqual({ gesture: idleGesture, effects: [{ type: 'click', x: 100, y: 100 }] });
  });

  it('still clicks when the press wanders 4px', () => {
    expect(run([down(100, 100), move(103, 102), up(103, 102)]).effects).toEqual([{ type: 'click', x: 103, y: 102 }]);
  });

  it('turns a 5px move into a look drag that carries the whole travel, then never clicks', () => {
    expect(run([down(100, 100), move(103, 104), move(110, 104), up(110, 104)]).effects).toEqual([
      { type: 'look', dx: 3, dy: 4 },
      { type: 'look', dx: 7, dy: 0 },
    ]);
  });

  it('does not click when the press comes back to its start after dragging', () => {
    expect(run([down(100, 100), move(120, 100), move(100, 100), up(100, 100)]).effects).toEqual([
      { type: 'look', dx: 20, dy: 0 },
      { type: 'look', dx: -20, dy: 0 },
    ]);
  });

  it('ignores a second finger and a cancel ends the gesture without a click', () => {
    expect(run([down(100, 100, 1), down(300, 300, 2), move(310, 300, 2), up(300, 300, 2), up(100, 100, 1)]).effects).toEqual([
      { type: 'click', x: 100, y: 100 },
    ]);
    expect(run([down(100, 100), { type: 'cancel', pointerId: 1, x: 100, y: 100 }, up(100, 100)]).effects).toEqual([]);
  });
});
