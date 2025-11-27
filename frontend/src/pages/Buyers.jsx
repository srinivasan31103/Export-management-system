import React, { useState, useEffect } from 'react';
import { buyersAPI } from '../api/apiClient';
import { Users, Search, Plus, Edit, Eye, MapPin, Mail, Phone, Globe } from 'lucide-react';
import BuyerForm from '../components/BuyerForm';

export default function Buyers({ user }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    status: 'active'
  });

  useEffect(() => {
    fetchBuyers();
  }, [filters]);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const response = await buyersAPI.getAll({ ...filters });
      setBuyers(response.data.buyers || []);
    } catch (error) {
      console.error('Failed to fetch buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuyer = async (buyerData) => {
    try {
      await buyersAPI.create(buyerData);
      setShowCreateModal(false);
      fetchBuyers();
    } catch (error) {
      console.error('Failed to create buyer:', error);
      throw error;
    }
  };

  const handleEditBuyer = async (buyerData) => {
    try {
      await buyersAPI.update(selectedBuyer._id, buyerData);
      setShowEditModal(false);
      setSelectedBuyer(null);
      fetchBuyers();
    } catch (error) {
      console.error('Failed to update buyer:', error);
      throw error;
    }
  };

  const openViewModal = (buyer) => {
    setSelectedBuyer(buyer);
    setShowViewModal(true);
  };

  const openEditModal = (buyer) => {
    setSelectedBuyer(buyer);
    setShowEditModal(true);
  };

  const canManageBuyers = ['admin', 'manager', 'clerk'].includes(user.role);

  // Get unique countries
  const countries = [...new Set(buyers.map(b => b.country).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyers Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {buyers.length} registered buyer{buyers.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManageBuyers && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Buyer
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, company, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Country
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buyers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-3">Loading buyers...</p>
          </div>
        ) : buyers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {buyers.map((buyer) => (
                  <tr key={buyer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {buyer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{buyer.name}</div>
                          <div className="text-xs text-gray-500">{buyer.company_name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {buyer.contact_person || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{buyer.email}</span>
                        </div>
                        {buyer.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{buyer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-900">{buyer.city || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{buyer.country || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {buyer.order_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        buyer.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {buyer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(buyer)}
                          className="p-1.5 text-primary hover:bg-primary-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManageBuyers && (
                          <button
                            onClick={() => openEditModal(buyer)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Edit Buyer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No buyers found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {canManageBuyers ? 'Get started by adding your first buyer.' : 'No buyers available at this time.'}
            </p>
            {canManageBuyers && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Buyer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Buyer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Buyer</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <BuyerForm
                onSubmit={handleCreateBuyer}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Buyer Modal */}
      {showEditModal && selectedBuyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Buyer</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBuyer(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <BuyerForm
                initialData={selectedBuyer}
                onSubmit={handleEditBuyer}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedBuyer(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Buyer Modal */}
      {showViewModal && selectedBuyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Buyer Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedBuyer(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Buyer Name
                  </label>
                  <p className="text-sm text-gray-900 font-medium">{selectedBuyer.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <p className="text-sm text-gray-900">{selectedBuyer.company_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Contact Person
                  </label>
                  <p className="text-sm text-gray-900">{selectedBuyer.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{selectedBuyer.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <p className="text-sm text-gray-900">{selectedBuyer.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Tax ID
                  </label>
                  <p className="text-sm text-gray-900">{selectedBuyer.tax_id || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Address
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedBuyer.address || 'N/A'}
                    {selectedBuyer.city && `, ${selectedBuyer.city}`}
                    {selectedBuyer.state && `, ${selectedBuyer.state}`}
                    {selectedBuyer.postal_code && ` - ${selectedBuyer.postal_code}`}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <p className="text-sm text-gray-900">{selectedBuyer.country || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Payment Terms
                  </label>
                  <p className="text-sm text-gray-900">{selectedBuyer.payment_terms || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Credit Limit
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedBuyer.credit_limit ? `$${parseFloat(selectedBuyer.credit_limit).toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedBuyer.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedBuyer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Total Orders
                  </label>
                  <p className="text-sm text-gray-900 font-semibold">{selectedBuyer.order_count || 0}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                {canManageBuyers && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Edit Buyer
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBuyer(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
