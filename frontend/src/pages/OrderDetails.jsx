import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, docsAPI, aiAPI } from '../api/apiClient';
import { FileText, Download, Truck, AlertCircle } from 'lucide-react';

export default function OrderDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (callback) => {
    return new Promise((resolve) => {
      let count = 3;
      setCountdown(count);

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown(null);
          resolve();
        }
      }, 1000);
    });
  };

  const handleGenerateInvoice = async () => {
    setGenerating(true);
    try {
      // Start countdown before generating
      await startCountdown();

      const response = await docsAPI.generateInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${order.order_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePackingList = async () => {
    setGenerating(true);
    try {
      // Start countdown before generating
      await startCountdown();

      const response = await docsAPI.generatePackingList(id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `packing_list_${order.order_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to generate packing list:', error);
      alert('Failed to generate packing list');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading order...</div>;
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order {order.order_no}</h1>
          <p className="mt-1 text-sm text-gray-500">Created {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`badge text-lg px-4 py-2 ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Buyer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium">{order.buyer?.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{order.buyer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.buyer?.contact_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">{order.buyer?.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">HS Code</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm">{item.sku_code}</td>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-sm">{item.hs_code || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.qty}</td>
                      <td className="px-4 py-3 text-sm text-right">{order.currency} {parseFloat(item.unit_price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{order.currency} {parseFloat(item.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{order.currency} {parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{order.currency} {parseFloat(order.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>{order.currency} {parseFloat(order.grand_total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipments */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Shipments</h2>
              {order.shipments.map((shipment) => (
                <div key={shipment.id} className="border rounded-lg p-4 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{shipment.shipment_no}</p>
                      <p className="text-sm text-gray-500">{shipment.carrier} - {shipment.awb_bl_number || 'Pending'}</p>
                    </div>
                    <span className={`badge ${getShipmentStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Incoterm</p>
                <p className="font-medium">{order.incoterm}</p>
              </div>
              <div>
                <p className="text-gray-500">Port of Loading</p>
                <p className="font-medium">{order.port_of_loading || 'TBD'}</p>
              </div>
              <div>
                <p className="text-gray-500">Port of Discharge</p>
                <p className="font-medium">{order.port_of_discharge || 'TBD'}</p>
              </div>
              <div>
                <p className="text-gray-500">Expected Ship Date</p>
                <p className="font-medium">{order.expected_ship_date ? new Date(order.expected_ship_date).toLocaleDateString() : 'TBD'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documents
            </h2>
            <div className="space-y-2">
              <button
                onClick={handleGenerateInvoice}
                disabled={generating}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                {countdown !== null ? (
                  <span className="text-xl font-bold">{countdown}</span>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Commercial Invoice
                  </>
                )}
              </button>
              <button
                onClick={handleGeneratePackingList}
                disabled={generating}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                {countdown !== null ? (
                  <span className="text-xl font-bold">{countdown}</span>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Packing List
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          {['admin', 'manager', 'clerk'].includes(user.role) && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/shipments')}
                  className="w-full btn btn-primary"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Create Shipment
                </button>
                <button
                  onClick={() => alert('Edit order functionality coming soon!')}
                  className="w-full btn btn-secondary"
                >
                  Edit Order
                </button>
              </div>
            </div>
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
    closed: 'bg-gray-100 text-gray-800',
    cancelled: 'badge-danger'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getShipmentStatusColor(status) {
  const colors = {
    created: 'bg-gray-100 text-gray-800',
    booked: 'badge-info',
    in_transit: 'badge-warning',
    arrived: 'badge-success',
    customs_cleared: 'badge-success',
    delivered: 'badge-success'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
