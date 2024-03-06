import valueForScreen from '@/utils/window';
import gsap from 'gsap';

// value should be the same as initially set in CSS
const joyconInitialTranslateX = 112;

function reset(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="controller-button"]');
  const screen = q('[data-anim-target="screen"]');
  const guideText = q('[data-anim-target="guide-text"]');
  const loadingBar = q('[data-anim-target="loading-bar"]');
  const loadingProgress = q('[data-anim-target="loading-progress"]');
  const dockFront = q('[data-anim-target="dock-front"');
  const dockBack = q('[data-anim-target="dock-back"');
  const shutDownOverlay = q('[data-anim-target="shut-down-overlay"]');

  return gsap
    .timeline()
    .set(screen, {
      clearProps: 'all'
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
      loadingProgress,
      {
        clearProps: 'all'
      },
      0
    )
    .set(
      dockFront,
      {
        clearProps: true
      },
      0
    )
    .set(
      dockBack,
      {
        clearProps: true
      },
      0
    )
    .set(
      shutDownOverlay,
      {
        clearProps: true
      },
      0
    );
}

export function dockToHandheld(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="controller-button"]');
  const screen = q('[data-anim-target="screen"]');
  const leftCon = q('[data-anim-target="left-joycon"]');
  const rightCon = q('[data-anim-target="right-joycon"]');
  const dockFront = q('[data-anim-target="dock-front"]');
  const dockBack = q('[data-anim-target="dock-back"]');
  const shutDownOverlay = q('[data-anim-target="shut-down-overlay"]');
  const led = q('[data-anim-target="led"]');

  return gsap
    .timeline()
    .addLabel('docked')
    .to(screen, {
      translateY: '-80%',
      translateX: 10,
      rotate: 15
    })
    .to(
      led,
      {
        clearProps: true
      },
      '<'
    )
    .to(
      shutDownOverlay,
      {
        clearProps: true
      },
      '<'
    )
    .addLabel('detached-from-dock')
    .to(
      dockFront,
      {
        zIndex: 2,
        delay: 2
      },
      '<'
    )
    .to(
      dockFront,
      {
        scale: 0.8
      },
      '<'
    )
    .to(
      dockBack,
      {
        scale: 0.8
      },
      '<'
    )
    .to(
      screen,
      {
        translateY: 0,
        translateX: 0,
        rotate: 0
      },
      '>-0.2'
    )
    .to(leftCon, {
      translateY: 0,
      translateX: -joyconInitialTranslateX,
      rotate: 0
    })
    .to(
      rightCon,
      {
        translateY: 0,
        translateX: joyconInitialTranslateX,
        rotate: 0
      },
      '<'
    )
    .to(screen, {
      translateY: 0,
      ease: 'back.out',
      duration: 0.75
    })
    .add(reset())
    .addLabel('handheld');
}

export function dockToScreenMode(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="controller-button"]');
  const leftCon = q('[data-anim-target="left-joycon"]');
  const rightCon = q('[data-anim-target="right-joycon"]');
  const dockScreenWrapper = q('[data-anim-target="dock-screen-wrapper"]');

  return gsap
    .timeline({
      defaults: {
        duration: 0.5
      }
    })
    .addLabel('dock-visible')
    .to(dockScreenWrapper, {
      delay: 2,
      translateY: valueForScreen(
        {
          desktop: '30vh'
        },
        '25vh'
      ),
      ease: 'back.in'
    })
    .to(leftCon, {
      translateX: -28,
      translateY: -24,
      rotate: 50
    })
    .to(
      rightCon,
      {
        translateX: 33,
        translateY: 24,
        rotate: 50
      },
      '<'
    )
    .addLabel('screen-mode')
    .call(() => {
      gsap.set(dockScreenWrapper, {
        display: 'none'
      });
    });
}

export function screenModeToDock(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="controller-button"]');
  const dockScreenWrapper = q('[data-anim-target="dock-screen-wrapper"]');

  return gsap
    .timeline()
    .set(dockScreenWrapper, {
      display: 'unset'
    })
    .to(q('[data-anim-target="left-joycon"]'), {
      translateY: 0,
      translateX: -128,
      rotate: 0,
      duration: 0.25
    })
    .to(
      q('[data-anim-target="right-joycon"]'),
      {
        translateY: 0,
        translateX: 128,
        rotate: 0,
        duration: 0.25
      },
      '<'
    )
    .to(dockScreenWrapper, {
      translateY: 0,
      ease: 'back.out'
    });
}

export function screenModeToSingleCon(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="controller-button"]');
  const con = document.querySelector('[data-anim-target="controller-button"]');
  const conRightPos =
    window.innerWidth / 2 + (con?.getBoundingClientRect()?.width ?? 75) / 2;
  const conTranslateDistance = window.innerWidth - 24 - conRightPos;

  return gsap
    .timeline()
    .addLabel('screen-mode')
    .to(con, {
      translateX: valueForScreen({ desktop: 0 }, conTranslateDistance)
    })
    .to(
      q('[data-anim-target="left-joycon"]'),
      {
        translateY: 0,
        translateX: 0,
        rotate: 0,
        autoAlpha: 0
      },
      '<'
    )
    .to(
      q('[data-anim-target="right-joycon"]'),
      {
        translateY: 0,
        translateX: 0,
        rotate: 0
      },
      '<'
    )
    .addLabel('single-con-mode');
}

export function singleConToScreenMode(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="controller-button"]');
  const leftCon = q('[data-anim-target="left-joycon"]');
  const rightCon = q('[data-anim-target="right-joycon"]');

  return gsap
    .timeline()
    .addLabel('single-con-mode')
    .to(document.querySelector('[data-anim-target="controller-button"]'), {
      translateX: 0,
      translateY: 0
    })
    .to(
      leftCon,
      {
        translateX: -28,
        translateY: -24,
        rotate: 50,
        autoAlpha: 1
      },
      '<'
    )
    .to(
      rightCon,
      {
        translateX: 33,
        translateY: 24,
        rotate: 50
      },
      '<'
    )
    .addLabel('screen-mode');
}

function screenLoading(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="screen"]');
  const guideText = q('[data-anim-target="guide-text"]');
  const loadingBar = q('[data-anim-target="loading-bar"]');
  const loadingProgress = q('[data-anim-target="loading-progress"]');

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
    .to(loadingBar, {
      autoAlpha: 0
    });
}

export function handheldToDocked(): gsap.core.Timeline {
  const q = gsap.utils.selector('[data-anim-target="controller-button"]');
  const screen = q('[data-anim-target="screen"]');
  const leftCon = q('[data-anim-target="left-joycon"]');
  const rightCon = q('[data-anim-target="right-joycon"]');
  const dockFront = q('[data-anim-target="dock-front"]');
  const dockBack = q('[data-anim-target="dock-back"]');
  const shutDownOverlay = q('[data-anim-target="shut-down-overlay"]');
  const led = q('[data-anim-target="led"]');

  return gsap
    .timeline()
    .addLabel('handheld')
    .add(screenLoading())
    .to(leftCon, {
      translateY: -25,
      duration: 0.25,
      ease: 'back.out'
    })
    .to(
      rightCon,
      {
        translateY: 25,
        duration: 0.25,
        ease: 'back.out'
      },
      '<'
    )
    .to(
      leftCon,
      {
        translateY: -25,
        translateX: -145,
        rotate: -15,
        duration: 0.25
      },
      '>-0.1'
    )
    .to(
      rightCon,
      {
        translateX: 145,
        rotate: 15,
        duration: 0.25
      },
      '<'
    )
    .to(
      screen,
      {
        translateY: '-50%'
      },
      '<'
    )
    .to(dockFront, {
      translateY: '-5%',
      autoAlpha: 1
    })
    .to(
      dockBack,
      {
        translateY: '-5%',
        autoAlpha: 1
      },
      '<'
    )
    .to(screen, {
      translateY: 0,
      ease: 'back.out'
    })
    .to(
      dockFront,
      {
        translateY: 0,
        autoAlpha: 1,
        ease: 'back.out'
      },
      '<'
    )
    .to(
      dockBack,
      {
        translateY: 0,
        autoAlpha: 1,
        ease: 'back.out'
      },
      '<'
    )
    .to(
      shutDownOverlay,
      {
        background: '#000'
      },
      '<'
    )
    .to(
      led,
      {
        background: 'rgb(178, 252, 125)'
      },
      '<'
    )
    .addLabel('docked');
}

export function startScreenMode(): gsap.core.Timeline {
  const controller = document.querySelector(
    '[data-anim-target="controller-button"]'
  );

  return gsap
    .timeline()
    .call(() => {
      handheldToDocked().seek('docked');
    })
    .call(() => {
      dockToScreenMode().seek('screen-mode');
    })
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
    );
}

export function startHandheldMode(): gsap.core.Timeline {
  const controller = document.querySelector(
    '[data-anim-target="controller-button"]'
  );
  return gsap.timeline().to(controller, {
    translateY: 0,
    duration: 1.25,
    ease: 'back.out'
  });
}

export function startSingleConMode(): gsap.core.Timeline {
  const controller = document.querySelector(
    '[data-anim-target="controller-button"]'
  );

  return gsap
    .timeline()
    .call(() => {
      handheldToDocked().seek('docked');
    })
    .call(() => {
      dockToScreenMode().seek('screen-mode');
    })
    .call(() => {
      screenModeToSingleCon().seek('single-con-mode');
    })
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
    );
}
