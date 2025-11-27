import { io } from 'socket.io-client';
import { useSocketStore } from '../store/useStore';
import { notify } from '../components/NotificationToast';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(token) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
    useSocketStore.getState().setSocket(this.socket);

    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      notify.success('Connected to real-time updates');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      useSocketStore.getState().disconnect();

      if (reason === 'io server disconnect') {
        // Server disconnected, attempt to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        notify.error('Unable to connect to real-time updates');
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      notify.success('Reconnected to real-time updates');
    });

    // Business event listeners
    this.setupBusinessEvents();
  }

  setupBusinessEvents() {
    if (!this.socket) return;

    // Order events
    this.socket.on('order:created', (data) => {
      notify.orderCreated(data.orderNo);
      this.emit('order:created', data);
    });

    this.socket.on('order:updated', (data) => {
      notify.orderUpdated(data.orderNo, data.status);
      this.emit('order:updated', data);
    });

    this.socket.on('order:status', (data) => {
      notify.info(`Order ${data.orderNo} status: ${data.status}`);
      this.emit('order:status', data);
    });

    // Shipment events
    this.socket.on('shipment:created', (data) => {
      notify.shipmentCreated(data.shipmentNo);
      this.emit('shipment:created', data);
    });

    this.socket.on('shipment:updated', (data) => {
      notify.shipmentUpdated(data.shipmentNo, data.status);
      this.emit('shipment:updated', data);
    });

    this.socket.on('shipment:location', (data) => {
      this.emit('shipment:location', data);
    });

    // Payment events
    this.socket.on('payment:received', (data) => {
      notify.paymentReceived(data.amount, data.currency);
      this.emit('payment:received', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      const notifyMethod = notify[data.type] || notify.info;
      notifyMethod(data.message);
      this.emit('notification', data);
    });

    // Inventory events
    this.socket.on('inventory:low', (data) => {
      notify.warning(`Low stock alert: ${data.productName} (${data.quantity} remaining)`);
      this.emit('inventory:low', data);
    });

    // Document events
    this.socket.on('document:generated', (data) => {
      notify.success(`${data.documentType} generated successfully`);
      this.emit('document:generated', data);
    });
  }

  // Subscribe to custom events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // Emit to local listeners
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Send message to server
  send(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected');
    }
  }

  // Join a room
  joinRoom(room) {
    this.send('join:room', { room });
  }

  // Leave a room
  leaveRoom(room) {
    this.send('leave:room', { room });
  }

  // Subscribe to order updates
  subscribeToOrder(orderId) {
    this.send('subscribe:order', { orderId });
  }

  // Subscribe to shipment updates
  subscribeToShipment(shipmentId) {
    this.send('subscribe:shipment', { shipmentId });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useSocketStore.getState().disconnect();
    }
  }

  // Get connection status
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;

// React hook for WebSocket
export function useWebSocket(event, callback) {
  React.useEffect(() => {
    if (!event || !callback) return;

    const unsubscribe = websocketService.on(event, callback);

    return () => {
      unsubscribe();
    };
  }, [event, callback]);
}
