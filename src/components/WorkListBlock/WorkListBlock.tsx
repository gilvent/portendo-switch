import styles from './WorkListBlock.module.scss';
import WorkBannerBlock from '@/components/WorkBanner';
import mopertyLogo from 'assets/img/brand/moperty-white.svg';
import blibliWhiteLogo from 'assets/img/brand/blibli-white.svg';
import GiftsImage from '@/components/GiftsImage';
import { useContext, useEffect, useRef } from 'react';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import WorkPageContext, { WorkDetailName } from '@/context/WorkPageContext';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { useGSAP } from '@gsap/react';
import useActiveWorkBanner from './useActiveWorkBanner.hook';
import {
  sceneSlideTo,
  setupBallAndSlider
} from '@/utils/gsap/animations/work-list';

function WorkListBlock() {
  const nodeRef = useRef(null);
  const navigate = useNavigate();
  const { activeBanner, bannersByTitle, prevBanner } = useActiveWorkBanner();
  const { setAction } = useContext(ControllerButtonContext);
  // TODO activeWorkDetail is deprecated, use params title instead
  const { activeWorkDetail } = useContext(WorkPageContext);

  useGSAP(() => {
    setupBallAndSlider({
      firstElSelector: bannersByTitle[WorkDetailName.Blibli].selector,
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
      }).play(0);
    }
  }, [activeBanner]);

  useEffect(() => {
    setAction('onControlXClick', () => {
      const nextUrl = ROUTE_PATH_PATTERNS.WORK.replace(
        ':title',
        activeBanner.nextBannerTitle
      );
      navigate(nextUrl, { replace: true });
    });
    setAction('onControlYClick', () => {
      const prevUrl = ROUTE_PATH_PATTERNS.WORK.replace(
        ':title',
        activeBanner.prevBannerTitle
      );
      navigate(prevUrl, { replace: true });
    });
  }, [activeBanner]);

  return (
    <div ref={nodeRef} className={styles['work-nav']}>
      <div data-anim-target="work-pointer-ball" className={styles.ball}></div>
      <div className={styles.slidescreen}></div>
      <div
        data-anim-target="work-slider-wrapper"
        className={styles['banner-wrapper']}
      >
        <div
          id="blibli-banner-container"
          className={styles['banner-container']}
        >
          <WorkBannerBlock
            id="blibli-banner"
            title="Blibli.com"
            description="An indonesian e-commerce with wide range of products
        from both offline business to online."
            role="Front-end Developer"
            renderSummaryText={() => (
              <>
                Being a <strong>front end developer</strong>, I worked in <br />
                <strong>Product Detail Squad</strong> on developing UI
                components, layouts and interactions for product detail and
                product review features in <strong>Blibli.com’s</strong> web
                application.
              </>
            )}
            // TODO activeWorkDetail is deprecated, use params title instead
            active={activeWorkDetail === WorkDetailName.Blibli}
            logo={blibliWhiteLogo}
            titleColor="#0092da"
            renderBgAnimation={active => <GiftsImage active={active} />}
            onClick={() => {}}
          />
        </div>
        <div
          id="moperty-banner-container"
          className={styles['banner-container']}
        >
          <WorkBannerBlock
            id="moperty-banner"
            title="Moperty"
            description="A progressive web app to browse available real estate in local area around my hometown."
            role="Product Builder"
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
            active={activeWorkDetail === WorkDetailName.Moperty}
            logo={mopertyLogo}
            titleColor="#3f51b5"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export default WorkListBlock;
