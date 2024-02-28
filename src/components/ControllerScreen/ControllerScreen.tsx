import gsap from 'gsap';
import { createRef, useContext } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';
import { ControllerScreenTitle } from '@/utils/enums';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import icHome from 'assets/icons/ic-home.webp';
import styles from './ControllerScreen.module.scss';

function HomeLandingScreen() {
  return (
    <div
      data-anim-target="screen-foreground"
      className={styles['home-landing-screen']}
    >
      <figure className={styles['home-picture']}>
        <img src={icHome} />
      </figure>
      <div className={styles.guide}>
        <div data-anim-target="guide-text" className={styles.help}>
          <div className={styles['btn-joycon-preview']}>B</div>
          <span>Get started</span>
        </div>
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
  );
}

function WorkLandingScreen() {
  return (
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
  );
}

function ControllerScreen() {
  const { activeScreen, changeScreenDirection } = useContext(
    ControllerButtonContext
  );
  const screens = [
    {
      key: ControllerScreenTitle.Home,
      nodeRef: createRef<HTMLDivElement>(),
      component: <HomeLandingScreen />
    },
    {
      key: ControllerScreenTitle.Work,
      nodeRef: createRef<HTMLDivElement>(),
      component: <WorkLandingScreen />
    }
  ];

  const controllerScreen = screens
    .filter(s => s.key === activeScreen)
    .map(screen => {
      return (
        <Transition
          nodeRef={screen.nodeRef}
          key={screen.key}
          onEntering={() => {
            const byDirection = {
              up: '-100%',
              down: '100%'
            };
            gsap.fromTo(
              screen.nodeRef.current,
              {
                translateY: byDirection[changeScreenDirection.current]
              },
              {
                translateY: 0
              }
            );
          }}
          onExiting={() => {
            const byDirection = {
              up: '100%',
              down: '-100%'
            };
            gsap.to(screen.nodeRef.current, {
              translateY: byDirection[changeScreenDirection.current]
            });
          }}
          timeout={500}
        >
          <div
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            ref={screen.nodeRef}
          >
            {screen.component}
          </div>
        </Transition>
      );
    });

  return <TransitionGroup component={null}>{controllerScreen}</TransitionGroup>;
}

export default ControllerScreen;
