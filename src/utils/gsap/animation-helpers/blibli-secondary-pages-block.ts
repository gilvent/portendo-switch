import gsap from 'gsap';

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

export function screenshotsAppear(containerEl: HTMLDivElement) {
  const q = gsap.utils.selector(containerEl);
  return gsap.timeline().add(enter(q('img')));
}
