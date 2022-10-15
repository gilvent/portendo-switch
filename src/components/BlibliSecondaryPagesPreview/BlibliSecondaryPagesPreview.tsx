import gsap from 'gsap';
import pdpShippingImg from 'assets/img/blibli/pdp-shipping.png';
import pdpDescriptionImg from 'assets/img/blibli/pdp-desc.png';
import pdpDiscussionImg from 'assets/img/blibli/pdp-discussion.png';
import pdpPromoImg from 'assets/img/blibli/pdp-promo.png';
import styles from './BlibliSecondaryPagesPreview.module.scss';
import { useLayoutEffect, useRef } from 'react';
import useStandaloneScrollTrigger from '@/hooks/useStandaloneScrollTrigger';

function BlibliSecondaryPagesPreview() {
  const rootEl = useRef(null);
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);
  const screenshotRef = {
    promo: useRef(null),
    discussion: useRef(null),
    description: useRef(null),
    shipping: useRef(null)
  };
  useStandaloneScrollTrigger(getEnterTriggerParams('#blibli-secondary-pdp'));
  useStandaloneScrollTrigger(getEnterTriggerParams('#discussion-lane'));
  useStandaloneScrollTrigger(getEnterTriggerParams('#description-lane'));
  useStandaloneScrollTrigger(getEnterTriggerParams('#shipping-lane'));

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

  function getEnterTriggerParams(trigger: string) {
    return {
      trigger,
      start: 'start center',
      end: 'bottom center',
      onEnter: () => playMasterTimeline(),
      onLeaveBack: () => reverseMasterTimeline()
    };
  }

  function playMasterTimeline(): void {
    if (!masterTimeline.current) return;
    masterTimeline.current.play();
  }

  function reverseMasterTimeline(): void {
    if (!masterTimeline.current) return;
    masterTimeline.current.reverse();
  }

  useLayoutEffect(() => {
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
          duration: 1,
          ease: 'power2.out'
        }
      })
      .add(promoEnter, 'promo-enter')
      .addPause('promo-enter')
      .add(discussionEnter, 'discussion-enter')
      .addPause('discussion-enter')
      .add(descriptionEnter, 'description-enter')
      .addPause('description-enter')
      .add(shippingEnter, 'shipping-enter')
      .addPause('shipping-enter');

    return () => {
      promoEnter.kill();
      discussionEnter.kill();
      descriptionEnter.kill();
      shippingEnter.kill();
    };
  }, []);

  return (
    <div
      id="blibli-secondary-pdp"
      className={styles['secondary-pages']}
      ref={rootEl}
    >
      <div className={styles.container}>
        <img
          ref={screenshotRef.promo}
          src={pdpPromoImg}
          alt="Blibli product promo page"
        />
        <img
          ref={screenshotRef.discussion}
          src={pdpDiscussionImg}
          alt="Blibli product discussion page"
        />
        <img
          ref={screenshotRef.description}
          src={pdpDescriptionImg}
          alt="Blibli product description page"
        />
        <img
          ref={screenshotRef.shipping}
          src={pdpShippingImg}
          alt="Blibli product shipping page"
        />
      </div>
      <div id="discussion-lane" className={styles.placeholder}></div>
      <div id="description-lane" className={styles.placeholder}></div>
      <div id="shipping-lane" className={styles.placeholder}></div>
    </div>
  );
}

export default BlibliSecondaryPagesPreview;
