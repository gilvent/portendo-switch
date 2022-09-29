import { MouseEventHandler, useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './BlibliCard.module.scss';
import blibliWhiteLogo from 'assets/work-logo/blibli-white.svg';

type BlibliCardProps = {
  active: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
};

function BlibliCard(props: BlibliCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const expandTimeline = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );
  const query = gsap.utils.selector(cardRef);

  useEffect(() => {
    expandTimeline.current
      .to(
        cardRef.current,
        {
          duration: 0.5,
          borderRadius: 0
        },
        0
      )
      .to(
        headingRef.current,
        {
          left: 24,
          bottom: 24,
          fontSize: '96px',
          duration: 0.5
        },
        0
      )
      .to(
        logoRef.current,
        {
          opacity: 0,
          duration: 0.3
        },
        0
      )
      .to(
        query('.' + styles.description),
        {
          opacity: 1,
          duration: 0.3
        },
        1
      );
  }, []);

  useEffect(() => {
    expandTimeline.current.play();
    expandTimeline.current.reversed(!props.active);
  }, [props.active]);

  return (
    <div className={styles.card} ref={cardRef} onClick={props.onClick}>
      <img
        src={blibliWhiteLogo}
        ref={logoRef}
        className={styles.logo}
        alt="Blibli logo"
      />

      <p className={styles.description}>
        Being a <strong>front end developer</strong>, I worked in <br />
        <strong>Product Detail Squad</strong> on developing UI components,{' '}
        <br />
        layouts and interactions for product detail and product <br />
        review features in <strong>Blibli.com’s</strong> web application.
      </p>

      <h3 ref={headingRef} className={styles.heading}>
        Blibli.com
      </h3>
    </div>
  );
}

export default BlibliCard;
