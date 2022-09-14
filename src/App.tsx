import { useRef } from 'react';
import BlibliWorkPage from './pages/BlibliWorkPage/BlibliWorkPage';
import './App.css';
import { useRoutes } from 'react-router-dom';
import WorkPage from './pages/WorkPage';

const routes = [
  {
    path: 'work',
    element: <WorkPage />,
    children: [
      {
        path: 'blibli',
        element: <BlibliWorkPage />
      }
    ]
  }
];

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const pageElement = useRoutes(routes);

  return (
    <div className="App" ref={appRef}>
      {pageElement}
    </div>
  );
}

export default App;
