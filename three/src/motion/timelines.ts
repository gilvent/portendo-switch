import gsap from 'gsap';
import { dockLook, neutralLook } from '../camera/look';
import type { Edge } from '../console/model';
import { poses, tvMix, type Placement } from '../rig/poses';
import { loadingRest, type ConsoleRig } from '../rig/rig';
import { move, type Ease } from './move';
import { joyconWaypoints, waypoints, type JoyconPart } from './waypoints';

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

const joycons = ['leftJoycon', 'rightJoycon'] as const satisfies readonly JoyconPart[];
const dockBeats = { squashY: 0.9, popScale: 1.06 } as const;

const paused = () => gsap.timeline({ paused: true });

function joyconsTo(timeline: gsap.core.Timeline, rig: ConsoleRig, placements: Record<JoyconPart, Placement>, tween: { duration: number; ease: Ease }, at: number) {
  for (const part of joycons) move(timeline, rig, rig[part], placements[part], tween, at);
}

function dockFrom(timeline: gsap.core.Timeline, rig: ConsoleRig, start: number): gsap.core.Timeline {
  const at = (seconds: number) => start + seconds;
  const dock = poses.docked;
  timeline.to(rig.look.target, { ...dockLook, duration: 1, ease: 'power2.inOut' }, at(0));
  timeline.to(rig.loading, { guide: 0, duration: 0.5, ease: 'power1.out' }, at(0));
  timeline.to(rig.loading, { bar: 1, duration: 0.5, ease: 'power1.out' }, at(0.5));
  timeline.to(rig.loading, { progress: 1, duration: 0.5, ease: 'power1.out' }, at(1));
  timeline.to(rig.loading, { bar: 0, duration: 0.5, ease: 'power1.out' }, at(1.5));
  // The console stays in hand while the camera turns, so the loading bar reads at full size before it flies to the dock.
  move(timeline, rig, rig.console, waypoints.dockHover, { duration: 0.9, ease: 'power2.inOut' }, at(1.1));
  joyconsTo(timeline, rig, joyconWaypoints.hop, { duration: 0.25, ease: 'back.out' }, at(2));
  joyconsTo(timeline, rig, joyconWaypoints.swing, { duration: 0.25, ease: 'power2.out' }, at(2.15));
  joyconsTo(timeline, rig, joyconWaypoints.preTilt, { duration: 0.5, ease: 'power2.inOut' }, at(2.4));
  move(timeline, rig, rig.console, dock.console, { duration: 0.5, ease: 'back.out' }, at(2.9));
  for (const fixture of [rig.dockFront, rig.dockBack]) {
    timeline.to(fixture.scale, { y: dockBeats.squashY, duration: 0.15, ease: 'power2.out' }, at(2.95));
    timeline.to(fixture.scale, { y: 1, duration: 0.35, ease: 'back.out' }, at(3.1));
  }
  timeline.to(rig.screenPower, { value: dock.signals.screenPower, duration: 0.5, ease: 'power1.out' }, at(2.9));
  timeline.to(rig.ledPower, { value: dock.signals.ledPower, duration: 0.5, ease: 'power1.out' }, at(2.9));
  timeline.to(rig.tvInput, { mix: tvMix[dock.signals.tvInput], duration: 0.5, ease: 'power1.out' }, at(2.9));
  // The screen is dark from here, so the guide row comes back unseen and is ready when the console undocks.
  timeline.set(rig.loading, { ...loadingRest }, at(3.4));
  timeline.to(rig.look.target, { ...neutralLook, duration: 0.8, ease: 'power2.inOut' }, at(3.4));
  joyconsTo(timeline, rig, dock, { duration: 0.5, ease: 'back.out' }, at(4.1));
  return timeline;
}

function undock(rig: ConsoleRig): gsap.core.Timeline {
  const timeline = paused();
  const desk = poses.onDesk;
  timeline.to(rig.tvInput, { mix: tvMix[desk.signals.tvInput], duration: 0.5, ease: 'power1.out' }, 0);
  timeline.to(rig.look.target, { ...dockLook, duration: 0.5, ease: 'power2.inOut' }, 0);
  move(timeline, rig, rig.console, waypoints.dockLift, { duration: 0.5, ease: 'power2.out' }, 0.5);
  timeline.to(rig.screenPower, { value: desk.signals.screenPower, duration: 0.5, ease: 'power1.out' }, 0.5);
  timeline.to(rig.ledPower, { value: desk.signals.ledPower, duration: 0.5, ease: 'power1.out' }, 0.5);
  for (const fixture of [rig.dockFront, rig.dockBack]) {
    const { popScale } = dockBeats;
    timeline.to(fixture.scale, { x: popScale, y: popScale, z: popScale, duration: 0.2, ease: 'power2.out' }, 1);
    timeline.to(fixture.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out' }, 1.2);
  }
  joyconsTo(timeline, rig, joyconWaypoints.swing, { duration: 0.3, ease: 'power2.inOut' }, 1.5);
  joyconsTo(timeline, rig, desk, { duration: 0.2, ease: 'power2.out' }, 1.8);
  move(timeline, rig, rig.console, waypoints.dockHover, { duration: 0.75, ease: 'back.out' }, 2);
  // Ends before the timeline does so the damped camera has caught up when the final snap lands.
  timeline.to(rig.look.target, { ...neutralLook, duration: 0.75, ease: 'power2.inOut' }, 2.35);
  // A back.out overshoot here would sink the console through the desk, so it lands without one.
  move(timeline, rig, rig.console, waypoints.deskLift, { duration: 0.5, ease: 'power2.inOut' }, 2.75);
  move(timeline, rig, rig.console, desk.console, { duration: 0.25, ease: 'power2.out' }, 3.25);
  return timeline;
}

export const timelines: { [K in EdgeKey]: (rig: ConsoleRig) => gsap.core.Timeline } = {
  'onDesk-pickUp': (rig) => {
    const timeline = paused();
    move(timeline, rig, rig.console, waypoints.deskLift, { duration: 0.25, ease: 'power2.out' }, 0);
    return move(timeline, rig, rig.console, poses.pickedUp.console, { duration: 0.5, ease: 'back.out' }, 0.25);
  },
  'pickedUp-focus': (rig) => move(paused(), rig, rig.console, poses.focused.console, { duration: 0.6, ease: 'back.out' }, 0),
  'focused-unfocus': (rig) => move(paused(), rig, rig.console, poses.pickedUp.console, { duration: 0.5, ease: 'back.out' }, 0),
  'pickedUp-dock': (rig) => dockFrom(paused(), rig, 0),
  'focused-dock': (rig) => {
    const timeline = paused();
    move(timeline, rig, rig.console, waypoints.leaveCentre, { duration: 0.5, ease: 'power2.inOut' }, 0);
    return dockFrom(timeline, rig, 0.5);
  },
  'docked-undock': undock,
};
