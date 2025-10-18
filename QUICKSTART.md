# Quick Start Guide - CHQ Space Management

Get the CHQ Space Management System up and running in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- Git installed

## Steps

### 1. Clone & Navigate

```bash
git clone <your-repo-url>
cd CodersHQ-Event-Manager
```

### 2. Configure Environment

```bash
cp .env.example .env
```

**Edit `.env` and update:**
- `JWT_SECRET` - Use a strong random string (minimum 32 characters)
- `ADMIN_PASSWORD` - Set a secure admin password
- `POSTGRES_PASSWORD` - Set a secure database password

**Optional but recommended:**
- `SENDGRID_API_KEY` - For email notifications
- `SENDGRID_FROM_EMAIL` - Your sender email

### 3. Start All Services

```bash
docker compose up -d
```

Wait ~30 seconds for all services to start.

### 4. Access the Application

**Frontend:** http://localhost:8080

**Admin Login:**
- Email: `admin@codershq.ae`
- Password: (the one you set in `ADMIN_PASSWORD`)

### 5. Test It Out

1. **Create a user account** → http://localhost:8080/register.html
2. **Complete your profile** → http://localhost:8080/profile.html
3. **Create a booking** → http://localhost:8080/booking-form.html
4. **Login as admin** → http://localhost:8080/login.html
5. **Approve the booking** → http://localhost:8080/admin.html
6. **View the calendar** → http://localhost:8080/calendar.html

## Useful Commands

```bash
# View logs
docker compose logs -f

# Restart backend after code changes
docker compose up -d --build backend

# Stop everything
docker compose down

# Reset database (deletes all data)
docker compose down -v && docker compose up -d
```

## Troubleshooting

### Backend won't start
```bash
docker compose restart backend
docker compose logs backend
```

### Need to reset everything
```bash
docker compose down -v
docker compose up -d
```

### Port conflicts
Change ports in `docker-compose.yml` if 4000 or 8080 are already in use.

## What's Running?

- **Frontend** (Nginx): Port 8080
- **Backend** (NestJS): Port 4000
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Review [SPEC.md](SPEC.md) for system architecture
- Set up SendGrid for email notifications
- Configure Google OAuth (optional)

## Production Deployment

Current production uses:
- **Cloudflare Pages** for frontend
- **Cloudflare Tunnel** for backend
- See README.md for deployment details

## Support

Run the diagnostic script to check system status:
```bash
./CHECK-STATUS.sh
```

Check logs for errors:
```bash
docker compose logs -f
```

---

**That's it!** Your CHQ Space Management System is ready to use.
