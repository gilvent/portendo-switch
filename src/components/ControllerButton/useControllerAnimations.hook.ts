import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function useControllerAnimations() {
  const toSingleConModeTransition = useRef<gsap.core.Timeline | null>(null);
  const toHandheldModeTransition = useRef<gsap.core.Timeline | null>(null);
  const toDetachedModeTransition = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    toSingleConModeTransition.current = toSingleConMode();
    toHandheldModeTransition.current = toHandheldMode();
    toDetachedModeTransition.current = toDetachedMode();
  }, []);

  function setScreenFromBelow(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="controller-button"]');
    const screen = q('[data-anim-target="screen"]');
    const guideText = q('[data-anim-target="guide-text"]');
    const loadingBar = q('[data-anim-target="loading-bar"]');
    const loadingProgress = q('[data-anim-target="loading-progress"]');
    const screenForeground = q('[data-anim-target="screen-foreground"]');
    const innerScreen = q('[data-anim-target="inner-screen"]');

    return gsap
      .timeline()
      .set(screen, {
        clearProps: 'all'
      })
      .set(screen, {
        translateY: 250
      })
      .set(
        guideText,
        {
          clearProps: 'all'
        },
        0
      )
      .set(
        loadingBar,
        {
          clearProps: 'all'
        },
        0
      )
      .set(
        screenForeground,
        {
          clearProps: 'all'
        },
        0
      )
      .set(
        innerScreen,
        {
          clearProps: 'all'
        },
        0
      )
      .set(
        loadingProgress,
        {
          clearProps: 'all'
        },
        0
      );
  }

  function toHandheldMode(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="controller-button"]');
    const screen = q('[data-anim-target="screen"]');

    return gsap
      .timeline({
        paused: true
      })
      .add(setScreenFromBelow())
      .addLabel('detached')
      .to(q('[data-anim-target="left-joycon"]'), {
        clearProps: 'all',
        translateY: 0,
        translateX: -125,
        rotate: 0
      })
      .to(
        q('[data-anim-target="right-joycon"]'),
        {
          clearProps: 'all',
          translateY: 0,
          translateX: 125,
          rotate: 0
        },
        '<'
      )
      .to(screen, {
        translateY: 0,
        ease: 'back.out',
        duration: 0.75
      })
      .addLabel('handheld');
  }

  function gatherCon(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="controller-button"]');

    return gsap
      .timeline({
        defaults: {
          duration: 0.5
        }
      })
      .to(q('[data-anim-target="left-joycon"]'), {
        translateY: -26,
        translateX: -30,
        rotate: 50
      })
      .to(
        q('[data-anim-target="right-joycon"]'),
        {
          translateY: 26,
          translateX: 35,
          rotate: 50
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
        q('[data-anim-target="left-joycon"]'),
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
        q('[data-anim-target="right-joycon"]'),
        {
          top: 0,
          translateY: 0,
          translateX: 0,
          rotate: -90
        },
        '<'
      );
  }

  function screenLoading(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="screen"]');
    const guideText = q('[data-anim-target="guide-text"]');
    const loadingBar = q('[data-anim-target="loading-bar"]');
    const loadingProgress = q('[data-anim-target="loading-progress"]');
    const screenForeground = q('[data-anim-target="screen-foreground"]');
    const innerScreen = q('[data-anim-target="inner-screen"]');

    return gsap
      .timeline({
        defaults: {
          duration: 0.5
        }
      })
      .to(guideText, {
        autoAlpha: 0
      })
      .to(loadingBar, {
        autoAlpha: 1
      })
      .to(loadingProgress, {
        translateX: 0
      })
      .to(screenForeground, {
        autoAlpha: 0
      })
      .to(
        innerScreen,
        {
          background: '#fff'
        },
        '<'
      );
  }

  function toDetachedMode(): gsap.core.Timeline {
    const q = gsap.utils.selector('[data-anim-target="controller-button"]');
    const screen = q('[data-anim-target="screen"]');
    const con1 = q('[data-anim-target="left-joycon"]');
    const con2 = q('[data-anim-target="right-joycon"]');

    return gsap
      .timeline({ paused: true })
      .addLabel('handheld')
      .add(screenLoading())
      .to(con1, {
        translateY: -25,
        duration: 0.5,
        ease: 'back.out'
      })
      .to(
        con2,
        {
          translateY: 25,
          duration: 0.5,
          ease: 'back.out'
        },
        '<'
      )
      .to(
        con1,
        {
          translateY: -25,
          translateX: -145,
          rotate: -15
        },
        '>-0.1'
      )
      .to(
        con2,
        {
          translateX: 145,
          rotate: 15
        },
        '<'
      )
      .to(
        screen,
        {
          scale: 20,
          transformOrigin: 'center 75%',
          autoAlpha: 0,
          duration: 1.5
        },
        '<1'
      )
      .add(gatherCon())
      .add(setScreenFromBelow())
      .addLabel('detached');
  }

  function enterDetachedMode(): void {
    const controller = document.querySelector(
      '[data-anim-target="controller-button"]'
    );
    toDetachedModeTransition?.current
      ?.seek('detached')
      .fromTo(
        controller,
        {
          translateY: 250
        },
        {
          translateY: 0,
          duration: 1.25,
          ease: 'back.out'
        }
      )
      .play();
  }

  function enterHandheldMode(): void {
    const controller = document.querySelector(
      '[data-anim-target="controller-button"]'
    );
    gsap.timeline().fromTo(
      controller,
      {
        translateY: 250
      },
      {
        translateY: 0,
        duration: 1.25,
        ease: 'back.out'
      }
    );
  }

  return {
    toSingleConModeTransition,
    toHandheldModeTransition,
    toDetachedModeTransition,
    enterDetachedMode,
    enterHandheldMode
  };
}

export default useControllerAnimations;
