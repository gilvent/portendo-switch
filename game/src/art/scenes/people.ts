import { add, yaw, type Panel } from '../kit.ts';
import { CORAL, INK } from '../recipes.ts';

// One cut figure for every person in the MRT car and the station: seated or standing, recoloured and given small
// props. Faces the camera; `z` and `y` place it, `scale` makes a child.
export type Look = { skin: string; hair: string; top: string; legs: string; shoes?: string; hairStyle?: 'short' | 'long' | 'bun' | 'cap' | 'grey'; capC?: string };
export const SKIN = ['#f3c9a0', '#d9a77e', '#b07a52', '#f6d5b8'];
const hairPath = (cx: number, top: number, style: Look['hairStyle'], c: string, capC = CORAL) => {
  const r = 12, cy = top + r;
  if (style === 'long') return `<path d="M${cx - r - 1} ${cy + 16}V${cy}Q${cx - r} ${top - 1} ${cx} ${top - 1}Q${cx + r} ${top - 1} ${cx + r + 1} ${cy}V${cy + 16}H${cx + r - 4}V${cy - 2}Q${cx} ${cy - 6} ${cx - r + 4} ${cy - 2}V${cy + 16}Z" fill="${c}"/>`;
  if (style === 'bun') return `<circle cx="${cx}" cy="${top - 3}" r="6" fill="${c}"/><path d="M${cx - r} ${cy}Q${cx - r} ${top - 1} ${cx} ${top - 1}Q${cx + r} ${top - 1} ${cx + r} ${cy}Q${cx} ${cy - 7} ${cx - r} ${cy}Z" fill="${c}"/>`;
  if (style === 'cap') return `<path d="M${cx - r} ${cy - 1}Q${cx - r} ${top - 2} ${cx} ${top - 2}Q${cx + r} ${top - 2} ${cx + r} ${cy - 1}Z" fill="${capC}"/><rect x="${cx - r - 2}" y="${cy - 3}" width="${2 * r + 4}" height="4" rx="2" fill="${capC}"/>`;
  return `<path d="M${cx - r} ${cy + 1}Q${cx - r} ${top - 1} ${cx} ${top - 1}Q${cx + r} ${top - 1} ${cx + r} ${cy + 1}Q${cx + 3} ${cy - 6} ${cx - r} ${cy + 1}Z" fill="${c}"/>`;
};
const face = (cx: number, cy: number, closed = false, glasses = false) => (closed
  ? `<path d="M${cx - 6} ${cy}q2 2 4 0M${cx + 2} ${cy}q2 2 4 0" stroke="${INK}" stroke-width="1.2" fill="none"/>`
  : `<circle cx="${cx - 4}" cy="${cy}" r="1.5" fill="${INK}"/><circle cx="${cx + 4}" cy="${cy}" r="1.5" fill="${INK}"/>`)
  + (glasses ? `<g fill="none" stroke="${INK}" stroke-width="1"><rect x="${cx - 8}" y="${cy - 3}" width="7" height="6" rx="2"/><rect x="${cx + 1}" y="${cy - 3}" width="7" height="6" rx="2"/></g>` : '')
  + `<path d="M${cx - 3} ${cy + 6}q3 2 6 0" stroke="#a5674a" stroke-width="1.1" fill="none"/>`;

// Seated, facing the camera: head, torso, a short lap band, shins to the floor. 56 wide, 128 tall from the floor.
export function seated(id: string, x: number, look: Look, extra: { print?: string; mask?: string; closed?: boolean; glasses?: boolean; tilt?: number; z?: number; y?: number } = {}): Panel {
  const w = 60, h = 130, cx = 30, top = 4;
  const mask = `<circle cx="${cx}" cy="${top + 12}" r="12.5" fill="#fff"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="#fff"/>`
    + `<path d="M${cx - 21} ${top + 36}Q${cx - 21} ${top + 28} ${cx - 12} ${top + 28}H${cx + 12}Q${cx + 21} ${top + 28} ${cx + 21} ${top + 36}V${top + 82}H${cx - 21}Z" fill="#fff"/>`
    + `<rect x="${cx - 22}" y="${top + 76}" width="44" height="16" rx="5" fill="#fff"/><rect x="${cx - 17}" y="${top + 90}" width="13" height="${h - top - 98}" fill="#fff"/><rect x="${cx + 4}" y="${top + 90}" width="13" height="${h - top - 98}" fill="#fff"/>`
    + `<rect x="${cx - 21}" y="${h - 9}" width="18" height="9" rx="3" fill="#fff"/><rect x="${cx + 3}" y="${h - 9}" width="18" height="9" rx="3" fill="#fff"/>` + (extra.mask ?? '');
  const print = `<rect width="${w}" height="${h}" fill="${look.top}"/><circle cx="${cx}" cy="${top + 12}" r="12.5" fill="${look.skin}"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="${look.skin}"/>`
    + hairPath(cx, top, look.hairStyle, look.hair, look.capC) + face(cx, top + 14, extra.closed, extra.glasses)
    + `<path d="M${cx - 21} ${top + 40}V${top + 78}M${cx + 21} ${top + 40}V${top + 78}" stroke="#000" stroke-opacity=".14" stroke-width="5"/>`
    + `<rect x="${cx - 22}" y="${top + 76}" width="44" height="16" rx="5" fill="${look.legs}"/><rect x="${cx - 17}" y="${top + 90}" width="13" height="${h - top - 98}" fill="${look.legs}"/><rect x="${cx + 4}" y="${top + 90}" width="13" height="${h - top - 98}" fill="${look.legs}"/>`
    + `<rect x="${cx - 22}" y="${h - 9}" width="20" height="9" rx="3" fill="${look.shoes ?? INK}"/><rect x="${cx + 2}" y="${h - 9}" width="20" height="9" rx="3" fill="${look.shoes ?? INK}"/>` + (extra.print ?? '');
  const r = yaw(extra.tilt ?? 0);
  return { id, stock: 'cover', c: look.top, w, h, o: add([x, extra.y ?? 0, extra.z ?? -86], r([-w / 2, 0, 0])), u: r([1, 0, 0]), v: [0, 1, 0], edge: 'cut', density: 2.4, mask, print };
}
// Standing: 54 wide, 164 tall. `arm` raises one hand to a strap or pole above the head.
export function standing(id: string, x: number, z: number, look: Look, extra: { print?: string; mask?: string; arm?: 'left' | 'right'; rot?: number; scale?: number; y?: number } = {}): Panel {
  const k = extra.scale ?? 1, w = 64, h = 200, cx = 32, top = 54;
  const armL = extra.arm === 'left', armR = extra.arm === 'right';
  const mask = `<circle cx="${cx}" cy="${top + 12}" r="12.5" fill="#fff"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="#fff"/>`
    + `<path d="M${cx - 20} ${top + 38}Q${cx - 20} ${top + 28} ${cx - 11} ${top + 28}H${cx + 11}Q${cx + 20} ${top + 28} ${cx + 20} ${top + 38}V${top + 92}H${cx - 20}Z" fill="#fff"/>`
    + `<rect x="${cx - 17}" y="${top + 88}" width="15" height="${h - top - 96}" fill="#fff"/><rect x="${cx + 2}" y="${top + 88}" width="15" height="${h - top - 96}" fill="#fff"/>`
    + `<rect x="${cx - 21}" y="${h - 9}" width="19" height="9" rx="3" fill="#fff"/><rect x="${cx + 2}" y="${h - 9}" width="19" height="9" rx="3" fill="#fff"/>`
    + (armL ? `<path d="M${cx - 20} ${top + 40}L${cx - 25} 12L${cx - 12} 12L${cx - 12} ${top + 34}Z" fill="#fff"/><circle cx="${cx - 18.5}" cy="9" r="7.5" fill="#fff"/>` : '')
    + (armR ? `<path d="M${cx + 20} ${top + 40}L${cx + 25} 12L${cx + 12} 12L${cx + 12} ${top + 34}Z" fill="#fff"/><circle cx="${cx + 18.5}" cy="9" r="7.5" fill="#fff"/>` : '') + (extra.mask ?? '');
  const print = `<rect width="${w}" height="${h}" fill="${look.top}"/><circle cx="${cx}" cy="${top + 12}" r="12.5" fill="${look.skin}"/><rect x="${cx - 5}" y="${top + 22}" width="10" height="8" fill="${look.skin}"/>`
    + hairPath(cx, top, look.hairStyle, look.hair, look.capC) + face(cx, top + 14)
    + (armL ? `<path d="M${cx - 20} ${top + 38}L${cx - 24.5} 14L${cx - 12.5} 14L${cx - 12} ${top + 32}Z" fill="${look.top}"/><path d="M${cx - 24} 14H${cx - 13}V${top - 8}H${cx - 24}Z" fill="${look.skin}"/><circle cx="${cx - 18.5}" cy="9" r="7" fill="${look.skin}"/>` : '')
    + (armR ? `<path d="M${cx + 20} ${top + 38}L${cx + 24.5} 14L${cx + 12.5} 14L${cx + 12} ${top + 32}Z" fill="${look.top}"/><path d="M${cx + 24} 14H${cx + 13}V${top - 8}H${cx + 24}Z" fill="${look.skin}"/><circle cx="${cx + 18.5}" cy="9" r="7" fill="${look.skin}"/>` : '')
    + `<path d="M${cx - 20} ${top + 40}V${top + 88}M${cx + 20} ${top + 40}V${top + 88}" stroke="#000" stroke-opacity=".14" stroke-width="5"/>`
    + `<rect x="${cx - 17}" y="${top + 88}" width="15" height="${h - top - 96}" fill="${look.legs}"/><rect x="${cx + 2}" y="${top + 88}" width="15" height="${h - top - 96}" fill="${look.legs}"/>`
    + `<rect x="${cx - 21}" y="${h - 9}" width="19" height="9" rx="3" fill="${look.shoes ?? INK}"/><rect x="${cx + 2}" y="${h - 9}" width="19" height="9" rx="3" fill="${look.shoes ?? INK}"/>` + (extra.print ?? '');
  const r = yaw(extra.rot ?? 0), u = r([k, 0, 0]);
  return { id, stock: 'cover', c: look.top, w, h, o: add([x, extra.y ?? 0, z], r([-w * k / 2, 0, 0])), u, v: [0, k, 0], edge: 'cut', density: 2.4, mask, print };
}

