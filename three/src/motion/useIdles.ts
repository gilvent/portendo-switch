import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils } from 'three';
import { useConsole } from '../console/ConsoleProvider';
import type { ConsoleState, Phase } from '../console/model';
import { parts, poses, type Part, type Placement, type Vec3 } from '../rig/poses';
import { useRig } from '../rig/RigProvider';

type Offset = { position: Vec3; rotation: Vec3 };

const wave = (seconds: number, period: number, phase = 0) => Math.sin((2 * Math.PI * seconds) / period + phase);

const breathe = (phase: number) => (seconds: number): Offset => ({
  position: [0, 0.004 * wave(seconds, 3.6, phase), 0],
  rotation: [0.03 * wave(seconds, 3.6, phase + 0.6), 0, 0.02 * wave(seconds, 4.2, phase)],
});

export const idles: { [S in ConsoleState]: Partial<Record<Part, (seconds: number) => Offset>> } = {
  onDesk: {},
  pickedUp: {
    console: (seconds) => ({
      position: [0, 0.003 * wave(seconds, 3.2), 0],
      rotation: [0.01 * wave(seconds, 3.2, 0.8), 0, 0.015 * wave(seconds, 4.6)],
    }),
  },
  focused: {},
  docked: { leftJoycon: breathe(0), rightJoycon: breathe(Math.PI) },
};

const rampSeconds = 1;

export function idlePlacement(state: ConsoleState, part: Part, settledSeconds: number): Placement | null {
  const offset = idles[state][part];
  if (offset === undefined) return null;
  const amplitude = MathUtils.smoothstep(settledSeconds, 0, rampSeconds);
  const { position, rotation } = offset(settledSeconds);
  const pose = poses[state][part];
  const add = (base: Vec3, extra: Vec3): Vec3 => [base[0] + amplitude * extra[0], base[1] + amplitude * extra[1], base[2] + amplitude * extra[2]];
  return { anchor: pose.anchor, position: add(pose.position, position), rotation: add(pose.rotation, rotation) };
}

export function useIdles() {
  const { model } = useConsole();
  const rig = useRig();
  const settled = useRef<{ phase: Phase; since: number } | null>(null);
  const { phase } = model;

  useFrame(({ clock }) => {
    if (phase.kind !== 'settled') return;
    if (settled.current?.phase !== phase) settled.current = { phase, since: clock.elapsedTime };
    const settledSeconds = clock.elapsedTime - settled.current.since;
    for (const part of parts) {
      const placement = idlePlacement(phase.state, part, settledSeconds);
      if (placement === null) continue;
      const object = rig[part];
      if (object.parent !== rig.anchors[placement.anchor]) {
        throw new Error(`useIdles: ${part} idles on anchor ${placement.anchor} but hangs from ${object.parent?.name ?? 'nothing'}`);
      }
      object.position.set(...placement.position);
      object.rotation.set(...placement.rotation);
    }
  });
}
