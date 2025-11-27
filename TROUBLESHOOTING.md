# ExportSuite - Troubleshooting Guide

## Quick Diagnosis

Run this command to check your setup:

```bash
cd backend
npm run diagnose
```

This will check:
- ✅ Environment variables
- ✅ Required files
- ✅ MongoDB connection
- ✅ Dependencies
- ✅ Model files

---

## Common Server Errors

### ❌ Error: "Cannot find module 'mongoose'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd backend
npm install
```

---

### ❌ Error: "MongooseError: Operation failed"

**Cause:** MongoDB not running

**Solutions:**

**Windows:**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "MongoDB Server"
4. Right-click → Start

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify it's running:**
```bash
mongosh
# If it connects, MongoDB is running
```

---

### ❌ Error: "Cannot find module './models/index.js'"

**Cause:** Models not properly exported

**Solution:**

Check that `backend/models/index.js` exists and exports all models:

```javascript
export { default as User } from './User.js';
export { default as Buyer } from './Buyer.js';
// ... etc
```

---

### ❌ Error: "User.findByPk is not a function"

**Cause:** Using Sequelize methods with Mongoose models

**Solution:**

Replace Sequelize methods with Mongoose:
- `findByPk(id)` → `findById(id)`
- `findOne({ where: {...} })` → `findOne({...})`
- `findAll({ where: {...} })` → `find({...})`
- `create({...})` → `create({...})` (same)
- `update({...}, { where: {...} })` → `findByIdAndUpdate(id, {...})`
- `destroy({ where: {...} })` → `deleteOne({...})` or `deleteMany({...})`

---

### ❌ Error: "EADDRINUSE: address already in use :::5000"

**Cause:** Port 5000 is already in use

**Solutions:**

**Option 1: Stop the other process**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Option 2: Change the port**

Edit `backend/.env`:
```env
PORT=5001
```

---

### ❌ Error: "jwt must be provided"

**Cause:** JWT_SECRET not set in .env

**Solution:**

Check `backend/.env` has:
```env
JWT_SECRET=exportsuite-jwt-secret-key-change-in-production-2025
```

---

### ❌ Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** CORS not configured properly

**Solution:**

1. **Check frontend URL in backend/.env:**
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

2. **Verify CORS in server.js:**
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

3. **Check frontend is running on port 5173**

---

### ❌ Error: "Cannot read property '_id' of undefined"

**Cause:** Referenced document doesn't exist

**Solution:**

This usually happens when:
1. Database not seeded: Run `npm run seed`
2. Wrong ObjectId reference
3. Populate not used when needed

Example fix:
```javascript
// Wrong
const order = await Order.findById(id);
console.log(order.buyer_id.name); // Error!

// Correct
const order = await Order.findById(id).populate('buyer_id');
console.log(order.buyer_id.name); // Works!
```

---

## Frontend Errors

### ❌ Error: "Failed to fetch"

**Cause:** Backend not running

**Solution:**

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify backend is running:**
   Open http://localhost:5000/health in browser
   Should see: `{"success":true,"message":"ExportSuite API is running"}`

---

### ❌ Error: "Unexpected token < in JSON"

**Cause:** API returning HTML instead of JSON (usually 404 error)

**Solution:**

1. **Check API endpoint exists**
2. **Verify URL in frontend:**
   Check `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Check route paths match in backend**

---

### ❌ Error: Login page shows but login doesn't work

**Cause:** Database not seeded with users

**Solution:**

```bash
cd backend
npm run seed
```

Then login with:
- Email: `admin@exportsuite.com`
- Password: `admin123`

---

## MongoDB Issues

### ❌ Error: "command find requires authentication"

**Cause:** MongoDB has authentication enabled but credentials not provided

**Solution:**

**Option 1: Use authentication**
```env
MONGODB_URI=mongodb://username:password@localhost:27017/exportsuite
```

**Option 2: Disable auth (development only)**
```bash
# Edit MongoDB config
# Set: security.authorization: "disabled"
```

---

### ❌ Error: "Topology was destroyed"

**Cause:** MongoDB connection lost

**Solution:**

1. **Restart MongoDB service**
2. **Restart backend server**
3. **Check network/firewall**

---

### ❌ MongoDB Compass can't connect

**Solutions:**

1. **Use correct connection string:**
   ```
   mongodb://localhost:27017
   ```

2. **Check MongoDB is running:**
   ```bash
   mongosh
   ```

3. **Check port 27017 is open:**
   ```bash
   netstat -an | findstr :27017  # Windows
   lsof -i :27017                # macOS/Linux
   ```

---

## Installation Issues

### ❌ Error: "npm install" fails

**Solutions:**

1. **Clear cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use Node.js 18+:**
   ```bash
   node --version  # Should be v18 or higher
   ```

---

### ❌ Error: "Python not found" during npm install

**Cause:** Some packages (like bcrypt) need Python to build

**Solutions:**

**Windows:**
1. Install Visual Studio Build Tools
2. Or install pre-built binary:
   ```bash
   npm install --ignore-scripts
   ```

**macOS:**
```bash
xcode-select --install
```

---

## Debugging Tips

### Enable Debug Logging

**Backend:**

Add to `backend/.env`:
```env
DEBUG=*
NODE_ENV=development
```

**MongoDB:**

Add to connection:
```javascript
mongoose.set('debug', true);
```

### Check Logs

**Backend logs:**
- Look at terminal running `npm run dev`
- Check for error stack traces

**Frontend logs:**
- Press F12 in browser
- Check Console tab
- Check Network tab for failed requests

### Test API Directly

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exportsuite.com","password":"admin123"}'
```

---

## Step-by-Step Reset

If nothing works, start fresh:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Backend - Clean install
cd backend
rm -rf node_modules package-lock.json
npm install

# 3. Start MongoDB
# Windows: services.msc → MongoDB Server → Start
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 4. Seed database
npm run seed

# 5. Start backend
npm run dev

# 6. Frontend - Clean install (new terminal)
cd frontend
rm -rf node_modules package-lock.json
npm install

# 7. Start frontend
npm run dev

# 8. Open browser
# Go to: http://localhost:5173
# Login: admin@exportsuite.com / admin123
```

---

## Still Having Issues?

### Run Full Diagnostics

```bash
cd backend
npm run diagnose
```

This checks:
- Environment variables
- File structure
- MongoDB connection
- Dependencies
- Database collections

### Check Versions

```bash
node --version   # Should be v18+
npm --version    # Should be v9+
mongod --version # Should be v6+
```

### Common Checklist

- [ ] MongoDB service is running
- [ ] `npm install` completed successfully (both backend and frontend)
- [ ] `.env` files configured correctly
- [ ] `npm run seed` ran successfully
- [ ] No errors in terminal
- [ ] No errors in browser console (F12)
- [ ] Backend accessible at http://localhost:5000/health
- [ ] Frontend accessible at http://localhost:5173

---

## Get Help

1. **Check error logs** - Terminal and browser console
2. **Run diagnostics** - `npm run diagnose`
3. **Review documentation:**
   - [MONGODB_SETUP.md](MONGODB_SETUP.md)
   - [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)
   - [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)

---

**Last Updated:** 2025-01-14
**Version:** 2.0.0
