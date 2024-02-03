import gsap from 'gsap';
import { useRef } from 'react';
import useActiveWorkBanner from '@/components/WorkListBlock/useActiveWorkBanner.hook';
import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import useTechBlockAnimations from '@/components/WorkDetail/useTechBlockAnimations.hook';
import useTransitionEndListener from '@/hooks/useTransitionEndListener.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import {
  bounceEnter,
  workSummaryFadeIn
} from '@/utils/gsap/animations/work-list';
import useRouteTransitionHelper from './useRouteTransitionHelper.hook';

function useWorkDetailRouteTransition() {
  const showWorkSummaryAnimation = useRef<gsap.core.Timeline | null>(null);
  const { isFromPath, isToPath } = useRouteTransitionHelper();
  const { activeBanner } = useActiveWorkBanner();
  const { startSingleConMode, screenModeToSingleCon, singleConToScreenMode } =
    useControllerAnimations();
  const { setupEnterAnimation, setupExitAnimation } = useTechBlockAnimations();
  const { done, addEndListener } = useTransitionEndListener(
    'workroute.transitionend'
  );

  function showWorkSummary(): gsap.core.Timeline {
    showWorkSummaryAnimation.current = workSummaryFadeIn({
      background: activeBanner.background,
      targetElSelector: activeBanner.selector
    });

    return showWorkSummaryAnimation.current;
  }

  function hideWorkSummary(): gsap.core.Timeline {
    return showWorkSummaryAnimation.current?.reverse() ?? gsap.timeline();
  }

  function onEnter() {
    let enterTransition = gsap
      .timeline({ paused: true })
      .eventCallback('onComplete', () => {
        done();
      });

    if (isFromPath(ROUTE_PATH_PATTERNS.WORK_DETAIL)) {
      console.log('[work detail route] direct enter');
      enterTransition
        .call(() => {
          bounceEnter(activeBanner.selector).seek('work-list-done');
        })
        .add(startSingleConMode())
        .add(showWorkSummary())
        .add(setupEnterAnimation(), '>-=1');
    } else if (isFromPath(ROUTE_PATH_PATTERNS.WORK)) {
      console.log('[work detail route] enter from work');
      enterTransition
        .add(screenModeToSingleCon())
        .add(showWorkSummary())
        .add(setupEnterAnimation(), '>-=1');
    }

    enterTransition.play(0);
  }

  function onEntered() {
    console.log('[work route] entered work detail');
  }

  function onExit() {
    console.log('[work detail] exit');
    let exitTransition = gsap
      .timeline({ paused: true })
      .eventCallback('onComplete', () => {
        done();
      });

    if (isToPath(ROUTE_PATH_PATTERNS.WORK)) {
      exitTransition
        .eventCallback('onStart', () => {
          console.log('starting exit animation');
          window.scrollTo({
            top: 0
          });
        })
        .add(singleConToScreenMode())
        .add(setupExitAnimation())
        .add(hideWorkSummary());
    }

    exitTransition.play(0);
  }

  function onExited() {
    console.log('[work route] exited work detail');
  }

  return {
    onEnter,
    onEntered,
    onExit,
    onExited,
    addEndListener: (done: any) => {
      console.log('[work detail route] adding end listener');
      addEndListener(done);
    }
  };
}

export default useWorkDetailRouteTransition;
