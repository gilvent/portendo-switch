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

const detailComponentByParams: Record<string, FunctionComponent> = {
  [WorkPageTitle.Blibli]: lazy(
    async () => await import('@/pages/BlibliWorkPage')
  ),
  [WorkPageTitle.Moperty]: lazy(
    async () => await import('@/pages/MopertyWorkPage')
  )
};

function WorkDetail() {
  const { pathname } = useLocation();
  const params = useParams();
  const [ActiveComponent, setActiveComponent] = useState<any>(
    detailComponentByParams[WorkPageTitle.Blibli]
  );
  const { setAction } = useContext(ControllerButtonContext);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveComponent(
      detailComponentByParams[params.title as WorkPageTitle] ??
        detailComponentByParams[WorkPageTitle.Blibli]
    );
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

export default WorkDetail;
