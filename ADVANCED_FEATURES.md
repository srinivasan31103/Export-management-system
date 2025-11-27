# ExportSuite - Advanced Features Documentation

## Overview

This document describes all the advanced features that have been added to the ExportSuite Export Management System, including real-time updates, advanced visualizations, dark mode, and enhanced user experience components.

---

## Table of Contents

1. [Real-Time Features](#real-time-features)
2. [Advanced UI Components](#advanced-ui-components)
3. [Data Visualization](#data-visualization)
4. [Import/Export Utilities](#importexport-utilities)
5. [Error Handling](#error-handling)
6. [State Management](#state-management)
7. [Animations & Transitions](#animations--transitions)

---

## Real-Time Features

### WebSocket Service

**Location**: `frontend/src/services/websocket.js`, `backend/src/services/websocket.js`

The WebSocket service provides real-time bidirectional communication between the server and clients.

#### Frontend Usage

```javascript
import websocketService from '../services/websocket';

// Connect with authentication token
websocketService.connect(authToken);

// Subscribe to events
const unsubscribe = websocketService.on('order:created', (data) => {
  console.log('New order created:', data);
});

// Subscribe to specific order
websocketService.subscribeToOrder(orderId);

// Send messages
websocketService.send('custom:event', { data });

// Cleanup
unsubscribe();
```

#### Backend Events

The backend automatically emits the following events:

- `order:created` - New order created
- `order:updated` - Order details updated
- `order:status` - Order status changed
- `shipment:created` - New shipment created
- `shipment:updated` - Shipment updated
- `shipment:location` - Real-time location tracking
- `payment:received` - Payment processed
- `inventory:low` - Low stock alert
- `document:generated` - Document ready for download

#### React Hook

```javascript
import { useWebSocket } from '../services/websocket';

function MyComponent() {
  useWebSocket('order:updated', (data) => {
    // Handle order update
  });
}
```

---

## Advanced UI Components

### 1. Theme Toggle

**Location**: `frontend/src/components/ThemeToggle.jsx`

Animated dark mode toggle switch.

```javascript
import ThemeToggle from './components/ThemeToggle';

<ThemeToggle />
```

The theme state is persisted in localStorage and syncs across all components using Zustand.

### 2. Notification System

**Location**: `frontend/src/components/NotificationToast.jsx`

Beautiful toast notifications with animations.

```javascript
import { notify } from './components/NotificationToast';

// Basic notifications
notify.success('Operation successful!');
notify.error('Something went wrong');
notify.warning('Please review');
notify.info('New information available');

// Specialized notifications
notify.orderCreated('ORD-001');
notify.orderUpdated('ORD-001', 'shipped');
notify.shipmentCreated('SHP-001');
notify.paymentReceived(5000, 'USD');
```

### 3. Advanced Search & Filtering

**Location**: `frontend/src/components/AdvancedSearch.jsx`

Comprehensive search and filter component with multiple criteria.

```javascript
<AdvancedSearch
  onSearch={({ searchTerm, filters, dateRange }) => {
    // Handle search
  }}
  onFilterChange={(filters) => {
    // Handle filter changes
  }}
  filterConfig={[
    // Custom filter configurations
  ]}
/>
```

Features:
- Text search across all fields
- Multi-select filters (status, country, etc.)
- Date range picker
- Amount range filters
- Quick filter presets
- Active filter chips with removal
- Animated panel expansion

### 4. File Upload with Drag & Drop

**Location**: `frontend/src/components/FileUpload.jsx`

Advanced file upload component with preview and progress tracking.

```javascript
<FileUpload
  onUpload={async (files) => {
    // Handle file upload
    return uploadedFiles;
  }}
  accept={{ 'image/*': ['.png', '.jpg'], 'application/pdf': ['.pdf'] }}
  maxSize={5 * 1024 * 1024} // 5MB
  multiple={true}
/>
```

Features:
- Drag and drop interface
- Image preview thumbnails
- Upload progress animation
- File validation
- Error handling
- Remove uploaded files

### 5. Shipment Map Tracking

**Location**: `frontend/src/components/ShipmentMap.jsx`

Interactive map showing real-time shipment tracking.

```javascript
<ShipmentMap
  shipment={{
    origin: { lat, lng, name },
    destination: { lat, lng, name },
    currentLocation: { lat, lng },
    status: 'in-transit',
    route: [/* array of coordinates */]
  }}
/>
```

Features:
- Interactive Leaflet map
- Animated vessel icon
- Route visualization
- Port markers
- Journey timeline
- Real-time position updates

### 6. Data Table

**Location**: `frontend/src/components/DataTable.jsx`

Feature-rich data table with sorting, filtering, and pagination.

```javascript
<DataTable
  data={orders}
  columns={[
    { key: 'orderNo', label: 'Order #', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ]}
  searchable={true}
  sortable={true}
  paginated={true}
  pageSize={10}
  onRowClick={(row) => {/* handle click */}}
  rowActions={(row) => (
    <button>View</button>
  )}
/>
```

Features:
- Column sorting (asc/desc)
- Global search
- Client-side pagination
- Custom cell renderers
- Row click handlers
- Row actions column
- Animated row transitions
- Empty state handling

### 7. Loading Skeletons

**Location**: `frontend/src/components/LoadingSkeleton.jsx`

Professional loading states for better UX.

```javascript
import {
  TableSkeleton,
  CardSkeleton,
  StatsSkeleton,
  ChartSkeleton,
  PageSkeleton
} from './components/LoadingSkeleton';

// Use appropriate skeleton while loading
{isLoading ? <TableSkeleton rows={5} columns={6} /> : <DataTable {...props} />}
```

Available skeletons:
- `TableSkeleton` - For data tables
- `CardSkeleton` - For card grids
- `ListSkeleton` - For list views
- `StatsSkeleton` - For stat cards
- `FormSkeleton` - For forms
- `ChartSkeleton` - For charts
- `ProfileSkeleton` - For profile pages
- `PageSkeleton` - Full page loader

### 8. Export Components

**Location**: `frontend/src/components/ExportButton.jsx`

Easy data export to multiple formats.

```javascript
import ExportButton, { BulkExportButton } from './components/ExportButton';

// Single format export
<ExportButton
  data={orders}
  filename="orders"
  elementId="printable-table"
  title="Orders Report"
/>

// Multiple sheets export
<BulkExportButton
  sheets={{
    'Orders': ordersData,
    'Shipments': shipmentsData,
    'Payments': paymentsData
  }}
  filename="full-report"
/>
```

### 9. Error Boundary

**Location**: `frontend/src/components/ErrorBoundary.jsx`

Graceful error handling with recovery options.

```javascript
import ErrorBoundary, { ErrorFallback } from './components/ErrorBoundary';

// Wrap entire app or specific sections
<ErrorBoundary onReset={() => window.location.reload()}>
  <App />
</ErrorBoundary>

// For specific components
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>
```

---

## Data Visualization

### Enhanced Dashboard

**Location**: `frontend/src/pages/DashboardEnhanced.jsx`

Advanced dashboard with interactive charts and real-time data.

Features:
- **Stat Cards** - Animated metric cards with trends
- **Sales Chart** - Area chart showing sales over time
- **Order Distribution** - Pie chart by status
- **Revenue Chart** - Bar chart with monthly revenue
- **Recent Activity** - Real-time activity feed
- **Shipment Status** - Progress indicators

Charts use Recharts library with responsive design and dark mode support.

---

## Import/Export Utilities

**Location**: `frontend/src/utils/exportUtils.js`

Comprehensive data import/export functions.

### Export Functions

```javascript
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportMultipleSheets,
  formatForExport
} from '../utils/exportUtils';

// Export to Excel
await exportToExcel(data, 'orders', 'Orders Sheet');

// Export to CSV
await exportToCSV(data, 'orders');

// Export to PDF (requires element ID)
await exportToPDF('table-element', 'Orders Report');

// Export multiple sheets
await exportMultipleSheets({
  'Orders': ordersData,
  'Products': productsData
}, 'report');

// Format data before export
const formatted = formatForExport(
  data,
  { orderNo: 'Order Number', status: 'Status' }, // Column mapping
  ['id', 'userId'] // Exclude columns
);
```

### Import Functions

```javascript
import { importFromExcel, importFromCSV } from '../utils/exportUtils';

// Import Excel (returns object with sheet names as keys)
const sheets = await importFromExcel(file);
// { 'Sheet1': [...data], 'Sheet2': [...data] }

// Import CSV (returns array)
const data = await importFromCSV(file);
```

---

## Error Handling

### Client-Side

1. **Error Boundaries** - Catch React component errors
2. **Try-Catch Blocks** - Handle async operations
3. **Toast Notifications** - User-friendly error messages
4. **Form Validation** - Real-time input validation

### Server-Side

The error handler middleware automatically:
- Logs errors with stack traces
- Sends appropriate HTTP status codes
- Returns consistent error format
- Hides sensitive details in production

---

## State Management

**Location**: `frontend/src/store/useStore.js`

Global state management using Zustand.

### Theme Store

```javascript
import { useThemeStore } from '../store/useStore';

function MyComponent() {
  const { darkMode, toggleDarkMode, setDarkMode } = useThemeStore();

  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

### Notification Store

```javascript
import { useNotificationStore } from '../store/useStore';

const { notifications, addNotification, removeNotification } = useNotificationStore();
```

### Filter Store

```javascript
import { useFilterStore } from '../store/useStore';

const { filters, setFilter, clearFilter, clearAllFilters } = useFilterStore();
```

### Socket Store

```javascript
import { useSocketStore } from '../store/useStore';

const { socket, connected } = useSocketStore();
```

---

## Animations & Transitions

### Framer Motion Integration

All interactive components use Framer Motion for smooth animations:

```javascript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Tailwind Animations

Custom animations defined in `tailwind.config.js`:

- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up from bottom
- `animate-slide-down` - Slide down from top
- `animate-slide-in-right` - Slide in from right
- `animate-shimmer` - Shimmer loading effect
- `animate-gradient` - Animated gradient background
- `animate-pulse-slow` - Slow pulse
- `animate-bounce-slow` - Slow bounce
- `animate-spin-slow` - Slow spin

---

## Installation & Setup

### Frontend Dependencies

```bash
cd frontend
npm install
```

New packages added:
- `framer-motion` - Animations
- `react-hot-toast` - Notifications
- `react-dropzone` - File uploads
- `socket.io-client` - WebSocket
- `recharts` - Charts
- `react-leaflet` - Maps
- `leaflet` - Map library
- `react-select` - Advanced selects
- `zustand` - State management
- `xlsx` - Excel export/import
- `@headlessui/react` - Accessible UI components

### Backend Dependencies

```bash
cd backend
npm install
```

New package added:
- `socket.io` - WebSocket server

### Environment Variables

Add to `frontend/.env`:
```env
VITE_WS_URL=http://localhost:5000
```

Add to `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

---

## Best Practices

### Performance

1. **Lazy Loading** - Load components only when needed
2. **Memoization** - Use `useMemo` and `useCallback` for expensive operations
3. **Pagination** - Don't render large datasets all at once
4. **Virtual Scrolling** - For very long lists
5. **Debouncing** - For search inputs and filters

### Accessibility

1. **ARIA Labels** - All interactive elements have labels
2. **Keyboard Navigation** - Full keyboard support
3. **Focus Management** - Proper focus states
4. **Color Contrast** - WCAG AA compliant
5. **Screen Reader Support** - Semantic HTML

### Security

1. **Input Validation** - All user inputs validated
2. **XSS Prevention** - Sanitize user content
3. **CSRF Protection** - Token-based authentication
4. **Rate Limiting** - Prevent abuse
5. **Secure WebSocket** - Token-based WS authentication

---

## Troubleshooting

### WebSocket Connection Issues

If WebSocket fails to connect:
1. Check `VITE_WS_URL` environment variable
2. Verify JWT token is valid
3. Check CORS configuration
4. Ensure backend server is running

### Dark Mode Not Persisting

If dark mode resets on reload:
1. Check browser localStorage support
2. Clear browser cache
3. Verify Zustand persist middleware

### Export Not Working

If export fails:
1. Check browser compatibility (modern browsers only)
2. Verify data is in correct format
3. Check file permissions
4. Look for console errors

---

## Future Enhancements

Potential features to add:

1. **Advanced Analytics** - More detailed reporting
2. **AI Insights** - Predictive analytics
3. **Mobile App** - React Native version
4. **Offline Mode** - Progressive Web App
5. **Multi-language** - i18n support
6. **Custom Themes** - Brand customization
7. **Advanced Permissions** - Granular RBAC
8. **Audit Logs** - Detailed activity tracking
9. **API Documentation** - Interactive Swagger docs
10. **Testing Suite** - Unit and E2E tests

---

## Support

For issues or questions:
- Check the codebase documentation
- Review error logs in browser console
- Check network tab for API errors
- Verify environment variables are set correctly

---

**Version**: 2.0.0
**Last Updated**: 2025-01-14
**License**: MIT
