// Calendar page logic
let calendar;
let allEvents = []; // Store all events for filtering

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

function filterEventsBySpace(spaceName) {
  if (!spaceName) {
    // Show all events
    return allEvents;
  }
  // Filter events by space name
  return allEvents.filter(event => event.extendedProps.spaceName === spaceName);
}

document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  const messageDiv = document.getElementById('message');
  const spaceFilter = document.getElementById('spaceFilter');

  // Check if mobile device
  const isMobile = window.innerWidth < 768;

  // Initialize calendar
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',
    headerToolbar: {
      left: isMobile ? 'prev,next' : 'prev,next today',
      center: 'title',
      right: isMobile ? 'today dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    // Mobile-friendly title format
    titleFormat: isMobile ? { month: 'short', day: 'numeric' } : { year: 'numeric', month: 'long' },
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    nowIndicator: true,
    allDaySlot: false,
    // Better mobile height handling
    contentHeight: isMobile ? 'auto' : 'auto',
    expandRows: true,
    events: async (fetchInfo, successCallback, failureCallback) => {
      try {
        // Fetch approved bookings from calendar endpoint
        const bookings = await API.get('/calendar');
        console.log('Fetched bookings:', bookings);

        allEvents = bookings.map(booking => {
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

        // Populate space filter dropdown with unique space names
        const uniqueSpaces = [...new Set(bookings.map(b => b.spaceName))];
        uniqueSpaces.forEach(spaceName => {
          const option = document.createElement('option');
          option.value = spaceName;
          option.textContent = spaceName;
          spaceFilter.appendChild(option);
        });

        console.log('Final events:', allEvents);
        const filteredEvents = filterEventsBySpace(spaceFilter.value);
        successCallback(filteredEvents);
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

  // Add space filter change handler
  spaceFilter.addEventListener('change', () => {
    const filteredEvents = filterEventsBySpace(spaceFilter.value);

    // Remove all existing events
    calendar.removeAllEvents();

    // Add filtered events
    calendar.addEventSource(filteredEvents);
  });

  // Handle window resize for responsive view changes
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nowMobile = window.innerWidth < 768;
      const currentView = calendar.view.type;

      // Switch to appropriate view based on screen size
      if (nowMobile && (currentView === 'timeGridWeek')) {
        calendar.changeView('timeGridDay');
      } else if (!nowMobile && currentView === 'timeGridDay') {
        calendar.changeView('timeGridWeek');
      }

      // Update header toolbar
      calendar.setOption('headerToolbar', {
        left: nowMobile ? 'prev,next' : 'prev,next today',
        center: 'title',
        right: nowMobile ? 'today dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
      });
    }, 250);
  });
});
