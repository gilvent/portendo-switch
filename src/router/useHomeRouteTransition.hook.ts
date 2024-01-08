import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { matchPath } from 'react-router-dom';

function useHomeRouteAnimation(previousPath: string) {
  const {
    enterHandheldMode,
    toDetachedModeTransition,
    toHandheldModeTransition
  } = useControllerAnimations();

  const enterAnimations = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: enterHandheldMode },
    { path: ROUTE_PATH_PATTERNS.WORK, fn: enterFromWorkPage }
  ];

  function enterFromWorkPage() {
    toHandheldModeTransition.current?.play(0);
  }

  function onEnter() {
    console.log('enter home', previousPath);
    enterAnimations.find(i => matchPath(i.path, previousPath))?.fn();
  }

  function onExit() {
    console.log('exit home');
    toDetachedModeTransition.current?.play(0);
  }

  return {
    onEnter,
    onExit,
    timeout: 5000,
    appear: true,
    unmountOnExit: true
  };
}

export default useHomeRouteAnimation;
