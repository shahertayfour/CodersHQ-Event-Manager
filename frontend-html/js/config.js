// API Configuration
// Auto-detect environment based on hostname
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost
  ? 'http://localhost:4000/api'
  : 'https://api-dashboard.codershq.ae/api';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data'
};

// API endpoints
const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  SPACES: '/spaces',
  BOOKINGS: '/bookings',
  BOOKINGS_ME: '/bookings/me',
  CALENDAR: '/calendar',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_APPROVE: (id) => `/admin/bookings/${id}/approve`,
  ADMIN_DENY: (id) => `/admin/bookings/${id}/deny`,
  ADMIN_REQUEST_EDIT: (id) => `/admin/bookings/${id}/request-edit`,
  ADMIN_STATS: '/admin/stats'
};
