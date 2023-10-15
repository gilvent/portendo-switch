import { getElementYPosition } from '@/utils/document';
import { RefObject, useEffect, useState } from 'react';
import { PreviewImageCSSProperty } from './types';

type HookParams = {
  transparentLayerRef: RefObject<HTMLDivElement>;
  previewRef: RefObject<HTMLDivElement>;
};

function useStyleSetup({ transparentLayerRef, previewRef }: HookParams) {
  const initialImgPadding = 145;
  const [imgPadding, setImgPadding] = useState(initialImgPadding);
  const [imgStyle, setImgStyle] = useState({
    '--padding-top': initialImgPadding + 'px'
  } as PreviewImageCSSProperty);

  useEffect(() => {
    const transparentLayerY = getElementYPosition(transparentLayerRef.current);
    const previewY = getElementYPosition(previewRef.current);
    // TODO approach is not fully reliable, can only works on initial window position (breaks when refreshed after window is scrolled)
    setImgPadding(transparentLayerY - previewY);
  }, []);

  useEffect(() => {
    setImgStyle({
      '--padding-top': imgPadding + 'px'
    } as PreviewImageCSSProperty);
  }, [imgPadding]);

  return {
    imgStyle
  };
}

export default useStyleSetup;
