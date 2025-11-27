import React, { useState, useEffect } from 'react';
import { quotesAPI } from '../api/apiClient';
import { FileText, Search, Plus, Eye, DollarSign, Calendar } from 'lucide-react';
import QuoteForm from '../components/QuoteForm';

export default function Quotes({ user }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await quotesAPI.getAll({});
      setQuotes(response.data.quotes || []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async (quoteData) => {
    try {
      await quotesAPI.create(quoteData);
      setShowCreateModal(false);
      fetchQuotes();
    } catch (error) {
      console.error('Failed to create quote:', error);
      throw error;
    }
  };

  const handleEditQuote = async (quoteData) => {
    try {
      await quotesAPI.update(selectedQuote._id, quoteData);
      setShowEditModal(false);
      setSelectedQuote(null);
      fetchQuotes();
    } catch (error) {
      console.error('Failed to update quote:', error);
      throw error;
    }
  };

  const openViewModal = (quote) => {
    setSelectedQuote(quote);
    setShowViewModal(true);
  };

  const openEditModal = (quote) => {
    setSelectedQuote(quote);
    setShowEditModal(true);
  };

  const canManageQuotes = ['admin', 'manager', 'clerk'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
        </div>
        {canManageQuotes && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-3 text-gray-500">Loading quotes...</p>
          </div>
        ) : quotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quote No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Incoterm</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valid Until</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Cost</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-primary">{quote.quote_no}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-900">{quote.buyer_id?.name || 'N/A'}</span></td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{quote.origin_port}</div>
                      <div className="text-xs text-gray-500">→ {quote.destination_port}</div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600">{quote.incoterm}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600">{quote.validity_date ? new Date(quote.validity_date).toLocaleDateString() : 'N/A'}</span></td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {quote.currency} ${parseFloat(quote.total_landed_cost || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        quote.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openViewModal(quote)}
                        className="p-1.5 text-primary hover:bg-primary-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first quotation to get started.</p>
            {canManageQuotes && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Quote
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Quote Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Quote</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <QuoteForm
                onSubmit={handleCreateQuote}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Quote Modal */}
      {showEditModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Quote</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedQuote(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <QuoteForm
                initialData={selectedQuote}
                onSubmit={handleEditQuote}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedQuote(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Quote Modal */}
      {showViewModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Quote Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedQuote(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Quote Number
                  </label>
                  <p className="text-sm text-gray-900 font-semibold">{selectedQuote.quote_no}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Buyer
                  </label>
                  <p className="text-sm text-gray-900">{selectedQuote.buyer_id?.name || 'N/A'}</p>
                  {selectedQuote.buyer_id?.company_name && (
                    <p className="text-xs text-gray-500">{selectedQuote.buyer_id.company_name}</p>
                  )}
                </div>

                {/* Shipping Info */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Origin Port
                  </label>
                  <p className="text-sm text-gray-900">{selectedQuote.origin_port}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Destination Port
                  </label>
                  <p className="text-sm text-gray-900">{selectedQuote.destination_port}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Mode of Transport
                  </label>
                  <p className="text-sm text-gray-900 capitalize">{selectedQuote.mode_of_transport}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Incoterm
                  </label>
                  <p className="text-sm text-gray-900">{selectedQuote.incoterm}</p>
                </div>

                {/* Shipment Details */}
                {selectedQuote.weight_kg && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Weight
                    </label>
                    <p className="text-sm text-gray-900">{parseFloat(selectedQuote.weight_kg).toFixed(2)} kg</p>
                  </div>
                )}
                {selectedQuote.volume_cbm && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Volume
                    </label>
                    <p className="text-sm text-gray-900">{parseFloat(selectedQuote.volume_cbm).toFixed(2)} CBM</p>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Cost Breakdown</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Freight Cost:</span>
                      <span className="text-sm text-gray-900">{selectedQuote.currency} ${parseFloat(selectedQuote.freight_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Insurance Cost:</span>
                      <span className="text-sm text-gray-900">{selectedQuote.currency} ${parseFloat(selectedQuote.insurance_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customs Duty:</span>
                      <span className="text-sm text-gray-900">{selectedQuote.currency} ${parseFloat(selectedQuote.customs_duty || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Handling Charges:</span>
                      <span className="text-sm text-gray-900">{selectedQuote.currency} ${parseFloat(selectedQuote.handling_charges || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Markup:</span>
                      <span className="text-sm text-gray-900">{parseFloat(selectedQuote.markup_percent || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-900">Total Landed Cost:</span>
                      <span className="text-sm text-gray-900">{selectedQuote.currency} ${parseFloat(selectedQuote.total_landed_cost || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Validity & Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Valid Until
                  </label>
                  <p className="text-sm text-gray-900">{selectedQuote.validity_date ? new Date(selectedQuote.validity_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedQuote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    selectedQuote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    selectedQuote.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                    selectedQuote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedQuote.status}
                  </span>
                </div>

                {selectedQuote.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Notes
                    </label>
                    <p className="text-sm text-gray-900">{selectedQuote.notes}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                {canManageQuotes && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Edit Quote
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedQuote(null);
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
