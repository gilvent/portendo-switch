import gsap from 'gsap';

export function slideFadeIn(
  els: Element[],
  slideUp: boolean = true
): gsap.core.Timeline {
  const FLOATING_DISTANCE = 50;
  return gsap.timeline().fromTo(
    els,
    {
      autoAlpha: 0,
      y: slideUp ? FLOATING_DISTANCE : -FLOATING_DISTANCE,
      duration: 1.25
    },
    {
      autoAlpha: 1,
      y: 0,
      ease: 'back',
      stagger: 0.15,
      immediateRender: false
    }
  );
}

export function fadeOut(els: Element[]) {
  return gsap.timeline().to(els, {
    autoAlpha: 0
  });
}
