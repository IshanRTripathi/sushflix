import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateBrowserEnv } from './utils/browserEnv';

// Validate environment variables
if (import.meta.env.DEV) {
  validateBrowserEnv();
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);