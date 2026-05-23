import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import RouteTransition from '@/components/RouteTransition';
import HomePage from '@/pages/HomePage';
import WorkRouteTransition from '@/components/WorkRouteTransition';
import WorkIndexDummyPage from '@/pages/WorkIndexDummyPage';

const WorkPage = lazy(() => import('@/pages/WorkPage'));
const WorkHighlight = lazy(() => import('@/pages/WorkHighlightPage'));

const Router = () => {
  return (
    <Suspense fallback={null}>
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
    </Suspense>
  );
};

export default Router;
