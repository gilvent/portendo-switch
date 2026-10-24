import { describe, expect, it } from 'vitest';
import { consoleScreenText, joyconLetters } from './consoleText';
import { fontSources } from './fonts';
import { intro } from './homeLayout';

describe('fontSources', () => {
  it('preloads every string the screens and Joy-Con letters draw', () => {
    const preloaded = new Set(Object.values(fontSources).flatMap(({ drawnText }) => drawnText));
    const drawn = [...Object.values(consoleScreenText), ...Object.values(joyconLetters), intro.greeting.text, ...intro.lines.map((line) => line.text)];
    expect(drawn.filter((text) => !preloaded.has(text))).toEqual([]);
  });

  it('preloads each font with the strings drawn in it', () => {
    expect(Object.fromEntries(Object.entries(fontSources).map(([id, { drawnText }]) => [id, drawnText]))).toEqual({
      fredoka500: ['A', 'B', 'B', 'Get started', 'Press B to start'],
      fredoka600: ['I am Alvaro.', 'I develop Web Frontends.'],
      fredoka700: ['Hey there!'],
      gaban: ['WORK'],
    });
  });
});
