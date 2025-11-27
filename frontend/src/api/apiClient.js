import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/update-profile', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
  update: (id, data) => apiClient.put(`/orders/${id}`, data),
  delete: (id) => apiClient.delete(`/orders/${id}`),
};

// SKUs API
export const skusAPI = {
  getAll: (params) => apiClient.get('/skus', { params }),
  getById: (id) => apiClient.get(`/skus/${id}`),
  create: (data) => apiClient.post('/skus', data),
  update: (id, data) => apiClient.put(`/skus/${id}`, data),
  delete: (id) => apiClient.delete(`/skus/${id}`),
};

// Buyers API
export const buyersAPI = {
  getAll: (params) => apiClient.get('/buyers', { params }),
  getById: (id) => apiClient.get(`/buyers/${id}`),
  create: (data) => apiClient.post('/buyers', data),
  update: (id, data) => apiClient.put(`/buyers/${id}`, data),
  delete: (id) => apiClient.delete(`/buyers/${id}`),
};

// Shipments API
export const shipmentsAPI = {
  getAll: (params) => apiClient.get('/shipments', { params }),
  getById: (id) => apiClient.get(`/shipments/${id}`),
  create: (data) => apiClient.post('/shipments', data),
  update: (id, data) => apiClient.put(`/shipments/${id}`, data),
  track: (id) => apiClient.get(`/shipments/${id}/track`),
};

// Documents API
export const docsAPI = {
  generateInvoice: (orderId) => apiClient.get(`/docs/order/${orderId}/invoice`, { responseType: 'blob' }),
  generatePackingList: (orderId) => apiClient.get(`/docs/order/${orderId}/packing-list`, { responseType: 'blob' }),
  generateCOO: (orderId) => apiClient.get(`/docs/order/${orderId}/certificate-of-origin`, { responseType: 'blob' }),
  generateBL: (shipmentId) => apiClient.get(`/docs/shipment/${shipmentId}/bill-of-lading`, { responseType: 'blob' }),
  getOrderDocs: (orderId) => apiClient.get(`/docs/order/${orderId}`),
  upload: (formData) => apiClient.post('/docs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// AI API
export const aiAPI = {
  classifyHS: (description) => apiClient.post('/ai/hs-classify', { description }),
  docSummary: (orderId) => apiClient.post('/ai/doc-summary', { orderId }),
  businessInsights: (timeframe) => apiClient.post('/ai/business-insights', { timeframe }),
  suggestImprovements: (orderId) => apiClient.post('/ai/suggest-improvements', { orderId }),
};

// Reports API
export const reportsAPI = {
  sales: (params) => apiClient.get('/reports/sales', { params }),
  pendingShipments: () => apiClient.get('/reports/pending-shipments'),
  pendingDocuments: () => apiClient.get('/reports/pending-documents'),
  leadTimes: () => apiClient.get('/reports/lead-times'),
  exportCSV: (params) => apiClient.get('/reports/export-csv', { params, responseType: 'blob' }),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params) => apiClient.get('/inventory', { params }),
  reserve: (data) => apiClient.post('/inventory/reserve', data),
  adjust: (data) => apiClient.post('/inventory/adjust', data),
  create: (data) => apiClient.post('/inventory', data),
};

// Quotes API
export const quotesAPI = {
  getAll: (params) => apiClient.get('/quotes', { params }),
  getById: (id) => apiClient.get(`/quotes/${id}`),
  create: (data) => apiClient.post('/quotes', data),
  update: (id, data) => apiClient.put(`/quotes/${id}`, data),
  delete: (id) => apiClient.delete(`/quotes/${id}`),
  calculateLandedCost: (data) => apiClient.post('/quotes/landed-cost', data),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => apiClient.get('/transactions', { params }),
  create: (data) => apiClient.post('/transactions', data),
};

// Import API
export const importAPI = {
  orders: (formData) => apiClient.post('/import/orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  skus: (formData) => apiClient.post('/import/skus', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Users API
export const usersAPI = {
  getAll: (params) => apiClient.get('/users', { params }),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
};

export default apiClient;
