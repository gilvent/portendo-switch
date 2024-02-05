import gsap from 'gsap';
import { matchPath } from 'react-router-dom';
import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import useHomePageAnimations from '@/hooks/animations/useHomePageAnimations.hook';
import useDisableController from '../useDisableController.hook';

function useHomeRouteAnimation(previousPath: string) {
  const { startHandheldMode, handheldToDocked, dockToHandheld } =
    useControllerAnimations();
  const { homeEnter } = useHomePageAnimations();
  const { enableClick, disableClick } = useDisableController();

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
    return anim;
  }

  function enterHomePage() {
    return gsap.timeline().add(homeEnter()).add(startHandheldMode());
  }

  function onEnter(): gsap.core.Timeline {
    console.log('enter home from', previousPath);
    const enter =
      enterAnimationsByPrevPath
        .find(i => matchPath(i.path, previousPath))
        ?.fn() ?? gsap.timeline();

    enter
      .eventCallback('onStart', () => {
        disableClick();
      })
      .eventCallback('onComplete', () => {
        enableClick();
      })
      .play(0);

    return enter;
  }

  function exitToWorkPage() {
    return handheldToDocked().duration(5);
  }

  function onExit(): gsap.core.Timeline {
    const exit =
      exitAnimationsByTargetPath
        .find(i => matchPath(i.path, window.location.pathname))
        ?.fn() ?? gsap.timeline();

    exit
      .eventCallback('onStart', () => {
        disableClick();
      })
      .eventCallback('onComplete', () => {
        enableClick();
      })
      .play(0);

    return exit;
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
