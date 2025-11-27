# Quick Fix for Server.js Errors

## Most Common Issues & Instant Fixes

### Issue 1: MongoDB Not Running

**Error message:**
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix:**
```bash
# Windows: Start MongoDB service
services.msc
# Find "MongoDB Server" → Right-click → Start

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

### Issue 2: Dependencies Not Installed

**Error message:**
```
Cannot find module 'mongoose'
```

**Fix:**
```bash
cd backend
npm install
```

---

### Issue 3: Models Index Missing

**Error message:**
```
Cannot find module './models/index.js'
```

**Fix:** The models/index.js should already be created. If not, run:

```bash
cd backend
npm run diagnose
```

This will show you which files are missing.

---

### Issue 4: Sequelize Methods in Mongoose

**Error message:**
```
User.findByPk is not a function
```

**This has been fixed!** The WebSocket service was updated to use Mongoose methods.

---

## Quick Start (From Scratch)

If server.js fails, follow these exact steps:

### 1. Install MongoDB

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Run installer → Complete installation
3. Start service: `services.msc` → MongoDB Server → Start

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Verify .env File

Check `backend/.env` has:
```env
MONGODB_URI=mongodb://localhost:27017/exportsuite
JWT_SECRET=exportsuite-jwt-secret-key-change-in-production-2025
```

### 4. Run Diagnostics

```bash
npm run diagnose
```

Should show all ✓ checkmarks.

### 5. Seed Database

```bash
npm run seed
```

Should complete without errors.

### 6. Start Server

```bash
npm run dev
```

Should show:
```
✓ MongoDB Connected: localhost
✓ Database: exportsuite
✓ WebSocket service initialized
✓ Server running on port 5000
```

---

## If You See Specific Errors

### Error: "SyntaxError: Unexpected token"

**Cause:** Node.js version too old

**Fix:**
```bash
node --version  # Should be v18+
```

If lower than v18, download latest from https://nodejs.org/

---

### Error: "EADDRINUSE: address already in use"

**Cause:** Port 5000 already used

**Fix:**

Change port in `backend/.env`:
```env
PORT=5001
```

---

### Error: "ValidationError: User validation failed"

**Cause:** Required fields missing in seed data

**This should be fixed!** The seed script has all required fields.

If you still see this, check the error details to see which field is missing.

---

## Test Each Component

### 1. Test MongoDB Connection

```bash
mongosh
# If it connects → MongoDB is working ✓
```

### 2. Test Backend Without Starting

```bash
cd backend
npm run diagnose
```

### 3. Test Seed Script

```bash
npm run seed
```

### 4. Start Server

```bash
npm run dev
```

### 5. Test API

Open browser: http://localhost:5000/health

Should see:
```json
{"success":true,"message":"ExportSuite API is running"}
```

---

## What To Share If Still Failing

If you're still getting errors, please share:

1. **The exact error message** (copy from terminal)
2. **Result of `npm run diagnose`**
3. **Node.js version:** `node --version`
4. **MongoDB status:**
   ```bash
   mongosh  # Does it connect?
   ```

---

## Files Modified for MongoDB

These files were changed from PostgreSQL to MongoDB:

✅ `backend/package.json` - Added mongoose
✅ `backend/config/db.js` - MongoDB connection
✅ `backend/server.js` - Uses connectDB()
✅ `backend/models/*` - All 13 models converted
✅ `backend/scripts/seed.js` - MongoDB version
✅ `backend/src/services/websocket.js` - Uses findById
✅ `backend/.env` - MONGODB_URI

All other files work the same!

---

## Complete Reset Command

If everything fails, run this complete reset:

```bash
# Stop all servers (Ctrl+C)

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm run seed
npm run dev
```

This will:
1. Clean install all dependencies
2. Create fresh database with demo data
3. Start the server

---

**Need immediate help?** Run `npm run diagnose` and share the output!
