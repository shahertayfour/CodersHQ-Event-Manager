# CHQ Space Management Platform - Backend

Backend API for the Coders HQ Space Management Platform built with NestJS, Prisma, and PostgreSQL.

## 📋 Overview

This backend provides a comprehensive REST API for managing space bookings at Coders HQ. It handles user authentication, booking requests, admin approvals, calendar management, and email notifications.

## 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth 2.0
- **Email**: SendGrid
- **Cache/Queue**: Redis (optional)
- **Validation**: class-validator & class-transformer
- **Security**: Throttling, CORS, RBAC

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with spaces and admin user
npm run prisma:seed
```

### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:4000/api`

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Building Docker Image

```bash
# Build image
docker build -t chq-backend .

# Run container
docker run -p 4000:4000 --env-file .env chq-backend
```

## 📚 API Documentation

### Public Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout (client-side JWT removal)

#### Spaces
- `GET /api/spaces` - Get all available spaces
- `GET /api/spaces/:id` - Get space details

#### Calendar
- `GET /api/calendar` - Get public calendar events
  - Query params: `spaceId`, `from`, `to`

### Authenticated Endpoints

#### Bookings
- `POST /api/bookings` - Create booking request
- `GET /api/bookings/me` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details

### Admin Endpoints (Requires ADMIN role)

#### Booking Management
- `GET /api/admin/bookings` - List all bookings with filters
  - Query params: `status`, `spaceId`, `from`, `to`, `requesterName`
- `GET /api/admin/bookings/:id` - Get booking details
- `PATCH /api/admin/bookings/:id/approve` - Approve booking
- `PATCH /api/admin/bookings/:id/deny` - Deny booking
- `PATCH /api/admin/bookings/:id/request-edit` - Request changes

#### Event Management
- `POST /api/admin/events` - Create internal event
- `DELETE /api/admin/events/:id` - Delete event

#### Statistics
- `GET /api/admin/stats` - Get booking statistics

## 🗄️ Database Schema

### Models

- **User**: User accounts (community members and admins)
- **Space**: Physical spaces (Co-working, Lecture Room, Meeting Room)
- **Booking**: Booking requests and approved bookings

### Enums

- **Role**: `USER`, `ADMIN`
- **BookingStatus**: `PENDING`, `APPROVED`, `DENIED`, `EDIT_REQUESTED`
- **Visibility**: `PUBLIC`, `PRIVATE`, `INTERNAL`
- **Seating**: `THEATRE`, `WORKSHOP`, `CLASSROOM`, `USHAPE`

## 🔐 Environment Variables

See `.env.example` for all required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chq_space_management"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="noreply@codershq.ae"

# Application
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## 📧 Email Notifications

Automated emails are sent for:

1. **Booking Submitted** → Confirmation to user + notification to admins
2. **Booking Approved** → Confirmation to user
3. **Booking Denied** → Notification to user with reason
4. **Edit Requested** → Notification to user with required changes

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Request throttling (rate limiting)
- Input validation
- CORS configuration
- SQL injection prevention (Prisma)

## 📊 Database Management

```bash
# Open Prisma Studio (GUI)
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Project Structure

```
src/
├── admin/              # Admin management module
├── auth/               # Authentication & authorization
│   ├── dto/
│   └── strategies/
├── bookings/           # Booking management
│   └── dto/
├── common/             # Shared resources
│   ├── decorators/
│   └── guards/
├── email/              # Email service
├── prisma/             # Prisma service
└── spaces/             # Space management
```

## 🛠️ Development

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

### Useful Commands

```bash
# Generate new module
nest g module module-name

# Generate new controller
nest g controller controller-name

# Generate new service
nest g service service-name
```

## 🌐 Default Admin Credentials

After running the seed script, you can login with:

- **Email**: `admin@codershq.ae`
- **Password**: `Admin@123456`

**⚠️ IMPORTANT**: Change these credentials in production!

## 📝 Notes

- All dates are stored in UTC and should be converted to Asia/Dubai timezone on the frontend
- Booking overlap prevention is handled at the service layer with transaction safety
- Private events show as "Reserved (Private)" in public calendar
- SendGrid API key is required for email functionality

## 🔗 Related Documentation

- [SPEC.md](../SPEC.md) - Complete system specification
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## 📄 License

UNLICENSED - Proprietary software for Coders HQ
