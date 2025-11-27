import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  FileText,
  BarChart3,
  Settings,
  Box,
  Warehouse,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';

export default function Sidebar({ user }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/orders', icon: ShoppingCart, label: 'Orders' },
      { path: '/shipments', icon: Truck, label: 'Shipments' },
    ];

    const adminManagerItems = [
      { path: '/skus', icon: Package, label: 'SKU Management' },
      { path: '/buyers', icon: Users, label: 'Buyers' },
      { path: '/inventory', icon: Warehouse, label: 'Inventory' },
      { path: '/quotes', icon: DollarSign, label: 'Quotes' },
      { path: '/transactions', icon: FileSpreadsheet, label: 'Transactions' },
      { path: '/documents', icon: FileText, label: 'Documents' },
      { path: '/reports', icon: BarChart3, label: 'Reports' },
    ];

    const clerkItems = [
      { path: '/skus', icon: Package, label: 'SKU Catalog' },
      { path: '/buyers', icon: Users, label: 'Buyers' },
      { path: '/documents', icon: FileText, label: 'Documents' },
    ];

    const buyerItems = [
      { path: '/skus', icon: Box, label: 'Product Catalog' },
      { path: '/documents', icon: FileText, label: 'My Documents' },
    ];

    if (user.role === 'admin') {
      return [
        ...commonItems,
        ...adminManagerItems,
        { path: '/users', icon: Users, label: 'User Management' },
        { path: '/settings', icon: Settings, label: 'System Settings' },
      ];
    } else if (user.role === 'manager') {
      return [...commonItems, ...adminManagerItems];
    } else if (user.role === 'clerk') {
      return [...commonItems, ...clerkItems];
    } else if (user.role === 'buyer') {
      return [...commonItems, ...buyerItems];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ExportSuite</h1>
            <p className="text-xs text-gray-500">ERP System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info at Bottom */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
