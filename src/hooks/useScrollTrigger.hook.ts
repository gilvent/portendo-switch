import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

function useScrollTrigger() {
  const instance = useRef<ScrollTrigger>();

  useEffect(() => {
    return () => {
      instance.current?.kill();
    };
  }, []);

  function create(vars: ScrollTrigger.StaticVars) {
    instance.current = ScrollTrigger.create(vars);
  }

  return {
    create,
    instance: instance.current
  };
}

export default useScrollTrigger;
