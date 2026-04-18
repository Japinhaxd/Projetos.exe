import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { LS_KEYS, lsGet } from './lib/storage';
import type { Theme } from './types';

// Apply theme class synchronously BEFORE React renders, so we never flash
// the wrong theme on first paint.
const storedTheme = lsGet<Theme>(LS_KEYS.theme, 'dark');
document.documentElement.classList.remove('dark', 'light');
document.documentElement.classList.add(storedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
