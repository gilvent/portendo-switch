import { useEffect, useState } from 'react';
import type { MediaQueryScreen } from '@/utils/enums';

function useMediaQuery(query: MediaQueryScreen) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const matchQueryList = window.matchMedia(query);
    setMatches(matchQueryList.matches);
    matchQueryList.addEventListener('change', handleChange);
    return () => {
      matchQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  function handleChange(e: MediaQueryListEvent) {
    setMatches(e.matches);
  }

  return matches;
}

export default useMediaQuery;
