import gsap from 'gsap';

export default function playOnNextTick(
  timeline: gsap.core.Timeline
): gsap.core.Timeline {
  timeline.pause();
  gsap.ticker.add(() => {
    timeline.play(0);
  }, true);
  return timeline;
}
