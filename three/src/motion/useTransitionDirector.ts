import { useEffect } from 'react';
import { useConsole } from '../console/ConsoleProvider';

export function useTransitionDirector() {
  const { model, send } = useConsole();
  const edge = model.phase.kind === 'transitioning' ? model.phase.edge : null;

  useEffect(() => {
    if (edge === null) return;
    send({ type: 'transitionDone' });
  }, [edge, send]);
}
