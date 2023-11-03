import gsap from 'gsap';
import { RefObject, useRef } from 'react';

export default function useCameraInteraction({
  captureImgRef,
  flashlightRef
}: {
  captureImgRef: RefObject<HTMLImageElement>;
  flashlightRef: RefObject<HTMLDivElement>;
}) {
  const movingImgAnimation = useRef<gsap.core.Timeline>(gsap.timeline());

  function setupMovingImgAnimation(): gsap.core.Timeline {
    movingImgAnimation.current = gsap.timeline().to(captureImgRef.current, {
      x: '-50%',
      duration: 10,
      repeat: -1,
      yoyo: true
    });

    return movingImgAnimation.current;
  }

  function captureImage() {
    movingImgAnimation.current.pause();
    gsap
      .timeline()
      .to(flashlightRef.current, {
        zIndex: 2,
        opacity: 1,
        duration: 0.3
      })
      .to(flashlightRef.current, {
        opacity: 0,
        duration: 0.3,
        zIndex: 1
      });
  }

  return { setupMovingImgAnimation, captureImage };
}
