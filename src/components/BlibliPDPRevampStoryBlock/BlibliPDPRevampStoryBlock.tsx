import useSlidingFade from '@/hooks/useSlidingFade.hook';
import styles from './BlibliPDPRevampStoryBlock.module.scss';
import { useRef } from 'react';

function BlibliPDPRevampStoryBlock() {
  const blockRef = useRef<HTMLDivElement>(null);
  const { applySlidingFade } = useSlidingFade({
    triggerRef: blockRef,
    stayVisible: true
  });
  return (
    <article ref={blockRef} className={`story-block ${styles['pdp-revamp']}`}>
      <h2>
        <div ref={applySlidingFade} className="invisible">
          Worked on:
        </div>
        <div ref={applySlidingFade} className="invisible">
          Product Detail Revamp
        </div>
      </h2>

      <p ref={applySlidingFade} className="overview invisible">
        This is a full page redesign project which is part of major theme update
        across Blibli. Besides theme revamp, this project also introduces user
        experience improvements such as secondary pages and sticky navigation
        for mobile web.
      </p>

      <ul ref={applySlidingFade} className={`key-points text-lg invisible`}>
        <strong>Key changes...</strong>
        <li>New and newer UI components</li>
        <li>Rewrite the codebase to accomodate new flow</li>
        <li>
          Performance improvement: New APIs that focuses on{' '}
          <strong>above the fold</strong>, lazy loaded many things!
        </li>
      </ul>

      <ul ref={applySlidingFade} className={`key-points text-lg invisible`}>
        <strong>Lessons I learnt while doing this project...</strong>
        <li>
          Software development principles. One that stick to mind is{' '}
          <strong>
            Incremental release &gt; <i>Big bang</i> release
          </strong>{' '}
          with feature flag
        </li>
        <li>
          Explore CSS techniques to building cool UI components: layouts,
          animation, expand / hide interaction and more
        </li>
        <li>
          Get work on more JS and browser APIs: Lazy load techniques, datalayer,
          service worker, intersection observer, etc...
        </li>
      </ul>
    </article>
  );
}

export default BlibliPDPRevampStoryBlock;
