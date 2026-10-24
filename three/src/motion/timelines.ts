import gsap from 'gsap';
import { neutralLook } from '../camera/look';
import type { ConsoleState, Edge } from '../console/model';
import { parts, poses, tvMix } from '../rig/poses';
import type { ConsoleRig } from '../rig/rig';
import { move } from './move';

type KeyOf<E> = E extends { from: infer From extends string; via: infer Via extends string } ? `${From}-${Via}` : never;
export type EdgeKey = KeyOf<Edge>;

export function edgeKey(edge: Edge): EdgeKey {
  return `${edge.from}-${edge.via}` as EdgeKey;
}

export const edgeSeconds = {
  'onDesk-pickUp': 0.75,
  'pickedUp-focus': 0.6,
  'focused-unfocus': 0.5,
  'pickedUp-dock': 4.6,
  'focused-dock': 5.1,
  'docked-undock': 3.5,
} as const satisfies Record<EdgeKey, number>;

function straightTo(state: ConsoleState, duration: number) {
  return (rig: ConsoleRig) => {
    const timeline = gsap.timeline({ paused: true });
    const pose = poses[state];
    for (const part of parts) move(timeline, rig, rig[part], pose[part], { duration, ease: 'power2.inOut' }, 0);
    timeline.to(rig.screenPower, { value: pose.signals.screenPower, duration }, 0);
    timeline.to(rig.ledPower, { value: pose.signals.ledPower, duration }, 0);
    timeline.to(rig.tvInput, { mix: tvMix[pose.signals.tvInput], duration }, 0);
    if (pose.camera === 'neutral') timeline.to(rig.look.target, { ...neutralLook, duration }, 0);
    return timeline;
  };
}

export const timelines: { [K in EdgeKey]: (rig: ConsoleRig) => gsap.core.Timeline } = {
  'onDesk-pickUp': straightTo('pickedUp', edgeSeconds['onDesk-pickUp']),
  'pickedUp-focus': straightTo('focused', edgeSeconds['pickedUp-focus']),
  'focused-unfocus': straightTo('pickedUp', edgeSeconds['focused-unfocus']),
  'pickedUp-dock': straightTo('docked', edgeSeconds['pickedUp-dock']),
  'focused-dock': straightTo('docked', edgeSeconds['focused-dock']),
  'docked-undock': straightTo('onDesk', edgeSeconds['docked-undock']),
};
