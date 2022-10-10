import { useEffect, useRef } from 'react';

function usePreviousState(state: any) {
  const previousValue = useRef(state);

  useEffect(() => {
    previousValue.current = state;
  });

  return previousValue.current;
}

export default usePreviousState;
