const isBrowserLocalhost = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

export const runtimeConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  localMode: import.meta.env.VITE_LOCAL_MODE === 'true' || (import.meta.env.DEV && isBrowserLocalhost),
};
