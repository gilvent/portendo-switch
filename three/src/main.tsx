import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import './ui/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = document.getElementById('root');
if (root === null) throw new Error('main: #root element is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
