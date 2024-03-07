import gsap from 'gsap';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { matchPath } from 'react-router-dom';
import { disableController, enableController } from '@/utils/document';
import {
  dockToScreenMode,
  screenModeToDock,
  startScreenMode
} from '@/utils/gsap/animation-helpers/controller-button';
import devLog from '@/utils/dev-logger';

function useWorkRouteTransition(previousPath: string) {
  const enterAnimations = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: enterFromHomePage },
    { path: ROUTE_PATH_PATTERNS.WORK, fn: enterDirectly }
  ];

  const exitAnimationsByTargetPath = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: exitToHomePage }
  ];

  function enterFromHomePage(): gsap.core.Timeline {
    // TODO cache the timeline
    return gsap.timeline({ paused: true }).add(dockToScreenMode());
  }

  function enterDirectly(): gsap.core.Timeline {
    return gsap.timeline({ paused: true }).add(startScreenMode());
  }

  function exitToHomePage(): gsap.core.Timeline {
    devLog('[work route transition] exiting to home page');
    return gsap.timeline({ paused: true }).add(screenModeToDock()).duration(2);
  }

  function onEnter(): gsap.core.Timeline {
    devLog('[work route transition] enter work', previousPath);
    const enter =
      enterAnimations.find(i => matchPath(i.path, previousPath))?.fn() ??
      gsap.timeline({ paused: true });

    enter
      .eventCallback('onStart', () => {
        disableController();
      })
      .eventCallback('onComplete', () => {
        enableController();
      });
    return enter;
  }

  function onExit(): gsap.core.Timeline {
    devLog('[work route transition] exit work');
    const exit =
      exitAnimationsByTargetPath
        .find(i => matchPath(i.path, window.location.pathname))
        ?.fn() ?? gsap.timeline({ paused: true });

    exit
      .eventCallback('onStart', () => {
        disableController();
      })
      .eventCallback('onComplete', () => {
        enableController();
      });
    return exit;
  }

  return {
    onEnter,
    onExit,
    appear: true,
    timeout: 2000,
    unmountOnExit: true
  };
}

export default useWorkRouteTransition;
