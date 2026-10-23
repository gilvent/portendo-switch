import { useConsole } from '../console/ConsoleProvider';
import { available, look, type Command, type ConsoleState, type UserInput } from '../console/model';
import type { BoundKey } from '../input/bindings';

export type Hint = { label: string; inputs: [UserInput, ...UserInput[]] };

const commandLabels: Record<Command, string> = {
  pickUp: 'Pick up',
  focus: 'Focus screen',
  unfocus: 'Put down',
  dock: 'Dock',
  undock: 'Undock',
};

const menuLabels = { up: 'Menu', down: 'Menu', a: 'Colours' } as const;

function labelFor(input: UserInput): string {
  if (input.type === 'command') return commandLabels[input.command];
  if (input.button === 'b') throw new Error('hints: B is never offered in phase 1, so it has no label');
  return menuLabels[input.button];
}

export function hintsFor(inputs: UserInput[]): Hint[] {
  const hints: Hint[] = [];
  for (const input of inputs) {
    const label = labelFor(input);
    const last = hints.at(-1);
    if (last?.label === label) last.inputs.push(input);
    else hints.push({ label, inputs: [input] });
  }
  return hints;
}

const keyGlyphs: Partial<Record<BoundKey, string>> = { Escape: 'Esc', ArrowUp: '↑', ArrowDown: '↓' };

export function keyGlyph(key: BoundKey): string {
  return keyGlyphs[key] ?? key.toUpperCase();
}

export function buttonGlyph(input: UserInput): string | null {
  if (input.type === 'command') return null;
  return { up: '▲', down: '▼', a: 'A', b: 'B' }[input.button];
}

export function useHints(): { hints: Hint[]; lookFree: boolean; dimmed: boolean } {
  const { model } = useConsole();
  const { phase } = model;
  const shownState: ConsoleState = phase.kind === 'settled' ? phase.state : phase.edge.to;
  const shown = { ...model, phase: { kind: 'settled', state: shownState } } as const;
  return {
    hints: hintsFor(available(shown)),
    lookFree: look[shownState] === 'free',
    dimmed: phase.kind === 'transitioning',
  };
}
