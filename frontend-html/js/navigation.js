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
    <nav class="nav">
      <div class="container" style="max-width: 1280px; padding: var(--space-4) var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <a href="/index.html" style="font-size: 1.125rem; font-weight: 600; color: var(--color-primary); text-decoration: none; letter-spacing: -0.02em;">
            CHQ
          </a>

          <div style="display: flex; align-items: center; gap: var(--space-8);" class="nav-menu">
            <a href="/calendar.html" class="nav-link">Calendar</a>

            ${user ? `
              <a href="/booking-form.html" class="nav-link">Book</a>
              <a href="/dashboard.html" class="nav-link">My Bookings</a>
              ${isAdmin ? '<a href="/admin.html" class="nav-link">Admin</a>' : ''}
              <div style="display: flex; align-items: center; gap: var(--space-4); margin-left: var(--space-4); padding-left: var(--space-4); border-left: 1px solid var(--color-border);" class="nav-user">
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <div style="width: 2rem; height: 2rem; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; font-weight: 600;">
                    ${displayName.charAt(0).toUpperCase()}
                  </div>
                  <span style="font-size: 0.875rem; color: var(--color-text-secondary); font-weight: 500;" class="user-name">${displayName}</span>
                </div>
                <button onclick="handleLogout()" class="btn-ghost" style="padding: var(--space-2) var(--space-3); font-size: 0.875rem;">
                  Logout
                </button>
              </div>
            ` : `
              <a href="/login.html" class="nav-link">Login</a>
              <a href="/register.html" class="btn btn-primary">Sign Up</a>
            `}
          </div>

          <!-- Mobile menu toggle -->
          <button id="mobileMenuToggle" style="display: none;" class="btn-ghost" onclick="toggleMobileMenu()">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Mobile menu -->
        <div id="mobileMenu" style="display: none; flex-direction: column; gap: var(--space-2); padding-top: var(--space-4); border-top: 1px solid var(--color-border); margin-top: var(--space-4);">
          <a href="/calendar.html" class="nav-link" style="padding: var(--space-2) 0;">Calendar</a>
          ${user ? `
            <a href="/booking-form.html" class="nav-link" style="padding: var(--space-2) 0;">Book</a>
            <a href="/dashboard.html" class="nav-link" style="padding: var(--space-2) 0;">My Bookings</a>
            ${isAdmin ? '<a href="/admin.html" class="nav-link" style="padding: var(--space-2) 0;">Admin</a>' : ''}
            <div style="padding: var(--space-3) 0; border-top: 1px solid var(--color-border); margin-top: var(--space-2);">
              <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
                <div style="width: 2rem; height: 2rem; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; font-weight: 600;">
                  ${displayName.charAt(0).toUpperCase()}
                </div>
                <span style="font-size: 0.875rem; color: var(--color-text-secondary);">${displayName}</span>
              </div>
              <button onclick="handleLogout()" class="btn btn-secondary" style="width: 100%;">Logout</button>
            </div>
          ` : `
            <a href="/login.html" class="nav-link" style="padding: var(--space-2) 0;">Login</a>
            <a href="/register.html" class="btn btn-primary" style="width: 100%; margin-top: var(--space-2);">Sign Up</a>
          `}
        </div>
      </div>

      <style>
        @media (max-width: 768px) {
          .nav-menu {
            display: none !important;
          }
          #mobileMenuToggle {
            display: flex !important;
          }
          .user-name {
            display: none;
          }
        }
        @media (min-width: 769px) {
          #mobileMenu {
            display: none !important;
          }
        }
      </style>
    </nav>
  `;

  const navElement = document.getElementById('navigation');
  if (navElement) {
    navElement.innerHTML = navHTML;
  }
}

// Toggle mobile menu
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    if (mobileMenu.style.display === 'flex') {
      mobileMenu.style.display = 'none';
    } else {
      mobileMenu.style.display = 'flex';
    }
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
