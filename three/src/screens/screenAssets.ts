import { SRGBColorSpace, Texture } from 'three';
import { preloadFont } from 'troika-three-text';
import github from '../assets/brand/github.png?url';
import gmail from '../assets/brand/gmail.png?url';
import linkedin from '../assets/brand/linkedin.png?url';
import twitter from '../assets/brand/twitter.png?url';
import home from '../assets/icons/ic-home.webp?url';
import { verifyAsset, type AssetKind } from './assetSignature';
import { fontSources, type FontId, type FontSource } from './fonts';

const imageUrls = { home, gmail, linkedin, github, twitter } as const;
export type ImageId = keyof typeof imageUrls;
type ScreenImageAsset = { texture: Texture; aspect: number };
type ScreenAssets = { images: Record<ImageId, ScreenImageAsset>; fonts: Record<FontId, string> };

const fontParseTimeoutMs = 10_000;

async function fetchAsset(url: string, kind: AssetKind): Promise<Uint8Array<ArrayBuffer>> {
  const response = await fetch(url).catch((error: unknown) => {
    throw new Error(`screen assets: could not fetch ${url}`, { cause: error });
  });
  if (!response.ok) throw new Error(`screen assets: ${url} answered HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  verifyAsset(url, kind, bytes, response.headers.get('content-type'));
  return bytes;
}

export async function loadFont({ url, drawnText }: FontSource): Promise<string> {
  const objectUrl = URL.createObjectURL(new Blob([await fetchAsset(url, 'font')]));
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`screen assets: troika did not parse the font ${url} within ${fontParseTimeoutMs} ms`)), fontParseTimeoutMs);
    preloadFont({ font: objectUrl, characters: drawnText, sdfGlyphSize: 64 }, () => {
      clearTimeout(timer);
      resolve();
    });
  });
  return objectUrl;
}

async function loadImage(url: string): Promise<ScreenImageAsset> {
  const bytes = await fetchAsset(url, 'image');
  const objectUrl = URL.createObjectURL(new Blob([bytes]));
  const image = new Image();
  image.src = objectUrl;
  try {
    await image.decode();
  } catch (error) {
    throw new Error(`screen assets: ${url} did not decode`, { cause: error });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, aspect: image.naturalHeight / image.naturalWidth };
}

async function load(): Promise<ScreenAssets> {
  const imageIds = Object.keys(imageUrls) as ImageId[];
  const fontIds = Object.keys(fontSources) as FontId[];
  const [images, fonts] = await Promise.all([
    Promise.all(imageIds.map(async (id) => [id, await loadImage(imageUrls[id])] as const)),
    Promise.all(fontIds.map(async (id) => [id, await loadFont(fontSources[id])] as const)),
  ]);
  return { images: Object.fromEntries(images) as Record<ImageId, ScreenImageAsset>, fonts: Object.fromEntries(fonts) as Record<FontId, string> };
}

let pending: Promise<ScreenAssets> | null = null;

export function screenAssets(): Promise<ScreenAssets> {
  pending ??= load();
  return pending;
}
