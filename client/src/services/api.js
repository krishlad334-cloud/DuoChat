import axios from 'axios';

/**
 * Intelligently resolves the API base URL.
 * Priority:
 * 1. duochat_api_url in localStorage (user-configured in UI)
 * 2. VITE_API_URL from Vite environment variables (set in Vercel/Netlify dashboard)
 * 3. If running on remote domain (e.g. *.vercel.app, *.render.com) and no env var:
 *    default to same-origin `/api`
 * 4. Localhost fallback `http://localhost:5000/api`
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const isMobileOrRemote = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const saved = localStorage.getItem('duochat_api_url');
    if (saved && saved.trim()) {
      // If opened on mobile phone or LAN IP, ignore stale localhost setting that was meant for PC
      if (isMobileOrRemote && (saved.includes('localhost') || saved.includes('127.0.0.1'))) {
        localStorage.removeItem('duochat_api_url');
      } else {
        return normalizeApiUrl(saved.trim());
      }
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return normalizeApiUrl(envUrl.trim());
  }

  if (typeof window !== 'undefined' && window.location) {
    const { origin } = window.location;
    if (origin && origin !== 'null') {
      return `${origin}/api`;
    }
  }

  return 'http://localhost:5000/api';
}

/**
 * Normalizes input URL so it always ends with /api (without double slashes)
 */
export function normalizeApiUrl(url) {
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
}

/**
 * Saves custom backend URL and updates axios instance
 */
export function setCustomApiUrl(url) {
  if (!url || !url.trim()) {
    resetCustomApiUrl();
    return;
  }
  const normalized = normalizeApiUrl(url);
  localStorage.setItem('duochat_api_url', normalized);
  api.defaults.baseURL = normalized;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('duochat:api-url-changed', { detail: normalized }));
  }
}

/**
 * Clears custom URL and reverts to defaults
 */
export function resetCustomApiUrl() {
  localStorage.removeItem('duochat_api_url');
  localStorage.removeItem('duochat_socket_url');
  api.defaults.baseURL = getApiBaseUrl();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('duochat:api-url-changed', { detail: api.defaults.baseURL }));
  }
}

/**
 * Ping backend health endpoint to check responsiveness and latency
 */
export async function testApiConnection(targetUrl) {
  const urlToTest = targetUrl ? normalizeApiUrl(targetUrl) : getApiBaseUrl();
  const startTime = Date.now();
  try {
    const response = await axios.get(`${urlToTest}/health`, {
      timeout: 6000,
      headers: { Accept: 'application/json' }
    });
    const latency = Date.now() - startTime;
    return {
      ok: true,
      latency,
      status: response.status,
      data: response.data
    };
  } catch (err) {
    const latency = Date.now() - startTime;
    return {
      ok: false,
      latency,
      error: err.response?.data?.message || err.message || 'Connection failed'
    };
  }
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token and refresh baseURL dynamically
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('duochat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and network errors with helpful messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('duochat_token');
      localStorage.removeItem('duochat_user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const activeUrl = getApiBaseUrl();
      const friendlyMessage = `Network Error: Cannot connect to server at ${activeUrl}. Please ensure your backend is online or configure Server Settings.`;
      return Promise.reject(new Error(friendlyMessage));
    }

    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  directLogin: (data) => api.post('/auth/direct-login', data),
  getDirectAccounts: () => api.get('/auth/direct-accounts'),
  getNetworkInfo: () => api.get('/network-info'),
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
