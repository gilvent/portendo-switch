import { CSSProperties, useContext, useRef } from 'react';
import styles from './ControllerButton.module.scss';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import debounced from '@/utils/debounced';
import ControllerScreen from '@/components/ControllerScreen';

function ControllerButton() {
  const { actions, setVisibleHelpPanel, joyconColors } = useContext(
    ControllerButtonContext
  );
  const rootRef = useRef<any>(null);
  const clickCount = useRef<number>(0);

  function runActionB() {
    if (clickCount.current >= 2) {
      setVisibleHelpPanel(true);
    } else {
      actions?.current?.['onControlBClick']();
    }
    clickCount.current = 0;
  }

  const handleActionB = debounced(runActionB, 300);

  function handleBtnBClick() {
    clickCount.current++;
    handleActionB();
  }

  return (
    <div
      ref={rootRef}
      data-anim-target="controller-button"
      className={styles.controller}
    >
      <div className={styles.tendo}>
        <div
          data-anim-target="left-joycon"
          className={styles['left-joycon']}
          style={{ '--left-joycon-color': joyconColors.left } as CSSProperties}
        >
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

        <div
          data-anim-target="dock-screen-wrapper"
          className={styles['dock-screen-wrapper']}
        >
          <div
            data-anim-target="dock-back"
            className={`${styles['dock-back']} invisible`}
          ></div>
          <div
            data-anim-target="dock-front"
            className={`${styles['dock-front']} invisible`}
          >
            <div data-anim-target="led" className={styles.led}></div>
          </div>
          <div data-anim-target="screen" className={styles.screen}>
            <div
              data-anim-target="inner-screen"
              className={styles['inner-screen']}
            >
              <ControllerScreen />
            </div>

            <div
              data-anim-target="shut-down-overlay"
              className={styles['shut-down-overlay']}
            ></div>
          </div>
        </div>

        <div
          data-anim-target="right-joycon"
          className={styles['right-joycon']}
          style={
            { '--right-joycon-color': joyconColors.right } as CSSProperties
          }
        >
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
            onClick={handleBtnBClick}
          >
            <div className={styles.letter}>B</div>
          </button>
        </div>
      </div>
    </div>
  );
}
export default ControllerButton;
