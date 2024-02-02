import gsap from 'gsap';
import useTransitionEndListener from '@/hooks/useTransitionEndListener.hook';
import useActiveWorkBanner from '@/components/WorkListBlock/useActiveWorkBanner.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { bounceEnter } from '@/utils/gsap/animations/work-list';
import useRouteTransitionHelper from './useRouteTransitionHelper.hook';

function useWorkIndexRouteTransition() {
  const { isFromPath } = useRouteTransitionHelper();
  const { done, addEndListener } = useTransitionEndListener(
    'workroute.index.transitionend'
  );
  const { activeBanner } = useActiveWorkBanner();

  function onEntering() {}

  function onEnter() {
    console.log('[work index route] enter');
    const enterAnim = gsap
      .timeline({ paused: true })
      .eventCallback('onComplete', () => {
        done();
      });

    if (isFromPath(ROUTE_PATH_PATTERNS.WORK)) {
      enterAnim.add(bounceEnter(activeBanner.selector).paused(false));
      enterAnim.play(0);
      return;
    } else {
      setTimeout(() => {
        done();
      }, 50);
    }
  }

  function onEntered() {
    console.log('[work index route] entered work list');
  }

  function onExit() {
    console.log('[work index route] exit work list');
    gsap.timeline().eventCallback('onComplete', () => {
      done();
    });
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
    addEndListener: (done: any) => {
      console.log('adding end listener for index route');
      addEndListener(done);
    }
  };
}

export default useWorkIndexRouteTransition;
