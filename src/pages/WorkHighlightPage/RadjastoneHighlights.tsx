import TechBlock, { TECH } from '@/components/TechBlock';
import styles from './RadjastoneHighlights.module.scss';
import { ForwardedRef, forwardRef } from 'react';

function RadjastoneHighlights(_: any, ref: ForwardedRef<any>) {
  const techList = [
    [TECH.REACT, TECH.GSAP],
    [TECH.SASS, TECH.STRAPI],
    [TECH.NGINX, TECH.GCLOUD]
  ];

  return (
    <div
      data-anim-target="work-detail"
      className={styles['work-page']}
      ref={ref}
    >
      <section className={`block-container ${styles['page-gap']}`}></section>
      <section className={`block-container ${styles['tech']}`}>
        <TechBlock techList={techList} />
      </section>
    </div>
  );
}

export default forwardRef(RadjastoneHighlights);
