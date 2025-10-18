# CHQ Space Management System

A comprehensive space booking and management system for Coders HQ, featuring real-time calendar, admin approval workflows, email notifications, and user-friendly booking interface.

## Features

- **Space Booking**: Book Co-working Space, Lecture Room, or Meeting Room
- **Admin Panel**: Approve, deny, or request edits for bookings
- **Email Notifications**: Automated emails for booking confirmations, approvals, denials, and edit requests
- **Public Calendar**: View all approved events with privacy controls
- **User Dashboard**: Track bookings and their status
- **Profile Management**: Complete user profiles with contact information
- **Authentication**: Secure JWT-based authentication with role-based access control
- **Google OAuth**: Optional Google sign-in integration

## Tech Stack

### Backend
- **Framework**: NestJS 11 (Node.js 20+, TypeScript)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: JWT + Passport.js (JWT & Google OAuth strategies)
- **Email**: SendGrid for notifications
- **Cache**: Redis 7 (optional)
- **Security**: bcrypt, throttling, CORS, input validation

### Frontend
- **Type**: Vanilla HTML/CSS/JavaScript (Static)
- **Styling**: Tailwind CSS (CDN)
- **Calendar**: FullCalendar.js
- **Server**: Nginx

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Production**: Cloudflare Pages (frontend) + Cloudflare Tunnel (backend)

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Git installed

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CodersHQ-Event-Manager
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update these **required** values:
- `JWT_SECRET`: Strong random string (min 32 characters)
- `ADMIN_PASSWORD`: Secure admin password
- `POSTGRES_PASSWORD`: Secure database password

Optional configurations:
- `SENDGRID_API_KEY`: For email notifications (recommended for production)
- `SENDGRID_FROM_EMAIL`: Sender email address
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth

### 3. Start All Services

```bash
docker-compose up -d
```

This command will:
- Start PostgreSQL database on port 5432
- Start Redis cache on port 6379
- Build and start the backend API on port 4000
- Build and start the frontend on port 8080
- Run database migrations automatically
- Seed initial data (3 spaces + admin account)

### 4. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:4000/api
- **Database**: localhost:5432

### 5. Default Login

**Admin Account:**
- Email: `admin@codershq.ae` (or your custom `ADMIN_EMAIL`)
- Password: `SecureAdminPassword123!` (or your custom `ADMIN_PASSWORD`)

**Create User Account:**
- Visit http://localhost:8080/register.html

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build backend

# Stop services
docker-compose down

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## Development Setup (Without Docker)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Backend runs on http://localhost:4000

### Frontend

```bash
cd frontend-html
# Use any static file server
python3 -m http.server 8080
# or
npx http-server -p 8080
```

Frontend runs on http://localhost:8080

**Note:** Update `frontend-html/js/config.js` if your backend runs on a different port.

## Project Structure

```
CodersHQ-Event-Manager/
├── backend/                    # NestJS backend API
│   ├── prisma/
│   │   ├── schema.prisma      # Database models
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts            # Initial data seeding
│   ├── src/
│   │   ├── auth/              # Authentication & authorization
│   │   ├── bookings/          # Booking management
│   │   ├── admin/             # Admin operations
│   │   ├── spaces/            # Space management
│   │   ├── email/             # Email notifications
│   │   ├── prisma/            # Database service
│   │   └── common/            # Shared guards & decorators
│   ├── Dockerfile
│   └── package.json
├── frontend-html/              # Static frontend
│   ├── js/                    # JavaScript modules
│   │   ├── config.js          # API configuration
│   │   ├── auth.js            # Authentication utilities
│   │   ├── api.js             # API wrapper
│   │   └── ...
│   ├── *.html                 # HTML pages
│   ├── Dockerfile
│   └── nginx.conf             # Nginx configuration
├── docker-compose.yml          # Main orchestration
├── .env.example               # Environment template
├── .env                       # Your environment (not in git)
├── CHECK-STATUS.sh            # Diagnostic script
├── SPEC.md                    # System specification
└── README.md                  # This file
```

## Available Pages

### Public Pages
- **Home**: http://localhost:8080/index.html
- **Calendar**: http://localhost:8080/calendar.html - View approved events
- **Login**: http://localhost:8080/login.html
- **Register**: http://localhost:8080/register.html

### Authenticated User Pages
- **Profile**: http://localhost:8080/profile.html - Update contact info
- **New Booking**: http://localhost:8080/booking-form.html - Request booking
- **Dashboard**: http://localhost:8080/dashboard.html - View your bookings

### Admin Pages
- **Admin Panel**: http://localhost:8080/admin.html - Manage all bookings

## API Endpoints

### Public Endpoints (No Auth Required)
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login
GET    /api/auth/google         - Google OAuth initiation
GET    /api/auth/google/callback - Google OAuth callback
GET    /api/spaces              - List all spaces
GET    /api/calendar            - Get public calendar
```

### Authenticated User Endpoints
```
PATCH  /api/auth/profile        - Update user profile
POST   /api/bookings            - Create booking request
GET    /api/bookings/me         - Get user's bookings
GET    /api/bookings/:id        - Get booking details
```

### Admin-Only Endpoints
```
GET    /api/admin/bookings                 - List all bookings
GET    /api/admin/bookings/:id             - Get booking details
PATCH  /api/admin/bookings/:id/approve     - Approve booking
PATCH  /api/admin/bookings/:id/deny        - Deny booking
PATCH  /api/admin/bookings/:id/request-edit - Request changes
POST   /api/admin/events                   - Create internal event
DELETE /api/admin/events/:id               - Delete event
GET    /api/admin/stats                    - Get statistics
```

## Email Notifications

The system sends automated emails for:
1. **Booking Received** - Confirmation to user when booking is submitted
2. **New Booking Alert** - Notification to all admins about new booking
3. **Booking Approved** - Approval notification to user
4. **Booking Denied** - Denial notification with reason to user
5. **Edit Requested** - Request for changes with admin comments

To enable email notifications:
1. Sign up for SendGrid account (free tier available)
2. Generate an API key
3. Add to `.env`:
   ```
   SENDGRID_API_KEY=your_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```
4. Rebuild backend: `docker-compose up -d --build backend`

## Testing the Application

### 1. Create User Account
1. Visit http://localhost:8080/register.html
2. Fill registration form
3. Login with credentials

### 2. Complete Profile
1. Go to http://localhost:8080/profile.html
2. Fill all required fields
3. Save profile

### 3. Create Booking Request
1. Visit http://localhost:8080/booking-form.html
2. Select space and fill form
3. Submit request
4. Check dashboard for status

### 4. Admin Review
1. Login as admin
2. Visit http://localhost:8080/admin.html
3. Review pending bookings
4. Approve, deny, or request edits

### 5. View Calendar
1. Visit http://localhost:8080/calendar.html
2. See all approved events
3. Private events show as "Reserved (Private)"

## Environment Variables

### Required
```env
# Database
POSTGRES_USER=chquser
POSTGRES_PASSWORD=SecureDBPassword123!
POSTGRES_DB=chq_space_management

# JWT
JWT_SECRET=your-strong-random-secret-min-32-chars
JWT_EXPIRATION=7d

# Admin Account
ADMIN_EMAIL=admin@codershq.ae
ADMIN_PASSWORD=SecureAdminPassword123!

# Frontend URL (for CORS)
FRONTEND_URL=https://dashboard.codershq.ae

# Environment
NODE_ENV=production
PORT=4000
```

### Optional
```env
# Email Notifications
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@codershq.ae

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://api-dashboard.codershq.ae/api/auth/google/callback
```

## Default Spaces

After seeding, these spaces are available:
1. **Co-working Space** - Capacity: 20
2. **Lecture Room** - Capacity: 40
3. **Meeting Room** - Capacity: 10

## Booking Workflow

1. **User** creates booking request (status: PENDING)
2. **System** sends confirmation email to user
3. **System** notifies all admins via email
4. **Admin** reviews in admin panel
5. **Admin** takes action:
   - **Approve** → Email sent to user, event shows on calendar
   - **Deny** → Email sent with reason
   - **Request Edit** → Email sent with required changes
6. **User** views status in dashboard

## Troubleshooting

### Backend not starting
```bash
# Check logs
docker-compose logs backend

# Database might not be ready - wait and restart
docker-compose restart backend
```

### Frontend API errors
1. Check `frontend-html/js/config.js` has correct `API_URL`
2. Verify backend is running: `curl http://localhost:4000/api/spaces`
3. Check CORS settings allow your frontend URL

### Database connection errors
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Email not sending
1. Verify `SENDGRID_API_KEY` is set in `.env`
2. Check backend logs for email errors: `docker-compose logs backend | grep -i email`
3. Verify SendGrid API key is valid
4. Check SendGrid sender email is verified

### Port conflicts
```bash
# Linux/Mac - Kill process on port
sudo lsof -ti:4000 | xargs kill -9
sudo lsof -ti:8080 | xargs kill -9

# Or change ports in docker-compose.yml
```

## Database Management

### View with Prisma Studio
```bash
cd backend
npx prisma studio
```
Opens GUI at http://localhost:5555

### Create Migration
```bash
cd backend
npx prisma migrate dev --name description_of_changes
```

### Reset Database
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

## Security Checklist for Production

- [ ] Change `JWT_SECRET` to strong random value (min 32 characters)
- [ ] Update `ADMIN_PASSWORD` to secure password
- [ ] Change `POSTGRES_PASSWORD` from default
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to actual domain
- [ ] Enable HTTPS for frontend and backend
- [ ] Set up database backups
- [ ] Review CORS settings
- [ ] Set up rate limiting (already configured: 10 req/60s)
- [ ] Enable monitoring and logging
- [ ] Never commit `.env` to git
- [ ] Use environment variables in CI/CD
- [ ] Set up SSL certificates
- [ ] Configure firewall rules

## Production Deployment

Current production setup:
- **Frontend**: Cloudflare Pages → https://dashboard.codershq.ae
- **Backend**: Cloudflare Tunnel → https://api-dashboard.codershq.ae
- **Database**: Local PostgreSQL (consider managed DB for production)

See `SPEC.md` for detailed architecture and deployment instructions.

## Diagnostic Tool

Run the status checker to verify all services:

```bash
./CHECK-STATUS.sh
```

This script checks:
- Docker containers status
- API endpoints health
- Database connectivity
- Frontend accessibility
- DNS resolution
- Login functionality

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Run diagnostics: `./CHECK-STATUS.sh`
- Review `SPEC.md` for system architecture
- Contact Coders HQ development team

## License

Proprietary - Coders HQ

---

**Last Updated**: 2025-10-19
**Version**: 1.0.0
