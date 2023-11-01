import TechBlock, { TECH } from '@/components/TechBlock';
import BlibliPDPScrollableWindow from '@/components/BlibliPDPScrollableWindow';
import BlibliSecondaryPagesPreview from '@/components/BlibliSecondaryPagesPreview';
import BlibliPDPRevampStoryBlock from '@/components/BlibliPDPRevampStoryBlock';
import { BlibliWorkPageProvider } from '@/context/BlibliWorkPageContext';
import styles from './BlibliWorkPage.module.scss';
import BlibliReviewProjectStoryBlock from '@/components/BlibliReviewProjectStoryBlock';
import BlibliReviewProjectInteractiveBlock from '@/components/BlibliReviewProjectInteractiveBlock/BlibliReviewProjectInteractiveBlock';

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
          <TechBlock techList={techList} />
        </section>
        <section className={`${styles.block} ${styles['review-revamp-story']}`}>
          <BlibliReviewProjectStoryBlock />
        </section>
        <section className={`${styles.block} ${styles['review-revamp']}`}>
          <BlibliReviewProjectInteractiveBlock />
        </section>
        <section className={`${styles.block} ${styles['pdp-revamp-preview']}`}>
          <h2>
            Project Highlight: <br /> Product Detail Revamp
          </h2>
          <BlibliPDPScrollableWindow />
        </section>

        <section className={`${styles.block} ${styles['pdp-secondary']}`}>
          <BlibliSecondaryPagesPreview />
        </section>

        <section className={`${styles.block} ${styles['pdp-revamp-story']}`}>
          <BlibliPDPRevampStoryBlock />
        </section>
      </div>
    </BlibliWorkPageProvider>
  );
}

export default BlibliWorkPage;
