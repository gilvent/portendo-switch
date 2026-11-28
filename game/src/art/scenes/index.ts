import type { Scene } from '../kit.ts';
import { floor } from './blibli/floor.ts';
import { front } from './blibli/front.ts';
import { train } from './train.ts';
// The spaces that are baked (tools/paper/build.ts), by their art id.
export const SCENES: Record<string, Scene> = { street: front(), shop: floor(), train: train() };
