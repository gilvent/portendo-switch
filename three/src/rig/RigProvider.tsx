import { createContext, useContext, useState, type ReactNode } from 'react';
import { createRig, type ConsoleRig } from './rig';

const RigContext = createContext<ConsoleRig | null>(null);

export function RigProvider({ children }: { children: ReactNode }) {
  const [rig] = useState(createRig);
  return <RigContext.Provider value={rig}>{children}</RigContext.Provider>;
}

export function useRig(): ConsoleRig {
  const rig = useContext(RigContext);
  if (rig === null) throw new Error('useRig: called outside <RigProvider>');
  return rig;
}
