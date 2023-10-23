import BlibliWorkPageContext from '@/context/BlibliWorkPageContext';
import usePreviousState from '@/hooks/usePreviousState.hook';
import gsap, { TweenLite } from 'gsap';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import styles from './BlibliPDPRevampStoryBlock.module.scss';

function BlibliPDPRevampStoryBlock() {
  const detailArticleRef = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];
  const { activePDPArticleIndex } = useContext(BlibliWorkPageContext);
  const prevPDPArticleIndex = usePreviousState(activePDPArticleIndex);
  const articleTimeline = useRef<gsap.core.Timeline | null>(null);

  function articleLeave(query: gsap.utils.SelectorFunc): gsap.core.Timeline {
    return gsap
      .timeline()
      .fromTo(
        query('p'),
        {
          y: 0
        },
        {
          opacity: 0,
          y: '+=100%'
        },
        0
      )
      .fromTo(
        query('h3'),
        {
          y: 0
        },
        {
          opacity: 0,
          y: '+=100%'
        },
        '<0.1'
      );
  }

  function articleEnter(query: gsap.utils.SelectorFunc): gsap.core.Timeline {
    return gsap
      .timeline()
      .fromTo(
        query('h3'),
        {
          opacity: 0,
          y: '+=100%',
          immediateRender: false
        },
        {
          opacity: 1,
          y: 0
        },
        0
      )
      .fromTo(
        query('p'),
        {
          opacity: 0,
          y: '+=100%',
          immediateRender: false
        },
        {
          opacity: 1,
          y: 0
        },
        '<0.1'
      );
  }

  function getAnimation(
    query: gsap.utils.SelectorFunc,
    previousQuery: gsap.utils.SelectorFunc | null
  ) {
    const tl = gsap.timeline();

    if (previousQuery) {
      tl.add(articleLeave(previousQuery));
    }

    return tl.add(articleEnter(query));
  }

  useLayoutEffect(() => {
    const articleQuery = detailArticleRef.map(ref => gsap.utils.selector(ref));
    const firstArticle = getAnimation(articleQuery[0], null);
    const secondArticle = getAnimation(articleQuery[1], articleQuery[0]);
    const thirdArticle = getAnimation(articleQuery[2], articleQuery[1]);

    articleTimeline.current = gsap
      .timeline({
        defaults: {
          duration: 0.8,
          ease: 'ease.inOut'
        }
      })
      .add(firstArticle, 'first-article')
      .addPause('first-article')
      .add(secondArticle, 'second-article')
      .addPause('second-article')
      .add(thirdArticle, 'third-article')
      .addPause('third-article');

    return () => {
      firstArticle.kill();
      secondArticle.kill();
      thirdArticle.kill();
    };
  }, []);

  useEffect(() => {
    if (!articleTimeline.current) return;
    if (activePDPArticleIndex > prevPDPArticleIndex) {
      articleTimeline.current.play();
    } else if (activePDPArticleIndex < prevPDPArticleIndex) {
      articleTimeline.current.reverse();
    }
  }, [activePDPArticleIndex]);

  return (
    <article className="story-block">
      <p className="overview">
        This is a full page redesign project which is part of major theme update
        across Blibli. Besides theme revamp, this project also introduces user
        experience improvements such as secondary pages and sticky navigation
        for mobile web.
      </p>

      <ul className={`key-points text-lg`}>
        <strong>Key changes...</strong>
        <li>New and newer UI components</li>
        <li>Rewrite the codebase to accomodate new flow</li>
        <li>
          Performance improvement: New APIs that focuses on{' '}
          <strong>above the fold</strong>, lazy loaded many things!
        </li>
      </ul>

      <ul className={`key-points text-lg`}>
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
