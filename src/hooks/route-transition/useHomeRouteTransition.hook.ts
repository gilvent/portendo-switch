import gsap from 'gsap';
import { matchPath } from 'react-router-dom';
import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import useHomePageAnimations from '@/hooks/animations/useHomePageAnimations.hook';
import { RefObject } from 'react';

function useHomeRouteAnimation(previousPath: string) {
  const { startHandheldMode, handheldToDocked, dockToHandheld } =
    useControllerAnimations();
  const { homeEnter } = useHomePageAnimations();

  const enterAnimationsByPrevPath = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: enterHomePage },
    { path: ROUTE_PATH_PATTERNS.WORK, fn: enterFromWorkPage }
  ];

  const exitAnimationsByTargetPath = [
    { path: ROUTE_PATH_PATTERNS.WORK, fn: exitToWorkPage }
  ];

  function enterFromWorkPage() {
    const anim = dockToHandheld().paused(false);
    anim.add(homeEnter(), 'detached-from-dock');
    return anim.play(0);
  }

  function enterHomePage() {
    return gsap.timeline().add(homeEnter()).add(startHandheldMode()).play(0);
  }

  function onEnter(): gsap.core.Timeline {
    console.log('enter home from', previousPath);
    return (
      enterAnimationsByPrevPath
        .find(i => matchPath(i.path, previousPath))
        ?.fn() ?? gsap.timeline()
    );
  }

  function exitToWorkPage() {
    return handheldToDocked().duration(5).play(0);
  }

  function onExit(): gsap.core.Timeline {
    return (
      exitAnimationsByTargetPath
        .find(i => matchPath(i.path, window.location.pathname))
        ?.fn() ?? gsap.timeline()
    );
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
