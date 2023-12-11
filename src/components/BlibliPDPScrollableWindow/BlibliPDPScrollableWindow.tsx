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

  // TODO Remove this later, keep for reference
  // const { setActivePDPArticle } = useContext(BlibliWorkPageContext);

  // useStandaloneScrollTrigger({
  //   trigger: '#product-detail-preview',
  //   start: 'top center',
  //   end: '50% center',
  //   onEnter: _ => {
  //     setActivePDPArticle(0);
  //   },
  //   onEnterBack: _ => {
  //     setActivePDPArticle(0);
  //   }
  // });

  // useStandaloneScrollTrigger({
  //   trigger: '#product-detail-preview',
  //   start: '50% center',
  //   end: 'bottom center',
  //   onEnter: _ => {
  //     setActivePDPArticle(1);
  //   },
  //   onEnterBack: _ => {
  //     setActivePDPArticle(1);
  //   }
  // });

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
