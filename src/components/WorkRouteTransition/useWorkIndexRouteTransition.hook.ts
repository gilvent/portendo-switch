import gsap from 'gsap';
import useTransitionEndListener from '@/hooks/useTransitionEndListener.hook';
import useActiveWorkBanner from '@/components/WorkListBlock/useActiveWorkBanner.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { bounceEnter } from '@/utils/gsap/animation-helpers/work-list-block';
import useRouteTransitionHelper from './useRouteTransitionHelper.hook';
import devLog from '@/utils/dev-logger';

function useWorkIndexRouteTransition() {
  const { isFromPath } = useRouteTransitionHelper();
  const { done, addEndListener, doneWithoutTransition } =
    useTransitionEndListener('workroute.transitionend');
  const { activeBanner } = useActiveWorkBanner();

  function onEnter() {
    devLog('[work index route] enter');

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
    devLog('[work index route] entered work list');
  }

  function onExit() {
    devLog('[work index route] exit work list');
    doneWithoutTransition();
  }

  function onExited() {
    devLog('[work index route] exited work list');
  }
  return {
    onEnter,
    onEntered,
    onExit,
    onExited,
    addEndListener
  };
}

export default useWorkIndexRouteTransition;
