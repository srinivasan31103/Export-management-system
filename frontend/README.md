# ExportSuite Frontend

Modern, responsive React frontend for the ExportSuite Export Management System.

## Features

- Modern UI with Tailwind CSS
- Role-based dashboard and navigation
- Order management with real-time updates
- SKU catalog management
- Shipment tracking
- AI-powered HS code classification
- Document generation and preview
- Buyer portal with limited access
- Responsive design for mobile and desktop

## Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Tables:** TanStack React Table
- **Charts:** Chart.js + React-ChartJS-2

## Prerequisites

- Node.js >= 18.x
- Backend API running on http://localhost:5000

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` and automatically open in your browser.

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json
├── .env.example
└── src/
    ├── main.jsx           # Application entry point
    ├── App.jsx            # Main app component with routing
    ├── router.jsx         # Router configuration
    ├── api/
    │   └── apiClient.js   # Axios client and API endpoints
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── Orders.jsx
    │   ├── OrderDetails.jsx
    │   ├── SKUs.jsx
    │   ├── Shipments.jsx
    │   ├── BuyerPortal.jsx
    │   └── DocsViewer.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── OrderForm.jsx
    │   ├── SKUForm.jsx
    │   ├── HSClassifier.jsx
    │   └── PDFViewer.jsx
    └── styles/
        └── index.css       # Global styles and Tailwind imports
```

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Login Credentials

Use these credentials to login (after running backend seed):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@exportsuite.com | admin123 |
| Manager | manager@exportsuite.com | manager123 |
| Clerk | clerk@exportsuite.com | clerk123 |
| Buyer | buyer@importco.com | buyer123 |

## Features by Role

### Admin
- Full access to all features
- User management
- System configuration
- All CRUD operations

### Manager
- Create and manage orders, buyers, SKUs
- View reports and analytics
- Generate documents
- Manage shipments

### Clerk
- Create and view orders
- Update shipment status
- Generate documents
- Limited access to reports

### Buyer
- View own orders only
- Track shipments
- Download documents
- Limited buyer portal view

## Key Components

### API Client (`src/api/apiClient.js`)

Centralized Axios client with:
- Automatic JWT token injection
- Response/error interceptors
- Organized API endpoints by resource

```javascript
import { ordersAPI } from './api/apiClient';

// Get all orders
const response = await ordersAPI.getAll({ page: 1, limit: 20 });

// Create order
await ordersAPI.create(orderData);
```

### Forms

All forms use React Hook Form for validation:

```javascript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();
```

### Styling

Tailwind utility classes with custom components defined in `styles/index.css`:

```javascript
// Buttons
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>

// Inputs
<input className="input" />

// Cards
<div className="card p-6">Content</div>

// Badges
<span className="badge badge-success">Active</span>
```

## Building for Production

### 1. Build

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### 2. Preview Build

```bash
npm run preview
```

### 3. Deploy

Deploy the `dist/` folder to your hosting service:

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Static Hosting:**
Simply upload the `dist/` folder to any static hosting (S3, GitHub Pages, etc.)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Troubleshooting

### API Connection Error

**Issue:** Cannot connect to backend

**Solution:**
1. Verify backend is running on http://localhost:5000
2. Check VITE_API_URL in `.env`
3. Check browser console for CORS errors
4. Ensure backend CORS allows frontend origin

### Authentication Issues

**Issue:** Token expired or unauthorized errors

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check JWT_SECRET matches between frontend/backend
4. Verify token expiration settings

### Build Errors

**Issue:** Build fails with dependency errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Customization

### Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        // ...
      },
    },
  },
}
```

### Add New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/components/Sidebar.jsx`

### Add API Endpoint

Add to `src/api/apiClient.js`:

```javascript
export const myAPI = {
  getAll: () => apiClient.get('/my-endpoint'),
  create: (data) => apiClient.post('/my-endpoint', data),
};
```

## Performance Optimization

- Code splitting with React.lazy() for large components
- Image optimization with next-gen formats
- Minimize bundle size by removing unused dependencies
- Use production build for deployment
- Enable gzip compression on server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow existing code style
2. Use TypeScript for new components (optional)
3. Test on multiple screen sizes
4. Ensure accessibility (ARIA labels, keyboard navigation)

## License

MIT
