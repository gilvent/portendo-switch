import { Routes, Route } from 'react-router-dom';

import RouteTransition from '@/components/RouteTransition';
import HomePage from '@/pages/HomePage';
import WorkPage from '@/pages/WorkPage';
import WorkDetail from '@/components/WorkDetail';
import WorkRouteTransition from '@/components/WorkRouteTransition';
import WorkListDummyComponent from '@/components/WorkListDummyComponent';

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
      >
        <Route
          index
          element={
            <WorkRouteTransition>
              <WorkListDummyComponent />
            </WorkRouteTransition>
          }
        ></Route>
        <Route
          path="detail"
          element={
            <WorkRouteTransition>
              <WorkDetail />
            </WorkRouteTransition>
          }
        ></Route>
      </Route>
    </Routes>
  );
};

export default Router;
