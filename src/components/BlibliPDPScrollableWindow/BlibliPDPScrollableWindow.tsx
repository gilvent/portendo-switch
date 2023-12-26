import { useEffect, useRef } from 'react';
import pdpPageImg from 'assets/img/blibli/pdp-full-page.png';
import styles from './BlibliPDPScrollableWindow.module.scss';

function BlibliPDPScrollableWindow({
  onRefLoaded
}: {
  onRefLoaded?: (element: HTMLDivElement) => any;
}) {
  const transparentLayerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      onRefLoaded?.(previewRef.current);
    }
  }, []);

  return (
    <figure
      id="product-detail-preview"
      className={styles['preview']}
      ref={previewRef}
    >
      <img src={pdpPageImg} alt="Blibli product detail" />
      <div className={styles['overlay']}>
        <div className={styles.window} ref={transparentLayerRef}>
          <div className={styles.frame}></div>
        </div>
      </div>
    </figure>
  );
}

export default BlibliPDPScrollableWindow;
