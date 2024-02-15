// TODO currently unused, remove this later
import React, { useEffect, useState } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';
import { WorkHighlightName } from '@/utils/enums';

type WorkPageProviderValue = {
  openWorkHighlight: () => void;
  closeWorkHighlight: () => void;
  activeWorkHighlight: WorkHighlightName | null;
  workDetailNameByPath: Record<string, WorkHighlightName>;
};

const workDetailNameByPath: Record<string, WorkHighlightName> = {
  '/work/blibli': WorkHighlightName.Blibli,
  '/work/moperty': WorkHighlightName.Moperty
};

const WorkPageContext = createContext<WorkPageProviderValue>({
  activeWorkHighlight: null,
  openWorkHighlight: () => {},
  closeWorkHighlight: () => {},
  workDetailNameByPath
});

function WorkPageProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkHighlight, setActiveWorkHighlight] =
    useState<WorkHighlightName | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    closeWorkHighlight();
  }, [pathname]);

  function openWorkHighlight() {
    setActiveWorkHighlight(workDetailNameByPath[pathname] ?? null);
  }

  function closeWorkHighlight() {
    setActiveWorkHighlight(null);
  }

  const providerValue = {
    activeWorkHighlight,
    workDetailNameByPath,
    closeWorkHighlight,
    openWorkHighlight
  };

  return (
    <WorkPageContext.Provider value={providerValue}>
      {children}
    </WorkPageContext.Provider>
  );
}

export { WorkPageProvider };
export default WorkPageContext;
