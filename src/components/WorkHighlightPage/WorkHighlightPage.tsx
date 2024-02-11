import {
  FunctionComponent,
  Suspense,
  lazy,
  useContext,
  useEffect,
  useState
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS, WorkPageTitle } from '@/utils/enums';
import ControllerButtonContext from '@/context/ControllerButtonContext';

const BlibliWorkPage = lazy(() => import('@/pages/BlibliWorkPage'));
const MopertyWorkPage = lazy(() => import('@/pages/MopertyWorkPage'));

function WorkHighlight() {
  const detailComponentByParams: Record<string, FunctionComponent> = {
    [WorkPageTitle.Blibli]: BlibliWorkPage,
    [WorkPageTitle.Moperty]: MopertyWorkPage
  };
  const { pathname } = useLocation();
  const params = useParams();
  const [ActiveComponent, setActiveComponent] = useState<any>(() => {
    return detailComponentByParams[params.title as string];
  });
  const { setAction } = useContext(ControllerButtonContext);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveComponent(detailComponentByParams[params.title as string]);
  }, [pathname]);

  useEffect(() => {
    setAction('onControlBClick', () => {});
    setAction('onControlAClick', () => {
      const url = ROUTE_PATH_PATTERNS.WORK.replace(
        ':title',
        params.title ?? WorkPageTitle.Blibli
      );
      navigate(url);
    });
  }, [params]);

  return (
    <Suspense>
      <ActiveComponent />;
    </Suspense>
  );
}

export default WorkHighlight;
