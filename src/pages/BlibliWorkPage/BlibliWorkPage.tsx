import TechCard, { TECH } from '@/components/TechCard';
import BlibliProductDetailPreview from '@/components/BlibliProductDetailPreview';
import BlibliSecondaryPagesPreview from '@/components/BlibliSecondaryPagesPreview';
import BlibliProductDetailArticle from '@/components/BlibliProductDetailArticle';
import { BlibliWorkPageProvider } from '@/context/BlibliWorkPageContext';
import styles from './BlibliWorkPage.module.scss';

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
        <section className={`${styles.block} ${styles['review-revamp-guide']}`}>
          <h3>
            Project Highlight: <br /> Redesign Review Journey
          </h3>
          <p>
            The review experience on Blibli.com is renewed with major UI / UX
            improvements.
            <br /> <br />
            Reviewer can now upload photos from files, or directly from camera
            capture. On the product detail side, we add filter by rating and
            photos.
          </p>
        </section>
        <section
          className={`${styles.block} ${styles['review-revamp']}`}
        ></section>
        <section className={`${styles.block} ${styles['pdp-revamp']}`}>
          <BlibliProductDetailPreview />
        </section>

        <section className={`${styles.block} ${styles['pdp-secondary']}`}>
          <BlibliSecondaryPagesPreview />
        </section>

        <section className={`${styles.block} ${styles['pdp-revamp-guide']}`}>
          <BlibliProductDetailArticle />
        </section>
      </div>
    </BlibliWorkPageProvider>
  );
}

export default BlibliWorkPage;
