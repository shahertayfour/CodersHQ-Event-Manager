// Login page logic
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated with Auth0
  const isAuth0Logged = await Auth.isAuth0Authenticated();
  if (isAuth0Logged || Auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');
  const auth0LoginBtn = document.getElementById('auth0LoginBtn');

  // Auth0 Login Button
  auth0LoginBtn.addEventListener('click', async () => {
    try {
      Utils.showLoading(auth0LoginBtn);
      await Auth.auth0Login();
    } catch (error) {
      Utils.hideLoading(auth0LoginBtn);
      Utils.showError(messageDiv, 'Auth0 login failed. Please try again.');
      console.error('Auth0 login error:', error);
    }
  });

  // Traditional Email/Password Login
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
