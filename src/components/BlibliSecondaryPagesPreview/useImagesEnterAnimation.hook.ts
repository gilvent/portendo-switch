import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function useImagesEnterAnimation() {
  const animationRef = useRef<gsap.core.Timeline>(gsap.timeline());

  useEffect(() => {
    return () => {
      animationRef.current.kill();
    };
  });

  function enter(elements: any) {
    return gsap.fromTo(
      elements,
      {
        opacity: 0
      },
      {
        stagger: 0.15,
        opacity: 1,
        duration: 1
      }
    );
  }

  function setupAnimation(containerEl: HTMLDivElement) {
    const q = gsap.utils.selector(containerEl);
    animationRef.current = gsap
      .timeline({ paused: true })
      .addLabel('start')
      .add(enter(q('img')));
  }

  return { setupAnimation, animationRef };
}

export default useImagesEnterAnimation;
