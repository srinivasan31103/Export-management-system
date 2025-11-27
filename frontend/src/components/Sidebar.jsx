import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Box,
  Ship,
  FileText,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ user, isOpen, onToggle }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'clerk', 'buyer'] },
    { name: 'Orders', href: '/orders', icon: Package, roles: ['admin', 'manager', 'clerk'] },
    { name: 'SKUs', href: '/skus', icon: Box, roles: ['admin', 'manager', 'clerk'] },
    { name: 'Shipments', href: '/shipments', icon: Ship, roles: ['admin', 'manager', 'clerk', 'freight_agent'] },
    { name: 'AI Tools', href: '/documents', icon: FileText, roles: ['admin', 'manager', 'clerk'] },
    { name: 'Buyer Portal', href: '/buyer-portal', icon: Users, roles: ['buyer'] },
  ];

  const visibleItems = navigation.filter(item => item.roles.includes(user.role));

  return (
    <>
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <button
        onClick={onToggle}
        className="fixed left-2 top-20 z-50 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
      </button>
    </>
  );
}
