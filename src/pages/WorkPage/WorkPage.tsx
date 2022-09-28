import BlibliCard from '@/components/BlibliCard';
import { getClassNames } from '@/utils/css-module';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import styles from './WorkPage.module.scss';

function WorkPage() {
  const navigate = useNavigate();
  const workDetailPage = useOutlet();
  const { pathname } = useLocation();
  const [isCardActive, setIsCardActive] = useState(() => {
    return pathname === '/work/blibli';
  });

  const primaryPanelClasses = getClassNames(styles, [
    'panel-container',
    'panel-container--primary'
  ]);
  const secondaryPanelClasses = getClassNames(styles, [
    'panel-container',
    'panel-container--secondary'
  ]);

  const onCardClick = () => {
    if (!isCardActive) {
      navigate('blibli');
    } else {
      navigate('/work');
    }
  };

  useEffect(() => {
    setIsCardActive(pathname === '/work/blibli');
  }, [pathname]);

  return (
    <div>
      <div className={primaryPanelClasses}>
        <BlibliCard onClick={onCardClick} active={isCardActive} />
      </div>
      <div className={secondaryPanelClasses}>
        { workDetailPage }
      </div>
    </div>
  );
}

export default WorkPage;
