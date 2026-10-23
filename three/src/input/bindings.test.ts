import { describe, expect, it } from 'vitest';
import { available, reduce, type ConsoleModel, type ConsoleState, type Edge } from '../console/model';
import { clickBindings, clickInput, keyInput, keysFor, type ClickTarget } from './bindings';

const settled = (state: ConsoleState): ConsoleModel => ({
  phase: { kind: 'settled', state },
  menu: 'home',
  joycons: 'grey',
});

const states = ['onDesk', 'pickedUp', 'focused', 'docked'] as const;

describe('keyInput', () => {
  it.each([
    ['e', { type: 'command', command: 'pickUp' }],
    ['E', { type: 'command', command: 'pickUp' }],
    ['f', { type: 'command', command: 'focus' }],
    ['d', { type: 'command', command: 'dock' }],
    ['Escape', { type: 'command', command: 'unfocus' }],
    ['u', { type: 'command', command: 'undock' }],
    ['ArrowUp', { type: 'menu', button: 'up' }],
    ['ArrowDown', { type: 'menu', button: 'down' }],
    ['A', { type: 'menu', button: 'a' }],
    ['b', { type: 'menu', button: 'b' }],
  ] as const)('maps %s', (key, input) => {
    expect(keyInput(key)).toEqual(input);
  });

  it('maps nothing for unbound keys and object prototype names', () => {
    expect(keyInput('x')).toBeUndefined();
    expect(keyInput('toString')).toBeUndefined();
    expect(keyInput('e')).toEqual({ type: 'command', command: 'pickUp' });
  });

  it('pressing E on the desk starts the pick-up', () => {
    const picked = reduce(settled('onDesk'), keyInput('e')!);
    expect(picked.phase).toEqual({ kind: 'transitioning', edge: { from: 'onDesk', via: 'pickUp', to: 'pickedUp' } });
  });
});

describe('keysFor', () => {
  it('finds the chip keys for an input', () => {
    expect(keysFor({ type: 'command', command: 'unfocus' })).toEqual(['Escape']);
    expect(keysFor({ type: 'menu', button: 'down' })).toEqual(['ArrowDown']);
  });

  it.each([
    ['onDesk', [['e']]],
    ['pickedUp', [['f'], ['d']]],
    ['focused', [['ArrowUp'], ['ArrowDown'], ['a'], ['Escape'], ['d']]],
    ['docked', [['u']]],
  ] as const)('gives each input offered in %s exactly one key', (state, keys) => {
    expect(available(settled(state)).map(keysFor)).toEqual(keys);
  });
});

describe('clickBindings', () => {
  const unbound = 'unbound' as const;
  const moving = (edge: Edge): ConsoleModel => ({
    phase: { kind: 'transitioning', edge },
    menu: 'home',
    joycons: 'grey',
  });

  const expected: { [S in ConsoleState]: Record<ClickTarget, ConsoleModel | typeof unbound> } = {
    onDesk: {
      switch: moving({ from: 'onDesk', via: 'pickUp', to: 'pickedUp' }),
      switchScreen: moving({ from: 'onDesk', via: 'pickUp', to: 'pickedUp' }),
      dock: unbound,
      'button:up': unbound,
      'button:down': unbound,
      'button:a': unbound,
      'button:b': unbound,
    },
    pickedUp: {
      switch: unbound,
      switchScreen: moving({ from: 'pickedUp', via: 'focus', to: 'focused' }),
      dock: moving({ from: 'pickedUp', via: 'dock', to: 'docked' }),
      'button:up': unbound,
      'button:down': unbound,
      'button:a': unbound,
      'button:b': unbound,
    },
    focused: {
      switch: unbound,
      switchScreen: unbound,
      dock: moving({ from: 'focused', via: 'dock', to: 'docked' }),
      'button:up': { phase: { kind: 'settled', state: 'focused' }, menu: 'work', joycons: 'grey' },
      'button:down': { phase: { kind: 'settled', state: 'focused' }, menu: 'work', joycons: 'grey' },
      'button:a': { phase: { kind: 'settled', state: 'focused' }, menu: 'home', joycons: 'neon' },
      'button:b': { phase: { kind: 'settled', state: 'focused' }, menu: 'home', joycons: 'grey' },
    },
    docked: {
      switch: moving({ from: 'docked', via: 'undock', to: 'onDesk' }),
      switchScreen: moving({ from: 'docked', via: 'undock', to: 'onDesk' }),
      dock: moving({ from: 'docked', via: 'undock', to: 'onDesk' }),
      'button:up': unbound,
      'button:down': unbound,
      'button:a': unbound,
      'button:b': unbound,
    },
  };

  const rows = states.flatMap((state) =>
    Object.entries(expected[state]).map(([target, result]) => [state, target as ClickTarget, result] as const),
  );

  it.each(rows)('in %s, clicking %s gives the expected model', (state, target, result) => {
    const input = clickBindings[state][target];
    if (result === unbound) expect(input).toBeUndefined();
    else expect(reduce(settled(state), input!)).toEqual(result);
  });
});

describe('clickInput', () => {
  it('acts on the nearest target the state binds, walking out from the hit mesh', () => {
    expect(clickInput('onDesk', ['button:a', 'switch'])).toEqual({ type: 'command', command: 'pickUp' });
    expect(clickInput('focused', ['button:a', 'switch'])).toEqual({ type: 'menu', button: 'a' });
    expect(clickInput('pickedUp', ['switchScreen', 'switch'])).toEqual({ type: 'command', command: 'focus' });
  });

  it('does nothing when no target on the path is bound, or nothing was hit', () => {
    expect(clickInput('focused', ['switchScreen', 'switch'])).toBeUndefined();
    expect(clickInput('pickedUp', ['button:a', 'switch'])).toBeUndefined();
    expect(clickInput('onDesk', ['dock'])).toBeUndefined();
    expect(clickInput('docked', [])).toBeUndefined();
  });
});
