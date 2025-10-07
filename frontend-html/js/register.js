// Register page logic
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (Auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('registerForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearMessages(messageDiv);

    const formData = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };

    // Add optional fields only if they have values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const entity = document.getElementById('entity').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();

    if (firstName) formData.firstName = firstName;
    if (lastName) formData.lastName = lastName;
    if (phoneNumber) formData.phoneNumber = phoneNumber;
    if (entity) formData.entity = entity;
    if (jobTitle) formData.jobTitle = jobTitle;

    Utils.showLoading(submitBtn);

    try {
      const response = await API.post(ENDPOINTS.REGISTER, formData);

      // Store token and user data
      Auth.setToken(response.access_token);
      Auth.setUser(response.user);

      Utils.showSuccess(messageDiv, 'Account created successfully! Redirecting...');

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } catch (error) {
      Utils.hideLoading(submitBtn);
      Utils.showError(messageDiv, error.message || 'Registration failed. Please try again.');
    }
  });
});
