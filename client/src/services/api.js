import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('duochat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and trigger event if needed
      localStorage.removeItem('duochat_token');
      localStorage.removeItem('duochat_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const chatAPI = {
  getChats: () => api.get('/chats'),
  createDirect: (targetUserId) => api.post('/chats/direct', { targetUserId }),
  createGroup: (title, memberIds) => api.post('/chats/group', { title, memberIds }),
  getChatDetails: (id) => api.get(`/chats/${id}`),
  addMember: (chatId, userId) => api.post(`/chats/${chatId}/members`, { userId }),
  removeMember: (chatId, userId) => api.delete(`/chats/${chatId}/members/${userId}`),
  markAsRead: (chatId, lastMessageId) => api.post(`/chats/${chatId}/read`, { lastMessageId }),
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
  clearChat: (chatId) => api.post(`/chats/${chatId}/clear`),
  archiveChat: (chatId, isArchived) => api.post(`/chats/${chatId}/archive`, { isArchived }),
  muteChat: (chatId, isMuted) => api.post(`/chats/${chatId}/mute`, { isMuted }),
  pinChat: (chatId, isPinned) => api.post(`/chats/${chatId}/pin`, { isPinned }),
  markAsUnread: (chatId) => api.post(`/chats/${chatId}/unread`),
};

export const messageAPI = {
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const userAPI = {
  search: (q) => api.get('/users/search', { params: { q } }),
  lookupPhone: (phone) => api.get('/users/lookup', { params: { phone } }),
  getAll: () => api.get('/users'),
};

export default api;
