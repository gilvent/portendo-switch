import TechBlock, { TECH } from '@/components/TechBlock';
import styles from './MopertyHighlights.module.scss';
import { ForwardedRef, forwardRef } from 'react';

function MopertyHighlights(_: any, ref: ForwardedRef<any>) {
  const techList = [
    [TECH.VUE, TECH.LARAVEL],
    [TECH.SASS, TECH.POSTGRES],
    [TECH.NGINX, TECH.GCLOUD]
  ];

  return (
    <div
      data-anim-target="work-detail"
      className={styles['work-page']}
      ref={ref}
    >
      <section className={`${styles['page-gap']}`}></section>
      <section className={`${styles['tech']}`}>
        <TechBlock techList={techList} />
      </section>
    </div>
  );
}

export default forwardRef(MopertyHighlights);
