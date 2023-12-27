import styles from './Box.module.scss';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type BoxProps = {
  logoFileName: string;
  text: string;
  color: string;
};

function Box(props: BoxProps) {
  const [imgSrc, setImgSrc] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    import('@/assets/img/tech/' + props.logoFileName).then(src => {
      setImgSrc(src.default);
    });
  }, []);

  useEffect(() => {
    boxRef.current?.style.setProperty('--theme', props.color);
  }, []);

  return (
    <div data-anim-target="box" ref={boxRef} className={styles.box}>
      <div className={styles.fg}>
        <img src={imgSrc} alt="" />
      </div>
      <div data-anim-target="overlay" className={styles.overlay}></div>
      <div data-anim-target="text" className={styles.text}>
        {props.text}
      </div>
    </div>
  );
}

export default Box;
