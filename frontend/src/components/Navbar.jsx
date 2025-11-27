import React from 'react';
import { LogOut, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-navy">ExportSuite</h1>
            <span className="ml-3 px-2 py-1 bg-primary-50 text-primary text-xs font-medium rounded">
              {user.role.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700 font-medium">{user.name}</span>
              <span className="ml-2 text-gray-500">{user.email}</span>
            </div>

            <button
              onClick={onLogout}
              className="btn btn-secondary flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
