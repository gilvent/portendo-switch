import usePreviousState from '@/hooks/usePreviousState.hook';
import { ROUTE_PATH_PATTERNS } from '@/utils/enums';
import { matchPath, useLocation } from 'react-router-dom';

function useRouteTransitionHelper() {
  const location = useLocation();
  const prevLocation = usePreviousState(location);

  function isToPath(pathPattern: ROUTE_PATH_PATTERNS) {
    return !!matchPath(pathPattern, window.location.pathname);
  }

  function isFromPath(pathPattern: ROUTE_PATH_PATTERNS) {
    return !!matchPath(pathPattern, prevLocation.pathname);
  }

  return {
    isToPath,
    isFromPath
  };
}

export default useRouteTransitionHelper;
