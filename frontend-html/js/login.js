// Login page logic
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  if (Auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const githubLoginBtn = document.getElementById('githubLoginBtn');

  // Google Login
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      try {
        await Auth.auth0LoginWithConnection('google-oauth2');
      } catch (error) {
        Utils.showError(messageDiv, error.message || 'Google login failed');
      }
    });
  }

  // GitHub Login
  if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', async () => {
      try {
        await Auth.auth0LoginWithConnection('github');
      } catch (error) {
        Utils.showError(messageDiv, error.message || 'GitHub login failed');
      }
    });
  }

  // Email/Password Login
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
