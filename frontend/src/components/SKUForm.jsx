import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function SKUForm({ onSubmit, onCancel, initialData }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      sku: '',
      description: '',
      hsCode: '',
      uom: 'PCS',
      category: '',
      unitPrice: 0,
      costPrice: 0,
      weightKg: 0
    }
  });

  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Transform field names to match backend expectations
      const backendData = {
        sku: data.sku,
        description: data.description,
        hs_code: data.hsCode || null,
        uom: data.uom,
        category: data.category || null,
        unit_price: parseFloat(data.unitPrice) || 0,
        cost_price: parseFloat(data.costPrice) || 0,
        weight_kg: parseFloat(data.weightKg) || 0
      };

      await onSubmit(backendData);
    } catch (error) {
      alert('Failed to create SKU: ' + (error.error || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code *</label>
          <input
            {...register('sku', { required: 'SKU code is required' })}
            className="input"
            placeholder="SKU-001"
          />
          {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            {...register('category')}
            className="input"
            placeholder="Electronics, Textiles, etc."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          className="input"
          rows="3"
          placeholder="Product description"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
          <input
            {...register('hsCode')}
            className="input"
            placeholder="821510"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
          <select {...register('uom')} className="input">
            <option value="PCS">PCS - Pieces</option>
            <option value="SET">SET - Sets</option>
            <option value="KG">KG - Kilograms</option>
            <option value="LTR">LTR - Liters</option>
            <option value="CTN">CTN - Cartons</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            {...register('weightKg')}
            className="input"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (USD)</label>
          <input
            type="number"
            step="0.01"
            {...register('unitPrice')}
            className="input"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (USD)</label>
          <input
            type="number"
            step="0.01"
            {...register('costPrice')}
            className="input"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Creating...' : 'Create SKU'}
        </button>
      </div>
    </form>
  );
}
