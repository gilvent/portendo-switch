import gsap from 'gsap';
import { useRef } from 'react';
import useActiveWorkBanner from '@/components/WorkListBlock/useActiveWorkBanner.hook';
import useControllerAnimations from '@/components/ControllerButton/useControllerAnimations.hook';
import useTechBlockAnimations from '@/components/WorkHighlightPage/useTechBlockAnimations.hook';
import useTransitionEndListener from '@/hooks/useTransitionEndListener.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import {
  bounceEnter,
  workSummaryFadeIn
} from '@/utils/gsap/animations/work-list';
import useRouteTransitionHelper from './useRouteTransitionHelper.hook';
import useCustomEvent from '@/hooks/useCustomEvent.hook';
import {
  disableController,
  disableScrollLock,
  enableController,
  lockScroll
} from '@/utils/document';
import { useGSAP } from '@gsap/react';

function useWorkHighlightRouteTransition() {
  const showWorkSummaryAnimation = useRef<gsap.core.Timeline | null>(null);
  const { isFromPath, isToPath } = useRouteTransitionHelper();
  const { activeBanner } = useActiveWorkBanner();
  const { startSingleConMode, screenModeToSingleCon, singleConToScreenMode } =
    useControllerAnimations();
  const { setupEnterAnimation, setupExitAnimation } = useTechBlockAnimations();
  const { done, addEndListener, doneWithoutTransition } =
    useTransitionEndListener('workroute.transitionend');
  const { dispatchEvent: showWorkSummaryBg } = useCustomEvent(
    'worklistblock.showWorkSummaryBg'
  );
  const { dispatchEvent: hideWorkBannerBg } = useCustomEvent(
    'worklistblock.hideWorkSummaryBg'
  );
  const { contextSafe } = useGSAP();

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

  const onEnter = contextSafe(() => {
    let enterTransition = gsap
      .timeline({ paused: true })
      .eventCallback('onStart', () => {
        disableController();
      })
      .eventCallback('onComplete', () => {
        done();
      });

    if (isFromPath(ROUTE_PATH_PATTERNS.WORK_HIGHLIGHT)) {
      console.log('[work detail route] direct enter');
      enterTransition
        .call(() => {
          bounceEnter(activeBanner.selector).seek('work-list-done');
        })
        .add(showWorkSummary())
        .call(() => {
          showWorkSummaryBg();
        })
        .add(setupEnterAnimation(), '>-=1')
        .add(startSingleConMode(), '<+1')
        .play(0);
    } else if (isFromPath(ROUTE_PATH_PATTERNS.WORK)) {
      console.log('[work detail route] enter from work');
      enterTransition
        .add(screenModeToSingleCon())
        .add(showWorkSummary())
        .call(() => {
          showWorkSummaryBg();
        })
        .add(setupEnterAnimation(), '>-=1')
        .play(0);
    } else {
      doneWithoutTransition();
    }
  });

  function onEntered() {
    console.log('[work detail route] entered work detail');
    enableController();
  }

  const onExit = contextSafe(() => {
    console.log('[work detail route] exit');

    let exitTransition = gsap
      .timeline({ paused: true })
      .eventCallback('onComplete', () => {
        done();
      });

    if (isToPath(ROUTE_PATH_PATTERNS.WORK)) {
      exitTransition
        .eventCallback('onStart', () => {
          console.log('starting exit animation');
          disableController();
          lockScroll();
          window.scrollTo({
            top: 0
          });
          hideWorkBannerBg();
        })
        .add(singleConToScreenMode())
        .add(setupExitAnimation())
        .add(hideWorkSummary())
        .play(0);
    } else {
      doneWithoutTransition();
    }
  });

  function onExited() {
    console.log('[work route] exited work detail');
    enableController();
    disableScrollLock();
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

export default useWorkHighlightRouteTransition;
