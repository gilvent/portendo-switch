import { FOLIAGE, mailbox, openFlaps, parcel, scuff, tuft } from '../recipes.ts';
import type { Panel } from '../kit.ts';

export const heroPanels = (): Panel[] => [
  ...parcel({ id: 'vue', label: 'VUE', color: '#42b884', x: -452, z: -40, w: 120, h: 82, d: 90, labelTilt: -1.2, scuffs: scuff(92, 58, 7) + scuff(14, 8, 5) }),
  ...parcel({ id: 'nginx', label: 'NGINX', color: '#22963a', x: -344, z: -96, w: 96, h: 70, d: 84, labelTilt: 1 }),
  ...parcel({ id: 'sass', label: 'SASS', color: '#cf649a', x: -430, z: -42, y: 82, w: 96, h: 68, d: 78, rot: -9, labelTilt: .8, scuffs: scuff(70, 10, 6) }),
  ...parcel({ id: 'playwright', label: 'PLAYWRIGHT', color: '#d65348', x: -446, z: -44, y: 150, w: 72, h: 52, d: 60, rot: 8, labelTilt: -1, open: true }),
  ...openFlaps({ id: 'playwright', x: -446, z: -44, y: 202, w: 72, d: 60, rot: 8 }),
  ...mailbox(),
  ...tuft('tuft-1', -292, -36, 34, 20, FOLIAGE, -8), ...tuft('tuft-2', -222, -30, 26, 15, '#57b36f', 10), ...tuft('tuft-3', -518, -2, 30, 18, FOLIAGE, 6)
];
