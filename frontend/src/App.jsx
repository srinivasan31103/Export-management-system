import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api/apiClient';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import SKUs from './pages/SKUs';
import Shipments from './pages/Shipments';
import BuyerPortal from './pages/BuyerPortal';
import DocsViewer from './pages/DocsViewer';
import Users from './pages/Users';
import Buyers from './pages/Buyers';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Quotes from './pages/Quotes';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

// Layout
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then((response) => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/*"
          element={
            user ? (
              <AuthenticatedApp user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function AuthenticatedApp({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed Left */}
      <Sidebar user={user} />

      {/* Topbar - Fixed Top */}
      <Topbar user={user} onLogout={onLogout} />

      {/* Main Content Area - With padding for fixed sidebar and topbar */}
      <main className="ml-64 mt-16 p-6">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/orders" element={<Orders user={user} />} />
          <Route path="/orders/:id" element={<OrderDetails user={user} />} />
          <Route path="/skus" element={<SKUs user={user} />} />
          <Route path="/shipments" element={<Shipments user={user} />} />
          <Route path="/buyers" element={<Buyers user={user} />} />
          <Route path="/inventory" element={<Inventory user={user} />} />
          <Route path="/quotes" element={<Quotes user={user} />} />
          <Route path="/transactions" element={<Transactions user={user} />} />
          <Route path="/documents" element={<DocsViewer user={user} />} />
          <Route path="/reports" element={<Reports user={user} />} />
          <Route path="/users" element={<Users user={user} />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="/buyer-portal" element={<BuyerPortal user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
