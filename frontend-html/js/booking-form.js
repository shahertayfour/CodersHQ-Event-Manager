// Booking form page logic
let editingBookingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication
  if (!await Auth.requireAuth()) return;

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

  // Pre-fill user data if available
  const user = Auth.getUser();
  if (user) {
    if (user.firstName) document.getElementById('firstName').value = user.firstName;
    if (user.lastName) document.getElementById('lastName').value = user.lastName;
    if (user.email) document.getElementById('email').value = user.email;
    if (user.phoneNumber) document.getElementById('phoneNumber').value = user.phoneNumber;
    if (user.entity) document.getElementById('entity').value = user.entity;
    if (user.jobTitle) document.getElementById('jobTitle').value = user.jobTitle;
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

    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const entity = document.getElementById('entity').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();

    // Get selected seating arrangement (radio button)
    const seatingRadio = document.querySelector('input[name="seating"]:checked');
    if (!seatingRadio) {
      Utils.showError(messageDiv, 'Please select a seating arrangement.');
      return;
    }

    // Combine date and time for start and end
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const time = document.getElementById('time').value;

    if (!startDate || !endDate || !time) {
      Utils.showError(messageDiv, 'Please provide start date, end date, and time.');
      return;
    }

    // Create datetime strings
    const startDateTime = new Date(`${startDate}T${time}`);
    const endDateTime = new Date(`${endDate}T${time}`);

    const formData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      entity,
      jobTitle,
      eventName: document.getElementById('eventName').value,
      spaceId: document.getElementById('spaceId').value,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      attendees: parseInt(document.getElementById('attendees').value),
      seating: seatingRadio.value,
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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.entity || !formData.jobTitle) {
      Utils.showError(messageDiv, 'Please fill in all required personal information fields.');
      return;
    }

    // Validate dates
    if (startDateTime >= endDateTime) {
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
        Utils.showSuccess(messageDiv, 'Booking request submitted successfully! A confirmation email will be sent within 3-7 working days.');
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
    document.getElementById('agenda').value = booking.agenda || '';
    document.getElementById('visibility').value = booking.visibility || 'PUBLIC';
    document.getElementById('comments').value = booking.comments || '';

    // Set seating radio button
    if (booking.seating) {
      const seatingRadio = document.querySelector(`input[name="seating"][value="${booking.seating}"]`);
      if (seatingRadio) seatingRadio.checked = true;
    }

    // Set date and time values
    if (booking.startDate) {
      const start = new Date(booking.startDate);
      document.getElementById('startDate').value = start.toISOString().split('T')[0];
      document.getElementById('time').value = start.toTimeString().slice(0, 5);
    }
    if (booking.endDate) {
      const end = new Date(booking.endDate);
      document.getElementById('endDate').value = end.toISOString().split('T')[0];
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
