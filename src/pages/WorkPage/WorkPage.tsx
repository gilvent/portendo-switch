import classNames from 'classnames';
import styles from './WorkPage.module.scss';
import WorkListBlock from '@/components/WorkListBlock';
import { WorkPageProvider } from '@/context/WorkPageContext';
import { Outlet } from 'react-router-dom';
import 'assets/scss/_work-blocks.scss';

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
    <div className="work-list">
      <div
        data-anim-target="work-list-container"
        className={primaryPanelClasses}
      >
        <WorkListBlock></WorkListBlock>
      </div>

      <div className={secondaryPanelClasses}>
        <Outlet />
      </div>
    </div>
  );
}

export default WorkPage;
