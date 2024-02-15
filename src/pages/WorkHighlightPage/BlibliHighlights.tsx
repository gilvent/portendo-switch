import TechBlock, { TECH } from '@/components/TechBlock';
import BlibliSecondaryPagesBlock from '@/components/BlibliSecondaryPagesBlock';
import BlibliPDPRevampStoryBlock from '@/components/BlibliPDPRevampStoryBlock';
import styles from './BlibliHighlights.module.scss';
import BlibliReviewProjectStoryBlock from '@/components/BlibliReviewProjectStoryBlock';
import BlibliReviewProjectInteractiveBlock from '@/components/BlibliReviewProjectInteractiveBlock/BlibliReviewProjectInteractiveBlock';
import BlibliPDPRevampViewBlock from '@/components/BlibliPDPRevampViewBlock';
import { ForwardedRef, forwardRef } from 'react';

function BlibliWorkHighlight(_: any, ref: ForwardedRef<any>) {
  const techList = [
    [TECH.PLAYWRIGHT, TECH.VUE],
    [TECH.NGINX, TECH.SASS]
  ];

  return (
    <div data-anim-target="work-detail" className={styles['work-page']}>
      <section className={`block-container ${styles['page-gap']}`}></section>
      <section className={`block-container ${styles['tech']}`}>
        <TechBlock techList={techList} />
      </section>
      <section className={`block-container ${styles['review-revamp-story']}`}>
        <BlibliReviewProjectStoryBlock />
      </section>
      <section className={`block-container ${styles['review-revamp']}`}>
        <BlibliReviewProjectInteractiveBlock />
      </section>
      <section className={`block-container ${styles['pdp-revamp-preview']}`}>
        <BlibliPDPRevampViewBlock />
      </section>

      <section className={`block-container ${styles['pdp-secondary']}`}>
        <BlibliSecondaryPagesBlock />
      </section>

      <section className={`block-container ${styles['pdp-revamp-story']}`}>
        <BlibliPDPRevampStoryBlock />
      </section>
    </div>
  );
}

export default forwardRef(BlibliWorkHighlight);
