import gsap from 'gsap';
import { matchPath } from 'react-router-dom';
import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import useHomePageAnimations from '@/hooks/animations/useHomePageAnimations.hook';

function useHomeRouteAnimation(previousPath: string) {
  const {
    enterHandheldMode,
    toDetachedModeTransition,
    toHandheldModeTransition
  } = useControllerAnimations();
  const { homeEnter } = useHomePageAnimations();

  const enterAnimations = [
    { path: ROUTE_PATH_PATTERNS.HOME, fn: enterHomePage },
    { path: ROUTE_PATH_PATTERNS.WORK, fn: enterFromWorkPage }
  ];

  function enterFromWorkPage() {
    const anim = gsap.timeline();
    if (toHandheldModeTransition.current) {
      anim.add(toHandheldModeTransition.current.paused(false));
    }
    anim.add(homeEnter());
    anim.play(0);
  }

  function enterHomePage() {
    gsap.timeline().add(homeEnter()).add(enterHandheldMode()).play(0);
  }

  function onEnter() {
    console.log('enter home', previousPath);
    enterAnimations.find(i => matchPath(i.path, previousPath))?.fn();
  }

  function onExit() {
    console.log('exit home');
    toDetachedModeTransition.current?.duration(5).play(0);
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
