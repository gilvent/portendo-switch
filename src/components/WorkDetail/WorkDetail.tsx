import WorkPageContext from '@/context/WorkPageContext';
import {
  FunctionComponent,
  Suspense,
  lazy,
  useContext,
  useEffect,
  useState
} from 'react';
import { useLocation } from 'react-router-dom';

const detailComponentByRoute: Record<string, FunctionComponent> = {
  '/work/blibli': lazy(async () => await import('@/pages/BlibliWorkPage'))
};

function WorkDetail() {
  const [ActiveComponent, setActiveComponent] =
    useState<FunctionComponent | null>(null);
  const { pathname } = useLocation();
  const { activeWorkDetail } = useContext(WorkPageContext);

  useEffect(() => {
    setActiveComponent(detailComponentByRoute[pathname] ?? null);
  }, [pathname]);

  if (!ActiveComponent || !activeWorkDetail) {
    return <></>;
  }

  return (
    <Suspense>
      <ActiveComponent />
    </Suspense>
  );
}

export default WorkDetail;
