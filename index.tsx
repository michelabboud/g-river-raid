/**
 * Application Entry Point
 *
 * This is the main entry file for the River Raid game application.
 * It initializes the React application and mounts it to the DOM.
 *
 * @module index
 * @description Bootstraps the React application with StrictMode enabled
 * for additional development checks and warnings.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Locate the root DOM element where the React app will be mounted
const rootElement = document.getElementById('root');

// Safety check: Ensure the root element exists in the HTML
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React 18+ root using the new createRoot API
// This enables concurrent features and improved performance
const root = ReactDOM.createRoot(rootElement);

// Render the application with StrictMode
// StrictMode activates additional checks and warnings for its descendants:
// - Identifies components with unsafe lifecycles
// - Warns about legacy string ref API usage
// - Warns about deprecated findDOMNode usage
// - Detects unexpected side effects
// - Ensures reusable state
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);