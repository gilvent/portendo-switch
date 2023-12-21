import { useOutlet } from 'react-router-dom';
import classNames from 'classnames';
import styles from './WorkPage.module.scss';
import WorkListBlock from '@/components/WorkListBlock';

function WorkPage() {
  // TODO update navigation logic
  // const navigate = useNavigate();
  const workDetailPage = useOutlet();
  // const { pathname } = useLocation();
  // const [isCardActive, setIsCardActive] = useState(() => {
  //   return pathname === '/work/blibli';
  // });

  const primaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--primary']
  );
  const secondaryPanelClasses = classNames(
    styles['panel-container'],
    styles['panel-container--secondary']
  );

  // const onCardClick = () => {
  //   if (!isCardActive) {
  //     navigate('blibli');
  //   } else {
  //     navigate('/work');
  //   }
  // };

  // useEffect(() => {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: 'smooth'
  //   });
  //   setIsCardActive(pathname === '/work/blibli');
  // }, [pathname]);

  return (
    <div className="work-list">
      <div className={primaryPanelClasses}>
        <WorkListBlock></WorkListBlock>
      </div>
      <div className={secondaryPanelClasses}>{workDetailPage}</div>
    </div>
  );
}

export default WorkPage;
