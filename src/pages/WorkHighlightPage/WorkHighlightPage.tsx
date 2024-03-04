import {
  FunctionComponent,
  Suspense,
  lazy,
  useContext,
  useEffect,
  useState
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ROUTE_PATH_PATTERNS, WorkHighlightId } from '@/utils/enums';
import ControllerButtonContext from '@/context/ControllerButtonContext';

const BlibliHighlights = lazy(() => import('./BlibliHighlights'));
const MopertyHighlight = lazy(() => import('./MopertyHighlights'));
const RadjastoneHighlight = lazy(() => import('./RadjastoneHighlights'));

function WorkHighlight() {
  const detailComponentByParams: Record<string, FunctionComponent> = {
    [WorkHighlightId.Blibli]: BlibliHighlights,
    [WorkHighlightId.Moperty]: MopertyHighlight,
    [WorkHighlightId.Radjastone]: RadjastoneHighlight
  };
  const { pathname } = useLocation();
  const params = useParams();
  const [ActiveComponent, setActiveComponent] = useState<any>(() => {
    return detailComponentByParams[params.title as string];
  });
  const { setAction, setHelpPanelGuides } = useContext(ControllerButtonContext);
  const navigate = useNavigate();

  useEffect(() => {
    setAction('onControlBClick', () => {
      window.scrollTo({
        top: document.documentElement.scrollTop + window.innerHeight,
        behavior: 'smooth'
      });
    });
  }, []);

  useEffect(() => {
    setActiveComponent(detailComponentByParams[params.title as string]);
  }, [pathname]);

  useEffect(() => {
    setAction('onControlAClick', () => {
      const url = ROUTE_PATH_PATTERNS.WORK.replace(
        ':title',
        params.title ?? WorkHighlightId.Blibli
      );
      navigate(url);
    });
  }, [params]);

  useEffect(() => {
    setHelpPanelGuides(['Press {A} to go back', 'Press {B} to scroll down']);
  }, []);

  return (
    <Suspense>
      <ActiveComponent />
    </Suspense>
  );
}

export default WorkHighlight;
