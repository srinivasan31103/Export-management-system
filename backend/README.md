# ExportSuite Backend

Production-ready Export Management System backend built with Node.js, Express, PostgreSQL, and Claude AI.

## Features

- ✅ Complete authentication & authorization (JWT + role-based access control)
- ✅ Orders, SKUs, Inventory, Shipments management
- ✅ Auto-generate export documents (Commercial Invoice, Packing List, COO, B/L)
- ✅ Claude AI integration for HS code classification and business insights
- ✅ Buyer portal with limited access
- ✅ Payments & transactions tracking
- ✅ Freight quotation & landed cost calculator
- ✅ Comprehensive reports & analytics
- ✅ CSV bulk import for orders and SKUs
- ✅ Email notifications
- ✅ Audit logging
- ✅ Webhooks for carrier & payment gateway integration

## Technology Stack

- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL 14+ with Sequelize ORM
- **Authentication:** JWT + bcrypt
- **PDF Generation:** Puppeteer + Handlebars
- **AI:** Claude AI (Anthropic SDK)
- **File Storage:** AWS S3 or local storage
- **Email:** Nodemailer
- **CSV Parsing:** csv-parse
- **File Upload:** Multer

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Claude API key (from Anthropic)
- (Optional) AWS account for S3 storage
- (Optional) SMTP credentials for email

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exportsuite
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Claude AI (REQUIRED for HS classification)
CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# AWS S3 (or use local storage)
USE_LOCAL_STORAGE=true

# Email (Optional - set for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=ExportSuite <noreply@exportsuite.com>
```

### 3. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE exportsuite;

# Exit
\q
```

### 4. Run Database Migrations & Seed

```bash
# Seed the database with sample data
npm run seed
```

This will create:
- Admin, Manager, Clerk, and Buyer user accounts
- Sample buyers, warehouses, SKUs
- Sample orders
- Compliance rules

### 5. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 6. Verify Installation

Test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "ExportSuite API is running",
  "timestamp": "2025-01-14T..."
}
```

## Default Login Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@exportsuite.com | admin123 |
| Manager | manager@exportsuite.com | manager123 |
| Clerk | clerk@exportsuite.com | clerk123 |
| Buyer | buyer@importco.com | buyer123 |

**⚠️ Change these passwords in production!**

## API Documentation

### Authentication

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "clerk"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@exportsuite.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Admin User", "email": "admin@exportsuite.com", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Orders

#### Create Order
```bash
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "buyerId": 1,
  "items": [
    {
      "sku": "SKU-001",
      "description": "Stainless Steel Cutlery Set",
      "qty": 100,
      "unitPrice": 45.00,
      "hsCode": "821510"
    }
  ],
  "incoterm": "FOB",
  "currency": "USD",
  "expectedShipDate": "2025-02-01"
}
```

#### Get All Orders
```bash
GET /api/orders?page=1&limit=20&status=confirmed
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Order by ID
```bash
GET /api/orders/1
Authorization: Bearer YOUR_JWT_TOKEN
```

### AI Endpoints

#### HS Code Classification
```bash
POST /api/ai/hs-classify
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "stainless steel cutlery set 24 pieces"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "hsCode": "821510",
    "reasons": [
      "Product falls under cutlery category",
      "Stainless steel material classification"
    ],
    "confidence": 92
  }
}
```

#### Document Summary
```bash
POST /api/ai/doc-summary
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "orderId": 1
}
```

#### Business Insights
```bash
POST /api/ai/business-insights
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "timeframe": "last_30_days"
}
```

### Document Generation

#### Generate Commercial Invoice
```bash
GET /api/docs/order/1/invoice
Authorization: Bearer YOUR_JWT_TOKEN
```

Returns PDF file for download.

#### Generate Packing List
```bash
GET /api/docs/order/1/packing-list
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Generate Certificate of Origin
```bash
GET /api/docs/order/1/certificate-of-origin
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Generate Bill of Lading
```bash
GET /api/docs/shipment/1/bill-of-lading
Authorization: Bearer YOUR_JWT_TOKEN
```

### Reports

#### Sales Report
```bash
GET /api/reports/sales?from=2025-01-01&to=2025-01-31&groupBy=month
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Export to CSV
```bash
GET /api/reports/export-csv?type=orders&from=2025-01-01&to=2025-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

### Bulk Import

#### Import Orders from CSV
```bash
POST /api/import/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: orders.csv
```

CSV format:
```csv
buyerEmail,sku,description,qty,unitPrice,hsCode,currency,incoterm
buyer@importco.com,SKU-001,Cutlery Set,100,45.00,821510,USD,FOB
```

#### Import SKUs from CSV
```bash
POST /api/import/skus
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: skus.csv
```

## Project Structure

```
backend/
├── server.js                 # Main entry point
├── config/
│   ├── db.js                # Database connection
│   └── awsS3.js             # S3 file storage config
├── models/                   # Sequelize models
│   ├── index.js
│   ├── user.js
│   ├── buyer.js
│   ├── order.js
│   ├── orderItem.js
│   ├── sku.js
│   ├── inventory.js
│   ├── warehouse.js
│   ├── shipment.js
│   ├── document.js
│   ├── transaction.js
│   ├── auditLog.js
│   ├── quote.js
│   └── complianceRule.js
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── orderController.js
│   ├── skuController.js
│   ├── shipmentController.js
│   ├── docsController.js
│   ├── aiController.js
│   ├── reportController.js
│   └── ...
├── routes/                   # API routes
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── aiRoutes.js
│   └── ...
├── middleware/               # Custom middleware
│   ├── auth.js              # JWT verification
│   ├── roles.js             # Role-based access control
│   └── errorHandler.js      # Global error handler
├── utils/                    # Utility functions
│   ├── aiClient.js          # Claude AI integration
│   ├── pdfGenerator.js      # PDF document generation
│   ├── pricingUtil.js       # Freight & landed cost calculations
│   ├── emailService.js      # Email notifications
│   ├── auditLogger.js       # Audit log creation
│   └── hsUtils.js           # HS code utilities
├── scripts/
│   └── seed.js              # Database seeding script
├── uploads/                  # Local file storage (if not using S3)
├── .env.example             # Environment variables template
├── package.json
└── README.md
```

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all features, user management |
| **manager** | Create/edit orders, shipments, buyers, view reports |
| **clerk** | Create/edit orders, shipments, basic operations |
| **buyer** | View own orders and shipments only (buyer portal) |
| **freight_agent** | View shipments, update tracking info |

## Claude AI Integration

The system uses Claude AI for:

1. **HS Code Classification** - Automatically classify products
2. **Document Summary** - Identify missing fields in orders
3. **Business Insights** - Generate analytics and recommendations

Ensure `CLAUDE_API_KEY` is set in your `.env` file.

Example prompt used for HS classification:
```
You are a customs classification assistant. Given product description:
"stainless steel cutlery set 12 pcs" return the most likely HS code (6-digit),
2 short reasons, and a confidence score (0-100).
Output JSON format: {"hsCode":"821510","reasons":[...],"confidence":85}
```

## Production Deployment

### 1. Environment Setup
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure PostgreSQL with proper credentials
- Set up AWS S3 for file storage
- Configure SMTP for emails

### 2. Database Migrations
Instead of `sync()`, use proper migrations in production.

### 3. Process Management
Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name exportsuite-api
pm2 save
pm2 startup
```

### 4. Reverse Proxy
Use Nginx or similar:

```nginx
server {
    listen 80;
    server_name api.exportsuite.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate
Use Let's Encrypt for HTTPS.

## Testing

### Test HS Code Classification
```bash
curl -X POST http://localhost:5000/api/ai/hs-classify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "cotton t-shirt mens large"}'
```

### Test Document Generation
```bash
curl -X GET http://localhost:5000/api/docs/order/1/invoice \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output invoice.pdf
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Puppeteer Error on Linux
Install Chrome dependencies:
```bash
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0
```

### Claude AI Errors
- Verify API key is correct
- Check account has credits
- Review error messages in console

## Support

For issues or questions:
- Check logs in console
- Review audit logs in database
- Check environment variables

## License

MIT
