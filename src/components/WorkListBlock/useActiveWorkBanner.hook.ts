import usePreviousState from '@/hooks/usePreviousState.hook';
import { WorkHighlightId } from '@/utils/enums';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export type Banner = {
  url: string;
  selector: string;
  background: string;
  title: WorkHighlightId;
  prevBannerTitle: WorkHighlightId;
  nextBannerTitle: WorkHighlightId;
};

const bannersByTitle: Record<WorkHighlightId, Banner> = {
  [WorkHighlightId.Blibli]: {
    url: '/work/blibli',
    selector: '#blibli-banner',
    background: 'linear-gradient(132.36deg, #0092da 43.16%, #0071da 112.76%)',
    title: WorkHighlightId.Blibli,
    prevBannerTitle: WorkHighlightId.Blibli,
    nextBannerTitle: WorkHighlightId.Moperty
  },
  [WorkHighlightId.Moperty]: {
    url: '/work/moperty',
    selector: '#moperty-banner',
    background: 'linear-gradient(132.36deg, #503FB5 43%, #3F51B5 112%)',
    title: WorkHighlightId.Moperty,
    prevBannerTitle: WorkHighlightId.Blibli,
    nextBannerTitle: WorkHighlightId.Radjastone
  },
  [WorkHighlightId.Radjastone]: {
    url: '/work/radjastone',
    selector: '#radjastone-banner',
    background:
      'linear-gradient(132.36deg, rgb(154 136 63) 43%, rgb(137 115 25) 112%)',
    title: WorkHighlightId.Radjastone,
    prevBannerTitle: WorkHighlightId.Moperty,
    nextBannerTitle: WorkHighlightId.Radjastone
  }
};

function useActiveWorkBanner() {
  const params = useParams();
  const [activeBanner, setActiveBanner] = useState<Banner>(() => {
    return bannersByTitle[params.title as WorkHighlightId];
  });
  const prevBanner = usePreviousState(activeBanner);

  useEffect(() => {
    if (params.title !== undefined) {
      setActiveBanner(bannersByTitle[params.title as WorkHighlightId]);
    }
  }, [params]);

  return {
    activeBanner,
    prevBanner,
    bannersByTitle
  };
}

export default useActiveWorkBanner;
