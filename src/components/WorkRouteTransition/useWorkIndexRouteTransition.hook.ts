import gsap from 'gsap';
import useTransitionEndListener from '@/hooks/useTransitionEndListener.hook';
import useActiveWorkBanner from '@/components/WorkListBlock/useActiveWorkBanner.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { bounceEnter } from '@/utils/gsap/animations/work-list';
import useRouteTransitionHelper from './useRouteTransitionHelper.hook';

function useWorkIndexRouteTransition() {
  const { isFromPath } = useRouteTransitionHelper();
  const { done, addEndListener, doneWithoutTransition } =
    useTransitionEndListener('workroute.transitionend');
  const { activeBanner } = useActiveWorkBanner();

  function onEntering() {}

  function onEnter() {
    console.log('[work index route] enter');

    if (isFromPath(ROUTE_PATH_PATTERNS.WORK)) {
      const enterAnim = gsap
        .timeline({ paused: true })
        .eventCallback('onComplete', () => {
          done();
        });
      enterAnim.add(bounceEnter(activeBanner.selector).paused(false));
      enterAnim.play(0);
      return;
    } else {
      doneWithoutTransition();
    }
  }

  function onEntered() {
    console.log('[work index route] entered work list');
  }

  function onExit() {
    console.log('[work index route] exit work list');
    doneWithoutTransition();
  }

  function onExited() {
    console.log('[work index route] exited work list');
  }
  return {
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    addEndListener
  };
}

export default useWorkIndexRouteTransition;
