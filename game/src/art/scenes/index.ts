import type { Scene } from '../kit.ts';
import { shop, storeroom } from './rooms.ts';
import { street } from './street.ts';
export const SCENES: Record<string, Scene> = { street: street(), shop: shop(), storeroom: storeroom() };
