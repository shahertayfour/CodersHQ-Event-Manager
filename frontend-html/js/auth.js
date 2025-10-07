// Authentication utilities
const Auth = {
  // Get stored token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Store token
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  // Get current user
  getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  // Store user data
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Check if user is logged in
  isAuthenticated() {
    return !!this.getToken();
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'ADMIN';
  },

  // Logout
  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = '/index.html';
  },

  // Require authentication (redirect if not logged in)
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  // Require admin (redirect if not admin)
  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isAdmin()) {
      window.location.href = '/dashboard.html';
      return false;
    }
    return true;
  }
};
