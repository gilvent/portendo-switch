import type { Toybox } from './box.ts';
import { front } from './front.ts';
import { shop } from './shop.ts';
import { train } from './train.ts';
// Which toybox plays in which space (by the space's art).
export const TOYBOX: Record<string, () => Toybox> = { street: front, shop, train };
