import { useContext, useRef } from 'react';
import pdpPageImg from 'assets/img/blibli/pdp-full-page.png';
import useStandaloneScrollTrigger from '@/hooks/useStandaloneScrollTrigger.hook';
import BlibliWorkPageContext from '@/context/BlibliWorkPageContext';
import styles from './BlibliPDPScrollableWindow.module.scss';
import useStyleSetup from './useStyleSetup.hook';

function BlibliPDPScrollableWindow() {
  const transparentLayerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { imgStyle } = useStyleSetup({ transparentLayerRef, previewRef });
  const { setActivePDPArticle } = useContext(BlibliWorkPageContext);
  useStandaloneScrollTrigger({
    trigger: '#product-detail-preview',
    start: 'top center',
    end: '50% center',
    onEnter: _ => {
      setActivePDPArticle(0);
    },
    onEnterBack: _ => {
      setActivePDPArticle(0);
    }
  });
  useStandaloneScrollTrigger({
    trigger: '#product-detail-preview',
    start: '50% center',
    end: 'bottom center',
    onEnter: _ => {
      setActivePDPArticle(1);
    },
    onEnterBack: _ => {
      setActivePDPArticle(1);
    }
  });

  return (
    <figure
      id="product-detail-preview"
      className={styles['preview']}
      ref={previewRef}
    >
      <img src={pdpPageImg} style={imgStyle} alt="Blibli product detail" />
      <div className={styles['overlay']}>
        <div className={styles.window} ref={transparentLayerRef}>
          <div className={styles.frame}></div>
        </div>
      </div>
    </figure>
  );
}

export default BlibliPDPScrollableWindow;
