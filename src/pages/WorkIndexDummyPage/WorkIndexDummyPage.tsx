// This component only handle /work route index logic without any UI.
// Necessary so that SwitchTransition for /work/:index child routes works correctly.

import useActiveWorkBanner from '@/components/WorkListBlock/useActiveWorkBanner.hook';
import ControllerButtonContext from '@/context/ControllerButtonContext';
import { ROUTE_PATH_PATTERNS, WorkPageTitle } from '@/utils/enums';
import { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const WorkIndexDummyPage = () => {
  const params = useParams();
  const { activeBanner } = useActiveWorkBanner();
  const { setAction, setHelpPanelGuides } = useContext(ControllerButtonContext);
  const navigate = useNavigate();

  useEffect(() => {
    setHelpPanelGuides([
      ['Press', '{A}', 'to go back'],
      ['Press', '{B}', 'to view work highlights'],
      ['Press', '{UP}', '{DOWN}', 'to move between works']
    ]);
  }, []);

  useEffect(() => {
    setAction('onControlBClick', () => {
      const nextUrl = ROUTE_PATH_PATTERNS.WORK_HIGHLIGHT.replace(
        ':title',
        params.title ?? WorkPageTitle.Blibli
      );
      navigate(nextUrl);
    });

    setAction('onControlAClick', () => {
      navigate(ROUTE_PATH_PATTERNS.HOME);
    });
  }, [params]);

  useEffect(() => {
    setAction('onControlXClick', () => {
      const nextUrl = ROUTE_PATH_PATTERNS.WORK.replace(
        ':title',
        activeBanner.nextBannerTitle
      );
      navigate(nextUrl, { replace: true });
    });
    setAction('onControlYClick', () => {
      const prevUrl = ROUTE_PATH_PATTERNS.WORK.replace(
        ':title',
        activeBanner.prevBannerTitle
      );
      navigate(prevUrl, { replace: true });
    });
  }, [activeBanner]);

  return <div></div>;
};

export default WorkIndexDummyPage;
