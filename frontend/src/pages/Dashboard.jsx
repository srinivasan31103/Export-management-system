import React from 'react';
import AdminDashboard from './dashboards/AdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import ClerkDashboard from './dashboards/ClerkDashboard';
import BuyerDashboard from './dashboards/BuyerDashboard';

export default function Dashboard({ user }) {
  // Route to role-specific dashboard
  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'manager':
      return <ManagerDashboard user={user} />;
    case 'clerk':
      return <ClerkDashboard user={user} />;
    case 'buyer':
      return <BuyerDashboard user={user} />;
    default:
      return <ClerkDashboard user={user} />;
  }
}
