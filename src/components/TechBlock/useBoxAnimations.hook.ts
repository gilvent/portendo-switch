import gsap from 'gsap';
import { RefObject, useEffect, useRef } from 'react';
import { BoxRefs } from './types';

export default function useBoxEnterAnimation(
  triggerRef: RefObject<HTMLElement>,
  boxesRefsMap: Record<string, BoxRefs>
) {
  const enterAnimTimeline = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );
  const isPlayingEnterAnimation = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      enterAnimTimeline.current.kill();
    };
  }, []);

  function boxNameShowUp(box: BoxRefs): gsap.core.Timeline {
    return gsap
      .timeline({
        paused: true
      })
      .fromTo(
        box.overlayRef.current,
        {
          immediateRender: false,
          scale: 0,
          duration: 0.5
        },
        {
          scale: 2
        }
      )
      .to(
        box.textRef.current,
        {
          opacity: 1,
          duration: 0.5
        },
        '<'
      );
  }

  function multipleBoxesExpand(): gsap.core.Timeline {
    const boxExpandTimelines: Array<gsap.core.Timeline> = Object.values(
      boxesRefsMap
    ).map(boxRef => {
      return gsap
        .timeline()
        .to(boxRef.overlayRef.current, { scale: 2 }, 0)
        .to(boxRef.textRef.current, { opacity: 1 }, 0)
        .fromTo(
          boxRef.rootRef.current,
          { scale: 0.3, opacity: 0, duration: 0.3 },
          { scale: 1.1, opacity: 1 }
        )
        .to(boxRef.rootRef.current, { scale: 1, duration: 0.3 }, '>0.1');
    });

    return boxExpandTimelines.reduce((tl, boxEnter) => {
      return tl.add(boxEnter, Math.random() * 0.5);
    }, gsap.timeline());
  }

  function boxesLogoUnfold(): gsap.core.Timeline {
    const timelines: Array<gsap.core.Timeline> = Object.values(
      boxesRefsMap
    ).map(boxRef => {
      return gsap
        .timeline()
        .to(boxRef.textRef.current, { opacity: 0, duration: 0.5 }, 0)
        .to(boxRef.overlayRef.current, {
          scale: 0,
          duration: 0.7
        });
    });

    return timelines.reduce((tl, logoUnfold) => {
      return tl.add(logoUnfold, Math.random() * 0.5);
    }, gsap.timeline());
  }

  function setupEnterAnimation() {
    const boxesExpand = multipleBoxesExpand();
    const logoUnfold = boxesLogoUnfold();
    enterAnimTimeline.current = gsap
      .timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'start 50%',
          end: '50% center'
        }
      })
      .add(boxesExpand)
      .add(logoUnfold, '>0.3')
      .eventCallback('onStart', () => {
        isPlayingEnterAnimation.current = true;
      })
      .eventCallback('onComplete', () => {
        isPlayingEnterAnimation.current = false;
      });
  }

  function attachHoverAnimation(box: BoxRefs) {
    const animation = boxNameShowUp(box);
    box.rootRef.current?.addEventListener('mouseover', () => {
      if (isPlayingEnterAnimation.current) return;
      animation.play();
    });
    box.rootRef.current?.addEventListener('mouseleave', () => {
      if (isPlayingEnterAnimation.current) return;
      animation.reverse();
    });
  }

  function setupHoverAnimation() {
    Object.values(boxesRefsMap).forEach(box => {
      attachHoverAnimation(box);
    });
  }

  return { setupEnterAnimation, setupHoverAnimation };
}
