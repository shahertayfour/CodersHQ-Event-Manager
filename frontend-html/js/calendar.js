// Calendar page logic
let calendar;

// Space colors
const SPACE_COLORS = {
  'Co-working Space': '#10b981', // green
  'Lecture Room': '#3b82f6', // blue
  'Meeting Room': '#a855f7', // purple
};

function closeModal() {
  document.getElementById('eventModal').classList.add('hidden');
}

function openModal(event) {
  const modal = document.getElementById('eventModal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');

  title.textContent = event.title;

  const booking = event.extendedProps;

  content.innerHTML = `
    <div><strong>Space:</strong> ${booking.spaceName}</div>
    <div><strong>Start:</strong> ${Utils.formatDateTime(event.start)}</div>
    <div><strong>End:</strong> ${Utils.formatDateTime(event.end)}</div>
    ${booking.attendees ? `<div><strong>Attendees:</strong> ${booking.attendees}</div>` : ''}
    ${booking.entity ? `<div><strong>Organization:</strong> ${booking.entity}</div>` : ''}
  `;

  modal.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  const messageDiv = document.getElementById('message');

  // Initialize calendar
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: async (fetchInfo, successCallback, failureCallback) => {
      try {
        // Fetch approved bookings from calendar endpoint
        const bookings = await API.get('/calendar');
        console.log('Fetched bookings:', bookings);

        const events = bookings.map(booking => {
          const event = {
            id: booking.id,
            title: booking.title,
            start: booking.start,
            end: booking.end,
            backgroundColor: SPACE_COLORS[booking.spaceName] || '#6b7280',
            borderColor: SPACE_COLORS[booking.spaceName] || '#6b7280',
            extendedProps: {
              spaceName: booking.spaceName,
              attendees: booking.attendees,
              entity: booking.entity,
            }
          };
          console.log('Mapped event:', event);
          return event;
        });

        console.log('Final events:', events);
        successCallback(events);
      } catch (error) {
        console.error('Calendar error:', error);
        Utils.showError(messageDiv, `Failed to load calendar events: ${error.message || 'Unknown error'}`);
        failureCallback(error);
      }
    },
    eventClick: (info) => {
      openModal(info.event);
    },
    height: 'auto',
  });

  calendar.render();
});
