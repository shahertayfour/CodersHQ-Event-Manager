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
      <div style="background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
        ${message}
      </div>
    `;
  },

  // Show success message
  showSuccess(container, message) {
    container.innerHTML = `
      <div style="background: #d1fae5; border: 1px solid #10b981; color: #065f46; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
        ${message}
      </div>
    `;
  },

  // Show warning message
  showWarning(container, message) {
    container.innerHTML = `
      <div style="background: #dbeafe; border: 1px solid #3b82f6; color: #1e40af; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
        <strong>⚠️ Admin Requested Changes:</strong><br>
        ${message}
      </div>
    `;
  },

  // Clear messages
  clearMessages(container) {
    container.innerHTML = '';
  },

  // Get status badge color (Tailwind - for backward compatibility)
  getStatusColor(status) {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'DENIED': 'bg-red-100 text-red-800',
      'EDIT_REQUESTED': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  // Get status badge class (Design System)
  getStatusBadgeClass(status) {
    const classes = {
      'PENDING': 'badge-warning',
      'APPROVED': 'badge-success',
      'DENIED': 'badge-error',
      'EDIT_REQUESTED': 'badge-info'
    };
    return `badge ${classes[status] || 'badge-neutral'}`;
  },

  // Format status text
  formatStatus(status) {
    return status.replace('_', ' ');
  }
};
