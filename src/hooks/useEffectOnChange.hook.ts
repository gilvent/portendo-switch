// https://www.joshwcomeau.com/react/file-structure/#hooks-5

import { useEffect, useRef } from 'react';

function useEffectOnChange(callback: () => any, deps: any[]) {
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    callback();
  }, deps);
}

export default useEffectOnChange;
