import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { MusicProvider } from './context/MusicContext.tsx';
import { SmartFocusProvider } from './context/SmartFocusContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { I18nProvider } from './i18n/I18nContext.tsx';
import { AgentStudioProvider } from './context/AgentStudioContext.tsx';
import './index.css';

// Guard against opaque third-party/iframe "Script error."
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message === 'Script error.' || !event.filename) {
      // Benign cross-origin script error (e.g. adblocker, iframe restrictions, or CDN script)
      event.preventDefault();
      console.warn('Caught cross-origin script event:', event);
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (event.reason.message === 'Script error.' || String(event.reason).includes('Script error'))) {
      event.preventDefault();
      console.warn('Caught unhandled promise rejection with Script error:', event.reason);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MusicProvider>
        <SmartFocusProvider>
          <AgentStudioProvider>
            <I18nProvider>
              <App />
            </I18nProvider>
          </AgentStudioProvider>
        </SmartFocusProvider>
      </MusicProvider>
    </AuthProvider>
  </StrictMode>,
);

