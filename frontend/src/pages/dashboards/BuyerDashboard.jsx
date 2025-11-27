import React, { useState, useEffect } from 'react';
import { ordersAPI, shipmentsAPI, docsAPI } from '../../api/apiClient';
import { Package, Truck, FileText, Clock, CheckCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BuyerDashboard({ user }) {
  const [stats, setStats] = useState({
    myOrders: 0,
    ordersInTransit: 0,
    completedOrders: 0,
    pendingDocuments: 0
  });
  const [myOrders, setMyOrders] = useState([]);
  const [myShipments, setMyShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuyerData();
  }, []);

  const fetchBuyerData = async () => {
    try {
      const [ordersRes, shipmentsRes] = await Promise.all([
        ordersAPI.getAll({ limit: 20 }),
        shipmentsAPI.getAll({ limit: 10 })
      ]);

      const orders = ordersRes.data.orders || [];
      const shipments = shipmentsRes.data.shipments || [];

      // Filter orders for this buyer
      const buyerOrders = orders.filter(o => o.buyer_id?._id === user._id || o.buyer_id === user._id);

      const myOrders = buyerOrders.length;
      const ordersInTransit = shipments.filter(s =>
        ['in_transit', 'customs_clearance'].includes(s.status)
      ).length;
      const completedOrders = buyerOrders.filter(o =>
        o.status === 'closed'
      ).length;
      const pendingDocuments = buyerOrders.filter(o =>
        ['confirmed', 'packed', 'shipped'].includes(o.status)
      ).length;

      setMyOrders(buyerOrders.slice(0, 8));
      setMyShipments(shipments.slice(0, 4));
      setStats({
        myOrders,
        ordersInTransit,
        completedOrders,
        pendingDocuments
      });

    } catch (error) {
      console.error('Failed to fetch buyer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (orderId, docType) => {
    try {
      let blob;
      switch (docType) {
        case 'invoice':
          blob = await docsAPI.generateInvoice(orderId);
          break;
        case 'packing':
          blob = await docsAPI.generatePackingList(orderId);
          break;
        case 'coo':
          blob = await docsAPI.generateCOO(orderId);
          break;
        default:
          return;
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${docType}_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading your orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user.name}! Track your orders and shipments here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Orders"
          value={stats.myOrders}
          icon={<Package className="h-6 w-6" />}
          color="bg-primary"
        />
        <StatCard
          title="In Transit"
          value={stats.ordersInTransit}
          icon={<Truck className="h-6 w-6" />}
          color="bg-sky"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={<CheckCircle className="h-6 w-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Available Documents"
          value={stats.pendingDocuments}
          icon={<FileText className="h-6 w-6" />}
          color="bg-accent"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - My Orders (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Recent Orders</h2>
              <Link to="/orders" className="text-sm text-primary hover:text-primary-600">
                View All →
              </Link>
            </div>
            {myOrders.length > 0 ? (
              <div className="space-y-3">
                {myOrders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-gray-900">{order.order_no}</p>
                          <span className={`text-xs badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Order Date: {new Date(order.order_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {order.items?.length || 0} items • Total: ${order.total_amount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {['confirmed', 'packed', 'shipped', 'invoiced', 'closed'].includes(order.status) && (
                          <>
                            <button
                              onClick={() => handleDownloadDocument(order._id, 'invoice')}
                              className="text-primary hover:text-primary-600"
                              title="Download Invoice"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No orders found</p>
                <Link
                  to="/orders"
                  className="inline-block mt-3 text-sm text-primary hover:text-primary-600"
                >
                  Browse Catalog →
                </Link>
              </div>
            )}
          </div>

          {/* Shipment Tracking */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Shipments</h2>
            {myShipments.length > 0 ? (
              <div className="space-y-3">
                {myShipments.map((shipment) => (
                  <div key={shipment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-sky" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{shipment.tracking_no}</p>
                        <p className="text-xs text-gray-500">
                          {shipment.carrier} • ETD: {shipment.etd ? new Date(shipment.etd).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs badge ${getShipmentStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No active shipments</p>
            )}
          </div>
        </div>

        {/* Right Column - Quick Info (1/3 width) */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/orders"
                className="block p-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-center font-medium"
              >
                View All Orders
              </Link>
              <Link
                to="/shipments"
                className="block p-3 bg-sky text-white rounded-lg hover:bg-sky-600 transition-colors text-center font-medium"
              >
                Track Shipments
              </Link>
              <Link
                to="/skus"
                className="block p-3 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors text-center font-medium"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {myOrders.slice(0, 3).map((order) => (
                <div key={order._id} className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">
                      Order <span className="font-medium">{order.order_no}</span> {order.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {myOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="card p-6 bg-sky-50 border-sky-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-xs text-gray-600 mb-3">
              Contact our support team for assistance with your orders.
            </p>
            <button className="w-full p-2 bg-sky text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium">
              Contact Support
            </button>
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
    closed: 'badge-success',
    cancelled: 'badge-danger'
  };
  return colors[status] || 'badge-secondary';
}

function getShipmentStatusColor(status) {
  const colors = {
    pending: 'badge-secondary',
    in_transit: 'badge-primary',
    customs_clearance: 'badge-warning',
    out_for_delivery: 'badge-info',
    delivered: 'badge-success',
    delayed: 'badge-danger'
  };
  return colors[status] || 'badge-secondary';
}
