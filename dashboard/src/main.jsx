import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios'
import './index.css';
import App from './App.jsx';

// Helper to read cookie value
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Global fetch interceptor – adds Authorization header if token exists
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken') || getCookie('adminToken');
  if (token) {
    if (!options.headers) options.headers = {};
    if (options.headers instanceof Headers) {
      options.headers.set('Authorization', `Bearer ${token}`);
    } else {
      options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
    }
  }
  return originalFetch(url, options);
};

// Global axios interceptor to automatically append JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
