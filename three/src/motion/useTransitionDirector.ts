import { useLayoutEffect } from 'react';
import { useConsole, useFinishTransition } from '../console/ConsoleProvider';
import type { Edge } from '../console/model';
import { applyPose, type ConsoleRig } from '../rig/rig';
import { useRig } from '../rig/RigProvider';
import { edgeKey, timelines } from './timelines';

export type Playback = {
  eventCallback(type: 'onComplete', callback: () => void): unknown;
  play(): unknown;
  kill(): unknown;
};

export function startTransition(rig: ConsoleRig, edge: Edge, build: (rig: ConsoleRig) => Playback, finish: (edge: Edge) => void): () => void {
  const playback = build(rig);
  playback.eventCallback('onComplete', () => {
    applyPose(rig, edge.to);
    finish(edge);
  });
  playback.play();
  return () => {
    playback.kill();
  };
}

export function useTransitionDirector() {
  const { model } = useConsole();
  const finishTransition = useFinishTransition();
  const rig = useRig();
  const { phase } = model;

  useLayoutEffect(() => {
    if (phase.kind === 'settled') {
      applyPose(rig, phase.state);
      return;
    }
    return startTransition(rig, phase.edge, timelines[edgeKey(phase.edge)], finishTransition);
  }, [phase, rig, finishTransition]);
}
