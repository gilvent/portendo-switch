import BlibliWorkPageContext from '@/context/BlibliWorkPageContext';
import usePreviousState from '@/hooks/usePreviousState.hook';
import gsap, { TweenLite } from 'gsap';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import styles from './BlibliProductDetailArticle.module.scss';

function BlibliProductDetailArticle() {
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
    <article className={styles['sticky-article']}>
      <section className={styles.main}>
        <h2>
          Project Highlight: <br /> Product Detail Revamp
        </h2>
        <p>
          This is a full page redesign that is part of major theme update across
          Blibli.
        </p>
      </section>

      <section className={styles.details}>
        <article ref={detailArticleRef[0]}>
          <h3>Code fully rewritten.</h3>
          <p>
            We took the opportunity to rewrite the codebase from scratch.
            Creating reusable UI components for mobile and desktop.
          </p>
        </article>
        <article ref={detailArticleRef[1]}>
          <h3>UI turned brand new.</h3>
          <p>
            Almost all features in product detail are redesigned. Check out one
            of the examples right there.
          </p>
        </article>
        <article ref={detailArticleRef[2]}>
          <h3>Secondary pages for mobile users.</h3>
          <p>
            With limited mobile screen real estate and so much info to tell,
            secondary pages are added for better UX.
          </p>
        </article>
      </section>
    </article>
  );
}

export default BlibliProductDetailArticle;
