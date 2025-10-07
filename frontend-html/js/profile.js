// Profile page logic
document.addEventListener('DOMContentLoaded', () => {
  // Require authentication
  if (!Auth.requireAuth()) return;

  const form = document.getElementById('profileForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');

  // Load current user data
  const user = Auth.getUser();

  document.getElementById('firstName').value = user.firstName || '';
  document.getElementById('lastName').value = user.lastName || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phoneNumber').value = user.phoneNumber || '';
  document.getElementById('entity').value = user.entity || '';
  document.getElementById('jobTitle').value = user.jobTitle || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearMessages(messageDiv);

    const formData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      entity: document.getElementById('entity').value.trim(),
      jobTitle: document.getElementById('jobTitle').value.trim(),
    };

    Utils.showLoading(submitBtn);

    try {
      // Update profile via API
      const response = await API.patch('/auth/profile', formData);

      // Update stored user data
      Auth.setUser(response.user || response);

      Utils.showSuccess(messageDiv, 'Profile updated successfully!');
      Utils.hideLoading(submitBtn);

      // Refresh navigation to show updated name
      renderNavigation();
    } catch (error) {
      Utils.hideLoading(submitBtn);
      Utils.showError(messageDiv, error.message || 'Failed to update profile. Please try again.');
    }
  });
});
