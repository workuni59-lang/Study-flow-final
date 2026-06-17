import {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary';
import './index.css';

// Register PWA service worker with auto-update
registerSW({ immediate: true });

// Global error handlers
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[Global] Uncaught error:', message, source, lineno, colno, error?.stack);
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason?.message || event.reason, event.reason?.stack);
});

function SplashHider() {
  useEffect(() => {
    const splash = document.getElementById('loading-splash');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash?.remove(), 400);
    }
  }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SplashHider />
    <ErrorBoundary>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
