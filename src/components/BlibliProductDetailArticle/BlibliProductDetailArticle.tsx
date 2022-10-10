import BlibliWorkPageContext from '@/context/BlibliWorkPageContext';
import gsap, { TweenLite } from 'gsap';
import { useContext, useLayoutEffect, useRef } from 'react';
import styles from './BlibliProductDetailArticle.module.scss';

function BlibliProductDetailArticle() {
  const detailArticleRef = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];
  const articleQuery = detailArticleRef.map(ref => gsap.utils.selector(ref));
  const { activePDPArticleIndex, prevPDPArticleIndex, setActivePDPArticle } =
    useContext(BlibliWorkPageContext);

  useLayoutEffect(() => {
    let nextArticle = articleQuery[activePDPArticleIndex];
    let prevArticle = articleQuery[prevPDPArticleIndex];
    let headingLeave: TweenLite | null = null;
    let paragraphLeave: TweenLite | null = null;
    let enterDelay: number = 0;

    if (activePDPArticleIndex !== prevPDPArticleIndex) {
      enterDelay = 1;
      headingLeave = gsap.fromTo(
        prevArticle('h4'),
        {
          opacity: 1,
          y: 0
        },
        {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out'
        }
      );
      paragraphLeave = gsap.fromTo(
        prevArticle('p'),
        {
          opacity: 1,
          y: 0
        },
        {
          opacity: 0,
          duration: 0.5,
          delay: 0.3,
          ease: 'power2.out'
        }
      );
    }

    let headingEnter = gsap.fromTo(
      nextArticle('h4'),
      {
        opacity: 0,
        y: '+=100%',
        immediateRender: false
      },
      {
        opacity: 1,
        duration: 1,
        y: 0,
        delay: enterDelay,
        ease: 'power2.out'
      }
    );

    let paragraphEnter = gsap.fromTo(
      nextArticle('p'),
      {
        opacity: 0,
        y: '+=100%',
        immediateRender: false
      },
      {
        opacity: 1,
        duration: 1,
        y: 0,
        delay: enterDelay + 0.3,
        ease: 'power2.out'
      }
    );

    return () => {
      paragraphEnter.kill();
      headingEnter.kill();
      headingLeave?.kill();
      paragraphLeave?.kill();
    };
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
          <h4>Code fully rewritten.</h4>
          <p>
            We took the opportunity to rewrite the codebase from scratch.
            Creating reusable UI components for mobile and desktop.
          </p>
        </article>
        <article ref={detailArticleRef[1]}>
          <h4>UI turned brand new.</h4>
          <p>
            Almost all features in product detail are redesigned. Check out one
            of the examples right there.
          </p>
        </article>
        <article ref={detailArticleRef[2]}>
          <h4>Secondary pages for mobile users.</h4>
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
