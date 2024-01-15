/**
 * This is only for reference.
 * Was a custom router to hack around route transition.
 * But this approach is not reliable as this cause some react router hooks not working
 * e.g: useParams(), etc
 */

import useEffectOnChange from '@/hooks/useEffectOnChange.hook';
import usePreviousState from '@/hooks/usePreviousState.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { createRef, useRef, useState } from 'react';
import { matchPath, useLocation, useOutlet } from 'react-router-dom';
import { Transition, TransitionGroup } from 'react-transition-group';
import useHomeEnterAnimation from '@/hooks/route-transition/useHomeRouteTransition.hook';
import useWorkRouteTransition from '@/hooks/route-transition/useWorkRouteTransition.hook';

function RouterWithTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const prevLocation = usePreviousState(location);
  const deferredTransitions = useRef<any[]>([]);
  const [activePage, setActivePage] = useState<React.ReactElement | null>(
    outlet
  );
  const deferredPage = useRef<React.ReactElement | null>(null);
  const homeRouteTransition = useHomeEnterAnimation(prevLocation.pathname);
  const workRouteTransition = useWorkRouteTransition(prevLocation.pathname);
  const routes = [
    {
      path: ROUTE_PATH_PATTERNS.HOME,
      nodeRef: createRef<any>(),
      onEnter: homeRouteTransition.onEnter,
      onEntered: () => {
        console.log('entered home');
      },
      onExit: homeRouteTransition.onExit,
      onExited: () => {
        console.log('exited home');
        renderDeferredPage();
      },
      appear: homeRouteTransition.appear,
      timeout: homeRouteTransition.timeout,
      unmountOnExit: homeRouteTransition.unmountOnExit
    },
    {
      path: ROUTE_PATH_PATTERNS.WORK,
      nodeRef: createRef<any>(),
      onEnter: workRouteTransition.onEnter,
      onEntered: () => {
        console.log('entered work');
      },
      onExit: workRouteTransition.onExit,
      onExited: () => {
        console.log('exited work');
        renderDeferredPage();
      },
      appear: workRouteTransition.appear,
      timeout: workRouteTransition.timeout,
      unmountOnExit: workRouteTransition.unmountOnExit
    }
  ];
  const [activeRoutes, setActiveRoutes] = useState<any[]>(
    routes.filter(route => !!matchPath(route?.path, location.pathname))
  );

  useEffectOnChange(() => {
    const next = routes.filter(
      route => !!matchPath(route?.path, location.pathname)
    );

    if (!matchPath(next[0].path, prevLocation.pathname)) {
      deferredTransitions.current = next;
      deferredPage.current = outlet;

      // remove items from list to trigger exit transition
      setActiveRoutes([]);
    }
  }, [location.pathname]);

  // put back deferred items and trigger enter transition
  function renderDeferredPage() {
    setActivePage(deferredPage.current);
    setActiveRoutes(deferredTransitions.current);
  }

  return (
    <TransitionGroup>
      {activeRoutes.map(({ nodeRef, path, el, ...props }) => {
        return (
          <Transition nodeRef={nodeRef} key={path} {...props}>
            <div ref={nodeRef}>{activePage}</div>
          </Transition>
        );
      })}
    </TransitionGroup>
  );
}

export default RouterWithTransition;
