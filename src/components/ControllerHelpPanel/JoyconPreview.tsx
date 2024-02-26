import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './JoyconPreview.module.scss';
import { useRef } from 'react';

function JoyconPreview({ active }: { active: boolean }) {
  const nodeRef = useRef<any>(null);

  useGSAP(
    () => {
      const leftJoyconMove = gsap
        .timeline()
        .to('[data-anim-target="left-joycon-figure"]', {
          translateY: '10%',
          ease: 'power2.out'
        })
        .to('[data-anim-target="left-joycon-figure"]', {
          translateY: 0,
          duration: 0.75,
          ease: 'back.out'
        });

      const rightJoyconMove = gsap
        .timeline()
        .to('[data-anim-target="right-joycon-figure"]', {
          translateY: '-10%',
          ease: 'power2.out'
        })
        .to('[data-anim-target="right-joycon-figure"]', {
          translateY: 0,
          duration: 0.75,
          ease: 'back.out'
        });

      if (active) {
        gsap
          .timeline({
            repeat: -1,
            repeatDelay: 3,
            delay: 3
          })
          .add(leftJoyconMove)
          .add(rightJoyconMove, '<');
      }
    },
    { scope: nodeRef, dependencies: [active], revertOnUpdate: true }
  );

  return (
    <div ref={nodeRef} className={styles.wrapper}>
      <div
        data-anim-target="left-joycon-figure"
        className={styles['left-joycon']}
      >
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
      <div
        data-anim-target="right-joycon-figure"
        className={styles['right-joycon']}
      >
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

export default JoyconPreview;
