import { RefObject } from 'react';

export enum TECH {
  VUE = 'VUE',
  SASS = 'SASS',
  NGINX = 'NGINX',
  PLAYWRIGHT = 'PLAYWRIGHT',
  LARAVEL = 'LARAVEL',
  POSTGRES = 'POSTGRES',
  GCLOUD = 'GCLOUD',
  GSAP = 'GSAP',
  REACT = 'REACT',
  STRAPI = 'STRAPI'
}

export type BoxRefs = {
  rootRef: RefObject<HTMLDivElement>;
  overlayRef: RefObject<HTMLDivElement>;
  textRef: RefObject<HTMLDivElement>;
};
