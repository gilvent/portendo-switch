import valueForScreen from '@/utils/window';
import gsap from 'gsap';
// based on ball element's css "top" property
export const BALL_TOP_POS = -150;

export function getBallPlaceholderEl(workBannerId: string): Element | null {
  return document.querySelector(
    `${workBannerId} [data-anim-target="ball-placeholder"]`
  );
}

export function getBannerCoverEls(workBannerId: string): Array<any> {
  const selectors = [
    `${workBannerId} [data-anim-target="cover-role"]`,
    `${workBannerId} [data-anim-target="cover-title"]`,
    `${workBannerId} [data-anim-target="cover-description"]`
  ];
  return selectors.map(selector => document.querySelector(selector));
}

export function bounceImpact(pointerBallEl: Element | null) {
  return gsap
    .timeline({
      defaults: {
        duration: 0.25
      }
    })
    .to(pointerBallEl, {
      transformOrigin: '50% 100%',
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 0.25
    });
}

export function bounce({
  bounceGroundY,
  airCount,
  bounceHeightY = 150
}: {
  bounceGroundY: number;
  airCount: number;
  bounceHeightY?: number;
}): gsap.core.Timeline {
  let tl = gsap.timeline();
  const bounceHeight = '-=' + bounceHeightY + 'px';
  const pointerBall = document.querySelector(
    '[data-anim-target="work-pointer-ball"]'
  );

  for (let i = 1; i <= airCount; i++) {
    tl = tl
      .add(bounceImpact(pointerBall))
      .to(pointerBall, {
        scaleX: 1,
        scaleY: 1,
        ease: 'power2.out',
        y: bounceHeight
      })
      .to(pointerBall, {
        ease: 'power2.in',
        y: bounceGroundY
      });
  }

  return tl.add(bounceImpact(pointerBall)).to(pointerBall, {
    scaleX: 1,
    scaleY: 1
  });
}

export function slide(currentX: number, targetX: number): gsap.core.Timeline {
  const duration = 1.5;
  const sliderWrapper = document.querySelector(
    '[data-anim-target="work-slider-wrapper"]'
  );
  const sliderBg = document.querySelector(
    '[data-anim-target="work-slider-bg"]'
  );
  gsap.set(sliderBg, {
    x: '+=' + (targetX - currentX)
  });
  return gsap.timeline().to(sliderWrapper, {
    x: '-=' + (targetX - currentX),
    duration
  });
}

export function fadeOut(els: Element[]) {
  return gsap.timeline().to(els, {
    autoAlpha: 0
  });
}

export function fadeIn(
  els: Element[],
  slideUp: boolean = true
): gsap.core.Timeline {
  const FLOATING_DISTANCE = 50;
  return gsap.timeline().fromTo(
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
      stagger: 0.15,
      immediateRender: false
    }
  );
}

function shrinkSliderBlock() {
  const firstWorkBanner = document.querySelector(
    '[data-anim-target="work-slider-wrapper"] :nth-child(1)'
  );
  const workListContainer = document.querySelector(
    '[data-anim-target="work-list-container"]'
  );

  return gsap
    .timeline()
    .to(firstWorkBanner, {
      marginLeft: 0
    })
    .to(
      workListContainer,
      {
        width: '50%'
      },
      0
    )
    .duration(0.75);
}

function showSliderBg() {
  const sliderBg = document.querySelector(
    '[data-anim-target="work-slider-bg"]'
  );
  const tl = gsap.timeline().to(sliderBg, {
    translateY: '-100%',
    duration: 0.75
  });

  // wrap value as fn to prevent timeline from being run
  const getAnimationForScreen = valueForScreen(
    {
      desktop: () => tl.add(shrinkSliderBlock())
    },
    () => tl
  );

  return getAnimationForScreen();
}

export function workSummaryEnter({
  background,
  targetElSelector
}: {
  background: string;
  targetElSelector: string;
}): gsap.core.Timeline {
  const pointerBall = document.querySelector(
    '[data-anim-target="work-pointer-ball"]'
  );
  const activeBannerSelector = gsap.utils.selector(targetElSelector);
  const currentPlaceholderEl = getBallPlaceholderEl(targetElSelector);
  const { y: currentY } = currentPlaceholderEl?.getBoundingClientRect() ?? {
    y: 0
  };
  const sliderBg = document.querySelector(
    '[data-anim-target="work-slider-bg"]'
  );
  const workPageHeading = document.querySelector(
    '[data-anim-target="work-page-heading"]'
  );

  return gsap
    .timeline()
    .set(
      sliderBg,
      {
        background
      },
      0
    )
    .add(
      bounce({
        bounceGroundY: currentY - BALL_TOP_POS,
        airCount: 1
      })
    )
    .to(
      workPageHeading,
      {
        autoAlpha: 0
      },
      '>-0.3'
    )
    .to(
      pointerBall,
      {
        y: BALL_TOP_POS - currentY,
        ease: 'power2.inOut',
        duration: 0.5
      },
      '<>-0.3>'
    )
    .add(fadeOut(getBannerCoverEls(targetElSelector)), '<')
    .add(showSliderBg())
    .add(fadeIn(activeBannerSelector('[data-anim-target="summary"]')), '>-0.1')
    .add(
      fadeIn(activeBannerSelector('[data-anim-target="work-title"]')),
      '<0.1'
    );
}

export function bounceEnter(targetElSelector: string) {
  const pointerBall = document.querySelector(
    '[data-anim-target="work-pointer-ball"]'
  );
  const targetBallEl = getBallPlaceholderEl(targetElSelector);
  const { y: targetY } = targetBallEl?.getBoundingClientRect() ?? {
    x: 0,
    y: 0
  };

  return gsap
    .timeline()
    .addLabel('work-list-init')
    .to(pointerBall, {
      y: targetY - BALL_TOP_POS,
      ease: 'power1.inOut'
    })
    .add(
      bounce({
        bounceGroundY: targetY - BALL_TOP_POS,
        airCount: 1
      })
    )
    .add(fadeIn(getBannerCoverEls(targetElSelector)), '-=1')
    .addLabel('work-list-done');
}

export function setupBallAndSlider({
  firstElSelector,
  targetElSelector,
  ballColor
}: {
  firstElSelector: string;
  targetElSelector: string;
  ballColor: string;
}) {
  const pointerBall = document.querySelector(
    '[data-anim-target="work-pointer-ball"]'
  );
  const firstBallEl = getBallPlaceholderEl(firstElSelector);
  const targetBallEl = getBallPlaceholderEl(targetElSelector);

  if (!firstBallEl || !targetBallEl) return;

  const sliderWrapper = document.querySelector(
    '[data-anim-target="work-slider-wrapper"]'
  );
  const sliderBg = document.querySelector(
    '[data-anim-target="work-slider-bg"]'
  );
  const slideDistance =
    targetBallEl.getBoundingClientRect().x -
    firstBallEl?.getBoundingClientRect().x;

  gsap.set(sliderWrapper, {
    x: '-' + slideDistance
  });
  gsap.set(sliderBg, {
    background: ballColor,
    translateX: slideDistance
  });
  gsap.set(pointerBall, {
    x: targetBallEl.getBoundingClientRect().x,
    width: targetBallEl.getBoundingClientRect().width,
    height: targetBallEl.getBoundingClientRect().height,
    background: ballColor
  });
}

export function sceneSlideTo({
  targetElSelector,
  currentElSelector,
  ballColor
}: {
  targetElSelector: string;
  currentElSelector: string;
  ballColor: string;
}) {
  const duration = 1.5;
  const pointerBall = document.querySelector(
    '[data-anim-target="work-pointer-ball"]'
  );
  const targetPlaceholderEl = getBallPlaceholderEl(targetElSelector);
  const currentPlaceholderEl = getBallPlaceholderEl(currentElSelector);
  const currentCoverEls = getBannerCoverEls(currentElSelector);
  const nextCoverEls = getBannerCoverEls(targetElSelector);
  const { y: currentY } = currentPlaceholderEl?.getBoundingClientRect() ?? {
    y: 0
  };
  const { x: targetX } = targetPlaceholderEl?.getBoundingClientRect() ?? {
    x: 0,
    y: 0
  };
  const { x: currentX } = pointerBall?.getBoundingClientRect() ?? {
    x: 0,
    y: 0
  };

  return gsap
    .timeline({ paused: true })
    .add(fadeOut(currentCoverEls))
    .add(
      bounce({
        bounceGroundY: currentY - BALL_TOP_POS,
        airCount: 2,
        bounceHeightY: valueForScreen(
          {
            desktop: 75
          },
          150
        )
      }).duration(duration),
      0
    )
    .add(slide(currentX, targetX).duration(duration), 0)
    .to(
      pointerBall,
      {
        background: ballColor
      },
      0
    )
    .add(fadeIn(nextCoverEls), '-=1');
}
