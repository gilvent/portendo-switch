import * as THREE from 'three';
import type { Solid } from './body.ts';
import type { Game } from './game.ts';

// A mechanism (or a door): something A works when he stands within `reach` of `x`.
export type Mech = {
  id: string; x: number; reach?: number;
  // Where the prompt floats, in scene coordinates.
  at: THREE.Vector3;
  label: string | (() => string);
  // Off: not in reach at all (A jumps instead).
  on?: () => boolean;
  // ↑ also works it (doors).
  up?: boolean;
  // Time is running out on it (the doors closing): its prompt pulses.
  hurry?: () => boolean;
  use: (g: Game) => void;
};
// One space he can be in. A scene builds its group, its lane and its mechanisms, and runs its own rules each step.
export interface Place {
  id: string;
  group: THREE.Group;
  lane: { x0: number; x1: number; z: number };
  solids: Solid[];
  mechs: Mech[];
  // Ground colour under the hero's prompt, the scene's light, etc. are the scene's business.
  enter(g: Game, from: string | null): void;
  update(dt: number, g: Game): void;
  camera(g: Game): void;
  exit?(g: Game): void;
}
