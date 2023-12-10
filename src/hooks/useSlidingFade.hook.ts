import gsap from 'gsap';
import { RefObject, useCallback, useEffect } from 'react';
import useScrollTrigger from './useScrollTrigger.hook';

function useSlidingFade({
  triggerRef,
  stayVisible = false
}: {
  triggerRef: RefObject<Element>;
  stayVisible?: boolean;
}) {
  const FLOATING_DISTANCE = 50;
  const { create } = useScrollTrigger();

  const applySlidingFade = useCallback((el: any | Element) => {
    el?.setAttribute('data-floating-fade', 'true');
  }, []);

  useEffect(() => {
    const q = gsap.utils.selector(triggerRef.current);
    const elements = q('[data-floating-fade="true"]');
    create({
      trigger: triggerRef.current,
      start: 'top 70%',
      end: 'bottom top',
      once: stayVisible,
      onEnter: _ => {
        fadeIn(elements);
      },
      onLeave: _ => {
        if (stayVisible) return;
        fadeOut(elements);
      },
      onEnterBack: _ => {
        if (stayVisible) return;
        const reversed = [...elements].reverse();
        fadeIn(reversed, false);
      },
      onLeaveBack: _ => {
        if (stayVisible) return;
        fadeOut(elements);
      }
    });
  });

  function fadeOut(els: Element[]) {
    return gsap.to(els, {
      autoAlpha: 0
    });
  }

  function fadeIn(els: Element[], slideUp: boolean = true): gsap.core.Tween {
    return gsap.fromTo(
      els,
      {
        autoAlpha: 0,
        y: slideUp ? FLOATING_DISTANCE : -FLOATING_DISTANCE,
        duration: 1.25
      },
      {
        autoAlpha: 1,
        y: 0,
        ease: 'back',
        stagger: 0.15
      }
    );
  }

  return { applySlidingFade };
}

export default useSlidingFade;
