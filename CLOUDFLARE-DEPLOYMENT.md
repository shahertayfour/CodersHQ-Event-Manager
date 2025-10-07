# Cloudflare Deployment Guide

Complete guide to deploy CHQ Space Management System using Cloudflare Pages and Cloudflare Tunnel.

## Architecture

- **Frontend**: Cloudflare Pages at `dashboard.codershq.ae`
- **Backend API**: Local server exposed via Cloudflare Tunnel at `api.dashboard.codershq.ae`
- **Database**: PostgreSQL running locally in Docker

## Prerequisites

- Cloudflare account with `codershq.ae` domain added
- Docker Desktop installed on Windows
- Git installed
- Node.js 20+ installed

---

## Part 1: Deploy Frontend to Cloudflare Pages

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

### Step 3: Deploy Frontend

```bash
cd "CodersHQ event Registration/frontend-html"
npx wrangler pages deploy . --project-name=chq-dashboard
```

You'll get a URL like: `https://chq-dashboard.pages.dev`

### Step 4: Add Custom Domain

1. Go to https://dash.cloudflare.com
2. Select **codershq.ae** domain
3. Navigate to **Workers & Pages** → **chq-dashboard**
4. Click **Custom domains** tab
5. Click **Set up a custom domain**
6. Enter: `dashboard.codershq.ae`
7. Click **Activate domain**

Cloudflare will automatically create the DNS record.

---

## Part 2: Set Up Cloudflare Tunnel for Backend

### Step 1: Install Cloudflared

**Option A: Using winget (Recommended)**
```bash
winget install --id Cloudflare.cloudflared
```

**Option B: Manual download**
Download from: https://github.com/cloudflare/cloudflared/releases/latest

### Step 2: Authenticate

```bash
cloudflared tunnel login
```

This opens your browser to select your Cloudflare account.

### Step 3: Create Tunnel

```bash
cloudflared tunnel create chq-backend
```

**Important**: Save the Tunnel ID shown in the output!

Example output:
```
Tunnel credentials written to: C:\Users\User\.cloudflared\abc123-def456-ghi789.json
Created tunnel chq-backend with id abc123-def456-ghi789
```

### Step 4: Configure Tunnel

Copy the template and update with your tunnel ID:

```bash
# Copy to .cloudflared directory
copy "cloudflared-config.yml" "%USERPROFILE%\.cloudflared\config.yml"
```

Edit `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: abc123-def456-ghi789
credentials-file: C:\Users\User\.cloudflared\abc123-def456-ghi789.json

ingress:
  - hostname: api.dashboard.codershq.ae
    service: http://localhost:4000
  - service: http_status:404
```

**Replace**:
- `abc123-def456-ghi789` with your actual tunnel ID
- The credentials file path with the actual path shown

### Step 5: Create DNS Route

```bash
cloudflared tunnel route dns chq-backend api.dashboard.codershq.ae
```

This creates a CNAME record in Cloudflare DNS automatically.

### Step 6: Verify DNS (Optional)

Go to Cloudflare Dashboard:
1. Select **codershq.ae** domain
2. Go to **DNS** → **Records**
3. Verify these records exist:
   - `dashboard` → CNAME to `chq-dashboard.pages.dev` (created by Pages)
   - `api.dashboard` → CNAME to your tunnel ID (created by tunnel route)

---

## Part 3: Configure Environment Variables

### Step 1: Update Backend Environment

Edit `.env` file in project root:

```env
# Database Configuration
POSTGRES_USER=chquser
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
POSTGRES_DB=chq_space_management

# JWT Configuration (IMPORTANT: Use strong secret!)
JWT_SECRET=YOUR_VERY_STRONG_SECRET_AT_LEAST_32_CHARACTERS
JWT_EXPIRATION=7d

# Admin Account
ADMIN_EMAIL=admin@codershq.ae
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD

# Frontend URL
FRONTEND_URL=https://dashboard.codershq.ae

# Environment
NODE_ENV=production
PORT=4000

# Optional: SendGrid for emails
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@codershq.ae

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://api.dashboard.codershq.ae/api/auth/google/callback
```

**Important**: Use strong, unique values for production!

---

## Part 4: Start Everything

### Step 1: Start Backend and Database

```bash
cd "CodersHQ event Registration"
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 4000)

### Step 2: Verify Backend is Running

```bash
# Check containers
docker-compose ps

# Check backend logs
docker-compose logs -f backend

# Test backend locally
curl http://localhost:4000/api/spaces
```

### Step 3: Start Cloudflare Tunnel

Open a new terminal/command prompt:

```bash
cloudflared tunnel run chq-backend
```

You should see:
```
INF Connection registered connIndex=0 location=XXX
INF Connection registered connIndex=1 location=YYY
```

**Keep this terminal open!**

### Step 4: Test Your Deployment

Open your browser and test:

1. **Frontend**: https://dashboard.codershq.ae
2. **API Health Check**: https://api.dashboard.codershq.ae/api/spaces
3. **Login**: Use admin credentials from `.env`

---

## Part 5: Run Tunnel as Windows Service (Optional)

To keep the tunnel running automatically:

### Install as Service

```bash
cloudflared service install
```

### Start Service

```bash
net start cloudflared
```

### Check Service Status

```bash
sc query cloudflared
```

### Stop Service (if needed)

```bash
net stop cloudflared
```

---

## Updating the Application

### Update Frontend

```bash
cd "CodersHQ event Registration/frontend-html"

# Make your changes to HTML/CSS/JS files

# Redeploy to Cloudflare Pages
npx wrangler pages deploy . --project-name=chq-dashboard
```

Changes are live in ~1 minute!

### Update Backend

```bash
cd "CodersHQ event Registration"

# Pull latest changes from GitHub
git pull

# Rebuild and restart containers
docker-compose up -d --build
```

The tunnel automatically forwards to your local backend - no changes needed!

---

## Troubleshooting

### Frontend shows "Network Error"

**Check**:
1. Is tunnel running? `cloudflared tunnel info chq-backend`
2. Is backend running? `docker-compose ps`
3. Check browser console (F12) for error details

**Fix**:
```bash
# Restart tunnel
cloudflared tunnel run chq-backend

# Restart backend
docker-compose restart backend
```

### API returns CORS errors

**Check**: Verify `dashboard.codershq.ae` is in CORS origins in `backend/src/main.ts`

Already added in your configuration!

### Tunnel connection issues

**Check tunnel status**:
```bash
cloudflared tunnel info chq-backend
cloudflared tunnel list
```

**Recreate tunnel** (if needed):
```bash
cloudflared tunnel delete chq-backend
cloudflared tunnel create chq-backend
# Then reconfigure config.yml and route DNS
```

### Database connection errors

**Check database is running**:
```bash
docker-compose logs postgres
docker-compose restart postgres
```

**Reset database** (WARNING: Deletes all data):
```bash
docker-compose down -v
docker-compose up -d
```

### Can't access custom domain

**Wait for DNS propagation**: Can take up to 5 minutes

**Verify DNS records**:
```bash
nslookup dashboard.codershq.ae
nslookup api.dashboard.codershq.ae
```

Both should return Cloudflare IPs (104.x.x.x or 172.x.x.x)

---

## Monitoring

### View Tunnel Logs

```bash
# If running in terminal
# Check the terminal where you ran: cloudflared tunnel run chq-backend

# If running as service
cloudflared tunnel info chq-backend
```

### View Backend Logs

```bash
docker-compose logs -f backend
```

### View Database Logs

```bash
docker-compose logs -f postgres
```

### View All Logs

```bash
docker-compose logs -f
```

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Cloudflare Pages | Free | $0/month |
| Cloudflare Tunnel | Free | $0/month |
| Cloudflare DNS | Free | $0/month |
| **Total** | | **$0/month** |

Your domain registration cost is separate (varies by registrar).

---

## Security Best Practices

### ✅ Already Configured

- HTTPS automatically via Cloudflare
- CORS properly configured
- JWT authentication
- Input validation with class-validator
- SQL injection protection via Prisma ORM

### 📋 Additional Recommendations

1. **Change default passwords**:
   - Update `ADMIN_PASSWORD` in `.env`
   - Update `POSTGRES_PASSWORD` in `.env`

2. **Use strong JWT secret**:
   ```bash
   # Generate random secret (PowerShell)
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

3. **Enable Cloudflare security features**:
   - Go to Cloudflare Dashboard → Security
   - Enable Bot Fight Mode
   - Configure Rate Limiting rules
   - Enable DDoS protection (default)

4. **Set up database backups**:
   ```bash
   # Manual backup
   docker exec chq-postgres pg_dump -U chquser chq_space_management > backup.sql
   ```

5. **Monitor access logs**:
   - Cloudflare Dashboard → Analytics → Security

---

## Support

### Quick Commands Reference

```bash
# Start everything
docker-compose up -d
cloudflared tunnel run chq-backend

# Stop everything
cloudflared tunnel stop
docker-compose down

# View logs
docker-compose logs -f
cloudflared tunnel info chq-backend

# Update frontend
cd frontend-html && npx wrangler pages deploy .

# Update backend
git pull && docker-compose up -d --build

# Reset database
docker-compose down -v && docker-compose up -d
```

### Useful Links

- Cloudflare Dashboard: https://dash.cloudflare.com
- Cloudflare Tunnel Docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/

---

## Success Checklist

- [ ] Frontend deployed to Cloudflare Pages
- [ ] Custom domain `dashboard.codershq.ae` configured
- [ ] Cloudflare Tunnel created and configured
- [ ] API subdomain `api.dashboard.codershq.ae` routed
- [ ] `.env` file configured with secure values
- [ ] Docker containers running (backend + database)
- [ ] Tunnel running (terminal or service)
- [ ] Can access https://dashboard.codershq.ae
- [ ] Can login with admin credentials
- [ ] Can create and approve bookings
- [ ] Calendar displays approved events

---

🎉 **Your CHQ Space Management System is now live on Cloudflare!**

Visit: https://dashboard.codershq.ae
