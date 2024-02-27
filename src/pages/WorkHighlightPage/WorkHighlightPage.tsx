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

const BlibliHighlights = lazy(() => import('./BlibliHighlights'));
const MopertyHighlight = lazy(() => import('./MopertyHighlights'));

function WorkHighlight() {
  const detailComponentByParams: Record<string, FunctionComponent> = {
    [WorkPageTitle.Blibli]: BlibliHighlights,
    [WorkPageTitle.Moperty]: MopertyHighlight
  };
  const { pathname } = useLocation();
  const params = useParams();
  const [ActiveComponent, setActiveComponent] = useState<any>(() => {
    return detailComponentByParams[params.title as string];
  });
  const { setAction, setHelpPanelGuides } = useContext(ControllerButtonContext);
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

  useEffect(() => {
    setHelpPanelGuides([
      ['Press', '{A}', 'to go back'],
      ['Press', '{B}', 'to scroll down']
    ]);
  }, []);

  return (
    <Suspense>
      <ActiveComponent />
    </Suspense>
  );
}

export default WorkHighlight;
