// This component only handle /work route index logic without any UI.
// Necessary so that SwitchTransition for /work/:index child routes works correctly.

import ControllerButtonContext from '@/context/ControllerButtonContext';
import { ROUTE_PATH_PATTERNS, WorkPageTitle } from '@/utils/enums';
import { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const WorkListDummyComponent = () => {
  const params = useParams();
  const { setAction } = useContext(ControllerButtonContext);
  const navigate = useNavigate();

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

  return <div></div>;
};

export default WorkListDummyComponent;
