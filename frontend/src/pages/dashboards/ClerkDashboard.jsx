import React, { useState, useEffect } from 'react';
import { ordersAPI, shipmentsAPI } from '../../api/apiClient';
import { Package, Clock, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClerkDashboard({ user }) {
  const [stats, setStats] = useState({
    myOrdersToday: 0,
    pendingOrders: 0,
    completedToday: 0,
    documentsNeeded: 0
  });
  const [myTasks, setMyTasks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClerkData();
  }, []);

  const fetchClerkData = async () => {
    try {
      const [ordersRes] = await Promise.all([
        ordersAPI.getAll({ limit: 20 })
      ]);

      const orders = ordersRes.data.orders || [];
      const today = new Date().toDateString();

      const myOrdersToday = orders.filter(o =>
        new Date(o.createdAt).toDateString() === today
      ).length;

      const completedToday = orders.filter(o =>
        new Date(o.updatedAt).toDateString() === today && o.status === 'confirmed'
      ).length;

      const pendingOrders = orders.filter(o => o.status === 'draft').length;
      const documentsNeeded = orders.filter(o =>
        ['confirmed', 'packed'].includes(o.status)
      ).length;

      // Create task list for clerk
      const tasks = [];
      orders.filter(o => o.status === 'draft').slice(0, 5).forEach(o => {
        tasks.push({
          id: o._id,
          type: 'order',
          title: `Process Order ${o.order_no}`,
          description: `Review and confirm order from ${o.buyer_id?.name || 'Unknown'}`,
          priority: 'high',
          orderNo: o.order_no
        });
      });

      setMyTasks(tasks);
      setRecentOrders(orders.slice(0, 8));
      setStats({
        myOrdersToday,
        pendingOrders,
        completedToday,
        documentsNeeded
      });

    } catch (error) {
      console.error('Failed to fetch clerk data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading your workspace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Workspace</h1>
        <p className="mt-1 text-sm text-gray-500">
          Good day, {user.name}! Here are your tasks for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Orders Created Today"
          value={stats.myOrdersToday}
          icon={<Package className="h-6 w-6" />}
          color="bg-primary"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Clock className="h-6 w-6" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={<CheckCircle className="h-6 w-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Documents Needed"
          value={stats.documentsNeeded}
          icon={<FileText className="h-6 w-6" />}
          color="bg-sky"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h2>
          {myTasks.length > 0 ? (
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="p-4 border-l-4 border-primary bg-primary-50 rounded-r-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link
                      to={`/orders`}
                      className="text-xs text-primary hover:text-primary-600 font-medium"
                    >
                      View Order →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">All tasks completed! Great job!</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/orders"
                className="block p-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-center font-medium"
              >
                + Create New Order
              </Link>
              <Link
                to="/skus"
                className="block p-3 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors text-center font-medium"
              >
                View SKU Catalog
              </Link>
              <Link
                to="/shipments"
                className="block p-3 bg-sky text-white rounded-lg hover:bg-sky-600 transition-colors text-center font-medium"
              >
                Track Shipments
              </Link>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Orders Processed</span>
                  <span className="font-semibold">{stats.completedToday}/{stats.myOrdersToday}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.myOrdersToday > 0 ? (stats.completedToday / stats.myOrdersToday) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">Keep up the great work!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary hover:text-primary-600">
            View All →
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{order.order_no}</p>
                  <p className="text-xs text-gray-500">{order.buyer_id?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} rounded-lg p-3 text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    draft: 'badge-secondary',
    confirmed: 'badge-info',
    packed: 'badge-warning',
    shipped: 'badge-primary',
    invoiced: 'badge-success',
    closed: 'badge-secondary',
    cancelled: 'badge-danger'
  };
  return colors[status] || 'badge-secondary';
}
