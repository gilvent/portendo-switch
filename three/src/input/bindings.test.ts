import { describe, expect, it } from 'vitest';
import { available, reduce, type ConsoleModel, type ConsoleState } from '../console/model';
import { clickBindings, keyInput, keysFor } from './bindings';

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

  it.each(states)('every input offered in %s has a key', (state) => {
    for (const input of available(settled(state))) {
      expect(keysFor(input), JSON.stringify(input)).toHaveLength(1);
    }
  });
});

describe('clickBindings', () => {
  it('clicking the Switch on the desk picks it up', () => {
    expect(reduce(settled('onDesk'), clickBindings.onDesk.switch!).phase).toEqual({
      kind: 'transitioning',
      edge: { from: 'onDesk', via: 'pickUp', to: 'pickedUp' },
    });
  });

  it('clicking the dock while held docks, clicking A while focused cycles colours', () => {
    expect(reduce(settled('pickedUp'), clickBindings.pickedUp.dock!).phase).toEqual({
      kind: 'transitioning',
      edge: { from: 'pickedUp', via: 'dock', to: 'docked' },
    });
    expect(reduce(settled('focused'), clickBindings.focused['button:a']!).joycons).toBe('neon');
  });

  it.each(states)('every click bound in %s acts there, except the B button', (state) => {
    const model = settled(state);
    for (const [target, input] of Object.entries(clickBindings[state])) {
      const next = reduce(model, input);
      if (target === 'button:b') expect(next, target).toBe(model);
      else expect(next, target).not.toEqual(model);
    }
  });
});
