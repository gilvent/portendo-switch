import useScrollTrigger from '@/hooks/useScrollTrigger.hook';
import { useGSAP } from '@gsap/react';
import { RefObject } from 'react';
import gsap from 'gsap';

function useBlockEnterAnimation({
  ref,
  from,
  createContentEnter
}: {
  ref: RefObject<any>;
  from: 'left' | 'right';
  createContentEnter?: () => gsap.core.Timeline;
}) {
  const { create: createScrollTrigger } = useScrollTrigger();
  const initialTranslateXMap = {
    left: '-80%',
    right: '80%'
  };

  useGSAP(
    (context, contextSafe) => {
      gsap.set(ref.current, {
        translateX: initialTranslateXMap[from],
        autoAlpha: 0
      });

      const onEnter = contextSafe?.(() => {
        const tl = gsap.timeline({ paused: true }).to(ref.current, {
          translateX: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.75
        });

        if (createContentEnter) {
          tl.add(createContentEnter());
        }

        tl.play(0);
      });

      createScrollTrigger({
        trigger: ref.current,
        start: 'top 70%',
        end: 'bottom top',
        once: true,
        onEnter
      });

      console.log('use gsap here', context.data.length, onEnter);
    },
    { scope: ref }
  );
}

export default useBlockEnterAnimation;
