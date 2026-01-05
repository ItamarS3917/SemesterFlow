import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Initialize Sentry with environment-based configuration
const isProduction = import.meta.env.PROD;

Sentry.init({
  dsn: 'https://55ca8d155209dbc002ad11c6a35d9013@o4510472931639296.ingest.de.sentry.io/4510472935964752',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Privacy: mask all text and block all media to prevent PII capture
      maskAllText: true,
      blockAllMedia: true,
      // Additional privacy options
      maskAllInputs: true,
    }),
  ],
  // Performance monitoring: 100% in dev, 10% in production
  tracesSampleRate: isProduction ? 0.1 : 1.0,
  // Session replay: 0% normal sessions in prod, 1% in dev
  replaysSessionSampleRate: isProduction ? 0.0 : 0.01,
  // Error replay: 100% of error sessions in both environments
  replaysOnErrorSampleRate: 1.0,
  // Only enable in production or when explicitly enabled
  enabled: isProduction || import.meta.env.VITE_ENABLE_SENTRY === 'true',
  // Set environment
  environment: isProduction ? 'production' : 'development',
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
