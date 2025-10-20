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
    btn.classList.remove('filter-active');
    btn.classList.add('filter-inactive');
  });
  event.target.classList.remove('filter-inactive');
  event.target.classList.add('filter-active');

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
      <div style="text-align: center; padding: var(--space-12) 0; color: var(--color-text-tertiary);">
        No bookings found.
      </div>
    `;
    return;
  }

  bookingsList.innerHTML = filteredBookings.map(booking => `
    <div class="card" style="cursor: pointer; transition: all var(--transition-base);" onclick="openBookingDetails('${booking.id}')" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform=''; this.style.boxShadow='var(--shadow-sm)'">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-2);">${booking.eventName}</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-1); font-size: 0.875rem; color: var(--color-text-secondary);">
            <div><strong>Space:</strong> ${booking.space.name}</div>
            <div><strong>Date:</strong> ${Utils.formatDate(booking.startDate)}</div>
            <div><strong>Time:</strong> ${new Date(booking.startDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})} - ${new Date(booking.endDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</div>
            <div><strong>Attendees:</strong> ${booking.attendees}</div>
          </div>
        </div>
        <span class="${Utils.getStatusBadgeClass(booking.status)}">
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
      <div style="text-align: center; padding: var(--space-12) 0; color: var(--color-error);">
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
