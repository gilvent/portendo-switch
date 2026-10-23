import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { exposeDevHandle } from '../dev/devHandle';
import { available, initialModel, reduce, type ConsoleModel, type Edge, type UserInput } from './model';

type ConsoleContextValue = {
  model: ConsoleModel;
  send: (input: UserInput) => void;
  available: UserInput[];
};

const ConsoleContext = createContext<ConsoleContextValue | null>(null);
const FinishTransitionContext = createContext<((edge: Edge) => void) | null>(null);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [model, dispatch] = useReducer(reduce, initialModel);
  const value = useMemo(() => ({ model, send: dispatch, available: available(model) }), [model]);
  const finishTransition = useCallback((edge: Edge) => dispatch({ type: 'transitionDone', edge }), []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    return exposeDevHandle({ model: () => model });
  }, [model]);

  return (
    <ConsoleContext.Provider value={value}>
      <FinishTransitionContext.Provider value={finishTransition}>{children}</FinishTransitionContext.Provider>
    </ConsoleContext.Provider>
  );
}

export function useConsole(): ConsoleContextValue {
  const value = useContext(ConsoleContext);
  if (value === null) throw new Error('useConsole: called outside <ConsoleProvider>');
  return value;
}

export function useFinishTransition(): (edge: Edge) => void {
  const finish = useContext(FinishTransitionContext);
  if (finish === null) throw new Error('useFinishTransition: called outside <ConsoleProvider>');
  return finish;
}
