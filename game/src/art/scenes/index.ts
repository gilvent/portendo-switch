import type { Scene } from '../kit.ts';
import { shop, storeroom } from './rooms.ts';
import { street } from './street.ts';
import { downtown } from './downtown.ts';
export const SCENES: Record<string, Scene> = { street: street(), shop: shop(), storeroom: storeroom(), downtown: downtown() };
