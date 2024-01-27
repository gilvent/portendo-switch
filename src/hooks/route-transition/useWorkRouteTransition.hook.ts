import gsap from 'gsap';
import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { matchPath } from 'react-router-dom';

function useWorkRouteTransition(previousPath: string) {
  const { startScreenMode, dockToScreenMode, screenModeToDock } =
    useControllerAnimations();

  const enterAnimations = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: enterFromHomePage },
    { path: ROUTE_PATH_PATTERNS.WORK, fn: enterDirectly }
  ];

  const exitAnimationsByTargetPath = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: exitToHomePage }
  ];

  function enterFromHomePage(): gsap.core.Timeline {
    // TODO cache the timeline
    return dockToScreenMode().play(0);
  }

  function enterDirectly(): gsap.core.Timeline {
    return startScreenMode().play(0);
  }

  function exitToHomePage(): gsap.core.Timeline {
    console.log('exiting to home page');
    return screenModeToDock().duration(2).play(0);
  }

  function onEnter(): gsap.core.Timeline {
    console.log('enter work', previousPath);
    return (
      enterAnimations.find(i => matchPath(i.path, previousPath))?.fn() ??
      gsap.timeline()
    );
  }

  function onExit(): gsap.core.Timeline {
    console.log('exit work');
    return (
      exitAnimationsByTargetPath
        .find(i => matchPath(i.path, window.location.pathname))
        ?.fn() ?? gsap.timeline()
    );
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
