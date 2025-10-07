// Admin panel logic
let allBookings = [];
let currentFilter = 'ALL';

function closeModal() {
  document.getElementById('bookingModal').classList.add('hidden');
}

function openBookingDetails(bookingId) {
  const booking = allBookings.find(b => b.id === bookingId);
  if (!booking) return;

  const modal = document.getElementById('bookingModal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');

  title.textContent = booking.eventName;

  content.innerHTML = `
    <div class="space-y-4">
      <!-- Booking Details -->
      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="font-semibold">Status:</span>
          <span class="px-2 py-1 rounded text-xs ${Utils.getStatusColor(booking.status)}">
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

        <div class="pt-2">
          <strong>Technical Requirements:</strong>
          <div class="ml-4">
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
        ${booking.adminComment ? `<div class="bg-yellow-50 p-3 rounded"><strong>Previous Admin Note:</strong> ${booking.adminComment}</div>` : ''}
      </div>

      <!-- Admin Actions -->
      ${booking.status === 'PENDING' || booking.status === 'EDIT_REQUESTED' ? `
        <div class="pt-4 border-t">
          <h3 class="font-semibold mb-3">Admin Actions</h3>

          <div class="mb-3">
            <label for="adminComment" class="block text-sm font-medium text-gray-700 mb-2">
              Admin Comment
            </label>
            <textarea
              id="adminComment"
              rows="3"
              placeholder="Optional note for the requester..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >${booking.adminComment || ''}</textarea>
          </div>

          <div class="flex gap-2">
            <button
              onclick="updateBookingStatus('${booking.id}', 'APPROVED')"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
            <button
              onclick="updateBookingStatus('${booking.id}', 'DENIED')"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Deny
            </button>
            <button
              onclick="updateBookingStatus('${booking.id}', 'EDIT_REQUESTED')"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Request Edit
            </button>
          </div>
        </div>
      ` : ''}

      ${booking.status !== 'PENDING' && booking.status !== 'EDIT_REQUESTED' ? `
        <div class="pt-4 border-t">
          <button
            onclick="deleteBooking('${booking.id}')"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Delete Booking
          </button>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.remove('hidden');
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
    btn.classList.remove('bg-gray-200', 'text-gray-900');
    btn.classList.add('bg-gray-100', 'text-gray-700');
  });
  event.target.classList.remove('bg-gray-100', 'text-gray-700');
  event.target.classList.add('bg-gray-200', 'text-gray-900');

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
            <div><strong>Requester:</strong> ${booking.requester.firstName} ${booking.requester.lastName} (${booking.requester.email})</div>
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
    allBookings = await API.get('/admin/bookings');
    updateStatistics();
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
  // Require admin authentication
  if (!Auth.requireAdmin()) return;

  loadBookings();
});
