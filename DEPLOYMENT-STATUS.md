# Deployment Status

## Last Deployment: October 21, 2025

### Changes Deployed

1. **Booking Form** - Complete minimalist design conversion
2. **Admin Panel** - Updated to design system  
3. **Admin Users Page** - Updated with navigation component
4. **OAuth Buttons** - Fixed styling on login/register pages
5. **Navigation** - Using design system throughout

### Docker Containers

- **Frontend (chq-frontend)**: Port 8080 → Nginx serving static files
- **Backend (chq-backend)**: Port 4000 → NestJS API
- **Database (chq-postgres)**: Port 5432 → PostgreSQL 16
- **Cache (chq-redis)**: Port 6379 → Redis 7

### How to Deploy Frontend Changes

When you make changes to files in `frontend-html/`:

```bash
# 1. Rebuild and restart the frontend container
docker compose build frontend
docker compose up -d frontend

# 2. Verify the changes
curl http://localhost:8080/admin.html | head -20
```

### How to Deploy Backend Changes

When you make changes to files in `backend/`:

```bash
# 1. The backend is running directly with Node.js (PID 375631)
# Kill the process and restart, or use:
npm run start:dev  # if in development
# OR
npm run start:prod  # if in production
```

### Important URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:4000/api
- **Database**: localhost:5432
- **Redis**: localhost:6379

### Design System Files

All pages now use `/css/design-system.css` with:
- CSS Variables: `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`
- Classes: `.btn`, `.input`, `.label`, `.card`, `.badge`, `.nav`, `.nav-link`
- No Tailwind dependencies

### Troubleshooting

**Navigation not showing correctly?**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors
- Verify `/js/navigation.js` is loaded

**Admin panel data not loading?**
- Ensure you're logged in as an admin user
- Check browser console for API errors
- Verify backend is running: `curl http://localhost:4000/api/health`

**OAuth buttons not working?**
- Check Auth0 configuration in `.env`
- Verify `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CALLBACK_URL` are set
- Check browser console for Auth0 errors
