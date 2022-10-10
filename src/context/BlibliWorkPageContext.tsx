import usePreviousState from '@/hooks/usePreviousState';
import React, { useState } from 'react';
import { createContext } from 'react';

type BlibliProviderValue = {
  activePDPArticleIndex: number;
  prevPDPArticleIndex: number;
  setActivePDPArticle: Function;
};

const BlibliWorkPageContext = createContext<BlibliProviderValue>({
  activePDPArticleIndex: 0,
  prevPDPArticleIndex: 0,
  setActivePDPArticle: () => {}
});

function BlibliWorkPageProvider({ children }: { children: React.ReactNode }) {
  const [activePDPArticleIndex, setActivePDPArticle] = useState(0);
  const prevPDPArticleIndex = usePreviousState(activePDPArticleIndex);
  const providerValue = {
    activePDPArticleIndex,
    prevPDPArticleIndex,
    setActivePDPArticle
  };

  return (
    <BlibliWorkPageContext.Provider value={providerValue}>
      {children}
    </BlibliWorkPageContext.Provider>
  );
}

export { BlibliWorkPageProvider };
export default BlibliWorkPageContext;
