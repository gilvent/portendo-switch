import { MouseEventHandler, useRef } from 'react';
import classNames from 'classnames';
import styles from './WorkBanner.module.scss';

type WorkBannerProps = {
  id: string;
  title: string;
  description: string;
  role: string;
  active: boolean;
  logo: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  background?: string;
  titleColor: string;
  renderSummaryText: () => any;
  renderBgAnimation?: (active: boolean) => any;
};

function WorkBanner(props: WorkBannerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cssVars = {
    '--background': 'transparent', //props.background,
    '--title-color': props.titleColor
  } as React.CSSProperties;

  const summaryClass = classNames('invisible', styles.summary);
  const coverTitleClass = classNames('invisible', styles.heading);
  const coverRoleClass = classNames('invisible', styles.role);
  const coverDescriptionClass = classNames('invisible', styles.product);
  const bgClass = classNames('invisible', styles.background);
  const titleClass = classNames('invisible', styles.title);

  return (
    <div
      id={props.id}
      className={styles.card}
      style={cssVars}
      ref={cardRef}
      onClick={props.onClick}
    >
      <p data-anim-target="summary" className={summaryClass}>
        {props.renderSummaryText()}
      </p>

      <div className={styles.content}>
        <img src={props.logo} ref={logoRef} className={styles.logo} />

        <div className={styles.cover}>
          <h4 data-anim-target="cover-role" className={coverRoleClass}>
            {props.role}
          </h4>
          <h2
            data-anim-target="cover-title"
            ref={headingRef}
            className={coverTitleClass}
          >
            {props.title}
          </h2>
          <p
            data-anim-target="cover-description"
            className={coverDescriptionClass}
          >
            {props.description}
          </p>
        </div>

        <div data-anim-target="work-title" className={titleClass}>
          <button className={styles['btn-title']}>
            <h1 className={styles.text}>{props.title}</h1>
          </button>
        </div>

        <div
          data-anim-target="ball-placeholder"
          className={bgClass}
          ref={bgRef}
        ></div>
      </div>

      {props.renderBgAnimation?.(props.active)}

      <div
        className={`${styles['bg-overlay']}`}
        data-anim-target="banner-bg"
      ></div>
    </div>
  );
}

export default WorkBanner;
