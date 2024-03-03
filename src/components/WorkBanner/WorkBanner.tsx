import { MouseEventHandler, useRef } from 'react';
import classNames from 'classnames';
import styles from './WorkBanner.module.scss';
import OpenWebsiteIcon from './OpenWebsiteIcon';

type WorkBannerProps = {
  id: string;
  title: string;
  description: string;
  role: string;
  active: boolean;
  logo: string;
  titleColor: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  url?: string;
  background?: string;
  renderSummaryText: () => any;
  renderBgAnimation?: (active: boolean) => any;
};

function WorkBanner(props: WorkBannerProps) {
  const cssVars = {
    '--background': 'transparent', //props.background,
    '--title-color': props.titleColor
  } as React.CSSProperties;

  const summaryClass = classNames('invisible', styles.summary);
  const coverTitleClass = classNames('invisible', styles.heading);
  const coverRoleClass = classNames('invisible', styles.role);
  const coverDescriptionClass = classNames('invisible', styles.product);
  const ballPlaceholderClass = classNames(
    'invisible',
    styles['pointer-ball-placeholder']
  );
  const titleClass = classNames('invisible', styles.title);
  const openWebsiteIcon = props.url ? (
    <OpenWebsiteIcon
      fill={'#fff'}
      forwardedClass={styles['icon-open-marker']}
    ></OpenWebsiteIcon>
  ) : null;

  return (
    <div
      id={props.id}
      className={styles.card}
      style={cssVars}
      onClick={props.onClick}
    >
      <p data-anim-target="summary" className={summaryClass}>
        {props.renderSummaryText()}
      </p>

      <div className={styles.content}>
        <img src={props.logo} className={styles.logo} />

        <div className={styles.cover}>
          <h4 data-anim-target="cover-role" className={coverRoleClass}>
            {props.role}
          </h4>
          <a
            className={styles['cover-title-link']}
            href={props.url}
            target="_blank"
          >
            <h2 data-anim-target="cover-title" className={coverTitleClass}>
              <span>
                {props.title}
                {props.url && (
                  <OpenWebsiteIcon
                    fill={props.titleColor}
                    forwardedClass={styles['icon-open-marker']}
                  ></OpenWebsiteIcon>
                )}
              </span>
            </h2>
          </a>

          <p
            data-anim-target="cover-description"
            className={coverDescriptionClass}
          >
            {props.description}
          </p>
        </div>

        <div data-anim-target="work-title" className={titleClass}>
          <a className={styles['btn-title']} href={props.url} target="_blank">
            <h1 className={styles.text}>
              <span>{props.title}</span>
              {props.url && (
                <OpenWebsiteIcon
                  fill={'#fff'}
                  forwardedClass={styles['icon-open-marker']}
                ></OpenWebsiteIcon>
              )}
            </h1>
          </a>
        </div>

        <div
          data-anim-target="ball-placeholder"
          className={ballPlaceholderClass}
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
