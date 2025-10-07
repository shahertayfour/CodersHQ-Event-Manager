# Deployment Guide

## Overview
This guide covers deploying the CHQ Space Management application to production.

## Backend Deployment

### Option 1: Railway (Recommended - Easy)

1. **Prepare for deployment:**
   - Sign up at [Railway.app](https://railway.app)
   - Install Railway CLI: `npm install -g @railway/cli`

2. **Create production environment file** (already created as `.env.production`)

3. **Deploy:**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

4. **Add environment variables in Railway dashboard:**
   - DATABASE_URL (Railway will provide PostgreSQL)
   - JWT_SECRET
   - ADMIN_EMAIL
   - ADMIN_PASSWORD
   - FRONTEND_URL (your frontend domain)

### Option 2: Render

1. Sign up at [Render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install && npx prisma generate && npm run build`
5. Set start command: `cd backend && npm run start:prod`
6. Add environment variables in Render dashboard

### Option 3: Heroku

1. Install Heroku CLI
2. Deploy:
   ```bash
   cd backend
   heroku create chq-space-backend
   heroku addons:create heroku-postgresql:mini
   git push heroku main
   ```

## Frontend Deployment

### Option 1: Netlify (Recommended - Easy)

1. **Update API URL:**
   - Edit `frontend-html/js/config.js`
   - Change `API_URL` to your production backend URL

2. **Deploy:**
   - Sign up at [Netlify.com](https://netlify.com)
   - Drag and drop the `frontend-html` folder
   - Or use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     cd frontend-html
     netlify deploy --prod
     ```

### Option 2: Vercel

```bash
npm install -g vercel
cd frontend-html
vercel --prod
```

### Option 3: GitHub Pages

1. Push code to GitHub
2. Go to repository Settings > Pages
3. Select branch and `/frontend-html` folder
4. Your site will be live at `https://username.github.io/repo-name`

## Database Migration to Production

### If using PostgreSQL:

1. **Update Prisma schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Environment Variables

### Backend (.env.production):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random string
- `ADMIN_EMAIL`: Admin email
- `ADMIN_PASSWORD`: Admin password
- `FRONTEND_URL`: Your frontend domain
- `SENDGRID_API_KEY`: (Optional) For email notifications
- `GOOGLE_CLIENT_ID`: (Optional) For Google OAuth
- `GOOGLE_CLIENT_SECRET`: (Optional) For Google OAuth

### Frontend (config.js):
- Update `API_URL` to production backend URL

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update ADMIN_PASSWORD to a secure password
- [ ] Configure CORS to only allow your frontend domain
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up proper database backups
- [ ] Review and remove any console.log statements
- [ ] Set NODE_ENV=production

## Quick Deploy (All-in-One)

For the fastest deployment, I recommend:

1. **Backend**: Railway or Render (free tier)
2. **Frontend**: Netlify (free tier)

Total time: ~15 minutes
Total cost: Free (with limitations)

## Testing Production

After deployment:
1. Visit frontend URL
2. Try logging in with admin credentials
3. Create a test booking
4. Approve it in admin panel
5. Check calendar display
