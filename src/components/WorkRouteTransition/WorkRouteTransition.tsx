import gsap from 'gsap';
import { createRef, useRef } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';
import { matchPath, useLocation } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import useTechBlockAnimations from '@/components/WorkDetail/useTechBlockAnimations.hook';
import usePreviousState from '@/hooks/usePreviousState.hook';

const WorkRouteTransition = ({ children }: { children: any }) => {
  const nodeRef = createRef<any>();
  const { startSingleConMode, screenModeToSingleCon, singleConToScreenMode } =
    useControllerAnimations();
  const { setupEnterAnimation, setupExitAnimation } = useTechBlockAnimations();
  const location = useLocation();
  const prevLocation = usePreviousState(location);
  const transitionDone = useRef<Function | null>(null);

  const transitionConfig = {
    [ROUTE_PATH_PATTERNS.WORK_DETAIL]: {
      onEnter: () => {
        let enterTransition = gsap
          .timeline({ paused: true })
          .eventCallback('onComplete', () => {
            transitionDone.current?.();
          });
        if (isFromPath(ROUTE_PATH_PATTERNS.WORK_DETAIL)) {
          enterTransition.add(startSingleConMode());
        } else if (isFromPath(ROUTE_PATH_PATTERNS.WORK)) {
          enterTransition.add(screenModeToSingleCon());
        }

        enterTransition.play(0);
      },
      onEntered: () => {
        console.log('entered work detail');
      },
      onExit: () => {
        console.log('exit work detail');
        let exitTransition = gsap
          .timeline({ paused: true })
          .eventCallback('onComplete', () => {
            transitionDone.current?.();
          });

        if (isToPath(ROUTE_PATH_PATTERNS.WORK)) {
          exitTransition
            .call(() => {
              window.scrollTo({
                top: 0
              });
            })
            .add(singleConToScreenMode());
        }

        exitTransition.play(0);
      },
      onExited: () => {
        console.log('exited work detail');
      }
    },
    [ROUTE_PATH_PATTERNS.WORK]: {
      onEnter: () => {
        console.log('enter work list', transitionDone.current);
        gsap.timeline().eventCallback('onComplete', () => {
          transitionDone.current?.();
        });
      },
      onEntered: () => {
        console.log('entered work list');
      },
      onExit: () => {
        gsap.timeline().eventCallback('onComplete', () => {
          transitionDone.current?.();
        });
      },
      onExited: () => {
        console.log('exited work list');
      }
    }
  };

  const noTransitionConfig = {
    onEnter: () => {
      console.log('default');
    },
    onEntered: () => {
      console.log('default entered');
    },
    onExit: () => {},
    onExited: () => {
      console.log('default exited');
    }
  };

  function getConfig() {
    return !!matchPath(ROUTE_PATH_PATTERNS.WORK, location.pathname)
      ? transitionConfig[ROUTE_PATH_PATTERNS.WORK]
      : !!matchPath(ROUTE_PATH_PATTERNS.WORK_DETAIL, location.pathname)
      ? transitionConfig[ROUTE_PATH_PATTERNS.WORK_DETAIL]
      : noTransitionConfig;
  }

  function isToPath(pathPattern: ROUTE_PATH_PATTERNS) {
    return !!matchPath(pathPattern, window.location.pathname);
  }

  function isFromPath(pathPattern: ROUTE_PATH_PATTERNS) {
    return !!matchPath(pathPattern, prevLocation.pathname);
  }

  function addEndListener(done: Function) {
    transitionDone.current = done;
  }

  const config = getConfig();

  return (
    <SwitchTransition>
      <Transition
        nodeRef={nodeRef}
        key={location.pathname}
        addEndListener={addEndListener}
        onEnter={config.onEnter}
        onEntered={config.onEntered}
        onExit={config.onExit}
        onExited={config.onExited}
        unmountOnExit={true}
        appear={true}
      >
        <div ref={nodeRef}>{children}</div>
      </Transition>
    </SwitchTransition>
  );
};

export default WorkRouteTransition;
