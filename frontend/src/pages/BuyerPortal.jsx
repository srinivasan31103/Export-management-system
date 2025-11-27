import React, { useState, useEffect } from 'react';
import { ordersAPI, shipmentsAPI } from '../api/apiClient';
import { Package, TrendingUp } from 'lucide-react';

export default function BuyerPortal({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll({ limit: 50 });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalOrders: orders.length,
    activeShipments: orders.filter(o => o.status === 'shipped').length,
    totalSpent: orders.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buyer Portal</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome, {user.name}! View your orders and shipments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-primary rounded-lg p-3 text-white">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-accent rounded-lg p-3 text-white">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Shipments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeShipments}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : orders.length > 0 ? (
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {order.order_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {order.currency} {parseFloat(order.grand_total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.expected_ship_date ? new Date(order.expected_ship_date).toLocaleDateString() : 'TBD'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    confirmed: 'badge-info',
    packed: 'badge-warning',
    shipped: 'badge-success',
    invoiced: 'badge-success',
    closed: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
