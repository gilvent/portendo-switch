import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { verifyAsset } from './assetSignature';

const file = (path: string) => new Uint8Array(readFileSync(new URL(path, import.meta.url)));
const spaFallback = new TextEncoder().encode('<!doctype html><html><head>');

describe('verifyAsset', () => {
  it('accepts the shipped fonts and images', () => {
    expect(() => verifyAsset('gaban.ttf', 'font', file('../assets/fonts/gaban.ttf'), 'font/ttf')).not.toThrow();
    expect(() => verifyAsset('fredoka.woff', 'font', file('../../node_modules/@fontsource/fredoka/files/fredoka-latin-500-normal.woff'), 'font/woff')).not.toThrow();
    expect(() => verifyAsset('gmail.png', 'image', file('../assets/brand/gmail.png'), 'image/png')).not.toThrow();
    expect(() => verifyAsset('ic-home.webp', 'image', file('../assets/icons/ic-home.webp'), 'image/webp')).not.toThrow();
  });

  it('names the URL when a host answers a missing font with its HTML fallback', () => {
    expect(() => verifyAsset('/assets/gaban.ttf', 'font', spaFallback, 'text/html')).toThrow('screen assets: /assets/gaban.ttf is not a valid font file (got text/html, 27 bytes)');
  });

  it('names the URL when an image is not a PNG or WebP', () => {
    expect(() => verifyAsset('/assets/gmail.png', 'image', spaFallback, null)).toThrow('screen assets: /assets/gmail.png is not a valid image file (got no content type, 27 bytes)');
  });
});
