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

  // TODO remove later, keep for reference
  // const screenshotRef = {
  //   promo: useRef(null),
  //   discussion: useRef(null),
  //   description: useRef(null),
  //   shipping: useRef(null)
  // };
  // const { playAnimation, reverseAnimation, moveAnimationTo } =
  //   useStackAnimation(screenshotRef);
  // const { setActivePDPArticle } = useContext(BlibliWorkPageContext);

  // useStandaloneScrollTrigger({
  //   trigger: '.' + styles.container,
  //   start: 'start center',
  //   end: 'bottom center',
  //   onEnter: () => {
  //     setActivePDPArticle(2);
  //     playAnimation();
  //   },
  //   onLeaveBack: () => reverseAnimation()
  // });

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
            // onClick={() => moveAnimationTo(LABELS.PROMO_ENTER)}
          />
          <img
            className={styles.screenshot}
            src={pdpDescriptionImg}
            alt="Blibli product description page"
            // onClick={() => moveAnimationTo(LABELS.DISCUSSION_ENTER)}
          />
          <img
            className={styles.screenshot}
            src={pdpShippingImg}
            alt="Blibli product shipping page"
            // onClick={() => moveAnimationTo(LABELS.DESCRIPTION_ENTER)}
          />
        </div>
      </div>
    </div>
  );
}

export default BlibliSecondaryPagesPreview;
