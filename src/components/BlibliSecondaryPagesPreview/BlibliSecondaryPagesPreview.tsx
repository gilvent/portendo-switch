import { useContext, useRef } from 'react';
import pdpShippingImg from 'assets/img/blibli/pdp-shipping.png';
import pdpDescriptionImg from 'assets/img/blibli/pdp-desc.png';
import pdpDiscussionImg from 'assets/img/blibli/pdp-discussion.png';
import pdpPromoImg from 'assets/img/blibli/pdp-promo.png';
import useStandaloneScrollTrigger from '@/hooks/useStandaloneScrollTrigger';
import BlibliWorkPageContext from '@/context/BlibliWorkPageContext';
import styles from './BlibliSecondaryPagesPreview.module.scss';
import useStackAnimation, { LABELS } from './useStackAnimation';

function BlibliSecondaryPagesPreview() {
  const rootEl = useRef(null);
  const screenshotRef = {
    promo: useRef(null),
    discussion: useRef(null),
    description: useRef(null),
    shipping: useRef(null)
  };
  const { playAnimation, reverseAnimation, moveAnimationTo } =
    useStackAnimation(screenshotRef);
  const { setActivePDPArticle } = useContext(BlibliWorkPageContext);

  useStandaloneScrollTrigger({
    trigger: '.' + styles.container,
    start: 'start center',
    end: 'bottom center',
    onEnter: () => {
      setActivePDPArticle(2);
      playAnimation();
    },
    onLeaveBack: () => reverseAnimation()
  });

  return (
    <div
      id="blibli-secondary-pdp"
      className={styles['secondary-pages']}
      ref={rootEl}
    >
      <div className={styles.container}>
        <img
          className="screenshot"
          ref={screenshotRef.promo}
          src={pdpPromoImg}
          alt="Blibli product promo page"
        />
        <img
          className="screenshot"
          ref={screenshotRef.discussion}
          src={pdpDiscussionImg}
          alt="Blibli product discussion page"
          onClick={() => moveAnimationTo(LABELS.PROMO_ENTER)}
        />
        <img
          className="screenshot"
          ref={screenshotRef.description}
          src={pdpDescriptionImg}
          alt="Blibli product description page"
          onClick={() => moveAnimationTo(LABELS.DISCUSSION_ENTER)}
        />
        <img
          className="screenshot"
          ref={screenshotRef.shipping}
          src={pdpShippingImg}
          alt="Blibli product shipping page"
          onClick={() => moveAnimationTo(LABELS.DESCRIPTION_ENTER)}
        />
      </div>
    </div>
  );
}

export default BlibliSecondaryPagesPreview;
