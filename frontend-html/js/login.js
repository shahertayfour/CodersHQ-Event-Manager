// Login page logic
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  if (Auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');
  const auth0LoginBtn = document.getElementById('auth0LoginBtn');

  // Auth0 Embedded Login - Authenticate with Auth0 via backend
  auth0LoginBtn.addEventListener('click', async () => {
    Utils.clearMessages(messageDiv);

    // Get email and password from form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      Utils.showError(messageDiv, 'Please enter your email and password to login with Auth0.');
      return;
    }

    Utils.showLoading(auth0LoginBtn);

    try {
      // Authenticate with Auth0 via backend
      const response = await API.post('/auth/auth0/login', {
        email,
        password
      });

      // Store token and user data
      Auth.setToken(response.access_token);
      Auth.setUser(response.user);

      Utils.showSuccess(messageDiv, 'Login successful! Redirecting...');

      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } catch (error) {
      Utils.hideLoading(auth0LoginBtn);
      Utils.showError(messageDiv, error.message || 'Auth0 login failed. Please check your credentials.');
      console.error('Auth0 login error:', error);
    }
  });

  // Traditional Email/Password Login (Local Database)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearMessages(messageDiv);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    Utils.showLoading(submitBtn);

    try {
      const response = await API.post(ENDPOINTS.LOGIN, { email, password });

      // Store token and user data
      Auth.setToken(response.access_token);
      Auth.setUser(response.user);

      // Handle remember me
      if (remember) {
        localStorage.setItem('remember_me', 'true');
      }

      Utils.showSuccess(messageDiv, 'Login successful! Redirecting...');

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } catch (error) {
      Utils.hideLoading(submitBtn);
      Utils.showError(messageDiv, error.message || 'Login failed. Please check your credentials.');
    }
  });
});
