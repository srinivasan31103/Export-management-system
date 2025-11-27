import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { createServer } from 'http';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import websocketService from './src/services/websocket.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import skuRoutes from './routes/skuRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import docsRoutes from './routes/docsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import importRoutes from './routes/importRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ExportSuite API is running', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/import', importRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/users', userRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server and initialize WebSocket
    const httpServer = createServer(app);
    websocketService.initialize(httpServer);
    console.log('✓ WebSocket service initialized');

    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
    });

    // Schedule cron jobs
    scheduleCronJobs();

  } catch (error) {
    console.error('✗ Unable to start server:', error);
    process.exit(1);
  }
};

// Cron jobs for scheduled tasks
const scheduleCronJobs = () => {
  // Daily report at 6 AM
  cron.schedule('0 6 * * *', () => {
    console.log('Running daily report generation...');
    // Add logic to generate and email daily reports
  });

  // Check shipment ETAs every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('Checking shipment ETAs...');
    // Add logic to check and notify about upcoming arrivals
  });
};

startServer();

export default app;
