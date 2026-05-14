import axios from 'axios';

const API = axios.create({
  baseURL: 'https://TON-DOMAINE.ngrok-free.app/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Attacher le token à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth API ---

export const registerUser = async (data) => {
  const response = await API.post('/register', {
    nom: data.lastName,
    prenom: data.firstName,
    email: data.email,
    telephone: data.Telephone,
    password: data.password,
    c_password: data.password_confirmation,
  });
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
  const response = await API.post('/profile/verify/send');
  return response.data;
};

export const verifyEmail = async (id, hash) => {
  const response = await API.get(`/verify/${id}/${hash}`);
  return response.data;
};

export default API;
