import gsap from 'gsap';
import { useRef } from 'react';
import { slideFadeIn } from '@/utils/gsap/animation-helpers/fades';
import useBlockEnterAnimation from '@/hooks/animations/useBlockEnterAnimation.hook';
import styles from './BlibliPDPRevampStoryBlock.module.scss';

function BlibliPDPRevampStoryBlock() {
  const blockRef = useRef<HTMLDivElement>(null);

  useBlockEnterAnimation({
    ref: blockRef,
    from: 'right',
    createContentEnter() {
      return gsap.timeline().add(slideFadeIn('h2 > div, p, ul'));
    }
  });

  return (
    <article
      ref={blockRef}
      className={`story-block ${styles['story-block-pdp']}`}
    >
      <h2>
        <div className="invisible">Worked on:</div>
        <div className="invisible">Product Detail</div>
      </h2>

      <p className="overview invisible">
        I spent most of my time in Blibli working on Product Detail Page.
        Product Detail is the entry point of customer's journey. Thus, I get to
        develop features of various product teams: <strong>promotions</strong>,{' '}
        <strong>recommendations</strong>, and many more!
      </p>

      <ul className={`key-points invisible`}>
        <strong>A project spotlight...</strong>
        <li>
          Product Detail Revamp. A full page redesign project which was part of
          major theme update across Blibli. Introducing new user experiences
          with secondary pages for mobile screen and simpler add to cart flow.
        </li>
      </ul>

      <ul className={`key-points invisible`}>
        <strong>Lessons learnt while working on Product Detail...</strong>
        <li>
          Software development principles. One that stick to mind is{' '}
          <strong>
            Incremental release &gt; <i>Big bang</i> release
          </strong>
        </li>
        <li>
          Explore CSS techniques to building cool UI components: layouts, css
          animations, and more
        </li>
        <li>
          Get work on more JS and browser APIs: Lazy load techniques, datalayer,
          service worker, intersection observer, etc...
        </li>
        <li>
          High volume of traffic puts continuous attention to this page's
          performance, pushing me to learn many web optimization techniques
        </li>
      </ul>
    </article>
  );
}

export default BlibliPDPRevampStoryBlock;
