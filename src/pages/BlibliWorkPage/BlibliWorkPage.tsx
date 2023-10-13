import TechCard, { TECH } from '@/components/TechCard';
import BlibliProductDetailPreview from '@/components/BlibliProductDetailPreview';
import BlibliSecondaryPagesPreview from '@/components/BlibliSecondaryPagesPreview';
import BlibliProductDetailArticle from '@/components/BlibliProductDetailArticle';
import { BlibliWorkPageProvider } from '@/context/BlibliWorkPageContext';
import styles from './BlibliWorkPage.module.scss';
import BlibliReviewProjectStoryBlock from '@/components/BlibliReviewProjectStoryBlock';

function BlibliWorkPage() {
  const techList = [
    [TECH.PLAYWRIGHT, TECH.VUE],
    [TECH.NGINX, TECH.SASS]
  ];

  return (
    <BlibliWorkPageProvider>
      <div className={styles['work-page']}>
        <section className={`${styles.block} ${styles['page-gap']}`}></section>
        <section className={`${styles.block} ${styles['tech']}`}>
          <TechCard techList={techList} />
        </section>
        <section className={`${styles.block} ${styles['review-revamp-story']}`}>
          <BlibliReviewProjectStoryBlock />
        </section>
        <section
          className={`${styles.block} ${styles['review-revamp']}`}
        ></section>
        <section className={`${styles.block} ${styles['pdp-revamp-preview']}`}>
          <BlibliProductDetailPreview />
        </section>

        <section className={`${styles.block} ${styles['pdp-secondary']}`}>
          <BlibliSecondaryPagesPreview />
        </section>

        <section className={`${styles.block} ${styles['pdp-revamp-story']}`}>
          <BlibliProductDetailArticle />
        </section>
      </div>
    </BlibliWorkPageProvider>
  );
}

export default BlibliWorkPage;
