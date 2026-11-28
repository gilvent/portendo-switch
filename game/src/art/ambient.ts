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
      [/^(shrub-d|bush-a-0|front-bush-a-0)$/, { kind: 'sway', amp: 1.3, secs: 2.9, pivot: 'bottom' }],
      [/^clothes-rail$/, { kind: 'sway', amp: .7, secs: 3.7, pivot: 'top' }],
      [/^river-near-\d$/, { kind: 'bob', amp: 1.6, secs: 2.6 }],
      [/^shopper-[a-e]$/, { kind: 'breathe', amp: .018, secs: 1.7 }],
      [/^ticket-seller$/, { kind: 'breathe', amp: .035, secs: .7 }],
      [/^ridge-[ab]$/, { kind: 'peck', amp: 16, secs: 3.4 }]
    ],
    touch: [
      { name: 'shopper-b', match: /^shopper-b/, x: 524, z: 14, top: 136, says: '!' },
      { name: 'shopper-c', match: /^shopper-c/, x: 242, z: 26, top: 84, says: '?' },
      { name: 'shopper-e', match: /^shopper-e/, x: -30, z: 142, top: 124, says: '♪' },
      { name: 'shopper-a', match: /^shopper-a/, x: 150, z: 172, top: 118, says: '…' },
      { name: 'bike', match: /^bike-/, x: 526, z: -60, r: 70, lift: 6 },
      { name: 'bin', match: /^bin-b-/, x: 560, z: 200, lift: 7 },
      { name: 'scooter', match: /^(scooter-|parcels-)/, x: -96, z: 250, r: 90, lift: 5 },
      { name: 'arrow', match: /^out-arrow$/, x: 720, z: 60, lift: 6 },
      { name: 'unbox', match: /^(unbox|spot-phone)/, x: -452, z: 96, r: 84, lift: 5 },
      { name: 'cans', match: /^cans$/, x: -562, z: 164, r: 60, lift: 8 }
    ]
  },
  shop: {
    loops: [
      [/^bunting$/, { kind: 'skew', amp: .7, secs: 3.2 }],
      [/^fg-plant$/, { kind: 'sway', amp: 1.2, secs: 3.1, pivot: 'bottom' }],
      [/^clerk$/, { kind: 'breathe', amp: .014, secs: 1.9 }]
    ],
    touch: [
      { name: 'clerk', match: /^clerk/, x: 494, z: -168, r: 100, top: 168, says: '♪' },
      { name: 'boxes', match: /^fg-box-/, x: -460, z: 205, r: 80, lift: 5 },
      { name: 'plant', match: /^fg-(plant|pot)$/, x: 460, z: 214, r: 80, lift: 5 }
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
