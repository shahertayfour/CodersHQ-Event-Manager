// Booking form page logic
document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication
  if (!Auth.requireAuth()) return;

  const form = document.getElementById('bookingForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');
  const spaceSelect = document.getElementById('spaceId');

  // Load available spaces
  try {
    const spaces = await API.get(ENDPOINTS.SPACES);

    spaces.forEach(space => {
      const option = document.createElement('option');
      option.value = space.id;
      option.textContent = `${space.name} (Capacity: ${space.capacity})`;
      spaceSelect.appendChild(option);
    });
  } catch (error) {
    Utils.showError(messageDiv, 'Failed to load spaces. Please refresh the page.');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearMessages(messageDiv);

    // Get current user info
    const user = Auth.getUser();

    const formData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      entity: user.entity || '',
      jobTitle: user.jobTitle || '',
      eventName: document.getElementById('eventName').value,
      spaceId: document.getElementById('spaceId').value,
      startDate: new Date(document.getElementById('startDate').value).toISOString(),
      endDate: new Date(document.getElementById('endDate').value).toISOString(),
      attendees: parseInt(document.getElementById('attendees').value),
      seating: document.getElementById('seating').value,
      agenda: document.getElementById('agenda').value,
      valet: document.getElementById('valet')?.checked || false,
      catering: document.getElementById('catering')?.checked || false,
      photography: document.getElementById('photography')?.checked || false,
      itSupport: document.getElementById('itSupport')?.checked || false,
      screensDisplay: document.getElementById('screensDisplay')?.checked || false,
      visibility: document.getElementById('visibility').value,
      comments: document.getElementById('comments').value || undefined,
    };

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.entity || !formData.jobTitle) {
      Utils.showError(messageDiv, 'Please complete your profile first. Contact information is required for bookings.');
      return;
    }

    // Validate dates
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      Utils.showError(messageDiv, 'End date must be after start date.');
      return;
    }

    Utils.showLoading(submitBtn);

    try {
      await API.post(ENDPOINTS.BOOKINGS, formData);

      Utils.showSuccess(messageDiv, 'Booking request submitted successfully! Redirecting to dashboard...');

      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
    } catch (error) {
      Utils.hideLoading(submitBtn);
      Utils.showError(messageDiv, error.message || 'Failed to submit booking request. Please try again.');
    }
  });
});
