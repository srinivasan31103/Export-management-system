import React, { useState, useEffect } from 'react';
import { shipmentsAPI, ordersAPI } from '../api/apiClient';
import { Truck, Ship, Plane, MapPin, Calendar, Package, Search, Filter, Eye, Plus, Edit } from 'lucide-react';
import ShipmentForm from '../components/ShipmentForm';

export default function Shipments({ user }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    mode: ''
  });

  useEffect(() => {
    fetchShipments();
  }, [filters]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await shipmentsAPI.getAll({ limit: 100, ...filters });
      setShipments(response.data.shipments || []);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTrackingModal = (shipment) => {
    setSelectedShipment(shipment);
    setShowTrackingModal(true);
  };

  const openEditModal = (shipment) => {
    setSelectedShipment(shipment);
    setShowEditModal(true);
  };

  const handleCreateShipment = async (data) => {
    try {
      await shipmentsAPI.create(data);
      setShowCreateModal(false);
      fetchShipments();
      alert('Shipment created successfully!');
    } catch (error) {
      console.error('Failed to create shipment:', error);
      alert('Failed to create shipment');
    }
  };

  const handleUpdateShipment = async (data) => {
    try {
      await shipmentsAPI.update(selectedShipment._id, data);
      setShowEditModal(false);
      setSelectedShipment(null);
      fetchShipments();
      alert('Shipment updated successfully!');
    } catch (error) {
      console.error('Failed to update shipment:', error);
      alert('Failed to update shipment');
    }
  };

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'sea':
        return <Ship className="h-4 w-4" />;
      case 'air':
        return <Plane className="h-4 w-4" />;
      case 'road':
        return <Truck className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            {shipments.length} active shipment{shipments.length !== 1 ? 's' : ''}
          </p>
        </div>
        {['admin', 'manager', 'clerk'].includes(user.role) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Shipment
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
                placeholder="Search by shipment number, tracking number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
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
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="customs_clearance">Customs Clearance</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Transport Mode
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            >
              <option value="">All Modes</option>
              <option value="sea">Sea</option>
              <option value="air">Air</option>
              <option value="road">Road</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-3">Loading shipments...</p>
          </div>
        ) : shipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Shipment No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tracking No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ETD / ETA
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
                {shipments.map((shipment) => (
                  <tr key={shipment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sky-50 rounded flex items-center justify-center flex-shrink-0">
                          <Truck className="h-4 w-4 text-sky" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {shipment.shipment_no || shipment.tracking_no}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary font-medium">
                        {shipment.order_id?.order_no || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {shipment.order_id?.buyer_id?.name || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {shipment.carrier || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600">
                        {shipment.tracking_no || shipment.awb_bl_number || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-[150px]" title={`${shipment.port_of_loading} → ${shipment.port_of_discharge}`}>
                          {shipment.port_of_loading} → {shipment.port_of_discharge}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sky">
                          {getModeIcon(shipment.mode_of_transport)}
                        </div>
                        <span className="text-sm text-gray-700 capitalize">
                          {shipment.mode_of_transport || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs">
                        <div className="text-gray-600">
                          ETD: {shipment.etd ? new Date(shipment.etd).toLocaleDateString() : 'TBD'}
                        </div>
                        <div className="text-gray-600 mt-1">
                          ETA: {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(shipment.status)}`}>
                        {formatStatus(shipment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {['admin', 'manager', 'clerk'].includes(user.role) && (
                          <button
                            onClick={() => openEditModal(shipment)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Edit Shipment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openTrackingModal(shipment)}
                          className="p-1.5 text-primary hover:bg-primary-50 rounded transition-colors"
                          title="Track Shipment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
            <p className="text-sm text-gray-500">
              No shipments available at this time.
            </p>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Shipment</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ShipmentForm
                onSubmit={handleCreateShipment}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Shipment Modal */}
      {showEditModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Shipment</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedShipment(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ShipmentForm
                onSubmit={handleUpdateShipment}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedShipment(null);
                }}
                initialData={{
                  orderId: selectedShipment.order_id?._id || '',
                  carrier: selectedShipment.carrier || '',
                  modeOfTransport: selectedShipment.mode_of_transport || 'sea',
                  awbBlNumber: selectedShipment.awb_bl_number || '',
                  containerNo: selectedShipment.container_no || '',
                  containerType: selectedShipment.container_type || '',
                  sealNo: selectedShipment.seal_no || '',
                  status: selectedShipment.status || 'created',
                  estimatedDeparture: selectedShipment.estimated_departure ? selectedShipment.estimated_departure.split('T')[0] : '',
                  actualDeparture: selectedShipment.actual_departure ? selectedShipment.actual_departure.split('T')[0] : '',
                  estimatedArrival: selectedShipment.estimated_arrival ? selectedShipment.estimated_arrival.split('T')[0] : '',
                  actualArrival: selectedShipment.actual_arrival ? selectedShipment.actual_arrival.split('T')[0] : '',
                  portOfLoading: selectedShipment.port_of_loading || '',
                  portOfDischarge: selectedShipment.port_of_discharge || '',
                  totalWeightKg: selectedShipment.total_weight_kg || '',
                  totalVolumeCbm: selectedShipment.total_volume_cbm || '',
                  freightCost: selectedShipment.freight_cost || '',
                  insuranceCost: selectedShipment.insurance_cost || '',
                  notes: selectedShipment.notes || ''
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Shipment Tracking</h2>
              <button
                onClick={() => {
                  setShowTrackingModal(false);
                  setSelectedShipment(null);
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
                    Shipment Number
                  </label>
                  <p className="text-sm text-gray-900 font-semibold">{selectedShipment.shipment_no || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Tracking Number
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{selectedShipment.tracking_no || selectedShipment.awb_bl_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Order Number
                  </label>
                  <p className="text-sm text-primary font-medium">{selectedShipment.order_id?.order_no || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Buyer
                  </label>
                  <p className="text-sm text-gray-900">{selectedShipment.order_id?.buyer_id?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Carrier
                  </label>
                  <p className="text-sm text-gray-900">{selectedShipment.carrier || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Transport Mode
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="text-sky">
                      {getModeIcon(selectedShipment.mode_of_transport)}
                    </div>
                    <p className="text-sm text-gray-900 capitalize">{selectedShipment.mode_of_transport || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Port of Loading
                  </label>
                  <p className="text-sm text-gray-900">{selectedShipment.port_of_loading || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Port of Discharge
                  </label>
                  <p className="text-sm text-gray-900">{selectedShipment.port_of_discharge || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    ETD (Estimated Time of Departure)
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedShipment.etd ? new Date(selectedShipment.etd).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    ETA (Estimated Time of Arrival)
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedShipment.eta ? new Date(selectedShipment.eta).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Container Number
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{selectedShipment.container_no || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedShipment.status)}`}>
                    {formatStatus(selectedShipment.status)}
                  </span>
                </div>
                {selectedShipment.vessel_name && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Vessel Name
                    </label>
                    <p className="text-sm text-gray-900">{selectedShipment.vessel_name}</p>
                  </div>
                )}
                {selectedShipment.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Notes
                    </label>
                    <p className="text-sm text-gray-900">{selectedShipment.notes}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowTrackingModal(false);
                    setSelectedShipment(null);
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

function formatStatus(status) {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}

function getStatusStyle(status) {
  const styles = {
    pending: 'bg-gray-100 text-gray-700',
    in_transit: 'bg-blue-100 text-blue-700',
    customs_clearance: 'bg-yellow-100 text-yellow-700',
    out_for_delivery: 'bg-sky-100 text-sky-700',
    delivered: 'bg-green-100 text-green-700',
    delayed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700'
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
}
