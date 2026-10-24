import { describe, expect, it } from 'vitest';
import type { Edge } from '../console/model';
import { createRig, applyPose, type ConsoleRig } from '../rig/rig';
import { startTransition, type Playback } from './useTransitionDirector';

function fakeTimeline() {
  const timeline = { plays: 0, killed: false, onComplete: null as (() => void) | null };
  const playback: Playback = {
    eventCallback(_type, callback) {
      timeline.onComplete = callback;
    },
    play() {
      timeline.plays += 1;
    },
    kill() {
      timeline.killed = true;
    },
  };
  const reachEnd = () => {
    if (!timeline.killed) timeline.onComplete?.();
  };
  return { timeline, build: (_rig: ConsoleRig) => playback, reachEnd };
}

const dock: Edge = { from: 'pickedUp', via: 'dock', to: 'docked' };

function recorder(rig: ConsoleRig) {
  const finished: { edge: Edge; console: string | undefined; ledPower: number; tvMix: number }[] = [];
  const finish = (edge: Edge) => finished.push({ edge, console: rig.console.parent?.name, ledPower: rig.ledPower.value, tvMix: rig.tvInput.mix });
  return { finished, finish };
}

describe('startTransition', () => {
  it('plays the timeline it builds', () => {
    const rig = createRig();
    const fake = fakeTimeline();
    startTransition(rig, dock, fake.build, () => {});
    expect(fake.timeline).toMatchObject({ plays: 1, killed: false });
  });

  it('kills the timeline on cleanup, so a killed timeline never finishes', () => {
    const rig = createRig();
    applyPose(rig, 'pickedUp');
    const fake = fakeTimeline();
    const { finished, finish } = recorder(rig);
    const dispose = startTransition(rig, dock, fake.build, finish);
    dispose();
    fake.reachEnd();
    expect(fake.timeline.killed).toBe(true);
    expect(finished).toEqual([]);
  });

  it('snaps the destination pose before finishing, with the very edge object it was given', () => {
    const rig = createRig();
    applyPose(rig, 'pickedUp');
    const fake = fakeTimeline();
    const { finished, finish } = recorder(rig);
    startTransition(rig, dock, fake.build, finish);
    expect(finished).toEqual([]);
    fake.reachEnd();
    expect(finished).toEqual([{ edge: dock, console: 'anchor:dockSlot', ledPower: 1, tvMix: 1 }]);
    expect(finished[0]?.edge).toBe(dock);
  });

  it('finishes once when StrictMode mounts, cleans up and mounts again with the same edge', () => {
    const rig = createRig();
    applyPose(rig, 'pickedUp');
    const first = fakeTimeline();
    const second = fakeTimeline();
    const { finished, finish } = recorder(rig);
    const disposeFirst = startTransition(rig, dock, first.build, finish);
    disposeFirst();
    startTransition(rig, dock, second.build, finish);
    first.reachEnd();
    second.reachEnd();
    expect(finished.map((entry) => entry.edge)).toEqual([dock]);
    expect(finished[0]?.edge).toBe(dock);
    expect({ first: first.timeline.killed, second: second.timeline.killed }).toEqual({ first: true, second: false });
  });
});
