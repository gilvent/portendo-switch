import fredoka500 from '@fontsource/fredoka/files/fredoka-latin-500-normal.woff?url';
import fredoka600 from '@fontsource/fredoka/files/fredoka-latin-600-normal.woff?url';
import fredoka700 from '@fontsource/fredoka/files/fredoka-latin-700-normal.woff?url';
import gaban from '../assets/fonts/gaban.ttf?url';
import { intro } from './homeLayout';

export type FontSource = { url: string; drawnText: readonly string[] };

export const fontSources = {
  fredoka500: { url: fredoka500, drawnText: ['A', 'B', 'Get started', 'Press B to start'] },
  fredoka600: { url: fredoka600, drawnText: intro.lines.map((line) => line.text) },
  fredoka700: { url: fredoka700, drawnText: [intro.greeting.text] },
  gaban: { url: gaban, drawnText: ['WORK'] },
} as const satisfies Record<string, FontSource>;

export type FontId = keyof typeof fontSources;
