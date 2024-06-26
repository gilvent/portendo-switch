import gsap from 'gsap';
import { slideFadeIn } from '@/utils/gsap/animation-helpers/fades';
import { floating } from '@/utils/gsap/animation-helpers/idles';

function darkCloudsEnter(): gsap.core.Timeline {
  const cloudsContainer = document.querySelector(
    '[data-anim-target="clouds-dark"]'
  );
  const cloudSelector = gsap.utils.selector(cloudsContainer);
  const clouds = cloudSelector('[data-anim-target="cloud"]');
  const animation = gsap
    .timeline()
    .to(clouds, {
      translateY: 0,
      stagger: 0.3
    })
    .to(
      cloudsContainer,
      {
        translateY: 0,
        duration: 0.5
      },
      0.3
    )
    .eventCallback('onComplete', () => {
      floating(clouds, { maxTranslate: 15, delay: Math.random() * 1 });
    });
  return animation;
}

function lightCloudsEnter(): gsap.core.Timeline {
  const cloudsContainer = document.querySelector(
    '[data-anim-target="clouds-light"]'
  );
  const cloudSelector = gsap.utils.selector(cloudsContainer);
  const clouds = cloudSelector('[data-anim-target="cloud"]');

  const animation = gsap
    .timeline()
    .to(clouds, {
      translateY: 0,
      stagger: 0.3
    })
    .to(
      cloudsContainer,
      {
        translateY: 0,
        duration: 0.3
      },
      0.3
    )
    .eventCallback('onComplete', () => {
      floating(clouds, {
        maxTranslate: 20,
        delay: Math.random() * 1
      });
    });
  return animation;
}

function foregroundTextsEnter() {
  const homeSelector = gsap.utils.selector('[data-anim-target="home-page"]');
  const els = homeSelector('[data-anim-target="foreground"] > :not(a)');
  return slideFadeIn(els);
}

function contactCardsEnter() {
  const homeSelector = gsap.utils.selector('[data-anim-target="home-page"]');
  const els = homeSelector('[data-anim-target="foreground"] > a');
  return gsap.timeline().fromTo(
    els,
    {
      scale: 1.2,
      autoAlpha: 0
    },
    {
      scale: 1,
      autoAlpha: 1,
      stagger: 0.12
    }
  );
}

export function homeEnter(): gsap.core.Timeline {
  return gsap
    .timeline()
    .add(darkCloudsEnter())
    .add(lightCloudsEnter(), '<0.2')
    .add(foregroundTextsEnter(), '<')
    .add(contactCardsEnter(), '<0.5');
}
