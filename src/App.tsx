import './App.scss';
import ControllerButton from './components/ControllerButton';
import { ControllerButtonProvider } from './context/ControllerButtonContext';
import useMediaQuery from './hooks/useMediaQuery.hook';
import Router from './router/Router';
import { MediaQueryScreen } from './utils/enums';

function App() {
  const isDesktop = useMediaQuery(MediaQueryScreen.Desktop);
  const routerKey = isDesktop ? 'landscape-mode' : 'portrait-mode';
  const controllerKey = 'controller-' + routerKey;

  return (
    <ControllerButtonProvider>
      <div className="app">
        <Router key={routerKey} />
        <ControllerButton key={controllerKey} />
      </div>
    </ControllerButtonProvider>
  );
}

export default App;
