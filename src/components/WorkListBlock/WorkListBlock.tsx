import styles from './WorkListBlock.module.scss';
import WorkBannerBlock from '@/components/WorkBanner';
import mopertyLogo from 'assets/img/brand/moperty-white.svg';
import blibliWhiteLogo from 'assets/img/brand/blibli-white.svg';
import GiftsImage from '../BlibliCard/GiftsImage';
import useWorkListAnimation from './useWorkListAnimation.hook';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function WorkListBlock() {
  const ballRef = useRef(null);
  const sliderRef = useRef(null);
  const { enterFromHome, slideTo } = useWorkListAnimation({
    ballRef,
    sliderRef
  });

  useEffect(() => {
    enterFromHome();
  });

  return (
    <div className={styles['work-nav']}>
      <div ref={ballRef} className={styles.ball}></div>
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
            active={false}
            logo={blibliWhiteLogo}
            background="linear-gradient(132.36deg, #0092da 43.16%, #0071da 112.76%)"
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
            active={false}
            logo={mopertyLogo}
            background="conic-gradient(from 157.97deg at 55.38% 44.18%, #503FB5 -27.91deg, #3F51B5 202.5deg, #503FB5 332.09deg, #3F51B5 562.5deg)
          "
            titleColor="#3f51b5"
            onClick={() => {}}
          />
        </div>
      </div>

      <button
        className={styles.next}
        onClick={() => {
          slideTo(1);
        }}
      >
        next
      </button>
      <button
        className={styles.prev}
        onClick={() => {
          slideTo(0);
        }}
      >
        prev
      </button>
    </div>
  );
}

export default WorkListBlock;
