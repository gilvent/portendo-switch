import gsap from 'gsap';
import { matchPath } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { disableController, enableController } from '@/utils/document';
import { homeEnter } from '@/utils/gsap/animation-helpers/home-page';
import {
  dockToHandheld,
  handheldToDocked,
  startHandheldMode
} from '@/utils/gsap/animation-helpers/controller-button';
import devLog from '@/utils/dev-logger';

function useHomeRouteAnimation(previousPath: string) {
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
    return gsap
      .timeline({ paused: true })
      .add(homeEnter())
      .add(startHandheldMode());
  }

  function onEnter(): gsap.core.Timeline {
    devLog('[home route transition] enter home from', previousPath);
    const enter =
      enterAnimationsByPrevPath
        .find(i => matchPath(i.path, previousPath))
        ?.fn() ?? gsap.timeline();

    enter
      .eventCallback('onStart', () => {
        disableController();
      })
      .eventCallback('onComplete', () => {
        enableController();
      });

    return enter;
  }

  function exitToWorkPage() {
    return gsap.timeline({ paused: true }).add(handheldToDocked()).duration(5);
  }

  function onExit(): gsap.core.Timeline {
    const exit =
      exitAnimationsByTargetPath
        .find(i => matchPath(i.path, window.location.pathname))
        ?.fn() ?? gsap.timeline();

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
    timeout: 5000,
    appear: true,
    unmountOnExit: true
  };
}

export default useHomeRouteAnimation;
