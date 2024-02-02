import gsap from 'gsap';

export function backgroundSlide(bgEl: any) {
  return gsap.timeline().to(bgEl, {
    y: '100%',
    duration: 0.75
  });
}

export function multipleBoxesExpand(
  boxes: NodeListOf<Element>
): gsap.core.Timeline {
  const tl = gsap.timeline();
  boxes.forEach(el => {
    const q = gsap.utils.selector(el);
    tl.add(
      gsap
        .timeline()
        .to(q('[data-anim-target="overlay"]'), { scale: 2 }, 0)
        .to(q('[data-anim-target="text"]'), { opacity: 1 }, 0)
        .to(el, { scale: 1.1, opacity: 1, duration: 0.3 })
        .to(el, { scale: 1, duration: 0.3 }, '>0.1'),
      Math.random() * 0.5
    );
  });

  return tl;
}

export function boxesLogoUnfold(
  boxes: NodeListOf<Element>
): gsap.core.Timeline {
  const tl = gsap.timeline();
  boxes.forEach(el => {
    const q = gsap.utils.selector(el);
    tl.add(
      gsap
        .timeline()
        .to(q('[data-anim-target="text"]'), { opacity: 0, duration: 0.5 }, 0)
        .to(q('[data-anim-target="overlay"]'), {
          scale: 0,
          duration: 0.7
        }),
      Math.random() * 0.5
    );
  });

  return tl;
}

export function titleFadeIn(el: any): gsap.core.Timeline {
  return gsap.timeline().fromTo(
    el,
    {
      autoAlpha: 0,
      y: -50,
      duration: 1.25
    },
    {
      autoAlpha: 1,
      y: 0,
      ease: 'back'
    }
  );
}

export function multipleBoxesShrink(
  boxes: NodeListOf<Element>
): gsap.core.Timeline {
  const tl = gsap.timeline();
  boxes.forEach(el => {
    tl.add(
      gsap.timeline().to(el, { scale: 0.3, opacity: 0, duration: 0.3 }),
      Math.random() * 0.5
    );
  });

  return tl;
}

export function techBlockEnter(): gsap.core.Timeline {
  const techBlock = gsap.utils.selector('[data-anim-target="tech-block"]');
  const boxes = document.querySelectorAll('[data-anim-target="box"]');
  const heading = techBlock('[data-anim-target="heading"]');
  const bg = techBlock('[data-anim-target="bg"]');

  return gsap
    .timeline()
    .add(backgroundSlide(bg))
    .add(titleFadeIn(heading))
    .add(multipleBoxesExpand(boxes), '>-=0.1')
    .add(boxesLogoUnfold(boxes));
}

export function techBlockExit(): gsap.core.Timeline {
  const techBlockSelector = gsap.utils.selector(
    '[data-anim-target="tech-block"]'
  );
  const heading = techBlockSelector('[data-anim-target="heading"');
  const bg = techBlockSelector('[data-anim-target="bg"]');
  const boxes = document.querySelectorAll('[data-anim-target="box"]');

  return gsap
    .timeline()
    .add(multipleBoxesShrink(boxes))
    .to(
      heading,
      {
        autoAlpha: 0,
        duration: 0.3
      },
      '<+0.2'
    )
    .to(bg, {
      y: '-=100%',
      duration: 0.75
    });
}
