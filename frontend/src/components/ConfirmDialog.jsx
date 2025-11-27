import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger', 'warning', 'info'
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    warning: {
      button: 'bg-orange-600 hover:bg-orange-700',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    info: {
      button: 'bg-primary hover:bg-primary-600',
      icon: 'text-primary',
      iconBg: 'bg-primary-50'
    }
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className={`${style.iconBg} rounded-full p-3 flex-shrink-0`}>
            <AlertTriangle className={`h-6 w-6 ${style.icon}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
