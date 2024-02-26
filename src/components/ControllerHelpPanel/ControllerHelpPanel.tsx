import { useContext, useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './ControllerHelpPanel.module.scss';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import JoyconPreview from './JoyconPreview';
import { Transition } from 'react-transition-group';
import { useGSAP } from '@gsap/react';
import { useLocation } from 'react-router-dom';

function ControllerHelpPanel() {
  const { visibleHelpPanel, setVisibleHelpPanel } = useContext(
    ControllerButtonContext
  );
  const nodeRef = useRef<any>(null);
  const animationDone = useRef<Function | null>(null);
  const enterAnim = useRef<gsap.core.Timeline | null>(null);
  const location = useLocation();
  const { contextSafe } = useGSAP({ scope: nodeRef });

  useEffect(() => {
    setVisibleHelpPanel(false);
  }, [location]);

  function onCloseBtnClick() {
    setVisibleHelpPanel(false);
  }

  const onEnter = contextSafe(() => {
    enterAnim.current = gsap
      .timeline()
      .set(nodeRef.current, { display: 'flex' })
      .to('[data-anim-target="help-panel-overlay"]', { autoAlpha: 0.3 })
      .to('[data-anim-target="help-panel"]', {
        translateY: 0,
        autoAlpha: 1,
        ease: 'back.out',
        duration: 0.75
      });
  });

  const onExit = contextSafe(() => {
    enterAnim.current?.reverse();
  });

  function addEndListener(done: Function) {
    animationDone.current = done;
  }

  return (
    <Transition
      nodeRef={nodeRef}
      addEndListener={addEndListener}
      onEnter={onEnter}
      onExit={onExit}
      in={visibleHelpPanel}
    >
      <div ref={nodeRef} className={styles['help-wrapper']}>
        <div data-anim-target="help-panel" className={styles['help-panel']}>
          <div className={styles['help-panel-inner']}>
            <div className={styles.tips}>
              Use the controllers to navigate pages. <br /> You can open help
              panel from anywhere to check what it does.
            </div>

            <figure className={styles.controller}>
              <JoyconPreview active={visibleHelpPanel} />
            </figure>
            <div className={styles.guides}>
              <div className={styles.guide}>
                <span>Double tap</span>
                <div className={styles['joycon-btn']}>B</div>
                <span>to open help panel</span>
              </div>
              <div className={styles.guide}>
                <span>Press</span>
                <div className={styles['joycon-btn']}>A</div>
                <span>to go back</span>
              </div>

              <div className={styles.guide}>
                <span>Press</span>
                <div className={styles['joycon-btn']}>B</div>
                <span>to view work highlights!</span>
              </div>

              <div className={styles.guide}>
                <span>Press</span>
                <div className={styles['joycon-btn']}>
                  <div className={styles['arrow-up']}></div>
                </div>
                <div
                  className={`${styles['joycon-btn']} ${styles['joycon-btn--r180']}`}
                >
                  <div className={styles['arrow-down']}></div>
                </div>
                <span>to navigate list</span>
              </div>

              <div className={styles['btn-close-wrapper']}>
                <button
                  onClick={onCloseBtnClick}
                  className={styles['btn-close']}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          data-anim-target="help-panel-overlay"
          className={styles.overlay}
        ></div>
      </div>
    </Transition>
  );
}
export default ControllerHelpPanel;
