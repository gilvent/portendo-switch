// What the baked paper does on its own, and what it does when the salaryman brushes past it. None of this is in the
// bake: every piece keeps its baked light and its baked shadow, so loops stay small (a few degrees, a few units) and a
// touched piece always lands back where its shadow lies.
//
// A loop rocks one sheet between two poses for as long as the scene is shown. Each sheet gets its own period and its
// own start offset (from its id), so no two flags or fronds ever move in step.
//   sway     hangs or stands from `pivot` and rocks `amp` degrees each way in its own plane
//   skew     a wide strip fixed along its top edge (festoon lights, bunting) leaning `amp` degrees each way
//   rustle   turns `amp` degrees each way about its centre (fronds, leaf clusters)
//   breathe  stands on its bottom edge and grows `amp` (a fraction of its height) taller, then settles
//   bob      rides `amp` units up and down (the river and its boat)
//   peck     dips `amp` degrees about its feet twice, then waits (birds)
export type Loop = { kind: 'sway' | 'skew' | 'rustle' | 'breathe' | 'bob' | 'peck'; amp: number; secs: number; pivot?: 'top' | 'bottom' };
// A touchable: every sheet whose id matches belongs to one object standing at [x, z]. When the salaryman walks within
// `r` of it, the whole object hops `lift` units, and `says` (if any) pops up over it on a paper tag.
export type Touchable = { name: string; match: RegExp; x: number; z: number; r?: number; lift?: number; top?: number; says?: string };
export type Ambient = { loops: [RegExp, Loop][]; touch: Touchable[] };

const NONE: Ambient = { loops: [], touch: [] };
export const AMBIENT: Record<string, Ambient> = {
  street: {
    loops: [
      [/^flag-[lr]-flag$/, { kind: 'sway', amp: 2.4, secs: 2.3, pivot: 'top' }],
      [/^gate-flags$/, { kind: 'skew', amp: 1.8, secs: 1.9 }],
      [/^lights-[abc]$/, { kind: 'skew', amp: .9, secs: 3.1 }],
      [/^palm-[abc]-fan\d$/, { kind: 'rustle', amp: 1.5, secs: 2.7 }],
      [/^tree-l-leaves\d$/, { kind: 'rustle', amp: 1.1, secs: 3.3 }],
      [/^(plant-a|shrub-d|bush-a-0|front-bush-a-0|tuft-\d)$/, { kind: 'sway', amp: 1.3, secs: 2.9, pivot: 'bottom' }],
      [/^clothes-rail$/, { kind: 'sway', amp: .7, secs: 3.7, pivot: 'top' }],
      [/^river-near-\d$/, { kind: 'bob', amp: 1.6, secs: 2.6 }],
      [/^shopper-[a-e]$/, { kind: 'breathe', amp: .018, secs: 1.7 }],
      [/^ticket-seller$/, { kind: 'breathe', amp: .035, secs: .7 }],
      [/^(pigeon-[ab]-near|ridge-[ab])$/, { kind: 'peck', amp: 16, secs: 3.4 }]
    ],
    touch: [
      { name: 'shopper-e', match: /^shopper-e/, x: -180, z: 40, top: 124, says: '♪' },
      { name: 'shopper-a', match: /^shopper-a/, x: -60, z: 150, top: 118, says: '…' },
      { name: 'shopper-b', match: /^shopper-b/, x: 420, z: 150, top: 136, says: '!' },
      { name: 'shopper-c', match: /^shopper-c/, x: 462, z: 140, top: 84, says: '?' },
      { name: 'pigeons', match: /^pigeon-[ab]-near$/, x: 98, z: 130, r: 70, lift: 22 },
      { name: 'aboard', match: /^aboard-[ab]$/, x: 265, z: 20, lift: 7 },
      { name: 'door-box', match: /^door-box-/, x: -14, z: -45, lift: 7 },
      { name: 'plant', match: /^(plant-a|pot-(top|front|right|left))$/, x: -90, z: -60, lift: 5 },
      { name: 'bench', match: /^bench-/, x: 340, z: -45, r: 80, lift: 4 },
      { name: 'bike', match: /^bike-/, x: 526, z: -60, r: 70, lift: 6 },
      { name: 'bin', match: /^bin-b-/, x: 560, z: 200, lift: 7 },
      { name: 'scooter', match: /^scooter-/, x: -170, z: 262, r: 100, lift: 5 },
      { name: 'arrow', match: /^out-arrow$/, x: -640, z: 60, lift: 6 },
      { name: 'tufts', match: /^tuft-[12]$/, x: -257, z: -33, lift: 5 }
    ]
  },
  shop: {
    loops: [
      [/^bunting$/, { kind: 'skew', amp: .7, secs: 3.2 }],
      [/^lamp-\d-(shade|cord)$/, { kind: 'sway', amp: 1.1, secs: 2.8, pivot: 'top' }],
      [/^fg-plant$/, { kind: 'sway', amp: 1.2, secs: 3.1, pivot: 'bottom' }],
      [/^shopper$/, { kind: 'breathe', amp: .014, secs: 1.9 }],
      [/^promo-burst$/, { kind: 'rustle', amp: 7, secs: 1.1 }]
    ],
    touch: [
      { name: 'clerk', match: /^shopper$/, x: -450, z: -40, r: 90, top: 182, says: '♪' },
      { name: 'basket', match: /^(basket|cart)-/, x: -395, z: 125, r: 80, lift: 5 },
      { name: 'boxes', match: /^fg-box-/, x: -460, z: 205, r: 80, lift: 5 },
      { name: 'plant', match: /^fg-(plant|pot)$/, x: 460, z: 214, r: 80, lift: 5 },
      { name: 'leaflet', match: /^(leaflet-\d|cat-stand-)/, x: -175, z: -120, r: 80, lift: 5 },
      { name: 'promo', match: /^(promo-|tag-\d|coupon-\d)/, x: 175, z: -120, r: 80, lift: 5 },
      { name: 'pedestal', match: /^(pedestal-|phone-\d|chip-\d)/, x: 0, z: -100, r: 80, lift: 4 },
      { name: 'riser', match: /^(riser-|rec-)/, x: 405, z: 45, r: 95, lift: 4 }
    ]
  },
  storeroom: {
    loops: [
      [/^lamp-\d-(shade|cord)$/, { kind: 'sway', amp: 1.1, secs: 2.9, pivot: 'top' }],
      [/^packer$/, { kind: 'breathe', amp: .014, secs: 1.6 }],
      [/^roller$/, { kind: 'sway', amp: 1.6, secs: 1.3, pivot: 'bottom' }]
    ],
    touch: [
      { name: 'packer', match: /^packer$/, x: 400, z: -150, r: 95, top: 174, says: '!' },
      { name: 'camera', match: /^(camera-|photo-out)/, x: -148, z: 76, r: 85, lift: 5 },
      { name: 'mug', match: /^mug-/, x: 50, z: 90, r: 80, lift: 8 },
      { name: 'recycle', match: /^recycle-/, x: 80, z: 185, lift: 6 },
      { name: 'stack', match: /^st-[ac]-/, x: -230, z: 180, r: 70, lift: 5 },
      { name: 'stool', match: /^stool-/, x: 465, z: -22, r: 70, lift: 7 },
      { name: 'cans', match: /^can-(new|old)-/, x: 458, z: -95, r: 70, lift: 6 },
      { name: 'truck', match: /^(hand-truck|truck-box-)/, x: 450, z: 25, r: 70, lift: 5 },
      { name: 'pallet', match: /^pal-[abc]-/, x: -410, z: -180, r: 95, lift: 4 },
      { name: 'scale', match: /^(scale-|tape-gun-)/, x: 240, z: 118, r: 80, lift: 5 }
    ]
  },
  train: {
    loops: [
      [/^p-(big|office|grandpa|mum|student|kid|strap|pole)$/, { kind: 'breathe', amp: .012, secs: 1.8 }],
      [/^p-sleeper$/, { kind: 'breathe', amp: .03, secs: 2.6 }]
    ],
    touch: [
      { name: 'suitcase', match: /^suitcase-/, x: -440, z: -48, r: 80, lift: 7 },
      { name: 'sleeper', match: /^p-sleeper$/, x: -252, z: -90, r: 80, top: 132, says: 'z' },
      { name: 'student', match: /^p-student$/, x: -164, z: -90, r: 70, top: 120, says: '♪' },
      { name: 'grandpa', match: /^p-grandpa$/, x: 176, z: -90, r: 70, top: 120, says: '…' },
      { name: 'office', match: /^p-office$/, x: 290, z: -90, r: 70, top: 132, says: '!' },
      { name: 'kid', match: /^p-kid$/, x: -334, z: -90, r: 60, top: 90, says: '?' },
      { name: 'strap', match: /^p-strap/, x: 436, z: -62, r: 70, top: 128, says: '…' },
      { name: 'bag', match: /^shop-bag$/, x: 211, z: -72, r: 60, lift: 8 }
    ]
  }
};
export const ambientOf = (art: string): Ambient => AMBIENT[art] ?? NONE;

// A stable number in [0, 1) from an id: the same sheet always gets the same period and offset.
export const hash = (s: string, salt = 0) => { let h = 2166136261 ^ salt; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 10007) / 10007; };
