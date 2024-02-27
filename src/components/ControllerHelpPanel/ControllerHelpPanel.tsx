import { useContext, useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './ControllerHelpPanel.module.scss';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import JoyconPreview from './JoyconPreview';
import { Transition } from 'react-transition-group';
import { useGSAP } from '@gsap/react';
import { useLocation } from 'react-router-dom';

function ControllerHelpPanel() {
  const { visibleHelpPanel, setVisibleHelpPanel, helpPanelGuides } = useContext(
    ControllerButtonContext
  );
  const nodeRef = useRef<any>(null);
  const animationDone = useRef<Function | null>(null);
  const enterAnim = useRef<gsap.core.Timeline | null>(null);
  const location = useLocation();
  const { contextSafe } = useGSAP({ scope: nodeRef });
  const guides = renderGuides();

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

  function renderGuides() {
    const guides = [
      ['Double tap', '{B}', 'to open help panel'],
      ...helpPanelGuides
    ];
    const buttonByCode: Record<string, React.ReactElement> = {
      '{A}': <div className={styles['joycon-btn']}>A</div>,
      '{B}': <div className={styles['joycon-btn']}>B</div>,
      '{UP}': (
        <div className={styles['joycon-btn']}>
          <div className={styles['arrow-up']}></div>
        </div>
      ),
      '{DOWN}': (
        <div className={styles['joycon-btn']}>
          <div className={styles['arrow-down']}></div>
        </div>
      )
    };

    return guides.map(textArr => (
      <div className={styles.guide}>
        {textArr.map(
          (text: string) => buttonByCode[text as string] ?? <span>{text}</span>
        )}
      </div>
    ));
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
              {guides}
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
