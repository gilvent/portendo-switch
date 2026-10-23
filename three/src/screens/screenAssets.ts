import { SRGBColorSpace, Texture } from 'three';
import { preloadFont } from 'troika-three-text';
import github from '../assets/brand/github.png?url';
import gmail from '../assets/brand/gmail.png?url';
import linkedin from '../assets/brand/linkedin.png?url';
import twitter from '../assets/brand/twitter.png?url';
import home from '../assets/icons/ic-home.webp?url';
import { verifyAsset, type AssetKind } from './assetSignature';
import { fonts } from './fonts';

const imageUrls = { home, gmail, linkedin, github, twitter } as const;
export type ImageId = keyof typeof imageUrls;
type ScreenImageAsset = { texture: Texture; aspect: number };
type ScreenAssets = { images: Record<ImageId, ScreenImageAsset> };

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

async function loadFont(url: string): Promise<void> {
  await fetchAsset(url, 'font');
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`screen assets: troika did not parse the font ${url} within ${fontParseTimeoutMs} ms`)), fontParseTimeoutMs);
    preloadFont({ font: url, characters: [], sdfGlyphSize: 64 }, () => {
      clearTimeout(timer);
      resolve();
    });
  });
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
  const ids = Object.keys(imageUrls) as ImageId[];
  const [images] = await Promise.all([
    Promise.all(ids.map(async (id) => [id, await loadImage(imageUrls[id])] as const)),
    Promise.all(Object.values(fonts).map(loadFont)),
  ]);
  return { images: Object.fromEntries(images) as Record<ImageId, ScreenImageAsset> };
}

let pending: Promise<ScreenAssets> | null = null;

export function screenAssets(): Promise<ScreenAssets> {
  pending ??= load();
  return pending;
}
