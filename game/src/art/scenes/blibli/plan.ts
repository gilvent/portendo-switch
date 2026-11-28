// The Blibli stop's floor plans: where every station stands, in world units (x right, y up, z toward the camera).
// The scenes (art), the stops (content.ts) and the toy scripts (toys/) all read these, so a station moved here moves
// in all three.
export const VARIANT = ['#0092da', '#e8552d', '#35b58a'] as const;

// ---- The shop floor: product detail ----
export const FLOOR = {
  // The room is rooms.ts' shell: 1040 wide, 500 deep, 420 high, its back wall at z -250.
  // The showcased phone on its pedestal, swatch chips on the pedestal's front.
  showcase: { x: 0, z: -130, top: 80, chips: [-30, 0, 30] },
  // The price tag on its post beside the pedestal; the coupon reel hangs over the spot he hops from.
  promo: { x: 122, z: -124, top: 78, reel: { x: 200, y: 208, z: -52 } },
  // The catalog on its stand: three leaves hinged along one spine.
  catalog: { x: -250, z: -130, top: 80, leaf: { w: 58, h: 76 } },
  // Boxed phones: where each one stands in the stack, and where it lands in the basket. `order` is which leaves first.
  stock: { boxes: [[-352, 0, 62], [-298, 0, 74], [-328, 46, 66]], order: [2, 1, 0], box: { w: 50, h: 46, d: 40 } },
  basket: { x: -190, z: 124, slots: [[-216, 8, 124], [-164, 8, 124], [-190, 54, 122]] },
  // The recommended shelf on the back wall, over his head: one card per place.
  recs: { y: 186, z: -224, xs: [276, 328, 380, 432, 484], card: { w: 44, h: 60 } },
  lamps: [{ x: -150, z: 40 }, { x: 10, z: 92 }], lampY: 206,
  door: { x: 0, z: 190 }
} as const;

// ---- The shopfront on the promenade: product reviews ----
// The train leaves him at the right. From there, in the order of the loop: the review wall the shoppers read, the door,
// the photo string in the other window, then the photo spot by the river gate and the writing stand.
export const SHOP = { x: 150, z: -80, w: 720, d: 300, ground: 300, upper: 80, peak: 120 };
export const FRONT = {
  wall: { z: SHOP.z },
  // The review wall in the right bay: six cards, the first his own. Each: does it carry a photo, and its stars.
  board: { x: 262, y: 112, w: 228, h: 166, cols: [300, 376, 452], rows: [244, 168], card: { w: 68, h: 66 } },
  reviews: [{ photo: false, stars: 0 }, { photo: true, stars: 5 }, { photo: false, stars: 5 }, { photo: true, stars: 3 }, { photo: false, stars: 4 }, { photo: true, stars: 4 }],
  door: { x: 150, w: 136, h: 190 },
  // The photo string in the left window: each print's centre and its own shape [x, y, w, h]; the first peg is his.
  string: { z: SHOP.z + 5, x: -68, y: 203, cell: 62, prints: [[-138, 240, 40, 56], [-68, 240, 60, 40], [2, 240, 46, 46], [-138, 166, 58, 38], [-68, 166, 38, 56], [2, 166, 50, 44]] },
  // The photo spot by the river gate: the instant camera on its tripod, turned to the phone on the unboxing table.
  camera: { x: -330, y: 88, z: 40 },
  table: { x: -452, z: 96, top: 52 },
  // The writing stand with his review card and the rubber stamp.
  // The stamp rests on its ink pad at the card's right and comes down on the card: `pad` and `hit` are offsets from the stand's middle.
  stand: { x: -612, z: 150, top: 84, pad: [26, 14, 4], hit: [-14, 12, 6] },
  scooter: { x: -96, z: 268 },
  // Who reads the wall (the father and his child), who looks at the photos, who strolls by.
  shoppers: [{ x: 524, z: 14 }, { x: 242, z: 26 }, { x: -30, z: 142 }, { x: 150, z: 172 }],
  pigeons: [{ x: 300, z: 160 }, { x: 338, z: 144 }],
  siteBoard: { x: 592, z: -34 },
  out: { x: 690, z: 120 }
} as const;
