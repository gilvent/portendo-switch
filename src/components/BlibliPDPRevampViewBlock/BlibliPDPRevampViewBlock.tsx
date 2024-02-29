import BlibliPDPScrollableWindow from '@/components/BlibliPDPScrollableWindow';
import styles from './BlibliPDPRevampViewBlock.module.scss';
import icDoc from 'assets/icons/ic-document.webp';
import icFork from 'assets/icons/ic-branch-fork.webp';
import icSearch from 'assets/icons/ic-search.webp';
import icMenu from 'assets/icons/ic-menu.webp';
import icVue from '@/assets/img/tech/vue.svg';
import { useEffect, useRef } from 'react';
import useFileBarAnimation from './useFileBarAnimation';
import useScrollTrigger from '@/hooks/useScrollTrigger.hook';
import useBlockEnterAnimation from '@/hooks/animations/useBlockEnterAnimation.hook';

function BlibliPDPRevampViewBlock() {
  const fileBarRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const { animationRef, setupAnimation } = useFileBarAnimation({});
  const { create: createAnimationTrigger1 } = useScrollTrigger();
  const { create: createAnimationTrigger2 } = useScrollTrigger();
  const { create: createAnimationTrigger3 } = useScrollTrigger();

  useBlockEnterAnimation({
    ref: blockRef,
    from: 'left'
  });

  useEffect(() => {
    setupAnimation({
      rootEl: fileBarRef.current ?? new HTMLElement(),
      filePanelClass: styles['file-panel']
    });
  }, []);

  function attachAnimationTriggers(editorWindowEl: HTMLDivElement) {
    createAnimationTrigger1({
      trigger: editorWindowEl,
      start: '30% center',
      end: '30% center',
      onEnter: () => {
        animationRef.current?.tweenTo('first-bar-collapse');
      },
      onLeaveBack: () => {
        animationRef.current?.tweenTo('start');
      }
    });

    createAnimationTrigger2({
      trigger: editorWindowEl,
      start: '65% center',
      end: '65% center',
      onEnter: () => {
        animationRef.current?.tweenTo('second-bar-collapse');
      },
      onLeaveBack: () => {
        animationRef.current?.tweenTo('first-bar-collapse');
      }
    });

    createAnimationTrigger3({
      trigger: editorWindowEl,
      start: '85% center',
      end: '85% center',
      onEnter: () => {
        animationRef.current?.tweenTo('last-bar-collapse');
      },
      onLeaveBack: () => {
        animationRef.current?.tweenTo('second-bar-collapse');
      }
    });
  }

  return (
    <div ref={blockRef} className={styles.block}>
      <div className={styles.title}>product-detail-revamp</div>
      <div className={styles.sidebar}>
        <div className={styles.nav}>
          <img src={icMenu} />
        </div>
        <div className={styles.nav}>
          <img src={icDoc} />
        </div>
        <div className={styles.nav}>
          <img src={icSearch} />
        </div>
        <div className={styles.nav}>
          <img src={icFork} />
        </div>
      </div>
      <div className={styles.editor}>
        <div ref={fileBarRef} className={styles['file-panel-container']}>
          <div className={`${styles['file-panel']}`}>
            <img className={styles['ext-logo']} src={icVue} />
            <span className={styles['file-name']}>HeroImage.vue</span>
            <span className={styles['btn-close']}>x</span>
          </div>
          <div className={`${styles['file-panel']}`}>
            <img className={styles['ext-logo']} src={icVue} />
            <span className={styles['file-name']}>ServicesSection.vue</span>
            <span className={styles['btn-close']}>x</span>
          </div>
          <div className={`${styles['file-panel']}`}>
            <img className={styles['ext-logo']} src={icVue} />
            <span className={styles['file-name']}>RecommendationCards.vue</span>
            <span className={styles['btn-close']}>x</span>
          </div>
        </div>
        <BlibliPDPScrollableWindow onRefLoaded={attachAnimationTriggers} />
      </div>
    </div>
  );
}

export default BlibliPDPRevampViewBlock;
