import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { matchPath } from 'react-router-dom';

function useWorkRouteTransition(previousPath: string) {
  const { startScreenMode, dockToScreenMode, screenModeToDock } =
    useControllerAnimations();

  const enterAnimations = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: enterFromHomePage },
    { path: ROUTE_PATH_PATTERNS.WORK, fn: startScreenMode }
  ];

  const exitAnimationsByTargetPath = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: exitToHomePage }
  ];

  function enterFromHomePage() {
    // TODO cache the timeline
    dockToScreenMode().play(0);
  }

  function exitToHomePage() {
    console.log('exiting to home page');
    screenModeToDock().duration(3).play(0);
  }

  function onEnter() {
    console.log('enter work', previousPath);
    enterAnimations.find(i => matchPath(i.path, previousPath))?.fn();
  }

  function onExit() {
    console.log('exit work');
    exitAnimationsByTargetPath
      .find(i => matchPath(i.path, window.location.pathname))
      ?.fn();
  }

  return {
    onEnter,
    onExit,
    appear: true,
    timeout: 3000,
    unmountOnExit: true
  };
}

export default useWorkRouteTransition;
