import { useContext, useEffect } from 'react';
import styles from './ControllerButton.module.scss';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import useControllerAnimations from './useControllerAnimations.hook';

function ControllerButton() {
  const { actions } = useContext(ControllerButtonContext);
  const { toDetachedConModeAnimation, toSingleConModeAnimation } =
    useControllerAnimations();

  useEffect(() => {
    toDetachedConModeAnimation.current?.play();
  }, []);

  return (
    <div data-anim-target="controller-button" className={styles.controller}>
      <div
        data-anim-target="controller-group"
        className={styles['btn-group-top']}
      >
        <button
          data-anim-target="button-y"
          className={`${styles['btn-joycon-1']} ${styles['btn-down']}`}
          onClick={() => {
            actions?.current?.['onControlYClick']();
          }}
        >
          <div className={styles.arrow}></div>
        </button>
        <button
          data-anim-target="button-x"
          className={`${styles['btn-joycon-1']} ${styles['btn-up']}`}
          onClick={() => {
            actions?.current?.['onControlXClick']();
          }}
        >
          <div className={styles.arrow}></div>
        </button>
      </div>

      <div
        data-anim-target="controller-group"
        className={styles['btn-group-bot']}
      >
        <button
          data-anim-target="button-b"
          className={`${styles['btn-joycon-2']} ${styles['btn-b']}`}
          onClick={() => {
            toSingleConModeAnimation.current?.play();
            actions?.current?.['onControlBClick']();
          }}
        >
          <div className={styles.letter}>B</div>
        </button>
        <button
          data-anim-target="button-a"
          className={`${styles['btn-joycon-2']} ${styles['btn-a']}`}
          onClick={() => {
            toSingleConModeAnimation.current?.reverse();

            actions?.current?.['onControlAClick']();
          }}
        >
          <div className={styles.letter}>A</div>
        </button>
      </div>
    </div>
  );
}
export default ControllerButton;
