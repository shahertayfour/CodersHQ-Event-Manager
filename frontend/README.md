# CHQ Space Management Platform - Frontend

Frontend application for the Coders HQ Space Management Platform built with Next.js, React, and TypeScript.

## 📋 Overview

This frontend provides a modern, responsive interface for booking and managing spaces at Coders HQ. It features:

- **Public booking form** for space requests
- **User authentication** (email/password + Google OAuth)
- **Interactive calendar** with FullCalendar.js
- **User dashboard** to track booking status
- **Admin dashboard** for managing bookings
- **Real-time status updates** via email notifications

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Calendar**: FullCalendar
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API URL
```

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── bookings/          # Booking pages
│   │   └── new/          # Create booking
│   ├── calendar/          # Public calendar
│   ├── dashboard/         # User dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   └── Navigation.tsx    # Navigation component
├── contexts/             # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── types/               # TypeScript types
│   └── index.ts        # Type definitions
├── public/             # Static assets
├── .env.example        # Environment template
├── next.config.ts      # Next.js config
├── tailwind.config.ts  # Tailwind config
└── tsconfig.json       # TypeScript config
```

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## 📱 Features

### Public Pages

#### Home Page (`/`)
- Overview of CHQ spaces
- How it works section
- Quick links to booking and calendar

#### Calendar (`/calendar`)
- Interactive calendar with month/week/day views
- Filter by space
- Public events shown with full details
- Private events shown as "Reserved (Private)"

### Authentication

#### Login (`/auth/login`)
- Email/password authentication
- Redirect to dashboard on success
- Error handling

#### Register (`/auth/register`)
- User registration with optional profile fields
- Auto-login after successful registration
- Form validation

### User Features

#### New Booking (`/bookings/new`)
Comprehensive booking form with:
- Personal information (auto-filled from profile)
- Event details (name, dates, attendees)
- Space selection with capacity info
- Seating arrangement options
- Required services (valet, catering, etc.)
- Agenda and comments

#### User Dashboard (`/dashboard`)
- View all booking requests
- Track status: Pending, Approved, Denied, Edit Requested
- See admin comments and feedback
- Quick access to create new bookings

### Admin Features

#### Admin Dashboard (`/admin`)
- View all booking requests
- Filter by status
- Approve, deny, or request edits
- Add admin comments
- Real-time updates

**Access**: Requires admin role

## 🎨 UI Components

Located in `components/ui/`:

- **Button**: Primary actions with variants
- **Input**: Form inputs
- **Textarea**: Multi-line text input
- **Label**: Form labels
- **Card**: Content containers
- Styled with Tailwind CSS
- Fully typed with TypeScript

## 🔄 State Management

### Authentication Context

The `AuthContext` manages:
- User session (stored in localStorage)
- Login/logout/register functions
- JWT token management
- Admin role checking

Usage:
```tsx
const { user, login, logout, isAdmin } = useAuth();
```

### API Client

The API client (`lib/api.ts`) provides:
- Axios instance with base URL
- Auto token injection
- Response/error interceptors
- Type-safe API methods

## 🗓️ Calendar Integration

Uses FullCalendar for interactive calendar:
- **Plugins**: Day Grid, Time Grid, Interaction
- **Views**: Month, Week, Day
- **Events**: Color-coded by visibility
  - Public: Blue
  - Private: Gray
  - Internal: Amber

## 📝 Form Validation

Forms use React Hook Form with Zod for validation:
- Type-safe form data
- Real-time validation
- Error messages
- Accessibility support

## 🔒 Protected Routes

Pages automatically redirect if:
- User not authenticated → `/auth/login`
- Non-admin accessing admin pages → `/dashboard`

Implementation in each page component:
```tsx
useEffect(() => {
  if (!user) {
    router.push('/auth/login');
  }
}, [user, router]);
```

## 🎯 User Flows

### Booking Flow
1. User clicks "Book a Space" or "New Booking"
2. If not logged in → redirected to login
3. Fill out comprehensive booking form
4. Submit → confirmation screen
5. Redirect to dashboard
6. Track status in dashboard
7. Receive email notifications on status changes

### Admin Flow
1. Admin logs in
2. Access admin dashboard
3. Filter bookings by status
4. Review pending requests
5. Approve, deny, or request edits with comments
6. Email sent to user automatically

## 🌐 API Integration

All API calls are centralized in `lib/api.ts`:

```tsx
// Authentication
await authApi.login({ email, password });
await authApi.register({ email, password, ... });

// Bookings
await bookingsApi.create(bookingData);
await bookingsApi.getUserBookings();

// Calendar
await calendarApi.getEvents(spaceId, from, to);

// Admin
await adminApi.getAllBookings(filters);
await adminApi.approveBooking(id, { adminComment });
```

## 🎨 Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom color scheme
- Responsive design
- Dark mode ready

### CSS Variables
Defined in `globals.css`:
- Primary/secondary colors
- Background/foreground
- Border/input styles
- Muted colors

## 📦 Build & Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build
npm run build

# Start
npm run start
```

### Environment-Specific Builds
- `.env.local` - Development
- `.env.production` - Production

## 🧪 Best Practices

1. **Type Safety**: All components use TypeScript
2. **Error Handling**: Try-catch blocks with user-friendly messages
3. **Loading States**: Disable buttons and show loading text
4. **Accessibility**: Semantic HTML and ARIA labels
5. **Responsive**: Mobile-first design
6. **Performance**: Dynamic imports for heavy components

## 🔗 Related Documentation

- [SPEC.md](../SPEC.md) - Complete system specification
- [Backend README](../backend/README.md) - Backend API documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [FullCalendar Documentation](https://fullcalendar.io/docs)

## 📝 Notes

- All dates/times are in UTC and displayed in Asia/Dubai timezone
- Private bookings show as "Reserved (Private)" in public calendar
- Admin comments are visible to users in their dashboard
- JWT tokens stored in localStorage with auto-refresh handling

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use existing UI components
3. Maintain consistent styling with Tailwind
4. Test on mobile and desktop
5. Handle errors gracefully

## 📄 License

UNLICENSED - Proprietary software for Coders HQ
