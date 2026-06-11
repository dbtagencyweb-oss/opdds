import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './src/App';
import { ThemeProvider } from './src/theme/ThemeProvider';

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}
