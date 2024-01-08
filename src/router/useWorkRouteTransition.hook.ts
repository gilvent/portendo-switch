import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { matchPath } from 'react-router-dom';

function useWorkRouteTransition(previousPath: string) {
  const { enterDetachedMode, toDetachedModeTransition } =
    useControllerAnimations();

  const enterAnimations = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: enterFromHomePage },
    { path: ROUTE_PATH_PATTERNS.WORK, fn: enterDetachedMode }
  ];

  function enterFromHomePage() {
    console.log('enter work', previousPath);
  }

  function onEnter() {
    enterAnimations.find(i => matchPath(i.path, previousPath))?.fn();
  }

  function onExit() {
    console.log('exit work');
  }

  return {
    onEnter,
    onExit,
    appear: true,
    timeout: 1000,
    unmountOnExit: true
  };
}

export default useWorkRouteTransition;
