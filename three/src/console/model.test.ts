import { describe, expect, it } from 'vitest';
import { available, initialModel, reduce, type ConsoleEvent, type ConsoleModel } from './model';

const settled = (state: 'onDesk' | 'pickedUp' | 'focused' | 'docked'): ConsoleModel => ({
  phase: { kind: 'settled', state },
  menu: 'home',
  joycons: 'grey',
});

const finish = (model: ConsoleModel): ConsoleModel => {
  if (model.phase.kind !== 'transitioning') throw new Error('finish: model is not transitioning');
  return reduce(model, { type: 'transitionDone', edge: model.phase.edge });
};

const run = (model: ConsoleModel, ...steps: (ConsoleEvent | 'done')[]) =>
  steps.reduce((current, step) => (step === 'done' ? finish(current) : reduce(current, step)), model);

describe('reduce: commands', () => {
  it('starts settled on the desk, home menu, grey Joy-Cons', () => {
    expect(initialModel).toEqual({
      phase: { kind: 'settled', state: 'onDesk' },
      menu: 'home',
      joycons: 'grey',
    });
  });

  it.each([
    ['onDesk', 'pickUp', 'pickedUp'],
    ['pickedUp', 'focus', 'focused'],
    ['pickedUp', 'dock', 'docked'],
    ['focused', 'unfocus', 'pickedUp'],
    ['focused', 'dock', 'docked'],
    ['docked', 'undock', 'onDesk'],
  ] as const)('%s --%s--> transitioning, then settles in %s', (from, via, to) => {
    const moving = reduce(settled(from), { type: 'command', command: via });
    expect(moving).toEqual({
      phase: { kind: 'transitioning', edge: { from, via, to } },
      menu: 'home',
      joycons: 'grey',
    });
    expect(finish(moving)).toEqual(settled(to));
  });

  it.each([
    ['onDesk', ['focus', 'unfocus', 'dock', 'undock']],
    ['pickedUp', ['pickUp', 'unfocus', 'undock']],
    ['focused', ['pickUp', 'focus', 'undock']],
    ['docked', ['pickUp', 'focus', 'unfocus', 'dock']],
  ] as const)('ignores commands with no edge out of %s', (state, illegal) => {
    const model = settled(state);
    for (const command of illegal) {
      expect(reduce(model, { type: 'command', command })).toBe(model);
    }
  });

  it('ignores every command and menu press while transitioning, then settles at the edge target', () => {
    const moving = reduce(settled('pickedUp'), { type: 'command', command: 'focus' });
    const ignored: ConsoleEvent[] = [
      { type: 'command', command: 'unfocus' },
      { type: 'command', command: 'dock' },
      { type: 'command', command: 'focus' },
      { type: 'menu', button: 'a' },
      { type: 'menu', button: 'down' },
    ];
    for (const event of ignored) {
      expect(reduce(moving, event)).toBe(moving);
    }
    expect(run(moving, ...ignored, 'done')).toEqual(settled('focused'));
  });

  it('ignores transitionDone when already settled', () => {
    const model = settled('docked');
    expect(reduce(model, { type: 'transitionDone', edge: { from: 'pickedUp', via: 'dock', to: 'docked' } })).toBe(model);
  });

  it('ignores a duplicate completion once the edge has settled', () => {
    const moving = reduce(settled('pickedUp'), { type: 'command', command: 'dock' });
    if (moving.phase.kind !== 'transitioning') throw new Error('expected a transition');
    const done: ConsoleEvent = { type: 'transitionDone', edge: moving.phase.edge };
    const once = reduce(moving, done);
    expect(once).toEqual(settled('docked'));
    expect(reduce(once, done)).toBe(once);
  });

  it('ignores a stale completion from a different edge and stays transitioning', () => {
    const moving = reduce(settled('focused'), { type: 'command', command: 'unfocus' });
    const stale: ConsoleEvent = { type: 'transitionDone', edge: { from: 'pickedUp', via: 'focus', to: 'focused' } };
    expect(reduce(moving, stale)).toBe(moving);
    expect(moving.phase).toEqual({ kind: 'transitioning', edge: { from: 'focused', via: 'unfocus', to: 'pickedUp' } });
  });

  it('ignores a stale completion from an earlier run of the same edge', () => {
    const first = reduce(settled('pickedUp'), { type: 'command', command: 'focus' });
    if (first.phase.kind !== 'transitioning') throw new Error('expected a transition');
    const staleDone: ConsoleEvent = { type: 'transitionDone', edge: first.phase.edge };
    const again = run(first, 'done', { type: 'command', command: 'unfocus' }, 'done', { type: 'command', command: 'focus' });
    expect(again.phase).toEqual({ kind: 'transitioning', edge: { from: 'pickedUp', via: 'focus', to: 'focused' } });
    expect(reduce(again, staleDone)).toBe(again);
    expect(finish(again)).toEqual(settled('focused'));
  });

  it('walks the full tour from the desk to the dock and back', () => {
    const done = 'done';
    const end = run(
      initialModel,
      { type: 'command', command: 'pickUp' },
      done,
      { type: 'command', command: 'focus' },
      done,
      { type: 'command', command: 'unfocus' },
      done,
      { type: 'command', command: 'focus' },
      done,
      { type: 'command', command: 'dock' },
      done,
      { type: 'command', command: 'undock' },
      done,
    );
    expect(end).toEqual(settled('onDesk'));
  });
});

describe('reduce: menu', () => {
  it('up and down flip between home and work when focused', () => {
    const focused = settled('focused');
    expect(reduce(focused, { type: 'menu', button: 'down' })).toEqual({ ...focused, menu: 'work' });
    expect(reduce(focused, { type: 'menu', button: 'up' })).toEqual({ ...focused, menu: 'work' });
    expect(
      run(focused, { type: 'menu', button: 'down' }, { type: 'menu', button: 'up' }),
    ).toEqual({ ...focused, menu: 'home' });
  });

  it('A cycles grey, neon, gold, grey when focused', () => {
    const a: ConsoleEvent = { type: 'menu', button: 'a' };
    const focused = settled('focused');
    expect(run(focused, a)).toEqual({ ...focused, joycons: 'neon' });
    expect(run(focused, a, a)).toEqual({ ...focused, joycons: 'gold' });
    expect(run(focused, a, a, a)).toEqual({ ...focused, joycons: 'grey' });
  });

  it('B does nothing on either page', () => {
    const home = settled('focused');
    const work = { ...home, menu: 'work' as const };
    expect(reduce(home, { type: 'menu', button: 'b' })).toBe(home);
    expect(reduce(work, { type: 'menu', button: 'b' })).toBe(work);
  });

  it.each(['onDesk', 'pickedUp', 'docked'] as const)('ignores menu presses when settled in %s', (state) => {
    const model = settled(state);
    for (const button of ['up', 'down', 'a', 'b'] as const) {
      expect(reduce(model, { type: 'menu', button })).toBe(model);
    }
  });

  it('keeps menu page and Joy-Con set across a dock and undock', () => {
    const a: ConsoleEvent = { type: 'menu', button: 'a' };
    const done = 'done';
    const end = run(
      settled('focused'),
      a,
      { type: 'menu', button: 'down' },
      { type: 'command', command: 'dock' },
      done,
      { type: 'command', command: 'undock' },
      done,
    );
    expect(end).toEqual({ phase: { kind: 'settled', state: 'onDesk' }, menu: 'work', joycons: 'neon' });
  });
});

describe('available', () => {
  it.each([
    ['onDesk', [{ type: 'command', command: 'pickUp' }]],
    [
      'pickedUp',
      [
        { type: 'command', command: 'focus' },
        { type: 'command', command: 'dock' },
      ],
    ],
    [
      'focused',
      [
        { type: 'menu', button: 'up' },
        { type: 'menu', button: 'down' },
        { type: 'menu', button: 'a' },
        { type: 'command', command: 'unfocus' },
        { type: 'command', command: 'dock' },
      ],
    ],
    ['docked', [{ type: 'command', command: 'undock' }]],
  ] as const)('offers the inputs that act when settled in %s', (state, expected) => {
    expect(available(settled(state))).toEqual(expected);
  });

  it('offers nothing while transitioning and pickUp again once back on the desk', () => {
    const moving = reduce(settled('docked'), { type: 'command', command: 'undock' });
    expect(available(moving)).toEqual([]);
    expect(available(finish(moving))).toEqual([
      { type: 'command', command: 'pickUp' },
    ]);
  });

  it.each([
    ['onDesk', [{ phase: { kind: 'transitioning', edge: { from: 'onDesk', via: 'pickUp', to: 'pickedUp' } } }]],
    [
      'pickedUp',
      [
        { phase: { kind: 'transitioning', edge: { from: 'pickedUp', via: 'focus', to: 'focused' } } },
        { phase: { kind: 'transitioning', edge: { from: 'pickedUp', via: 'dock', to: 'docked' } } },
      ],
    ],
    [
      'focused',
      [
        { menu: 'work' },
        { menu: 'work' },
        { joycons: 'neon' },
        { phase: { kind: 'transitioning', edge: { from: 'focused', via: 'unfocus', to: 'pickedUp' } } },
        { phase: { kind: 'transitioning', edge: { from: 'focused', via: 'dock', to: 'docked' } } },
      ],
    ],
    ['docked', [{ phase: { kind: 'transitioning', edge: { from: 'docked', via: 'undock', to: 'onDesk' } } }]],
  ] as const)('each input offered in %s acts there', (state, changes) => {
    const model = settled(state);
    expect(available(model).map((input) => reduce(model, input))).toEqual(
      changes.map((change) => ({ ...model, ...change })),
    );
  });
});
