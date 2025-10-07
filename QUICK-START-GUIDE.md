# ⚡ QUICK START - Choose Your Method

## The Application Needs a Database

You have **3 options** to run this application. Choose the one that works for you:

---

## ✅ Option 1: Docker (Easiest - Recommended)

### Step 1: Start Docker Desktop
- Open Docker Desktop application
- Wait until it shows "Docker Desktop is running"

### Step 2: Start Everything with Docker
```bash
cd "CodersHQ event Registration/backend"
docker-compose up -d
```

This starts PostgreSQL, Redis, and the Backend automatically!

### Step 3: Start Frontend
```bash
cd "CodersHQ event Registration/frontend"
npm run dev
```

### Step 4: Open Browser
Go to: **http://localhost:3000**

Login: `admin@codershq.ae` / `Admin@123456`

---

## ✅ Option 2: Install PostgreSQL Locally

### Step 1: Install PostgreSQL
Download and install from: https://www.postgresql.org/download/windows/

During installation:
- Set password: `postgres`
- Port: `5432`
- Remember your settings!

### Step 2: Create Database
Open **pgAdmin** (installed with PostgreSQL) or use command line:
```sql
CREATE DATABASE chq_space_management;
```

### Step 3: Update Backend .env File
Edit: `backend\.env`

Replace the DATABASE_URL line with:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chq_space_management?schema=public"
```

(Replace `postgres:postgres` with your PostgreSQL username:password if different)

### Step 4: Setup Database
```bash
cd "CodersHQ event Registration/backend"
npm run prisma:migrate
npm run prisma:seed
```

### Step 5: Start Backend
```bash
npm run start:dev
```

### Step 6: Start Frontend (New Terminal)
```bash
cd "CodersHQ event Registration/frontend"
npm run dev
```

### Step 7: Open Browser
Go to: **http://localhost:3000**

Login: `admin@codershq.ae` / `Admin@123456`

---

## ✅ Option 3: Use SQLite (No Database Install Needed)

### Step 1: Update Backend for SQLite
Edit: `backend\prisma\schema.prisma`

Change lines 8-11 from:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Step 2: Update Backend .env
Edit: `backend\.env`

Replace DATABASE_URL with:
```
DATABASE_URL="file:./dev.db"
```

### Step 3: Setup Database
```bash
cd "CodersHQ event Registration/backend"
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Step 4: Start Backend
```bash
npm run start:dev
```

### Step 5: Start Frontend (New Terminal)
```bash
cd "CodersHQ event Registration/frontend"
npm run dev
```

### Step 6: Open Browser
Go to: **http://localhost:3000**

Login: `admin@codershq.ae` / `Admin@123456`

---

## 🎯 Which Option Should You Choose?

- **Have Docker Desktop?** → Use Option 1 (Docker)
- **Want permanent database?** → Use Option 2 (PostgreSQL)
- **Just want to test quickly?** → Use Option 3 (SQLite)

---

## ❓ Still Having Issues?

### Problem: "Docker Desktop is not running"
**Solution**: Open Docker Desktop application and wait for it to start

### Problem: "Can't connect to database"
**Solution**:
- Option 1: Make sure Docker Desktop is running
- Option 2: Make sure PostgreSQL service is running
- Option 3: Check that you updated schema.prisma for SQLite

### Problem: "Port already in use"
**Solution**:
- Backend uses port 4000
- Frontend uses port 3000
- Close any applications using these ports

---

## 📞 Need Help?

Check the detailed guides:
- **README.md** - Complete documentation
- **HOW-TO-RUN.txt** - Step-by-step text guide
- **backend/README.md** - Backend details
- **frontend/README.md** - Frontend details
