import gsap from 'gsap';
import { RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BANNERS = [
  {
    url: '/work/blibli',
    selector: '#blibli-banner',
    background: 'linear-gradient(132.36deg, #0092da 43.16%, #0071da 112.76%)'
  },
  {
    url: '/work/moperty',
    selector: '#moperty-banner',
    background: 'linear-gradient(132.36deg, #503FB5 43%, #3F51B5 112%)'
  }
];

const indexByRouteParam: Record<string, number> = {
  blibli: 0,
  moperty: 1
};

function useWorkListAnimation({
  ballRef,
  sliderRef
}: {
  ballRef: RefObject<Element>;
  sliderRef: RefObject<Element>;
}) {
  const BALL_TOP_POS = -150; // based on "top" value set in css
  const { title } = useParams();
  const navigate = useNavigate();
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(() => {
    const index = indexByRouteParam[title as string] ?? 0;
    return index;
  });
  const enterAnimation = useRef<gsap.core.Timeline | null>(null);
  const nextAnimation = useRef<gsap.core.Timeline | null>(null);
  const prevAnimation = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    enterAnimation.current = enter();
  }, []);

  useEffect(() => {
    if (activeBannerIndex < BANNERS.length - 1) {
      nextAnimation.current = sceneSlideTo(activeBannerIndex + 1);
    } else {
      nextAnimation.current = gsap.timeline();
    }

    if (activeBannerIndex > 0) {
      prevAnimation.current = sceneSlideTo(activeBannerIndex - 1);
    } else {
      prevAnimation.current = gsap.timeline();
    }
  }, [activeBannerIndex]);

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
        stagger: 0.15
      }
    );
  }

  function sceneSlideTo(targetIndex: number) {
    const duration = 1.5;
    const targetPlaceholderEl = getBallPlaceholderEl(
      BANNERS[targetIndex].selector
    );
    const currentPlaceholderEl = getBallPlaceholderEl(
      BANNERS[activeBannerIndex].selector
    );

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
      .eventCallback('onStart', () => {
        navigate(BANNERS[targetIndex].url);
      })
      .add(fadeOut(getBannerCoverEls(BANNERS[activeBannerIndex].selector)))
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
          background: BANNERS[targetIndex].background
        },
        0
      )
      .add(fadeIn(getBannerCoverEls(BANNERS[targetIndex].selector)), '-=1')
      .eventCallback('onComplete', () => {
        setActiveBannerIndex(targetIndex);
      });
  }

  function enter() {
    const firstBallEl = getBallPlaceholderEl(BANNERS[0].selector);
    const targetBallEl = getBallPlaceholderEl(
      BANNERS[activeBannerIndex].selector
    );
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
      background: BANNERS[activeBannerIndex].background
    });
    gsap.set(sliderRef.current, {
      x: '-' + (targetX - initialX)
    });

    return gsap
      .timeline({ paused: true })
      .to(ballRef.current, {
        x: targetX,
        y: targetY - BALL_TOP_POS,
        ease: 'power1.inOut'
      })
      .add(
        bounce({
          bouncePointY: targetY - BALL_TOP_POS,
          airCount: 1
        })
      )
      .add(
        fadeIn(getBannerCoverEls(BANNERS[activeBannerIndex].selector)),
        '-=1'
      );
  }

  return { nextAnimation, enterAnimation, prevAnimation };
}

export default useWorkListAnimation;
