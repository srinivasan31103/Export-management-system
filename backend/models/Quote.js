import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  quote_no: {
    type: String,
    required: false,
    unique: true,
    uppercase: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  origin_port: {
    type: String,
    required: true
  },
  destination_port: {
    type: String,
    required: true
  },
  mode_of_transport: {
    type: String,
    enum: ['sea', 'air', 'road', 'rail'],
    default: 'sea'
  },
  incoterm: {
    type: String,
    default: 'FOB',
    uppercase: true
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
  volume_cbm: {
    type: mongoose.Schema.Types.Decimal128,
    required: false,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return null;
    }
  },
  freight_cost: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  insurance_cost: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  customs_duty: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  handling_charges: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  markup_percent: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  total_landed_cost: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: function(value) {
      if (value) {
        return parseFloat(value.toString());
      }
      return 0;
    }
  },
  currency: {
    type: String,
    maxlength: 3,
    default: 'USD',
    uppercase: true
  },
  validity_date: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'quotes',
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Pre-save hook to auto-generate quote number
quoteSchema.pre('save', function(next) {
  if (!this.quote_no || this.quote_no === '') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.quote_no = `QTE-${year}${month}-${random}`;
  }

  // Calculate total_landed_cost
  const subtotal = parseFloat(this.freight_cost.toString()) +
                  parseFloat(this.insurance_cost.toString()) +
                  parseFloat(this.customs_duty.toString()) +
                  parseFloat(this.handling_charges.toString());
  const markup = subtotal * (parseFloat(this.markup_percent.toString()) / 100);
  this.total_landed_cost = subtotal + markup;

  next();
});

// Indexes
quoteSchema.index({ buyer_id: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ validity_date: 1 });
quoteSchema.index({ createdAt: -1 });

const Quote = mongoose.model('Quote', quoteSchema);

export default Quote;
