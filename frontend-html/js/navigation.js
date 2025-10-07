// Navigation component
function renderNavigation() {
  const user = Auth.getUser();
  const isAdmin = Auth.isAdmin();

  const navHTML = `
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <a href="/index.html" class="text-xl font-bold text-gray-900">
            CHQ Space Management
          </a>

          <div class="flex items-center gap-4">
            <a href="/calendar.html" class="text-gray-700 hover:text-gray-900">Calendar</a>

            ${user ? `
              <a href="/booking-form.html" class="text-gray-700 hover:text-gray-900">New Booking</a>
              <a href="/dashboard.html" class="text-gray-700 hover:text-gray-900">My Bookings</a>
              ${isAdmin ? '<a href="/admin.html" class="text-gray-700 hover:text-gray-900">Admin Panel</a>' : ''}
              <a href="/profile.html" class="text-gray-700 hover:text-gray-900">Profile</a>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">${user.email}</span>
                <button onclick="Auth.logout()" class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm">
                  Logout
                </button>
              </div>
            ` : `
              <a href="/login.html" class="text-gray-700 hover:text-gray-900">Login</a>
              <a href="/register.html" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Sign Up
              </a>
            `}
          </div>
        </div>
      </div>
    </nav>
  `;

  const navElement = document.getElementById('navigation');
  if (navElement) {
    navElement.innerHTML = navHTML;
  }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', renderNavigation);
