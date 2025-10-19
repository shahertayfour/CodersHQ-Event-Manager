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
  if (auth0Client) {
    return auth0Client;
  }

  auth0Client = await auth0.createAuth0Client(AUTH0_CONFIG);

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
}

// Login with Auth0
async function auth0Login() {
  if (!auth0Client) {
    await initAuth0();
  }
  await auth0Client.loginWithRedirect();
}

// Logout from Auth0
async function auth0Logout() {
  if (!auth0Client) {
    await initAuth0();
  }

  await auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });

  // Clear local storage
  localStorage.removeItem('auth0_user');
  localStorage.removeItem('auth0_token');
}

// Get Auth0 token
async function getAuth0Token() {
  if (!auth0Client) {
    await initAuth0();
  }

  try {
    const token = await auth0Client.getTokenSilently();
    localStorage.setItem('auth0_token', token);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);

    // If token expired, redirect to login
    if (error.error === 'login_required' || error.error === 'consent_required') {
      await auth0Login();
    }

    throw error;
  }
}

// Get current Auth0 user
async function getAuth0User() {
  if (!auth0Client) {
    await initAuth0();
  }

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    const user = await auth0Client.getUser();
    localStorage.setItem('auth0_user', JSON.stringify(user));
    return user;
  }

  return null;
}

// Check if user is authenticated
async function isAuth0Authenticated() {
  if (!auth0Client) {
    await initAuth0();
  }

  return auth0Client.isAuthenticated();
}
