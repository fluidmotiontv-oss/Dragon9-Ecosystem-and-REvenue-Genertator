import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker safely
if (typeof window !== 'undefined') {
  // Capture early beforeinstallprompt event before any React components mount
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).__deferredPrompt = e;
  });
}

if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('New content available, please refresh.');
      },
      onOfflineReady() {
        console.log('App is ready to work offline.');
      },
      onRegisterError(error) {
        // Benign in preview iframe environments
        console.debug('PWA registration notice:', error);
      }
    });
  } catch (err) {
    console.debug('PWA registration skipped in this context:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
