import { useRef } from 'react';
import pdpShippingImg from 'assets/img/blibli/pdp-shipping.png';
import pdpDescriptionImg from 'assets/img/blibli/pdp-desc.png';
import pdpDiscussionImg from 'assets/img/blibli/pdp-discussion.png';
import pdpPromoImg from 'assets/img/blibli/pdp-promo.png';
import styles from './BlibliSecondaryPagesBlock.module.scss';
import useBlockEnterAnimation from '@/hooks/animations/useBlockEnterAnimation.hook';
import { screenshotsAppear } from '@/utils/gsap/animations/blibli-secondary-pages-block';

function BlibliSecondaryPagesBlock() {
  const rootEl = useRef(null);
  const screenshotsContainerRef = useRef(null);

  useBlockEnterAnimation({
    ref: rootEl,
    from: 'left',
    createContentEnter() {
      return screenshotsAppear(
        screenshotsContainerRef.current ?? new HTMLDivElement()
      );
    }
  });

  return (
    <div
      id="blibli-secondary-pdp"
      className={styles['secondary-pages-block']}
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

export default BlibliSecondaryPagesBlock;
