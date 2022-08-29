import styles from './TechCard.module.scss';
import { TECH } from './types';
import Box from './Box';
import { useEffect, useState } from 'react';

function TechCard({ techList }: { techList: TECH[][]}) {

  const boxPropsByTech = {
    [TECH.PLAYWRIGHT]: {
      logoFileName: 'playwright.svg',
      text: 'PLAYWRIGHT',
      color: '#d65348'
    },
    [TECH.SASS]: {
      logoFileName: 'sass.svg',
      text: 'SASS',
      color: '#cf649a'
    },
    [TECH.VUE]: {
      logoFileName: 'vue.svg',
      text: 'VUE',
      color: '#42b884'
    },
    [TECH.NGINX]: {
      logoFileName: 'nginx.svg',
      text: 'NGINX',
      color: '#22963a'
    },
  };
  const [boxes] = useState<JSX.Element[]>(getBoxesList());

  useEffect(() => {
    
  }, [])

  function getBoxesList(): JSX.Element[] {
    return techList.map((listRow, index) => {
      const boxes = listRow.map((tech: TECH) => (
        <Box key={tech} {...boxPropsByTech[tech]} />
      ));
      return <Row key={index}>{boxes}</Row>;
    });
  }

  function Row({ children }: any) {
    return <div className={styles['boxes-row']}>{children}</div>;
  }

  return (
    <div className={styles['tech-card']}>
      <div className={styles.heading}>What I Learn</div>
      <div className={styles.boxes}>{boxes}</div>
    </div>
  );
}

export default TechCard;
