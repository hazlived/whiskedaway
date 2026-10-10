import axios from 'axios';

const isProd = import.meta.env.PROD || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');

const DEFAULT_API_URL = isProd
  ? 'https://whiskedaway.onrender.com/api'
  : '/api';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export default axiosClient;
