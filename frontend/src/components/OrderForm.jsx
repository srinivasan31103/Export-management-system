import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { buyersAPI, skusAPI } from '../api/apiClient';
import { Plus, Trash2 } from 'lucide-react';

export default function OrderForm({ onSubmit, onCancel, initialData }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      buyerId: '',
      incoterm: 'FOB',
      currency: 'USD',
      items: [{ sku: '', description: '', qty: 1, unitPrice: 0, hsCode: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const [buyers, setBuyers] = useState([]);
  const [skus, setSKUs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBuyers();
    fetchSKUs();
  }, []);

  const fetchBuyers = async () => {
    try {
      const response = await buyersAPI.getAll({ limit: 100 });
      setBuyers(response.data.buyers || []);
    } catch (error) {
      console.error('Failed to fetch buyers:', error);
    }
  };

  const fetchSKUs = async () => {
    try {
      const response = await skusAPI.getAll({ limit: 100 });
      setSKUs(response.data.skus || []);
    } catch (error) {
      console.error('Failed to fetch SKUs:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Transform field names to match backend expectations
      const backendData = {
        buyer_id: data.buyerId,
        incoterm: data.incoterm,
        currency: data.currency,
        expected_ship_date: data.expectedShipDate || null,
        items: data.items.map(item => ({
          sku: item.sku,
          description: item.description,
          qty: parseInt(item.qty),
          unit_price: parseFloat(item.unitPrice),
          hs_code: item.hsCode || null
        }))
      };

      await onSubmit(backendData);
    } catch (error) {
      alert('Failed to create order: ' + (error.error || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Buyer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buyer *
        </label>
        <select {...register('buyerId', { required: 'Buyer is required' })} className="input">
          <option value="">Select buyer...</option>
          {buyers.map(buyer => (
            <option key={buyer._id} value={buyer._id}>
              {buyer.name} - {buyer.company_name} ({buyer.country})
            </option>
          ))}
        </select>
        {errors.buyerId && <p className="mt-1 text-sm text-red-600">{errors.buyerId.message}</p>}
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Incoterm</label>
          <select {...register('incoterm')} className="input">
            <option value="EXW">EXW</option>
            <option value="FOB">FOB</option>
            <option value="CIF">CIF</option>
            <option value="DDP">DDP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select {...register('currency')} className="input">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Ship Date</label>
          <input type="date" {...register('expectedShipDate')} className="input" />
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">Order Items *</label>
          <button
            type="button"
            onClick={() => append({ sku: '', description: '', qty: 1, unitPrice: 0, hsCode: '' })}
            className="btn btn-secondary btn-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2">
                  <input
                    {...register(`items.${index}.sku`, { required: 'SKU is required' })}
                    placeholder="SKU Code"
                    className="input"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    {...register(`items.${index}.description`, { required: 'Description is required' })}
                    placeholder="Description"
                    className="input"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    {...register(`items.${index}.qty`, { required: 'Qty is required', min: 1 })}
                    placeholder="Qty"
                    className="input"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, { required: 'Price is required', min: 0 })}
                    placeholder="Price"
                    className="input"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    {...register(`items.${index}.hsCode`)}
                    placeholder="HS Code (optional)"
                    className="input"
                  />
                </div>

                <div className="flex items-center">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
