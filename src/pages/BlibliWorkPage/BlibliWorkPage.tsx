import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './BlibliWorkPage.module.scss';
import pdpPageImg from 'assets/blibli-projects/pdp-full-page.png';
import pdpShippingImg from 'assets/blibli-projects/pdp-shipping.png';
import pdpDescriptionImg from 'assets/blibli-projects/pdp-description.png';
import TechCard, { TECH } from 'src/components/TechCard';

function BlibliWorkPage() {
  const techList = [
    [TECH.PLAYWRIGHT, TECH.VUE],
    [TECH.NGINX, TECH.SASS]
  ];
  const pageRef = useRef(null);
  const query = gsap.utils.selector(pageRef);
  const secondaryPageTL = useRef<gsap.core.Timeline>(gsap.timeline());

  useEffect(() => {
    secondaryPageTL.current = gsap
      .timeline({
        scrollTrigger: {
          trigger: '.pdp-shipping',
          start: 'start center',
          end: 'bottom center',
          scrub: true,
        },
      })
      .addLabel('start')
      .to(query('.pdp-shipping'), {
        opacity: 1,
        x: '300',
        duration: 2,
      })
      .addLabel('end');
  }, []);

  return (
    <div className={styles['work-page']} ref={pageRef}>
      <section className={styles['page-gap']}></section>
      <section className={styles['tech']}>
        <TechCard techList={techList}/>
      </section>

      <section className={styles['pdp-revamp']}>
        <figure className={styles['preview']}>
          <img src={pdpPageImg} alt="Blibli product detail" />
          <div className={styles['frame']}>
            <div></div>
          </div>
        </figure>

        <div className={styles['pdp-secondary']}>
          <img
            src={pdpShippingImg}
            className="pdp-shipping"
            alt="Blibli product shipping page"
          />
          <img
            src={pdpDescriptionImg}
            className="pdp-desc"
            alt="Blibli product description page"
          />
        </div>
      </section>

      <section className={styles['pdp-revamp-guide']}>
        <h3>
          Project Highlight: <br /> Product Detail Revamp
        </h3>
        <p>
          I am part of product detail page revamp team. Most components are
          redesigned as we adopt a new design. It has new interactions like
          sticky CTA, sticky navigations, secondary pages.
          <br /> <br />
          We took the opportunity to rewrite the codebase from scratch. Creating
          reusable UI components for mobile and desktop.
        </p>
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
