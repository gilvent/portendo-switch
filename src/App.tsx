import './App.css';
import { useOutlet } from 'react-router-dom';

function App() {
  const pages = useOutlet();

  return (
    <div className="App"> 
      {pages}
    </div>
  );
}

export default App;
