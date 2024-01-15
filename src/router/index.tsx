/**
 * For reference using the createBrowserRouter API
 */

import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import WorkPage from '@/pages/WorkPage';
import HomePage from '@/pages/HomePage';
import RouteTransition from '@/components/RouteTransition/RouteTransition';

const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
    children: [
      {
        path: '',
        index: true,
        element: (
          <RouteTransition>
            <HomePage />
          </RouteTransition>
        )
      },
      {
        path: 'work/:title',
        element: (
          <RouteTransition>
            <WorkPage />
          </RouteTransition>
        )
      }
    ]
  }
]);

export default router;
