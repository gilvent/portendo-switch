import { useLayoutEffect } from 'react';
import { useConsole, useFinishTransition } from '../console/ConsoleProvider';
import { applyPose } from '../rig/rig';
import { useRig } from '../rig/RigProvider';

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
    applyPose(rig, phase.edge.to);
    finishTransition(phase.edge);
  }, [phase, rig, finishTransition]);
}
