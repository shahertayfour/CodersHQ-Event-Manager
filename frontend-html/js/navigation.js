// Navigation component
async function renderNavigation() {
  const user = Auth.getUser();
  const isAdmin = Auth.isAdmin();

  // Get user display name
  let displayName = user?.email || '';
  if (user?.firstName || user?.name) {
    displayName = user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.name || user.email;
  }

  const navHTML = `
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <a href="/index.html" class="text-xl font-bold text-blue-600 hover:text-blue-700">
            CHQ Space Management
          </a>

          <div class="flex items-center gap-6">
            <a href="/calendar.html" class="text-gray-700 hover:text-blue-600 font-medium transition">Calendar</a>

            ${user ? `
              <a href="/booking-form.html" class="text-gray-700 hover:text-blue-600 font-medium transition">New Booking</a>
              <a href="/dashboard.html" class="text-gray-700 hover:text-blue-600 font-medium transition">My Bookings</a>
              ${isAdmin ? '<a href="/admin.html" class="text-gray-700 hover:text-blue-600 font-medium transition">Admin Panel</a>' : ''}
              <a href="/profile.html" class="text-gray-700 hover:text-blue-600 font-medium transition">Profile</a>
              <div class="flex items-center gap-3 pl-4 border-l border-gray-300">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    ${displayName.charAt(0).toUpperCase()}
                  </div>
                  <span class="text-sm text-gray-700 font-medium">${displayName}</span>
                </div>
                <button onclick="handleLogout()" class="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                  Logout
                </button>
              </div>
            ` : `
              <a href="/login.html" class="text-gray-700 hover:text-blue-600 font-medium transition">Login</a>
              <a href="/register.html" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
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

// Handle logout with Auth0 support
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await Auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if Auth0 fails
      localStorage.clear();
      window.location.href = '/index.html';
    }
  }
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', renderNavigation);
