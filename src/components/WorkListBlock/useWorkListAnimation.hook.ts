import { WorkDetailName } from '@/context/WorkPageContext';
import usePreviousState from '@/hooks/usePreviousState.hook';
import gsap from 'gsap';
import { RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type Banner = {
  url: string;
  selector: string;
  background: string;
  prevBannerTitle: WorkDetailName.Blibli;
  nextBannerTitle: WorkDetailName.Moperty;
};

const bannersByTitle: Record<WorkDetailName, Banner> = {
  [WorkDetailName.Blibli]: {
    url: '/work/blibli',
    selector: '#blibli-banner',
    background: 'linear-gradient(132.36deg, #0092da 43.16%, #0071da 112.76%)',
    prevBannerTitle: WorkDetailName.Blibli,
    nextBannerTitle: WorkDetailName.Moperty
  },
  [WorkDetailName.Moperty]: {
    url: '/work/moperty',
    selector: '#moperty-banner',
    background: 'linear-gradient(132.36deg, #503FB5 43%, #3F51B5 112%)',
    prevBannerTitle: WorkDetailName.Blibli,
    nextBannerTitle: WorkDetailName.Moperty
  }
};

// TODO handle case when enterWorkDetailAnimation is run in the middle of enterAnimation
function useWorkListAnimation({
  ballRef,
  sliderRef
}: {
  ballRef: RefObject<Element>;
  sliderRef: RefObject<Element>;
}) {
  const BALL_TOP_POS = -150; // based on "top" value set in css
  const params = useParams();
  const [activeBanner, setActiveBanner] = useState<Banner>(() => {
    const banner =
      bannersByTitle[params.title as WorkDetailName] ??
      bannersByTitle[WorkDetailName.Blibli];
    return banner;
  });
  const prevBanner = usePreviousState(activeBanner);
  const enterAnimation = useRef<gsap.core.Timeline | null>(null);
  const slideAnimation = useRef<gsap.core.Timeline | null>(null);
  const enterWorkDetailAnimation = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    enterAnimation.current = enter();
  }, []);

  useEffect(() => {
    if (params.title !== undefined) {
      setActiveBanner(
        bannersByTitle[params.title as WorkDetailName] ??
          bannersByTitle[WorkDetailName.Blibli]
      );
    }
  }, [params]);

  useEffect(() => {
    if (prevBanner.url !== activeBanner.url) {
      slideAnimation.current = sceneSlideTo(activeBanner, prevBanner);
    } else {
      slideAnimation.current = null;
    }
  }, [activeBanner]);

  useEffect(() => {
    enterWorkDetailAnimation.current = enterWorkDetail();
  }, [activeBanner]);

  function getBallPlaceholderEl(workBannerId: string): Element | null {
    return document.querySelector(
      `${workBannerId} [data-anim-target="ball-placeholder"]`
    );
  }

  function getBannerCoverEls(workBannerId: string): Array<any> {
    const selectors = [
      `${workBannerId} [data-anim-target="cover-title"]`,
      `${workBannerId} [data-anim-target="cover-role"]`,
      `${workBannerId} [data-anim-target="cover-description"]`
    ];
    return selectors.map(selector => document.querySelector(selector));
  }

  function bounceImpact() {
    return gsap
      .timeline({
        defaults: {
          duration: 0.25
        }
      })
      .to(ballRef.current, {
        transformOrigin: '50% 100%',
        scaleX: 1.1,
        scaleY: 0.9,
        duration: 0.25
      });
  }

  function bounce({
    bouncePointY,
    airCount
  }: {
    bouncePointY: number;
    airCount: number;
  }): gsap.core.Timeline {
    let tl = gsap.timeline();

    for (let i = 1; i <= airCount; i++) {
      tl = tl
        .add(bounceImpact())
        .to(ballRef.current, {
          scaleX: 1,
          scaleY: 1,
          ease: 'power2.out',
          y: '-=150px'
        })
        .to(ballRef.current, {
          ease: 'power2.in',
          y: bouncePointY
        });
    }

    return tl.add(bounceImpact()).to(ballRef.current, {
      scaleX: 1,
      scaleY: 1
    });
  }

  function slide(currentX: number, targetX: number): gsap.core.Timeline {
    const duration = 1.5;
    return gsap.timeline().to(sliderRef.current, {
      x: '-=' + (targetX - currentX),
      duration
    });
  }

  function fadeOut(els: Element[]) {
    return gsap.timeline().to(els, {
      autoAlpha: 0
    });
  }

  function fadeIn(els: Element[], slideUp: boolean = true): gsap.core.Timeline {
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

  function sceneSlideTo(toBanner: Banner, fromBanner: Banner) {
    const duration = 1.5;
    const targetPlaceholderEl = getBallPlaceholderEl(toBanner.selector);
    const currentPlaceholderEl = getBallPlaceholderEl(fromBanner.selector);
    const currentCoverEls = getBannerCoverEls(fromBanner.selector);
    const nextCoverEls = getBannerCoverEls(toBanner.selector);
    const { x: targetX } = targetPlaceholderEl?.getBoundingClientRect() ?? {
      x: 0,
      y: 0
    };
    const { x: currentX, y: currentY } =
      currentPlaceholderEl?.getBoundingClientRect() ?? {
        x: 0,
        y: 0
      };

    return gsap
      .timeline({ paused: true })
      .add(fadeOut(currentCoverEls))
      .add(
        bounce({
          bouncePointY: currentY - BALL_TOP_POS,
          airCount: 2
        }).duration(duration),
        0
      )
      .add(slide(currentX, targetX).duration(duration), 0)
      .to(
        ballRef.current,
        {
          background: toBanner.background
        },
        0
      )
      .add(fadeIn(nextCoverEls), '-=1');
  }

  function enter() {
    const firstBallEl = getBallPlaceholderEl(
      bannersByTitle[WorkDetailName.Blibli].selector
    );
    const targetBallEl = getBallPlaceholderEl(activeBanner.selector);
    const { x: targetX, y: targetY } =
      targetBallEl?.getBoundingClientRect() ?? {
        x: 0,
        y: 0
      };
    const { x: initialX } = firstBallEl?.getBoundingClientRect() ?? {
      x: 0,
      y: 0
    };

    gsap.set(ballRef.current, {
      x: targetX,
      background: activeBanner.background
    });
    gsap.set(sliderRef.current, {
      x: '-' + (targetX - initialX)
    });

    return gsap
      .timeline({ paused: true })
      .to(ballRef.current, {
        y: targetY - BALL_TOP_POS,
        ease: 'power1.inOut'
      })
      .add(
        bounce({
          bouncePointY: targetY - BALL_TOP_POS,
          airCount: 1
        })
      )
      .add(fadeIn(getBannerCoverEls(activeBanner.selector)), '-=1');
  }

  function enterWorkDetail(): gsap.core.Timeline {
    const activeBannerSelector = gsap.utils.selector(activeBanner.selector);
    const currentPlaceholderEl = getBallPlaceholderEl(activeBanner.selector);

    const { y: currentY } = currentPlaceholderEl?.getBoundingClientRect() ?? {
      y: 0
    };

    const bannerBg = activeBannerSelector('div[data-anim-target="banner-bg"]');

    return gsap
      .timeline({ paused: true })
      .set(
        bannerBg,
        {
          background: activeBanner.background
        },
        0
      )
      .add(
        bounce({
          bouncePointY: currentY - BALL_TOP_POS,
          airCount: 1
        })
      )
      .to(
        ballRef.current,
        {
          y: BALL_TOP_POS - currentY,
          ease: 'power2.inOut',
          duration: 0.5
        },
        '>-0.3'
      )
      .add(fadeOut(getBannerCoverEls(activeBanner.selector)), '<')
      .to(
        bannerBg,
        {
          y: '-100%'
        },
        '>-0.1'
      )
      .add(
        fadeIn(activeBannerSelector('[data-anim-target="summary"]')),
        '>-0.1'
      )
      .add(
        fadeIn(activeBannerSelector('[data-anim-target="work-title"]')),
        '<0.1'
      );
  }

  return {
    enterAnimation,
    enterWorkDetailAnimation,
    slideAnimation,
    activeBanner
  };
}

export default useWorkListAnimation;
