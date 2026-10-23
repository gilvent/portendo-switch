import type { JoyconSetId } from '../console/model';

export const palette = {
  wall: '#f3ebdf',
  sky: '#86baff',
  cloudLight: '#d6e1f9',
  cloudDark: '#c5d9f8',
  button: '#313131',
  menuBlue: '#3377d7',
  led: 'rgb(178, 252, 125)',
  ink: '#1b1a19',
} as const;

export const joyconSets = {
  grey: { left: '#828282', right: '#828282' },
  neon: { left: '#ff3c28', right: '#0ab9e6' },
  gold: { left: '#C88C32', right: '#FFDC00' },
} as const satisfies Record<JoyconSetId, { left: string; right: string }>;
