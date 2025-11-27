import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ordersAPI, shipmentsAPI, reportsAPI } from '../api/apiClient';
import {
  Package, TrendingUp, Ship, FileText, DollarSign, Users,
  ArrowUp, ArrowDown, Activity, Clock, MapPin, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#1471d8', '#10b981', '#f59e0b', '#ef4444', '#8699eb', '#85b9f3'];

export default function DashboardEnhanced({ user }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingShipments: 0,
    totalRevenue: 0,
    activeOrders: 0,
    growthRate: 0,
    avgOrderValue: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, shipmentsRes, salesRes] = await Promise.all([
        ordersAPI.getAll({ limit: 10 }),
        shipmentsAPI.getAll({ limit: 5 }),
        reportsAPI.sales({ from: getLastMonthDate(), to: new Date().toISOString() })
      ]);

      const orders = ordersRes.data.orders || [];
      setRecentOrders(orders);

      // Calculate stats
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0);
      const activeOrders = orders.filter(o => ['confirmed', 'packed', 'shipped'].includes(o.status)).length;

      setStats({
        totalOrders: ordersRes.data.pagination?.total || 0,
        pendingShipments: shipmentsRes.data.pagination?.total || 0,
        totalRevenue,
        activeOrders,
        growthRate: 12.5, // Mock data
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
      });

      // Process sales data
      if (salesRes.data?.salesByPeriod) {
        setSalesData(salesRes.data.salesByPeriod.map(s => ({
          period: s.period,
          sales: parseFloat(s.totalSales),
          orders: s.orderCount
        })));
      }

      // Process country data
      if (salesRes.data?.salesByCountry) {
        setCountryData(salesRes.data.salesByCountry.slice(0, 5).map(c => ({
          name: c.country,
          value: parseFloat(c.totalSales)
        })));
      }

      // Process status data
      const statusCounts = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      setStatusData(Object.keys(statusCounts).map(key => ({
        name: key,
        value: statusCounts[key]
      })));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Animation */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {user.name}! Here's what's happening with your exports.
          </p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-sm text-gray-500"
        >
          Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
        </motion.div>
      </motion.div>

      {/* Stats Grid with Enhanced Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<Package className="h-6 w-6" />}
          color="from-primary to-navy"
          trend={stats.growthRate}
          trendUp={true}
        />
        <StatCard
          title="Active Shipments"
          value={stats.pendingShipments}
          icon={<Ship className="h-6 w-6" />}
          color="from-accent to-primary"
          trend={8.2}
          trendUp={true}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="from-green-500 to-emerald-600"
          trend={15.3}
          trendUp={true}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${stats.avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="from-sky to-accent"
          trend={-2.4}
          trendUp={false}
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Sales Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1471d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1471d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#1471d8"
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Countries */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Top Countries
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#1471d8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <motion.div
                key={order.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(order.status)}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.order_no}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.buyer?.name}
                    </p>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div variants={itemVariants} className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary dark:text-sky">
                    {order.order_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {order.buyer?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {order.currency} {parseFloat(order.grand_total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, color, trend, trendUp }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="card p-6 overflow-hidden relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trendUp ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ml-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className={`bg-gradient-to-br ${color} rounded-full p-4 text-white shadow-lg`}
        >
          {icon}
        </motion.div>
      </div>

      {/* Animated Background */}
      <motion.div
        className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${color} opacity-5 rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}

function getStatusColor(status) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    confirmed: 'badge-info',
    packed: 'badge-warning',
    shipped: 'badge-success',
    invoiced: 'badge-success',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'badge-danger'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusDot(status) {
  const colors = {
    draft: 'bg-gray-400',
    confirmed: 'bg-primary animate-pulse',
    packed: 'bg-accent animate-pulse',
    shipped: 'bg-green-500 animate-pulse',
    invoiced: 'bg-green-600',
    closed: 'bg-gray-500',
    cancelled: 'bg-red-500'
  };
  return colors[status] || 'bg-gray-400';
}
