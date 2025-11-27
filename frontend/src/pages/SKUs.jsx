import React, { useState, useEffect } from 'react';
import { skusAPI } from '../api/apiClient';
import { Plus, Search, Package, Edit, Eye, Trash2 } from 'lucide-react';
import SKUForm from '../components/SKUForm';

export default function SKUs({ user }) {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSKUs();
  }, [filters]);

  const fetchSKUs = async () => {
    setLoading(true);
    try {
      const response = await skusAPI.getAll({ limit: 100, ...filters });
      setSkus(response.data.skus || []);
    } catch (error) {
      console.error('Failed to fetch SKUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSKU = async (skuData) => {
    try {
      await skusAPI.create(skuData);
      setShowCreateModal(false);
      fetchSKUs();
    } catch (error) {
      console.error('Failed to create SKU:', error);
      throw error;
    }
  };

  const handleEditSKU = async (skuData) => {
    try {
      await skusAPI.update(selectedSKU._id, skuData);
      setShowEditModal(false);
      setSelectedSKU(null);
      fetchSKUs();
    } catch (error) {
      console.error('Failed to update SKU:', error);
      throw error;
    }
  };

  const handleDelete = async (sku) => {
    if (!window.confirm(`Are you sure you want to delete SKU "${sku.sku}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await skusAPI.delete(sku._id);
      fetchSKUs();
    } catch (error) {
      console.error('Failed to delete SKU:', error);
      alert('Failed to delete SKU: ' + (error.error || 'Unknown error'));
    }
  };

  const openViewModal = (sku) => {
    setSelectedSKU(sku);
    setShowViewModal(true);
  };

  const openEditModal = (sku) => {
    setSelectedSKU(sku);
    setShowEditModal(true);
  };

  const canManageSKUs = ['admin', 'manager'].includes(user.role);

  // Get unique categories
  const categories = [...new Set(skus.map(s => s.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SKU Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {skus.length} product{skus.length !== 1 ? 's' : ''} in catalog
          </p>
        </div>
        {canManageSKUs && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            New SKU
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
                placeholder="Search by SKU code, description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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

      {/* SKUs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-3">Loading SKUs...</p>
          </div>
        ) : skus.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HS Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    UOM
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Unit Price
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
                {skus.map((sku) => (
                  <tr key={sku._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-50 rounded flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{sku.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{sku.description}</div>
                      {sku.specs && (
                        <div className="text-xs text-gray-500 mt-1">{sku.specs}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-mono">
                        {sku.hs_code || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sku.category ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-sky-50 text-sky-700 rounded">
                          {sku.category}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 uppercase">
                        {sku.uom}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ${parseFloat(sku.unit_price || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sku.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {sku.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(sku)}
                          className="p-1.5 text-primary hover:bg-primary-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManageSKUs && (
                          <>
                            <button
                              onClick={() => openEditModal(sku)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Edit SKU"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sku)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete SKU"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
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
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SKUs found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {canManageSKUs ? 'Get started by adding your first product SKU.' : 'No products available in catalog.'}
            </p>
            {canManageSKUs && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First SKU
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create SKU Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New SKU</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <SKUForm onSubmit={handleCreateSKU} onCancel={() => setShowCreateModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit SKU Modal */}
      {showEditModal && selectedSKU && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit SKU</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSKU(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <SKUForm
                initialData={selectedSKU}
                onSubmit={handleEditSKU}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedSKU(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* View SKU Modal */}
      {showViewModal && selectedSKU && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">SKU Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSKU(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">SKU Code</label>
                  <p className="text-sm font-medium text-gray-900">{selectedSKU.sku}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">HS Code</label>
                  <p className="text-sm font-mono text-gray-900">{selectedSKU.hs_code || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description</label>
                  <p className="text-sm text-gray-900">{selectedSKU.description}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category</label>
                  <p className="text-sm text-gray-900">{selectedSKU.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">UOM</label>
                  <p className="text-sm text-gray-900 uppercase">{selectedSKU.uom}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Unit Price</label>
                  <p className="text-sm font-semibold text-gray-900">${parseFloat(selectedSKU.unit_price || 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedSKU.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedSKU.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {selectedSKU.specs && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Specifications</label>
                    <p className="text-sm text-gray-900">{selectedSKU.specs}</p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedSKU(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {canManageSKUs && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedSKU);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600"
                  >
                    Edit SKU
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
