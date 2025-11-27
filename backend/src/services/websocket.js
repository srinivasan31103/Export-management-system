import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('WebSocket service initialized');
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('name email role');

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.username} (${socket.id})`);

      // Store connected user
      this.connectedUsers.set(socket.user.id, socket.id);

      // Join user-specific room
      socket.join(`user:${socket.user.id}`);
      socket.join(`role:${socket.user.role}`);

      // Handle joining custom rooms
      socket.on('join:room', ({ room }) => {
        socket.join(room);
        console.log(`User ${socket.user.username} joined room: ${room}`);
      });

      // Handle leaving custom rooms
      socket.on('leave:room', ({ room }) => {
        socket.leave(room);
        console.log(`User ${socket.user.username} left room: ${room}`);
      });

      // Subscribe to specific order updates
      socket.on('subscribe:order', ({ orderId }) => {
        socket.join(`order:${orderId}`);
      });

      // Subscribe to specific shipment updates
      socket.on('subscribe:shipment', ({ shipmentId }) => {
        socket.join(`shipment:${shipmentId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
        this.connectedUsers.delete(socket.user.id);
      });

      // Send welcome notification
      this.sendToUser(socket.user.id, 'notification', {
        type: 'success',
        message: 'Connected to real-time updates',
      });
    });
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit(event, data);
      return true;
    }
    return false;
  }

  // Send message to all users with specific role
  sendToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  // Send message to specific room
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Order events
  notifyOrderCreated(order, userId) {
    this.sendToUser(userId, 'order:created', {
      orderNo: order.orderNo,
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
    });

    // Notify admins
    this.sendToRole('admin', 'order:created', {
      orderNo: order.orderNo,
      user: order.User?.username,
    });
  }

  notifyOrderUpdated(order) {
    // Notify order creator
    if (order.userId) {
      this.sendToUser(order.userId, 'order:updated', {
        orderNo: order.orderNo,
        id: order.id,
        status: order.status,
      });
    }

    // Notify subscribers
    this.sendToRoom(`order:${order.id}`, 'order:updated', {
      orderNo: order.orderNo,
      status: order.status,
      updatedAt: order.updatedAt,
    });
  }

  notifyOrderStatusChange(order, oldStatus, newStatus) {
    // Notify order creator
    if (order.userId) {
      this.sendToUser(order.userId, 'order:status', {
        orderNo: order.orderNo,
        oldStatus,
        status: newStatus,
      });
    }

    // Notify relevant roles
    const notifyRoles = ['admin', 'manager'];
    if (newStatus === 'confirmed') {
      notifyRoles.push('production');
    } else if (newStatus === 'packed') {
      notifyRoles.push('shipping');
    }

    notifyRoles.forEach((role) => {
      this.sendToRole(role, 'order:status', {
        orderNo: order.orderNo,
        status: newStatus,
      });
    });
  }

  // Shipment events
  notifyShipmentCreated(shipment) {
    // Notify order owner
    if (shipment.Order?.userId) {
      this.sendToUser(shipment.Order.userId, 'shipment:created', {
        shipmentNo: shipment.shipmentNo,
        orderNo: shipment.Order.orderNo,
      });
    }

    // Notify shipping team
    this.sendToRole('shipping', 'shipment:created', {
      shipmentNo: shipment.shipmentNo,
    });
  }

  notifyShipmentUpdated(shipment) {
    // Notify order owner
    if (shipment.Order?.userId) {
      this.sendToUser(shipment.Order.userId, 'shipment:updated', {
        shipmentNo: shipment.shipmentNo,
        status: shipment.status,
      });
    }

    // Notify subscribers
    this.sendToRoom(`shipment:${shipment.id}`, 'shipment:updated', {
      shipmentNo: shipment.shipmentNo,
      status: shipment.status,
      currentLocation: shipment.currentLocation,
    });
  }

  notifyShipmentLocation(shipment, location) {
    // Notify subscribers
    this.sendToRoom(`shipment:${shipment.id}`, 'shipment:location', {
      shipmentNo: shipment.shipmentNo,
      location,
      timestamp: new Date(),
    });
  }

  // Payment events
  notifyPaymentReceived(payment, order) {
    // Notify order owner
    if (order.userId) {
      this.sendToUser(order.userId, 'payment:received', {
        amount: payment.amount,
        currency: payment.currency,
        orderNo: order.orderNo,
      });
    }

    // Notify finance team
    this.sendToRole('admin', 'payment:received', {
      amount: payment.amount,
      currency: payment.currency,
      orderNo: order.orderNo,
    });
  }

  // Inventory events
  notifyLowStock(product) {
    // Notify production and admin
    ['production', 'admin'].forEach((role) => {
      this.sendToRole(role, 'inventory:low', {
        productName: product.name,
        quantity: product.quantity,
        reorderLevel: product.reorderLevel,
      });
    });
  }

  // Document events
  notifyDocumentGenerated(documentType, documentId, userId) {
    this.sendToUser(userId, 'document:generated', {
      documentType,
      documentId,
      timestamp: new Date(),
    });
  }

  // Generic notification
  sendNotification(userId, type, message) {
    this.sendToUser(userId, 'notification', {
      type,
      message,
      timestamp: new Date(),
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get all connected user IDs
  getConnectedUserIds() {
    return Array.from(this.connectedUsers.keys());
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
