// What the hero loop (App.tsx) and the MRT's live layers (Platform.tsx, Car.tsx) tell each other, once a frame.
// Plain mutable state: both sides run on the same ticker, and neither renders from it.
export const hero = {
  // Where he is and how he moves, in the scene's units. `y` is his height off the ground.
  x: 0, z: 0, vx: 0, vz: 0, y: 0, vy: 0, air: false, facing: 1,
  // Set by a live layer for one frame: his head met something hard (his rise stops) or soft (it does not).
  bonk: 0 as 0 | 1 | 2,
  // Counts his landings and jumps, so a layer can see one happen without missing it.
  landings: 0, jumps: 0,
  // He is walking into something that will not let him by (the shut gate).
  pushing: false
};
// The train's motion as the car feels it. App reads `a` to slide and lean him.
export const ride = { a: 0, v: 0 };
// The platform's wind, -1..1: App leans him by it.
export const wind = { x: 0 };
