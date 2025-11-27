# ExportSuite - Complete Export Management System

A production-ready, full-stack export management platform built with Node.js, Express, PostgreSQL, React, and Claude AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## Overview

ExportSuite is an end-to-end export operations platform designed for exporters, freight forwarders, and customs agents. It streamlines the entire export workflow from enquiries to final delivery, with integrated AI capabilities for smart classification and insights.

### Key Features

✅ **Complete Order Management** - Create, track, and manage export orders
✅ **Inventory & Warehouse Management** - Real-time stock tracking across multiple locations
✅ **Shipment Tracking** - Monitor shipments with carrier integration
✅ **Document Auto-Generation** - Commercial Invoice, Packing List, Certificate of Origin, Bill of Lading
✅ **AI-Powered HS Classification** - Claude AI integration for automatic product classification
✅ **Buyer Portal** - Self-service portal for buyers to track orders
✅ **Role-Based Access Control** - Admin, Manager, Clerk, Buyer, Freight Agent roles
✅ **Payment & Transaction Tracking** - Multi-currency support with payment gateway integration
✅ **Reports & Analytics** - Sales reports, pending shipments, lead time analysis
✅ **Bulk Import** - CSV import for orders and SKUs
✅ **Email Notifications** - Automated status update emails
✅ **Compliance Management** - Country-specific compliance rules and requirements

## Technology Stack

### Backend
- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL 14+ with Sequelize ORM
- **Authentication:** JWT + bcrypt
- **PDF Generation:** Puppeteer + Handlebars
- **AI:** Claude AI by Anthropic
- **File Storage:** AWS S3 / Local storage
- **Email:** Nodemailer

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Quick Start

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Claude API key from [Anthropic](https://console.anthropic.com/)
- (Optional) AWS account for S3 storage
- (Optional) SMTP credentials for email

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/exportsuite.git
cd exportsuite
```

2. **Setup Backend**

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and API credentials

# Create PostgreSQL database
createdb exportsuite

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

3. **Setup Frontend**

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Default Login Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@exportsuite.com | admin123 |
| **Manager** | manager@exportsuite.com | manager123 |
| **Clerk** | clerk@exportsuite.com | clerk123 |
| **Buyer** | buyer@importco.com | buyer123 |

**⚠️ Important:** Change these passwords in production!

## Project Structure

```
exportsuite/
├── backend/                    # Backend API server
│   ├── server.js              # Main entry point
│   ├── config/                # Database and AWS S3 configuration
│   ├── models/                # Sequelize models
│   ├── controllers/           # Request handlers
│   ├── routes/                # API routes
│   ├── middleware/            # Auth, roles, error handling
│   ├── utils/                 # AI client, PDF generator, utilities
│   ├── scripts/               # Database seed script
│   └── README.md              # Backend documentation
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Main app component
│   │   ├── api/               # API client
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   └── styles/            # CSS styles
│   └── README.md              # Frontend documentation
│
└── README.md                   # This file
```

## Core Workflows

### 1. Create Export Order

1. Login as Admin/Manager/Clerk
2. Navigate to Orders → New Order
3. Select buyer, add items with HS codes
4. Configure incoterm, ports, ship date
5. Submit order

### 2. Generate Export Documents

1. Open order details
2. Click "Generate Invoice" or "Generate Packing List"
3. PDF downloads automatically
4. Documents stored in database

### 3. Create Shipment

1. From order details, click "Create Shipment"
2. Enter carrier details, container info
3. Set ETD/ETA
4. Track shipment status

### 4. Use AI HS Classifier

1. Navigate to AI Tools
2. Enter product description (e.g., "cotton t-shirts")
3. Click "Classify HS Code"
4. Get instant HS code with confidence score and reasons

### 5. Buyer Portal

1. Login as buyer
2. View all orders for your company
3. Track shipment status
4. Download documents

## API Documentation

### Authentication

**Login**
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
    "user": { "id": 1, "name": "Admin User", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Orders

**Create Order**
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "buyerId": 1,
  "items": [
    {
      "sku": "SKU-001",
      "description": "Product",
      "qty": 100,
      "unitPrice": 45.00,
      "hsCode": "821510"
    }
  ],
  "incoterm": "FOB",
  "currency": "USD"
}
```

**Get All Orders**
```bash
GET /api/orders?page=1&limit=20&status=confirmed
Authorization: Bearer <token>
```

### AI Classification

**Classify HS Code**
```bash
POST /api/ai/hs-classify
Authorization: Bearer <token>
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

### Document Generation

**Generate Commercial Invoice**
```bash
GET /api/docs/order/1/invoice
Authorization: Bearer <token>
```

Returns PDF file for download.

For complete API documentation, see [Backend README](backend/README.md).

## Configuration

### Backend Environment Variables

Key variables in `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_NAME=exportsuite
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-secret-key

# Claude AI (Required)
CLAUDE_API_KEY=sk-ant-your-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Storage
USE_LOCAL_STORAGE=true

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment Variables

In `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Claude AI Integration

The system uses Claude AI (Anthropic) for:

1. **HS Code Classification** - Automatically classify products based on description
2. **Document Analysis** - Identify missing fields in export documents
3. **Business Insights** - Generate analytics and recommendations

### Example Prompt Used

```
You are a customs classification assistant. Given product description:
"stainless steel cutlery set 12 pcs" return the most likely HS code (6-digit),
2 short reasons, and a confidence score (0-100).

Output JSON format:
{
  "hsCode": "821510",
  "reasons": ["...", "..."],
  "confidence": 85
}
```

Get your Claude API key at: https://console.anthropic.com/

## Deployment

### Backend Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production PostgreSQL
   - Set up AWS S3 for file storage

2. **Process Management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name exportsuite-api
   pm2 save
   pm2 startup
   ```

3. **Reverse Proxy (Nginx)**
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
       }
   }
   ```

### Frontend Deployment

1. **Build**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify/Vercel**
   ```bash
   # Netlify
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist

   # Vercel
   npm install -g vercel
   vercel --prod
   ```

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

## Role-Based Access Control

| Feature | Admin | Manager | Clerk | Buyer | Freight Agent |
|---------|-------|---------|-------|-------|---------------|
| Create Orders | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage SKUs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Shipments | ✅ | ✅ | ✅ | ❌ | ✅ |
| Generate Docs | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Orders | ✅ | ✅ | ✅ | ✅ | ❌ |

## Sample Data

The seed script creates:
- 4 users (Admin, Manager, Clerk, Buyer)
- 2 buyers (UK and Germany)
- 2 warehouses
- 4 SKUs with inventory
- 2 sample orders
- 3 compliance rules

## Troubleshooting

### Backend Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials in .env
psql -U postgres -d exportsuite
```

**Puppeteer Error (Linux)**
```bash
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 \
  libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0
```

### Frontend Issues

**API Connection Error**
- Verify backend is running on http://localhost:5000
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

**Build Errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Security

- Never commit `.env` files
- Use strong JWT secrets in production
- Implement rate limiting for API endpoints
- Enable HTTPS in production
- Regularly update dependencies
- Validate all user inputs
- Use parameterized queries to prevent SQL injection

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Check documentation in `backend/README.md` and `frontend/README.md`
- Review error logs in backend console
- Check audit logs in database

## Roadmap

- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Integration with more carriers
- [ ] Blockchain for document verification
- [ ] OCR for document scanning

## Acknowledgments

- Claude AI by Anthropic for intelligent classification
- Tailwind CSS for beautiful UI components
- React ecosystem for robust frontend
- PostgreSQL for reliable data storage

---

**Built with ❤️ for the global export community**
