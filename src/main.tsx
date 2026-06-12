import {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary';
import './index.css';

function SplashHider() {
  useEffect(() => {
    localStorage.setItem('sf_returning', '1');
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
      <BrowserRouter basename="/app">
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
