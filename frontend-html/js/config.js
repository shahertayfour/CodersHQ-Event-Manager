// API Configuration
// Auto-detect environment based on hostname
const API_URL = window.location.hostname === 'dashboard.codershq.ae'
  ? 'https://api-dashboard.codershq.ae/api'
  : 'http://localhost:4000/api';

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
