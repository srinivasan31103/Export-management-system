import React, { useState, useEffect } from 'react';
import { buyersAPI } from '../api/apiClient';

export default function QuoteForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    quote_no: '',
    buyer_id: '',
    origin_port: '',
    destination_port: '',
    mode_of_transport: 'sea',
    incoterm: 'FOB',
    weight_kg: '',
    volume_cbm: '',
    freight_cost: '',
    insurance_cost: '',
    customs_duty: '',
    handling_charges: '',
    markup_percent: '',
    currency: 'USD',
    validity_date: '',
    notes: '',
    status: 'draft'
  });

  const [buyers, setBuyers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuyers();
    if (initialData) {
      setFormData({
        quote_no: initialData.quote_no || '',
        buyer_id: initialData.buyer_id?._id || initialData.buyer_id || '',
        origin_port: initialData.origin_port || '',
        destination_port: initialData.destination_port || '',
        mode_of_transport: initialData.mode_of_transport || 'sea',
        incoterm: initialData.incoterm || 'FOB',
        weight_kg: initialData.weight_kg || '',
        volume_cbm: initialData.volume_cbm || '',
        freight_cost: initialData.freight_cost || '',
        insurance_cost: initialData.insurance_cost || '',
        customs_duty: initialData.customs_duty || '',
        handling_charges: initialData.handling_charges || '',
        markup_percent: initialData.markup_percent || '',
        currency: initialData.currency || 'USD',
        validity_date: initialData.validity_date ? new Date(initialData.validity_date).toISOString().split('T')[0] : '',
        notes: initialData.notes || '',
        status: initialData.status || 'draft'
      });
    }
  }, [initialData]);

  const fetchBuyers = async () => {
    try {
      const response = await buyersAPI.getAll({});
      setBuyers(response.data.buyers || []);
    } catch (error) {
      console.error('Failed to fetch buyers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.buyer_id) newErrors.buyer_id = 'Buyer is required';
    if (!formData.origin_port?.trim()) newErrors.origin_port = 'Origin port is required';
    if (!formData.destination_port?.trim()) newErrors.destination_port = 'Destination port is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // Transform field names to match backend expectations (camelCase)
      const backendData = {
        buyerId: formData.buyer_id,
        originPort: formData.origin_port,
        destinationPort: formData.destination_port,
        modeOfTransport: formData.mode_of_transport,
        incoterm: formData.incoterm,
        weightKg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        volumeCbm: formData.volume_cbm ? parseFloat(formData.volume_cbm) : null,
        freightCost: formData.freight_cost ? parseFloat(formData.freight_cost) : 0,
        insuranceCost: formData.insurance_cost ? parseFloat(formData.insurance_cost) : 0,
        customsDuty: formData.customs_duty ? parseFloat(formData.customs_duty) : 0,
        handlingCharges: formData.handling_charges ? parseFloat(formData.handling_charges) : 0,
        markupPercent: formData.markup_percent ? parseFloat(formData.markup_percent) : 0,
        currency: formData.currency,
        validityDate: formData.validity_date || null,
        notes: formData.notes
      };

      await onSubmit(backendData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error.message || 'Failed to save quote' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buyer <span className="text-red-500">*</span>
          </label>
          <select
            name="buyer_id"
            value={formData.buyer_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.buyer_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Buyer</option>
            {buyers.map(buyer => (
              <option key={buyer._id} value={buyer._id}>
                {buyer.name} {buyer.company_name ? `- ${buyer.company_name}` : ''}
              </option>
            ))}
          </select>
          {errors.buyer_id && <p className="text-red-500 text-xs mt-1">{errors.buyer_id}</p>}
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="CNY">CNY - Chinese Yuan</option>
          </select>
        </div>

        {/* Origin Port */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origin Port <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="origin_port"
            value={formData.origin_port}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.origin_port ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Shanghai, China"
          />
          {errors.origin_port && <p className="text-red-500 text-xs mt-1">{errors.origin_port}</p>}
        </div>

        {/* Destination Port */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Port <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="destination_port"
            value={formData.destination_port}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.destination_port ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Los Angeles, USA"
          />
          {errors.destination_port && <p className="text-red-500 text-xs mt-1">{errors.destination_port}</p>}
        </div>

        {/* Mode of Transport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mode of Transport
          </label>
          <select
            name="mode_of_transport"
            value={formData.mode_of_transport}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="sea">Sea</option>
            <option value="air">Air</option>
            <option value="road">Road</option>
            <option value="rail">Rail</option>
          </select>
        </div>

        {/* Incoterm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Incoterm
          </label>
          <select
            name="incoterm"
            value={formData.incoterm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="FOB">FOB - Free on Board</option>
            <option value="CIF">CIF - Cost, Insurance & Freight</option>
            <option value="EXW">EXW - Ex Works</option>
            <option value="DDP">DDP - Delivered Duty Paid</option>
            <option value="FCA">FCA - Free Carrier</option>
          </select>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            name="weight_kg"
            value={formData.weight_kg}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Volume */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Volume (CBM)
          </label>
          <input
            type="number"
            name="volume_cbm"
            value={formData.volume_cbm}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Freight Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Freight Cost
          </label>
          <input
            type="number"
            name="freight_cost"
            value={formData.freight_cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Insurance Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Insurance Cost
          </label>
          <input
            type="number"
            name="insurance_cost"
            value={formData.insurance_cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Customs Duty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customs Duty
          </label>
          <input
            type="number"
            name="customs_duty"
            value={formData.customs_duty}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Handling Charges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Handling Charges
          </label>
          <input
            type="number"
            name="handling_charges"
            value={formData.handling_charges}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Markup Percent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Markup (%)
          </label>
          <input
            type="number"
            name="markup_percent"
            value={formData.markup_percent}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Validity Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valid Until
          </label>
          <input
            type="date"
            name="validity_date"
            value={formData.validity_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Any additional notes or terms..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : initialData ? 'Update Quote' : 'Create Quote'}
        </button>
      </div>
    </form>
  );
}
