// Utility functions
const Utils = {
  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format date and time
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Show loading state
  showLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
  },

  // Hide loading state
  hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
  },

  // Show error message
  showError(container, message) {
    container.innerHTML = `
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        ${message}
      </div>
    `;
  },

  // Show success message
  showSuccess(container, message) {
    container.innerHTML = `
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        ${message}
      </div>
    `;
  },

  // Show warning message
  showWarning(container, message) {
    container.innerHTML = `
      <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <strong>⚠️ Admin Requested Changes:</strong><br>
        ${message}
      </div>
    `;
  },

  // Clear messages
  clearMessages(container) {
    container.innerHTML = '';
  },

  // Get status badge color
  getStatusColor(status) {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'DENIED': 'bg-red-100 text-red-800',
      'EDIT_REQUESTED': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  // Format status text
  formatStatus(status) {
    return status.replace('_', ' ');
  }
};
