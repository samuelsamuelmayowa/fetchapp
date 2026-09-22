import axios from 'axios';
const configured = import.meta.env.VITE_API_URL || import.meta.env.VITE_PRODUCTION_API_URL || 'http://localhost:5000';
export const api = axios.create({ baseURL: configured.replace(/\/+$/, '').replace(/\/api$/, '') + '/api', withCredentials: true, timeout: 45000 });
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('promot_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
export function saveSession(data) { if (data.token) sessionStorage.setItem('promot_token', data.token); }
export function message(error) { return error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The server is taking longer than expected. Please try again.' : 'We could not reach the server. Check your connection and try again.'); }
export const dashboard = role => role === 'creator' ? '/creator-dashboard' : role === 'earner' ? '/earner-dashboard' : '/admin';
export const usd = (amount, digits = 2) => Number(amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits });
