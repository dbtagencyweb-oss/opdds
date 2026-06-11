export const runtimeConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  localMode: import.meta.env.VITE_LOCAL_MODE !== 'false',
};
