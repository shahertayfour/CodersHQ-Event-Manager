// Admin panel logic
let allBookings = [];
let currentFilter = 'ALL';

function closeModal() {
  document.getElementById('bookingModal').style.display = 'none';
}

function openBookingDetails(bookingId) {
  const booking = allBookings.find(b => b.id === bookingId);
  if (!booking) return;

  const modal = document.getElementById('bookingModal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');

  title.textContent = booking.eventName;

  content.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <!-- Booking Details -->
      <div style="display: flex; flex-direction: column; gap: var(--space-2); font-size: 0.875rem;">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="font-weight: 600;">Status:</span>
          <span class="${Utils.getStatusBadgeClass(booking.status)}">
            ${Utils.formatStatus(booking.status)}
          </span>
        </div>
        <div><strong>Requester:</strong> ${booking.requester.firstName} ${booking.requester.lastName} (${booking.requester.email})</div>
        <div><strong>Entity:</strong> ${booking.requester.entity || 'N/A'}</div>
        <div><strong>Space:</strong> ${booking.space.name} (Capacity: ${booking.space.capacity})</div>
        <div><strong>Start:</strong> ${Utils.formatDateTime(booking.startDate)}</div>
        <div><strong>End:</strong> ${Utils.formatDateTime(booking.endDate)}</div>
        <div><strong>Attendees:</strong> ${booking.attendees}</div>
        <div><strong>Seating:</strong> ${Utils.formatStatus(booking.seating)}</div>
        <div><strong>Agenda:</strong> ${booking.agenda}</div>

        <div style="padding-top: var(--space-2);">
          <strong>Technical Requirements:</strong>
          <div style="margin-left: var(--space-4);">
            ${booking.projector ? '✓ Projector<br>' : ''}
            ${booking.whiteboard ? '✓ Whiteboard<br>' : ''}
            ${booking.videoConference ? '✓ Video Conference<br>' : ''}
            ${booking.audioSystem ? '✓ Audio System<br>' : ''}
            ${booking.cateringRequired ? '✓ Catering Required<br>' : ''}
            ${!booking.projector && !booking.whiteboard && !booking.videoConference && !booking.audioSystem && !booking.cateringRequired ? 'None' : ''}
          </div>
        </div>

        <div><strong>Visibility:</strong> ${Utils.formatStatus(booking.visibility)}</div>
        ${booking.comments ? `<div><strong>Comments:</strong> ${booking.comments}</div>` : ''}
        ${booking.adminComment ? `<div style="background: #fef3c7; padding: var(--space-3); border-radius: var(--radius-md);"><strong>Previous Admin Note:</strong> ${booking.adminComment}</div>` : ''}
      </div>

      <!-- Admin Actions -->
      ${booking.status === 'PENDING' || booking.status === 'EDIT_REQUESTED' ? `
        <div style="padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
          <h3 style="font-weight: 600; margin-bottom: var(--space-3);">Admin Actions</h3>

          <div style="margin-bottom: var(--space-3);">
            <label for="adminComment" class="label">
              Admin Comment
            </label>
            <textarea
              id="adminComment"
              rows="3"
              placeholder="Optional note for the requester..."
              class="input"
            >${booking.adminComment || ''}</textarea>
          </div>

          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
            <button
              onclick="updateBookingStatus('${booking.id}', 'APPROVED')"
              class="btn"
              style="background: #10b981; color: white;"
            >
              Approve
            </button>
            <button
              onclick="updateBookingStatus('${booking.id}', 'DENIED')"
              class="btn"
              style="background: var(--color-error); color: white;"
            >
              Deny
            </button>
            <button
              onclick="updateBookingStatus('${booking.id}', 'EDIT_REQUESTED')"
              class="btn btn-accent"
            >
              Request Edit
            </button>
          </div>
        </div>
      ` : ''}

      ${booking.status !== 'PENDING' && booking.status !== 'EDIT_REQUESTED' ? `
        <div style="padding-top: var(--space-4); border-top: 1px solid var(--color-border);">
          <button
            onclick="deleteBooking('${booking.id}')"
            class="btn"
            style="background: var(--color-error); color: white;"
          >
            Delete Booking
          </button>
        </div>
      ` : ''}
    </div>
  `;

  modal.style.display = 'flex';
}

async function updateBookingStatus(bookingId, status) {
  const adminComment = document.getElementById('adminComment')?.value || undefined;

  try {
    let endpoint;
    if (status === 'APPROVED') {
      endpoint = `/admin/bookings/${bookingId}/approve`;
    } else if (status === 'DENIED') {
      endpoint = `/admin/bookings/${bookingId}/deny`;
    } else if (status === 'EDIT_REQUESTED') {
      endpoint = `/admin/bookings/${bookingId}/request-edit`;
    }

    await API.patch(endpoint, { adminComment });

    closeModal();
    loadBookings();

    const messageDiv = document.getElementById('message');
    Utils.showSuccess(messageDiv, `Booking ${status.toLowerCase().replace('_', ' ')} successfully.`);
    setTimeout(() => Utils.clearMessages(messageDiv), 3000);
  } catch (error) {
    alert(error.message || 'Failed to update booking status.');
  }
}

async function deleteBooking(bookingId) {
  if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

  try {
    await API.delete(`${ENDPOINTS.BOOKINGS}/${bookingId}`);
    closeModal();
    loadBookings();

    const messageDiv = document.getElementById('message');
    Utils.showSuccess(messageDiv, 'Booking deleted successfully.');
    setTimeout(() => Utils.clearMessages(messageDiv), 3000);
  } catch (error) {
    alert(error.message || 'Failed to delete booking.');
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

function updateStatistics() {
  document.getElementById('statTotal').textContent = allBookings.length;
  document.getElementById('statPending').textContent = allBookings.filter(b => b.status === 'PENDING' || b.status === 'EDIT_REQUESTED').length;
  document.getElementById('statApproved').textContent = allBookings.filter(b => b.status === 'APPROVED').length;
  document.getElementById('statDenied').textContent = allBookings.filter(b => b.status === 'DENIED').length;
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
            <div><strong>Requester:</strong> ${booking.requester.firstName} ${booking.requester.lastName} (${booking.requester.email})</div>
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
    allBookings = await API.get('/admin/bookings');
    updateStatistics();
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
  // Require admin authentication
  if (!Auth.requireAdmin()) return;

  loadBookings();
});
