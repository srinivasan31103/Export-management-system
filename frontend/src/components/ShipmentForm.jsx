import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ordersAPI } from '../api/apiClient';

export default function ShipmentForm({ onSubmit, onCancel, initialData }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      orderId: '',
      carrier: '',
      modeOfTransport: 'sea',
      awbBlNumber: '',
      containerNo: '',
      containerType: '',
      sealNo: '',
      status: 'created',
      estimatedDeparture: '',
      actualDeparture: '',
      estimatedArrival: '',
      actualArrival: '',
      portOfLoading: '',
      portOfDischarge: '',
      totalWeightKg: '',
      totalVolumeCbm: '',
      freightCost: '',
      insuranceCost: '',
      notes: ''
    }
  });

  const [orders, setOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const modeOfTransport = watch('modeOfTransport');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll({ limit: 100 });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Transform field names to match backend expectations (snake_case)
      const backendData = {
        order_id: data.orderId,
        carrier: data.carrier,
        mode_of_transport: data.modeOfTransport,
        awb_bl_number: data.awbBlNumber || undefined,
        container_no: data.containerNo || undefined,
        container_type: data.containerType || undefined,
        seal_no: data.sealNo || undefined,
        status: data.status,
        estimated_departure: data.estimatedDeparture || undefined,
        actual_departure: data.actualDeparture || undefined,
        estimated_arrival: data.estimatedArrival || undefined,
        actual_arrival: data.actualArrival || undefined,
        port_of_loading: data.portOfLoading || undefined,
        port_of_discharge: data.portOfDischarge || undefined,
        total_weight_kg: data.totalWeightKg ? parseFloat(data.totalWeightKg) : undefined,
        total_volume_cbm: data.totalVolumeCbm ? parseFloat(data.totalVolumeCbm) : undefined,
        freight_cost: data.freightCost ? parseFloat(data.freightCost) : undefined,
        insurance_cost: data.insuranceCost ? parseFloat(data.insuranceCost) : undefined,
        notes: data.notes || undefined
      };

      await onSubmit(backendData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order <span className="text-red-500">*</span>
          </label>
          <select
            {...register('orderId', { required: 'Order is required' })}
            className="input w-full"
          >
            <option value="">Select an order</option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>
                {order.order_no} - {order.buyer?.company_name} ({order.status})
              </option>
            ))}
          </select>
          {errors.orderId && (
            <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>
          )}
        </div>

        {/* Carrier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carrier <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('carrier', { required: 'Carrier is required' })}
            className="input w-full"
            placeholder="e.g., Maersk, DHL, FedEx"
          />
          {errors.carrier && (
            <p className="mt-1 text-sm text-red-600">{errors.carrier.message}</p>
          )}
        </div>

        {/* Mode of Transport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode of Transport <span className="text-red-500">*</span>
          </label>
          <select
            {...register('modeOfTransport', { required: 'Mode of transport is required' })}
            className="input w-full"
          >
            <option value="sea">Sea</option>
            <option value="air">Air</option>
            <option value="road">Road</option>
            <option value="rail">Rail</option>
          </select>
          {errors.modeOfTransport && (
            <p className="mt-1 text-sm text-red-600">{errors.modeOfTransport.message}</p>
          )}
        </div>

        {/* AWB/BL Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {modeOfTransport === 'air' ? 'AWB Number' : 'B/L Number'}
          </label>
          <input
            type="text"
            {...register('awbBlNumber')}
            className="input w-full"
            placeholder="Tracking number"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            {...register('status')}
            className="input w-full"
          >
            <option value="created">Created</option>
            <option value="booked">Booked</option>
            <option value="in_transit">In Transit</option>
            <option value="arrived">Arrived</option>
            <option value="customs_cleared">Customs Cleared</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Container Details - Show only for sea transport */}
        {modeOfTransport === 'sea' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container Number
              </label>
              <input
                type="text"
                {...register('containerNo')}
                className="input w-full"
                placeholder="e.g., MSCU1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container Type
              </label>
              <input
                type="text"
                {...register('containerType')}
                className="input w-full"
                placeholder="e.g., 20FT, 40FT, 40HC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seal Number
              </label>
              <input
                type="text"
                {...register('sealNo')}
                className="input w-full"
                placeholder="Container seal number"
              />
            </div>
          </>
        )}

        {/* Port/Location Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Port/Place of Loading
          </label>
          <input
            type="text"
            {...register('portOfLoading')}
            className="input w-full"
            placeholder="e.g., Shanghai Port, JFK Airport"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Port/Place of Discharge
          </label>
          <input
            type="text"
            {...register('portOfDischarge')}
            className="input w-full"
            placeholder="e.g., Los Angeles Port, LAX Airport"
          />
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Departure
          </label>
          <input
            type="date"
            {...register('estimatedDeparture')}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Departure
          </label>
          <input
            type="date"
            {...register('actualDeparture')}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Arrival
          </label>
          <input
            type="date"
            {...register('estimatedArrival')}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Arrival
          </label>
          <input
            type="date"
            {...register('actualArrival')}
            className="input w-full"
          />
        </div>

        {/* Weight and Volume */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Weight (kg)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('totalWeightKg')}
            className="input w-full"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Volume (CBM)
          </label>
          <input
            type="number"
            step="0.01"
            {...register('totalVolumeCbm')}
            className="input w-full"
            placeholder="0.00"
          />
        </div>

        {/* Costs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Freight Cost
          </label>
          <input
            type="number"
            step="0.01"
            {...register('freightCost')}
            className="input w-full"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Cost
          </label>
          <input
            type="number"
            step="0.01"
            {...register('insuranceCost')}
            className="input w-full"
            placeholder="0.00"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="input w-full"
            placeholder="Additional shipment notes..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : initialData ? 'Update Shipment' : 'Create Shipment'}
        </button>
      </div>
    </form>
  );
}
