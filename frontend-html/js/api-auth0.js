// API Client with Auth0 Integration
const API_AUTH0 = {
  async request(endpoint, options = {}) {
    let token;

    try {
      // Get Auth0 token
      token = await getAuth0Token();
    } catch (error) {
      console.error('Error getting token:', error);
      // If can't get token, redirect to login
      window.location.href = '/login-auth0.html';
      throw error;
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(API_URL + endpoint, config);

    if (response.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth0_user');
      localStorage.removeItem('auth0_token');
      window.location.href = '/login-auth0.html';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};

// Auth0 specific utilities
const Auth0Utils = {
  // Get current user from Auth0
  async getCurrentUser() {
    const user = await getAuth0User();

    if (!user) {
      window.location.href = '/login-auth0.html';
      return null;
    }

    return user;
  },

  // Check if user has a specific role
  async hasRole(role) {
    const user = await this.getCurrentUser();

    if (!user) return false;

    // Check Auth0 user metadata for role
    const userRoles = user['https://codershq.ae/roles'] || [];
    return userRoles.includes(role);
  },

  // Logout and redirect
  async logout() {
    await auth0Logout();
  },

  // Get user's display name
  getUserDisplayName(user) {
    return user.name || user.nickname || user.email;
  },

  // Get user's email
  getUserEmail(user) {
    return user.email;
  },

  // Check if email is verified
  isEmailVerified(user) {
    return user.email_verified || false;
  },
};
