import WorkPageContext from '@/context/WorkPageContext';
import {
  FunctionComponent,
  lazy,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useLocation } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import useTechBlockAnimations from './useTechBlockAnimations.hook';

const detailComponentByRoute: Record<string, FunctionComponent> = {
  '/work/blibli': lazy(async () => await import('@/pages/BlibliWorkPage'))
};

function WorkDetail() {
  const { pathname } = useLocation();
  const [ActiveComponent, setActiveComponent] = useState<any>(
    detailComponentByRoute['/work/blibli']
  );
  const { activeWorkDetail } = useContext(WorkPageContext);
  const pageRef = useRef<any>(null);
  const { setupEnterAnimation, setupExitAnimation } = useTechBlockAnimations();

  useEffect(() => {
    setActiveComponent(
      detailComponentByRoute[pathname] ?? detailComponentByRoute['/work/blibli']
    );
  }, [pathname]);

  return (
    <Transition
      nodeRef={pageRef}
      mountOnEnter={true}
      onEnter={() => {
        setupEnterAnimation().play();
      }}
      appear={true}
      in={activeWorkDetail !== null}
      onExit={() => {
        setupExitAnimation().play();
      }}
      unmountOnExit={true}
      timeout={{
        enter: 1500,
        appear: 1500,
        exit: 3000
      }}
    >
      <ActiveComponent ref={pageRef} />
    </Transition>
  );
}

export default WorkDetail;
