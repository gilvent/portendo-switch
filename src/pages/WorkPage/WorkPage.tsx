import classNames from 'classnames';
import styles from './WorkPage.module.scss';
import WorkListBlock from '@/components/WorkListBlock';
import { Outlet } from 'react-router-dom';
import 'assets/scss/_work-blocks.scss';
import { useEffect } from 'react';
import useActiveWorkBanner from '@/components/WorkListBlock/useActiveWorkBanner.hook';
import { ROUTE_PATH_PATTERNS, WorkPageTitle } from '@/utils/enums';

function WorkPage() {
  const primaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--primary']
  );
  const secondaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--secondary']
  );
  const { activeBanner } = useActiveWorkBanner();

  useEffect(() => {
    if (!activeBanner) {
      window.location.href = ROUTE_PATH_PATTERNS.WORK.replace(
        ':title',
        WorkPageTitle.Blibli
      );
    }
  }, []);

  if (!activeBanner) {
    return null;
  }

  return (
    <div className="work-list">
      <div
        data-anim-target="work-list-container"
        className={primaryPanelClasses}
      >
        <WorkListBlock></WorkListBlock>
      </div>

      <div className={secondaryPanelClasses}>
        {activeBanner !== undefined && <Outlet />}
      </div>

      <div data-anim-target="work-page-heading" className={styles.heading}>
        <div>WORKS</div>
        <div>Press B to view</div>
      </div>
    </div>
  );
}

export default WorkPage;
