import { createRef } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';
import { matchPath, useLocation } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import usePreviousState from '@/hooks/usePreviousState.hook';
import useHomeRouteAnimation from '../../hooks/route-transition/useHomeRouteTransition.hook';
import useWorkRouteTransition from '../../hooks/route-transition/useWorkRouteTransition.hook';
// import TransitionContext from '../context/TransitionContext';

const RouteTransition = ({ children }: { children: any }) => {
  const nodeRef = createRef<any>();
  const location = useLocation();
  const prevLocation = usePreviousState(location);
  // const { toggleCompleted } = useContext(TransitionContext);

  const homeRouteTransition = useHomeRouteAnimation(prevLocation.pathname);
  const workRouteTransition = useWorkRouteTransition(prevLocation.pathname);

  const transitionConfig = {
    [ROUTE_PATH_PATTERNS.HOME]: {
      onEnter: homeRouteTransition.onEnter,
      onEntered: () => {
        console.log('entered home');
      },
      onExit: homeRouteTransition.onExit,
      onExited: () => {
        console.log('exited home');
      },
      appear: homeRouteTransition.appear,
      timeout: homeRouteTransition.timeout,
      unmountOnExit: homeRouteTransition.unmountOnExit
    },
    [ROUTE_PATH_PATTERNS.WORK]: {
      onEnter: workRouteTransition.onEnter,
      onEntered: () => {
        console.log('entered work');
      },
      onExit: workRouteTransition.onExit,
      onExited: () => {
        console.log('exited work');
      },
      appear: workRouteTransition.appear,
      timeout: workRouteTransition.timeout,
      unmountOnExit: workRouteTransition.unmountOnExit
    }
  };

  function getTransitionConfig(pathname: string) {
    const key = Object.keys(transitionConfig).find(
      pattern => !!matchPath(pattern, pathname)
    );

    return {
      config: transitionConfig[key as ROUTE_PATH_PATTERNS],
      key
    };
  }

  const { key, config } = getTransitionConfig(location.pathname);

  return (
    <SwitchTransition>
      <Transition
        nodeRef={nodeRef}
        key={key}
        timeout={config.timeout}
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
