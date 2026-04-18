import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: " https://ram-final-backend-1.onrender.com/" ,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
