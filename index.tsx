
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

Sentry.init({
  dsn: "https://55ca8d155209dbc002ad11c6a35d9013@o4510472931639296.ingest.de.sentry.io/4510472935964752",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
