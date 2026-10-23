export type ConsoleState = 'onDesk' | 'pickedUp' | 'focused' | 'docked';
export type Command = 'pickUp' | 'focus' | 'unfocus' | 'dock' | 'undock';

export const edges = {
  onDesk: { pickUp: 'pickedUp' },
  pickedUp: { focus: 'focused', dock: 'docked' },
  focused: { unfocus: 'pickedUp', dock: 'docked' },
  docked: { undock: 'onDesk' },
} as const satisfies { [S in ConsoleState]: Partial<Record<Command, ConsoleState>> };

type Edges = typeof edges;

export type Edge = {
  [S in keyof Edges]: {
    [C in keyof Edges[S]]: { from: S; via: C; to: Edges[S][C] };
  }[keyof Edges[S]];
}[ConsoleState];

export type Phase =
  | { kind: 'settled'; state: ConsoleState }
  | { kind: 'transitioning'; edge: Edge };

export type MenuPage = 'home' | 'work';
export type JoyconSetId = 'grey' | 'neon' | 'gold';
export type MenuButton = 'up' | 'down' | 'a' | 'b';

export type ConsoleModel = { phase: Phase; menu: MenuPage; joycons: JoyconSetId };

export type UserInput =
  | { type: 'command'; command: Command }
  | { type: 'menu'; button: MenuButton };

export type ConsoleEvent = UserInput | { type: 'transitionDone'; edge: Edge };

export const look = {
  onDesk: 'free',
  pickedUp: 'free',
  focused: 'locked',
  docked: 'free',
} as const satisfies Record<ConsoleState, 'free' | 'locked'>;

export const initialModel: ConsoleModel = {
  phase: { kind: 'settled', state: 'onDesk' },
  menu: 'home',
  joycons: 'grey',
};

const nextJoycons: Record<JoyconSetId, JoyconSetId> = { grey: 'neon', neon: 'gold', gold: 'grey' };
const otherPage: Record<MenuPage, MenuPage> = { home: 'work', work: 'home' };

const offeredMenuButtons = ['up', 'down', 'a'] as const satisfies readonly MenuButton[];

function edgeFrom(state: ConsoleState, command: Command): Edge | undefined {
  const targets: Partial<Record<Command, ConsoleState>> = edges[state];
  const to = targets[command];
  return to === undefined ? undefined : ({ from: state, via: command, to } as Edge);
}

function pressMenu(model: ConsoleModel, button: MenuButton): ConsoleModel {
  switch (button) {
    case 'up':
    case 'down':
      return { ...model, menu: otherPage[model.menu] };
    case 'a':
      return { ...model, joycons: nextJoycons[model.joycons] };
    case 'b':
      return model;
  }
}

export function reduce(model: ConsoleModel, event: ConsoleEvent): ConsoleModel {
  const { phase } = model;
  switch (event.type) {
    case 'command': {
      if (phase.kind !== 'settled') return model;
      const edge = edgeFrom(phase.state, event.command);
      return edge === undefined ? model : { ...model, phase: { kind: 'transitioning', edge } };
    }
    case 'menu':
      if (phase.kind !== 'settled' || phase.state !== 'focused') return model;
      return pressMenu(model, event.button);
    case 'transitionDone':
      if (phase.kind !== 'transitioning' || phase.edge !== event.edge) return model;
      return { ...model, phase: { kind: 'settled', state: phase.edge.to } };
  }
}

export function available(model: ConsoleModel): UserInput[] {
  const { phase } = model;
  if (phase.kind !== 'settled') return [];
  const commands = (Object.keys(edges[phase.state]) as Command[]).map(
    (command): UserInput => ({ type: 'command', command }),
  );
  if (phase.state !== 'focused') return commands;
  const menu = offeredMenuButtons.map((button): UserInput => ({ type: 'menu', button }));
  return [...menu, ...commands];
}
