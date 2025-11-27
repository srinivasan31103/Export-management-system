import React, { useState, useEffect, useMemo } from 'react';
import { ordersAPI, shipmentsAPI, usersAPI } from '../../api/apiClient';
import {
  TrendingUp, TrendingDown, Package, Users, Truck, FileText, AlertTriangle, DollarSign,
  RefreshCw, Download, Search, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { exportToExcel, exportToCSV, formatForExport } from '../../utils/exportUtils';
import { StatsSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingShipments: 0,
    activeUsers: 0,
    documentsGenerated: 0,
    pendingDocuments: 0,
    revenueChange: 0,
    ordersChange: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchAdminData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchAdminData(true); // true = silent refresh
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        if (loading) {
          // Initial load - don't set refreshing
        } else {
          setRefreshing(true);
        }
      }

      const [ordersRes, shipmentsRes, usersRes] = await Promise.all([
        ordersAPI.getAll({ limit: 100 }),
        shipmentsAPI.getAll({ limit: 50 }),
        usersAPI.getAll({})
      ]);

      const orders = ordersRes.data.orders || [];
      const shipments = shipmentsRes.data.shipments || [];
      const users = usersRes.data.users || [];

      const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
      const pendingShipments = shipments.filter(s => ['pending', 'in_transit'].includes(s.status)).length;
      const activeUsers = users.filter(u => u.is_active).length;
      const pendingDocuments = orders.filter(o => ['confirmed', 'packed'].includes(o.status)).length;
      const documentsGenerated = orders.filter(o => ['invoiced', 'closed'].includes(o.status)).length;

      // Calculate changes (mock - in real app, compare with previous period)
      const revenueChange = 12.5;
      const ordersChange = 8.3;

      // System alerts
      const alerts = [];
      if (pendingShipments > 10) {
        alerts.push({ type: 'warning', message: `${pendingShipments} shipments pending attention` });
      }
      if (pendingDocuments > 5) {
        alerts.push({ type: 'info', message: `${pendingDocuments} orders need document generation` });
      }

      setAllOrders(orders);
      setRecentOrders(orders.slice(0, 10));
      setSystemAlerts(alerts);
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        pendingShipments,
        activeUsers,
        documentsGenerated,
        pendingDocuments,
        revenueChange,
        ordersChange
      });
      setLastUpdated(new Date());

      if (!silentRefresh && !loading) {
        toast.success('Dashboard refreshed successfully');
      }

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    try {
      const formattedData = formatForExport(allOrders, {
        order_no: 'Order Number',
        'buyer_id.name': 'Buyer',
        order_date: 'Order Date',
        total_amount: 'Amount',
        status: 'Status'
      }, ['_id', '__v', 'createdAt', 'updatedAt']);

      exportToExcel(formattedData, 'admin-dashboard-orders', 'Orders');
      toast.success('Data exported to Excel successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleExportCSV = () => {
    try {
      const formattedData = formatForExport(allOrders, {
        order_no: 'Order Number',
        'buyer_id.name': 'Buyer',
        order_date: 'Order Date',
        total_amount: 'Amount',
        status: 'Status'
      }, ['_id', '__v', 'createdAt', 'updatedAt']);

      exportToCSV(formattedData, 'admin-dashboard-orders');
      toast.success('Data exported to CSV successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Helper function to check if date is in range
  const isDateInRange = (date, filter) => {
    const orderDate = new Date(date);
    const now = new Date();

    switch (filter) {
      case 'today':
        return orderDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return orderDate >= monthAgo;
      case 'all':
      default:
        return true;
    }
  };

  // Filter orders based on date range and search
  const filteredOrders = useMemo(() => {
    let orders = recentOrders;

    // Apply date filter
    if (dateFilter !== 'all') {
      orders = orders.filter(order => isDateInRange(order.order_date, dateFilter));
    }

    // Apply search filter
    if (searchTerm) {
      orders = orders.filter(order =>
        order.order_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return orders;
  }, [recentOrders, searchTerm, dateFilter]);

  // Prepare chart data
  const revenueChartData = useMemo(() => {
    // Group orders by month for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();

      const monthOrders = allOrders.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate.getMonth() === date.getMonth() &&
               orderDate.getFullYear() === date.getFullYear();
      });

      const revenue = monthOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

      data.push({
        month: `${monthName} ${year.toString().slice(2)}`,
        revenue: Number(revenue.toFixed(2)),
        orders: monthOrders.length
      });
    }

    return data;
  }, [allOrders]);

  // Order status distribution
  const statusChartData = useMemo(() => {
    const statusCounts = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  }, [allOrders]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <StatsSkeleton count={4} />
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            System-wide analytics and monitoring
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {systemAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {systemAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {systemAlerts.length > 0 ? (
                    systemAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              alert.type === 'warning' ? 'text-orange-500' : 'text-sky'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">Just now</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAdminData(false)}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
              >
                Export to Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
        <button
          onClick={() => setDateFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setDateFilter('today')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === 'today'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setDateFilter('week')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === 'week'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setDateFilter('month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === 'month'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Month
        </button>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="space-y-2">
          {systemAlerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                alert.type === 'warning'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-sky-50 border-sky-200'
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  alert.type === 'warning' ? 'text-orange-500' : 'text-sky'
                }`}
              />
              <span className="text-sm font-medium text-gray-900">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={stats.revenueChange}
          icon={<DollarSign className="h-6 w-6" />}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <KPICard
          title="Total Orders"
          value={stats.totalOrders}
          change={stats.ordersChange}
          icon={<Package className="h-6 w-6" />}
          color="text-primary"
          bgColor="bg-blue-100"
        />
        <KPICard
          title="Active Shipments"
          value={stats.pendingShipments}
          icon={<Truck className="h-6 w-6" />}
          color="text-sky"
          bgColor="bg-sky-100"
        />
        <KPICard
          title="Active Users"
          value={stats.activeUsers}
          icon={<Users className="h-6 w-6" />}
          color="text-accent"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Volume Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Volume by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-sm text-primary hover:text-primary-600 font-medium">
                View All
              </Link>
            </div>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or buyer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/orders/${order._id}`} className="text-sm font-medium text-primary hover:text-primary-600">
                        {order.order_no}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.buyer_id?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Document Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Document Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Generated</p>
                    <p className="text-xs text-gray-500">Ready to send</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.documentsGenerated}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pending</p>
                    <p className="text-xs text-gray-500">Needs generation</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.pendingDocuments}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/orders"
                className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium text-center"
              >
                View All Orders
              </Link>
              <Link
                to="/users"
                className="block w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors text-sm font-medium text-center"
              >
                Manage Users
              </Link>
              <Link
                to="/reports"
                className="block w-full px-4 py-2 bg-sky text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium text-center"
              >
                Generate Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} rounded-lg p-3 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-sky-100 text-sky-700',
    packed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-blue-100 text-blue-700',
    invoiced: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
}
