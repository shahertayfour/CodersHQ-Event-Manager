// Authentication utilities
const Auth = {
  // Get stored token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('auth0_token');
  },

  // Store token
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  // Get current user
  getUser() {
    // Try traditional auth first
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (user) return JSON.parse(user);

    // Fall back to Auth0 user
    const auth0User = localStorage.getItem('auth0_user');
    return auth0User ? JSON.parse(auth0User) : null;
  },

  // Store user data
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Check if user is logged in
  isAuthenticated() {
    return !!this.getToken();
  },

  // Check if user is authenticated with Auth0
  async isAuth0Authenticated() {
    try {
      if (typeof auth0Client === 'undefined' || !auth0Client) {
        if (typeof initAuth0 === 'function') {
          const result = await initAuth0();
          return result.isAuthenticated || false;
        }
        return false;
      }
      return await auth0Client.isAuthenticated();
    } catch (error) {
      console.error('Error checking Auth0 authentication:', error);
      return false;
    }
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user && (user.role === 'ADMIN' || user['https://codershq.ae/roles']?.includes('admin'));
  },

  // Auth0 Login
  async auth0Login() {
    try {
      if (typeof auth0Login === 'function') {
        await auth0Login();
      } else if (typeof initAuth0 === 'function') {
        await initAuth0();
        if (auth0Client) {
          await auth0Client.loginWithRedirect({
            authorizationParams: {
              screen_hint: 'login'
            }
          });
        }
      }
    } catch (error) {
      console.error('Auth0 login error:', error);
      throw error;
    }
  },

  // Auth0 Signup
  async auth0Signup() {
    try {
      if (typeof auth0Login === 'function') {
        await initAuth0();
        if (auth0Client) {
          await auth0Client.loginWithRedirect({
            authorizationParams: {
              screen_hint: 'signup'
            }
          });
        }
      }
    } catch (error) {
      console.error('Auth0 signup error:', error);
      throw error;
    }
  },

  // Logout
  async logout() {
    // Check if using Auth0
    const isAuth0 = !!localStorage.getItem('auth0_token');

    // Clear all tokens
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('auth0_user');
    localStorage.removeItem('auth0_token');
    localStorage.removeItem('remember_me');

    // If Auth0, use Auth0 logout
    if (isAuth0 && typeof auth0Client !== 'undefined' && auth0Client) {
      try {
        await auth0Client.logout({
          logoutParams: {
            returnTo: window.location.origin
          }
        });
        return;
      } catch (error) {
        console.error('Auth0 logout error:', error);
      }
    }

    // Otherwise redirect to home
    window.location.href = '/index.html';
  },

  // Require authentication (redirect if not logged in)
  async requireAuth() {
    const isAuth0 = await this.isAuth0Authenticated();
    if (!this.isAuthenticated() && !isAuth0) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  // Require admin (redirect if not admin)
  async requireAdmin() {
    const authenticated = await this.requireAuth();
    if (!authenticated) return false;
    if (!this.isAdmin()) {
      window.location.href = '/dashboard.html';
      return false;
    }
    return true;
  }
};
