// Dashboard page logic
let allBookings = [];
let currentFilter = 'ALL';

function closeModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function openBookingDetails(bookingId) {
  const booking = allBookings.find(b => b.id === bookingId);
  if (!booking) return;

  const modal = document.getElementById('bookingModal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');

  title.textContent = booking.eventName;

  content.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-3); font-size: 0.875rem;">
      <div style="display: flex; align-items: center; gap: var(--space-2);">
        <span style="font-weight: 600;">Status:</span>
        <span class="badge ${Utils.getStatusBadgeClass(booking.status)}">
          ${Utils.formatStatus(booking.status)}
        </span>
      </div>
      <div><strong>Space:</strong> ${booking.space.name}</div>
      <div><strong>Start:</strong> ${Utils.formatDateTime(booking.startDate)}</div>
      <div><strong>End:</strong> ${Utils.formatDateTime(booking.endDate)}</div>
      <div><strong>Attendees:</strong> ${booking.attendees}</div>
      ${booking.seating ? `<div><strong>Seating:</strong> ${Utils.formatStatus(booking.seating)}</div>` : ''}
      <div><strong>Agenda:</strong> ${booking.agenda}</div>
      ${booking.projector ? '<div>✓ Projector</div>' : ''}
      ${booking.whiteboard ? '<div>✓ Whiteboard</div>' : ''}
      ${booking.videoConference ? '<div>✓ Video Conference</div>' : ''}
      ${booking.audioSystem ? '<div>✓ Audio System</div>' : ''}
      ${booking.cateringRequired ? '<div>✓ Catering Required</div>' : ''}
      <div><strong>Visibility:</strong> ${Utils.formatStatus(booking.visibility)}</div>
      ${booking.comments ? `<div><strong>Comments:</strong> ${booking.comments}</div>` : ''}
      ${booking.adminComment ? `<div style="background: #fef3c7; padding: var(--space-3); border-radius: var(--radius-md); border-left: 3px solid #f59e0b;"><strong>Admin Note:</strong> ${booking.adminComment}</div>` : ''}

      ${booking.status === 'PENDING' || booking.status === 'EDIT_REQUESTED' ? `
        <div style="padding-top: var(--space-4); border-top: 1px solid var(--color-border); display: flex; gap: var(--space-2); flex-wrap: wrap;">
          ${booking.status === 'EDIT_REQUESTED' ? `
            <a href="/booking-form.html?edit=${booking.id}" class="btn btn-accent">
              Edit Booking
            </a>
          ` : ''}
          <button onclick="deleteBooking('${booking.id}')" class="btn" style="background: var(--color-error); color: white;">
            Cancel Booking
          </button>
        </div>
      ` : ''}
    </div>
  `;

  modal.style.display = 'flex';
}

async function deleteBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    await API.delete(`${ENDPOINTS.BOOKINGS}/${bookingId}`);
    closeModal();
    loadBookings();

    const messageDiv = document.getElementById('message');
    Utils.showSuccess(messageDiv, 'Booking cancelled successfully.');
    setTimeout(() => Utils.clearMessages(messageDiv), 3000);
  } catch (error) {
    alert(error.message || 'Failed to cancel booking.');
  }
}

function filterBookings(status) {
  currentFilter = status;

  // Update button styles
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-gray-200', 'text-gray-900');
    btn.classList.add('bg-gray-100', 'text-gray-700');
  });
  event.target.classList.remove('bg-gray-100', 'text-gray-700');
  event.target.classList.add('bg-gray-200', 'text-gray-900');

  renderBookings();
}

function renderBookings() {
  const bookingsList = document.getElementById('bookingsList');

  let filteredBookings = allBookings;
  if (currentFilter !== 'ALL') {
    filteredBookings = allBookings.filter(b => b.status === currentFilter);
  }

  if (filteredBookings.length === 0) {
    bookingsList.innerHTML = `
      <div class="text-center py-12 text-gray-500">
        No bookings found.
      </div>
    `;
    return;
  }

  bookingsList.innerHTML = filteredBookings.map(booking => `
    <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer" onclick="openBookingDetails('${booking.id}')">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-900 mb-2">${booking.eventName}</h3>
          <div class="space-y-1 text-sm text-gray-600">
            <div><strong>Space:</strong> ${booking.space.name}</div>
            <div><strong>Date:</strong> ${Utils.formatDate(booking.startDate)}</div>
            <div><strong>Time:</strong> ${new Date(booking.startDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})} - ${new Date(booking.endDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</div>
            <div><strong>Attendees:</strong> ${booking.attendees}</div>
          </div>
        </div>
        <span class="px-3 py-1 rounded text-sm ${Utils.getStatusColor(booking.status)}">
          ${Utils.formatStatus(booking.status)}
        </span>
      </div>
    </div>
  `).join('');
}

async function loadBookings() {
  const bookingsList = document.getElementById('bookingsList');
  const messageDiv = document.getElementById('message');

  try {
    allBookings = await API.get(`${ENDPOINTS.BOOKINGS}/me`);
    renderBookings();
  } catch (error) {
    Utils.showError(messageDiv, 'Failed to load bookings.');
    bookingsList.innerHTML = `
      <div class="text-center py-12 text-red-600">
        Failed to load bookings. Please try again.
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Require authentication
  if (!Auth.requireAuth()) return;

  loadBookings();
});
