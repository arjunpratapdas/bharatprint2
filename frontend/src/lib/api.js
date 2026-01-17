import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  verifyFirebaseToken: (data) => api.post('/auth/verify-firebase-token', data),
  register: (data) => api.post('/auth/register', data),
};

// Documents API
export const documentsAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: (params) => api.get('/documents/list', { params }),
  get: (id) => api.get(`/documents/${id}`),
  getPublic: (shareLink) => api.get(`/documents/public/${shareLink}`),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Referrals API
export const referralsAPI = {
  getMyCode: () => api.get('/referrals/my-code'),
  claim: (referralCode) => api.post('/referrals/claim', { referralCode }),
};

// Leaderboard API
export const leaderboardAPI = {
  get: (params) => api.get('/leaderboard', { params }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Subscriptions API
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  startTrial: () => api.post('/subscriptions/start-trial'),
  createOrder: (formData) => api.post('/subscriptions/create-order', formData),
  verifyPayment: (formData) => api.post('/subscriptions/verify-payment', formData),
};