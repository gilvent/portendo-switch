import { RefObject } from 'react';

export enum TECH {
  VUE = 'VUE',
  SASS = 'SASS',
  NGINX = 'NGINX',
  PLAYWRIGHT = 'PLAYWRIGHT'
}

export type BoxRefs = {
  rootRef: RefObject<HTMLDivElement>;
  overlayRef: RefObject<HTMLDivElement>;
  textRef: RefObject<HTMLDivElement>;
};
