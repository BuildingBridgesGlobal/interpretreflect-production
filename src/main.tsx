import './utils/suppressExtensionErrors';
import './utils/preventDuplicateElements';
import './utils/unregisterServiceWorker';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
// import { DebugApp as App } from './DebugApp.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import './styles/accessibility.css';
import './styles/typography.css';
import './styles/header.css';
import './styles/accessibleColors.css';
import './styles/yellowSelection.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
