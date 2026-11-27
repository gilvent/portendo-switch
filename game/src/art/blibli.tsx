import type { ReactNode } from 'react';
import { PaperScene, at, type Manifest, type Toys } from './fold.tsx';
import type { Stop } from '../schema.ts';
import type { Scene } from './kit.ts';
import { greyManifest } from './grey.ts';
import { floor } from './scenes/blibli/floor.ts';
import { front } from './scenes/blibli/front.ts';
import trainUrl from './baked/train/atlas.webp';
import trainManifest from './baked/train/manifest.json';

export type Art = (props: { near: string | null; toys: Toys }) => ReactNode;
const art = (manifest: unknown, url: string, id: string): Art => ({ near, toys }) => <PaperScene manifest={manifest as Manifest} url={url} near={near} toys={toys} art={id} />;
// A space still in greybox: drawn straight from its scene data, unbaked (grey.ts).
const grey = (scene: Scene, id: string): Art => { const m = greyManifest(scene); return ({ near, toys }) => <PaperScene manifest={m} url="" near={near} toys={toys} art={id} />; };
export const WORLD_ART: Record<string, Art> = { street: grey(front(), 'street'), shop: grey(floor(), 'shop'), train: art(trainManifest, trainUrl, 'train') };
export const WORLD_BACKDROP: Record<string, string> = {};
export const placeOf = (s: Stop) => at(s.x, s.z);
