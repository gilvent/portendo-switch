import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

function useScrollTrigger() {
  const instances = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    const list = instances.current;
    return () => {
      list.forEach(instance => instance.kill());
      list.length = 0;
    };
  }, []);

  function create(vars: ScrollTrigger.StaticVars) {
    const instance = ScrollTrigger.create(vars);
    instances.current.push(instance);
    return instance;
  }

  return {
    create,
    instances: instances.current
  };
}

export default useScrollTrigger;
