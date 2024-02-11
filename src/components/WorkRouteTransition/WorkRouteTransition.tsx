import { useRef } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';
import { matchPath } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import useTransitionEndListener from '@/hooks/useTransitionEndListener.hook';
import { waitForElements } from '@/utils/document';
import useWorkHighlightRouteTransition from './useWorkHighlightRouteTransition.hook';
import useWorkIndexRouteTransition from './useWorkIndexRouteTransition.hook';

const WorkRouteTransition = ({ children }: { children: any }) => {
  const nodeRef = useRef<any>(null);
  const { addEndListener, doneWithoutTransition } = useTransitionEndListener(
    'workroute.default.transitionend'
  );
  const highlightRouteConfig = useWorkHighlightRouteTransition();
  const indexRouteConfig = useWorkIndexRouteTransition();
  // prevent onEnter running twice on Strict mode
  // animation is run as promise callback, needs to be manually validated
  const enterWorkHighlightInQueue = useRef<boolean>(false);

  const transitionConfig = {
    [ROUTE_PATH_PATTERNS.WORK_HIGHLIGHT]: {
      onEnter: () => {
        waitForElements([
          '[data-anim-target="work-detail"]',
          '[data-anim-target="tech-block"]'
        ]).then(() => {
          if (!enterWorkHighlightInQueue.current) {
            enterWorkHighlightInQueue.current = true;
            highlightRouteConfig.onEnter();
          }
        });
      },
      onEntered: () => {
        enterWorkHighlightInQueue.current = false;
        highlightRouteConfig.onEntered();
      },
      onExit: highlightRouteConfig.onExit,
      onExited: highlightRouteConfig.onExited,
      addEndListener: highlightRouteConfig.addEndListener
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
    if (!!matchPath(ROUTE_PATH_PATTERNS.WORK_HIGHLIGHT, location.pathname)) {
      return {
        key: ROUTE_PATH_PATTERNS.WORK_HIGHLIGHT,
        config: transitionConfig[ROUTE_PATH_PATTERNS.WORK_HIGHLIGHT]
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
