import { useEffect, useRef, useState } from 'react';
import pdpPageImg from 'assets/blibli-projects/pdp-full-page.png';
import { getElementYPosition } from '@/utils/document';
import styles from './BlibliProductDetailPreview.module.scss';
import { PreviewImageCSSProperty } from './types';

function BlibliProductDetailPreview() {
  const transparentLayerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const initialImgPadding = 145;
  const [imgPadding, setImgPadding] = useState(initialImgPadding);
  const [imgStyle, setImgStyle] = useState({
    '--padding-top': initialImgPadding + 'px',
  } as PreviewImageCSSProperty);

  useEffect(() => {
    const transparentLayerY = getElementYPosition(transparentLayerRef.current);
    const previewY = getElementYPosition(previewRef.current);
    setImgPadding(transparentLayerY - previewY);
  }, []);

  useEffect(() => {
    setImgStyle({
      '--padding-top': imgPadding + 'px',
    } as PreviewImageCSSProperty);
  }, [imgPadding]);

  return (
    <figure className={styles['preview']} ref={previewRef}>
      <img src={pdpPageImg} style={imgStyle} alt="Blibli product detail" />
      <div className={styles['overlay']}>
        <div ref={transparentLayerRef}></div>
      </div>
    </figure>
  );
}

export default BlibliProductDetailPreview;
