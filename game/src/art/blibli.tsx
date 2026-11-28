import type { ReactNode } from 'react';
import { PaperScene, at, type Manifest, type Toys } from './fold.tsx';
import type { Stop } from '../schema.ts';
import { GRAYBOX, GrayScene } from '../mrt/graybox.tsx';
import streetUrl from './baked/street/atlas.webp';
import streetManifest from './baked/street/manifest.json';
import streetBackdrop from './baked/street/backdrop.webp';
import shopUrl from './baked/shop/atlas.webp';
import shopManifest from './baked/shop/manifest.json';
import storeroomUrl from './baked/storeroom/atlas.webp';
import storeroomManifest from './baked/storeroom/manifest.json';
import trainUrl from './baked/train/atlas.webp';
import trainManifest from './baked/train/manifest.json';

export type Art = (props: { near: string | null; toys: Toys }) => ReactNode;
const art = (manifest: unknown, url: string, id: string): Art => ({ near, toys }) => GRAYBOX ? <GrayScene art={id} near={near} toys={toys} /> : <PaperScene manifest={manifest as Manifest} url={url} near={near} toys={toys} art={id} />;
export const WORLD_ART: Record<string, Art> = { street: art(streetManifest, streetUrl, 'street'), shop: art(shopManifest, shopUrl, 'shop'), storeroom: art(storeroomManifest, storeroomUrl, 'storeroom'), train: art(trainManifest, trainUrl, 'train') };
export const WORLD_BACKDROP: Record<string, string> = { street: streetBackdrop };
export const placeOf = (s: Stop) => at(s.x, s.z);
