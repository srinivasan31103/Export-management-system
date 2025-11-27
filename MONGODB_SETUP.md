# ExportSuite - MongoDB Setup Guide

## Stack Overview

✅ **Frontend:** React 18 + Vite + Tailwind CSS
✅ **Backend:** Node.js + Express.js
✅ **Database:** MongoDB + Mongoose
✅ **Real-time:** Socket.IO (WebSocket)
✅ **Language:** JavaScript (ES6+)

---

## Prerequisites

Install these before starting:

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **MongoDB** (v6+) - [Download](https://www.mongodb.com/try/download/community)
3. **Git** (optional) - [Download](https://git-scm.com/)

---

## Step 1: Install MongoDB

### Windows Installation

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download MSI installer

2. **Run the Installer:**
   - Double-click the downloaded MSI file
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Install MongoDB Compass" (GUI tool)
   - Click "Install"

3. **Verify Installation:**
   ```bash
   mongod --version
   ```
   Should show: `db version v6.x.x` or similar

4. **Start MongoDB Service:**
   - Open "Services" (Win + R → `services.msc`)
   - Find "MongoDB Server"
   - Right-click → Start
   - Set "Startup type" to "Automatic"

### macOS Installation

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Linux Installation (Ubuntu/Debian)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Step 2: Verify MongoDB is Running

### Check MongoDB Status

**Windows:**
```bash
# Check if service is running
sc query MongoDB

# Or connect to MongoDB
mongosh
```

**macOS/Linux:**
```bash
# Check service status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Connect to MongoDB
mongosh
```

### Test Connection

In MongoDB shell (`mongosh`):
```javascript
// Show databases
show dbs

// Create test database
use exportsuite

// Insert test document
db.test.insertOne({ message: "Hello MongoDB!" })

// Verify
db.test.find()

// Exit
exit
```

---

## Step 3: Setup Backend

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `mongoose` - MongoDB ODM
- `express` - Web framework
- `socket.io` - WebSocket support
- All other dependencies

### 2. Configure Environment Variables

The `backend/.env` file is already configured for MongoDB:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/exportsuite
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exportsuite
```

### 3. Seed Database (Create Demo Data)

```bash
npm run seed
```

You should see:
```
🌱 Starting database seed...
✓ MongoDB Connected: localhost
✓ Database collections cleared
✓ Admin user created
✓ Manager user created
✓ Clerk user created
✓ Buyer user created
✓ Buyers created
✓ Warehouses created
✓ SKUs created
✓ Inventory created
✓ Sample order created
✓ Draft order created
✓ Compliance rules created

✅ Database seeding completed successfully!

📋 Login Credentials:
  Admin:   admin@exportsuite.com / admin123
  Manager: manager@exportsuite.com / manager123
  Clerk:   clerk@exportsuite.com / clerk123
  Buyer:   buyer@importco.com / buyer123
```

### 4. Start Backend Server

```bash
npm run dev
```

You should see:
```
✓ MongoDB Connected: localhost
✓ Database: exportsuite
✓ WebSocket service initialized
✓ Server running on port 5000
✓ Environment: development
✓ Frontend URL: http://localhost:5173
```

---

## Step 4: Setup Frontend

### 1. Install Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

### 2. Start Frontend

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

## Step 5: Test the Application

### 1. Open Browser

Navigate to: **http://localhost:5173**

### 2. Login

Use any demo credentials:
- **Email:** `admin@exportsuite.com`
- **Password:** `admin123`

### 3. Verify Features

After login, check:
- ✅ Dashboard loads with statistics
- ✅ Navigation works
- ✅ Orders page shows sample data
- ✅ SKUs page shows products
- ✅ Dark mode toggle works
- ✅ Real-time notifications appear

---

## MongoDB GUI Tools

### MongoDB Compass (Recommended)

Installed with MongoDB, provides:
- Visual database browser
- Query builder
- Index management
- Performance monitoring

**Connect:**
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"
4. Browse "exportsuite" database

### Alternative Tools

- **Studio 3T** - Advanced features, free tier
- **Robo 3T** - Lightweight, free
- **NoSQLBooster** - Query builder, free tier

---

## Common Issues & Solutions

### ❌ Issue: "MongoServerError: connect ECONNREFUSED"

**Cause:** MongoDB service not running

**Solution:**

**Windows:**
1. Open Services (`services.msc`)
2. Find "MongoDB Server"
3. Right-click → Start

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

---

### ❌ Issue: "npm run seed" fails with connection error

**Cause:** Wrong MongoDB URI or service not running

**Solution:**

1. **Check MongoDB is running:**
   ```bash
   mongosh
   ```

2. **Verify URI in `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/exportsuite
   ```

3. **Try connection manually:**
   ```bash
   mongosh mongodb://localhost:27017/exportsuite
   ```

---

### ❌ Issue: "Failed to fetch" or "Network Error" in frontend

**Cause:** Backend not running or wrong URL

**Solution:**

1. **Check backend is running:**
   - Look for terminal showing "Server running on port 5000"

2. **Test backend API:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"success":true,"message":"ExportSuite API is running"}`

3. **Check frontend .env:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

### ❌ Issue: Login fails with "Invalid credentials"

**Cause:** Database not seeded

**Solution:**

```bash
cd backend
npm run seed
```

Then try logging in with:
- Email: `admin@exportsuite.com`
- Password: `admin123`

---

### ❌ Issue: "Cannot find module 'mongoose'"

**Cause:** Dependencies not installed

**Solution:**

```bash
cd backend
rm -rf node_modules
npm install
```

---

## MongoDB Shell Commands

Useful commands for managing the database:

```javascript
// Connect to database
use exportsuite

// Show all collections
show collections

// Count documents
db.users.countDocuments()
db.orders.countDocuments()

// Find all users
db.users.find().pretty()

// Find specific user
db.users.findOne({ email: "admin@exportsuite.com" })

// Update user
db.users.updateOne(
  { email: "admin@exportsuite.com" },
  { $set: { name: "Super Admin" } }
)

// Delete collection
db.users.deleteMany({})

// Drop database (careful!)
db.dropDatabase()

// Show database stats
db.stats()
```

---

## Database Collections

The application creates these MongoDB collections:

| Collection | Purpose | Documents |
|------------|---------|-----------|
| `users` | System users & authentication | 4 demo users |
| `buyers` | International buyers/customers | 2 buyers |
| `skus` | Products/items for sale | 4 products |
| `warehouses` | Storage facilities | 2 warehouses |
| `inventories` | Stock levels per warehouse | 4 inventory records |
| `orders` | Export orders | 2 sample orders |
| `orderitems` | Line items in orders | 3 order items |
| `compliancerules` | Export regulations | 3 rules |
| `shipments` | Freight tracking | Created as needed |
| `documents` | Generated PDFs | Created as needed |
| `transactions` | Payments | Created as needed |
| `quotes` | Price quotations | Created as needed |
| `auditlogs` | Activity tracking | Created as needed |

---

## MongoDB vs PostgreSQL

This project was converted from PostgreSQL to MongoDB:

| Feature | PostgreSQL | MongoDB |
|---------|-----------|----------|
| **Type** | SQL (Relational) | NoSQL (Document) |
| **Schema** | Fixed schema | Flexible schema |
| **ORM/ODM** | Sequelize | Mongoose |
| **IDs** | UUID or Serial | ObjectId |
| **Joins** | Native JOINs | Population (refs) |
| **Transactions** | Full ACID | ACID (single document) |
| **Query** | SQL | JavaScript objects |

**Why MongoDB?**
- ✅ Flexible schema for evolving data
- ✅ Easy JSON storage (JSONB → Mixed)
- ✅ Simpler setup (no SQL setup needed)
- ✅ Natural fit for JavaScript/Node.js
- ✅ Horizontal scaling

---

## MongoDB Atlas (Cloud Option)

For production or testing without local MongoDB:

### 1. Create Free Cluster

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a free cluster (M0)
4. Create database user
5. Whitelist IP: `0.0.0.0/0` (allow all)

### 2. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/exportsuite
   ```

### 3. Update .env

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exportsuite
```

Replace `username` and `password` with your credentials.

### 4. Run Seed Script

```bash
npm run seed
```

Data will be uploaded to cloud!

---

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection (Mongoose)
├── models/
│   ├── User.js            # User schema
│   ├── Buyer.js           # Buyer schema
│   ├── Order.js           # Order schema
│   └── index.js           # Export all models
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   ├── orderRoutes.js     # Order CRUD
│   └── ...
├── controllers/
│   └── ...                # Business logic
├── middleware/
│   └── auth.js            # JWT authentication
├── scripts/
│   └── seed.js            # MongoDB seed script
├── .env                   # Environment config
├── server.js              # Express server
└── package.json           # Dependencies

frontend/
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── services/          # API client
│   ├── store/             # Zustand state
│   └── styles/            # Tailwind CSS
├── .env                   # Frontend config
└── package.json           # Dependencies
```

---

## Quick Commands Reference

```bash
# MongoDB Service
mongod                      # Start MongoDB (manual)
mongosh                     # MongoDB shell
brew services start mongodb # macOS start
sudo systemctl start mongod # Linux start

# Backend
cd backend
npm install                 # Install dependencies
npm run seed                # Seed database
npm run dev                 # Start dev server
npm run test-db             # Test MongoDB connection

# Frontend
cd frontend
npm install                 # Install dependencies
npm run dev                 # Start dev server
npm run build               # Build for production

# MongoDB Shell
use exportsuite             # Switch database
show collections            # List collections
db.users.find()             # Query users
db.dropDatabase()           # Delete database
```

---

## Next Steps

After successful setup:

1. ✅ Explore the application with different user roles
2. ✅ Read [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md) for all login info
3. ✅ Read [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) for features
4. ✅ Read [COLOR_PALETTE.md](COLOR_PALETTE.md) for design system
5. ✅ Check MongoDB Compass to see the data
6. ✅ Customize for your business needs

---

## Production Deployment

For production:

### Backend
- Use MongoDB Atlas (managed cloud)
- Enable SSL/TLS connections
- Set strong JWT secrets
- Enable rate limiting
- Use PM2 for process management

### Frontend
- Build: `npm run build`
- Deploy to Vercel/Netlify
- Update API URL to production backend

### Security
- Change all default passwords
- Use environment variables for secrets
- Enable CORS only for your domain
- Set up proper authentication
- Enable MongoDB authentication

---

**Setup Date:** 2025-01-14
**Version:** 2.0.0
**Database:** MongoDB + Mongoose
**Status:** ✅ Production Ready

Your ExportSuite is now running with MongoDB!
