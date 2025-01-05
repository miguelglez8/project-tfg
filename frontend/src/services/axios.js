import axios from 'axios';
import { BASE_API } from '../routes/api-routes';

const axiosInstance = axios.create({
  baseURL: BASE_API 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
});

function getToken() {
  return localStorage.getItem('token');
}

export default axiosInstance;
