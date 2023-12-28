import styles from './WorkListBlock.module.scss';
import WorkBannerBlock from '@/components/WorkBanner';
import mopertyLogo from 'assets/img/brand/moperty-white.svg';
import blibliWhiteLogo from 'assets/img/brand/blibli-white.svg';
import GiftsImage from '@/components/GiftsImage';
import useWorkListAnimation from './useWorkListAnimation.hook';
import { useContext, useEffect, useRef } from 'react';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import WorkPageContext, { WorkDetailName } from '@/context/WorkPageContext';

function WorkListBlock() {
  const ballRef = useRef(null);
  const sliderRef = useRef(null);
  const {
    enterAnimation,
    nextAnimation,
    prevAnimation,
    enterWorkDetailAnimation,
    activeBannerIndex
  } = useWorkListAnimation({
    ballRef,
    sliderRef
  });
  const { setAction } = useContext(ControllerButtonContext);
  const { openWorkDetail, activeWorkDetail, closeWorkDetail } =
    useContext(WorkPageContext);

  useEffect(() => {
    enterAnimation.current?.play();

    return () => {
      enterAnimation.current?.kill();
    };
  }, []);

  useEffect(() => {
    setAction('onControlXClick', () => {
      nextAnimation.current?.play();
    });
    setAction('onControlYClick', () => {
      prevAnimation.current?.play();
    });
    setAction('onControlBClick', () => {
      const anim = enterWorkDetailAnimation.current?.eventCallback(
        'onComplete',
        () => {
          openWorkDetail();
        }
      );

      anim?.play();
    });
    setAction('onControlAClick', () => {
      window.scrollTo({
        top: 0
      });
      closeWorkDetail();
      enterWorkDetailAnimation.current?.reverse();
    });
  }, [activeBannerIndex, activeWorkDetail]);

  return (
    <div className={styles['work-nav']}>
      <div ref={ballRef} className={styles.ball}></div>
      <div className={styles.slidescreen}></div>
      <div ref={sliderRef} className={styles['banner-wrapper']}>
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
