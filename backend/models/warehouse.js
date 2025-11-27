import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: true
  },
  postal_code: {
    type: String,
    required: false
  },
  latitude: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  longitude: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  contact_name: {
    type: String,
    required: false
  },
  contact_phone: {
    type: String,
    required: false
  },
  contact_email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'warehouses',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes
warehouseSchema.index({ country: 1 });
warehouseSchema.index({ is_active: 1 });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;
