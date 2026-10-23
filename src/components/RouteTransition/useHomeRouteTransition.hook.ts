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
import { createTransitionMeasure } from '@/utils/perf';

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
    const enterAnimation = enterAnimationsByPrevPath.find(i =>
      matchPath(i.path, previousPath)
    );
    const enter = enterAnimation?.fn() ?? gsap.timeline();
    const measure = createTransitionMeasure(
      `home enter from ${enterAnimation?.path}`
    );

    enter
      .eventCallback('onStart', () => {
        disableController();
        measure.start();
      })
      .eventCallback('onComplete', () => {
        enableController();
        measure.end();
      });

    return enter;
  }

  function exitToWorkPage() {
    return gsap.timeline({ paused: true }).add(handheldToDocked()).duration(5);
  }

  function onExit(): gsap.core.Timeline {
    const exitAnimation = exitAnimationsByTargetPath.find(i =>
      matchPath(i.path, window.location.pathname)
    );
    const exit = exitAnimation?.fn() ?? gsap.timeline();
    const measure = createTransitionMeasure(
      `home exit to ${exitAnimation?.path}`
    );

    exit
      .eventCallback('onStart', () => {
        disableController();
        measure.start();
      })
      .eventCallback('onComplete', () => {
        enableController();
        measure.end();
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
