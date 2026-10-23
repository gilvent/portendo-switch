import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { available, initialModel, reduce, type ConsoleEvent, type ConsoleModel, type UserInput } from './model';

type ConsoleContextValue = {
  model: ConsoleModel;
  send: (event: ConsoleEvent) => void;
  available: UserInput[];
};

declare global {
  interface Window {
    __portendo?: { model(): ConsoleModel };
  }
}

const ConsoleContext = createContext<ConsoleContextValue | null>(null);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [model, send] = useReducer(reduce, initialModel);
  const value = useMemo(() => ({ model, send, available: available(model) }), [model]);

  useEffect(() => {
    if (import.meta.env.DEV) window.__portendo = { model: () => model };
  }, [model]);

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole(): ConsoleContextValue {
  const value = useContext(ConsoleContext);
  if (value === null) throw new Error('useConsole: called outside <ConsoleProvider>');
  return value;
}
