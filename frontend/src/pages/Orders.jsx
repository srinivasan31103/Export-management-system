import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api/apiClient';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, FileText } from 'lucide-react';
import OrderForm from '../components/OrderForm';

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await ordersAPI.getAll(params);
      setOrders(response.data.orders || []);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      await ordersAPI.create(orderData);
      setShowCreateModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  const handleEditOrder = async (orderData) => {
    try {
      await ordersAPI.update(selectedOrder._id, orderData);
      setShowEditModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const canCreateOrder = ['admin', 'manager', 'clerk'].includes(user.role);
  const canEdit = ['admin', 'manager', 'clerk'].includes(user.role);
  const canDelete = ['admin', 'manager'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total || 0} total orders
          </p>
        </div>
        {canCreateOrder && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, buyer name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Status Filter
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="invoiced">Invoiced</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-3">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Incoterm
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ship Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-sm font-semibold text-primary hover:text-primary-600"
                        >
                          {order.order_no}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.buyer_id?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.buyer_id?.country || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.order_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {order.incoterm || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {order.currency || 'USD'} {parseFloat(order.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.expected_ship_date ? new Date(order.expected_ship_date).toLocaleDateString() : 'TBD'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/orders/${order._id}`}
                            className="p-1.5 text-primary hover:bg-primary-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(order)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Edit Order"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          <Link
                            to={`/documents?order=${order._id}`}
                            className="p-1.5 text-sky hover:bg-sky-50 rounded transition-colors"
                            title="Documents"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-700">
                  Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
                  <span className="font-semibold">{pagination.pages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {canCreateOrder ? 'Get started by creating your first order.' : 'No orders available at this time.'}
            </p>
            {canCreateOrder && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <OrderForm onSubmit={handleCreateOrder} onCancel={() => setShowCreateModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Order</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <OrderForm
                initialData={selectedOrder}
                onSubmit={handleEditOrder}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedOrder(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
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
