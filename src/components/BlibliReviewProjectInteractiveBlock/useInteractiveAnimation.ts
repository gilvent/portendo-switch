import useMediaQuery from '@/hooks/useMediaQuery.hook';
import { MediaQueryScreen } from '@/utils/enums';
import gsap from 'gsap';
import { RefObject, useEffect, useRef } from 'react';

export default function useInteractiveAnimation({
  monitorRef,
  cameraRef,
  captureImgRef,
  flashlightRef
}: {
  monitorRef: RefObject<HTMLDivElement>;
  cameraRef: RefObject<HTMLDivElement>;
  captureImgRef: RefObject<HTMLImageElement>;
  flashlightRef: RefObject<HTMLDivElement>;
}) {
  const cameraHoveringAnimation = useRef<gsap.core.Timeline | null>(null);
  const swapToCamera = useRef<gsap.core.Timeline | null>(null);
  const swapToMonitor = useRef<gsap.core.Timeline | null>(null);
  const cameraWiggleAnimation = useRef<gsap.core.Timeline | null>(null);
  const cameraStateActive = useRef<boolean>(true);
  const isTablet = useMediaQuery(MediaQueryScreen.Tablet);

  useEffect(() => {
    swapToCamera.current = setupSwapToCameraAnimation();
    cameraHoveringAnimation.current = setupCameraHoveringAnimation();
    swapToMonitor.current = setupSwapToMonitorAnimation();
    cameraWiggleAnimation.current = setupCameraWiggleAnimation();
    return () => {
      swapToCamera.current?.kill();
      cameraHoveringAnimation.current?.kill();
      swapToMonitor.current?.kill();
      cameraWiggleAnimation.current?.kill();
    };
  }, []);

  function setupCameraHoveringAnimation(): gsap.core.Timeline {
    return gsap.timeline().to(captureImgRef.current, {
      x: '-50%',
      duration: 10,
      repeat: -1,
      yoyo: true
    });
  }

  function setupCameraWiggleAnimation(): gsap.core.Timeline {
    return gsap
      .timeline()
      .fromTo(
        cameraRef.current,
        { rotate: '0deg' },
        {
          rotate: 5,
          duration: 0.25
        }
      )
      .to(cameraRef.current, {
        rotate: -5,
        duration: 0.25
      })
      .to(cameraRef.current, {
        rotate: 5,
        duration: 0.25
      })
      .to(cameraRef.current, {
        rotate: 0,
        duration: 0.25
      });
  }

  function setupSwapDeviceAnimation(): gsap.core.Timeline {
    return gsap
      .timeline()
      .fromTo(
        cameraRef.current,
        {
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'power1.out'
        },
        {
          scale: 0.4,
          x: isTablet ? '75%' : '50%',
          y: 50
        }
      )
      .fromTo(
        monitorRef.current,
        {
          x: '-50%',
          opacity: 0,
          duration: 0.5
        },
        {
          x: 0,
          opacity: 1
        }
      );
  }

  function setupFlashlightAnimation(): gsap.core.Timeline {
    return gsap
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

  function setupSwapToMonitorAnimation(): gsap.core.Timeline {
    const swapToMonitor = setupSwapDeviceAnimation();
    const flash = setupFlashlightAnimation();
    return gsap
      .timeline({ paused: true })
      .eventCallback('onStart', () => {
        cameraHoveringAnimation.current?.pause();
      })
      .add(flash)
      .add(swapToMonitor)
      .eventCallback('onComplete', () => {
        cameraStateActive.current = false;
        cameraWiggleAnimation.current?.play().repeat(-1).repeatDelay(4);
      });
  }

  function setupSwapToCameraAnimation(): gsap.core.Timeline {
    const swapToCamera = setupSwapDeviceAnimation().reversed(true);
    return gsap
      .timeline({ paused: true })
      .eventCallback('onStart', () => {
        cameraWiggleAnimation.current?.pause(0);
      })
      .add(swapToCamera)
      .eventCallback('onComplete', () => {
        cameraStateActive.current = true;
        cameraHoveringAnimation.current?.play();
      });
  }

  return {
    swapToCamera,
    swapToMonitor,
    cameraStateActive
  };
}
