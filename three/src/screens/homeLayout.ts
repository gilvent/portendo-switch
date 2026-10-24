import { palette } from '../theme/palette';
import type { ImageId } from './screenAssets';

export const referenceSize = [1440, 900] as const;

export type Anchor = 'left' | 'centre' | 'right' | 'spread';
export type ReferencePoint = readonly [x: number, y: number];

export function toScreen(anchor: Anchor, [x, y]: ReferencePoint, width: number): [number, number] {
  const [referenceWidth, referenceHeight] = referenceSize;
  const screenY = referenceHeight / 2 - y;
  switch (anchor) {
    case 'left':
      return [x - width / 2, screenY];
    case 'centre':
      return [x - referenceWidth / 2, screenY];
    case 'right':
      return [width / 2 - (referenceWidth - x), screenY];
    case 'spread':
      return [(x / referenceWidth - 0.5) * width, screenY];
  }
}

export type Cloud = { at: ReferencePoint; radii: readonly [number, number] };
export type CloudLayer = { id: string; colour: string; baseTop: number; clouds: readonly Cloud[] };

export const cloudLayers = [
  {
    id: 'light',
    colour: palette.cloudLight,
    baseTop: 600,
    clouds: [
      { at: [110, 692], radii: [190, 200] },
      { at: [432, 702], radii: [250, 150] },
      { at: [680, 668], radii: [220, 150] },
      { at: [1000, 607], radii: [260, 220] },
      { at: [1235, 455], radii: [230, 220] },
      { at: [1500, 420], radii: [140, 150] },
    ],
  },
  {
    id: 'dark',
    colour: palette.cloudDark,
    baseTop: 820,
    clouds: [
      { at: [75, 700], radii: [150, 150] },
      { at: [216, 716], radii: [80, 80] },
      { at: [290, 960], radii: [225, 300] },
      { at: [700, 900], radii: [220, 200] },
      { at: [1010, 851], radii: [200, 160] },
      { at: [1200, 900], radii: [250, 200] },
      { at: [1135, 667], radii: [70, 70] },
      { at: [1250, 654], radii: [110, 110] },
      { at: [1500, 670], radii: [230, 230] },
    ],
  },
] as const satisfies readonly CloudLayer[];

export type Sticker = { id: string; image: ImageId; anchor: Anchor; at: ReferencePoint; size: number; counterClockwiseDegrees: number };

export const stickerPadding = 12;
export const stickerRadius = 4;

export const stickers = [
  { id: 'gmail', image: 'gmail', anchor: 'left', at: [142, 462], size: 75, counterClockwiseDegrees: -10 },
  { id: 'linkedin', image: 'linkedin', anchor: 'left', at: [238, 580], size: 105, counterClockwiseDegrees: 5 },
  { id: 'github', image: 'github', anchor: 'right', at: [1288, 452], size: 95, counterClockwiseDegrees: 25 },
  { id: 'x', image: 'twitter', anchor: 'right', at: [1177, 568], size: 75, counterClockwiseDegrees: -20 },
] as const satisfies readonly Sticker[];

export const intro = {
  greeting: { text: 'Hey there!', at: [720, 262], fontSize: 122 },
  lines: [
    { text: 'I am Alvaro.', at: [720, 372] },
    { text: 'I develop Web Frontends.', at: [720, 411] },
  ],
  lineFontSize: 33,
} as const;
