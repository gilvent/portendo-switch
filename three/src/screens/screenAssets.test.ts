import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const troika = vi.hoisted(() => ({ parses: true, requests: [] as unknown[] }));

vi.mock('troika-three-text', () => ({
  preloadFont: (options: unknown, callback: () => void) => {
    troika.requests.push(options);
    if (troika.parses) callback();
  },
}));

const { loadFont } = await import('./screenAssets');

const truncatedTtf = new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x80]);

describe('loadFont', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    troika.requests.length = 0;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(truncatedTtf, { headers: { 'content-type': 'font/ttf' } })));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('fetches the font once and has troika parse those bytes with the text the screens draw', async () => {
    troika.parses = true;
    const parsedUrl = await loadFont({ url: '/assets/gaban.ttf', drawnText: ['WORK'] });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(parsedUrl.startsWith('blob:')).toBe(true);
    expect(troika.requests).toEqual([{ font: parsedUrl, characters: ['WORK'], sdfGlyphSize: 64 }]);
  });

  it('rejects by name when a font passes the signature but troika never parses it', async () => {
    troika.parses = false;
    const settled = expect(loadFont({ url: '/assets/gaban.ttf', drawnText: ['WORK'] })).rejects.toThrow(
      'screen assets: troika did not parse the font /assets/gaban.ttf within 10000 ms',
    );
    await vi.advanceTimersByTimeAsync(10_000);
    await settled;
  });
});
