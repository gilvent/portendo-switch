import { useEffect } from 'react';
import './App.scss';
import ControllerButton from './components/ControllerButton';
import ControllerHelpPanel from './components/ControllerHelpPanel';
import { ControllerButtonProvider } from './context/ControllerButtonContext';
import useMediaQuery from './hooks/useMediaQuery.hook';
import Router from './router/Router';
import { MediaQueryScreen } from './utils/enums';
import WebFont from 'webfontloader';

function App() {
  const isDesktop = useMediaQuery(MediaQueryScreen.Desktop);
  const routerKey = isDesktop ? 'landscape-mode' : 'portrait-mode';
  const controllerKey = 'controller-' + routerKey;

  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Fredoka:400,500,600,700']
      },
      custom: {
        families: ['Gaban']
      }
    });
  }, []);

  useEffect(() => {
    const listener = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('beforeunload', listener);

    return () => {
      window.removeEventListener('beforeunload', listener);
    };
  }, []);

  return (
    <ControllerButtonProvider>
      <div className="app">
        <Router key={routerKey} />
        <ControllerButton key={controllerKey} />
        <ControllerHelpPanel />
      </div>
    </ControllerButtonProvider>
  );
}

export default App;
