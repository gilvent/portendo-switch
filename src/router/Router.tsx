import { Routes, Route } from 'react-router-dom';

import RouteTransition from '@/components/RouteTransition';
import HomePage from '@/pages/HomePage';
import WorkPage from '@/pages/WorkPage';

const Router = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <RouteTransition>
            <HomePage />
          </RouteTransition>
        }
      />
      <Route
        path="/work/:title"
        element={
          <RouteTransition>
            <WorkPage />
          </RouteTransition>
        }
      />
    </Routes>
  );
};

export default Router;
