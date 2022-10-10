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
        <section className={styles['page-gap']}></section>
        <section className={styles['tech']}>
          <TechCard techList={techList} />
        </section>

        <section className={styles['pdp-revamp']}>
          <BlibliProductDetailPreview />
        </section>

        <section className={styles['pdp-secondary']}>
          <BlibliSecondaryPagesPreview />
        </section>

        <section className={styles['pdp-revamp-guide']}>
          <BlibliProductDetailArticle />
        </section>

        <section className={styles['review-revamp-guide']}>
          <h3>
            Project Highlight: <br /> Redesign Review Experience
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

        <section className={styles['review-revamp']}></section>
      </div>
    </BlibliWorkPageProvider>
  );
}

export default BlibliWorkPage;
