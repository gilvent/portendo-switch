import usePreviousState from '@/hooks/usePreviousState.hook';
import { WorkHighlightName } from '@/utils/enums';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export type Banner = {
  url: string;
  selector: string;
  background: string;
  title: WorkHighlightName;
  prevBannerTitle: WorkHighlightName;
  nextBannerTitle: WorkHighlightName;
};

const bannersByTitle: Record<WorkHighlightName, Banner> = {
  [WorkHighlightName.Blibli]: {
    url: '/work/blibli',
    selector: '#blibli-banner',
    background: 'linear-gradient(132.36deg, #0092da 43.16%, #0071da 112.76%)',
    title: WorkHighlightName.Blibli,
    prevBannerTitle: WorkHighlightName.Blibli,
    nextBannerTitle: WorkHighlightName.Moperty
  },
  [WorkHighlightName.Moperty]: {
    url: '/work/moperty',
    selector: '#moperty-banner',
    background: 'linear-gradient(132.36deg, #503FB5 43%, #3F51B5 112%)',
    title: WorkHighlightName.Moperty,
    prevBannerTitle: WorkHighlightName.Blibli,
    nextBannerTitle: WorkHighlightName.Radjastone
  },
  [WorkHighlightName.Radjastone]: {
    url: '/work/radjastone',
    selector: '#radjastone-banner',
    background:
      'linear-gradient(132.36deg, rgb(154 136 63) 43%, rgb(137 115 25) 112%)',
    title: WorkHighlightName.Radjastone,
    prevBannerTitle: WorkHighlightName.Moperty,
    nextBannerTitle: WorkHighlightName.Radjastone
  }
};

function useActiveWorkBanner() {
  const params = useParams();
  const [activeBanner, setActiveBanner] = useState<Banner>(() => {
    return bannersByTitle[params.title as WorkHighlightName];
  });
  const prevBanner = usePreviousState(activeBanner);

  useEffect(() => {
    if (params.title !== undefined) {
      setActiveBanner(bannersByTitle[params.title as WorkHighlightName]);
    }
  }, [params]);

  return {
    activeBanner,
    prevBanner,
    bannersByTitle
  };
}

export default useActiveWorkBanner;
