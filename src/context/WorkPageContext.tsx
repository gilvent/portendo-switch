// TODO currently unused, remove this later
import React, { useEffect, useState } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';
import { WorkDetailName } from '@/utils/enums';

type WorkPageProviderValue = {
  openWorkDetail: () => void;
  closeWorkDetail: () => void;
  activeWorkDetail: WorkDetailName | null;
  workDetailNameByPath: Record<string, WorkDetailName>;
};

const workDetailNameByPath: Record<string, WorkDetailName> = {
  '/work/blibli': WorkDetailName.Blibli,
  '/work/moperty': WorkDetailName.Moperty
};

const WorkPageContext = createContext<WorkPageProviderValue>({
  activeWorkDetail: null,
  openWorkDetail: () => {},
  closeWorkDetail: () => {},
  workDetailNameByPath
});

function WorkPageProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkDetail, setActiveWorkDetail] =
    useState<WorkDetailName | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    closeWorkDetail();
  }, [pathname]);

  function openWorkDetail() {
    setActiveWorkDetail(workDetailNameByPath[pathname] ?? null);
  }

  function closeWorkDetail() {
    setActiveWorkDetail(null);
  }

  const providerValue = {
    activeWorkDetail,
    workDetailNameByPath,
    closeWorkDetail,
    openWorkDetail
  };

  return (
    <WorkPageContext.Provider value={providerValue}>
      {children}
    </WorkPageContext.Provider>
  );
}

export { WorkPageProvider };
export default WorkPageContext;
