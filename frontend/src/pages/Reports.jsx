import React, { useState, useEffect } from 'react';
import { reportsAPI, ordersAPI } from '../api/apiClient';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Package, Users, Truck } from 'lucide-react';

export default function Reports({ user }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingShipments: 0,
    activeCustomers: 0
  });

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const ordersRes = await ordersAPI.getAll({ limit: 100 });
      const orders = ordersRes.data.orders || [];

      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const uniqueBuyers = new Set(orders.map(o => o.buyer_id?._id).filter(Boolean));

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        pendingShipments: orders.filter(o => o.status === 'shipped').length,
        activeCustomers: uniqueBuyers.size
      });
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business performance insights and reports</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+12.5%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+8.3%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingShipments}</p>
              <p className="text-xs text-gray-500 mt-2">In transit</p>
            </div>
            <div className="bg-sky-100 rounded-lg p-3">
              <Truck className="h-6 w-6 text-sky" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeCustomers}</p>
              <p className="text-xs text-gray-500 mt-2">Unique buyers</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Sales Report"
          description="Comprehensive sales analysis and trends"
          icon={<BarChart3 className="h-6 w-6" />}
          color="bg-blue-100 text-blue-600"
        />
        <ReportCard
          title="Shipment Report"
          description="Shipping performance and tracking"
          icon={<Truck className="h-6 w-6" />}
          color="bg-sky-100 text-sky"
        />
        <ReportCard
          title="Customer Report"
          description="Customer activity and engagement"
          icon={<Users className="h-6 w-6" />}
          color="bg-purple-100 text-purple-600"
        />
        <ReportCard
          title="Revenue Analysis"
          description="Financial performance overview"
          icon={<DollarSign className="h-6 w-6" />}
          color="bg-green-100 text-green-600"
        />
        <ReportCard
          title="Inventory Report"
          description="Stock levels and movements"
          icon={<Package className="h-6 w-6" />}
          color="bg-orange-100 text-orange-600"
        />
        <ReportCard
          title="Monthly Summary"
          description="Complete monthly business summary"
          icon={<Calendar className="h-6 w-6" />}
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Chart visualization would appear here</p>
            <p className="text-xs text-gray-400 mt-1">Integrate Chart.js or Recharts for interactive charts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, description, icon, color }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className={`${color} rounded-lg p-3 inline-flex mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <button className="text-sm text-primary hover:text-primary-600 font-medium">
        Generate Report →
      </button>
    </div>
  );
}
