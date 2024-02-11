import gsap from 'gsap';
import { useRef } from 'react';
import {
  techBlockEnter,
  techBlockExit
} from '@/utils/gsap/animations/tech-block';
import { useGSAP } from '@gsap/react';

function useTechBlockAnimations() {
  const isPlayingAnimation = useRef<boolean>(false);
  const { contextSafe } = useGSAP();

  function attachHoverAnimation(box: Node) {
    const q = gsap.utils.selector(box);
    const animation = gsap
      .timeline({
        paused: true
      })
      .fromTo(
        q('[data-anim-target="overlay"]'),
        {
          immediateRender: false,
          scale: 0,
          duration: 0.5
        },
        {
          scale: 2
        }
      )
      .to(
        q('[data-anim-target="text"]'),
        {
          opacity: 1,
          duration: 0.5
        },
        '<'
      );

    const onHover = contextSafe(() => {
      if (isPlayingAnimation.current) return;
      animation.play();
    });
    const onMouseLeave = contextSafe(() => {
      if (isPlayingAnimation.current) return;
      animation.reverse();
    });

    box.addEventListener('mouseover', onHover);

    box.addEventListener('mouseleave', onMouseLeave);
  }

  const setupEnterAnimation = () => {
    return gsap
      .timeline()
      .eventCallback('onStart', () => {
        isPlayingAnimation.current = true;
      })
      .add(techBlockEnter())
      .eventCallback('onComplete', () => {
        isPlayingAnimation.current = false;
        const boxes = document.querySelectorAll('[data-anim-target="box"]');
        boxes.forEach(box => {
          attachHoverAnimation(box);
        });
      });
  };

  function setupExitAnimation(): gsap.core.Timeline {
    return gsap
      .timeline()
      .eventCallback('onStart', () => {
        isPlayingAnimation.current = true;
      })
      .add(techBlockExit())
      .eventCallback('onComplete', () => {
        isPlayingAnimation.current = false;
      });
  }

  return {
    setupEnterAnimation,
    setupExitAnimation
  };
}

export default useTechBlockAnimations;
