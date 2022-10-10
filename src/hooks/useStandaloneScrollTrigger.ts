import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

function useStandaloneScrollTrigger(options: ScrollTrigger.StaticVars) {
  const scrollTrigger = useRef<ScrollTrigger>();
  const [isActive, setIsActive] = useState<boolean>(false);

  function onToggle(self: ScrollTrigger) {
    setIsActive(self.isActive);
    options.onToggle && options.onToggle(self);
  }

  useEffect(() => {
    scrollTrigger.current = ScrollTrigger.create({
      ...options,
      onToggle
    });
  }, []);

  return {
    scrollTrigger,
    isActive
  };
}

export default useStandaloneScrollTrigger;
