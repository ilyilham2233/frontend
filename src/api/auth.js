import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ice-universe-reason.ngrok-free.dev/api',
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

// --- Password Reset ---

export const requestPasswordReset = async (email) => {
  const response = await API.post('/password/email', { email });
  return response.data;
};

export const validateResetToken = async (token, email) => {
  const response = await API.get(`/password/reset/${token}`, {
    params: { email },
  });
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await API.post('/password/update', data);
  return response.data;

};

export const updateResetPassword = updatePassword;

// --- Email Verification ---

export const sendVerificationEmail = async () => {
  const response = await API.post('/profile/verify/send');
  return response.data;
};

export const verifyEmail = async (id, hash) => {
  const response = await API.get(`/verify/${id}/${hash}`);
  return response.data;
};
export const updateProfile = async (data) => {
  const response = await API.post('/profile/update', data);
  return response.data;
};

export default API;
