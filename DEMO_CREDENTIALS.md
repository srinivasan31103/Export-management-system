# ExportSuite - Demo Login Credentials

## How to Set Up Demo Data

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Run the seed script to create demo data:**
   ```bash
   npm run seed
   ```

This will:
- Reset the database (drops existing tables)
- Create 4 demo users with different roles
- Add sample buyers, warehouses, SKUs, and orders
- Set up compliance rules

---

## Demo Login Credentials

### 👨‍💼 Admin User
- **Email:** `admin@exportsuite.com`
- **Password:** `admin123`
- **Role:** Administrator
- **Permissions:** Full system access, user management, all features

### 👔 Manager User
- **Email:** `manager@exportsuite.com`
- **Password:** `manager123`
- **Role:** Manager
- **Permissions:** Order management, inventory oversight, reports

### 📋 Clerk User
- **Email:** `clerk@exportsuite.com`
- **Password:** `clerk123`
- **Role:** Clerk
- **Permissions:** Order entry, document preparation, basic operations

### 🛒 Buyer User (Customer Portal)
- **Email:** `buyer@importco.com`
- **Password:** `buyer123`
- **Role:** Buyer
- **Permissions:** View own orders, track shipments, download documents

---

## Sample Data Included

### Buyers (2)
1. **UK Import Co Ltd** - Bob Williams
   - Country: United Kingdom
   - Currency: GBP
   - Credit Limit: $50,000
   - Payment Terms: NET30

2. **Europa Trading GmbH** - Maria Garcia
   - Country: Germany
   - Currency: EUR
   - Credit Limit: $75,000
   - Payment Terms: NET45

### Warehouses (2)
1. **Main Warehouse** (WH-MAIN)
   - Location: Newark, New Jersey, USA
   - Contact: warehouse@exportsuite.com

2. **West Coast Facility** (WH-WEST)
   - Location: Los Angeles, California, USA
   - Contact: west@exportsuite.com

### Products/SKUs (4)
1. **SKU-001** - Stainless Steel Cutlery Set (24 pieces)
   - HS Code: 821510
   - Price: $45.00
   - Stock: 500 units

2. **SKU-002** - Cotton Bath Towel Set (6 pieces)
   - HS Code: 630260
   - Price: $32.00
   - Stock: 750 units

3. **SKU-003** - LED Desk Lamp (Adjustable)
   - HS Code: 940520
   - Price: $28.50
   - Stock: 300 units

4. **SKU-004** - Ceramic Coffee Mug Set (4 pieces)
   - HS Code: 691110
   - Price: $22.00
   - Stock: 1,000 units

### Orders (2)
1. **Confirmed Order** (UK Import Co)
   - 100x SKU-001 (Cutlery Sets)
   - 50x SKU-003 (LED Lamps)
   - Total: $5,925.00 + tax
   - Incoterm: FOB
   - Destination: Southampton, UK

2. **Draft Order** (Europa Trading)
   - 200x SKU-002 (Towel Sets)
   - Total: $7,552.00 + tax
   - Incoterm: CIF
   - Destination: Hamburg, Germany

### Compliance Rules (3)
- UK general import requirements
- Germany cutlery import (CE marking)
- USA textile import (origin labeling)

---

## Quick Start Guide

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 3. Login
- Go to `http://localhost:5173`
- Use any of the demo credentials above
- Explore the system features based on your role

---

## Features to Test by Role

### As Admin (`admin@exportsuite.com`)
✅ Dashboard with full analytics
✅ Create and manage users
✅ View all orders and shipments
✅ Access compliance settings
✅ Generate reports
✅ System configuration

### As Manager (`manager@exportsuite.com`)
✅ Order management
✅ Inventory oversight
✅ Shipment tracking
✅ Document generation
✅ Team performance reports
✅ Buyer management

### As Clerk (`clerk@exportsuite.com`)
✅ Create new orders
✅ Edit draft orders
✅ Prepare shipping documents
✅ Update order status
✅ View inventory levels
✅ Generate invoices

### As Buyer (`buyer@importco.com`)
✅ View your orders
✅ Track shipments in real-time
✅ Download commercial documents
✅ View order history
✅ Check payment status
✅ Request quotes

---

## Testing Scenarios

### Scenario 1: Create a New Order
1. Login as **Clerk** or **Manager**
2. Go to Orders → New Order
3. Select a buyer (UK Import Co or Europa Trading)
4. Add SKU items
5. Set incoterm and shipping details
6. Submit order

### Scenario 2: AI HS Code Classification
1. Login as any user
2. Create/edit an order
3. Click "Classify with AI" for a product
4. Enter product description
5. System suggests HS code using Claude AI

### Scenario 3: Generate Documents
1. Login as **Admin** or **Manager**
2. Open a confirmed order
3. Go to Documents section
4. Generate:
   - Commercial Invoice
   - Packing List
   - Certificate of Origin
   - Delivery Order

### Scenario 4: Buyer Portal Experience
1. Login as **Buyer** (`buyer@importco.com`)
2. View your orders dashboard
3. Click on an order to see details
4. Download available documents
5. Track shipment on map (if shipped)

### Scenario 5: Real-time Notifications
1. Open two browsers
2. Login as **Admin** in browser 1
3. Login as **Buyer** in browser 2
4. Create/update order in admin view
5. See real-time notification in buyer view

---

## Database Reset

If you need to reset the database to fresh demo data:

```bash
cd backend
npm run seed
```

**Warning:** This will delete ALL existing data and recreate demo data.

---

## Troubleshooting

### Login Not Working?
1. Make sure backend server is running (`npm run dev`)
2. Check database is connected (see backend console)
3. Verify you ran `npm run seed` to create demo users
4. Try clearing browser cache/cookies

### No Data Showing?
1. Ensure seed script ran successfully
2. Check backend logs for database errors
3. Verify `.env` file has correct database credentials
4. Try re-running seed: `npm run seed`

### WebSocket Errors?
1. Ensure backend server is running
2. Check `VITE_WS_URL` in frontend `.env`
3. Verify CORS settings in backend `server.js`
4. Clear browser cache and refresh

---

## Production Notes

⚠️ **Important for Production:**
- Change all default passwords
- Use strong, unique passwords
- Enable proper password policies
- Set up password reset functionality
- Use environment variables for secrets
- Enable rate limiting on login endpoint
- Implement account lockout after failed attempts
- Use HTTPS in production
- Enable CSRF protection

---

## Support

For issues or questions:
- Check backend console logs
- Check browser console for frontend errors
- Review [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) for feature documentation
- Review [README.md](backend/README.md) for setup instructions

---

**Last Updated:** 2025-01-14
**Version:** 2.0.0
