import styles from './ScreenModeController.module.scss';

function ScreenModeController() {
  return (
    <div className={styles.wrapper}>
      <div className={styles['left-joycon']}>
        <button
          data-anim-target="button-x"
          className={`${styles['btn-joycon-1']} ${styles['btn-up']}`}
        >
          <div className={styles['arrow-up']}></div>
        </button>
        <button
          data-anim-target="button-y"
          className={`${styles['btn-joycon-1']} ${styles['btn-down']}`}
        >
          <div className={styles['arrow-down']}></div>
        </button>
      </div>
      <div className={styles['right-joycon']}>
        <button
          data-anim-target="button-x"
          className={`${styles['btn-joycon-2']}`}
        >
          <div className={styles.letter}>A</div>
        </button>
        <button
          data-anim-target="button-x"
          className={`${styles['btn-joycon-2']}`}
        >
          <div className={styles.letter}>B</div>
        </button>
      </div>
    </div>
  );
}

export default ScreenModeController;
