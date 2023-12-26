import { useEffect, useRef } from 'react';
import pdpShippingImg from 'assets/img/blibli/pdp-shipping.png';
import pdpDescriptionImg from 'assets/img/blibli/pdp-desc.png';
import pdpDiscussionImg from 'assets/img/blibli/pdp-discussion.png';
import pdpPromoImg from 'assets/img/blibli/pdp-promo.png';
import styles from './BlibliSecondaryPagesPreview.module.scss';
import useImagesEnterAnimation from './useImagesEnterAnimation.hook';
import useScrollTrigger from '@/hooks/useScrollTrigger.hook';

function BlibliSecondaryPagesPreview() {
  const rootEl = useRef(null);
  const screenshotsContainerRef = useRef(null);
  const { create: createScrollTrigger } = useScrollTrigger();
  const { setupAnimation, animationRef } = useImagesEnterAnimation();

  useEffect(() => {
    setupAnimation(screenshotsContainerRef.current ?? new HTMLDivElement());
    createScrollTrigger({
      trigger: screenshotsContainerRef.current,
      start: 'top 80%',
      end: '60% top',
      onEnter: () => {
        animationRef.current.play();
      },
      onLeaveBack: () => {
        animationRef.current.tweenTo('start');
      }
    });
  }, []);

  return (
    <div
      id="blibli-secondary-pdp"
      className={styles['secondary-pages']}
      ref={rootEl}
    >
      <div className={styles['screenshots-wrapper']}>
        <div
          ref={screenshotsContainerRef}
          className={styles['screenshots-container']}
        >
          <img
            className={styles.screenshot}
            src={pdpPromoImg}
            alt="Blibli product promo page"
          />
          <img
            className={styles.screenshot}
            src={pdpDiscussionImg}
            alt="Blibli product discussion page"
          />
          <img
            className={styles.screenshot}
            src={pdpDescriptionImg}
            alt="Blibli product description page"
          />
          <img
            className={styles.screenshot}
            src={pdpShippingImg}
            alt="Blibli product shipping page"
          />
        </div>
      </div>
    </div>
  );
}

export default BlibliSecondaryPagesPreview;
