import { useRef } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';
import { matchPath } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import useTransitionEndListener from '@/hooks/useTransitionEndListener.hook';
import { waitForElements } from '@/utils/document';
import useWorkDetailRouteTransition from './useWorkDetailRouteTransition.hook';
import useWorkIndexRouteTransition from './useWorkIndexRouteTransition.hook';

const WorkRouteTransition = ({ children }: { children: any }) => {
  const nodeRef = useRef<any>(null);
  const { addEndListener, doneWithoutTransition } = useTransitionEndListener(
    'workroute.default.transitionend'
  );
  const detailRouteConfig = useWorkDetailRouteTransition();
  const indexRouteConfig = useWorkIndexRouteTransition();
  // prevent onEnter running twice on Strict mode
  // animation is run as promise callback, needs to be manually validated
  const enterWorkDetailInQueue = useRef<boolean>(false);

  const transitionConfig = {
    [ROUTE_PATH_PATTERNS.WORK_DETAIL]: {
      onEnter: () => {
        waitForElements([
          '[data-anim-target="work-detail"]',
          '[data-anim-target="tech-block"]'
        ]).then(() => {
          if (!enterWorkDetailInQueue.current) {
            enterWorkDetailInQueue.current = true;
            detailRouteConfig.onEnter();
          }
        });
      },
      onEntered: () => {
        enterWorkDetailInQueue.current = false;
        detailRouteConfig.onEntered();
      },
      onExit: detailRouteConfig.onExit,
      onExited: detailRouteConfig.onExited,
      addEndListener: detailRouteConfig.addEndListener
    },
    [ROUTE_PATH_PATTERNS.WORK]: {
      onEnter: indexRouteConfig.onEnter,
      onEntered: indexRouteConfig.onEntered,
      onExit: indexRouteConfig.onExit,
      onExited: indexRouteConfig.onExited,
      addEndListener: indexRouteConfig.addEndListener
    }
  };

  const noTransitionConfig = {
    onEnter: () => {
      doneWithoutTransition();
    },
    onEntered: () => {},
    onExit: () => {
      doneWithoutTransition();
    },
    onExited: () => {},
    addEndListener
  };

  function getConfig() {
    if (!!matchPath(ROUTE_PATH_PATTERNS.WORK, location.pathname)) {
      return {
        key: ROUTE_PATH_PATTERNS.WORK,
        config: transitionConfig[ROUTE_PATH_PATTERNS.WORK]
      };
    }
    if (!!matchPath(ROUTE_PATH_PATTERNS.WORK_DETAIL, location.pathname)) {
      return {
        key: ROUTE_PATH_PATTERNS.WORK_DETAIL,
        config: transitionConfig[ROUTE_PATH_PATTERNS.WORK_DETAIL]
      };
    }
    return {
      key: '404',
      config: noTransitionConfig
    };
  }

  const { config, key } = getConfig();

  return (
    <SwitchTransition>
      <Transition
        nodeRef={nodeRef}
        key={key}
        addEndListener={config.addEndListener}
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
