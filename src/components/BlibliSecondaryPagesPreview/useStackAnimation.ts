import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export enum LABELS {
  START = 'start',
  PROMO_ENTER = 'promo-enter',
  DISCUSSION_ENTER = 'discussion-enter',
  DESCRIPTION_ENTER = 'description-enter',
  SHIPPING_ENTER = 'shipping-enter'
}

export type ScreenshotRef = {
  promo: React.MutableRefObject<HTMLElement | null>;
  discussion: React.MutableRefObject<HTMLElement | null>;
  description: React.MutableRefObject<HTMLElement | null>;
  shipping: React.MutableRefObject<HTMLElement | null>;
};

function useStackAnimation(screenshotRef: ScreenshotRef) {
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const { promo, discussion, description, shipping } = screenshotRef;
    const promoEnter = getEnterAnimation(promo, []);
    const discussionEnter = getEnterAnimation(discussion, [promo]);
    const descriptionEnter = getEnterAnimation(description, [
      promo,
      discussion
    ]);
    const shippingEnter = getEnterAnimation(shipping, [
      promo,
      discussion,
      description
    ]);

    masterTimeline.current = gsap
      .timeline({
        paused: true,
        defaults: {
          duration: 0.3,
          ease: 'power2.out'
        }
      })
      .addLabel(LABELS.START)
      .add(promoEnter, LABELS.PROMO_ENTER)
      .addLabel(LABELS.PROMO_ENTER)
      .add(discussionEnter, LABELS.DISCUSSION_ENTER)
      .addLabel(LABELS.DISCUSSION_ENTER)
      .add(descriptionEnter, LABELS.DESCRIPTION_ENTER)
      .addLabel(LABELS.DESCRIPTION_ENTER)
      .add(shippingEnter, LABELS.SHIPPING_ENTER)
      .addLabel(LABELS.SHIPPING_ENTER);

    return () => {
      promoEnter.kill();
      discussionEnter.kill();
      descriptionEnter.kill();
      shippingEnter.kill();
    };
  }, []);

  function getEnterAnimation(
    targetRef: React.MutableRefObject<HTMLElement | null>,
    prevRefs: React.MutableRefObject<HTMLElement | null>[]
  ): gsap.core.Timeline {
    const prevAnimations = prevRefs.reduce((timeline, ref) => {
      return timeline.to(
        ref.current,
        {
          top: '-=50',
          scale: '-=0.1'
        },
        0
      );
    }, gsap.timeline());

    return prevAnimations.fromTo(
      targetRef.current,
      {
        rotate: 180,
        x: 500,
        y: -50,
        opacity: 0,
        immediateRender: false
      },
      {
        opacity: 1,
        rotate: 0,
        x: 0
      },
      0
    );
  }

  function moveAnimationTo(targetLabel: LABELS): void {
    if (!masterTimeline.current) return;
    masterTimeline.current.tweenTo(targetLabel);
  }

  function playAnimation(): void {
    if (!masterTimeline.current) return;
    masterTimeline.current.play();
  }

  function reverseAnimation(): void {
    if (!masterTimeline.current) return;
    masterTimeline.current.reverse();
  }

  return {
    playAnimation,
    reverseAnimation,
    moveAnimationTo
  };
}

export default useStackAnimation;
