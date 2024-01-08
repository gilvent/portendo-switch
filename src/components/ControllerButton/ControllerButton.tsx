import { useContext, useRef } from 'react';
import styles from './ControllerButton.module.scss';
import ControllerButtonContext from '@/context/ControllerButtonContext';

function ControllerButton() {
  const { actions } = useContext(ControllerButtonContext);
  const rootRef = useRef<any>(null);

  return (
    <div
      ref={rootRef}
      data-anim-target="controller-button"
      className={styles.controller}
    >
      <div data-anim-target="tendo" className={styles.tendo}>
        <div data-anim-target="left-joycon" className={styles['left-joycon']}>
          <button
            data-anim-target="button-x"
            className={`${styles['btn-joycon-1']} ${styles['btn-up']}`}
            onClick={() => {
              actions?.current?.['onControlXClick']();
            }}
          >
            <div className={styles.arrow}></div>
          </button>
          <button
            data-anim-target="button-y"
            className={`${styles['btn-joycon-1']} ${styles['btn-down']}`}
            onClick={() => {
              actions?.current?.['onControlYClick']();
            }}
          >
            <div className={styles.arrow}></div>
          </button>
        </div>

        <div data-anim-target="screen" className={styles.screen}>
          <div
            data-anim-target="inner-screen"
            className={styles['inner-screen']}
          >
            <div
              data-anim-target="screen-foreground"
              className={styles['work-landing-screen']}
            >
              <h3 className={styles.title}>Work</h3>
              <div className={styles.guide}>
                <span data-anim-target="guide-text">Press B to start</span>
                <div
                  data-anim-target="loading-bar"
                  className={`${styles['loading-bar']} invisible`}
                >
                  <div
                    data-anim-target="loading-progress"
                    className={styles['inner-loading-bar']}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-anim-target="right-joycon" className={styles['right-joycon']}>
          <button
            data-anim-target="button-a"
            className={`${styles['btn-joycon-2']} ${styles['btn-a']}`}
            onClick={() => {
              actions?.current?.['onControlAClick']();
            }}
          >
            <div className={styles.letter}>A</div>
          </button>
          <button
            data-anim-target="button-b"
            className={`${styles['btn-joycon-2']} ${styles['btn-b']}`}
            onClick={() => {
              actions?.current?.['onControlBClick']();
            }}
          >
            <div className={styles.letter}>B</div>
          </button>
        </div>
      </div>
    </div>
  );
}
export default ControllerButton;
