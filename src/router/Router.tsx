import { Routes, Route, Navigate } from 'react-router-dom';

import RouteTransition from '@/components/RouteTransition';
import HomePage from '@/pages/HomePage';
import WorkPage from '@/pages/WorkPage';
import WorkHighlight from '@/pages/WorkHighlightPage';
import WorkRouteTransition from '@/components/WorkRouteTransition';
import WorkIndexDummyPage from '@/pages/WorkIndexDummyPage';

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
              <WorkIndexDummyPage />
            </WorkRouteTransition>
          }
        ></Route>
        <Route
          path="highlight"
          element={
            <WorkRouteTransition>
              <WorkHighlight />
            </WorkRouteTransition>
          }
        ></Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;
