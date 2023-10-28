import styles from './TechBlock.module.scss';
import { BoxRefs, TECH } from './types';
import Box from './Box';
import { useEffect, useRef, useState } from 'react';
import useBoxAnimations from './useBoxAnimations.hook';

function TechBlock({ techList }: { techList: TECH[][] }) {
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
    }
  };
  const containerRef = useRef(null);
  const boxesRefsMap = useRef<Record<string, BoxRefs>>({});

  const [boxes] = useState<JSX.Element[]>(getBoxesList());
  const { setupEnterAnimation: boxesEnter, setupHoverAnimation } =
    useBoxAnimations(containerRef, boxesRefsMap.current);

  useEffect(() => {
    boxesEnter();
    setupHoverAnimation();
  }, []);

  function getBoxesList(): JSX.Element[] {
    return techList.map((listRow, rowIndex) => {
      const boxes = listRow.map((tech: TECH, boxIndex) => (
        <Box
          key={tech}
          {...boxPropsByTech[tech]}
          onRefsInit={refs => {
            boxesRefsMap.current[rowIndex.toString() + boxIndex.toString()] =
              refs;
          }}
        />
      ));
      return (
        <div className={styles['boxes-row']} key={rowIndex}>
          {boxes}
        </div>
      );
    });
  }

  return (
    <div ref={containerRef} className={styles['tech-card']}>
      <h2 className={styles.heading}>Tech Stack</h2>
      <div className={styles.boxes}>{boxes}</div>
    </div>
  );
}

export default TechBlock;
