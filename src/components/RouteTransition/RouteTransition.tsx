import { createRef, useRef } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';
import { matchPath, useLocation } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import usePreviousState from '@/hooks/usePreviousState.hook';
import useHomeRouteAnimation from './useHomeRouteTransition.hook';
import useWorkRouteTransition from './useWorkRouteTransition.hook';
// import TransitionContext from '../context/TransitionContext';

const RouteTransition = ({ children }: { children: any }) => {
  const nodeRef = createRef<any>();
  const location = useLocation();
  const prevLocation = usePreviousState(location);
  const transitionDone = useRef<Function | null>(null);
  // const { toggleCompleted } = useContext(TransitionContext);

  const homeRouteTransition = useHomeRouteAnimation(prevLocation.pathname);
  const workRouteTransition = useWorkRouteTransition(prevLocation.pathname);

  const defaultConfig = {
    onEnter: () => {},
    onEntered: () => {
      console.log('entered');
    },
    onExit: () => {},
    onExited: () => {
      console.log('exited');
    },
    appear: true,
    unmountOnExit: true
  };

  const transitionConfig: Record<string, any> = {
    [ROUTE_PATH_PATTERNS.HOME]: {
      onEnter: doneAfterCall(homeRouteTransition.onEnter),
      onEntered: () => {
        console.log('entered home');
      },
      onExit: doneAfterCall(homeRouteTransition.onExit),
      onExited: () => {
        console.log('exited home');
      },
      appear: homeRouteTransition.appear,
      timeout: homeRouteTransition.timeout,
      unmountOnExit: homeRouteTransition.unmountOnExit
    },
    [ROUTE_PATH_PATTERNS.WORK]: {
      onEnter: doneAfterCall(workRouteTransition.onEnter),
      onEntered: () => {
        console.log('entered work');
      },
      onExit: doneAfterCall(workRouteTransition.onExit),
      onExited: () => {
        console.log('exited work');
      },
      appear: workRouteTransition.appear,
      timeout: workRouteTransition.timeout,
      unmountOnExit: workRouteTransition.unmountOnExit
    }
  };

  function getTransitionConfig(pathname: string) {
    const transitionKeyByPath = {
      [ROUTE_PATH_PATTERNS.HOME]: ROUTE_PATH_PATTERNS.HOME,
      [ROUTE_PATH_PATTERNS.WORK]: ROUTE_PATH_PATTERNS.WORK,
      // work highlight is work page's child route, so use the same key to prevent re-transition
      [ROUTE_PATH_PATTERNS.WORK_HIGHLIGHT]: ROUTE_PATH_PATTERNS.WORK
    };
    const matchedPath = Object.keys(transitionKeyByPath).find(
      pattern => !!matchPath(pattern, pathname)
    );
    const transitionKey =
      transitionKeyByPath[matchedPath as ROUTE_PATH_PATTERNS];

    if (!transitionKey) {
      return {
        config: defaultConfig,
        key: location.pathname
      };
    }

    return {
      config: transitionConfig[transitionKey as string] ?? defaultConfig,
      key: transitionKey
    };
  }

  const { key, config } = getTransitionConfig(location.pathname);

  function addEndListener(done: Function) {
    transitionDone.current = done;
  }

  function doneAfterCall(transition: () => gsap.core.Timeline) {
    return () => {
      transition()
        .play(0)
        .then(() => {
          transitionDone.current?.();
        });
    };
  }

  return (
    <SwitchTransition>
      <Transition
        nodeRef={nodeRef}
        key={key}
        addEndListener={addEndListener}
        unmountOnExit={true}
        onEnter={config.onEnter}
        onEntered={config.onEntered}
        onExit={config.onExit}
        onExited={config.onExited}
        appear={config.appear}
      >
        <div ref={nodeRef}>{children}</div>
      </Transition>
    </SwitchTransition>
  );
};

export default RouteTransition;
