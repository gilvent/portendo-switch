import styles from './TechBlock.module.scss';
import { TECH } from './types';
import Box from './Box';
import { useState } from 'react';

const boxPropsByTech = {
  [TECH.PLAYWRIGHT]: {
    logoFileName: 'playwright.svg',
    text: 'PLAYWRIGHT',
    color: '#d65348',
    imgHeight: 65
  },
  [TECH.SASS]: {
    logoFileName: 'sass.svg',
    text: 'SASS',
    color: '#cf649a'
  },
  [TECH.VUE]: {
    logoFileName: 'vue.svg',
    text: 'VUE',
    color: '#42b884',
    imgHeight: 55
  },
  [TECH.NGINX]: {
    logoFileName: 'nginx.svg',
    text: 'NGINX',
    color: '#22963a'
  },
  [TECH.LARAVEL]: {
    logoFileName: 'laravel.svg',
    text: 'LARAVEL',
    color: '#F9322C'
  },
  [TECH.POSTGRES]: {
    logoFileName: 'postgres.png',
    text: 'POSTGRES',
    color: '#336791'
  },
  [TECH.GCLOUD]: {
    logoFileName: 'gcloud.png',
    text: 'GOOGLE CLOUD',
    color: '#fbbd05'
  },
  [TECH.GSAP]: {
    logoFileName: 'gsap.svg',
    text: 'GSAP',
    color: '#0ae448'
  },
  [TECH.REACT]: {
    logoFileName: 'react.svg',
    text: 'REACT',
    color: '#61D9FA'
  },
  [TECH.STRAPI]: {
    logoFileName: 'strapi.svg',
    text: 'STRAPI CMS',
    color: '#4945ff'
  }
};

function TechBlock({ techList }: { techList: TECH[][] }) {
  const [boxes] = useState<JSX.Element[]>(getBoxesList());

  function getBoxesList(): JSX.Element[] {
    return techList.map((listRow, rowIndex) => {
      const boxes = listRow.map((tech: TECH) => (
        <Box key={tech} {...boxPropsByTech[tech]} />
      ));
      return (
        <div className={styles['boxes-row']} key={rowIndex}>
          {boxes}
        </div>
      );
    });
  }

  return (
    <div data-anim-target="tech-block" className={styles['tech-card']}>
      <div data-anim-target="bg" className={styles.bg}></div>
      <h2 data-anim-target="heading" className={`${styles.heading} invisible`}>
        Tech Stack
      </h2>
      <div data-anim-target="boxes-container" className={styles.boxes}>
        {boxes}
      </div>
    </div>
  );
}

export default TechBlock;
