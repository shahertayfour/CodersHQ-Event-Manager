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
  let spacesData = [];
  try {
    spacesData = await API.get(ENDPOINTS.SPACES);

    spacesData.forEach(space => {
      const option = document.createElement('option');
      option.value = space.id;
      option.textContent = `${space.name} (Capacity: ${space.capacity})`;
      option.dataset.spaceName = space.name;
      spaceSelect.appendChild(option);
    });

    // If editing, load the existing booking data
    if (editingBookingId) {
      await loadBookingData(editingBookingId, messageDiv);
    }
  } catch (error) {
    Utils.showError(messageDiv, 'Failed to load spaces. Please refresh the page.');
  }

  // Handle space selection change to show/hide Lecture Room fields
  const lectureRoomFields = document.getElementById('lectureRoomFields');

  spaceSelect.addEventListener('change', () => {
    const selectedOption = spaceSelect.options[spaceSelect.selectedIndex];
    const spaceName = selectedOption?.dataset.spaceName || '';

    if (spaceName === 'Lecture Room') {
      lectureRoomFields.classList.remove('hidden');
      // Make lecture fields required
      document.getElementById('speaker').required = true;
      document.getElementById('topic').required = true;
      document.querySelectorAll('input[name="depthLevel"]').forEach(r => r.required = true);
      document.querySelectorAll('input[name="seating"]').forEach(r => r.required = true);
    } else {
      lectureRoomFields.classList.add('hidden');
      // Make lecture fields optional
      document.getElementById('speaker').required = false;
      document.getElementById('topic').required = false;
      document.querySelectorAll('input[name="depthLevel"]').forEach(r => r.required = false);
      document.querySelectorAll('input[name="seating"]').forEach(r => r.required = false);
      // Clear lecture field values
      document.getElementById('speaker').value = '';
      document.getElementById('topic').value = '';
      document.querySelectorAll('input[name="depthLevel"]').forEach(r => r.checked = false);
      document.querySelectorAll('input[name="seating"]').forEach(r => r.checked = false);
    }
  });

  // Partner management
  const partnersContainer = document.getElementById('partnersContainer');
  const addPartnerBtn = document.getElementById('addPartnerBtn');

  function updateRemoveButtons() {
    const entries = partnersContainer.querySelectorAll('.partner-entry');
    entries.forEach((entry, index) => {
      const removeBtn = entry.querySelector('.remove-partner-btn');
      if (entries.length > 1) {
        removeBtn.classList.remove('hidden');
      } else {
        removeBtn.classList.add('hidden');
      }
    });
  }

  addPartnerBtn.addEventListener('click', () => {
    const newEntry = document.createElement('div');
    newEntry.className = 'flex gap-2 partner-entry';
    newEntry.innerHTML = `
      <input
        type="text"
        class="partner-input input-field flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        placeholder="Partner organization name"
      />
      <button type="button" class="remove-partner-btn px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
        Remove
      </button>
    `;
    partnersContainer.appendChild(newEntry);
    updateRemoveButtons();

    // Add remove event listener
    newEntry.querySelector('.remove-partner-btn').addEventListener('click', () => {
      newEntry.remove();
      updateRemoveButtons();
    });
  });

  // Add remove event listener to initial partner entry
  document.querySelector('.remove-partner-btn')?.addEventListener('click', function() {
    this.closest('.partner-entry').remove();
    updateRemoveButtons();
  });

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

    // Check if Lecture Room is selected
    const selectedOption = spaceSelect.options[spaceSelect.selectedIndex];
    const isLectureRoom = selectedOption?.dataset.spaceName === 'Lecture Room';

    // Validate Lecture Room specific fields
    if (isLectureRoom) {
      const speaker = document.getElementById('speaker').value.trim();
      const topic = document.getElementById('topic').value.trim();
      const depthLevelRadio = document.querySelector('input[name="depthLevel"]:checked');
      const seatingRadio = document.querySelector('input[name="seating"]:checked');
      const partnerInputs = document.querySelectorAll('.partner-input');
      const partners = Array.from(partnerInputs).map(input => input.value.trim()).filter(v => v);

      if (!speaker) {
        showInlineError('speaker', 'Speaker name is required for Lecture Room');
        Utils.showError(messageDiv, 'Please fill in all required Lecture Room fields.');
        document.getElementById('speaker').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!topic) {
        showInlineError('topic', 'Lecture topic is required');
        Utils.showError(messageDiv, 'Please fill in all required Lecture Room fields.');
        document.getElementById('topic').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (partners.length === 0) {
        showInlineError('partners', 'At least one organizing partner is required');
        Utils.showError(messageDiv, 'Please add at least one organizing partner.');
        return;
      }
      if (!depthLevelRadio) {
        showInlineError('depthLevel', 'Please select a depth level');
        Utils.showError(messageDiv, 'Please select a depth level.');
        return;
      }
      if (!seatingRadio) {
        showInlineError('seating', 'Please select a seating arrangement');
        Utils.showError(messageDiv, 'Please select a seating arrangement.');
        return;
      }
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

    // Build form data
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
      agenda: document.getElementById('agenda').value,
      valet: document.getElementById('valet')?.checked || false,
      catering: document.getElementById('catering')?.checked || false,
      photography: document.getElementById('photography')?.checked || false,
      itSupport: document.getElementById('itSupport')?.checked || false,
      screensDisplay: document.getElementById('screensDisplay')?.checked || false,
      visibility: visibility,
      comments: document.getElementById('comments').value || undefined,
    };

    // Add Lecture Room specific fields if applicable
    if (isLectureRoom) {
      const partnerInputs = document.querySelectorAll('.partner-input');
      const partners = Array.from(partnerInputs).map(input => input.value.trim()).filter(v => v);

      formData.speaker = document.getElementById('speaker').value.trim();
      formData.topic = document.getElementById('topic').value.trim();
      formData.partners = partners;
      formData.depthLevel = document.querySelector('input[name="depthLevel"]:checked')?.value;
      formData.seating = document.querySelector('input[name="seating"]:checked')?.value;
    }

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

    // Trigger space selection change to show/hide lecture room fields
    const spaceSelect = document.getElementById('spaceId');
    spaceSelect.dispatchEvent(new Event('change'));

    // Load lecture room specific fields if they exist
    if (booking.speaker) {
      document.getElementById('speaker').value = booking.speaker;
    }
    if (booking.topic) {
      document.getElementById('topic').value = booking.topic;
    }
    if (booking.depthLevel) {
      const depthRadio = document.querySelector(`input[name="depthLevel"][value="${booking.depthLevel}"]`);
      if (depthRadio) depthRadio.checked = true;
    }
    if (booking.partners && booking.partners.length > 0) {
      const partnersContainer = document.getElementById('partnersContainer');
      partnersContainer.innerHTML = ''; // Clear existing
      booking.partners.forEach((partner, index) => {
        const partnerEntry = document.createElement('div');
        partnerEntry.className = 'flex gap-2 partner-entry';
        partnerEntry.innerHTML = `
          <input
            type="text"
            class="partner-input input-field flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Partner organization name"
            value="${partner}"
          />
          <button type="button" class="remove-partner-btn ${index === 0 && booking.partners.length === 1 ? 'hidden' : ''} px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
            Remove
          </button>
        `;
        partnersContainer.appendChild(partnerEntry);

        // Add remove listener
        partnerEntry.querySelector('.remove-partner-btn').addEventListener('click', function() {
          partnerEntry.remove();
          const entries = partnersContainer.querySelectorAll('.partner-entry');
          if (entries.length === 1) {
            entries[0].querySelector('.remove-partner-btn').classList.add('hidden');
          }
        });
      });
    }

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
