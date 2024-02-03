import { useRef } from 'react';

function useCustomEvent(key: string) {
  const handlerFn = useRef<() => any | null>();

  function addListener(fn: () => void) {
    handlerFn.current = fn;
    document.addEventListener(key, fn);
  }

  function removeListener() {
    if (handlerFn.current) {
      document.removeEventListener(key, handlerFn.current);
    }
  }

  function dispatchEvent(options?: { detail: any }) {
    const event = new CustomEvent(key, options);
    document.dispatchEvent(event);
  }

  return { addListener, dispatchEvent, removeListener };
}

export default useCustomEvent;
