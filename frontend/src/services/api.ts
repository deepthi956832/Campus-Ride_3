import axios from 'axios';

const getBaseUrl = () => {
  const networkUrl = import.meta.env.VITE_API_URL || 'http://10.18.176.214:8000/api';

  // If we are in Capacitor (mobile app)
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    console.log(`Capacitor Mode: Using API at ${networkUrl}`);
    return networkUrl;
  }

  // If we are in a browser on localhost, use localhost
  if (typeof window !== 'undefined' && 
     (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:8000/api';
  }

  return networkUrl;
};

export const BASE_URL = getBaseUrl();
console.log(`API Base URL: ${BASE_URL}`);

const apiInstance = axios.create({
  baseURL: BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const request = async (method: string, endpoint: string, data?: any, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // Ensure we don't have double slashes and don't strip the baseURL path
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

  const res = await apiInstance({
    method,
    url: cleanEndpoint,
    data,
    headers,
  });
  return res.data;
};

export const api = {
  get: (endpoint: string, token?: string) => request('GET', endpoint, null, token),
  post: (endpoint: string, data: any, token?: string) => request('POST', endpoint, data, token),
  put: (endpoint: string, data: any, token?: string) => request('PUT', endpoint, data, token),
  patch: (endpoint: string, data: any, token?: string) => request('PATCH', endpoint, data, token),
  delete: (endpoint: string, token?: string) => request('DELETE', endpoint, null, token),
};
