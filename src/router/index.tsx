import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import WorkPage from '@/pages/WorkPage';
import HomePage from '@/pages/HomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />
      },
      {
        path: 'work/:title',
        element: <WorkPage />
      }
    ]
  }
]);

export default router;
