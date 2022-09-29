import gsap from 'gsap';
import pdpShippingImg from 'assets/blibli-projects/pdp-shipping.png';
import pdpDescriptionImg from 'assets/blibli-projects/pdp-desc.png';
import pdpDiscussionImg from 'assets/blibli-projects/pdp-discussion.png';
import pdpPromoImg from 'assets/blibli-projects/pdp-promo.png';
import styles from './BlibliSecondaryPagesPreview.module.scss';
import { useLayoutEffect, useRef } from 'react';

function BlibliSecondaryPagesPreview() {
  const rootEl = useRef(null);
  const query = gsap.utils.selector(rootEl);
  const secondaryPageTL = useRef<gsap.core.Timeline>(gsap.timeline());

  useLayoutEffect(() => {
    secondaryPageTL.current = gsap
      .timeline({
        scrollTrigger: {
          trigger: '.pdp-shipping',
          start: 'start center',
          end: 'bottom center',
          onLeaveBack: instance => {
            instance.disable(true);
          }
        }
      })
      .addLabel('start')
      .to(query('.pdp-promo'), {
        opacity: 1,
        duration: 1,
        top: '-100',
        scale: '0.85'
      })
      .to(
        query('.pdp-discussion'),
        {
          opacity: 1,
          duration: 1,
          top: '-75',
          scale: '0.9'
        },
        '>'
      )
      .to(
        query('.pdp-desc'),
        {
          opacity: 1,
          duration: 1,
          top: '-50',
          scale: '0.95'
        },
        '>'
      )
      .to(
        query('.pdp-shipping'),
        {
          opacity: 1,
          duration: 1,
          top: '-25'
        },
        '>'
      )
      .addLabel('end');
  }, []);

  return (
    <div className={styles['secondary-pages']} ref={rootEl}>
      <img
        src={pdpPromoImg}
        className="pdp-promo"
        alt="Blibli product shipping page"
      />

      <img
        src={pdpDiscussionImg}
        className="pdp-discussion"
        alt="Blibli product shipping page"
      />
      <img
        src={pdpDescriptionImg}
        className="pdp-desc"
        alt="Blibli product description page"
      />
      <img
        src={pdpShippingImg}
        className="pdp-shipping"
        alt="Blibli product shipping page"
      />
    </div>
  );
}

export default BlibliSecondaryPagesPreview;
