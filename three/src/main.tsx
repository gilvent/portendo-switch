import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import './ui/global.css';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary, AppLoading } from './ui/AppStatus';

const root = document.getElementById('root');
if (root === null) throw new Error('main: #root element is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense fallback={<AppLoading />}>
        <App />
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>,
);
