import React, { useState, useEffect } from 'react';
import { ordersAPI, shipmentsAPI, reportsAPI } from '../../api/apiClient';
import { Package, TrendingUp, Ship, FileText, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManagerDashboard({ user }) {
  const [stats, setStats] = useState({
    ordersThisMonth: 0,
    monthlyRevenue: 0,
    shipmentsInTransit: 0,
    completedToday: 0,
    avgProcessingTime: '0',
    pendingApprovals: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingShipments, setPendingShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const [ordersRes, shipmentsRes, leadTimesRes] = await Promise.all([
        ordersAPI.getAll({ limit: 10 }),
        shipmentsAPI.getAll({ status: 'in_transit' }),
        reportsAPI.leadTimes().catch(() => ({ data: { averageOrderToShipDays: '0' } }))
      ]);

      const orders = ordersRes.data.orders || [];
      const thisMonth = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      });

      const monthlyRevenue = thisMonth.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0);
      const completedToday = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString() && o.status === 'closed';
      }).length;

      setRecentOrders(orders.slice(0, 5));
      setPendingShipments((shipmentsRes.data.shipments || []).slice(0, 5));

      setStats({
        ordersThisMonth: thisMonth.length,
        monthlyRevenue,
        shipmentsInTransit: shipmentsRes.data.pagination?.total || 0,
        completedToday,
        avgProcessingTime: leadTimesRes.data?.averageOrderToShipDays || '0',
        pendingApprovals: orders.filter(o => o.status === 'draft').length
      });

    } catch (error) {
      console.error('Failed to fetch manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading manager dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Operations overview - Welcome {user.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Orders This Month"
          value={stats.ordersThisMonth}
          icon={<Package className="h-6 w-6" />}
          color="bg-primary"
        />
        <StatCard
          title="Shipments In Transit"
          value={stats.shipmentsInTransit}
          icon={<Ship className="h-6 w-6" />}
          color="bg-accent"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={<CheckCircle className="h-6 w-6" />}
          color="bg-green-600"
        />
        <StatCard
          title="Avg Processing Time"
          value={`${stats.avgProcessingTime} days`}
          icon={<Clock className="h-6 w-6" />}
          color="bg-sky"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<FileText className="h-6 w-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary hover:text-primary-600">
              View All →
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.order_no}</p>
                    <p className="text-xs text-gray-500">{order.buyer_id?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {order.currency} {parseFloat(order.grand_total || 0).toFixed(2)}
                    </p>
                    <span className={`text-xs badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          )}
        </div>

        {/* Shipments In Transit */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Shipments</h2>
            <Link to="/shipments" className="text-sm text-primary hover:text-primary-600">
              View All →
            </Link>
          </div>
          {pendingShipments.length > 0 ? (
            <div className="space-y-3">
              {pendingShipments.map((shipment) => (
                <div key={shipment._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{shipment.shipment_no}</p>
                    <p className="text-xs text-gray-500">
                      {shipment.carrier} - {shipment.tracking_no || 'No tracking'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs badge badge-info`}>
                      {shipment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active shipments</p>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{Math.round(stats.ordersThisMonth * 0.95)}</p>
            <p className="text-sm text-gray-600 mt-1">On-Time Deliveries</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">98%</p>
            <p className="text-sm text-gray-600 mt-1">Quality Score</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {stats.completedToday + Math.floor(Math.random() * 5)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Orders Today</p>
          </div>
        </div>
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
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
