import { MouseEventHandler, useRef } from 'react';
import classNames from 'classnames';
import styles from './BlibliCard.module.scss';
import blibliWhiteLogo from 'assets/img/brand/blibli-white.svg';
import GiftsImage from './GiftsImage';
import useTemporaryActiveEffect from '@/hooks/useTemporaryActiveEffect.hook';
import OutlineButton from '../OutlineButton';

type BlibliCardProps = {
  active: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
};

function BlibliCard(props: BlibliCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const { isActive: leavingDetailMode } = useTemporaryActiveEffect(
    !props.active,
    600
  );
  const { isActive: enterDetailMode } = useTemporaryActiveEffect(
    props.active,
    600
  );

  const descriptionClass = classNames(styles.description, {
    [styles.active]: props.active
  });
  const headingClass = classNames(styles.heading, {
    [styles.active]: props.active,
    [styles['enter-transition']]: enterDetailMode,
    [styles['leave-transition']]: leavingDetailMode
  });
  const bgClass = classNames(styles.background, {
    [styles.active]: props.active,
    [styles['enter-transition']]: enterDetailMode,
    [styles['leave-transition']]: leavingDetailMode
  });

  const titleClass = classNames(styles.title, {
    [styles.active]: props.active,
    [styles['enter-transition']]: enterDetailMode,
    [styles['leave-transition']]: leavingDetailMode
  });

  return (
    <div className={styles.card} ref={cardRef} onClick={props.onClick}>
      <p className={descriptionClass}>
        Being a <strong>front end developer</strong>, I worked in <br />
        <strong>Product Detail Squad</strong> on developing UI components,{' '}
        layouts and interactions for product detail and product review features
        in <strong>Blibli.com’s</strong> web application.
      </p>

      <div className={styles.content}>
        <img
          src={blibliWhiteLogo}
          ref={logoRef}
          className={styles.logo}
          alt="Blibli logo"
        />

        <div className={styles.overview}>
          <h2 ref={headingRef} className={headingClass}>
            Blibli.com
          </h2>
          <h4 className={styles.role}>Front end developer</h4>
          <p className={styles.product}>
            Blibli.com is an indonesian e-commerce with wide range of products
            from both offline business to online.
          </p>
        </div>

        <div className={titleClass}>
          <button className={styles['btn-title']}>
            <h2 className={styles.text}>Blibli.com</h2>
          </button>
        </div>

        <div className={bgClass} ref={bgRef}></div>
      </div>

      <GiftsImage active={props.active} />
    </div>
  );
}

export default BlibliCard;
