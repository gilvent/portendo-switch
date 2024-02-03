import usePreviousState from '@/hooks/usePreviousState.hook';
import { WorkDetailName } from '@/utils/enums';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export type Banner = {
  url: string;
  selector: string;
  background: string;
  title: WorkDetailName;
  prevBannerTitle: WorkDetailName;
  nextBannerTitle: WorkDetailName;
};

const bannersByTitle: Record<WorkDetailName, Banner> = {
  [WorkDetailName.Blibli]: {
    url: '/work/blibli',
    selector: '#blibli-banner',
    background: 'linear-gradient(132.36deg, #0092da 43.16%, #0071da 112.76%)',
    title: WorkDetailName.Blibli,
    prevBannerTitle: WorkDetailName.Blibli,
    nextBannerTitle: WorkDetailName.Moperty
  },
  [WorkDetailName.Moperty]: {
    url: '/work/moperty',
    selector: '#moperty-banner',
    background: 'linear-gradient(132.36deg, #503FB5 43%, #3F51B5 112%)',
    title: WorkDetailName.Moperty,
    prevBannerTitle: WorkDetailName.Blibli,
    nextBannerTitle: WorkDetailName.Moperty
  }
};

function useActiveWorkBanner() {
  const params = useParams();
  const [activeBanner, setActiveBanner] = useState<Banner>(() => {
    const banner =
      bannersByTitle[params.title as WorkDetailName] ??
      bannersByTitle[WorkDetailName.Blibli];
    return banner;
  });
  const prevBanner = usePreviousState(activeBanner);

  useEffect(() => {
    if (params.title !== undefined) {
      setActiveBanner(
        bannersByTitle[params.title as WorkDetailName] ??
          bannersByTitle[WorkDetailName.Blibli]
      );
    }
  }, [params]);

  return {
    activeBanner,
    prevBanner,
    bannersByTitle
  };
}

export default useActiveWorkBanner;
