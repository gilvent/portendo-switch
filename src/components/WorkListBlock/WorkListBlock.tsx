import styles from './WorkListBlock.module.scss';
import WorkBannerBlock from '@/components/WorkBanner';
import mopertyLogo from 'assets/img/brand/moperty-white.svg';
import blibliWhiteLogo from 'assets/img/brand/blibli-white.svg';
import radjastoneProduct from 'assets/img/brand/rj-limestone-white.svg';
import GiftsImage from '@/components/GiftsImage';
import { useEffect, useRef, useState } from 'react';
import { WorkHighlightId } from '@/utils/enums';
import { useGSAP } from '@gsap/react';
import useActiveWorkBanner from './useActiveWorkBanner.hook';
import {
  sceneSlideTo,
  setupBallAndSlider
} from '@/utils/gsap/animation-helpers/work-list-block';
import useCustomEvent from '@/hooks/useCustomEvent.hook';
import { disableController, enableController } from '@/utils/document';
import classNames from 'classnames';

function WorkListBlock() {
  const nodeRef = useRef(null);
  const { activeBanner, bannersByTitle, prevBanner } = useActiveWorkBanner();
  const [activeBg, setActiveBg] = useState<WorkHighlightId | null>(null);
  const {
    addListener: addShowBgListener,
    removeListener: removeShowBgListener
  } = useCustomEvent('worklistblock.showWorkSummaryBg');
  const {
    addListener: addHideBgListener,
    removeListener: removeHideBgListener
  } = useCustomEvent('worklistblock.hideWorkSummaryBg');

  useGSAP(() => {
    setupBallAndSlider({
      firstElSelector: bannersByTitle[WorkHighlightId.Blibli].selector,
      targetElSelector: activeBanner.selector,
      ballColor: activeBanner.background
    });
  });

  useGSAP(() => {
    if (prevBanner.url !== activeBanner.url) {
      sceneSlideTo({
        targetElSelector: activeBanner.selector,
        currentElSelector: prevBanner.selector,
        ballColor: activeBanner.background
      })
        .eventCallback('onStart', () => {
          disableController();
        })
        .eventCallback('onComplete', () => {
          enableController();
        })
        .play(0);
    }
  }, [activeBanner]);

  useEffect(() => {
    addShowBgListener(() => {
      setActiveBg(activeBanner.title);
    });
    addHideBgListener(() => {
      setActiveBg(null);
    });

    return () => {
      removeShowBgListener();
      removeHideBgListener();
    };
  }, [activeBanner]);

  return (
    <div ref={nodeRef} className={styles['work-nav']}>
      <div data-anim-target="work-pointer-ball" className={styles.ball}></div>

      <div
        data-anim-target="work-slider-wrapper"
        className={styles['slider-wrapper']}
      >
        <div
          id="blibli-banner-container"
          className={classNames(styles['banner-container'], {
            [styles.active]: activeBanner.title === WorkHighlightId.Blibli
          })}
        >
          <WorkBannerBlock
            id="blibli-banner"
            title="Blibli.com"
            description="An indonesian e-commerce with wide range of products
        from both offline business to online."
            role="Front-end Developer @"
            renderSummaryText={() => (
              <>
                Being a <strong>front end developer</strong>, I worked on <br />
                the marketplace's <strong>Customer Experience</strong>.
                Developed UI components, layouts and interactions for product
                detail and product review features in{' '}
                <strong>Blibli.com’s</strong> web application.
              </>
            )}
            active={activeBg === WorkHighlightId.Blibli}
            renderCoverLogo={() => (
              <img
                src={blibliWhiteLogo}
                className={classNames(styles.logo, styles['logo-blibli'])}
              />
            )}
            titleColor="#0092da"
            renderBgAnimation={active => <GiftsImage active={active} />}
            url={'https://blibli.com'}
          />
        </div>
        <div
          id="moperty-banner-container"
          className={classNames(styles['banner-container'], {
            [styles.active]: activeBanner.title === WorkHighlightId.Moperty
          })}
        >
          <WorkBannerBlock
            id="moperty-banner"
            title="Moperty"
            description="A progressive web app to browse available real estate in local area around my hometown."
            role="Use My Free Time Building"
            renderSummaryText={() => (
              <>
                This is a <strong>"build the whole thing"</strong> project for
                me. I <strong>design</strong> the user interfaces,{' '}
                <strong>code</strong> frontends and backends, implement{' '}
                <strong>SEO</strong> techniques while also learning some{' '}
                <strong>real estate broker knowledge</strong>.
                <br />
              </>
            )}
            active={activeBg === WorkHighlightId.Moperty}
            renderCoverLogo={() => (
              <img
                src={mopertyLogo}
                className={classNames(styles.logo, styles['logo-moperty'])}
              />
            )}
            titleColor="#3f51b5"
            url="https://moperty.id"
          />
        </div>
        <div
          id="radjastone-banner-container"
          className={classNames(styles['banner-container'], {
            [styles.active]: activeBanner.title === WorkHighlightId.Radjastone
          })}
        >
          <WorkBannerBlock
            id="radjastone-banner"
            title="Radjastone"
            description="An Indonesian company providing services related to architecture / interior / exterior design made with natural stones."
            role="Design and develop for"
            renderSummaryText={() => (
              <>
                I build <strong>Radjastone's</strong> company website from
                scratch. Starting with UI / UX design, to web app development
                using <strong>GSAP</strong> animation library and{' '}
                <strong>Strapi CMS</strong>.
              </>
            )}
            active={activeBg === WorkHighlightId.Radjastone}
            renderCoverLogo={() => (
              <img
                src={radjastoneProduct}
                className={classNames(styles.logo, styles['logo-radjastone'])}
              />
            )}
            titleColor="#9a883f"
            url={'https://radjastone.com'}
          />
        </div>

        <div
          data-anim-target="work-slider-bg"
          className={styles['slider-bg']}
        ></div>
      </div>
    </div>
  );
}

export default WorkListBlock;
