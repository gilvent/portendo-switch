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
        path: 'work/:title',
        element: <WorkPage />
      }
    ]
  }
]);

export default router;
