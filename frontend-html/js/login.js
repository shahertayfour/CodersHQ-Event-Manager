// Login page logic
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (Auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearMessages(messageDiv);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    Utils.showLoading(submitBtn);

    try {
      const response = await API.post(ENDPOINTS.LOGIN, { email, password });

      // Store token and user data
      Auth.setToken(response.access_token);
      Auth.setUser(response.user);

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
