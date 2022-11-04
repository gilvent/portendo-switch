import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

function useStandaloneScrollTrigger(vars: ScrollTrigger.StaticVars) {
  const scrollTrigger = useRef<ScrollTrigger>();
  const [isActive, setIsActive] = useState<boolean>(false);

  function onToggle(self: ScrollTrigger) {
    setIsActive(self.isActive);
    vars.onToggle && vars.onToggle(self);
  }

  useEffect(() => {
    scrollTrigger.current = ScrollTrigger.create({
      ...vars,
      onToggle
    });
  }, []);

  return {
    scrollTrigger,
    isActive
  };
}

export default useStandaloneScrollTrigger;
