# 🚀 Quick Start - CHQ Space Management Platform

## Fastest Way to Run Everything

### 1️⃣ Start PostgreSQL

Make sure PostgreSQL is running on your computer.

**Windows**: Open Services → Start "postgresql" service
**Or**: Use pgAdmin and make sure server is running

### 2️⃣ Open TWO Command Prompt Windows

#### Window 1 - Backend
```bash
cd "C:\Users\User\Desktop\claude\CodersHQ event Registration\backend"

# First time only - setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start backend
npm run start:dev
```

Wait until you see: `Application is running on: http://localhost:4000/api`

#### Window 2 - Frontend
```bash
cd "C:\Users\User\Desktop\claude\CodersHQ event Registration\frontend"

# Start frontend
npm run dev
```

Wait until you see: `Ready on http://localhost:3000`

### 3️⃣ Open Your Browser

Go to: **http://localhost:3000**

### 4️⃣ Login as Admin

- Email: `admin@codershq.ae`
- Password: `Admin@123456`

---

## 📝 That's It!

You can now:
- ✅ Create bookings
- ✅ View calendar
- ✅ Approve/deny requests (as admin)

---

## ⚠️ If Something Goes Wrong

1. **Backend won't start?**
   - Check PostgreSQL is running
   - Check `backend\.env` file exists
   - Make sure port 4000 is not in use

2. **Frontend won't start?**
   - Make sure backend is running first
   - Check `frontend\.env.local` exists
   - Make sure port 3000 is not in use

3. **Database errors?**
   ```bash
   cd backend
   npx prisma migrate reset
   npm run prisma:seed
   ```

---

## 🛑 To Stop

Press `Ctrl+C` in both command prompt windows.

---

See [README.md](./README.md) for detailed documentation.
