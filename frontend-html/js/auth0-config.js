// Auth0 Configuration
const AUTH0_CONFIG = {
  domain: 'dev-xe28o7hidn60e8gj.us.auth0.com',
  clientId: 'ChGz7zhiQlhylJZYNXkdttCrROs26MrN',
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback.html',
    audience: 'https://dev-xe28o7hidn60e8gj.us.auth0.com/api/v2/',
    scope: 'openid profile email'
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true
};

let auth0Client = null;

// Initialize Auth0 Client
async function initAuth0() {
  try {
    if (auth0Client) {
      return auth0Client;
    }

    // Check if Auth0 SDK is loaded
    if (typeof auth0 === 'undefined' || !auth0.createAuth0Client) {
      console.warn('Auth0 SDK not loaded');
      return { isAuthenticated: false };
    }

    auth0Client = await auth0.createAuth0Client(AUTH0_CONFIG);

    // Check if we're on the callback page
    if (window.location.pathname === '/callback.html') {
      // Let callback.html handle the redirect
      return { isAuthenticated: false };
    }

    // Check if user is authenticated
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0Client.getUser();
      const token = await auth0Client.getTokenSilently();

      // Store user and token
      localStorage.setItem('auth0_user', JSON.stringify(user));
      localStorage.setItem('auth0_token', token);

      return { isAuthenticated: true, user, token };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error initializing Auth0:', error);
    return { isAuthenticated: false };
  }
}

// Login with Auth0
async function auth0Login() {
  try {
    if (!auth0Client) {
      await initAuth0();
    }
    if (auth0Client) {
      await auth0Client.loginWithRedirect({
        authorizationParams: {
          screen_hint: 'login'
        }
      });
    }
  } catch (error) {
    console.error('Auth0 login error:', error);
    throw error;
  }
}

// Signup with Auth0
async function auth0Signup() {
  try {
    if (!auth0Client) {
      await initAuth0();
    }
    if (auth0Client) {
      await auth0Client.loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    }
  } catch (error) {
    console.error('Auth0 signup error:', error);
    throw error;
  }
}

// Logout from Auth0
async function auth0Logout() {
  try {
    if (!auth0Client) {
      await initAuth0();
    }

    if (auth0Client) {
      await auth0Client.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    }

    // Clear local storage
    localStorage.removeItem('auth0_user');
    localStorage.removeItem('auth0_token');
  } catch (error) {
    console.error('Auth0 logout error:', error);
    throw error;
  }
}

// Get Auth0 token
async function getAuth0Token() {
  try {
    if (!auth0Client) {
      await initAuth0();
    }

    if (!auth0Client) {
      return null;
    }

    const token = await auth0Client.getTokenSilently();
    localStorage.setItem('auth0_token', token);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);

    // If token expired, redirect to login
    if (error.error === 'login_required' || error.error === 'consent_required') {
      await auth0Login();
    }

    return null;
  }
}

// Get current Auth0 user
async function getAuth0User() {
  try {
    if (!auth0Client) {
      await initAuth0();
    }

    if (!auth0Client) {
      return null;
    }

    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0Client.getUser();
      localStorage.setItem('auth0_user', JSON.stringify(user));
      return user;
    }

    return null;
  } catch (error) {
    console.error('Error getting Auth0 user:', error);
    return null;
  }
}

// Check if user is authenticated
async function isAuth0Authenticated() {
  try {
    if (!auth0Client) {
      await initAuth0();
    }

    if (!auth0Client) {
      return false;
    }

    return auth0Client.isAuthenticated();
  } catch (error) {
    console.error('Error checking Auth0 authentication:', error);
    return false;
  }
}
