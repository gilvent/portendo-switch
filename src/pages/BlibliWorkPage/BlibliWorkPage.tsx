import TechCard, { TECH } from '@/components/TechCard';
import BlibliProductDetailPreview from '@/components/BlibliProductDetailPreview';

import styles from './BlibliWorkPage.module.scss';
import BlibliSecondaryPagesPreview from '@/components/BlibliSecondaryPagesPreview';

function BlibliWorkPage() {
  const techList = [
    [TECH.PLAYWRIGHT, TECH.VUE],
    [TECH.NGINX, TECH.SASS]
  ];

  return (
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
        <div className={styles['overview']}>
          <h3>
            Project Highlight: <br /> Product Detail Revamp
          </h3>
          <p>
            I am part of product detail page revamp team. Most components are
            redesigned as we adopt a new design theme.
            <br /> <br />
            We took the opportunity to rewrite the codebase from scratch.
            Creating reusable UI components for mobile and desktop.
          </p>

          <h4>New UI components on the initial screen</h4>
          <h4>And secondary pages for more details...</h4>
        </div>
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
  );
}

export default BlibliWorkPage;
