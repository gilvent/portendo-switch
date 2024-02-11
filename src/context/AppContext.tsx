import React, { useEffect, useRef, useState } from 'react';
import { createContext } from 'react';
import { useLocation } from 'react-router-dom';

export enum PageHistoryID {
  Home = 'HOME',
  Work = 'WORK',
  Default = '/'
}

type AppProviderValue = {
  pageHistory: any;
};

const AppContext = createContext<AppProviderValue>({
  pageHistory: []
});

function AppProvider({ children }: { children: React.ReactNode }) {
  const pageHistory = useRef<string[]>([]);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== pageHistory.current[pageHistory.current.length - 1])
      pageHistory.current.push(pathname);
  }, [pathname]);

  const providerValue = {
    pageHistory
  };

  return (
    <AppContext.Provider value={providerValue}>{children}</AppContext.Provider>
  );
}

export { AppProvider };
export default AppContext;
