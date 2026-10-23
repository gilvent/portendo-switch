import type { ConsoleState, MenuButton, UserInput } from '../console/model';

export const keyBindings = {
  e: { type: 'command', command: 'pickUp' },
  f: { type: 'command', command: 'focus' },
  d: { type: 'command', command: 'dock' },
  Escape: { type: 'command', command: 'unfocus' },
  u: { type: 'command', command: 'undock' },
  ArrowUp: { type: 'menu', button: 'up' },
  ArrowDown: { type: 'menu', button: 'down' },
  a: { type: 'menu', button: 'a' },
  b: { type: 'menu', button: 'b' },
} as const satisfies Record<string, UserInput>;

export type BoundKey = keyof typeof keyBindings;

export function keyInput(key: string): UserInput | undefined {
  const normalized = key.length === 1 ? key.toLowerCase() : key;
  return Object.hasOwn(keyBindings, normalized) ? keyBindings[normalized as BoundKey] : undefined;
}

export function keysFor(input: UserInput): BoundKey[] {
  return (Object.keys(keyBindings) as BoundKey[]).filter((key) => sameInput(keyBindings[key], input));
}

function sameInput(a: UserInput, b: UserInput): boolean {
  if (a.type === 'command') return b.type === 'command' && a.command === b.command;
  return b.type === 'menu' && a.button === b.button;
}

export type ClickTarget = 'switch' | 'switchScreen' | 'dock' | `button:${MenuButton}`;

export const clickBindings: { [S in ConsoleState]: Partial<Record<ClickTarget, UserInput>> } = {
  onDesk: {
    switch: { type: 'command', command: 'pickUp' },
    switchScreen: { type: 'command', command: 'pickUp' },
  },
  pickedUp: {
    switchScreen: { type: 'command', command: 'focus' },
    dock: { type: 'command', command: 'dock' },
  },
  focused: {
    'button:up': { type: 'menu', button: 'up' },
    'button:down': { type: 'menu', button: 'down' },
    'button:a': { type: 'menu', button: 'a' },
    'button:b': { type: 'menu', button: 'b' },
    dock: { type: 'command', command: 'dock' },
  },
  docked: {
    switch: { type: 'command', command: 'undock' },
    switchScreen: { type: 'command', command: 'undock' },
    dock: { type: 'command', command: 'undock' },
  },
};

export function clickInput(state: ConsoleState, targets: readonly ClickTarget[]): UserInput | undefined {
  const bound = clickBindings[state];
  for (const target of targets) {
    const input = bound[target];
    if (input !== undefined) return input;
  }
  return undefined;
}
