import TechBlock, { TECH } from '@/components/TechBlock';
import styles from './MopertyWorkPage.module.scss';
import { ForwardedRef, forwardRef } from 'react';

function MopertyWorkPage(_: any, ref: ForwardedRef<any>) {
  const techList = [
    [TECH.VUE, TECH.LARAVEL],
    [TECH.SASS, TECH.POSTGRES],
    [TECH.NGINX, TECH.GCLOUD]
  ];

  return (
    <div className={styles['work-page']} ref={ref}>
      <section className={`${styles['page-gap']}`}></section>
      <section className={`${styles['tech']}`}>
        <TechBlock techList={techList} />
      </section>
    </div>
  );
}

export default forwardRef(MopertyWorkPage);
