import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import './ui/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { palette } from './theme/palette';

const root = document.getElementById('root');
if (root === null) throw new Error('main: #root element is missing from index.html');

for (const [token, value] of Object.entries(palette)) {
  document.documentElement.style.setProperty(`--${token}`, value);
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
