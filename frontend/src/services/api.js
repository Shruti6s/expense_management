import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

// User API
export const userAPI = {
  createUser: (data) => api.post('/users', data),
  getAllUsers: () => api.get('/users'),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  getManagers: () => api.get('/users/managers')
};

// Expense API
export const expenseAPI = {
  createExpense: (data) => api.post('/expenses', data),
  uploadReceipt: (formData) => api.post('/expenses/upload-receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyExpenses: () => api.get('/expenses/my-expenses'),
  getPendingApprovals: () => api.get('/expenses/pending-approvals'),
  approveOrReject: (approvalId, data) => api.put(`/expenses/approvals/${approvalId}`, data),
  getAllExpenses: () => api.get('/expenses/all')
};

// Approval Rule API
export const approvalRuleAPI = {
  createRule: (data) => api.post('/approval-rules', data),
  getRules: () => api.get('/approval-rules'),
  updateRule: (ruleId, data) => api.put(`/approval-rules/${ruleId}`, data),
  deleteRule: (ruleId) => api.delete(`/approval-rules/${ruleId}`)
};

export default api;
