import { MouseEventHandler, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './WorkBanner.module.scss';
import useTemporaryActiveEffect from '@/hooks/useTemporaryActiveEffect.hook';

type WorkBannerProps = {
  id: string;
  title: string;
  description: string;
  role: string;
  active: boolean;
  logo: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  background: string;
  titleColor: string;
  renderSummaryText: () => any;
  renderBgAnimation?: (active: boolean) => any;
};

function WorkBanner(props: WorkBannerProps) {
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
  const cssVars = {
    '--background': 'transparent', //props.background,
    '--title-color': props.titleColor
  } as React.CSSProperties;

  const summaryClass = classNames(styles.summary, {
    [styles.active]: props.active
  });
  const coverTitleClass = classNames('invisible', styles.heading, {
    [styles.active]: props.active
    // [styles['enter-transition']]: enterDetailMode,
    // [styles['leave-transition']]: leavingDetailMode
  });
  const coverRoleClass = classNames('invisible', styles.role);
  const coverDescriptionClass = classNames('invisible', styles.product);
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
    <div
      id={props.id}
      className={styles.card}
      style={cssVars}
      ref={cardRef}
      onClick={props.onClick}
    >
      <p className={summaryClass}>{props.renderSummaryText()}</p>

      <div className={styles.content}>
        <img src={props.logo} ref={logoRef} className={styles.logo} />

        <div className={styles.cover}>
          <h2
            data-anim-target="cover-title"
            ref={headingRef}
            className={coverTitleClass}
          >
            {props.title}
          </h2>
          <h4 data-anim-target="cover-role" className={coverRoleClass}>
            {props.role}
          </h4>
          <p
            data-anim-target="cover-description"
            className={coverDescriptionClass}
          >
            {props.description}
          </p>
        </div>

        <div className={titleClass}>
          <button className={styles['btn-title']}>
            <h2 className={styles.text}>{props.title}</h2>
          </button>
        </div>

        <div
          data-anim-target="ball-placeholder"
          className={bgClass}
          ref={bgRef}
        ></div>
      </div>

      {props.renderBgAnimation?.(props.active)}
    </div>
  );
}

export default WorkBanner;
