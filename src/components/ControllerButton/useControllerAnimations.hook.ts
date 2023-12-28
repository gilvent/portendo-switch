import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function useControllerAnimations() {
  const toDetachedConModeAnimation = useRef<gsap.core.Timeline | null>(null);
  const toSingleConModeAnimation = useRef<gsap.core.Timeline | null>(null);
  const toAttachedMode = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    toDetachedConModeAnimation.current = toDetachedConMode();
    toSingleConModeAnimation.current = toSingleConMode();
    toAttachedMode.current = toSingleMode();
  }, []);

  function toSingleMode(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="controller-button"]');

    return gsap
      .timeline({
        paused: true,
        defaults: {
          delay: 1.5,
          duration: 0.5
        }
      })
      .to(q('[data-anim-target="controller-group"]:nth-child(1)'), {
        top: 0,
        translateY: 0,
        translateX: 0,
        rotate: -40,
        gap: 20
      })
      .to(
        q('[data-anim-target="controller-group"]:nth-child(2)'),
        {
          top: 0,
          translateY: 0,
          translateX: 0,
          rotate: -40,
          gap: 20
        },
        '<'
      );
  }

  function toDetachedConMode(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="controller-button"]');

    return gsap
      .timeline({ paused: true })
      .to(q('[data-anim-target="controller-group"]:nth-child(1)'), {
        top: '-30%',
        translateY: -5,
        translateX: '-22.5%',
        rotate: -40
      })
      .to(
        q('[data-anim-target="controller-group"]:nth-child(2)'),
        {
          top: '30%',
          translateY: 5,
          translateX: '22.5%',
          rotate: -40
        },
        '<'
      );
  }

  function toSingleConMode(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="controller-button"]');

    return gsap
      .timeline({
        paused: true
      })
      .to(document.querySelector('[data-anim-target="controller-button"]'), {
        right: 40
      })
      .to(
        q('[data-anim-target="controller-group"]:nth-child(1)'),
        {
          top: 0,
          translateY: 0,
          translateX: 0,
          rotate: -90,
          autoAlpha: 0
        },
        '<'
      )
      .to(
        q('[data-anim-target="controller-group"]:nth-child(2)'),
        {
          top: 0,
          translateY: 0,
          translateX: 0,
          rotate: -90
        },
        '<'
      );
  }

  return {
    toDetachedConModeAnimation,
    toSingleConModeAnimation,
    toAttachedMode
  };
}

export default useControllerAnimations;
