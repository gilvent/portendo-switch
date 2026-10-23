import { useEffect } from 'react';
import { useConsole, useFinishTransition } from '../console/ConsoleProvider';

export function useTransitionDirector() {
  const { model } = useConsole();
  const finishTransition = useFinishTransition();
  const edge = model.phase.kind === 'transitioning' ? model.phase.edge : null;

  useEffect(() => {
    if (edge === null) return;
    finishTransition(edge);
  }, [edge, finishTransition]);
}
