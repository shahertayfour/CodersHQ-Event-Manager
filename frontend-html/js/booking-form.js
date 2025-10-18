// Booking form page logic
let editingBookingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication
  if (!Auth.requireAuth()) return;

  const form = document.getElementById('bookingForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');
  const spaceSelect = document.getElementById('spaceId');

  // Check if we're editing an existing booking
  const urlParams = new URLSearchParams(window.location.search);
  editingBookingId = urlParams.get('edit');

  // Update page title if editing
  if (editingBookingId) {
    const title = document.querySelector('h1');
    if (title) title.textContent = 'Edit Booking';
    submitBtn.textContent = 'Update Booking';
  }

  // Load available spaces
  try {
    const spaces = await API.get(ENDPOINTS.SPACES);

    spaces.forEach(space => {
      const option = document.createElement('option');
      option.value = space.id;
      option.textContent = `${space.name} (Capacity: ${space.capacity})`;
      spaceSelect.appendChild(option);
    });

    // If editing, load the existing booking data
    if (editingBookingId) {
      await loadBookingData(editingBookingId, messageDiv);
    }
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
      if (editingBookingId) {
        // Update existing booking
        await API.request(`${ENDPOINTS.BOOKINGS}/${editingBookingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        Utils.showSuccess(messageDiv, 'Booking updated successfully! Redirecting to dashboard...');
      } else {
        // Create new booking
        await API.post(ENDPOINTS.BOOKINGS, formData);
        Utils.showSuccess(messageDiv, 'Booking request submitted successfully! Redirecting to dashboard...');
      }

      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
    } catch (error) {
      Utils.hideLoading(submitBtn);
      Utils.showError(messageDiv, error.message || 'Failed to submit booking request. Please try again.');
    }
  });
});

async function loadBookingData(bookingId, messageDiv) {
  try {
    const booking = await API.get(`${ENDPOINTS.BOOKINGS}/${bookingId}`);

    // Populate form fields
    document.getElementById('eventName').value = booking.eventName || '';
    document.getElementById('spaceId').value = booking.spaceId || '';
    document.getElementById('attendees').value = booking.attendees || '';
    document.getElementById('seating').value = booking.seating || 'THEATRE';
    document.getElementById('agenda').value = booking.agenda || '';
    document.getElementById('visibility').value = booking.visibility || 'PUBLIC';
    document.getElementById('comments').value = booking.comments || '';

    // Set date values (convert from ISO to datetime-local format)
    if (booking.startDate) {
      const start = new Date(booking.startDate);
      document.getElementById('startDate').value = start.toISOString().slice(0, 16);
    }
    if (booking.endDate) {
      const end = new Date(booking.endDate);
      document.getElementById('endDate').value = end.toISOString().slice(0, 16);
    }

    // Set checkboxes
    if (document.getElementById('valet')) document.getElementById('valet').checked = booking.valet || false;
    if (document.getElementById('catering')) document.getElementById('catering').checked = booking.catering || false;
    if (document.getElementById('photography')) document.getElementById('photography').checked = booking.photography || false;
    if (document.getElementById('itSupport')) document.getElementById('itSupport').checked = booking.itSupport || false;
    if (document.getElementById('screensDisplay')) document.getElementById('screensDisplay').checked = booking.screensDisplay || false;

    // Show admin comment if exists
    if (booking.adminComment) {
      Utils.showWarning(messageDiv, `Admin Note: ${booking.adminComment}`);
    }
  } catch (error) {
    Utils.showError(messageDiv, 'Failed to load booking data. Redirecting to dashboard...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 2000);
  }
}
