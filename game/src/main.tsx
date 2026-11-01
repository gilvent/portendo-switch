import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { applyLight } from './light.ts';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('missing #root');
applyLight(document.documentElement);
createRoot(root).render(<App />);
