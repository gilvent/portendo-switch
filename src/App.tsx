import './App.scss';
import ControllerButton from './components/ControllerButton';
import { ControllerButtonProvider } from './context/ControllerButtonContext';
import Router from './router/Router';

function App() {
  return (
    <ControllerButtonProvider>
      <div className="app">
        <Router />
        <ControllerButton />
      </div>
    </ControllerButtonProvider>
  );
}

export default App;
