import styles from './Box.module.scss';
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BoxRefs } from './types';

type BoxProps = {
  logoFileName: string;
  text: string;
  color: string;
  onRefsInit: (refs: BoxRefs) => any;
};

function Box(props: BoxProps) {
  const [imgSrc, setImgSrc] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    import('@/assets/img/tech/' + props.logoFileName).then(src => {
      setImgSrc(src.default);
    });
  }, []);

  useEffect(() => {
    boxRef.current?.style.setProperty('--theme', props.color);
    props.onRefsInit({
      rootRef: boxRef,
      overlayRef,
      textRef
    });
  }, []);

  return (
    <div ref={boxRef} className={styles.box}>
      <div className={styles.fg}>
        <img src={imgSrc} alt="" />
      </div>
      <div className={styles.overlay} ref={overlayRef}></div>
      <div className={styles.text} ref={textRef}>
        {props.text}
      </div>
    </div>
  );
}

export default Box;
