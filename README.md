# CHQ Space Management System

A comprehensive space booking and management system for Coders HQ, featuring real-time calendar, admin approval workflows, and user-friendly booking interface.

## Features

- **Space Booking**: Users can book Co-working Space, Lecture Room, or Meeting Room
- **Admin Panel**: Approve, deny, or request edits for bookings
- **Calendar View**: Public calendar showing all approved events
- **User Dashboard**: Track your bookings and their status
- **Profile Management**: Complete user profiles with contact information
- **Authentication**: Secure JWT-based authentication with role-based access control

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Cache**: Redis (optional)

### Frontend
- **Framework**: Vanilla HTML/CSS/JavaScript (Static)
- **Styling**: Tailwind CSS (CDN)
- **Calendar**: FullCalendar.js
- **Server**: Nginx (in Docker)

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop installed
- Git installed

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "CodersHQ event Registration"
```

### 2. Configure Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` and update the following **required** values:
- `JWT_SECRET`: Use a strong random string (min 32 characters)
- `ADMIN_PASSWORD`: Set a secure admin password

Optional configurations:
- `SENDGRID_API_KEY`: For email notifications
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: For Google OAuth

### 3. Start All Services

```bash
docker-compose up -d
```

This single command will:
- Start PostgreSQL database
- Start Redis cache
- Build and start the backend API
- Build and start the frontend
- Run database migrations
- Seed initial data (3 spaces + admin user)

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api

### 5. Login

**Admin Account:**
- Email: `admin@codershq.ae` (or your custom `ADMIN_EMAIL`)
- Password: `Admin@123456` (or your custom `ADMIN_PASSWORD`)

**Create User Account:**
- Visit http://localhost/register.html
- Complete your profile at http://localhost/profile.html before making bookings

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### View specific service logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Reset database (WARNING: deletes all data)
```bash
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

### Frontend (Vanilla HTML)

```bash
cd frontend-html
python -m http.server 8000
# or use any static file server
```

Frontend runs on http://localhost:8000

**Note:** You need to update `frontend-html/js/config.js` if your backend runs on a different port.

## Project Structure

```
CodersHQ event Registration/
├── backend/                 # NestJS backend API
│   ├── prisma/             # Database schema and migrations
│   ├── src/                # Source code
│   │   ├── auth/          # Authentication module
│   │   ├── bookings/      # Bookings module
│   │   ├── spaces/        # Spaces module
│   │   └── admin/         # Admin module
│   ├── Dockerfile         # Backend container
│   └── docker-compose.yml # Backend services only
├── frontend-html/          # Static HTML frontend
│   ├── js/                # JavaScript modules
│   │   ├── config.js      # API configuration
│   │   ├── auth.js        # Authentication utilities
│   │   ├── api.js         # API wrapper
│   │   ├── utils.js       # Utility functions
│   │   └── ...
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── profile.html       # User profile
│   ├── booking-form.html  # Booking form
│   ├── calendar.html      # Calendar view
│   ├── dashboard.html     # User dashboard
│   ├── admin.html         # Admin panel
│   ├── Dockerfile         # Frontend container
│   └── nginx.conf         # Nginx configuration
├── frontend/               # Next.js frontend (legacy)
├── docker-compose.yml      # Main orchestration file
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## Available Pages

### Public Pages
- **Home**: http://localhost/index.html
- **Calendar**: http://localhost/calendar.html - View all approved events
- **Login**: http://localhost/login.html
- **Register**: http://localhost/register.html

### Authenticated Pages (User)
- **Profile**: http://localhost/profile.html - Update contact information
- **New Booking**: http://localhost/booking-form.html - Request space booking
- **Dashboard**: http://localhost/dashboard.html - View your bookings

### Admin Pages
- **Admin Panel**: http://localhost/admin.html - Manage all bookings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `PATCH /api/auth/profile` - Update profile

### Spaces
- `GET /api/spaces` - Get all spaces

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/me` - Get my bookings
- `GET /api/calendar` - Get approved bookings (public)

### Admin
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/bookings/:id/approve` - Approve booking
- `PATCH /api/admin/bookings/:id/deny` - Deny booking
- `PATCH /api/admin/bookings/:id/request-edit` - Request edit
- `GET /api/admin/stats` - Get statistics

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `POSTGRES_USER` - Database username (default: chquser)
- `POSTGRES_PASSWORD` - Database password (default: chqpassword)
- `POSTGRES_DB` - Database name (default: chq_space_management)
- `JWT_SECRET` - Secret key for JWT tokens (CHANGE THIS!)
- `ADMIN_EMAIL` - Admin account email
- `ADMIN_PASSWORD` - Admin account password (CHANGE THIS!)

### Optional Variables
- `SENDGRID_API_KEY` - SendGrid API key for emails
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:80)
- `NODE_ENV` - Environment mode (development/production)

## Testing the Application

### 1. Create a User Account
1. Go to http://localhost/register.html
2. Fill in the registration form
3. Login with your credentials

### 2. Complete Your Profile
1. Go to http://localhost/profile.html
2. Fill in all required contact information
3. Save your profile

### 3. Create a Booking Request
1. Go to http://localhost/booking-form.html
2. Select a space and fill out the form
3. Submit the request
4. Check your dashboard at http://localhost/dashboard.html

### 4. Admin Actions
1. Login as admin (admin@codershq.ae / Admin@123456)
2. Go to http://localhost/admin.html
3. Review pending bookings
4. Approve, deny, or request edits

### 5. View Calendar
1. Go to http://localhost/calendar.html
2. View all approved events
3. Click on events to see details

## Troubleshooting

### Backend not starting
```bash
# Check backend logs
docker-compose logs backend

# Common issue: Database not ready
# Wait a few seconds and try again
docker-compose restart backend
```

### Frontend showing API errors
1. Check that `frontend-html/js/config.js` has correct `API_URL`
2. For Docker: Should be `http://localhost:4000/api`
3. For local dev: Should be `http://localhost:4000/api`
4. Check CORS settings in backend allow your frontend URL

### Database connection errors
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port already in use
```bash
# On Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

netstat -ano | findstr :80
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:4000 | xargs kill -9
lsof -ti:80 | xargs kill -9
```

### Can't login or authentication issues
1. Check browser console for errors (F12)
2. Verify backend is returning `access_token` (not `token`)
3. Clear localStorage: Open DevTools > Application > Local Storage > Clear
4. Check backend logs for authentication errors

### Profile information required
Before creating bookings, users must complete their profile with:
- First Name
- Last Name
- Phone Number
- Organization/Entity
- Job Title

Visit http://localhost/profile.html to update.

## Database Management

### View Database with Prisma Studio
```bash
cd backend
npx prisma studio
```

Opens GUI at http://localhost:5555

### Reset Database (⚠️ Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

Or without Docker:
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

## Security Checklist for Production

- [ ] Change `JWT_SECRET` to a strong random value (min 32 characters)
- [ ] Update `ADMIN_PASSWORD` to a secure password
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to actual domain
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up database backups
- [ ] Review CORS settings in backend
- [ ] Remove or secure Prisma Studio access
- [ ] Set up rate limiting
- [ ] Enable monitoring and logging
- [ ] Use environment-specific .env files (never commit .env to git)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- **Railway** (Backend - Recommended)
- **Netlify** (Frontend - Recommended)
- Render
- Heroku
- Vercel
- GitHub Pages

## Default Spaces

After running database seed, the following spaces are available:
1. **Co-working Space** - Open workspace for collaboration
2. **Lecture Room** - Large room with projector for presentations
3. **Meeting Room** - Private room for meetings

## Booking Workflow

1. **User** creates a booking request (status: PENDING)
2. **Admin** reviews the request in admin panel
3. **Admin** can:
   - **Approve**: Event appears on public calendar
   - **Deny**: User can see denial reason in dashboard
   - **Request Edit**: User can modify and resubmit
4. **User** can view booking status in dashboard
5. **Everyone** can view approved events in calendar

## License

Proprietary - Coders HQ

## Support

For issues or questions, contact the development team at Coders HQ.

## Notes

- This project includes two frontends:
  - `frontend-html/` - Vanilla HTML/CSS/JS (active, used in Docker)
  - `frontend/` - Next.js version (legacy, for reference)
- The vanilla HTML version is simpler, faster, and easier to deploy
- All authentication uses JWT tokens stored in localStorage
- Calendar updates in real-time when bookings are approved
- Email notifications require SendGrid API key (optional)
