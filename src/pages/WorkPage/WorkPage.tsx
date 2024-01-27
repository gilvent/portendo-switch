import classNames from 'classnames';
import styles from './WorkPage.module.scss';
import WorkListBlock from '@/components/WorkListBlock';
import { WorkPageProvider } from '@/context/WorkPageContext';
import { Outlet } from 'react-router-dom';

function WorkPage() {
  const primaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--primary']
  );
  const secondaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--secondary']
  );

  return (
    <WorkPageProvider>
      <div className="work-list">
        <div className={primaryPanelClasses}>
          <WorkListBlock></WorkListBlock>
        </div>

        <div className={secondaryPanelClasses}>
          <Outlet />
        </div>
      </div>
    </WorkPageProvider>
  );
}

export default WorkPage;
