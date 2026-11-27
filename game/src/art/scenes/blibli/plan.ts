// The Blibli stop's floor plans: where every station stands, in world units (x right, y up, z toward the camera).
// The scenes (art), the stops (content.ts) and the toy scripts (toys/) all read these, so a station moved here moves
// in all three.
export const VARIANT = ['#0092da', '#e8552d', '#35b58a'] as const;

// ---- The shop floor: product detail ----
export const FLOOR = {
  room: { x0: -540, x1: 540, back: -240, front: 232, h: 400 },
  // The showcased phone on its pedestal, swatch chips on the pedestal's front.
  showcase: { x: 0, z: -130, top: 88, chips: [-30, 0, 30] },
  // The price tag on its post beside the pedestal; the coupon reel hangs over the spot he hops from.
  promo: { x: 118, z: -124, top: 74, reel: { x: 196, y: 208, z: -52 } },
  // The catalog on its stand: three leaves hinged along one spine.
  catalog: { x: -250, z: -130, top: 80, leaf: { w: 58, h: 76 } },
  // Boxed phones: where each one stands in the stack, and where it lands in the basket. `order` is which leaves first.
  stock: { boxes: [[-398, 0, 62], [-344, 0, 74], [-374, 46, 66]], order: [2, 1, 0], box: { w: 50, h: 46, d: 40 } },
  basket: { x: -246, z: 124, slots: [[-272, 8, 124], [-220, 8, 124], [-246, 54, 122]] },
  // The recommended shelf on the back wall, over his head: one card per place.
  recs: { y: 186, z: -218, xs: [276, 328, 380, 432, 484], card: { w: 44, h: 60 } },
  lamps: [{ x: -150, z: 40 }, { x: 10, z: 92 }], lampY: 226,
  door: { x: 0, z: 190 }
} as const;

// ---- The shopfront on the promenade: product reviews ----
// Left to right, in the order of the loop: the review wall, the door, the photo string, the photo spot, the stand.
export const FRONT = {
  ground: { x0: -800, x1: 880, back: -60, front: 260 },
  wall: { z: -60, x0: -260, x1: 900, h: 380 },
  // The review wall in the left window: six cards, the first his own. Each: does it carry a photo, and its stars.
  board: { x: -206, y: 128, w: 256, h: 190, cols: [-164, -78, 8], rows: [232, 146], card: { w: 74, h: 72 } },
  reviews: [{ photo: false, stars: 0 }, { photo: true, stars: 5 }, { photo: false, stars: 5 }, { photo: true, stars: 3 }, { photo: false, stars: 4 }, { photo: true, stars: 4 }],
  door: { x: 145, w: 112, h: 196 },
  // The photo string in the right window: each print's centre and its own shape [x, y, w, h]; the first is his.
  string: { z: -54, x: 372, y: 206, cell: 62, prints: [[310, 244, 40, 56], [372, 244, 60, 40], [434, 244, 46, 46], [310, 168, 58, 38], [372, 168, 38, 56], [434, 168, 50, 44]] },
  // The photo spot: the instant camera on its tripod, aimed at the phone on the unboxing table.
  camera: { x: 590, y: 88, z: 60 },
  table: { x: 690, z: -8, top: 52 },
  // The writing stand with his review card and the rubber stamp.
  stand: { x: 800, z: 96, top: 84 },
  scooter: { x: 640, z: 262 },
  shoppers: [{ x: 56, z: 30 }, { x: -252, z: 40 }],
  pigeons: [{ x: -420, z: 150 }, { x: -384, z: 132 }],
  siteBoard: { x: -470, z: 20 }
} as const;
