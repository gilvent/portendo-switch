import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './BlibliCard.module.scss';
import blibliWhiteLogo from 'assets/img/brand/blibli-white.svg';
import GiftsImage from './GiftsImage';
import useTemporaryActiveEffect from '@/hooks/useTemporaryActiveEffect.hook';

type BlibliCardProps = {
  active: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
};

function BlibliCard(props: BlibliCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { isActive: h2EnterTransitioning } = useTemporaryActiveEffect(
    !props.active,
    600
  );

  const descriptionClass = classNames(styles.description, {
    [styles.active]: props.active
  });
  const headingClass = classNames(styles.heading, {
    [styles.active]: props.active,
    [styles['enter-transition']]: h2EnterTransitioning
  });

  return (
    <div className={styles.card} ref={cardRef} onClick={props.onClick}>
      <p className={descriptionClass}>
        Being a <strong>front end developer</strong>, I worked in <br />
        <strong>Product Detail Squad</strong> on developing UI components,{' '}
        <br />
        layouts and interactions for product detail and product <br />
        review features in <strong>Blibli.com’s</strong> web application.
      </p>

      <img
        src={blibliWhiteLogo}
        ref={logoRef}
        className={styles.logo}
        alt="Blibli logo"
      />

      <h2 ref={headingRef} className={headingClass}>
        Blibli.com
      </h2>

      <GiftsImage active={props.active} />
    </div>
  );
}

export default BlibliCard;
