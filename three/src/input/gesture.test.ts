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
const cancel = (pointerId: number): PointerSample => ({ type: 'cancel', pointerId, x: 0, y: 0 });

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

  it('cancels without a click when the press is cancelled', () => {
    expect(run([down(100, 100), cancel(1), up(100, 100)])).toEqual({ gesture: idleGesture, effects: [] });
  });

  it('cancels the gesture when a second finger goes down, so a pinch never looks or clicks', () => {
    expect(run([down(100, 100, 1), down(300, 300, 2), move(140, 100, 1), move(340, 300, 2), up(140, 100, 1), up(340, 300, 2)])).toEqual({
      gesture: idleGesture,
      effects: [],
    });
    expect(run([down(100, 100, 1), move(120, 100, 1), down(300, 300, 2), move(160, 100, 1), up(160, 100, 1)])).toEqual({
      gesture: idleGesture,
      effects: [{ type: 'look', dx: 20, dy: 0 }],
    });
  });

  it('starts a fresh press when the owning pointer goes down again after a lost release', () => {
    expect(run([down(100, 100), move(200, 100), move(250, 100), down(600, 400), up(600, 400)])).toEqual({
      gesture: idleGesture,
      effects: [
        { type: 'look', dx: 100, dy: 0 },
        { type: 'look', dx: 50, dy: 0 },
        { type: 'click', x: 600, y: 400 },
      ],
    });
  });

  it('clicks on the next touch after a delivered cancel', () => {
    expect(run([down(100, 100, 7), cancel(7), down(200, 200, 8), up(200, 200, 8)]).effects).toEqual([{ type: 'click', x: 200, y: 200 }]);
  });

  it('swallows the first tap after a lost touch release and clicks on the second', () => {
    expect(run([down(100, 100, 7), down(200, 200, 8), up(200, 200, 8)])).toEqual({ gesture: idleGesture, effects: [] });
    expect(run([down(100, 100, 7), down(200, 200, 8), up(200, 200, 8), down(300, 300, 9), up(300, 300, 9)]).effects).toEqual([
      { type: 'click', x: 300, y: 300 },
    ]);
  });
});
