import { useEffect, useRef } from 'react';

function useMountedEffect(): boolean {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  return mounted.current;
}

export default useMountedEffect;
