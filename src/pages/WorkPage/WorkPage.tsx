import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import classNames from 'classnames';
import BlibliCard from '@/components/BlibliCard';
import styles from './WorkPage.module.scss';

function WorkPage() {
  const navigate = useNavigate();
  const workDetailPage = useOutlet();
  const { pathname } = useLocation();
  const [isCardActive, setIsCardActive] = useState(() => {
    return pathname === '/work/blibli';
  });

  const primaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--primary']
  );
  const secondaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--secondary']
  );

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
    <div className="work-list">
      <div className={primaryPanelClasses}>
        <BlibliCard onClick={onCardClick} active={isCardActive} />
      </div>
      <div className={secondaryPanelClasses}>{workDetailPage}</div>
    </div>
  );
}

export default WorkPage;
