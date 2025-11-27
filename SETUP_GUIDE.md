# ExportSuite - Complete Setup Guide

## Prerequisites

Before starting, install these tools:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
3. **Git** (optional) - [Download](https://git-scm.com/)

---

## Step 1: Install PostgreSQL Database

### Windows Installation

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer (recommended version 15 or 16)

2. **Run the Installer:**
   - Double-click the downloaded file
   - Click "Next" through the wizard
   - **Important:** Remember the password you set for the `postgres` user
   - Default port: `5432` (keep this)
   - Click "Next" and finish installation

3. **Verify Installation:**
   ```bash
   psql --version
   ```
   Should show: `psql (PostgreSQL) 15.x` or similar

### Create Database

**Option A: Using pgAdmin (GUI)**
1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Right-click "Databases" → "Create" → "Database"
3. Database name: `exportsuite`
4. Click "Save"

**Option B: Using Command Line**
1. Open Command Prompt or PowerShell
2. Login to PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Enter the password you set during installation
4. Create database:
   ```sql
   CREATE DATABASE exportsuite;
   ```
5. Exit:
   ```sql
   \q
   ```

---

## Step 2: Configure Backend

### 1. Update `.env` File

Open `backend/.env` and update the database password:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exportsuite
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here  # ← Change this!
```

**Important:** Replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Run Database Migrations (Create Tables)

```bash
npm run seed
```

This will:
- Create all database tables
- Add demo users
- Add sample data (buyers, orders, products)

You should see:
```
✓ Database synchronized
✓ Admin user created
✓ Manager user created
✓ Clerk user created
✓ Buyer user created
✅ Database seeding completed successfully!
```

### 4. Start Backend Server

```bash
npm run dev
```

You should see:
```
✓ Database connection established
✓ Database models synchronized
✓ WebSocket service initialized
✓ Server running on port 5000
```

**If you see errors**, check the troubleshooting section below.

---

## Step 3: Configure Frontend

### 1. Install Frontend Dependencies

Open a **new terminal** window:

```bash
cd frontend
npm install
```

### 2. Start Frontend Server

```bash
npm run dev
```

You should see:
```
VITE v5.1.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 4: Test the Application

### 1. Open Browser

Go to: **http://localhost:5173**

### 2. Login with Demo Credentials

Try logging in with:
- **Email:** `admin@exportsuite.com`
- **Password:** `admin123`

### 3. Verify Features

After login, you should see:
- ✅ Dashboard with statistics
- ✅ Navigation menu working
- ✅ Orders, SKUs, Shipments pages
- ✅ Real-time notifications
- ✅ Dark mode toggle

---

## Common Issues & Solutions

### ❌ Issue: "Database connection failed"

**Cause:** PostgreSQL is not running or wrong credentials

**Solutions:**

1. **Check if PostgreSQL is running:**
   - Windows: Open "Services" → Find "postgresql-x64-15" → Start it
   - Or restart your computer

2. **Verify password in `.env`:**
   ```env
   DB_PASSWORD=your_actual_postgres_password
   ```

3. **Test database connection manually:**
   ```bash
   psql -U postgres -d exportsuite
   ```
   If this fails, your PostgreSQL credentials are wrong.

4. **Reset PostgreSQL password (if forgotten):**
   - Open pgAdmin 4
   - Right-click "PostgreSQL 15" server
   - Properties → Connection → Update password

---

### ❌ Issue: "Port 5000 already in use"

**Cause:** Another application is using port 5000

**Solution:**

Either:
1. **Stop the other application**, or
2. **Change the port** in `backend/.env`:
   ```env
   PORT=5001
   ```
   Then restart the backend server

---

### ❌ Issue: "relation does not exist" errors

**Cause:** Database tables were not created

**Solution:**

Run the seed script again:
```bash
cd backend
npm run seed
```

**Warning:** This will delete all existing data!

---

### ❌ Issue: Frontend shows "Network Error" or "Failed to fetch"

**Cause:** Backend server is not running or CORS issue

**Solutions:**

1. **Check backend is running:**
   - Look for backend terminal showing "Server running on port 5000"
   - If not, run: `cd backend && npm run dev`

2. **Check backend URL in browser:**
   - Open: http://localhost:5000/health
   - Should show: `{"success":true,"message":"ExportSuite API is running"}`

3. **Check CORS settings:**
   - Backend should show: `Frontend URL: http://localhost:5173`
   - If different, update `FRONTEND_URL` in `backend/.env`

---

### ❌ Issue: "Cannot find module" errors

**Cause:** Dependencies not installed

**Solution:**

```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules
npm install
```

---

### ❌ Issue: Login not working / No users found

**Cause:** Database not seeded with demo users

**Solution:**

```bash
cd backend
npm run seed
```

Then try logging in with:
- Email: `admin@exportsuite.com`
- Password: `admin123`

---

### ❌ Issue: "ECONNREFUSED" on PostgreSQL connection

**Cause:** PostgreSQL service is not running

**Solution (Windows):**

1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "postgresql-x64-15" (or similar)
4. Right-click → Start
5. Set "Startup type" to "Automatic"

**Alternative:**

Restart PostgreSQL from pgAdmin:
- Open pgAdmin 4
- Right-click server → Disconnect
- Right-click server → Connect

---

## Verification Checklist

Run through this checklist to verify everything works:

### Backend ✓
- [ ] PostgreSQL installed and running
- [ ] Database `exportsuite` created
- [ ] `npm install` completed in backend folder
- [ ] `npm run seed` ran successfully
- [ ] Backend server starts with `npm run dev`
- [ ] Can access http://localhost:5000/health
- [ ] No errors in backend console

### Frontend ✓
- [ ] `npm install` completed in frontend folder
- [ ] Frontend starts with `npm run dev`
- [ ] Can access http://localhost:5173
- [ ] Login page loads
- [ ] Can login with demo credentials
- [ ] Dashboard shows after login
- [ ] No errors in browser console (F12)

---

## Alternative: Use MongoDB Instead

If you prefer MongoDB over PostgreSQL, you'll need to:

1. Install MongoDB
2. Replace Sequelize with Mongoose
3. Rewrite all models for MongoDB
4. Update database configuration

**Note:** This requires significant code changes. PostgreSQL is the default and recommended option.

---

## Quick Start Commands

### Full Reset (Start Fresh)

```bash
# Stop all servers (Ctrl+C in terminals)

# Backend
cd backend
rm -rf node_modules
npm install
npm run seed
npm run dev

# In new terminal - Frontend
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Daily Startup (After Initial Setup)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Production Deployment

For production deployment, you'll need to:

1. **Database:**
   - Use hosted PostgreSQL (AWS RDS, Heroku Postgres, etc.)
   - Enable SSL connections
   - Set strong passwords

2. **Backend:**
   - Set `NODE_ENV=production`
   - Use process manager (PM2)
   - Enable HTTPS
   - Set strong JWT secret

3. **Frontend:**
   - Build for production: `npm run build`
   - Deploy to hosting (Vercel, Netlify, AWS S3)
   - Update API URL to production backend

---

## Getting Help

### Check Logs

**Backend logs:**
- Look at terminal running `npm run dev`
- Check for error messages

**Frontend logs:**
- Press F12 in browser
- Check Console tab for errors
- Check Network tab for failed requests

### Test API Directly

Test if backend API is working:

```bash
# Health check
curl http://localhost:5000/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exportsuite.com","password":"admin123"}'
```

Should return a JSON response with a token.

---

## Environment Variables Reference

### Required (Backend)
```env
PORT=5000                    # Backend port
DB_HOST=localhost            # PostgreSQL host
DB_PORT=5432                # PostgreSQL port
DB_NAME=exportsuite         # Database name
DB_USER=postgres            # Database user
DB_PASSWORD=your_password   # Database password
JWT_SECRET=your-secret-key  # JWT signing key
FRONTEND_URL=http://localhost:5173  # Frontend URL
```

### Optional (Backend)
```env
CLAUDE_API_KEY=sk-ant-...   # For AI features
AWS_ACCESS_KEY_ID=...       # For S3 uploads
REDIS_HOST=localhost        # For caching
SMTP_HOST=smtp.gmail.com    # For emails
```

### Frontend
```env
VITE_API_URL=http://localhost:5000/api  # Backend API URL
VITE_WS_URL=http://localhost:5000       # WebSocket URL
```

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Sequelize ORM
- **Real-time:** Socket.IO (WebSocket)
- **AI:** Anthropic Claude API
- **Auth:** JWT (JSON Web Tokens)

---

## Next Steps

After successful setup:

1. ✅ Read [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md) for login info
2. ✅ Read [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) for features
3. ✅ Read [COLOR_PALETTE.md](COLOR_PALETTE.md) for design system
4. ✅ Explore the application with different user roles
5. ✅ Customize for your needs

---

**Setup Date:** 2025-01-14
**Version:** 2.0.0
**Status:** Production Ready

For additional help, check the error logs and troubleshooting sections above.
