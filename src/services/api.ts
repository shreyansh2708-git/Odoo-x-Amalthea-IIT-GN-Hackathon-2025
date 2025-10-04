import axios from 'axios';

// API configuration
export const API_BASE_URL = 'http://localhost:5001/api';

// Create a reusable Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attaches the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles token expiration and refresh
api.interceptors.response.use(
  (response) => response, // Directly return successful responses
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is a 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've attempted a refresh

      try {
        // Call the refresh token endpoint
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Update the token in local storage
        localStorage.setItem('token', data.token);
        
        // Update the authorization header for the original request and retry it
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        
        return api(originalRequest);

      } catch (refreshError) {
        // If the refresh token fails, log the user out
        console.error("Token refresh failed, logging out:", refreshError);
        localStorage.removeItem('token');
        // Redirect to login page. This is a robust way to handle session expiry.
        window.location.href = '/auth'; 
        return Promise.reject(refreshError);
      }
    }
    // For any other errors, just reject the promise
    return Promise.reject(error);
  }
);


// Helper to extract data from Axios response
const handleResponse = (response: any) => response.data;

// --- API Functions refactored to use the new Axios instance ---

// Authentication API
export const login = async (email: string, password: string, role: string) => {
  const response = await api.post('/auth/login', { email, password, role });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return handleResponse(response);
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return handleResponse(response);
};

export const getCurrentUser = () => api.get('/auth/me').then(handleResponse);
export const logout = () => {
    localStorage.removeItem('token');
    return api.post('/auth/logout').then(handleResponse);
};

// Currency API
export const fetchCurrencies = () => api.get('/currency/countries').then(handleResponse);
export const fetchExchangeRates = (baseCurrency: string) => api.get(`/currency/rates/${baseCurrency}`).then(handleResponse);
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return Promise.resolve(amount);
    return api.post('/currency/convert', { amount, fromCurrency, toCurrency }).then(res => res.data.convertedAmount);
};

// Expense API
export const fetchExpenses = (params?: any) => api.get('/expenses', { params }).then(handleResponse);
export const fetchExpenseById = (id: string) => api.get(`/expenses/${id}`).then(handleResponse);
export const submitExpense = (expenseData: any) => api.post('/expenses', expenseData).then(handleResponse);
export const updateExpense = (id: string, expenseData: any) => api.put(`/expenses/${id}`, expenseData).then(handleResponse);
export const submitExpenseForApproval = (id: string) => api.post(`/expenses/${id}/submit`).then(handleResponse);
export const approveExpense = (id: string, comment?: string) => api.post(`/expenses/${id}/approve`, { comment }).then(handleResponse);
export const rejectExpense = (id: string, comment: string) => api.post(`/expenses/${id}/reject`, { comment }).then(handleResponse);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`).then(handleResponse);
export const fetchPendingApprovals = (params?: any) => api.get('/expenses/pending/approvals', { params }).then(handleResponse);

// User Management API
export const fetchUsers = (params?: any) => api.get('/users', { params }).then(handleResponse);
export const createUser = (userData: any) => api.post('/users', userData).then(handleResponse);
export const updateUser = (id: string, userData: any) => api.put(`/users/${id}`, userData).then(handleResponse);
export const deleteUser = (id: string) => api.delete(`/users/${id}`).then(handleResponse);
export const fetchManagers = () => api.get('/users/company/managers').then(handleResponse);

// Dashboard API
export const fetchDashboardStats = (period?: string) => api.get('/dashboard/stats', { params: { period } }).then(handleResponse);
export const fetchRecentExpenses = (limit?: number) => api.get('/dashboard/recent-expenses', { params: { limit } }).then(handleResponse);
export const fetchCategoryBreakdown = (period?: string) => api.get('/dashboard/category-breakdown', { params: { period } }).then(handleResponse);
export const fetchMonthlyTrends = (months?: number) => api.get('/dashboard/monthly-trends', { params: { months } }).then(handleResponse);
export const fetchPendingApprovalsDashboard = (limit?: number) => api.get('/dashboard/pending-approvals', { params: { limit } }).then(handleResponse);

// File Upload API
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(handleResponse);
};

export const uploadMultipleFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(handleResponse);
};

export const processOCR = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(handleResponse);
};

// Workflow API
export const fetchWorkflow = () => api.get('/workflows').then(handleResponse);
export const saveWorkflow = (workflowData: any) => api.post('/workflows', workflowData).then(handleResponse);

// Company API
export const fetchCompany = (id: string) => api.get(`/companies/${id}`).then(handleResponse);
export const updateCompany = (id: string, companyData: any) => api.put(`/companies/${id}`, companyData).then(handleResponse);
