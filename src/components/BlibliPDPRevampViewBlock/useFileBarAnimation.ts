import gsap from 'gsap';
import { useEffect, useRef } from 'react';

export enum AnimationLabels {}

export default function useFileBarAnimation({}: {}) {
  const animation = useRef<gsap.core.Timeline>(gsap.timeline());

  useEffect(() => {
    return () => {
      animation.current.kill();
    };
  });

  function collapse(el: HTMLElement) {
    return gsap.to(el, {
      opacity: 0,
      height: 0,
      duration: 0.5
    });
  }

  function slideLeft(el: HTMLElement, slideDistance: Number) {
    return gsap.to(el, {
      x: -slideDistance,
      duration: 0.5
    });
  }

  function setToActive(el: HTMLElement) {
    return gsap.to(el, {
      backgroundColor: '#1f1f1f',
      color: '#ffffffea',
      borderBottom: 'none'
    });
  }

  function setupAnimation({
    rootEl,
    filePanelClass
  }: {
    rootEl: HTMLElement;
    filePanelClass: string;
  }) {
    const query = gsap.utils.selector(rootEl);
    const panel = query('.' + filePanelClass);
    const { width: w1 } = panel[0].getBoundingClientRect();
    const { width: w2 } = panel[1].getBoundingClientRect();

    animation.current = gsap
      .timeline({ paused: true })
      .addLabel('start')
      .from(panel[0], {
        backgroundColor: '#1f1f1f',
        color: '#ffffffea',
        borderBottom: 'none'
      })
      .add(collapse(panel[0]))
      .add(slideLeft(panel[1], w1))
      .add(slideLeft(panel[2], w1), '<')
      .add(setToActive(panel[1]), '<')
      .addLabel('first-bar-collapse')
      .addPause('first-bar-collapse')
      .add(collapse(panel[1]))
      .add(slideLeft(panel[2], w1 + w2), '>')
      .add(setToActive(panel[2]), '<')
      .addLabel('second-bar-collapse')
      .addPause('second-bar-collapse')
      .add(collapse(rootEl))
      .addLabel('last-bar-collapse')
      .addPause('last-bar-collapse');
  }

  return {
    setupAnimation,
    animationRef: animation
  };
}
