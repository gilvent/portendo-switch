import { useRef, useState } from 'react';
import styles from './App.module.scss';
import BlibliCard from './components/BlibliCard';
// import BlibliWorkPage from './pages/BlibliWorkPage/BlibliWorkPage';
import './App.css';
import { getClassNames } from './utils/css-module';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const [isCardActive, setIsCardActive] = useState(false);
  const primaryPanelStyles = getClassNames(styles, [
    'panel-container',
    'panel-container--primary'
  ]);
  const secondaryPanelStyles = getClassNames(styles, [
    'panel-container',
    'panel-container--secondary'
  ]);

  const onCardClick = () => {
    setIsCardActive(!isCardActive);
  }

  return (
    <div className="App" ref={appRef}>
      <div className={primaryPanelStyles}>
        <BlibliCard onClick={onCardClick} active={isCardActive}/>
      </div>
      <div className={secondaryPanelStyles}>
        {/* <BlibliWorkPage /> */}
      </div>
    </div>
  );
}

export default App;
