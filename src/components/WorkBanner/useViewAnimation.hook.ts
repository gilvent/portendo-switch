import { RefObject, useEffect, useRef } from 'react';
import gsap from 'gsap';

type HookParams = {
  headingRef: RefObject<HTMLDivElement>;
  logoRef: RefObject<HTMLDivElement>;
  descriptionRef: RefObject<HTMLDivElement>;
  active: boolean;
};

const useViewAnimation = (params: HookParams) => {
  const viewAnimation = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );

  useEffect(initViewAnimation, []);

  useEffect(onActivated, [params.active]);

  function initViewAnimation() {
    viewAnimation.current
      .to(
        params.headingRef.current,
        {
          fontSize: '96px',
          duration: 0.5
        },
        0
      )
      .to(
        params.logoRef.current,
        {
          opacity: 0,
          duration: 0.3
        },
        0
      )
      .fromTo(
        params.descriptionRef.current,
        {
          y: 50,
          opacity: 0,
          duration: 0.3
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3
        },
        '<0.3'
      );
  }

  function onActivated() {
    viewAnimation.current.play();
    viewAnimation.current.reversed(!params.active);
  }
};

export default useViewAnimation;
