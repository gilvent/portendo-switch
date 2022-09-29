import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import BlibliWorkPage from '@/pages/BlibliWorkPage';
import WorkPage from '@/pages/WorkPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
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
    ]
  }
]);

export default router;
