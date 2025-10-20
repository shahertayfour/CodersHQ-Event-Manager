// Booking form page logic
let editingBookingId = null;

// Helper function to show inline error
function showInlineError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }

  if (inputElement) {
    inputElement.classList.add('border-red-500');
    inputElement.classList.remove('border-gray-300');
  }
}

// Helper function to clear inline error
function clearInlineError(fieldId) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  }

  if (inputElement) {
    inputElement.classList.remove('border-red-500');
    inputElement.classList.add('border-gray-300');
  }
}

// Validate date/time combination
function validateDateTime() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  let isValid = true;

  // Clear previous errors
  clearInlineError('startDate');
  clearInlineError('endDate');
  clearInlineError('startTime');
  clearInlineError('endTime');

  // Check if all fields are filled
  if (!startDate || !endDate || !startTime || !endTime) {
    return true; // Don't validate until all fields are filled
  }

  // Create datetime objects
  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);

  // Check if start DATE is in the past (not time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDateOnly = new Date(startDate);
  startDateOnly.setHours(0, 0, 0, 0);

  if (startDateOnly < today) {
    showInlineError('startDate', 'Start date cannot be in the past');
    isValid = false;
  }

  // Check if end is after start
  if (startDateTime >= endDateTime) {
    showInlineError('endDate', 'End date/time must be after start date/time');
    showInlineError('endTime', 'End time must be after start time');
    isValid = false;
  }

  // Check minimum duration (at least 15 minutes)
  const durationMinutes = (endDateTime - startDateTime) / (1000 * 60);
  if (durationMinutes < 15 && durationMinutes > 0) {
    showInlineError('endTime', 'Event must be at least 15 minutes long');
    isValid = false;
  }

  return isValid;
}

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

  // Add real-time validation for date and time fields
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const startTimeInput = document.getElementById('startTime');
  const endTimeInput = document.getElementById('endTime');

  // Validate on change for date/time fields
  [startDateInput, endDateInput, startTimeInput, endTimeInput].forEach(input => {
    if (input) {
      input.addEventListener('change', validateDateTime);
      input.addEventListener('blur', validateDateTime);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearMessages(messageDiv);

    // Clear all inline errors first
    ['startDate', 'endDate', 'startTime', 'endTime', 'seating'].forEach(clearInlineError);

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
      const seatingError = document.getElementById('seating-error');
      if (seatingError) {
        seatingError.textContent = 'Please select a seating arrangement';
        seatingError.classList.remove('hidden');
      }
      Utils.showError(messageDiv, 'Please select a seating arrangement.');
      // Scroll to seating section
      document.querySelector('input[name="seating"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Get date and time values
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (!startDate || !endDate || !startTime || !endTime) {
      Utils.showError(messageDiv, 'Please provide start date, end date, start time, and end time.');
      // Scroll to first empty field
      if (!startDate) document.getElementById('startDate')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (!endDate) document.getElementById('endDate')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (!startTime) document.getElementById('startTime')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (!endTime) document.getElementById('endTime')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validate date/time combination
    if (!validateDateTime()) {
      Utils.showError(messageDiv, 'Please fix the date and time errors before submitting.');
      // Scroll to first error
      document.getElementById('startDate')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Create datetime strings
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    // Get visibility selection
    const visibilityRadio = document.querySelector('input[name="visibility"]:checked');
    const visibility = visibilityRadio ? visibilityRadio.value : 'PUBLIC';

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
      visibility: visibility,
      comments: document.getElementById('comments').value || undefined,
    };

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.entity || !formData.jobTitle) {
      Utils.showError(messageDiv, 'Please fill in all required personal information fields.');
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
        Utils.showSuccess(messageDiv, 'Booking request submitted successfully! A confirmation email will be sent within 1 working day.');
      }

      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
    } catch (error) {
      Utils.hideLoading(submitBtn);

      // Try to parse error message and show inline errors if possible
      const errorMsg = error.message || 'Failed to submit booking request. Please try again.';
      Utils.showError(messageDiv, errorMsg);

      // Scroll to top to show error message
      messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    document.getElementById('comments').value = booking.comments || '';

    // Set seating radio button
    if (booking.seating) {
      const seatingRadio = document.querySelector(`input[name="seating"][value="${booking.seating}"]`);
      if (seatingRadio) seatingRadio.checked = true;
    }

    // Set visibility radio button
    if (booking.visibility) {
      const visibilityRadio = document.querySelector(`input[name="visibility"][value="${booking.visibility}"]`);
      if (visibilityRadio) visibilityRadio.checked = true;
    }

    // Set date and time values
    if (booking.startDate) {
      const start = new Date(booking.startDate);
      document.getElementById('startDate').value = start.toISOString().split('T')[0];
      document.getElementById('startTime').value = start.toTimeString().slice(0, 5);
    }
    if (booking.endDate) {
      const end = new Date(booking.endDate);
      document.getElementById('endDate').value = end.toISOString().split('T')[0];
      document.getElementById('endTime').value = end.toTimeString().slice(0, 5);
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
