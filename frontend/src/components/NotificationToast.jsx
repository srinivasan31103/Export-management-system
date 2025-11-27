import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#363636',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '16px',
        },
        success: {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          style: {
            border: '1px solid #10b981',
          },
        },
        error: {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          style: {
            border: '1px solid #ef4444',
          },
        },
      }}
    />
  );
}

// Custom notification functions
export const notify = {
  success: (message, options = {}) => {
    toast.success(message, {
      ...options,
      className: 'animate-slide-in-right',
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      ...options,
      className: 'animate-slide-in-right',
    });
  },

  info: (message, options = {}) => {
    toast(message, {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      style: {
        border: '1px solid #3b82f6',
      },
      className: 'animate-slide-in-right',
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast(message, {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      style: {
        border: '1px solid #f59e0b',
      },
      className: 'animate-slide-in-right',
      ...options,
    });
  },

  custom: (component, options = {}) => {
    toast.custom(component, {
      ...options,
      className: 'animate-slide-in-right',
    });
  },

  // Order status notifications
  orderCreated: (orderNo) => {
    toast.success(
      <div className="flex items-start">
        <div className="ml-3 flex-1">
          <p className="font-semibold">Order Created</p>
          <p className="text-sm text-gray-600 mt-1">Order {orderNo} has been created successfully</p>
        </div>
      </div>,
      { duration: 5000 }
    );
  },

  orderShipped: (orderNo, carrier) => {
    toast(
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="font-semibold">Order Shipped</p>
          <p className="text-sm text-gray-600 mt-1">
            Order {orderNo} has been shipped via {carrier}
          </p>
        </div>
      </div>,
      {
        duration: 6000,
        style: { border: '1px solid #3b82f6' },
      }
    );
  },

  documentGenerated: (docType, orderNo) => {
    toast.success(
      <div className="flex items-start">
        <div className="ml-3 flex-1">
          <p className="font-semibold">Document Generated</p>
          <p className="text-sm text-gray-600 mt-1">
            {docType} for order {orderNo} is ready for download
          </p>
        </div>
      </div>
    );
  },
};

// Real-time notification component
export function NotificationCenter({ notifications, onDismiss }) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-primary-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${getNotificationIcon(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function getNotificationIcon(type) {
  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };
  return colors[type] || 'text-gray-500';
}

function getIcon(type) {
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };
  return icons[type] || <Info className="h-5 w-5" />;
}

function formatTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
