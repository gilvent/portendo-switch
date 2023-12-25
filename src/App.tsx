import './App.scss';
import { useOutlet } from 'react-router-dom';
import ControllerButton from './components/ControllerButton';
import { ControllerButtonProvider } from './context/ControllerButtonContext';

function App() {
  const pages = useOutlet();

  return (
    <ControllerButtonProvider>
      <div className="app">
        <div>{pages}</div>
        <ControllerButton />
      </div>
    </ControllerButtonProvider>
  );
}

export default App;
