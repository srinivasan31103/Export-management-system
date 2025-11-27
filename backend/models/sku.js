import mongoose from 'mongoose';

const skuSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  hs_code: {
    type: String,
    required: false
  },
  uom: {
    type: String,
    default: 'PCS',
    uppercase: true
  },
  category: {
    type: String,
    required: false
  },
  weight_kg: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  dimensions: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  unit_price: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  cost_price: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  reorder_level: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  image_url: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'skus',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes
skuSchema.index({ category: 1 });
skuSchema.index({ hs_code: 1 });
skuSchema.index({ is_active: 1 });

const SKU = mongoose.model('SKU', skuSchema);

export default SKU;
