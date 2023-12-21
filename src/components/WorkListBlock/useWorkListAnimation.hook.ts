import gsap from 'gsap';
import { RefObject, useRef } from 'react';

const BANNERS = [
  {
    selector: '#blibli-banner',
    background: 'linear-gradient(132.36deg, #0092da 43.16%, #0071da 112.76%)'
  },
  {
    selector: '#moperty-banner',
    background: 'linear-gradient(132.36deg, #503FB5 43%, #3F51B5 112%)'
  }
];

function useWorkListAnimation({
  ballRef,
  sliderRef
}: {
  ballRef: RefObject<Element>;
  sliderRef: RefObject<Element>;
}) {
  const activeBannerIndex = useRef<number>(0);

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
  }) {
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

  function bounceFromFall({
    bouncePointX,
    bouncePointY
  }: {
    bouncePointX: number;
    bouncePointY: number;
  }) {
    return gsap
      .timeline()
      .fromTo(
        ballRef.current,
        {
          x: bouncePointX,
          y: -500,
          ease: 'power1.inOut'
        },
        {
          x: bouncePointX,
          y: bouncePointY,
          background: BANNERS[activeBannerIndex.current].background
        }
      )
      .add(
        bounce({
          bouncePointY,
          airCount: 1
        })
      );
  }

  function slideTo(targetIndex: number) {
    const target = getBallPlaceholderEl(BANNERS[targetIndex].selector);
    const current = getBallPlaceholderEl(
      BANNERS[activeBannerIndex.current].selector
    );

    const bounds = target?.getBoundingClientRect();
    const currentBounds = current?.getBoundingClientRect();
    const duration = 1.5;

    if (!bounds || !currentBounds) return;

    return gsap
      .timeline()
      .add(
        fadeOut(getBannerCoverEls(BANNERS[activeBannerIndex.current].selector))
      )
      .add(
        bounce({
          bouncePointY: currentBounds.y,
          airCount: 2
        }).duration(duration),
        0
      )
      .to(
        sliderRef.current,
        {
          x: '-=' + (bounds.x - currentBounds.x),
          duration
        },
        0
      )
      .to(
        ballRef.current,
        {
          background: BANNERS[targetIndex].background
        },
        0
      )
      .add(fadeIn(getBannerCoverEls(BANNERS[targetIndex].selector)), '-=1')
      .eventCallback('onComplete', () => {
        activeBannerIndex.current = targetIndex;
      });
  }

  function fadeOut(els: Element[]) {
    return gsap.to(els, {
      autoAlpha: 0
    });
  }

  function fadeIn(els: Element[], slideUp: boolean = true): gsap.core.Tween {
    const FLOATING_DISTANCE = 50;
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

  function enterFromHome() {
    const ballPlaceholder = getBallPlaceholderEl(
      BANNERS[activeBannerIndex.current].selector
    );
    const bounds = ballPlaceholder?.getBoundingClientRect();
    if (!bounds) return;

    return gsap
      .timeline()
      .add(
        bounceFromFall({
          bouncePointX: bounds.x,
          bouncePointY: bounds.y
        })
      )
      .add(
        fadeIn(getBannerCoverEls(BANNERS[activeBannerIndex.current].selector)),
        '-=1'
      );
  }

  return { enterFromHome, slideTo };
}

export default useWorkListAnimation;
