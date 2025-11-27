import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  contact_email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  contact_phone: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: true
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
  postal_code: {
    type: String,
    required: false
  },
  tax_id: {
    type: String,
    required: false
  },
  credit_limit: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  currency_preference: {
    type: String,
    maxlength: 3,
    default: 'USD'
  },
  payment_terms: {
    type: String,
    default: 'NET30'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'buyers',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes
buyerSchema.index({ company_name: 1 });
buyerSchema.index({ contact_email: 1 });
buyerSchema.index({ country: 1 });

const Buyer = mongoose.model('Buyer', buyerSchema);

export default Buyer;
