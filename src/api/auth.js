import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ice-universe-reason.ngrok-free.dev',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: true,
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth API ---

export const registerUser = async (data) => {
  const response = await API.post('/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await API.post('/login', data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post('/logout');
  return response.data;
};

// --- Email Verification ---

export const sendVerificationEmail = async () => {
  const response = await API.post('/profil/vérifier/envoyer');
  return response.data;
};

export const verifyEmail = async (id, hash) => {
  const response = await API.get(`/verify/${id}/${hash}`);
  return response.data;
};

export default API;
