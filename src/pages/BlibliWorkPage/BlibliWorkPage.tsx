import TechBlock, { TECH } from '@/components/TechBlock';
import BlibliSecondaryPagesPreview from '@/components/BlibliSecondaryPagesPreview';
import BlibliPDPRevampStoryBlock from '@/components/BlibliPDPRevampStoryBlock';
import styles from './BlibliWorkPage.module.scss';
import BlibliReviewProjectStoryBlock from '@/components/BlibliReviewProjectStoryBlock';
import BlibliReviewProjectInteractiveBlock from '@/components/BlibliReviewProjectInteractiveBlock/BlibliReviewProjectInteractiveBlock';
import BlibliPDPRevampViewBlock from '@/components/BlibliPDPRevampViewBlock';
import { ForwardedRef, forwardRef } from 'react';

function BlibliWorkPage(_: any, ref: ForwardedRef<any>) {
  const techList = [
    [TECH.PLAYWRIGHT, TECH.VUE],
    [TECH.NGINX, TECH.SASS]
  ];

  return (
    <div className={styles['work-page']} ref={ref}>
      <section className={`${styles.block} ${styles['page-gap']}`}></section>
      <section className={`${styles.block} ${styles['tech']}`}>
        <TechBlock techList={techList} />
      </section>
      <section className={`${styles.block} ${styles['review-revamp-story']}`}>
        <BlibliReviewProjectStoryBlock />
      </section>
      <section className={`${styles.block} ${styles['review-revamp']}`}>
        <BlibliReviewProjectInteractiveBlock />
      </section>
      <section className={`${styles.block} ${styles['pdp-revamp-preview']}`}>
        <BlibliPDPRevampViewBlock />
      </section>

      <section className={`${styles.block} ${styles['pdp-secondary']}`}>
        <BlibliSecondaryPagesPreview />
      </section>

      <section className={`${styles.block} ${styles['pdp-revamp-story']}`}>
        <BlibliPDPRevampStoryBlock />
      </section>
    </div>
  );
}

export default forwardRef(BlibliWorkPage);
