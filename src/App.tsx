import './App.scss';
import { useOutlet } from 'react-router-dom';

function App() {
  const pages = useOutlet();

  return <div className="app">{pages}</div>;
}

export default App;
